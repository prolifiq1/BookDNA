/**
 * BookDNA Fingerprinting Engine
 *
 * Analyses text across 4 structural dimensions:
 *  1. Rhythm    — sentence length patterns, punctuation cadence
 *  2. Emotion   — sentiment arc across the narrative
 *  3. Vocabulary — lexical diversity, word sophistication
 *  4. Structure  — paragraph density, dialogue ratio, pacing
 *
 * Each dimension produces a normalised signal (0–1 array)
 * that forms one strand of the book's DNA helix.
 */

// ── Types ──────────────────────────────────────────────

export interface BookFingerprint {
  id: string;
  title: string;
  author: string;
  dimensions: {
    rhythm: number[];
    emotion: number[];
    vocabulary: number[];
    structure: number[];
  };
  stats: FingerprintStats;
}

export interface FingerprintStats {
  wordCount: number;
  sentenceCount: number;
  avgSentenceLength: number;
  sentenceLengthVariance: number;
  lexicalDiversity: number;
  dialogueRatio: number;
  avgParagraphLength: number;
  syllablesPerWord: number;
  punctuationDensity: number;
  exclamationRate: number;
  questionRate: number;
  readingLevel: number;
}

export interface MatchResult {
  book: BookFingerprint;
  similarity: number;
  dimensionScores: {
    rhythm: number;
    emotion: number;
    vocabulary: number;
    structure: number;
  };
}

// ── Constants ──────────────────────────────────────────

const SIGNAL_RESOLUTION = 64; // data points per strand
const WINDOW_SIZE = 50; // sentences per analysis window

// ── Main Analysis ──────────────────────────────────────

export function analyseText(
  text: string,
  title: string = 'Untitled',
  author: string = 'Unknown'
): BookFingerprint {
  const sentences = extractSentences(text);
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const words = text.split(/\s+/).filter((w) => w.length > 0);

  const rhythm = analyseRhythm(sentences);
  const emotion = analyseEmotion(sentences);
  const vocabulary = analyseVocabulary(sentences);
  const structure = analyseStructure(paragraphs, sentences);

  return {
    id: generateId(title, author),
    title,
    author,
    dimensions: { rhythm, emotion, vocabulary, structure },
    stats: computeStats(words, sentences, paragraphs),
  };
}

// ── Rhythm Analysis ────────────────────────────────────
// Measures sentence length variation — the "beat" of prose

function analyseRhythm(sentences: string[]): number[] {
  const lengths = sentences.map((s) => s.split(/\s+/).length);
  return toSignal(lengths, SIGNAL_RESOLUTION);
}

// ── Emotion Analysis ───────────────────────────────────
// Tracks sentiment arc across the narrative using a
// simple lexicon-based approach (positive/negative word counts)

const POSITIVE_WORDS = new Set([
  'love', 'joy', 'happy', 'beautiful', 'light', 'hope', 'warm',
  'bright', 'smile', 'laugh', 'peace', 'gentle', 'kind', 'good',
  'wonderful', 'delight', 'sweet', 'tender', 'bliss', 'triumph',
  'glory', 'grace', 'free', 'alive', 'dream', 'comfort', 'trust',
]);

const NEGATIVE_WORDS = new Set([
  'death', 'dark', 'pain', 'fear', 'hate', 'cold', 'lost',
  'cry', 'sad', 'grief', 'blood', 'war', 'kill', 'suffer',
  'despair', 'doom', 'horror', 'rage', 'bitter', 'cruel',
  'alone', 'broken', 'fall', 'wound', 'shadow', 'dread', 'scream',
]);

function analyseEmotion(sentences: string[]): number[] {
  const scores = sentences.map((sentence) => {
    const words = sentence.toLowerCase().split(/\s+/);
    let score = 0;
    for (const word of words) {
      const clean = word.replace(/[^a-z]/g, '');
      if (POSITIVE_WORDS.has(clean)) score += 1;
      if (NEGATIVE_WORDS.has(clean)) score -= 1;
    }
    // Normalise to 0-1 range (0.5 = neutral)
    return Math.max(0, Math.min(1, 0.5 + score * 0.1));
  });
  return toSignal(scores, SIGNAL_RESOLUTION);
}

// ── Vocabulary Analysis ────────────────────────────────
// Measures lexical richness in sliding windows — the
// ratio of unique words to total words

function analyseVocabulary(sentences: string[]): number[] {
  const windowScores: number[] = [];

  for (let i = 0; i < sentences.length; i += WINDOW_SIZE) {
    const window = sentences.slice(i, i + WINDOW_SIZE).join(' ');
    const words = window
      .toLowerCase()
      .split(/\s+/)
      .map((w) => w.replace(/[^a-z']/g, ''))
      .filter((w) => w.length > 0);

    const unique = new Set(words);
    const diversity = words.length > 0 ? unique.size / words.length : 0;
    windowScores.push(diversity);
  }

  return toSignal(windowScores, SIGNAL_RESOLUTION);
}

// ── Structure Analysis ─────────────────────────────────
// Analyses paragraph density and dialogue frequency

function analyseStructure(
  paragraphs: string[],
  sentences: string[]
): number[] {
  // Compute a "density" signal from paragraph lengths
  const parLengths = paragraphs.map((p) => p.split(/\s+/).length);

  // Blend in dialogue detection (lines starting with " or containing said/asked)
  const dialogueSignal = paragraphs.map((p) => {
    const hasQuotes = (p.match(/[""\u201C\u201D]/g) || []).length >= 2;
    const hasSpeechVerb = /\b(said|asked|replied|whispered|shouted|murmured|exclaimed)\b/i.test(p);
    return hasQuotes || hasSpeechVerb ? 1 : 0;
  });

  // Interleave: high density paras get high signal, dialogue gets mid
  const combined = parLengths.map((len, i) => {
    const normLen = Math.min(len / 200, 1); // normalise to 0-1
    const dialog = dialogueSignal[i] * 0.5;
    return Math.max(normLen, dialog);
  });

  return toSignal(combined, SIGNAL_RESOLUTION);
}

// ── Matching ───────────────────────────────────────────

export function compareFingerprints(
  a: BookFingerprint,
  b: BookFingerprint
): MatchResult {
  const dims = ['rhythm', 'emotion', 'vocabulary', 'structure'] as const;

  const dimensionScores = {} as MatchResult['dimensionScores'];
  let totalSimilarity = 0;

  for (const dim of dims) {
    const score = cosineSimilarity(a.dimensions[dim], b.dimensions[dim]);
    dimensionScores[dim] = score;
    totalSimilarity += score;
  }

  return {
    book: b,
    similarity: totalSimilarity / dims.length,
    dimensionScores,
  };
}

export function findMatches(
  target: BookFingerprint,
  library: BookFingerprint[],
  topN: number = 10
): MatchResult[] {
  return library
    .filter((book) => book.id !== target.id)
    .map((book) => compareFingerprints(target, book))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topN);
}

// ── Utility Functions ──────────────────────────────────

function extractSentences(text: string): string[] {
  return text
    .replace(/\n/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .filter((s) => s.trim().length > 3);
}

/** Resample an arbitrary-length array to `resolution` points */
function toSignal(values: number[], resolution: number): number[] {
  if (values.length === 0) return new Array(resolution).fill(0.5);
  if (values.length === 1) return new Array(resolution).fill(values[0]);

  // Normalise to 0-1
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const normalised = values.map((v) => (v - min) / range);

  // Resample via linear interpolation
  const signal: number[] = [];
  for (let i = 0; i < resolution; i++) {
    const pos = (i / (resolution - 1)) * (normalised.length - 1);
    const lo = Math.floor(pos);
    const hi = Math.min(lo + 1, normalised.length - 1);
    const t = pos - lo;
    signal.push(normalised[lo] * (1 - t) + normalised[hi] * t);
  }

  // Smooth with a simple moving average
  return smooth(signal, 3);
}

function smooth(arr: number[], windowSize: number): number[] {
  const half = Math.floor(windowSize / 2);
  return arr.map((_, i) => {
    let sum = 0;
    let count = 0;
    for (let j = i - half; j <= i + half; j++) {
      if (j >= 0 && j < arr.length) {
        sum += arr[j];
        count++;
      }
    }
    return sum / count;
  });
}

function cosineSimilarity(a: number[], b: number[]): number {
  const len = Math.min(a.length, b.length);
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < len; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

function computeStats(
  words: string[],
  sentences: string[],
  paragraphs: string[]
): FingerprintStats {
  const sentenceLengths = sentences.map((s) => s.split(/\s+/).length);
  const avgSentLen =
    sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length || 0;
  const variance =
    sentenceLengths.reduce((a, b) => a + Math.pow(b - avgSentLen, 2), 0) /
      sentenceLengths.length || 0;

  const uniqueWords = new Set(words.map((w) => w.toLowerCase().replace(/[^a-z']/g, '')));
  const lexicalDiversity = words.length > 0 ? uniqueWords.size / words.length : 0;

  const dialogueSentences = sentences.filter(
    (s) => (s.match(/[""\u201C\u201D]/g) || []).length >= 2
  );
  const dialogueRatio = sentences.length > 0 ? dialogueSentences.length / sentences.length : 0;

  const avgParLen =
    paragraphs.reduce((a, p) => a + p.split(/\s+/).length, 0) / paragraphs.length || 0;

  const punctuation = (words.join(' ').match(/[,;:\-—()]/g) || []).length;
  const punctuationDensity = words.length > 0 ? punctuation / words.length : 0;

  const exclamations = sentences.filter((s) => s.trim().endsWith('!')).length;
  const questions = sentences.filter((s) => s.trim().endsWith('?')).length;

  // Rough syllable count (vowel cluster approximation)
  const totalSyllables = words.reduce((sum, w) => {
    const matches = w.toLowerCase().match(/[aeiouy]+/g);
    return sum + (matches ? matches.length : 1);
  }, 0);
  const syllablesPerWord = words.length > 0 ? totalSyllables / words.length : 0;

  // Flesch-Kincaid approximation
  const readingLevel =
    0.39 * avgSentLen + 11.8 * syllablesPerWord - 15.59;

  return {
    wordCount: words.length,
    sentenceCount: sentences.length,
    avgSentenceLength: Math.round(avgSentLen * 10) / 10,
    sentenceLengthVariance: Math.round(variance * 10) / 10,
    lexicalDiversity: Math.round(lexicalDiversity * 1000) / 1000,
    dialogueRatio: Math.round(dialogueRatio * 1000) / 1000,
    avgParagraphLength: Math.round(avgParLen * 10) / 10,
    syllablesPerWord: Math.round(syllablesPerWord * 100) / 100,
    punctuationDensity: Math.round(punctuationDensity * 1000) / 1000,
    exclamationRate: sentences.length > 0 ? Math.round((exclamations / sentences.length) * 1000) / 1000 : 0,
    questionRate: sentences.length > 0 ? Math.round((questions / sentences.length) * 1000) / 1000 : 0,
    readingLevel: Math.round(Math.max(0, readingLevel) * 10) / 10,
  };
}

function generateId(title: string, author: string): string {
  const base = `${title}-${author}`.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const hash = base.split('').reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);
  return `${base.slice(0, 30)}-${Math.abs(hash).toString(36)}`;
}

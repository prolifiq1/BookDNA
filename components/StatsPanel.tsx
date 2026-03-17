'use client';

import { FingerprintStats } from '@/lib/fingerprint';

interface StatsPanelProps {
  stats: FingerprintStats;
}

const STAT_CARDS = [
  { key: 'wordCount', label: 'Words', format: (v: number) => v.toLocaleString() },
  { key: 'sentenceCount', label: 'Sentences', format: (v: number) => v.toLocaleString() },
  { key: 'avgSentenceLength', label: 'Avg sentence', format: (v: number) => `${v} words` },
  { key: 'lexicalDiversity', label: 'Lexical diversity', format: (v: number) => `${(v * 100).toFixed(1)}%` },
  { key: 'dialogueRatio', label: 'Dialogue', format: (v: number) => `${(v * 100).toFixed(1)}%` },
  { key: 'readingLevel', label: 'Reading level', format: (v: number) => `Grade ${v.toFixed(1)}` },
  { key: 'syllablesPerWord', label: 'Syllables/word', format: (v: number) => v.toFixed(2) },
  { key: 'punctuationDensity', label: 'Punctuation density', format: (v: number) => `${(v * 100).toFixed(1)}%` },
  { key: 'sentenceLengthVariance', label: 'Rhythm variance', format: (v: number) => v.toFixed(1) },
  { key: 'questionRate', label: 'Questions', format: (v: number) => `${(v * 100).toFixed(1)}%` },
  { key: 'exclamationRate', label: 'Exclamations', format: (v: number) => `${(v * 100).toFixed(1)}%` },
  { key: 'avgParagraphLength', label: 'Avg paragraph', format: (v: number) => `${v.toFixed(0)} words` },
] as const;

export default function StatsPanel({ stats }: StatsPanelProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {STAT_CARDS.map(({ key, label, format }) => (
        <div
          key={key}
          className="bg-helix-card border border-helix-border rounded-lg p-4 
                     hover:border-helix-accent/40 transition-colors duration-300"
        >
          <p className="text-helix-muted text-xs font-mono uppercase tracking-wider">
            {label}
          </p>
          <p className="text-helix-text text-lg font-display mt-1">
            {format(stats[key as keyof FingerprintStats] as number)}
          </p>
        </div>
      ))}
    </div>
  );
}

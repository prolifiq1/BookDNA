'use client';

import { BookFingerprint, compareFingerprints, MatchResult } from '@/lib/fingerprint';
import DNAHelix from './DNAHelix';

interface ComparisonViewProps {
  bookA: BookFingerprint;
  bookB: BookFingerprint;
}

export default function ComparisonView({ bookA, bookB }: ComparisonViewProps) {
  const result = compareFingerprints(bookA, bookB);

  const dimensions = [
    { key: 'rhythm' as const, label: 'Rhythm', color: '#3ecf8e', icon: '♩' },
    { key: 'emotion' as const, label: 'Emotion', color: '#f43f5e', icon: '♡' },
    { key: 'vocabulary' as const, label: 'Vocabulary', color: '#38bdf8', icon: '✦' },
    { key: 'structure' as const, label: 'Structure', color: '#c084fc', icon: '▣' },
  ];

  return (
    <div className="space-y-8">
      {/* Similarity Score Header */}
      <div className="text-center">
        <p className="font-mono text-xs text-helix-muted uppercase tracking-widest mb-2">
          DNA Similarity
        </p>
        <div className="inline-flex items-baseline gap-1">
          <span className="text-6xl font-mono font-bold text-helix-accent">
            {(result.similarity * 100).toFixed(1)}
          </span>
          <span className="text-2xl font-mono text-helix-muted">%</span>
        </div>
      </div>

      {/* Side-by-side Helixes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Book A */}
        <div className="bg-helix-surface border border-helix-border rounded-2xl p-5">
          <div className="mb-4">
            <h3 className="font-display text-xl text-helix-text">{bookA.title}</h3>
            <p className="text-helix-muted text-sm">{bookA.author}</p>
          </div>
          <DNAHelix
            rhythm={bookA.dimensions.rhythm}
            emotion={bookA.dimensions.emotion}
            vocabulary={bookA.dimensions.vocabulary}
            structure={bookA.dimensions.structure}
            width={340}
            height={220}
          />
        </div>

        {/* Book B */}
        <div className="bg-helix-surface border border-helix-border rounded-2xl p-5">
          <div className="mb-4">
            <h3 className="font-display text-xl text-helix-text">{bookB.title}</h3>
            <p className="text-helix-muted text-sm">{bookB.author}</p>
          </div>
          <DNAHelix
            rhythm={bookB.dimensions.rhythm}
            emotion={bookB.dimensions.emotion}
            vocabulary={bookB.dimensions.vocabulary}
            structure={bookB.dimensions.structure}
            width={340}
            height={220}
          />
        </div>
      </div>

      {/* Dimension Breakdown */}
      <div className="bg-helix-card border border-helix-border rounded-2xl p-6">
        <h3 className="font-display text-lg text-helix-text mb-6">
          Strand-by-Strand Comparison
        </h3>
        <div className="space-y-5">
          {dimensions.map(({ key, label, color, icon }) => {
            const score = result.dimensionScores[key];
            const statsA = getStrandStat(bookA, key);
            const statsB = getStrandStat(bookB, key);

            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span style={{ color }}>{icon}</span>
                    <span className="font-mono text-sm text-helix-text">{label}</span>
                  </div>
                  <span className="font-mono text-sm" style={{ color }}>
                    {(score * 100).toFixed(1)}% match
                  </span>
                </div>

                {/* Full-width bar */}
                <div className="h-2 bg-helix-bg rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${score * 100}%`,
                      background: `linear-gradient(90deg, ${color}, ${color}88)`,
                      boxShadow: `0 0 12px ${color}40`,
                    }}
                  />
                </div>

                {/* Mini stat comparison */}
                <div className="flex justify-between text-xs text-helix-muted font-mono">
                  <span>{statsA}</span>
                  <span>{statsB}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stat Comparison Table */}
      <div className="bg-helix-card border border-helix-border rounded-2xl p-6">
        <h3 className="font-display text-lg text-helix-text mb-4">
          By the Numbers
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-helix-border">
                <th className="text-left py-2 text-helix-muted font-mono font-normal">Metric</th>
                <th className="text-right py-2 text-helix-muted font-mono font-normal">{bookA.title}</th>
                <th className="text-right py-2 text-helix-muted font-mono font-normal">{bookB.title}</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {[
                { label: 'Words', a: bookA.stats.wordCount.toLocaleString(), b: bookB.stats.wordCount.toLocaleString() },
                { label: 'Avg sentence', a: `${bookA.stats.avgSentenceLength} words`, b: `${bookB.stats.avgSentenceLength} words` },
                { label: 'Lexical diversity', a: `${(bookA.stats.lexicalDiversity * 100).toFixed(1)}%`, b: `${(bookB.stats.lexicalDiversity * 100).toFixed(1)}%` },
                { label: 'Dialogue ratio', a: `${(bookA.stats.dialogueRatio * 100).toFixed(1)}%`, b: `${(bookB.stats.dialogueRatio * 100).toFixed(1)}%` },
                { label: 'Reading level', a: `Grade ${bookA.stats.readingLevel}`, b: `Grade ${bookB.stats.readingLevel}` },
                { label: 'Syllables/word', a: `${bookA.stats.syllablesPerWord}`, b: `${bookB.stats.syllablesPerWord}` },
              ].map(({ label, a, b }) => (
                <tr key={label} className="border-b border-helix-border/50">
                  <td className="py-2 text-helix-muted">{label}</td>
                  <td className="py-2 text-right text-helix-text">{a}</td>
                  <td className="py-2 text-right text-helix-text">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function getStrandStat(book: BookFingerprint, strand: string): string {
  switch (strand) {
    case 'rhythm':
      return `${book.stats.avgSentenceLength} avg words/sentence`;
    case 'emotion':
      return `${(book.stats.exclamationRate * 100).toFixed(1)}% exclamations`;
    case 'vocabulary':
      return `${(book.stats.lexicalDiversity * 100).toFixed(1)}% lexical diversity`;
    case 'structure':
      return `${(book.stats.dialogueRatio * 100).toFixed(1)}% dialogue`;
    default:
      return '';
  }
}

'use client';

import { MatchResult, BookFingerprint } from '@/lib/fingerprint';

interface MatchListProps {
  matches: MatchResult[];
  onCompare?: (book: BookFingerprint) => void;
}

export default function MatchList({ matches, onCompare }: MatchListProps) {
  if (matches.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-display text-xl text-helix-text">
        Closest DNA Matches
      </h3>
      <p className="text-helix-muted text-sm font-body mb-4">
        Books with the most similar structural fingerprint, regardless of genre.
      </p>

      {matches.map((match, i) => (
        <div
          key={match.book.id}
          className="bg-helix-card border border-helix-border rounded-xl p-5
                     hover:border-helix-accent/30 transition-all"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-display text-lg text-helix-text">
                {match.book.title}
              </h4>
              <p className="text-helix-muted text-sm">{match.book.author}</p>
            </div>
            <div className="text-right flex items-start gap-3">
              <div>
                <span className="text-2xl font-mono font-bold text-helix-accent">
                  {(match.similarity * 100).toFixed(1)}%
                </span>
                <p className="text-helix-muted text-xs font-mono">match</p>
              </div>
              {onCompare && (
                <button
                  onClick={() => onCompare(match.book)}
                  className="mt-1 px-3 py-1.5 text-xs font-mono text-helix-accent border border-helix-accent/30
                             rounded-lg hover:bg-helix-accent/10 transition-colors"
                >
                  Compare →
                </button>
              )}
            </div>
          </div>

          {/* Dimension breakdown bars */}
          <div className="grid grid-cols-4 gap-2">
            {(
              [
                { key: 'rhythm', color: '#3ecf8e', label: 'Rhythm' },
                { key: 'emotion', color: '#f43f5e', label: 'Emotion' },
                { key: 'vocabulary', color: '#38bdf8', label: 'Vocab' },
                { key: 'structure', color: '#c084fc', label: 'Structure' },
              ] as const
            ).map(({ key, color, label }) => (
              <div key={key}>
                <div className="flex justify-between mb-1">
                  <span className="text-[10px] font-mono text-helix-muted uppercase">
                    {label}
                  </span>
                  <span className="text-[10px] font-mono" style={{ color }}>
                    {(match.dimensionScores[key] * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="h-1.5 bg-helix-bg rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${match.dimensionScores[key] * 100}%`,
                      background: color,
                      boxShadow: `0 0 8px ${color}40`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

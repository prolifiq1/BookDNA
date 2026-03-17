'use client';

import { useState, useCallback } from 'react';
import { analyseText, findMatches, BookFingerprint, MatchResult } from '@/lib/fingerprint';
import { CLASSIC_LIBRARY } from '@/lib/classics';
import DNAHelix from '@/components/DNAHelix';
import StatsPanel from '@/components/StatsPanel';
import BookInput from '@/components/BookInput';
import MatchList from '@/components/MatchList';
import ComparisonView from '@/components/ComparisonView';

type View = 'home' | 'results' | 'compare';

export default function HomePage() {
  const [fingerprint, setFingerprint] = useState<BookFingerprint | null>(null);
  const [library, setLibrary] = useState<BookFingerprint[]>(CLASSIC_LIBRARY);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [view, setView] = useState<View>('home');
  const [compareBook, setCompareBook] = useState<BookFingerprint | null>(null);

  const handleTextLoaded = useCallback(
    (text: string, title: string, author: string) => {
      setIsAnalysing(true);
      setView('home');

      setTimeout(() => {
        const fp = analyseText(text, title, author);
        setFingerprint(fp);

        setLibrary((prev) => {
          const updated = [...prev.filter((b) => b.id !== fp.id), fp];
          const m = findMatches(fp, updated);
          setMatches(m);
          return updated;
        });

        setIsAnalysing(false);
        setView('results');
      }, 100);
    },
    []
  );

  const handleCompare = useCallback(
    (book: BookFingerprint) => {
      setCompareBook(book);
      setView('compare');
    },
    []
  );

  const handleBackToResults = useCallback(() => {
    setView('results');
    setCompareBook(null);
  }, []);

  const handleAnalyseClassic = useCallback(
    (classic: BookFingerprint) => {
      setFingerprint(classic);
      const m = findMatches(classic, library);
      setMatches(m);
      setView('results');
    },
    [library]
  );

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-helix-accent/5 via-transparent to-transparent" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-helix-accent/3 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-helix-emotion/3 rounded-full blur-3xl" />

        <div className="relative max-w-5xl mx-auto px-6 pt-16 pb-10">
          <div className="flex items-center justify-between">
            <button
              onClick={() => { setView('home'); setFingerprint(null); setMatches([]); }}
              className="flex items-center gap-3 group"
            >
              <div className="w-10 h-10 rounded-lg bg-helix-accent/20 flex items-center justify-center
                              group-hover:bg-helix-accent/30 transition-colors">
                <span className="text-xl">🧬</span>
              </div>
              <span className="font-mono text-sm text-helix-accent tracking-widest uppercase">
                BookDNA
              </span>
            </button>

            {fingerprint && view !== 'home' && (
              <button
                onClick={() => setView('home')}
                className="font-mono text-xs text-helix-muted hover:text-helix-accent transition-colors"
              >
                ← Analyse another
              </button>
            )}
          </div>

          {view === 'home' && (
            <div className="mt-12">
              <h1 className="font-display text-5xl sm:text-6xl text-helix-text leading-tight mb-4">
                The structural
                <br />
                <span className="text-helix-accent">fingerprint</span> of every book
              </h1>
              <p className="font-body text-lg text-helix-muted max-w-2xl leading-relaxed">
                BookDNA analyses prose at a structural level — sentence rhythm, emotional
                arc, vocabulary richness, and narrative density — to create a unique
                fingerprint for any text. Then it finds unexpected matches across genres,
                eras, and cultures.
              </p>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 pb-24 space-y-12">

        {/* ── HOME VIEW ────────────────────────── */}
        {view === 'home' && (
          <>
            <section className="animate-fade-in-up">
              <h2 className="font-display text-2xl text-helix-text mb-4">
                Choose a book
              </h2>
              <BookInput onTextLoaded={handleTextLoaded} isAnalysing={isAnalysing} />
            </section>

            {isAnalysing && (
              <div className="text-center py-12">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-helix-card rounded-full border border-helix-border">
                  <div className="w-4 h-4 border-2 border-helix-accent border-t-transparent rounded-full animate-spin" />
                  <span className="font-mono text-sm text-helix-muted">
                    Sequencing DNA strands…
                  </span>
                </div>
              </div>
            )}

            {!isAnalysing && (
              <section className="animate-fade-in-up-delay-1">
                <h2 className="font-display text-2xl text-helix-text mb-2">
                  Or explore a classic
                </h2>
                <p className="text-helix-muted text-sm font-body mb-6">
                  Pre-analysed fingerprints from the canon. Click to see DNA and find matches.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {CLASSIC_LIBRARY.map((book) => (
                    <button
                      key={book.id}
                      onClick={() => handleAnalyseClassic(book)}
                      className="bg-helix-card border border-helix-border rounded-xl p-4 text-left
                                 hover:border-helix-accent/40 hover:bg-helix-card/80 transition-all group"
                    >
                      <div className="h-12 mb-3 overflow-hidden rounded opacity-60 group-hover:opacity-100 transition-opacity">
                        <MiniHelix data={book.dimensions.rhythm} color="#3ecf8e" />
                      </div>
                      <h3 className="font-display text-sm text-helix-text leading-tight group-hover:text-helix-accent transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-helix-muted text-xs mt-1">{book.author}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-[10px] font-mono text-helix-muted/60">
                          {book.stats.wordCount.toLocaleString()} words
                        </span>
                        <span className="text-[10px] font-mono text-helix-muted/40">•</span>
                        <span className="text-[10px] font-mono text-helix-muted/60">
                          Grade {book.stats.readingLevel}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {!fingerprint && !isAnalysing && (
              <div className="text-center py-8">
                <p className="text-helix-muted/30 font-display text-xl">
                  Search, upload, or pick a classic to begin
                </p>
              </div>
            )}
          </>
        )}

        {/* ── RESULTS VIEW ─────────────────────── */}
        {view === 'results' && fingerprint && (
          <>
            <section className="animate-fade-in-up">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="font-mono text-xs text-helix-accent uppercase tracking-widest mb-1">
                    Fingerprint
                  </p>
                  <h2 className="font-display text-3xl text-helix-text">
                    {fingerprint.title}
                  </h2>
                  <p className="text-helix-muted font-body">
                    by {fingerprint.author}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-xs text-helix-muted">
                    {fingerprint.stats.wordCount.toLocaleString()} words
                  </p>
                  <p className="font-mono text-xs text-helix-muted">
                    {fingerprint.stats.sentenceCount.toLocaleString()} sentences
                  </p>
                </div>
              </div>

              <div className="bg-helix-surface border border-helix-border rounded-2xl p-6">
                <DNAHelix
                  rhythm={fingerprint.dimensions.rhythm}
                  emotion={fingerprint.dimensions.emotion}
                  vocabulary={fingerprint.dimensions.vocabulary}
                  structure={fingerprint.dimensions.structure}
                />
              </div>
            </section>

            <section className="animate-fade-in-up-delay-1">
              <h3 className="font-display text-xl text-helix-text mb-4">
                Structural Analysis
              </h3>
              <StatsPanel stats={fingerprint.stats} />
            </section>

            {matches.length > 0 && (
              <section className="animate-fade-in-up-delay-2">
                <MatchList matches={matches} onCompare={handleCompare} />
              </section>
            )}
          </>
        )}

        {/* ── COMPARE VIEW ─────────────────────── */}
        {view === 'compare' && fingerprint && compareBook && (
          <section className="animate-fade-in-up">
            <button
              onClick={handleBackToResults}
              className="font-mono text-xs text-helix-muted hover:text-helix-accent transition-colors mb-6 inline-block"
            >
              ← Back to matches
            </button>
            <ComparisonView bookA={fingerprint} bookB={compareBook} />
          </section>
        )}
      </div>

      <footer className="border-t border-helix-border py-8 text-center">
        <p className="text-helix-muted/40 text-sm font-mono">
          BookDNA — structural fingerprinting for literature
        </p>
      </footer>
    </main>
  );
}

function MiniHelix({ data, color }: { data: number[]; color: string }) {
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 50 - v * 40;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg viewBox="0 0 100 50" className="w-full h-full" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        opacity="0.7"
      />
    </svg>
  );
}

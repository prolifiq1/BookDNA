'use client';

import { useState, useCallback } from 'react';
import { searchGutenberg, fetchGutenbergText, searchOpenLibrary, SearchResult } from '@/lib/sources';

interface BookInputProps {
  onTextLoaded: (text: string, title: string, author: string) => void;
  isAnalysing: boolean;
}

type Tab = 'search' | 'upload' | 'paste';

export default function BookInput({ onTextLoaded, isAnalysing }: BookInputProps) {
  const [activeTab, setActiveTab] = useState<Tab>('search');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [pasteText, setPasteText] = useState('');
  const [pasteTitle, setPasteTitle] = useState('');
  const [pasteAuthor, setPasteAuthor] = useState('');

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const [gutenberg, openLib] = await Promise.all([
        searchGutenberg(query).catch(() => []),
        searchOpenLibrary(query).catch(() => []),
      ]);
      setResults([...gutenberg, ...openLib]);
    } finally {
      setSearching(false);
    }
  }, [query]);

  const handleSelectBook = useCallback(
    async (result: SearchResult) => {
      if (result.source !== 'gutenberg') {
        alert(
          'Open Library provides metadata but not full text. Try the Gutenberg version or upload the book file.'
        );
        return;
      }
      setLoading(result.id);
      try {
        const text = await fetchGutenbergText(result.id);
        onTextLoaded(text, result.title, result.author);
      } catch (err) {
        alert('Failed to fetch book text. Try another edition.');
      } finally {
        setLoading(null);
      }
    },
    [onTextLoaded]
  );

  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result as string;
        onTextLoaded(text, file.name.replace(/\.\w+$/, ''), 'Unknown');
      };
      reader.readAsText(file);
    },
    [onTextLoaded]
  );

  const handlePaste = useCallback(() => {
    if (pasteText.trim().length < 500) {
      alert('Please paste at least 500 characters for meaningful analysis.');
      return;
    }
    onTextLoaded(pasteText, pasteTitle || 'Untitled', pasteAuthor || 'Unknown');
  }, [pasteText, pasteTitle, pasteAuthor, onTextLoaded]);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'search', label: 'Search Books' },
    { id: 'upload', label: 'Upload File' },
    { id: 'paste', label: 'Paste Text' },
  ];

  return (
    <div className="bg-helix-surface border border-helix-border rounded-2xl overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-helix-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-3 text-sm font-mono transition-colors
              ${
                activeTab === tab.id
                  ? 'text-helix-accent border-b-2 border-helix-accent bg-helix-card/50'
                  : 'text-helix-muted hover:text-helix-text'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6">
        {/* Search Tab */}
        {activeTab === 'search' && (
          <div>
            <div className="flex gap-3">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by title or author…"
                className="flex-1 bg-helix-bg border border-helix-border rounded-lg px-4 py-3
                           text-helix-text placeholder:text-helix-muted/50 font-body
                           focus:outline-none focus:border-helix-accent/50 transition-colors"
              />
              <button
                onClick={handleSearch}
                disabled={searching || isAnalysing}
                className="px-6 py-3 bg-helix-accent text-white rounded-lg font-mono text-sm
                           hover:bg-helix-accent/80 disabled:opacity-50 transition-all"
              >
                {searching ? 'Searching…' : 'Search'}
              </button>
            </div>

            {results.length > 0 && (
              <div className="mt-4 space-y-2 max-h-80 overflow-y-auto">
                {results.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => handleSelectBook(result)}
                    disabled={loading === result.id || isAnalysing}
                    className="w-full flex items-center gap-4 p-3 rounded-lg text-left
                               bg-helix-bg/50 border border-transparent
                               hover:border-helix-accent/30 transition-all group"
                  >
                    {result.coverUrl && (
                      <img
                        src={result.coverUrl}
                        alt=""
                        className="w-10 h-14 object-cover rounded shadow-md"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-helix-text font-body truncate group-hover:text-helix-accent transition-colors">
                        {result.title}
                      </p>
                      <p className="text-helix-muted text-sm">{result.author}</p>
                    </div>
                    <span className="text-[10px] font-mono uppercase text-helix-muted/60 px-2 py-0.5 bg-helix-card rounded">
                      {result.source === 'gutenberg' ? 'Gutenberg' : 'Open Library'}
                    </span>
                    {loading === result.id && (
                      <span className="text-helix-accent text-sm animate-pulse">Loading…</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="text-center py-8">
            <label className="cursor-pointer inline-block">
              <div className="border-2 border-dashed border-helix-border rounded-xl px-12 py-10
                              hover:border-helix-accent/50 transition-colors">
                <p className="text-helix-muted text-4xl mb-3">📄</p>
                <p className="text-helix-text font-body">
                  Drop a <span className="text-helix-accent">.txt</span> or{' '}
                  <span className="text-helix-accent">.epub</span> file here
                </p>
                <p className="text-helix-muted text-sm mt-1">or click to browse</p>
              </div>
              <input
                type="file"
                accept=".txt,.epub,.md"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* Paste Tab */}
        {activeTab === 'paste' && (
          <div className="space-y-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={pasteTitle}
                onChange={(e) => setPasteTitle(e.target.value)}
                placeholder="Title"
                className="flex-1 bg-helix-bg border border-helix-border rounded-lg px-4 py-2
                           text-helix-text placeholder:text-helix-muted/50 font-body
                           focus:outline-none focus:border-helix-accent/50 transition-colors"
              />
              <input
                type="text"
                value={pasteAuthor}
                onChange={(e) => setPasteAuthor(e.target.value)}
                placeholder="Author"
                className="flex-1 bg-helix-bg border border-helix-border rounded-lg px-4 py-2
                           text-helix-text placeholder:text-helix-muted/50 font-body
                           focus:outline-none focus:border-helix-accent/50 transition-colors"
              />
            </div>
            <textarea
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder="Paste book text here (minimum 500 characters)…"
              rows={8}
              className="w-full bg-helix-bg border border-helix-border rounded-lg px-4 py-3
                         text-helix-text placeholder:text-helix-muted/50 font-body text-sm
                         focus:outline-none focus:border-helix-accent/50 transition-colors resize-none"
            />
            <button
              onClick={handlePaste}
              disabled={pasteText.length < 500 || isAnalysing}
              className="px-6 py-3 bg-helix-accent text-white rounded-lg font-mono text-sm
                         hover:bg-helix-accent/80 disabled:opacity-50 transition-all"
            >
              Analyse Text
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

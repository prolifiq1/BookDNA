/**
 * Book Sources — fetch text from Gutenberg, Open Library, or user files
 */

export interface BookSource {
  title: string;
  author: string;
  text: string;
  source: 'gutenberg' | 'openlibrary' | 'upload';
  coverUrl?: string;
}

export interface SearchResult {
  id: string;
  title: string;
  author: string;
  source: 'gutenberg' | 'openlibrary';
  coverUrl?: string;
}

// ── Project Gutenberg ──────────────────────────────────

export async function searchGutenberg(query: string): Promise<SearchResult[]> {
  const res = await fetch(
    `https://gutendex.com/books/?search=${encodeURIComponent(query)}`
  );
  const data = await res.json();

  return (data.results || []).slice(0, 10).map((book: any) => ({
    id: `gutenberg-${book.id}`,
    title: book.title,
    author: book.authors?.[0]?.name || 'Unknown',
    source: 'gutenberg' as const,
    coverUrl: book.formats?.['image/jpeg'] || undefined,
  }));
}

export async function fetchGutenbergText(gutenbergId: string): Promise<string> {
  const id = gutenbergId.replace('gutenberg-', '');
  // Try plain text UTF-8 first
  const url = `https://www.gutenberg.org/files/${id}/${id}-0.txt`;
  const res = await fetch(url);

  if (!res.ok) {
    // Fallback to cache URL
    const fallback = `https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`;
    const res2 = await fetch(fallback);
    if (!res2.ok) throw new Error(`Could not fetch Gutenberg book ${id}`);
    return await res2.text();
  }

  return await res.text();
}

// ── Open Library ───────────────────────────────────────

export async function searchOpenLibrary(query: string): Promise<SearchResult[]> {
  const res = await fetch(
    `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=10`
  );
  const data = await res.json();

  return (data.docs || []).slice(0, 10).map((doc: any) => ({
    id: `ol-${doc.key?.replace('/works/', '')}`,
    title: doc.title,
    author: doc.author_name?.[0] || 'Unknown',
    source: 'openlibrary' as const,
    coverUrl: doc.cover_i
      ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
      : undefined,
  }));
}

// ── File Parsing ───────────────────────────────────────

export function parseUploadedText(content: string, filename: string): BookSource {
  // Strip common Gutenberg headers/footers
  let text = content;
  const startMarker = text.indexOf('*** START OF');
  const endMarker = text.indexOf('*** END OF');
  if (startMarker !== -1) {
    const afterStart = text.indexOf('\n', startMarker);
    text = text.slice(afterStart + 1);
  }
  if (endMarker !== -1) {
    text = text.slice(0, endMarker);
  }

  return {
    title: filename.replace(/\.(txt|epub|pdf)$/i, ''),
    author: 'Unknown',
    text: text.trim(),
    source: 'upload',
  };
}

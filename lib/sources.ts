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
  source: 'gutenberg' | 'archive';
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
  const res = await fetch(`/api/fetch-book?id=${id}&source=gutenberg`);
  if (!res.ok) throw new Error(`Could not fetch Gutenberg book ${id}`);
  return await res.text();
}

// ── Internet Archive ────────────────────────────────────

export async function searchInternetArchive(query: string): Promise<SearchResult[]> {
  const params = new URLSearchParams({
    q: `(${query}) AND mediatype:texts AND language:eng AND NOT collection:inlibrary`,
    'fl[]': 'identifier,title,creator,subject',
    sort: 'downloads desc',
    rows: '20',
    page: '1',
    output: 'json',
  });
  const res = await fetch(`https://archive.org/advancedsearch.php?${params}`);
  if (!res.ok) return [];
  const data = await res.json();
  return (data.response?.docs || [])
    .filter((doc: any) => doc.identifier && doc.title)
    .map((doc: any) => ({
      id: `archive-${doc.identifier}`,
      title: Array.isArray(doc.title) ? doc.title[0] : doc.title,
      author: Array.isArray(doc.creator) ? doc.creator[0] : (doc.creator || 'Unknown'),
      source: 'archive' as const,
      coverUrl: `https://archive.org/services/img/${doc.identifier}`,
    }));
}

export async function fetchArchiveText(archiveId: string): Promise<string> {
  const id = archiveId.replace('archive-', '');
  const res = await fetch(`/api/fetch-book?id=${id}&source=archive`);
  if (!res.ok) throw new Error(`Could not fetch Internet Archive book ${id}`);
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

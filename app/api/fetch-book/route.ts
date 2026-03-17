import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  const source = req.nextUrl.searchParams.get('source') || 'gutenberg';
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  if (source === 'archive') {
    // Internet Archive — try plain text formats
    const urls = [
      `https://archive.org/download/${id}/${id}_djvu.txt`,
      `https://archive.org/download/${id}/${id}.txt`,
      `https://archive.org/download/${id}/${id}_text.txt`,
    ];
    for (const url of urls) {
      try {
        const res = await fetch(url, { headers: { 'User-Agent': 'BookDNA/1.0' } });
        if (res.ok) {
          const text = await res.text();
          return new NextResponse(text, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          });
        }
      } catch {
        // try next
      }
    }
    return NextResponse.json({ error: 'Could not fetch book from Internet Archive' }, { status: 404 });
  }

  // Gutenberg
  const numId = id.replace('gutenberg-', '');
  const urls = [
    `https://www.gutenberg.org/files/${numId}/${numId}-0.txt`,
    `https://www.gutenberg.org/files/${numId}/${numId}.txt`,
    `https://www.gutenberg.org/cache/epub/${numId}/pg${numId}.txt`,
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'BookDNA/1.0' } });
      if (res.ok) {
        const text = await res.text();
        return new NextResponse(text, {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      }
    } catch {
      // try next
    }
  }

  return NextResponse.json({ error: 'Could not fetch book' }, { status: 404 });
}

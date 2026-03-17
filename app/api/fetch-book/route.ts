import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const urls = [
    `https://www.gutenberg.org/files/${id}/${id}-0.txt`,
    `https://www.gutenberg.org/files/${id}/${id}.txt`,
    `https://www.gutenberg.org/cache/epub/${id}/pg${id}.txt`,
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
      // try next URL
    }
  }

  return NextResponse.json({ error: 'Could not fetch book' }, { status: 404 });
}

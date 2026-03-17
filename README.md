# 🧬 BookDNA — Structural Fingerprinting for Literature

BookDNA generates a unique structural fingerprint for any book by analysing prose at four dimensions — then finds unexpected literary matches across genres, eras, and cultures.

## How It Works

Every book has a hidden structure beneath its words. BookDNA extracts it across **four strands**:

| Strand | What it measures | Signal |
|--------|-----------------|--------|
| **Rhythm** 🟢 | Sentence length patterns, punctuation cadence | The "beat" of prose — Hemingway's staccato vs. Faulkner's legato |
| **Emotion** 🔴 | Sentiment arc across the narrative | The emotional shape — does it descend into darkness or arc toward light? |
| **Vocabulary** 🔵 | Lexical diversity, word sophistication | How rich and varied the word choices are across the text |
| **Structure** 🟣 | Paragraph density, dialogue ratio, pacing | Dense literary prose vs. dialogue-driven storytelling |

These four signals are visualised as an **animated DNA helix** — a unique visual signature for each book.

## Features

- **Gutenberg search** — analyse any of 70,000+ public domain books
- **Open Library search** — find books across the world's catalogue
- **File upload** — drop in .txt or .epub files
- **Paste text** — analyse any passage directly
- **DNA visualisation** — animated double helix showing all four strands
- **Structural stats** — word count, reading level, lexical diversity, dialogue ratio, and more
- **Match engine** — cosine similarity across all four dimensions to find structurally similar books

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Architecture

```
bookdna/
├── app/
│   ├── layout.tsx          # Root layout with fonts
│   ├── page.tsx            # Main page — orchestrates the full experience
│   └── globals.css         # Dark literary theme
├── components/
│   ├── DNAHelix.tsx        # Canvas-based animated helix visualisation
│   ├── BookInput.tsx       # Search, upload, and paste interface
│   ├── StatsPanel.tsx      # Structural statistics grid
│   └── MatchList.tsx       # Similarity results with dimension breakdowns
├── lib/
│   ├── fingerprint.ts      # Core NLP engine — rhythm, emotion, vocab, structure
│   └── sources.ts          # Book source helpers (Gutenberg, Open Library, upload)
└── package.json
```

## The Science

BookDNA doesn't care about *what* a book says — it cares about *how* it says it. Two books might share almost identical structural DNA despite being from different centuries, different genres, or different cultures. A 19th-century Russian novel might match a contemporary Nigerian memoir because they share the same psychological tension pattern: long, dense paragraphs punctuated by short bursts of dialogue, with vocabulary that oscillates between the ornate and the plain.

This is fundamentally different from recommendation engines that use genre tags, user ratings, or "people who bought X also bought Y." BookDNA finds connections that no human curator would think to make.

## Built With

- Next.js 14 (App Router)
- TypeScript
- Canvas API for helix rendering
- Tailwind CSS
- Gutenberg API (gutendex.com)
- Open Library API

## License

MIT

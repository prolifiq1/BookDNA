import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BookDNA — Structural Fingerprinting for Literature',
  description:
    'Generate a unique structural fingerprint for any book and discover unexpected literary matches across genres, eras, and cultures.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}

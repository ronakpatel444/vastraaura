import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Diwali Festive & Ethnic Fashion Collections | Vastra Aura',
  description: 'Explore Diwali Special collections by Vastra Aura Surat — from grand 3-Piece Suits and designer 2-Piece Coord Sets to artisanal Short Kurtis, Lehengas and sarees.',
  alternates: {
    canonical: 'https://vastraaura.com/collections',
  },
  openGraph: {
    title: 'Diwali Special Ethnic Fashion Collections | Vastra Aura',
    description: 'Explore signature Diwali 3-Piece Suits, Coord Sets, Short Kurtis and festive edits by Vastra Aura Surat.',
    url: 'https://vastraaura.com/collections',
    siteName: 'Vastra Aura',
  },
};

export default function CollectionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

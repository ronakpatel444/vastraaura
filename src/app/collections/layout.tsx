import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Curated Ethnic Fashion Collections | Vastra Aura',
  description: 'Explore curated collections by Vastra Aura Surat — from vibrant Navratri Chaniya Cholis and royal wedding Lehengas to designer suits and sarees.',
  alternates: {
    canonical: 'https://vastraaura.com/collections',
  },
  openGraph: {
    title: 'Curated Ethnic Fashion Collections | Vastra Aura',
    description: 'Explore signature collections by Vastra Aura Surat.',
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

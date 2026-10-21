import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Vastra Aura | Heritage, Artisans & Craftsmanship in Surat',
  description: 'Discover the story behind Vastra Aura — Surat\'s celebrated designer brand dedicated to preserving India\'s royal textile crafts, mirror work, and artisanal heritage.',
  alternates: {
    canonical: 'https://vastraaura.com/about',
  },
  openGraph: {
    title: 'About Vastra Aura | Heritage & Master Craftsmanship',
    description: 'Learn about Vastra Aura\'s artisanal roots in Surat, Gujarat.',
    url: 'https://vastraaura.com/about',
    siteName: 'Vastra Aura',
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

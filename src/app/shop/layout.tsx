import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shop Designer Chaniya Choli, Lehengas & Ethnic Wear | Vastra Aura',
  description: 'Explore the complete Vastra Aura designer collection online. Shop authentic handcrafted Chaniya Choli, wedding Lehengas, Kurtis, and 3-piece suits from Surat.',
  alternates: {
    canonical: 'https://vastraaura.com/shop',
  },
  openGraph: {
    title: 'Shop Designer Chaniya Choli & Lehengas | Vastra Aura',
    description: 'Explore handcrafted luxury ethnic fashion at Vastra Aura Surat.',
    url: 'https://vastraaura.com/shop',
    siteName: 'Vastra Aura',
  },
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

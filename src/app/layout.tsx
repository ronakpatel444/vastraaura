import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://vastraaura.com'),
  title: {
    default: "Vastra Aura | Diwali Special 3-Piece Suits, Coord Sets, Short Kurtis & Ethnic Wear Surat",
    template: "%s | Vastra Aura",
  },
  description: "Shop Diwali Special designer 3-Piece Suits, 2-Piece Coord Sets, cotton Short Kurtis, and luxury ethnic wear at Vastra Aura, Surat. Flat 20% OFF with code DIWALI20. Insured delivery across India.",
  keywords: [
    "Vastra Aura",
    "vastra aura",
    "vastraaura",
    "vastra aura surat",
    "Diwali Special Collection",
    "Diwali Festive Wear",
    "3 Piece Suit",
    "3 Pis Suit Surat",
    "Coord Sets",
    "2 Piece Coord Sets",
    "Short Kurtis",
    "Cotton Short Kurti",
    "Chaniya Choli",
    "Designer Lehenga",
    "Ethnic Wear Surat",
    "vastraaura.com"
  ],
  authors: [{ name: "Vastra Aura", url: "https://vastraaura.com" }],
  creator: "Vastra Aura",
  publisher: "Vastra Aura",
  alternates: {
    canonical: "https://vastraaura.com",
  },
  openGraph: {
    title: "Vastra Aura | Designer Chaniya Choli, Lehengas & Ethnic Wear",
    description: "Shop authentic designer Chaniya Cholis, Lehengas, and luxury ethnic fashion at Vastra Aura, Surat.",
    url: "https://vastraaura.com",
    siteName: "Vastra Aura",
    images: [
      {
        url: "https://vastraaura.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Vastra Aura Luxury Ethnic Fashion Surat",
      }
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vastra Aura | Timeless Elegance & Ethnic Luxury",
    description: "Ultra-luxury traditional Indian fashion and designer Chaniya Cholis from Surat.",
    images: ["https://vastraaura.com/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import CustomCursor from "@/components/ui/CustomCursor";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/layout/CartDrawer";
import SearchOverlay from "@/components/layout/SearchOverlay";
import StoreInitializer from "@/components/providers/StoreInitializer";
import FacebookPixel from "@/components/providers/FacebookPixel";
import { Suspense } from "react";
import { GoogleAnalytics } from '@next/third-parties/google';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://vastraaura.com/#website",
    "name": "Vastra Aura",
    "alternateName": [
      "VastraAura",
      "vastra aura",
      "vastraaura",
      "Vastra Aura Surat",
      "vastraaura.com",
      "The Vastra Aura"
    ],
    "url": "https://vastraaura.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://vastraaura.com/shop?category={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  const storeSchema = {
    "@context": "https://schema.org",
    "@type": ["ClothingStore", "Organization"],
    "@id": "https://vastraaura.com/#organization",
    "name": "Vastra Aura",
    "alternateName": [
      "VastraAura",
      "vastra aura",
      "vastraaura",
      "Vastra Aura Surat",
      "The Vastra Aura"
    ],
    "url": "https://vastraaura.com",
    "logo": "https://vastraaura.com/icon.png",
    "image": "https://vastraaura.com/og-image.jpg",
    "description": "Vastra Aura is Surat's premier designer label specializing in handcrafted Indian ethnic wear, designer Chaniya Choli, bridal lehengas, 3-piece suits, and festive collections.",
    "telephone": "+91 98765 43210",
    "email": "hello@vastraaura.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "183 - Vijay Nagar, Yogi Chowk",
      "addressLocality": "Surat",
      "addressRegion": "Gujarat",
      "postalCode": "395010",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 21.2185,
      "longitude": 72.8887
    },
    "priceRange": "₹₹",
    "currenciesAccepted": "INR",
    "paymentAccepted": "Cash, Credit Card, UPI, Net Banking",
    "sameAs": [
      "https://www.instagram.com/vastraaura_official",
      "https://vastraaura.store"
    ]
  };

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(storeSchema) }}
        />
      </head>
      <body className="antialiased min-h-screen bg-background text-foreground selection:bg-accent/30 selection:text-foreground">
        <Suspense fallback={null}>
          <FacebookPixel />
        </Suspense>
        <StoreInitializer />
        <SmoothScrollProvider>
          <CustomCursor />
          <Navbar />
          <CartDrawer />
          <SearchOverlay />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </SmoothScrollProvider>
        <GoogleAnalytics gaId='G-3757KDL5NJ' />
      </body>
    </html>
  );
}

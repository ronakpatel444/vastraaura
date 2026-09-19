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
  title: {
    default: "VASTRA AURA | Timeless Elegance",
    template: "%s | VASTRA AURA",
  },
  description: "Ultra-luxury traditional Indian fashion. Rooted in tradition, crafted for today.",
  keywords: ["Indian fashion", "luxury clothing", "traditional wear", "ethnic wear", "Vastra Aura"],
  authors: [{ name: "Vastra Aura" }],
  openGraph: {
    title: "VASTRA AURA | Timeless Elegance",
    description: "Ultra-luxury traditional Indian fashion.",
    url: "https://vastraaura.com",
    siteName: "VASTRA AURA",
    images: [
      {
        url: "https://vastraaura.com/og-image.jpg", // Replace with your actual OG image
        width: 1200,
        height: 630,
        alt: "VASTRA AURA Luxury Fashion",
      }
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VASTRA AURA | Timeless Elegance",
    description: "Ultra-luxury traditional Indian fashion.",
    images: ["https://vastraaura.com/og-image.jpg"],
  }
};

import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import CustomCursor from "@/components/ui/CustomCursor";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/layout/CartDrawer";
import SearchOverlay from "@/components/layout/SearchOverlay";
import StoreInitializer from "@/components/providers/StoreInitializer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="antialiased min-h-screen bg-background text-foreground selection:bg-accent/30 selection:text-foreground">
        <StoreInitializer />
        <SmoothScrollProvider>
          <CustomCursor />
          <Navbar />
          <CartDrawer />
          <SearchOverlay />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}

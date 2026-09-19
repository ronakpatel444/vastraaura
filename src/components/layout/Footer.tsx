'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function Footer() {
  const pathname = usePathname();
  const { setCursorType } = useStore();

  // Hide footer on admin routes and checkout
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/checkout')) {
    return null;
  }

  return (
    <footer className="bg-[#1A1A1A] text-white pt-16 md:pt-24 pb-8 md:pb-12 px-4 md:px-6">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-12 md:mb-20">
          
          {/* Brand Info */}
          <div className="lg:pr-8">
            <h2 className="text-3xl font-serif mb-6 tracking-wider">RANGREZ</h2>
            <p className="text-sm text-gray-400 leading-relaxed mb-8">
              Reviving India's royal heritage through handcrafted luxury fashion. Every piece is a testament to centuries of artisanal craftsmanship.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center hover:bg-white hover:text-black hover:border-white transition-all text-xs font-medium">
                IG
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center hover:bg-white hover:text-black hover:border-white transition-all text-xs font-medium">
                FB
              </a>
              <a href="#" className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center hover:bg-white hover:text-black hover:border-white transition-all text-xs font-medium">
                X
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Shop</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/shop" className="text-sm text-gray-400 hover:text-white transition-colors">All Collections</Link>
              </li>
              <li>
                <Link href="/shop" className="text-sm text-gray-400 hover:text-white transition-colors">Chaniya Choli</Link>
              </li>
              <li>
                <Link href="/shop" className="text-sm text-gray-400 hover:text-white transition-colors">Lehenga</Link>
              </li>
              <li>
                <Link href="/shop" className="text-sm text-gray-400 hover:text-white transition-colors">Accessories</Link>
              </li>
            </ul>
          </div>

          {/* Help & Information */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6">Assistance</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">Contact Us</Link>
              </li>
              <li>
                <Link href="/shipping" className="text-sm text-gray-400 hover:text-white transition-colors">Shipping Information</Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6">The Inner Circle</h3>
            <p className="text-sm text-gray-400 mb-4">
              Subscribe to receive exclusive early access to our festive collections and private sales.
            </p>
            <form className="relative mt-4" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="Email Address" 
                className="w-full bg-transparent border-b border-gray-600 py-3 pr-10 text-sm focus:outline-none focus:border-white transition-colors placeholder-gray-500"
              />
              <button 
                type="submit"
                className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                onMouseEnter={() => setCursorType('MAGNETIC')}
                onMouseLeave={() => setCursorType('DEFAULT')}
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Vastra Aura. All rights reserved.
          </p>
          <div className="flex gap-4">
            <span className="text-xs text-gray-500">INR (₹)</span>
            <span className="text-xs text-gray-500">EN</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

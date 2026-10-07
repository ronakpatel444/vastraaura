'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, ShoppingBag, Heart, User, Menu, X } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const { setCartOpen, setSearchOpen, isMenuOpen, setMenuOpen, setCursorType, cartItems } = useStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pathname.startsWith('/admin') || pathname.startsWith('/seller') || pathname.startsWith('/influencer')) {
    return null;
  }

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="bg-[#141414] text-[#EAEAEA] text-[11px] sm:text-xs py-2 px-4 border-b border-white/10 relative z-[60]">
        <div className="container mx-auto flex justify-between items-center text-center">
          <div className="hidden md:flex items-center gap-2 text-neutral-400 text-[11px]">
            <span>✨ Authentic Handcrafted Luxury Fashion</span>
          </div>
          <div className="flex items-center justify-center gap-2 mx-auto md:mx-0 flex-wrap">
            <span className="text-amber-400 font-semibold tracking-wider">SELL WITH US:</span>
            <span>Register as a Designer Seller (₹3,999 One-Time)</span>
            <Link href="/seller/register" className="font-bold underline text-amber-300 hover:text-white transition-colors ml-1">
              Apply & Launch →
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-3 text-[11px] text-neutral-400">
            <Link href="/track-order" className="hover:text-amber-300 transition-colors text-white font-medium">Track Order</Link>
            <span>|</span>
            <Link href="/seller" className="hover:text-white transition-colors">Seller Login</Link>
            <span>|</span>
            <Link href="/influencer" className="hover:text-white transition-colors">Influencer Portal</Link>
          </div>
        </div>
      </div>

      <motion.header
        className={`fixed left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled || isMenuOpen ? 'top-0 bg-background/95 text-foreground shadow-sm' : 'top-8 sm:top-8 bg-transparent text-foreground'
        }`}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="container mx-auto px-6 h-24 flex items-center justify-between">
          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden flex-1 flex justify-start"
            onClick={() => setMenuOpen(!isMenuOpen)}
            onMouseEnter={() => setCursorType('MAGNETIC')}
            onMouseLeave={() => setCursorType('DEFAULT')}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          {/* Desktop Links */}
          <nav className="hidden lg:flex flex-1 gap-8 text-sm tracking-widest uppercase items-center">
            {/* Shop Dropdown */}
            <div className="relative group py-4">
              <Link 
                href="/shop"
                className="hover:text-accent transition-colors relative inline-block"
                onMouseEnter={() => setCursorType('MAGNETIC')}
                onMouseLeave={() => setCursorType('DEFAULT')}
              >
                SHOP
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent transition-all duration-300 group-hover:w-full" />
              </Link>
              
              {/* Dropdown Menu */}
              <div className="absolute top-[100%] left-0 w-48 bg-white border border-gray-100 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 flex flex-col z-50">
                <Link href="/shop" className="px-6 py-3 text-xs hover:bg-gray-50 hover:text-accent transition-colors border-b border-gray-50 text-gray-800">All Products</Link>
                <Link href="/shop?category=saree" className="px-6 py-3 text-xs hover:bg-gray-50 hover:text-accent transition-colors border-b border-gray-50 text-gray-800">Saree</Link>
                <Link href="/shop?category=chaniya-choli" className="px-6 py-3 text-xs hover:bg-gray-50 hover:text-accent transition-colors border-b border-gray-50 text-gray-800">Chaniya Choli</Link>
                <Link href="/shop?category=lehenga" className="px-6 py-3 text-xs hover:bg-gray-50 hover:text-accent transition-colors border-b border-gray-50 text-gray-800">Lehenga</Link>
                <Link href="/shop?category=kurta-sets" className="px-6 py-3 text-xs hover:bg-gray-50 hover:text-accent transition-colors border-b border-gray-50 text-gray-800">Kurta Sets</Link>
                <Link href="/shop?category=Short%20Kurtis" className="px-6 py-3 text-xs hover:bg-gray-50 hover:text-accent transition-colors border-b border-gray-50 text-gray-800">Short Kurtis</Link>
                <Link href="/shop?category=3%20Piece%20Suit" className="px-6 py-3 text-xs hover:bg-gray-50 hover:text-accent transition-colors border-b border-gray-50 text-gray-800">3 Piece Suit</Link>
                <Link href="/shop?category=kids-wear" className="px-6 py-3 text-xs hover:bg-gray-50 hover:text-accent transition-colors text-gray-800">Kids Wear</Link>
              </div>
            </div>

            {['Collections', 'Combo', 'About'].map((item) => (
              <Link 
                key={item} 
                href={`/${item.toLowerCase()}`}
                className="hover:text-accent transition-colors relative group py-4"
                onMouseEnter={() => setCursorType('MAGNETIC')}
                onMouseLeave={() => setCursorType('DEFAULT')}
              >
                {item}
                <span className="absolute bottom-3 left-0 w-0 h-px bg-accent transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Logo */}
          <div className="flex-1 flex justify-center">
            <Link 
              href="/" 
              className="text-xl md:text-3xl font-serif tracking-widest whitespace-nowrap"
              onMouseEnter={() => setCursorType('MAGNETIC')}
              onMouseLeave={() => setCursorType('DEFAULT')}
            >
              VASTRA AURA
            </Link>
          </div>

          {/* Icons */}
          <div className="flex-1 flex justify-end gap-6">
            <button onClick={() => setSearchOpen(true)} onMouseEnter={() => setCursorType('MAGNETIC')} onMouseLeave={() => setCursorType('DEFAULT')}>
              <Search className="w-5 h-5 hover:text-accent transition-colors" />
            </button>
            <button className="hidden sm:block" onMouseEnter={() => setCursorType('MAGNETIC')} onMouseLeave={() => setCursorType('DEFAULT')}>
              <User className="w-5 h-5 hover:text-accent transition-colors" />
            </button>
            <button className="hidden sm:block" onMouseEnter={() => setCursorType('MAGNETIC')} onMouseLeave={() => setCursorType('DEFAULT')}>
              <Heart className="w-5 h-5 hover:text-accent transition-colors" />
            </button>
            <button onClick={() => setCartOpen(true)} className="relative" onMouseEnter={() => setCursorType('MAGNETIC')} onMouseLeave={() => setCursorType('DEFAULT')}>
              <ShoppingBag className="w-5 h-5 hover:text-accent transition-colors" />
              <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
              </span>
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '-100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '-100%' }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 bg-white/95 backdrop-blur-md pt-28 px-8 flex flex-col overflow-y-auto pb-10"
          >
            <nav className="flex flex-col gap-6 text-2xl md:text-3xl font-serif">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                <div className="flex flex-col gap-4">
                  <Link href="/shop" onClick={() => setMenuOpen(false)} className="text-gray-900 hover:text-accent transition-colors">Shop</Link>
                  <div className="flex flex-col gap-3 pl-6 border-l-[1px] border-accent/30 text-lg text-gray-600">
                    <Link href="/shop?category=saree" onClick={() => setMenuOpen(false)} className="hover:text-accent transition-colors">Saree</Link>
                    <Link href="/shop?category=chaniya-choli" onClick={() => setMenuOpen(false)} className="hover:text-accent transition-colors">Chaniya Choli</Link>
                    <Link href="/shop?category=lehenga" onClick={() => setMenuOpen(false)} className="hover:text-accent transition-colors">Lehenga</Link>
                    <Link href="/shop?category=kurta-sets" onClick={() => setMenuOpen(false)} className="hover:text-accent transition-colors">Kurta Sets</Link>
                    <Link href="/shop?category=Short%20Kurtis" onClick={() => setMenuOpen(false)} className="hover:text-accent transition-colors">Short Kurtis</Link>
                    <Link href="/shop?category=3%20Piece%20Suit" onClick={() => setMenuOpen(false)} className="hover:text-accent transition-colors">3 Piece Suit</Link>
                  </div>
                </div>
              </motion.div>
              {['Collections', 'Combo', 'About', 'Journal'].map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (i + 1) * 0.1 + 0.1 }}
                >
                  <Link 
                    href={`/${item.toLowerCase()}`}
                    onClick={() => setMenuOpen(false)}
                    className="text-gray-900 hover:text-accent transition-colors"
                  >
                    {item}
                  </Link>
                </motion.div>
              ))}
            </nav>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-auto pt-12"
            >
              <div className="flex flex-wrap items-center gap-6 text-xs font-sans tracking-widest text-gray-500 uppercase">
                <Link href="/seller" onClick={() => setMenuOpen(false)} className="hover:text-accent transition-colors">Seller Login</Link>
                <Link href="/track-order" onClick={() => setMenuOpen(false)} className="hover:text-accent transition-colors">Track Order</Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

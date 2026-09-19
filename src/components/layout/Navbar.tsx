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

  if (pathname.startsWith('/admin')) {
    return null;
  }

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-500 ${
          isScrolled || isMenuOpen ? 'bg-background/90 backdrop-blur-md text-foreground shadow-sm' : 'bg-transparent text-foreground'
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
          <nav className="hidden lg:flex flex-1 gap-8 text-sm tracking-widest uppercase">
            {['Shop', 'Collections', 'About', 'Journal'].map((item) => (
              <Link 
                key={item} 
                href={`/${item.toLowerCase()}`}
                className="hover:text-accent transition-colors relative group"
                onMouseEnter={() => setCursorType('MAGNETIC')}
                onMouseLeave={() => setCursorType('DEFAULT')}
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-accent transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Logo */}
          <div className="flex-1 flex justify-center">
            <Link 
              href="/" 
              className="text-3xl font-serif tracking-widest"
              onMouseEnter={() => setCursorType('MAGNETIC')}
              onMouseLeave={() => setCursorType('DEFAULT')}
            >
              RANGREZ
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
            initial={{ opacity: 0, y: '-100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '-100%' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-40 bg-background pt-24 px-6 flex flex-col"
          >
            <nav className="flex flex-col gap-6 text-3xl font-serif mt-10">
              {['Home', 'Shop', 'Collections', 'About', 'Journal'].map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 + 0.2 }}
                >
                  <Link 
                    href={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                    onClick={() => setMenuOpen(false)}
                    className="hover:text-accent transition-colors"
                  >
                    {item}
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

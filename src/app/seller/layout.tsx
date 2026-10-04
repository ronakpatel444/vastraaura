'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Package, Settings, LogOut, Menu, X, Wallet, Sparkles, Megaphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const navLinks = [
    { href: '/seller', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/seller/orders', icon: ShoppingBag, label: 'My Orders' },
    { href: '/seller/products', icon: Package, label: 'My Products' },
    { href: '/seller/collaborations', icon: Sparkles, label: 'Influencer Ads' },
    { href: '/seller/ads', icon: Megaphone, label: 'Ads & Promotions' },
    { href: '/seller/earnings', icon: Wallet, label: 'Earnings & Payouts' },
    { href: '/seller/settings', icon: Settings, label: 'Store Settings' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col md:flex-row">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between h-16 px-4 border-b border-neutral-200 bg-white z-30">
        <div className="flex items-center">
          <span className="font-serif text-xl tracking-widest">VASTRA AURA</span>
          <span className="ml-2 text-[10px] font-sans font-bold bg-neutral-900 text-white px-2 py-0.5 rounded">SELLER</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 -mr-2">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-neutral-200 hidden md:flex flex-col flex-shrink-0">
        <div className="h-20 flex items-center px-8 border-b border-neutral-200">
          <span className="font-serif text-xl tracking-widest">VASTRA AURA</span>
          <span className="ml-2 text-[10px] font-sans font-bold bg-neutral-900 text-white px-2 py-0.5 rounded">SELLER</span>
        </div>
        
        <nav className="flex-1 p-6 flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link 
              key={link.href}
              href={link.href} 
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                pathname === link.href ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <link.icon className="w-5 h-5" /> {link.label}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-neutral-200">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 w-full transition-colors"
          >
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar (Animated Drawer) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            key="mobile-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}
        {isMobileMenuOpen && (
          <motion.aside 
            key="mobile-sidebar"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="fixed inset-y-0 left-0 w-64 bg-white border-r border-neutral-200 flex flex-col z-50 md:hidden shadow-2xl"
          >
              <div className="h-16 flex items-center justify-between px-6 border-b border-neutral-200">
                <div className="flex items-center">
                  <span className="font-serif text-xl tracking-widest">VASTRA</span>
                  <span className="ml-2 text-[10px] font-sans font-bold bg-neutral-900 text-white px-2 py-0.5 rounded">SELLER</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
                {navLinks.map((link) => (
                  <Link 
                    key={link.href}
                    href={link.href} 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                      pathname === link.href ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
                    }`}
                  >
                    <link.icon className="w-5 h-5" /> {link.label}
                  </Link>
                ))}
              </nav>

              <div className="p-4 border-t border-neutral-200">
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 w-full transition-colors"
                >
                  <LogOut className="w-5 h-5" /> Sign Out
                </button>
              </div>
            </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen w-full md:max-w-[calc(100vw-16rem)] overflow-x-hidden relative">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex-1 flex flex-col p-6 md:p-10"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Link as LinkIcon, Wallet, LogOut, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InfluencerLayout({
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
    { href: '/influencer', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/influencer/links', icon: LinkIcon, label: 'Collaboration Links' },
    { href: '/influencer/earnings', icon: Wallet, label: 'Payouts' },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col md:flex-row">
      <div className="md:hidden flex items-center justify-between h-16 px-4 border-b border-neutral-200 bg-white z-30">
        <div className="flex items-center">
          <span className="font-serif text-xl tracking-widest">VASTRA AURA</span>
          <span className="ml-2 text-[10px] font-sans font-bold bg-pink-600 text-white px-2 py-0.5 rounded">INFLUENCER</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 -mr-2">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <aside className="w-64 bg-white border-r border-neutral-200 hidden md:flex flex-col flex-shrink-0">
        <div className="h-20 flex items-center px-8 border-b border-neutral-200">
          <span className="font-serif text-xl tracking-widest">VASTRA AURA</span>
          <span className="ml-2 text-[10px] font-sans font-bold bg-pink-600 text-white px-2 py-0.5 rounded">INFLUENCER</span>
        </div>
        
        <nav className="flex-1 p-6 flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link 
              key={link.href}
              href={link.href} 
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                pathname === link.href ? 'bg-pink-50 text-pink-700' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              <link.icon className="w-5 h-5" /> {link.label}
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t border-neutral-200">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg text-red-600 hover:bg-red-50 w-full transition-colors">
            <LogOut className="w-5 h-5" /> Sign Out
          </button>
        </div>
      </aside>

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

'use client';

import { useStore } from '@/store/useStore';
import { ArrowRight } from 'lucide-react';

export default function Newsletter() {
  const { setCursorType } = useStore();

  return (
    <section className="py-16 md:py-32 px-4 md:px-6 bg-foreground text-background">
      <div className="container mx-auto max-w-4xl text-center">
        <h2 className="text-3xl md:text-6xl font-serif mb-4 md:mb-6">STAY CONNECTED</h2>
        <p className="text-base md:text-xl font-serif italic opacity-80 mb-8 md:mb-12 max-w-2xl mx-auto">
          “Join the VASTRA AURA family. Get updates on new arrivals, exclusive offers, and special events.”
        </p>

        <form className="flex flex-col md:flex-row gap-0 max-w-2xl mx-auto border-b border-background/30 focus-within:border-accent transition-colors pb-4">
          <input 
            type="email" 
            placeholder="Enter your email address"
            className="flex-1 bg-transparent text-xl font-serif outline-none placeholder:text-background/40 py-2"
          />
          <button 
            type="button"
            className="group flex items-center gap-4 text-sm uppercase tracking-widest hover:text-accent transition-colors py-2 md:py-0 mt-4 md:mt-0"
            onMouseEnter={() => setCursorType('MAGNETIC')}
            onMouseLeave={() => setCursorType('DEFAULT')}
          >
            Subscribe 
            <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
          </button>
        </form>
      </div>
    </section>
  );
}

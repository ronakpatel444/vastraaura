'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { COUNTRIES, COUNTRY_LIST, CountryConfig } from '@/lib/currency';
import { ChevronDown, Globe } from 'lucide-react';

interface CurrencySelectorProps {
  variant?: 'topbar' | 'compact' | 'drawer';
  className?: string;
}

export default function CurrencySelector({ variant = 'topbar', className = '' }: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { currentCountry, setCountry, detectUserCountry } = useStore();

  // Run geo-detection once on mount
  useEffect(() => {
    detectUserCountry();
  }, [detectUserCountry]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const activeCountry: CountryConfig = COUNTRIES[currentCountry] || COUNTRIES.IN;

  const handleSelect = (code: string) => {
    setCountry(code);
    setIsOpen(false);
  };

  if (variant === 'drawer') {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-500">
          <Globe className="w-3.5 h-3.5" />
          <span>Country & Currency</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {COUNTRY_LIST.map((c) => (
            <button
              key={c.code}
              type="button"
              onClick={() => setCountry(c.code)}
              className={`flex items-center gap-2 px-3 py-2 text-xs rounded border transition-all text-left ${
                c.code === currentCountry
                  ? 'border-accent bg-accent/5 font-bold text-accent'
                  : 'border-neutral-200 hover:border-neutral-400 text-neutral-700'
              }`}
            >
              <span className="text-base">{c.flag}</span>
              <span className="truncate">{c.currency} ({c.symbol})</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1 rounded text-neutral-300 hover:text-white transition-colors cursor-pointer text-[11px] font-medium tracking-wide bg-white/5 hover:bg-white/10 border border-white/10"
        title="Change Country / Currency"
      >
        <span className="text-sm leading-none">{activeCountry.flag}</span>
        <span className="font-semibold text-amber-300">{activeCountry.currency}</span>
        <span className="opacity-70">({activeCountry.symbol})</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 opacity-60 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-56 bg-neutral-900 border border-white/15 rounded-lg shadow-2xl py-1.5 z-[100] text-xs backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1.5 text-[10px] uppercase font-bold tracking-wider text-neutral-400 border-b border-white/10 flex items-center justify-between">
            <span>Select Region & Currency</span>
            <Globe className="w-3 h-3 text-amber-400" />
          </div>

          <div className="max-h-64 overflow-y-auto py-1">
            {COUNTRY_LIST.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => handleSelect(c.code)}
                className={`w-full flex items-center justify-between px-3 py-2 hover:bg-white/10 transition-colors text-left ${
                  c.code === currentCountry ? 'bg-amber-400/15 text-amber-300 font-semibold' : 'text-neutral-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base leading-none">{c.flag}</span>
                  <div>
                    <div className="font-medium text-xs text-white">{c.name}</div>
                    <div className="text-[10px] text-neutral-400">{c.currency} • {c.symbol}</div>
                  </div>
                </div>
                {c.isTier1 && (
                  <span className="text-[9px] bg-white/10 text-neutral-300 px-1.5 py-0.5 rounded font-mono">
                    Tier-1
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

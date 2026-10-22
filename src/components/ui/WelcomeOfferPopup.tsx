'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Copy, Check, Flame } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function WelcomeOfferPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ minutes: 14, seconds: 53 });
  const router = useRouter();

  useEffect(() => {
    // Check if user has already seen the popup in this session/device
    const hasSeenPopup = localStorage.getItem('hasSeenDiwaliWelcomePopup');
    
    if (!hasSeenPopup) {
      // Show popup after 2.5 seconds of entering the site
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    
    // Countdown timer logic
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { minutes: prev.minutes - 1, seconds: 59 };
        } else {
          clearInterval(timer);
          return prev;
        }
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('hasSeenDiwaliWelcomePopup', 'true');
  };

  const copyPromoCode = () => {
    navigator.clipboard.writeText('DIWALI20');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShopNow = () => {
    copyPromoCode();
    handleClose();
    router.push('/shop?category=3-piece-suit');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 25 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto no-scrollbar bg-white rounded-lg shadow-2xl flex flex-col md:flex-row z-10 border border-amber-500/30"
          >
            {/* Close Button - Top Right */}
            <button
              onClick={handleClose}
              aria-label="Close Diwali Popup"
              className="absolute top-3 right-3 md:top-4 md:right-4 z-20 p-2 bg-white/80 backdrop-blur-md rounded-full hover:bg-white text-gray-800 shadow-md transition-all hover:scale-110"
            >
              <X size={18} />
            </button>

            {/* Left Image Section - Royal Diwali Celebration */}
            <div className="relative w-full md:w-5/12 py-10 md:py-12 bg-gradient-to-br from-[#3b0a13] via-[#4d0f1b] to-[#26050b] overflow-hidden flex flex-col items-center justify-center p-6 md:p-8 text-white text-center shrink-0">
              {/* Golden Ambient Glow */}
              <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-400 via-rose-600 to-transparent pointer-events-none" />
              <div className="absolute -top-12 -left-12 w-40 h-40 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center">
                {/* Diwali Diya Emblem */}
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border-2 border-amber-400/60 bg-amber-500/10 backdrop-blur-sm flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(251,191,36,0.35)] animate-pulse">
                  <span className="text-2xl md:text-3xl">🪔</span>
                </div>

                <div className="flex items-center gap-1.5 uppercase tracking-[0.25em] text-[10px] md:text-xs mb-2 text-amber-300 font-bold">
                  <Sparkles size={12} className="text-amber-300" />
                  <span>Diwali Special Dhamaka</span>
                  <Sparkles size={12} className="text-amber-300" />
                </div>

                <h3 className="font-serif text-3xl md:text-5xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300 drop-shadow-md">
                  FLAT 20% OFF
                </h3>

                <p className="text-xs md:text-sm text-amber-100/90 font-light mb-4 max-w-xs">
                  On Handcrafted 3-Piece Suits, Designer Coord Sets & Cotton Short Kurtis
                </p>

                <div className="inline-flex items-center gap-1.5 bg-amber-400/20 border border-amber-400/40 px-3 py-1.5 rounded-full text-[10px] md:text-xs text-amber-200 font-medium">
                  <Flame size={12} className="text-amber-300" />
                  <span>Free Insured Delivery Across India</span>
                </div>
              </div>
            </div>

            {/* Right Content Section */}
            <div className="w-full md:w-7/12 p-6 md:p-10 flex flex-col justify-center bg-[#FDFBF7]">
              <div className="flex items-center gap-2 text-amber-700 text-[10px] md:text-xs font-bold tracking-widest uppercase mb-2">
                <span className="w-6 h-[2px] bg-amber-600"></span>
                <span>Festival of Lights Celebration</span>
              </div>
              
              <h2 className="font-serif text-2xl md:text-3xl text-gray-900 mb-2 leading-tight">
                Diwali Special Exclusive Gift For You
              </h2>
              
              <p className="text-gray-600 text-xs md:text-sm mb-5 leading-relaxed">
                Brighten up your Diwali festivities with Surat's finest handcrafted ethnic fashion. Explore our festive range of <strong>Short Kurtis</strong>, <strong>Grand 3-Piece Suits</strong>, and <strong>2-Piece Coord Sets</strong>!
              </p>

              {/* Promo Code Box */}
              <div className="border-2 border-dashed border-amber-500/50 rounded-xl p-3 md:p-4 mb-4 relative bg-amber-50/70 shadow-inner">
                <div className="text-[10px] uppercase tracking-widest text-amber-800 font-bold mb-1 flex items-center justify-between">
                  <span>Use Diwali Promo Code:</span>
                  <span className="text-green-700 font-semibold text-[10px]">Active for 1st Order</span>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 font-mono text-xl md:text-2xl font-black tracking-wider text-amber-950">
                    <span className="text-amber-600">🏷️</span> DIWALI20
                  </div>
                  <button 
                    onClick={copyPromoCode}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-amber-600 to-amber-700 text-white px-3.5 md:px-4 py-2 rounded-lg text-[11px] md:text-xs uppercase tracking-wider font-bold hover:from-amber-700 hover:to-amber-800 shadow transition-all active:scale-95"
                  >
                    {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Code</>}
                  </button>
                </div>
              </div>

              {/* Timer & CTA */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs text-amber-900 bg-amber-100/70 px-3.5 py-2.5 rounded-lg border border-amber-200">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="animate-pulse">⏳</span>
                    <span>Diwali Special Offer Expires In:</span>
                  </span>
                  <span className="font-bold font-mono bg-white px-2.5 py-1 rounded shadow-sm text-amber-800 text-xs border border-amber-200">
                    {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
                  </span>
                </div>

                <button 
                  onClick={handleShopNow}
                  className="w-full bg-gradient-to-r from-[#991b1b] to-[#b91c1c] text-white py-3.5 md:py-4 rounded-lg text-xs md:text-sm uppercase tracking-[0.2em] hover:from-[#7f1d1d] hover:to-[#991b1b] transition-all font-semibold shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group"
                >
                  <span>Claim 20% OFF & Shop Diwali Edit</span>
                  <span className="transform group-hover:translate-x-1.5 transition-transform font-sans">→</span>
                </button>
                
                <div className="flex items-center justify-between pt-1 text-[10px] md:text-xs text-gray-500">
                  <span className="flex items-center gap-1 text-green-700 font-medium">
                    <Check size={12} className="text-green-600" /> Surat Authentic Quality
                  </span>
                  <button onClick={handleClose} className="underline hover:text-gray-800 transition-colors">
                    Continue to website
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

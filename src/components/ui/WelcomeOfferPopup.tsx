'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Gift, Copy, Check } from 'lucide-react';
import Image from 'next/image';

export default function WelcomeOfferPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ minutes: 14, seconds: 53 });

  useEffect(() => {
    // Check if user has already seen the popup
    const hasSeenPopup = localStorage.getItem('hasSeenWelcomePopup');
    
    if (!hasSeenPopup) {
      // Show popup after 3 seconds of entering the site
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000);
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
    localStorage.setItem('hasSeenWelcomePopup', 'true');
  };

  const copyPromoCode = () => {
    navigator.clipboard.writeText('ROYAL15');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto no-scrollbar bg-background rounded-sm shadow-2xl flex flex-col md:flex-row z-10"
          >
            {/* Close Button - Top Right */}
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 md:top-4 md:right-4 z-20 p-2 bg-white/50 backdrop-blur-md rounded-full hover:bg-white/80 transition-colors"
            >
              <X size={16} className="text-foreground" />
            </button>

            {/* Left Image Section */}
            <div className="relative w-full md:w-5/12 py-10 md:py-0 md:h-auto bg-[#4a3424] overflow-hidden flex flex-col items-center justify-center p-6 md:p-8 text-white text-center shrink-0">
              {/* Optional: Add a real background image here if you have one, currently using rich dark brown */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#C4A47C] to-transparent"></div>
              
              <div className="relative z-10">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-[#C4A47C] flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <Gift size={18} className="text-[#C4A47C]" />
                </div>
                <div className="uppercase tracking-[0.2em] text-[10px] md:text-xs mb-1 md:mb-2 text-[#C4A47C] font-semibold">Limited Time Gift</div>
                <h3 className="font-serif text-2xl md:text-4xl mb-2 md:mb-4">FLAT 15% OFF</h3>
                <p className="text-xs md:text-sm text-white/80 font-light hidden md:block">On All Premium Designer Collections</p>
              </div>
            </div>

            {/* Right Content Section */}
            <div className="w-full md:w-7/12 p-6 md:p-12 flex flex-col justify-center bg-[#F5F2EB]">
              <div className="flex items-center gap-2 text-accent text-[10px] md:text-xs font-bold tracking-widest uppercase mb-3 md:mb-4">
                <span className="w-4 h-[1px] bg-accent"></span>
                Welcome Patron Offer
              </div>
              
              <h2 className="font-serif text-2xl md:text-4xl text-foreground mb-3 md:mb-4">
                Unlock Your Exclusive Royal Discount
              </h2>
              
              <p className="text-foreground/70 text-xs md:text-sm mb-6 md:mb-8 leading-relaxed">
                Enjoy an extra 15% OFF + Free Insured Shipping across India on your order today! Elevate your style with Vastra Aura.
              </p>

              {/* Promo Code Box */}
              <div className="border border-accent/30 border-dashed rounded p-3 md:p-4 mb-4 md:mb-6 relative bg-white/50">
                <div className="text-[9px] md:text-[10px] uppercase tracking-widest text-foreground/60 font-semibold mb-1 md:mb-2">
                  Use Promo Code at Checkout:
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-serif text-lg md:text-xl font-bold tracking-wider text-foreground">
                    <span className="text-accent">🏷️</span> ROYAL15
                  </div>
                  <button 
                    onClick={copyPromoCode}
                    className="flex items-center gap-2 bg-accent text-white px-3 md:px-4 py-2 text-[10px] md:text-xs uppercase tracking-wider font-semibold hover:bg-accent/90 transition-colors"
                  >
                    {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy Code</>}
                  </button>
                </div>
              </div>

              {/* Timer & CTA */}
              <div className="flex flex-col gap-3 md:gap-4">
                <div className="flex flex-wrap md:flex-nowrap items-center gap-2 text-[10px] md:text-sm text-foreground/80 bg-accent/10 px-3 py-2 md:px-4 md:py-3 rounded border border-accent/20">
                  <span className="animate-pulse">⏳</span>
                  <span>Special Offer Expires In:</span>
                  <span className="ml-auto font-bold font-mono bg-white px-2 py-1 rounded shadow-sm text-accent">
                    {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s
                  </span>
                </div>

                <button 
                  onClick={handleClose}
                  className="w-full bg-accent text-white py-3 md:py-4 text-[10px] md:text-sm uppercase tracking-[0.2em] hover:bg-accent/90 transition-colors font-medium flex items-center justify-center gap-2 group"
                >
                  Shop Now & Claim 15% OFF
                  <span className="transform group-hover:translate-x-1 transition-transform">→</span>
                </button>
                
                <div className="flex items-center justify-between mt-2 text-[9px] md:text-xs text-foreground/50">
                  <span className="flex items-center gap-1"><Check size={10} className="text-green-600" /> 100% Premium Quality</span>
                  <button onClick={handleClose} className="underline hover:text-foreground transition-colors">
                    No thanks, I'll pay full price
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

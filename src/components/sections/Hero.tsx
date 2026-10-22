'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useStore } from '@/store/useStore';

gsap.registerPlugin(ScrollTrigger);

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRefs = useRef<HTMLHeadingElement[]>([]);
  const { setCursorType } = useStore();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Initial Page Load Animations
      const tl = gsap.timeline();

      // Background image slowly reveals using clip-path and zooms out
      tl.fromTo(
        imageRef.current,
        { clipPath: 'inset(100% 0 0 0)', scale: 1.08 },
        { clipPath: 'inset(0% 0 0 0)', scale: 1, duration: 1.8, ease: 'power4.inOut' }
      );

      // Heading letters/lines reveal upward
      tl.from(
        textRefs.current,
        { y: 100, opacity: 0, duration: 1.2, stagger: 0.2, ease: 'power3.out' },
        '-=1'
      );

      // Supporting text and CTA fade upward
      tl.from(
        '.hero-sub',
        { y: 20, opacity: 0, duration: 1, stagger: 0.2, ease: 'power2.out' },
        '-=0.8'
      );

      // 2. Scroll Animations
      // When scrolling down, the video will scale up and fade out slightly, while text moves up faster
      gsap.to(imageRef.current, {
        yPercent: 40,
        scale: 1.15,
        opacity: 0.4,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1, // Smooth scrubbing
        },
      });

      // Text parallax effect
      gsap.to('.hero-text-container', {
        yPercent: -50,
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative h-screen w-full overflow-hidden bg-background">
      {/* Background Video Container */}
      <div 
        ref={imageRef} 
        className="absolute inset-0 w-full h-[120%] -top-[10%] bg-black"
      >
        <video 
          autoPlay 
          loop 
          muted 
          playsInline
          poster="/images/hero.jpg"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        >
          {/* Local motion graphic video */}
          <source src="/videos/hero-motion.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" /> {/* Dark gradient overlay for cinematic feel */}
      </div>

      {/* Content */}
      <div className="hero-text-container relative z-10 h-full container mx-auto px-6 flex flex-col justify-center items-center text-center text-white pt-24">
        <div className="hero-sub inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs tracking-[0.25em] uppercase mb-6 font-semibold backdrop-blur-md shadow-[0_0_20px_rgba(251,191,36,0.25)]">
          <span>🪔</span>
          <span>DIWALI FESTIVE EDIT 2026</span>
          <span>🪔</span>
        </div>
        
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[9.5rem] font-serif leading-none mb-6 overflow-hidden drop-shadow-2xl">
          <span className="sr-only">Vastra Aura — Luxury Designer 3-Piece Suits, Coord Sets, Short Kurtis & Ethnic Fashion Surat</span>
          <div ref={(el) => { if (el) textRefs.current[0] = el; }}>FESTIVE</div>
          <div ref={(el) => { if (el) textRefs.current[1] = el; }} className="italic font-light text-amber-200">SPLENDOR</div>
        </h1>

        <p className="hero-sub text-base sm:text-lg md:text-xl font-serif italic mb-8 opacity-90 max-w-2xl text-amber-50/90">
          Surat&apos;s premier destination for handcrafted 3-Piece Suits, Designer Coord Sets &amp; Breathable Short Kurtis for your brightest Diwali celebrations.
        </p>

        <div className="hero-sub flex flex-col sm:flex-row items-center gap-4 mb-8">
          <Link 
            href="/shop?category=3-piece-suit"
            className="group relative overflow-hidden px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-500 text-neutral-950 font-bold tracking-widest text-xs sm:text-sm uppercase transition-all shadow-[0_0_25px_rgba(251,191,36,0.4)] hover:scale-105 inline-block rounded-sm"
            onMouseEnter={() => setCursorType('MAGNETIC')}
            onMouseLeave={() => setCursorType('DEFAULT')}
          >
            <span className="relative z-10 flex items-center gap-2">
              Shop Diwali Special Edit 
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </span>
          </Link>
          <Link 
            href="/shop"
            className="px-6 py-4 border border-white/40 hover:border-amber-300 text-white hover:text-amber-300 text-xs sm:text-sm tracking-widest uppercase transition-colors rounded-sm backdrop-blur-sm"
            onMouseEnter={() => setCursorType('MAGNETIC')}
            onMouseLeave={() => setCursorType('DEFAULT')}
          >
            All Collections
          </Link>
        </div>

        {/* Quick Category Festive Highlights */}
        <div className="hero-sub hidden sm:flex items-center gap-3 text-xs tracking-wider">
          <span className="text-amber-400/90 font-medium uppercase text-[10px] tracking-widest">Trending Now:</span>
          <Link 
            href="/shop?category=3-piece-suit" 
            className="px-3 py-1 rounded-full bg-white/10 hover:bg-amber-400 hover:text-black border border-white/20 transition-all text-white/90 text-[11px]"
          >
            ✨ 3-Piece Suits (From ₹1,499)
          </Link>
          <Link 
            href="/shop?category=coord-sets" 
            className="px-3 py-1 rounded-full bg-white/10 hover:bg-amber-400 hover:text-black border border-white/20 transition-all text-white/90 text-[11px]"
          >
            ✨ 2-Piece Coord Sets (From ₹999)
          </Link>
          <Link 
            href="/shop?category=short-kurtis" 
            className="px-3 py-1 rounded-full bg-white/10 hover:bg-amber-400 hover:text-black border border-white/20 transition-all text-white/90 text-[11px]"
          >
            ✨ Short Kurtis (From ₹599)
          </Link>
        </div>
      </div>
    </section>
  );
}

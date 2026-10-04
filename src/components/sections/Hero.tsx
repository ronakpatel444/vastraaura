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
        <p className="hero-sub text-sm tracking-[0.3em] uppercase mb-6 font-medium text-accent">Vastra Aura Exclusive</p>
        
        <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-serif leading-none mb-8 overflow-hidden drop-shadow-2xl">
          <div ref={(el) => { if (el) textRefs.current[0] = el; }}>TIMELESS</div>
          <div ref={(el) => { if (el) textRefs.current[1] = el; }} className="italic font-light">ELEGANCE</div>
        </h1>

        <p className="hero-sub text-lg md:text-xl font-serif italic mb-12 opacity-90 max-w-lg">
          Rooted in tradition, crafted for today.
        </p>

        <Link 
          href="/shop"
          className="hero-sub group relative overflow-hidden px-8 py-4 bg-background text-foreground tracking-widest text-sm uppercase transition-colors inline-block"
          onMouseEnter={() => setCursorType('MAGNETIC')}
          onMouseLeave={() => setCursorType('DEFAULT')}
        >
          <span className="relative z-10 flex items-center gap-2">
            Explore Collection 
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </span>
          <div className="absolute inset-0 bg-accent transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-500 ease-out z-0" />
        </Link>
      </div>
    </section>
  );
}

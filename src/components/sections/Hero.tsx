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
      gsap.to(imageRef.current, {
        yPercent: 30,
        scale: 1.05,
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative h-screen w-full overflow-hidden bg-background">
      {/* Background Image Container */}
      <div 
        ref={imageRef} 
        className="absolute inset-0 w-full h-[120%] -top-[10%]"
      >
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: 'url("/images/hero.jpg")' }}
        />
        <div className="absolute inset-0 bg-black/30" /> {/* Dark overlay for text readability */}
      </div>

      {/* Content */}
      <div className="relative z-10 h-full container mx-auto px-6 flex flex-col justify-center items-center text-center text-white pt-24">
        <p className="hero-sub text-sm tracking-[0.3em] uppercase mb-6 font-medium">Traditional Wear</p>
        
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif leading-none mb-8 overflow-hidden">
          <div ref={(el) => { if (el) textRefs.current[0] = el; }}>TIMELESS</div>
          <div ref={(el) => { if (el) textRefs.current[1] = el; }} className="italic">ELEGANCE</div>
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

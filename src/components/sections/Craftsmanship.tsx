'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useStore } from '@/store/useStore';
import { Play } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function Craftsmanship() {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const { setCursorType } = useStore();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Parallax and zoom effect on background
      gsap.fromTo(bgRef.current,
        { scale: 1 },
        {
          scale: 1.15,
          yPercent: 10,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          }
        }
      );

      // Text reveal from behind image
      gsap.fromTo(textRef.current,
        { y: 150, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 60%',
            end: 'top 20%',
            scrub: 1,
          }
        }
      );
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative h-[80vh] w-full overflow-hidden flex items-center justify-center">
      {/* Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <div 
          ref={bgRef}
          className="w-full h-full bg-cover bg-center origin-center"
          style={{ backgroundImage: 'url("/images/craftsmanship-bg.jpg")' }}
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div 
        ref={textRef} 
        className="relative z-10 flex flex-col items-center text-white mix-blend-difference"
      >
        <h2 className="text-6xl md:text-8xl lg:text-9xl font-serif text-center leading-none mb-12">
          HANDCRAFTED<br />
          <span className="italic">WITH LOVE</span>
        </h2>

        <button 
          className="group flex items-center gap-4 border border-white/30 rounded-full pl-6 pr-2 py-2 hover:bg-white hover:text-black transition-colors duration-500"
          onMouseEnter={() => setCursorType('MAGNETIC')}
          onMouseLeave={() => setCursorType('DEFAULT')}
        >
          <span className="text-xs uppercase tracking-widest">Watch Our Story</span>
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-colors">
            <Play className="w-4 h-4 ml-1" />
          </div>
        </button>
      </div>
    </section>
  );
}

'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useStore } from '@/store/useStore';
import Image from 'next/image';

gsap.registerPlugin(ScrollTrigger);

// Static array removed in favor of live data

export default function HorizontalScroll() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { setCursorType, adminProducts } = useStore();
  
  const liveProducts = adminProducts.filter(p => p.status !== 'Out of Stock').slice(0, 5);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const container = containerRef.current;
      if (!container) return;
      
      const totalWidth = container.scrollWidth - window.innerWidth;
      
      gsap.to(container, {
        x: -totalWidth,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: true,
          scrub: 1,
          end: () => `+=${totalWidth}`,
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div>
      <section ref={sectionRef} className="h-screen w-full bg-foreground text-background overflow-hidden flex flex-col justify-center relative z-30">
        <div className="absolute top-16 md:top-24 left-6 md:left-24 z-10 mix-blend-difference text-white max-w-[80vw]">
          <h2 className="text-3xl md:text-6xl font-serif tracking-widest uppercase opacity-90">Curated Edit</h2>
        </div>

        <div ref={containerRef} className="flex h-[55vh] md:h-[60vh] px-6 md:px-24 gap-8 md:gap-12 w-max items-center mt-20 md:mt-12">
          {liveProducts.map((product, index) => (
            <div 
              key={product.id} 
              className="h-full aspect-[3/4] relative group"
              onMouseEnter={() => setCursorType('VIEW')}
              onMouseLeave={() => setCursorType('DEFAULT')}
            >
              <div className="absolute -top-12 left-0 text-sm tracking-widest opacity-50 font-serif">
                0{index + 1} / 0{liveProducts.length}
              </div>
              <div className="w-full h-full overflow-hidden">
                <div 
                  className="w-full h-full bg-cover bg-center transform transition-transform duration-1000 group-hover:scale-110"
                  style={{ backgroundImage: `url(${product.image})` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

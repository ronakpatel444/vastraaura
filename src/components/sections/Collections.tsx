'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useStore } from '@/store/useStore';
import Link from 'next/link';
import { formatCssUrl } from '@/lib/image';

gsap.registerPlugin(ScrollTrigger);

const collections = [
  {
    id: '3-piece-suit',
    title: '3 Piece Suit',
    badge: '🪔 Diwali Special',
    image: '/images/3%20Pis%20suit/D3P_10/1.png',
    link: '/shop?category=3-piece-suit'
  },
  {
    id: 'coord-sets',
    title: 'Coord Sets (2-Piece)',
    badge: '✨ Festive Trending',
    image: '/images/Coord%20set%20-%202%20piece/DC-104/D104.png',
    link: '/shop?category=coord-sets'
  },
  {
    id: 'short-kurtis',
    title: 'Short Kurtis',
    badge: '🌸 Cotton Print',
    image: '/images/Short%20Kurti/DK-201/DK201_1.png',
    link: '/shop?category=short-kurtis'
  },
  {
    id: 1,
    title: 'Chaniya Choli',
    badge: 'Royal Heritage',
    image: '/api/collection-image?name=collection-chaniya-choli',
    link: '/shop?category=chaniya-choli'
  },
  {
    id: 'lehenga',
    title: 'Lehengas',
    image: '/api/collection-image?name=collection-new',
    link: '/shop?category=lehenga',
  },
  {
    id: 3,
    title: 'Kurta Sets',
    image: '/api/collection-image?name=collection-kurta',
    link: '/shop?category=kurta-sets'
  },
  {
    id: 'saree',
    title: 'Sarees',
    image: '/api/collection-image?name=collection-saree',
    link: '/shop?category=saree'
  },
  {
    id: 'casual',
    title: 'Casual Wear',
    image: '/api/collection-image?name=collection-casual',
    link: '/shop?category=casual'
  },
  {
    id: 'kids-wear',
    title: 'Kids Collection',
    image: '/api/collection-image?name=collection-kids',
    link: '/shop?category=kids-wear'
  }
];

export default function Collections() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setCursorType } = useStore();

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.category-card');
      
      gsap.from(cards, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 85%',
        }
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-20 px-4 md:px-8 bg-[#F5F2EB]">
      <div className="max-w-[1000px] mx-auto">
        <div className="text-center mb-12">
          <div className="text-[10px] uppercase tracking-[0.25em] text-accent font-bold mb-2">
            🪔 Curated Festive Edits
          </div>
          <h2 className="text-3xl md:text-4xl font-serif tracking-wide text-foreground mb-4">
            Shop By Collection
          </h2>
          <p className="text-[10px] uppercase tracking-widest text-foreground/60 max-w-md mx-auto">
            Discover our celebrated 3-Piece Suits, 2-Piece Coord Sets &amp; Artisanal Short Kurtis
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-10 md:gap-x-12 md:gap-y-16">
          {collections.map((collection, index) => (
            <Link 
              key={index}
              href={collection.link || '/'}
              className="category-card group flex flex-col items-center"
              onMouseEnter={() => setCursorType('VIEW')}
              onMouseLeave={() => setCursorType('DEFAULT')}
            >
              {/* Image Container */}
              <div className="w-full relative aspect-[4/5] overflow-hidden mb-4 bg-white/50 shadow-sm group-hover:shadow-md transition-shadow">
                <div 
                  className="w-full h-full bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                  style={{ backgroundImage: `url("${formatCssUrl(collection.image)}")` }}
                />

                {collection.badge && (
                  <div className="absolute top-2 left-2 z-10 bg-amber-600/90 text-white text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded shadow">
                    {collection.badge}
                  </div>
                )}
              </div>
              
              {/* Text Container */}
              <div className="w-full flex justify-between items-center px-1">
                <h3 className="text-sm font-serif tracking-wide text-foreground group-hover:text-accent transition-colors font-medium">
                  {collection.title}
                </h3>
                <span className="text-[9px] uppercase tracking-widest text-foreground/40 group-hover:text-accent transition-colors flex items-center gap-1">
                  Explore <span className="text-[12px] leading-none">→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

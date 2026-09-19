'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useStore } from '@/store/useStore';
import Link from 'next/link';

gsap.registerPlugin(ScrollTrigger);

const collections = [
  {
    title: 'Chaniya Choli',
    description: 'Vibrant colors and intricate mirror work for the perfect festive Navratri look.',
    image: '/api/collection-image?name=collection-chaniya-choli',
    link: '/shop?category=chaniya-choli',
    align: 'left'
  },
  {
    id: 2,
    title: 'Lehenga',
    description: 'Timeless elegance crafted for your most memorable moments.',
    image: '/api/collection-image?name=collection-new',
    link: '/shop?category=lehenga',
    align: 'right'
  },
  {
    title: 'Kurta Sets',
    description: 'Contemporary grace meets traditional roots. Perfect for everyday luxury.',
    image: '/api/collection-image?name=collection-kurta',
    link: '/shop?category=kurta-sets',
    align: 'left'
  },
  {
    title: 'Saree',
    description: 'Drape yourself in the elegance of six yards of pure grace. Timeless Indian luxury.',
    image: '/api/collection-image?name=collection-saree',
    link: '/shop?category=saree',
    align: 'right'
  },
  {
    title: 'Casual',
    description: 'Effortless style for your everyday moments. Comfort meets premium aesthetics.',
    image: '/api/collection-image?name=collection-casual',
    link: '/shop?category=casual',
    align: 'left'
  },
  {
    title: 'Kids Wear',
    description: 'Adorable traditional wear for your little ones. Specially crafted kids lehengas and ethnic sets.',
    image: '/api/collection-image?name=collection-kids',
    link: '/shop?category=kids-wear',
    align: 'right'
  }
];

export default function CollectionsPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setCursorType } = useStore();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header Animation
      gsap.from('.header-text', {
        y: 100,
        opacity: 0,
        duration: 1.5,
        ease: 'power4.out'
      });

      // Collections Animation
      gsap.utils.toArray('.collection-section').forEach((section: any, i) => {
        gsap.from(section, {
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
          },
          y: 100,
          opacity: 0,
          duration: 1.2,
          ease: 'power3.out'
        });
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-background pt-32 pb-24">
      {/* Header */}
      <div className="container mx-auto px-6 mb-16 md:mb-24 text-center overflow-hidden flex flex-col items-center">
        <h1 className="header-text text-4xl sm:text-5xl md:text-8xl font-serif tracking-widest mb-6 pl-[0.1em]">COLLECTIONS</h1>
        <p className="header-text text-xs sm:text-sm uppercase tracking-widest opacity-60 pl-[0.1em]">Discover the heritage of Rangrez</p>
      </div>

      {/* Directory */}
      <div className="container mx-auto px-6 flex flex-col gap-32">
        {collections.map((collection, index) => (
          <div 
            key={index} 
            className={`collection-section flex flex-col ${collection.align === 'right' ? 'md:flex-row-reverse' : 'md:flex-row'} items-center gap-12 md:gap-24`}
          >
            {/* Image */}
            <div className="w-full md:w-1/2 aspect-[4/5] relative group overflow-hidden">
              <Link 
                href={collection.link}
                onMouseEnter={() => setCursorType('VIEW')}
                onMouseLeave={() => setCursorType('DEFAULT')}
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center transform transition-transform duration-1000 ease-out group-hover:scale-105"
                  style={{ backgroundImage: `url(${collection.image})` }}
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-700" />
              </Link>
            </div>

            {/* Text */}
            <div className={`w-full md:w-1/2 flex flex-col ${collection.align === 'right' ? 'md:items-end md:text-right' : 'md:items-start md:text-left'} text-center`}>
              <span className="text-xs uppercase tracking-widest text-accent mb-4">Collection {String(index + 1).padStart(2, '0')}</span>
              <h2 className="text-4xl md:text-6xl font-serif mb-6">{collection.title}</h2>
              <p className="text-sm opacity-70 leading-relaxed max-w-md mb-10">{collection.description}</p>
              <Link 
                href={collection.link}
                className="group flex items-center gap-4 text-xs uppercase tracking-widest border-b border-foreground/30 pb-2 hover:border-accent hover:text-accent transition-colors"
                onMouseEnter={() => setCursorType('MAGNETIC')}
                onMouseLeave={() => setCursorType('DEFAULT')}
              >
                Explore Collection
                <span className="transform transition-transform duration-300 group-hover:translate-x-2">→</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

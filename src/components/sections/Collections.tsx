'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useStore } from '@/store/useStore';
import Image from 'next/image';
import Link from 'next/link';

gsap.registerPlugin(ScrollTrigger);

const collections = [
  {
    id: 1,
    title: 'Chaniya Choli',
    description: 'Vibrant colors and intricate mirror work for the perfect festive look.',
    image: '/api/collection-image?name=collection-chaniya-choli',
    link: '/shop?category=chaniya-choli'
  },
  {
    id: 'lehenga',
    title: 'Lehenga',
    description: 'The epitome of bridal and festive grandeur.',
    image: '/api/collection-image?name=collection-new',
    link: '/shop?category=lehenga',
  },
  {
    id: 3,
    title: 'Kurta Sets',
    description: 'Contemporary grace meets traditional roots.',
    image: '/api/collection-image?name=collection-kurta',
    link: '/shop?category=kurta-sets'
  },

  {
    id: 'saree',
    title: 'Saree',
    description: 'Drape yourself in the elegance of six yards of pure grace.',
    image: '/api/collection-image?name=collection-saree',
    link: '/shop?category=saree'
  },
  {
    id: 'casual',
    title: 'Casual',
    description: 'Effortless style for your everyday moments.',
    image: '/api/collection-image?name=collection-casual',
    link: '/shop?category=casual'
  },
  {
    id: 'kids-wear',
    title: 'Kids Wear',
    description: 'Adorable traditional wear for your little ones.',
    image: '/api/collection-image?name=collection-kids',
    link: '/shop?category=kids-wear'
  }
];

export default function Collections() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setCursorType } = useStore();

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.collection-card');
      
      gsap.from(cards, {
        y: 100,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 80%',
        }
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-32 px-6 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-serif tracking-wide">Explore Our Collections</h2>
          <div className="w-16 h-px bg-accent mx-auto mt-8" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {collections.map((collection, index) => (
            <Link 
              key={index}
              href={collection.link || '/'}
              className="collection-card group relative block overflow-hidden aspect-[3/4]"
              onMouseEnter={() => setCursorType('VIEW')}
              onMouseLeave={() => setCursorType('DEFAULT')}
            >
              {/* Image with slow zoom on hover */}
              <div className="absolute inset-0 w-full h-full transform transition-transform duration-900 ease-out group-hover:scale-105">
                <div 
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${collection.image})` }}
                />
              </div>
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-700" />
              
              {/* Content */}
              <div className="absolute inset-0 p-8 md:p-12 flex flex-col justify-end text-white">
                <div className="flex justify-between items-end transform transition-transform duration-700 ease-out translate-y-4 group-hover:translate-y-0">
                  <h3 className="text-3xl md:text-4xl font-serif tracking-widest">{collection.title}</h3>
                  <div className="w-10 h-10 border border-white/30 rounded-full flex items-center justify-center -rotate-45 group-hover:rotate-0 group-hover:border-white transition-all duration-700 ease-out">
                    →
                  </div>
                </div>
                {/* Animated Line */}
                <div className="w-0 h-px bg-white/50 mt-6 group-hover:w-full transition-all duration-700 ease-out" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

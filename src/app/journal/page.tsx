'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useStore } from '@/store/useStore';
import Link from 'next/link';

const articles = [
  {
    title: 'The Art of Mirror Work',
    category: 'CRAFTSMANSHIP',
    date: 'Oct 12, 2026',
    image: '/images/craftsmanship-bg.jpg',
    excerpt: 'Explore the ancient origins of Gujarati mirror embroidery and how our master artisans keep the tradition alive today.',
  },
  {
    title: 'Navratri 2026: The Ultimate Style Guide',
    category: 'STYLE',
    date: 'Sep 28, 2026',
    image: '/images/hero.jpg',
    excerpt: 'From vibrant Chaniya Cholis to elegant modern twists, discover how to style your Navratri nights this season.',
  },
  {
    title: 'A Journey Through Rajasthan',
    category: 'HERITAGE',
    date: 'Aug 15, 2026',
    image: '/images/heritage-main.jpg',
    excerpt: 'We traveled through the heart of Rajasthan to find inspiration for our upcoming Royal Heritage collection.',
  },
  {
    title: 'Preserving the Loom',
    category: 'SUSTAINABILITY',
    date: 'Jul 04, 2026',
    image: '/images/collection-new.jpg',
    excerpt: 'Why sustainable practices are at the core of everything we do at Rangrez.',
  }
];

export default function JournalPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setCursorType } = useStore();

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header Animation
      gsap.from('.header-text', {
        y: 50,
        opacity: 0,
        duration: 1.2,
        ease: 'power3.out',
        stagger: 0.15
      });

      // Articles Animation
      gsap.from('.article-card', {
        y: 60,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: 'power2.out',
        delay: 0.4
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-background pt-32 pb-24">
      {/* Header */}
      <div className="container mx-auto px-6 mb-24 text-center overflow-hidden border-b border-foreground/10 pb-12">
        <h1 className="header-text text-5xl md:text-8xl font-serif tracking-widest mb-6">JOURNAL</h1>
        <p className="header-text text-sm uppercase tracking-widest opacity-60">Stories of style, heritage, and craft</p>
      </div>

      {/* Articles Grid */}
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-24">
          {articles.map((article, index) => (
            <article 
              key={index} 
              className={`article-card flex flex-col group ${index % 2 !== 0 ? 'md:mt-24' : ''}`}
            >
              {/* Image */}
              <Link 
                href="#"
                className="w-full aspect-[4/3] overflow-hidden mb-8 relative"
                onMouseEnter={() => setCursorType('VIEW')}
                onMouseLeave={() => setCursorType('DEFAULT')}
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center transform transition-transform duration-1000 ease-out group-hover:scale-105"
                  style={{ backgroundImage: `url(${article.image})` }}
                />
              </Link>
              
              {/* Meta */}
              <div className="flex items-center gap-4 text-xs uppercase tracking-widest mb-4">
                <span className="text-accent">{article.category}</span>
                <span className="w-1 h-1 rounded-full bg-foreground/30" />
                <span className="opacity-50">{article.date}</span>
              </div>
              
              {/* Title & Excerpt */}
              <Link 
                href="#" 
                className="mb-4 inline-block"
                onMouseEnter={() => setCursorType('MAGNETIC')}
                onMouseLeave={() => setCursorType('DEFAULT')}
              >
                <h2 className="text-3xl md:text-4xl font-serif leading-tight group-hover:text-accent transition-colors">
                  {article.title}
                </h2>
              </Link>
              <p className="text-sm opacity-70 leading-relaxed max-w-lg mb-6">
                {article.excerpt}
              </p>
              
              {/* Read More */}
              <Link 
                href="#"
                className="text-xs uppercase tracking-widest border-b border-foreground/30 pb-1 w-max hover:border-accent hover:text-accent transition-colors"
                onMouseEnter={() => setCursorType('MAGNETIC')}
                onMouseLeave={() => setCursorType('DEFAULT')}
              >
                Read Article
              </Link>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

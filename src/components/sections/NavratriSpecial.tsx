'use client';

import { useStore } from '@/store/useStore';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function NavratriSpecial() {
  const { setCursorType } = useStore();

  return (
    <section className="py-16 md:py-32 px-4 md:px-6 bg-foreground text-background overflow-hidden">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-6 md:gap-8">
          <div>
            <h2 className="text-xs md:text-sm tracking-[0.3em] uppercase text-accent mb-4">Festive Edit</h2>
            <h3 className="text-3xl md:text-6xl font-serif leading-tight">NAVRATRI SPECIAL</h3>
          </div>
          <div className="flex gap-4">
            <button 
              className="w-12 h-12 border border-background/20 rounded-full flex items-center justify-center hover:bg-background hover:text-foreground transition-colors"
              onMouseEnter={() => setCursorType('MAGNETIC')}
              onMouseLeave={() => setCursorType('DEFAULT')}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button 
              className="w-12 h-12 border border-background/20 rounded-full flex items-center justify-center hover:bg-background hover:text-foreground transition-colors"
              onMouseEnter={() => setCursorType('MAGNETIC')}
              onMouseLeave={() => setCursorType('DEFAULT')}
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Note: In a full build, this would be a Swiper carousel. Using grid for layout representation. */}
        <div className="flex overflow-x-auto no-scrollbar gap-8 snap-x snap-mandatory">
          {[
            { id: 1, title: 'Chaniya Choli', image: '/images/collection-chaniya-choli.jpeg', link: '/shop?category=chaniya-choli' },
            { id: 2, title: 'Designer Lehenga', image: '/images/collection-lehenga.jpg', link: '/shop?category=lehenga' },
            { id: 3, title: 'Festive Sarees', image: '/images/collection-saree.jpg', link: '/shop?category=saree' },
            { id: 4, title: 'Kurta Sets', image: '/images/collection-kurta.jpeg', link: '/shop?category=kurta-sets' }
          ].map((item) => (
            <Link 
              key={item.id} 
              href={item.link}
              className="min-w-[85vw] md:min-w-[40vw] lg:min-w-[30vw] aspect-[4/5] relative group snap-center overflow-hidden"
              onMouseEnter={() => setCursorType('VIEW')}
              onMouseLeave={() => setCursorType('DEFAULT')}
            >
              <div 
                className="w-full h-full bg-cover bg-center transform transition-transform duration-1000 ease-out group-hover:scale-105"
                style={{ backgroundImage: `url(${item.image})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
              
              <div className="absolute bottom-0 left-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 text-white">
                <h4 className="text-2xl font-serif mb-2">{item.title}</h4>
                <p className="text-sm opacity-80 uppercase tracking-widest flex items-center gap-2">
                  Shop Now <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

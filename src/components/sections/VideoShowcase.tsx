'use client';

import { useStore } from '@/store/useStore';
import { Play } from 'lucide-react';
import Link from 'next/link';

// Placeholder videos - You can replace these URLs with your actual product videos or Instagram Reel links later!
const videos = [
  {
    id: 1,
    title: 'The Navratri Edit',
    category: 'Chaniya Choli',
    videoUrl: 'https://cdn.pixabay.com/video/2021/08/04/83863-584742722_tiny.mp4',
    link: '/shop?category=chaniya-choli'
  },
  {
    id: 2,
    title: 'Elegant Drapes',
    category: 'Saree',
    videoUrl: 'https://cdn.pixabay.com/video/2021/06/23/78643-568322629_tiny.mp4',
    link: '/shop?category=saree'
  },
  {
    id: 3,
    title: 'Festive Ready',
    category: 'Lehenga',
    videoUrl: 'https://cdn.pixabay.com/video/2022/10/24/136275-764359419_tiny.mp4',
    link: '/shop?category=lehenga'
  },
  {
    id: 4,
    title: 'Modern Classic',
    category: 'Kurta Sets',
    videoUrl: 'https://cdn.pixabay.com/video/2021/08/17/85375-589578168_tiny.mp4',
    link: '/shop?category=kurta-sets'
  }
];

export default function VideoShowcase() {
  const { setCursorType } = useStore();

  return (
    <section className="py-16 md:py-32 px-4 md:px-6 bg-background overflow-hidden border-t border-foreground/10">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-16 gap-6">
          <div>
            <h2 className="text-xs md:text-sm tracking-[0.3em] uppercase text-accent mb-4">See It In Motion</h2>
            <h3 className="text-3xl md:text-5xl lg:text-6xl font-serif leading-tight">STYLE IN MOTION</h3>
          </div>
          <Link 
            href="/shop"
            className="text-sm tracking-widest uppercase border-b border-foreground pb-1 hover:text-accent hover:border-accent transition-colors"
            onMouseEnter={() => setCursorType('VIEW')}
            onMouseLeave={() => setCursorType('DEFAULT')}
          >
            Explore All
          </Link>
        </div>

        <div className="flex overflow-x-auto no-scrollbar gap-6 md:gap-8 pb-8 snap-x snap-mandatory">
          {videos.map((video) => (
            <div 
              key={video.id}
              className="min-w-[70vw] sm:min-w-[45vw] md:min-w-[30vw] lg:min-w-[22vw] aspect-[9/16] relative group snap-center rounded-2xl overflow-hidden cursor-pointer"
              onMouseEnter={() => setCursorType('VIEW')}
              onMouseLeave={() => setCursorType('DEFAULT')}
            >
              {/* Auto-playing silent background video */}
              <video 
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-full h-full object-cover transform transition-transform duration-1000 ease-out group-hover:scale-105"
              >
                <source src={video.videoUrl} type="video/mp4" />
              </video>
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-500" />
              
              {/* Play icon in center */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                 <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                    <Play className="w-6 h-6 text-white ml-1" />
                 </div>
              </div>

              {/* Bottom Content */}
              <div className="absolute bottom-0 left-0 p-6 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <span className="inline-block px-3 py-1 bg-accent text-white text-[10px] uppercase tracking-widest mb-3 rounded-full">
                  {video.category}
                </span>
                <h4 className="text-xl md:text-2xl font-serif text-white mb-4 leading-tight">{video.title}</h4>
                
                <Link 
                  href={video.link}
                  className="block w-full py-3 bg-white text-black text-center text-xs uppercase tracking-widest font-medium hover:bg-accent hover:text-white transition-colors rounded-lg opacity-0 group-hover:opacity-100"
                >
                  Shop This Look
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

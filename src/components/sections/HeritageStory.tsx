'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function HeritageStory() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mm = gsap.matchMedia();
    
    const ctx = gsap.context(() => {
      
      // Only pin the image on desktop (min-width: 768px)
      mm.add("(min-width: 768px)", () => {
        ScrollTrigger.create({
          trigger: containerRef.current,
          start: 'top top',
          end: 'bottom bottom',
          pin: imageRef.current,
          pinSpacing: false, 
          anticipatePin: 1,  
        });
      });

      // Text reveal (runs on all sizes)
      if (textRef.current) {
        const chars = textRef.current.children;
        gsap.from(chars, {
          y: 50,
          opacity: 0,
          duration: 1,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: textRef.current,
            start: 'top 80%',
          }
        });
      }

      // Decorative line growth (runs on all sizes)
      gsap.fromTo(lineRef.current, 
        { height: 0 },
        { 
          height: '100%',
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 50%',
            end: 'bottom 50%',
            scrub: true
          }
        }
      );
    }, containerRef);
    
    return () => {
      ctx.revert();
      mm.revert();
    };
  }, []);

  return (
    <section ref={containerRef} className="relative z-10 bg-background text-foreground py-32 px-6 min-h-[150vh]">
      <div className="container mx-auto flex flex-col md:flex-row gap-12 lg:gap-24 relative h-full">
        
        {/* Left Side (Pinned Image) */}
        <div className="w-full md:w-1/2 h-[70vh] relative">
          <div ref={imageRef} className="w-full h-full relative">
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: 'url("/images/heritage-main.jpg")' }}
              />
            {/* Small craftsmanship image floating */}
            <div className="absolute -bottom-12 -right-12 w-48 h-64 border-4 border-background hidden md:block">
               <div 
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=400&auto=format&fit=crop)' }}
                />
            </div>
          </div>
        </div>

        {/* Right Side (Scrolling Text) */}
        <div className="w-full md:w-1/2 flex flex-col justify-center relative pt-20 md:pt-0 pb-32">
          {/* Decorative Line */}
          <div className="absolute left-0 md:-left-12 top-0 bottom-0 w-px bg-foreground/10">
            <div ref={lineRef} className="w-full bg-accent" />
          </div>

          <h2 className="text-sm tracking-[0.3em] uppercase text-accent mb-8">Heritage</h2>
          
          <h3 ref={textRef} className="text-5xl lg:text-7xl font-serif mb-12 overflow-hidden leading-tight">
            <div>MORE THAN</div>
            <div className="italic">JUST CLOTHING</div>
          </h3>

          <p className="text-xl md:text-2xl font-serif italic opacity-80 max-w-md leading-relaxed text-balance mb-8">
            “Every piece tells a story of skilled artisans, rich fabrics and timeless traditions passed down through generations.”
          </p>
          
          <p className="text-sm opacity-60 max-w-md leading-loose">
            At RANGREZ, we preserve the intricate craftsmanship of India. From the vibrant Bandhani of Gujarat to the exquisite mirror work of Rajasthan, our collections are a homage to our roots.
          </p>
        </div>

      </div>
    </section>
  );
}

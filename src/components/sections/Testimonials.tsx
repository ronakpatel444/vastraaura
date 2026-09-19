'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useStore } from '@/store/useStore';

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    quote: "The craftsmanship is unparalleled. I felt like royalty wearing my RANGREZ Chaniya Choli for Navratri.",
    name: "Aanya Patel",
    location: "Mumbai",
  },
  {
    quote: "Absolutely stunning pieces. The attention to detail in the embroidery is simply breathtaking.",
    name: "Meera Shah",
    location: "Ahmedabad",
  },
  {
    quote: "A perfect blend of traditional roots and modern elegance. RANGREZ is my go-to for all festive wear.",
    name: "Riya Desai",
    location: "London",
  }
];

export default function Testimonials() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setCursorType } = useStore();

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray('.testimonial-card');
      
      gsap.from(cards, {
        y: 50,
        opacity: 0,
        duration: 1,
        stagger: 0.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 70%',
        }
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="py-16 md:py-32 px-4 md:px-6 bg-background text-foreground">
      <div className="container mx-auto">
        <div className="text-center mb-12 md:mb-20">
          <h2 className="text-xs md:text-sm tracking-[0.3em] uppercase text-accent mb-4">Customer Love</h2>
          <h3 className="text-3xl md:text-5xl font-serif">A LEGACY OF ELEGANCE</h3>
          <div className="w-16 h-px bg-accent mx-auto mt-6 md:mt-8" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {testimonials.map((t, i) => (
            <div 
              key={i} 
              className="testimonial-card group relative p-10 border border-foreground/10 hover:border-accent transition-colors duration-500 bg-white shadow-sm hover:shadow-xl hover:-translate-y-2 transform"
              onMouseEnter={() => setCursorType('MAGNETIC')}
              onMouseLeave={() => setCursorType('DEFAULT')}
            >
              <div className="text-5xl font-serif text-accent opacity-40 mb-6 group-hover:-translate-y-2 transition-transform duration-500">
                &ldquo;
              </div>
              <p className="font-serif italic text-lg leading-relaxed mb-8 opacity-80">
                {t.quote}
              </p>
              <div>
                <p className="text-sm uppercase tracking-widest font-medium mb-1">{t.name}</p>
                <p className="text-xs text-accent uppercase tracking-widest">{t.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

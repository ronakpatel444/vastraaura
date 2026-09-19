'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function AboutPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header Animation
      gsap.from('.header-text', {
        y: 100,
        opacity: 0,
        duration: 1.5,
        ease: 'power4.out',
        stagger: 0.2
      });

      // Sections Animation
      gsap.utils.toArray('.fade-up').forEach((section: any) => {
        gsap.from(section, {
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
          },
          y: 50,
          opacity: 0,
          duration: 1.2,
          ease: 'power3.out'
        });
      });
      
      // Parallax Image
      gsap.to('.parallax-img', {
        scrollTrigger: {
          trigger: '.parallax-container',
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
        y: 100,
        ease: 'none'
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-background pt-32 pb-24">
      {/* Hero Section */}
      <div className="container mx-auto px-6 text-center mb-32 overflow-hidden">
        <h1 className="header-text text-5xl md:text-8xl font-serif tracking-widest mb-6">OUR STORY</h1>
        <p className="header-text text-sm uppercase tracking-widest opacity-60 max-w-2xl mx-auto leading-relaxed">
          Rooted in tradition, crafted for the modern era. Vastra Aura is a celebration of India's rich textile heritage.
        </p>
      </div>

      {/* Cinematic Image */}
      <div className="w-full h-[60vh] md:h-[80vh] relative overflow-hidden parallax-container mb-32">
        <div 
          className="absolute inset-0 -top-24 -bottom-24 bg-cover bg-center parallax-img"
          style={{ backgroundImage: 'url("/images/heritage-main.jpg")' }}
        />
      </div>

      {/* Philosophy Section */}
      <div className="container mx-auto px-6 mb-32">
        <div className="max-w-4xl mx-auto text-center fade-up">
          <span className="text-xs uppercase tracking-widest text-accent mb-6 block">The Philosophy</span>
          <h2 className="text-3xl md:text-5xl font-serif leading-relaxed mb-8">
            "We believe that every thread tells a story. Our mission is to preserve the ancient art of Indian craftsmanship while redefining it for the contemporary wardrobe."
          </h2>
          <p className="text-sm opacity-70 leading-relaxed">
            Founded with a passion for authenticity, Vastra Aura works directly with master artisans across Gujarat and Rajasthan. 
            Each piece in our collection is a labor of love, taking weeks—sometimes months—to perfect.
          </p>
        </div>
      </div>

      {/* Details Grid */}
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-center">
        <div className="fade-up">
          <img src="/images/craftsmanship-bg.jpg" alt="Craftsmanship" className="w-full aspect-[4/5] object-cover" />
        </div>
        <div className="flex flex-col gap-8 fade-up">
          <div>
            <h3 className="text-2xl font-serif mb-4">Master Craftsmanship</h3>
            <p className="text-sm opacity-70 leading-relaxed">
              Our Zari work and mirror embroidery are done by hand, using techniques passed down through generations. 
              We never compromise on the quality of our materials or the integrity of our artisans' work.
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-serif mb-4">Sustainable Heritage</h3>
            <p className="text-sm opacity-70 leading-relaxed">
              By providing fair wages and a sustainable working environment, we ensure that these beautiful art forms continue to thrive in the modern age.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

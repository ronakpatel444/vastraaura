'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function NewArrivalsSlider() {
  const { setCartOpen, addToCart, adminProducts, fetchProducts, setCursorType } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (adminProducts.length === 0) {
      fetchProducts();
    }
  }, [adminProducts.length, fetchProducts]);

  // Get the latest 3 active products
  const newArrivals = adminProducts
    .filter(p => p.status !== 'Out of Stock')
    .slice(-3)
    .reverse();

  // Auto-play slider
  useEffect(() => {
    if (newArrivals.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % newArrivals.length);
    }, 5000); // Change every 5 seconds
    
    return () => clearInterval(interval);
  }, [newArrivals.length]);

  if (newArrivals.length === 0) return null;

  const currentProduct = newArrivals[currentIndex];

  return (
    <section className="py-24 bg-[#1A1A1A] text-[#F5F2EB] relative overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-24">
          
          {/* Left Text Content */}
          <div className="w-full lg:w-1/3 flex flex-col justify-center z-10">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#C4A47C] mb-4 font-semibold">
              Fresh Additions
            </span>
            <h2 className="text-4xl md:text-5xl font-serif mb-6 leading-tight">
              New <br/>Arrivals
            </h2>
            <p className="text-sm text-white/60 font-light leading-relaxed mb-8">
              Discover our latest handcrafted masterpieces, fresh from the atelier. 
              Be the first to adorn these exclusive new designs.
            </p>

            <div className="flex items-center gap-4 mb-12">
              {newArrivals.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-[2px] transition-all duration-500 ${
                    idx === currentIndex ? 'w-12 bg-[#C4A47C]' : 'w-6 bg-white/20'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
            
            <Link 
              href="/shop" 
              className="inline-flex items-center gap-4 text-xs tracking-widest uppercase border-b border-[#C4A47C]/40 pb-2 hover:border-[#C4A47C] hover:text-[#C4A47C] transition-colors w-fit"
            >
              Explore All New Items <ArrowRight size={14} />
            </Link>
          </div>

          {/* Right Slider Content */}
          <div className="w-full lg:w-2/3 relative h-[500px] md:h-auto md:aspect-[2/1] lg:aspect-[16/9] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-0 flex flex-col md:flex-row h-full w-full"
                onMouseEnter={() => setCursorType('VIEW')}
                onMouseLeave={() => setCursorType('DEFAULT')}
              >
                {/* Product Image */}
                <Link href={`/product/${currentProduct.id}`} className="w-full h-[65%] md:h-full md:w-2/3 relative block overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-cover bg-top"
                    style={{ backgroundImage: `url(${currentProduct.image})` }}
                  />
                </Link>

                {/* Product Details (Attached to Image) */}
                <div className="w-full h-[35%] md:h-full md:w-1/3 bg-[#252525] p-6 md:p-10 flex flex-col justify-center">
                  <span className="text-[10px] uppercase tracking-widest text-[#C4A47C] mb-1 md:mb-2 block">
                    Just Launched
                  </span>
                  <Link href={`/product/${currentProduct.id}`} className="text-xl md:text-2xl font-serif mb-2 md:mb-4 hover:text-[#C4A47C] transition-colors line-clamp-1 md:line-clamp-2">
                    {currentProduct.name}
                  </Link>
                  <div className="text-sm md:text-lg mb-4 md:mb-8 tracking-wider font-light">
                    {currentProduct.price}
                  </div>
                  
                  <button 
                    onClick={(e) => { 
                      e.preventDefault(); 
                      addToCart({
                        id: currentProduct.id, name: currentProduct.name, price: currentProduct.price,
                        originalPrice: currentProduct.originalPrice, allowCOD: currentProduct.allowCOD,
                        image: currentProduct.image, quantity: 1, size: 'M', color: currentProduct.colors?.[0] || 'N/A',
                        originalSellerLink: currentProduct.originalSellerLink
                      });
                      setCartOpen(true); 
                    }}
                    className="w-full border border-[#C4A47C] text-[#C4A47C] py-3 md:py-4 text-[10px] md:text-xs uppercase tracking-widest font-semibold hover:bg-[#C4A47C] hover:text-[#1A1A1A] transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingBag size={14} />
                    Add to Cart
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}

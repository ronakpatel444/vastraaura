'use client';

import { useStore } from '@/store/useStore';
import { Heart, Search, Percent } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function MegaDiscount() {
  const { setCursorType, setCartOpen, addToCart, adminProducts } = useStore();
  
  const parsePrice = (priceStr?: string) => {
    if (!priceStr) return 0;
    return Number(priceStr.replace(/[^0-9.-]+/g, ""));
  };

  const getDiscountPercentage = (price: string, originalPrice?: string) => {
    const p = parsePrice(price);
    const op = parsePrice(originalPrice);
    if (op > p && op > 0) {
      return Math.round(((op - p) / op) * 100);
    }
    return 0;
  };

  // Filter products with 50% or more discount
  const discountedProducts = adminProducts.filter(p => {
    if (p.status === 'Out of Stock') return false;
    const discount = getDiscountPercentage(p.price, p.originalPrice);
    return discount >= 50;
  }).slice(0, 4);

  if (discountedProducts.length === 0) {
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    show: { 
      opacity: 1, 
      y: 0, 
      transition: { type: "spring", stiffness: 60, damping: 15 }
    }
  };

  return (
    <section className="relative z-20 py-20 md:py-32 px-4 md:px-6 bg-[#0a0a0a] text-white overflow-hidden">
      {/* Background abstract shapes for premium look */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-red-600 blur-[150px]" 
        />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.25, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-orange-600 blur-[150px]" 
        />
      </div>

      <div className="container mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="flex flex-col md:flex-row justify-between items-center md:items-end mb-16 gap-8"
        >
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4 text-red-500">
              <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}>
                <Percent className="w-5 h-5" />
              </motion.div>
              <span className="text-sm tracking-[0.3em] uppercase font-bold">Mega Clearance</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-serif tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400">
              Half Price Edit
            </h2>
            <p className="mt-4 text-gray-400 max-w-md text-sm md:text-base">
              Discover our exclusive selection of premium pieces at 50% off or more. Limited time, limited stock.
            </p>
          </div>
          <Link 
            href="/shop?sale=true" 
            className="group flex items-center gap-2 text-sm tracking-widest uppercase hover:text-red-400 transition-colors pb-1 border-b border-white/20 hover:border-red-400"
          >
            Shop All Sale
            <span className="transform transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {discountedProducts.map((product, idx) => {
            const discount = getDiscountPercentage(product.price, product.originalPrice);
            return (
              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -10, transition: { duration: 0.3 } }}
                key={product.id} 
                className="group relative bg-white/5 border border-white/10 p-4 rounded-xl transition-colors duration-500 hover:bg-white/10 hover:shadow-[0_20px_40px_-15px_rgba(220,38,38,0.3)]"
                onMouseEnter={() => setCursorType('VIEW')}
                onMouseLeave={() => setCursorType('DEFAULT')}
              >
                <div className="block relative aspect-[4/5] overflow-hidden rounded-lg mb-6">
                  <Link href={`/product/${product.id}`} className="absolute inset-0 z-10">
                    <span className="sr-only">View {product.name}</span>
                  </Link>
                  
                  {/* Primary Image */}
                  <motion.div 
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${product.image})` }}
                  />
                  
                  {/* Discount Badge */}
                  <motion.div 
                    initial={{ scale: 0, rotate: -20 }}
                    whileInView={{ scale: 1, rotate: -2 }}
                    viewport={{ once: true }}
                    transition={{ type: "spring", delay: 0.5 + (idx * 0.1) }}
                    className="absolute top-3 left-3 z-20 bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg"
                  >
                    {discount}% OFF
                  </motion.div>

                  {/* Action Buttons */}
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between gap-2 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out z-20">
                    <button 
                      onClick={(e) => { 
                        e.preventDefault(); 
                        addToCart({
                          id: product.id, name: product.name, price: product.price,
                          originalPrice: product.originalPrice, allowCOD: product.allowCOD,
                          image: product.image, quantity: 1, size: 'M', color: product.colors?.[0] || 'N/A',
                          originalSellerLink: product.originalSellerLink
                        });
                        setCartOpen(true); 
                      }}
                      className="flex-1 bg-white/90 backdrop-blur text-black py-2.5 text-xs font-bold uppercase tracking-wider rounded hover:bg-red-600 hover:text-white transition-colors text-center"
                      onMouseEnter={() => setCursorType('DEFAULT')}
                      onMouseLeave={() => setCursorType('VIEW')}
                    >
                      Quick Add
                    </button>
                  </div>
                </div>
                
                <div className="text-center">
                  <Link href={`/product/${product.id}`} className="text-lg font-serif tracking-wide block mb-2 text-white group-hover:text-red-400 transition-colors truncate">
                    {product.name}
                  </Link>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-red-500 font-bold">{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-500 line-through">{product.originalPrice}</span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

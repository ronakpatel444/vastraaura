'use client';

import { useStore } from '@/store/useStore';
import { Heart, Search } from 'lucide-react';
import Link from 'next/link';

// Static array removed in favor of live data

export default function BestSellers() {
  const { setCursorType, setCartOpen, addToCart, adminProducts } = useStore();
  
  // Use first 3 active products for best sellers
  const liveProducts = adminProducts.filter(p => p.status !== 'Out of Stock').slice(0, 3);

  return (
    <section className="relative z-20 py-16 md:py-32 px-4 md:px-6 bg-background">
      <div className="container mx-auto">
        <div className="flex justify-between items-end mb-12 md:mb-16">
          <div>
            <h2 className="text-3xl md:text-5xl font-serif tracking-wide">Signature Pieces</h2>
            <div className="w-16 h-px bg-accent mt-6" />
          </div>
          <Link href="/shop" className="hidden md:inline-block text-sm tracking-widest uppercase hover:text-accent transition-colors pb-1 border-b border-foreground/20 hover:border-accent">
            View All
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {liveProducts.map((product) => (
            <div 
              key={product.id} 
              className="group relative"
              onMouseEnter={() => setCursorType('VIEW')}
              onMouseLeave={() => setCursorType('DEFAULT')}
            >
              <div className="block relative aspect-[3/4] overflow-hidden bg-foreground/5 mb-6">
                <Link href={`/product/${product.id}`} className="absolute inset-0 z-10">
                  <span className="sr-only">View {product.name}</span>
                </Link>
                {/* Primary Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out group-hover:opacity-0"
                  style={{ backgroundImage: `url(${product.image})` }}
                />
                {/* Secondary Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-0 scale-105 transition-all duration-700 ease-in-out group-hover:opacity-100 group-hover:scale-100"
                  style={{ backgroundImage: `url(${product.images?.[0] || product.image})` }}
                />
                
                {/* Action Buttons (appear on hover) */}
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out z-20">
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
                    className="bg-white text-black px-6 py-3 text-xs uppercase tracking-widest hover:bg-black hover:text-white transition-colors"
                    onMouseEnter={() => setCursorType('DEFAULT')}
                    onMouseLeave={() => setCursorType('VIEW')}
                  >
                    Add to Cart
                  </button>
                  <button 
                    className="w-10 h-10 bg-white text-black flex items-center justify-center hover:bg-black hover:text-white transition-colors"
                    onClick={(e) => e.preventDefault()}
                    onMouseEnter={() => setCursorType('DEFAULT')}
                    onMouseLeave={() => setCursorType('VIEW')}
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>

                {/* Wishlist Icon */}
                <button 
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 backdrop-blur text-black flex items-center justify-center hover:bg-white hover:text-accent transition-colors z-20"
                  onClick={(e) => e.preventDefault()}
                  onMouseEnter={() => setCursorType('MAGNETIC')}
                  onMouseLeave={() => setCursorType('VIEW')}
                >
                  <Heart className="w-4 h-4" />
                </button>
              </div>
              
              <div className="text-center transform transition-transform duration-500 ease-out group-hover:-translate-y-2">
                <Link href={`/product/${product.id}`} className="text-lg font-serif tracking-wide block mb-2 group-hover:text-accent transition-colors">
                  {product.name}
                </Link>
                <div className="flex flex-col items-center gap-3">
                  <span className="text-sm opacity-70 tracking-widest">{product.price}</span>
                  
                  {/* Colors display */}
                  {product.colors && product.colors.length > 0 && (
                    <div className="flex items-center gap-3 pt-3 border-t border-gray-200/50 w-full justify-center">
                      <div className="flex gap-1">
                        {product.colors.slice(0, 4).map((color, i) => (
                          <div 
                            key={i} 
                            className="w-4 h-4 rounded-full border border-gray-300 shadow-sm"
                            style={{ backgroundColor: color.trim().toLowerCase().replace(' ', '') }}
                            title={color}
                          />
                        ))}
                        {product.colors.length > 4 && (
                          <div className="w-4 h-4 rounded-full bg-gray-200 text-[8px] flex items-center justify-center text-gray-600">
                            +{product.colors.length - 4}
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] uppercase tracking-widest text-gray-500 font-medium">
                        {product.colors.length} {product.colors.length === 1 ? 'COLOR' : 'COLORS'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

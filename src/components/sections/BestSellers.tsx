'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Heart, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function BestSellers() {
  const { setCartOpen, addToCart, adminProducts, fetchProducts } = useStore();
  
  useEffect(() => {
    if (adminProducts.length === 0) {
      fetchProducts();
    }
  }, [adminProducts.length, fetchProducts]);

  // Use up to 6 products for the grid to look full
  const liveProducts = adminProducts.filter(p => p.status !== 'Out of Stock').slice(0, 6);

  return (
    <section className="relative z-20 py-20 px-4 md:px-8 bg-[#F5F2EB]">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col items-center text-center mb-16">
          <span className="text-[10px] uppercase tracking-[0.2em] text-accent mb-3 font-semibold">Our Signature Collection</span>
          <h2 className="text-3xl md:text-4xl font-serif text-foreground mb-4">Top Selling Creations</h2>
          <p className="text-sm text-foreground/60 max-w-xl mx-auto font-light leading-relaxed mb-8">
            Experience the essence of Vastra Aura with our most loved pieces, crafted with precision and deep respect for our heritage.
          </p>
          <Link 
            href="/shop" 
            className="text-[10px] uppercase tracking-widest text-white bg-accent px-6 py-3 hover:bg-accent/90 transition-colors"
          >
            Shop All Bestsellers
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {liveProducts.map((product) => (
            <div 
              key={product.id} 
              className="group relative bg-white p-4 transition-all duration-300 hover:shadow-xl hover:shadow-accent/5 border border-transparent hover:border-accent/10"
            >
              <div className="block relative aspect-[4/5] overflow-hidden mb-5 bg-[#f8f8f8]">
                {/* Sale Badge if original price exists */}
                {product.originalPrice && (
                  <div className="absolute top-3 left-3 z-20 bg-accent text-white text-[9px] uppercase tracking-wider px-2 py-1">
                    Sale
                  </div>
                )}
                
                {/* Wishlist Button */}
                <button 
                  className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white text-foreground/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:text-accent shadow-sm"
                  onClick={(e) => e.preventDefault()}
                >
                  <Heart className="w-4 h-4" />
                </button>

                <Link href={`/product/${product.id}`} className="absolute inset-0 z-10">
                  <span className="sr-only">View {product.name}</span>
                </Link>
                
                {/* Primary Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-top transition-opacity duration-700 ease-in-out group-hover:opacity-0"
                  style={{ backgroundImage: `url("${product.image}")` }}
                />
                
                {/* Secondary Image */}
                <div 
                  className="absolute inset-0 bg-cover bg-top opacity-0 transition-opacity duration-700 ease-in-out group-hover:opacity-100"
                  style={{ backgroundImage: `url("${product.images?.[0] || product.image}")` }}
                />
              </div>
              
              <div className="flex flex-col text-left">
                <Link href={`/product/${product.id}`} className="text-sm font-serif text-foreground mb-1 group-hover:text-accent transition-colors line-clamp-1">
                  {product.name}
                </Link>
                
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-semibold text-foreground tracking-wider">{product.price}</span>
                  {product.originalPrice && (
                    <span className="text-[10px] text-foreground/40 line-through tracking-wider">{product.originalPrice}</span>
                  )}
                </div>

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
                  className="w-full border border-accent text-accent py-2.5 text-[10px] uppercase tracking-widest font-semibold hover:bg-accent hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-3 h-3" />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Link href="/shop" className="inline-block text-xs tracking-widest uppercase border-b border-foreground/30 pb-1 hover:border-accent hover:text-accent transition-colors">
            Load More Products
          </Link>
        </div>
      </div>
    </section>
  );
}

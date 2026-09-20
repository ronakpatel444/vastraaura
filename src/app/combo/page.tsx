'use client';

import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import Link from 'next/link';
import { Minus, Plus, Search } from 'lucide-react';
import gsap from 'gsap';

export default function ComboPage() {
  const { setCursorType, addToCart, setCartOpen, adminProducts, cartItems, updateQuantity, removeFromCart } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const comboProducts = adminProducts.filter(p => p.category === 'Combo');

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.combo-header > *', {
        y: 30, opacity: 0, duration: 1, stagger: 0.2, ease: 'power3.out'
      });

      gsap.from('.product-card', {
        y: 50, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power2.out', delay: 0.3
      });
    }, containerRef);
    return () => ctx.revert();
  }, [comboProducts.length]);

  const handleQuantityChange = (productId: string, delta: number) => {
    setQuantities(prev => {
      const current = prev[productId] || 1;
      const next = current + delta;
      if (next < 1) return prev;
      return { ...prev, [productId]: next };
    });
  };

  const handleAddCombo = (product: any) => {
    const qty = quantities[product._id] || 1;
    // Auto-select first size and color if available
    const defaultSize = product.sizes?.[0]?.name || 'Free Size';
    const defaultColor = product.colors?.[0] || 'Default';

    addToCart({
      id: product._id,
      name: product.name,
      price: product.price, // Assuming ₹2999 is applied at checkout via useStore getCartTotal
      image: product.image,
      size: defaultSize,
      color: defaultColor,
      quantity: qty,
      originalSellerLink: product.originalSellerLink,
      category: product.category,
    });
    
    // Reset local quantity back to 1
    setQuantities(prev => ({ ...prev, [product._id]: 1 }));
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-background pt-24 pb-16 px-4 md:px-6">
      
      {/* Dynamic Promo Banner */}
      <div className="combo-header w-full bg-[#8A5A44] text-[#F3E5D8] py-8 px-4 flex flex-col items-center justify-center mb-16 rounded-sm shadow-xl relative overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        <h1 className="text-3xl md:text-5xl font-serif mb-2 tracking-wide text-center relative z-10 drop-shadow-md">2 Lehengas → ₹2,999</h1>
        <p className="text-sm md:text-base text-center max-w-2xl opacity-90 relative z-10 font-light tracking-wider">
          Use <span className="font-bold">+</span> to add the same design twice or more. Pairs within this category qualify for the offer. Final discount is applied in your cart.
        </p>
        <div className="mt-4 inline-block border border-[#F3E5D8]/40 px-6 py-2 bg-black/10 backdrop-blur-sm relative z-10">
          <span className="text-sm tracking-widest uppercase font-semibold">Only ₹2,999 for 2</span>
        </div>
      </div>

      <div className="container mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
          {comboProducts.map((product) => {
            const qty = quantities[product._id] || 1;
            
            return (
              <div key={product._id} className="product-card group flex flex-col h-full bg-white p-3 rounded-md shadow-sm hover:shadow-xl transition-shadow duration-300">
                <Link 
                  href={`/product/${product._id}`}
                  className="relative aspect-[3/4] overflow-hidden bg-foreground/5 mb-4 block group-hover:opacity-90 transition-opacity rounded-sm"
                  onMouseEnter={() => setCursorType('VIEW')}
                  onMouseLeave={() => setCursorType('DEFAULT')}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                  />
                  {product.originalPrice && parseInt(product.originalPrice) > parseInt(product.price) && (
                    <div className="absolute top-4 left-4 bg-background text-foreground text-xs px-3 py-1 uppercase tracking-widest shadow-sm">
                      Sale
                    </div>
                  )}
                </Link>
                
                <div className="flex flex-col flex-grow">
                  <h3 className="text-sm font-medium mb-1 line-clamp-2 min-h-[40px] leading-tight text-gray-800">
                    <Link href={`/product/${product._id}`} className="hover:text-accent transition-colors">
                      {product.name}
                    </Link>
                  </h3>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-sm text-gray-900 font-semibold">₹ {parseInt(product.price).toLocaleString('en-IN')}</span>
                    {product.originalPrice && (
                      <span className="text-xs text-gray-400 line-through">₹ {parseInt(product.originalPrice).toLocaleString('en-IN')}</span>
                    )}
                  </div>

                  <div className="mt-auto flex flex-col gap-2">
                    <div className="flex border border-gray-200 rounded-sm overflow-hidden">
                      <button 
                        onClick={() => handleAddCombo(product)}
                        className="flex-1 bg-[#F9F7F5] hover:bg-[#EBE5DE] text-gray-700 text-xs font-semibold uppercase tracking-wider py-3 transition-colors border-r border-gray-200"
                        onMouseEnter={() => setCursorType('MAGNETIC')}
                        onMouseLeave={() => setCursorType('DEFAULT')}
                      >
                        Add Product to Combo
                      </button>
                      <div className="flex items-center bg-white">
                        <button 
                          onClick={() => handleQuantityChange(product._id, -1)}
                          className="px-3 py-3 text-gray-500 hover:text-black transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-medium">{qty}</span>
                        <button 
                          onClick={() => handleQuantityChange(product._id, 1)}
                          className="px-3 py-3 text-gray-500 hover:text-black transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    
                    <Link 
                      href={`/product/${product._id}`}
                      className="w-full border border-gray-200 text-gray-500 hover:text-black hover:border-gray-400 text-[10px] font-semibold uppercase tracking-widest py-2 text-center transition-colors rounded-sm"
                      onMouseEnter={() => setCursorType('MAGNETIC')}
                      onMouseLeave={() => setCursorType('DEFAULT')}
                    >
                      View Product Details →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {comboProducts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <Search className="w-12 h-12 mb-6 opacity-20" />
            <p className="text-xl font-serif mb-2">No combo products available</p>
            <p className="text-sm opacity-60">We are currently updating our combo collection.</p>
          </div>
        )}
      </div>
    </div>
  );
}

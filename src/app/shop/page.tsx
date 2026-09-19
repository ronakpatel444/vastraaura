'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useStore } from '@/store/useStore';
import Link from 'next/link';
import { Heart, Search, Filter } from 'lucide-react';
import gsap from 'gsap';
import { useSearchParams, useRouter } from 'next/navigation';

const categories = ['All', 'Saree', 'Chaniya Choli', 'Lehenga', 'Kurta Sets', 'Kids Wear', 'Casual'];

function ShopContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryParam = searchParams.get('category');
  
  const getCategoryFromParam = (param: string | null) => {
    return categories.find(c => c.toLowerCase().replace(/\s+/g, '-') === param) || 'All';
  };

  const [activeCategory, setActiveCategory] = useState(() => getCategoryFromParam(categoryParam));
  const { setCursorType, addToCart, setCartOpen, adminProducts } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredProducts = activeCategory === 'All' 
    ? adminProducts 
    : adminProducts.filter(p => p.category === activeCategory);

  useEffect(() => {
    setActiveCategory(getCategoryFromParam(categoryParam));
  }, [categoryParam]);



  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.shop-header > *', {
        y: 30, opacity: 0, duration: 1, stagger: 0.2, ease: 'power3.out'
      });

      gsap.from('.product-card', {
        y: 50, opacity: 0, duration: 0.8, stagger: 0.1, ease: 'power2.out', delay: 0.3
      });
    }, containerRef);
    return () => ctx.revert();
  }, [activeCategory]);

  return (
    <div ref={containerRef} className="min-h-screen bg-background pt-24 md:pt-32 pb-16 md:pb-24 px-4 md:px-6">
      <div className="container mx-auto shop-header">
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif text-center mb-10 md:mb-16 tracking-wide">SHOP</h1>

        <div className="flex flex-col md:flex-row justify-between items-center mb-8 md:mb-12 pb-4 md:pb-6 border-b border-foreground/10 gap-4 md:gap-6">
          <button className="flex items-center gap-2 text-sm uppercase tracking-widest hover:text-accent transition-colors self-start md:self-auto">
            <Filter className="w-4 h-4" /> Filter
          </button>
          
          <div className="flex overflow-x-auto w-full md:w-auto pb-2 md:pb-0 justify-start md:justify-center gap-6 md:gap-10 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setActiveCategory(category);
                  if (category === 'All') {
                    router.push('/shop', { scroll: false });
                  } else {
                    const param = category.toLowerCase().replace(/\s+/g, '-');
                    router.push(`/shop?category=${param}`, { scroll: false });
                  }
                }}
                className={`text-sm uppercase tracking-widest transition-colors whitespace-nowrap ${
                  activeCategory === category ? 'text-accent border-b border-accent pb-1' : 'opacity-60 hover:opacity-100'
                }`}
                onMouseEnter={() => setCursorType('MAGNETIC')}
                onMouseLeave={() => setCursorType('DEFAULT')}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {filteredProducts.map((product) => (
            <div 
              key={product.id} 
              className="group relative product-card"
              onMouseEnter={() => setCursorType('VIEW')}
              onMouseLeave={() => setCursorType('DEFAULT')}
            >
              <div className="block relative aspect-[3/4] overflow-hidden bg-[#F5F5F5] mb-6">
                <Link href={`/product/${product.id}`} className="absolute inset-0 z-10">
                  <span className="sr-only">View {product.name}</span>
                </Link>
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-opacity duration-700 ease-in-out group-hover:opacity-0"
                  style={{ backgroundImage: `url(${product.image})` }}
                />
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-0 scale-105 transition-all duration-700 ease-in-out group-hover:opacity-100 group-hover:scale-100"
                  style={{ backgroundImage: `url(${product.image})` }}
                />
                
                {product.status === 'Out of Stock' && (
                  <div className="absolute top-4 left-4 bg-white text-black px-3 py-1 text-xs font-bold tracking-widest uppercase z-20">
                    Sold Out
                  </div>
                )}

                {product.originalPrice && (
                  <div className="absolute top-4 right-4 bg-accent text-white text-xs font-bold px-3 py-1 uppercase tracking-widest z-20">
                    {Math.round(((parseInt(product.originalPrice.replace(/[^\d]/g, ''), 10) - parseInt(product.price.replace(/[^\d]/g, ''), 10)) / parseInt(product.originalPrice.replace(/[^\d]/g, ''), 10)) * 100)}% OFF
                  </div>
                )}
                
                <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-4 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 ease-out z-20">
                  <button 
                    onClick={(e) => { 
                      e.preventDefault(); 
                      if(product.status !== 'Out of Stock') {
                        addToCart({
                          id: product.id, name: product.name, price: product.price,
                          originalPrice: product.originalPrice, allowCOD: product.allowCOD,
                          image: product.image, quantity: 1, size: 'M',
                          originalSellerLink: product.originalSellerLink
                        }); 
                      }
                    }}
                    className={`px-6 py-3 text-xs uppercase tracking-widest transition-colors ${
                      product.status === 'Out of Stock' ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-white text-black hover:bg-black hover:text-white'
                    }`}
                    onMouseEnter={() => setCursorType('DEFAULT')}
                    onMouseLeave={() => setCursorType('VIEW')}
                  >
                    {product.status === 'Out of Stock' ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                </div>
              </div>
              
              <div className="text-center transform transition-transform duration-500 ease-out group-hover:-translate-y-2">
                <Link href={`/product/${product.id}`} className="text-lg font-serif tracking-wide block mb-2 group-hover:text-accent transition-colors">
                  {product.name}
                </Link>
                <div className="flex flex-col items-center gap-3">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-sm opacity-70 tracking-widest">{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-xs text-gray-400 line-through tracking-widest">{product.originalPrice}</span>
                    )}
                  </div>
                  
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
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background pt-32 pb-24 text-center tracking-widest uppercase">Loading...</div>}>
      <ShopContent />
    </Suspense>
  );
}

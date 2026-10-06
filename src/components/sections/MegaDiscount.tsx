'use client';

import { useStore } from '@/store/useStore';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function MegaDiscount() {
  const { setCartOpen, addToCart, adminProducts } = useStore();
  
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

  return (
    <section className="relative z-20 py-20 px-4 md:px-8 bg-[#F5F2EB]">
      <div className="max-w-[1400px] mx-auto border-t border-accent/20 pt-20">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-8">
          <div className="text-left max-w-xl">
            <span className="text-[10px] uppercase tracking-[0.2em] text-accent mb-3 font-semibold block">
              Exclusive Opportunity
            </span>
            <h2 className="text-3xl md:text-5xl font-serif text-foreground mb-4">
              The Half Price Edit
            </h2>
            <p className="text-sm text-foreground/60 font-light leading-relaxed">
              Curated premium pieces now available at exceptional value. 
              Discover our signature designs at half the price, for a limited time only.
            </p>
          </div>
          <Link 
            href="/shop?sale=true" 
            className="text-[10px] uppercase tracking-widest text-foreground border border-foreground px-6 py-3 hover:bg-foreground hover:text-background transition-colors whitespace-nowrap"
          >
            Shop The Sale
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {discountedProducts.map((product) => {
            const discount = getDiscountPercentage(product.price, product.originalPrice);
            return (
              <div 
                key={product.id} 
                className="group relative bg-white p-4 transition-all duration-300 hover:shadow-xl hover:shadow-accent/5 border border-transparent hover:border-accent/10"
              >
                <div className="block relative aspect-[4/5] overflow-hidden mb-4 bg-[#f8f8f8]">
                  <Link href={`/product/${product.id}`} className="absolute inset-0 z-10">
                    <span className="sr-only">View {product.name}</span>
                  </Link>
                  
                  {/* Primary Image */}
                  <div 
                    className="absolute inset-0 bg-cover bg-top transition-opacity duration-700 ease-in-out group-hover:opacity-0"
                    style={{ backgroundImage: `url(${product.image})` }}
                  />
                  
                  {/* Secondary Image */}
                  <div 
                    className="absolute inset-0 bg-cover bg-top opacity-0 transition-opacity duration-700 ease-in-out group-hover:opacity-100"
                    style={{ backgroundImage: `url(${product.images?.[0] || product.image})` }}
                  />
                  
                  {/* Premium Discount Badge */}
                  <div className="absolute top-3 left-3 z-20 bg-background text-accent border border-accent/20 text-[9px] uppercase tracking-widest px-3 py-1 font-medium">
                    {discount}% OFF
                  </div>
                </div>
                
                <div className="flex flex-col text-center">
                  <Link href={`/product/${product.id}`} className="text-sm font-serif text-foreground mb-2 group-hover:text-accent transition-colors line-clamp-1">
                    {product.name}
                  </Link>
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <span className="text-xs font-semibold text-accent tracking-wider">{product.price}</span>
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
                    className="w-full border border-foreground/10 text-foreground/70 py-2.5 text-[10px] uppercase tracking-widest font-semibold hover:border-accent hover:text-accent transition-colors flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-3 h-3" />
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

'use client';

import { useStore } from '@/store/useStore';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function CartDrawer() {
  const pathname = usePathname();
  const { isCartOpen, setCartOpen, setCursorType, cartItems, removeFromCart, updateQuantity, getCartTotal, getComboDiscount } = useStore();

  if (pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={() => setCartOpen(false)}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-background z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="p-6 border-b border-foreground/10 flex items-center justify-between">
              <h2 className="text-xl font-serif tracking-widest">YOUR BAG</h2>
              <button 
                onClick={() => setCartOpen(false)}
                onMouseEnter={() => setCursorType('MAGNETIC')}
                onMouseLeave={() => setCursorType('DEFAULT')}
                className="hover:rotate-90 transition-transform duration-300"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {cartItems.length === 0 ? (
              <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center opacity-70 gap-4">
                <p className="font-serif italic text-lg">Your bag is currently empty.</p>
                <button 
                  onClick={() => setCartOpen(false)}
                  className="text-sm uppercase tracking-widest border-b border-foreground/30 pb-1 hover:border-foreground transition-colors"
                  onMouseEnter={() => setCursorType('MAGNETIC')}
                  onMouseLeave={() => setCursorType('DEFAULT')}
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex gap-4 border-b border-foreground/10 pb-6">
                    <div className="w-24 h-32 relative flex-shrink-0">
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-1">
                        <Link href={`/product/${item.id}`} className="font-serif text-lg leading-tight hover:text-accent transition-colors">
                          {item.name}
                        </Link>
                        <button 
                          onClick={() => removeFromCart(item.id, item.size, item.color)}
                          className="opacity-50 hover:opacity-100 hover:text-red-500 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="text-sm opacity-70 mb-2">{item.price}</span>
                      <div className="flex gap-2 text-xs uppercase tracking-widest opacity-60 mb-auto">
                        {item.size && <span>Size: {item.size}</span>}
                        {item.size && item.color && <span>|</span>}
                        {item.color && <span>Color: {item.color}</span>}
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-foreground/20">
                          <button 
                            onClick={() => updateQuantity(item.id, item.size, item.color, Math.max(1, item.quantity - 1))}
                            className="p-2 hover:bg-foreground/5 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.size, item.color, item.quantity + 1)}
                            className="p-2 hover:bg-foreground/5 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer */}
            <div className="p-6 border-t border-foreground/10 bg-background">
              {getComboDiscount() > 0 && (
                <div className="mb-4 bg-[#8A5A44]/10 border border-[#8A5A44]/20 p-3 flex justify-between items-center">
                  <span className="text-sm font-semibold text-[#8A5A44]">✨ Combo Offer Applied!</span>
                  <span className="text-sm font-bold text-accent">You saved ₹{getComboDiscount().toLocaleString('en-IN')}</span>
                </div>
              )}
              
              <div className="flex justify-between mb-4">
                <span className="text-sm uppercase tracking-widest">Subtotal</span>
                <span className="font-medium">
                  ₹{getCartTotal().toLocaleString('en-IN')}
                </span>
              </div>
              <p className="text-xs opacity-60 mb-6">Shipping & taxes calculated at checkout.</p>
              
              <Link 
                href="/checkout"
                onClick={() => setCartOpen(false)}
                onMouseEnter={() => setCursorType('MAGNETIC')}
                onMouseLeave={() => setCursorType('DEFAULT')}
                className="w-full bg-foreground text-background py-4 flex items-center justify-center gap-2 group hover:bg-accent transition-colors"
              >
                <span className="text-sm tracking-widest uppercase">Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

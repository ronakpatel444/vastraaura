'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function SearchOverlay() {
  const { isSearchOpen, setSearchOpen, setCursorType, adminProducts } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = adminProducts.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="fixed inset-0 bg-background/95 backdrop-blur-md z-[60] flex flex-col"
        >
          <div className="container mx-auto px-6 pt-12 flex-1 flex flex-col">
            <div className="flex justify-end mb-8">
              <button 
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery('');
                }}
                onMouseEnter={() => setCursorType('MAGNETIC')}
                onMouseLeave={() => setCursorType('DEFAULT')}
                className="hover:rotate-90 transition-transform duration-300"
              >
                <X className="w-8 h-8" />
              </button>
            </div>

            <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
              <div className="relative border-b-2 border-foreground/20 focus-within:border-foreground transition-colors pb-4 flex items-center">
                <Search className="w-6 h-6 mr-4 opacity-50" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Chaniya Choli, Lehenga..."
                  className="w-full bg-transparent text-2xl md:text-4xl font-serif outline-none placeholder:text-foreground/30"
                  autoFocus
                />
              </div>

              {/* Search Results Area */}
              <div className="mt-12 flex-1 overflow-y-auto pb-12">
                {searchQuery.length === 0 ? (
                  <>
                    <h3 className="text-sm tracking-widest uppercase text-accent mb-6">Popular Searches</h3>
                    <div className="flex flex-wrap gap-4">
                      {['Bandhani', 'Navratri Special', 'Mirror Work', 'Bridal Lehenga', 'Silk Kurta'].map((term) => (
                        <button 
                          key={term}
                          onClick={() => setSearchQuery(term)}
                          onMouseEnter={() => setCursorType('MAGNETIC')}
                          onMouseLeave={() => setCursorType('DEFAULT')}
                          className="px-6 py-2 border border-foreground/10 rounded-full text-sm hover:border-accent hover:text-accent transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div>
                    <h3 className="text-sm tracking-widest uppercase text-accent mb-6">
                      Results for "{searchQuery}" ({searchResults.length})
                    </h3>
                    
                    {searchResults.length === 0 ? (
                      <p className="text-lg opacity-50">No products found. Try a different term.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {searchResults.map((product) => (
                          <Link 
                            key={product.id} 
                            href={`/product/${product.id}`}
                            onClick={() => {
                              setSearchOpen(false);
                              setSearchQuery('');
                            }}
                            className="flex items-center gap-4 group"
                            onMouseEnter={() => setCursorType('VIEW')}
                            onMouseLeave={() => setCursorType('DEFAULT')}
                          >
                            <div className="w-20 h-28 relative overflow-hidden bg-foreground/5 flex-shrink-0">
                              <Image 
                                src={product.image} 
                                alt={product.name} 
                                fill 
                                className="object-cover transition-transform duration-500 group-hover:scale-110" 
                              />
                            </div>
                            <div>
                              <h4 className="font-serif text-lg group-hover:text-accent transition-colors line-clamp-2 leading-tight mb-2">
                                {product.name}
                              </h4>
                              <p className="text-sm tracking-widest opacity-70 mb-1">{product.price}</p>
                              <p className="text-xs uppercase tracking-widest text-accent">{product.category}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

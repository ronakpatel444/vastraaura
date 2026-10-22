'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { ArrowRight, ShoppingBag, Sparkles, Flame, Check, Copy } from 'lucide-react';
import Link from 'next/link';
import { formatCssUrl } from '@/lib/image';

interface FeaturedCategory {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  startingPrice: string;
  originalPrice: string;
  discount: string;
  image: string;
  link: string;
  tagline: string;
}

const featuredDiwaliCategories: FeaturedCategory[] = [
  {
    id: '3-piece-suit',
    badge: '👑 DIWALI ROYAL EDIT',
    title: '3-Piece Suits',
    subtitle: 'Top + Pant + Heavy Embroidered Dupatta',
    startingPrice: '₹1,499',
    originalPrice: '₹3,099',
    discount: '52% OFF',
    image: '/images/3%20Pis%20suit/D3P_10/1.png',
    link: '/shop?category=3-piece-suit',
    tagline: 'Grand festive Rayon Slub & Roman Silk ensembles crafted for Diwali puja & parties.'
  },
  {
    id: 'coord-sets',
    badge: '✨ MODERN FESTIVE TREND',
    title: '2-Piece Coord Sets',
    subtitle: 'Matching Designer Top + Tailored Pant',
    startingPrice: '₹999',
    originalPrice: '₹2,199',
    discount: '55% OFF',
    image: '/images/Coord%20set%20-%202%20piece/DC-104/D104.png',
    link: '/shop?category=coord-sets',
    tagline: 'Effortless chic styling with breathable cotton rayon blend for modern celebrations.'
  },
  {
    id: 'short-kurtis',
    badge: '🪔 FESTIVE EVERYDAY CHARM',
    title: 'Short Kurtis',
    subtitle: 'Breathable Cotton with Artisanal Prints',
    startingPrice: '₹599',
    originalPrice: '₹1,299',
    discount: '54% OFF',
    image: '/images/Short%20Kurti/DK-201/DK201_1.png',
    link: '/shop?category=short-kurtis',
    tagline: 'Vibrant print work short kurtis pairable with jeans or pants for casual festive comfort.'
  }
];

export default function DiwaliSpecial() {
  const { setCursorType, adminProducts, fetchProducts, addToCart, setCartOpen, formatPrice } = useStore();
  const [activeTab, setActiveTab] = useState<'all' | '3-piece' | 'coord' | 'kurti'>('all');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (adminProducts.length === 0) {
      fetchProducts();
    }
  }, [adminProducts.length, fetchProducts]);

  const copyCode = () => {
    navigator.clipboard.writeText('DIWALI20');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filter products matching Diwali special categories
  const diwaliProducts = adminProducts.filter((product) => {
    if (product.status === 'Out of Stock') return false;
    const cat = (product.category || '').toLowerCase();
    
    if (activeTab === '3-piece') {
      return cat.includes('3 piece') || cat.includes('3 pis') || cat.includes('3 pics');
    }
    if (activeTab === 'coord') {
      return cat.includes('coord') || cat.includes('cord');
    }
    if (activeTab === 'kurti') {
      return cat.includes('short kurti');
    }
    
    // 'all' shows products from these 3 main categories
    return (
      cat.includes('3 piece') ||
      cat.includes('3 pis') ||
      cat.includes('3 pics') ||
      cat.includes('coord') ||
      cat.includes('cord') ||
      cat.includes('short kurti')
    );
  }).slice(0, 8);

  return (
    <section className="py-20 md:py-32 px-4 md:px-8 bg-gradient-to-b from-[#180a0d] via-[#200d11] to-[#120508] text-[#FDFBF7] relative overflow-hidden">
      {/* Decorative Diwali Background Lighting */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-rose-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto max-w-[1400px] relative z-10">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-xs md:text-sm font-semibold tracking-widest uppercase mb-4 shadow-[0_0_20px_rgba(251,191,36,0.15)]">
            <span className="text-base">🪔</span>
            <span>SHUBH DIWALI SPECIAL FESTIVE COLLECTION</span>
            <span className="text-base">🪔</span>
          </div>

          <h2 className="text-3xl md:text-6xl font-serif font-normal tracking-wide text-white leading-tight mb-4">
            Light Up Your Festivities in <br />
            <span className="italic font-light text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-300">
              Timeless Royal Grace
            </span>
          </h2>

          <p className="text-sm md:text-base text-gray-300/80 font-light leading-relaxed max-w-2xl mx-auto">
            Explore Surat&apos;s most celebrated festive edits designed for Diwali parties, family pujas, and gifting. Featuring premium <strong>Grand 3-Piece Suits</strong>, modern <strong>2-Piece Coord Sets</strong>, and charming <strong>Cotton Short Kurtis</strong>.
          </p>
        </div>

        {/* 3 Main Highlight Banners (Short Kurti, 3-Piece Suit, 2-Piece Coord Set) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-20">
          {featuredDiwaliCategories.map((item) => (
            <div 
              key={item.id}
              className="group relative bg-[#2a1217] rounded-xl overflow-hidden border border-amber-500/20 shadow-2xl hover:border-amber-400/60 transition-all duration-500 hover:-translate-y-1.5 flex flex-col"
            >
              {/* Product Visual */}
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-black/40">
                <div 
                  className="w-full h-full bg-cover bg-top transition-transform duration-1000 ease-out group-hover:scale-105"
                  style={{ backgroundImage: `url("${formatCssUrl(item.image)}")` }}
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#180a0d] via-[#180a0d]/30 to-transparent" />
                
                {/* Top Badges */}
                <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 items-start">
                  <span className="bg-amber-400/90 text-amber-950 text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-sm shadow-md">
                    {item.badge}
                  </span>
                  <span className="bg-rose-900/90 text-rose-100 border border-rose-500/30 text-[9px] uppercase tracking-widest px-2.5 py-0.5 rounded-sm">
                    {item.discount}
                  </span>
                </div>

                {/* Price Tag in Image */}
                <div className="absolute bottom-4 left-4 right-4 z-10 flex items-end justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-amber-300 font-semibold block mb-0.5">Starting At</span>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-serif font-bold text-white">{item.startingPrice}</span>
                      <span className="text-xs text-gray-400 line-through">{item.originalPrice}</span>
                    </div>
                  </div>
                  
                  <Link 
                    href={item.link}
                    className="w-10 h-10 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center transform group-hover:scale-110 group-hover:bg-amber-300 transition-all shadow-lg"
                    aria-label={`Shop ${item.title}`}
                  >
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Card Bottom Details */}
              <div className="p-6 flex flex-col flex-grow justify-between bg-gradient-to-b from-[#2a1217] to-[#1f0b0f]">
                <div>
                  <h3 className="text-xl md:text-2xl font-serif text-white mb-1 group-hover:text-amber-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-amber-200/80 font-medium mb-3">
                    {item.subtitle}
                  </p>
                  <p className="text-xs text-gray-300/70 font-light leading-relaxed mb-6">
                    {item.tagline}
                  </p>
                </div>

                <Link 
                  href={item.link}
                  className="w-full py-3 px-4 bg-amber-500/10 hover:bg-amber-400 hover:text-amber-950 border border-amber-500/30 text-amber-300 rounded text-xs uppercase tracking-widest font-semibold transition-all flex items-center justify-center gap-2 group-hover:border-amber-400"
                >
                  <span>Explore {item.title}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Festive Promo Coupon Ribbon */}
        <div className="mb-20 bg-gradient-to-r from-amber-900/60 via-amber-800/40 to-amber-900/60 border border-amber-400/40 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-14 h-14 rounded-full bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-3xl shrink-0 shadow-[0_0_20px_rgba(251,191,36,0.3)]">
              🪔
            </div>
            <div>
              <div className="flex items-center gap-2 justify-center md:justify-start text-amber-300 text-xs font-bold uppercase tracking-widest mb-1">
                <Sparkles size={14} />
                <span>Diwali Dhamaka Discount</span>
                <Sparkles size={14} />
              </div>
              <h4 className="text-xl md:text-2xl font-serif text-white font-medium">
                Get Extra 20% OFF on all Diwali Festive Outfits
              </h4>
              <p className="text-xs text-amber-100/80 font-light">
                Apply coupon code at checkout • Free insured doorstep delivery across India
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-black/40 border border-amber-400/30 p-2.5 rounded-xl">
            <div className="px-4 py-1 text-center">
              <span className="text-[9px] uppercase tracking-widest text-amber-300/80 block font-semibold">Promo Code</span>
              <span className="font-mono text-xl md:text-2xl font-black text-amber-300 tracking-wider">DIWALI20</span>
            </div>
            <button 
              onClick={copyCode}
              className="bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 shadow"
            >
              {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
            </button>
          </div>
        </div>

        {/* Live Diwali Products Showcase Grid */}
        <div className="mt-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
            <div>
              <span className="text-xs uppercase tracking-[0.25em] text-amber-400 font-semibold mb-2 block">
                Direct From Surat Atelier
              </span>
              <h3 className="text-2xl md:text-4xl font-serif text-white">
                Diwali Special Trending Styles
              </h3>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-2 md:gap-3 bg-white/5 p-1.5 rounded-lg border border-white/10">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded text-xs uppercase tracking-wider font-medium transition-all ${
                  activeTab === 'all' 
                    ? 'bg-amber-400 text-amber-950 font-bold shadow' 
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                All Diwali (3-Pis, Coord, Kurti)
              </button>
              <button
                onClick={() => setActiveTab('3-piece')}
                className={`px-4 py-2 rounded text-xs uppercase tracking-wider font-medium transition-all ${
                  activeTab === '3-piece' 
                    ? 'bg-amber-400 text-amber-950 font-bold shadow' 
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                3-Piece Suits
              </button>
              <button
                onClick={() => setActiveTab('coord')}
                className={`px-4 py-2 rounded text-xs uppercase tracking-wider font-medium transition-all ${
                  activeTab === 'coord' 
                    ? 'bg-amber-400 text-amber-950 font-bold shadow' 
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                2-Piece Coord Sets
              </button>
              <button
                onClick={() => setActiveTab('kurti')}
                className={`px-4 py-2 rounded text-xs uppercase tracking-wider font-medium transition-all ${
                  activeTab === 'kurti' 
                    ? 'bg-amber-400 text-amber-950 font-bold shadow' 
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                Short Kurtis
              </button>
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {diwaliProducts.map((product) => (
              <div 
                key={product.id}
                className="group relative bg-[#220d11] rounded-lg overflow-hidden border border-amber-500/15 hover:border-amber-400/50 transition-all duration-300 flex flex-col p-3 shadow-lg hover:shadow-2xl"
              >
                {/* Image Box */}
                <div className="relative aspect-[3/4] w-full rounded overflow-hidden bg-black/40 mb-3">
                  <Link href={`/product/${product.id}`} className="absolute inset-0 z-10">
                    <span className="sr-only">View {product.name}</span>
                  </Link>

                  <div 
                    className="absolute inset-0 bg-cover bg-top transition-transform duration-700 ease-out group-hover:scale-105"
                    style={{ backgroundImage: `url("${formatCssUrl(product.image)}")` }}
                  />

                  {/* Diwali Badge */}
                  <div className="absolute top-2 left-2 z-20 bg-amber-500/90 text-amber-950 font-extrabold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded shadow">
                    🪔 Diwali Special
                  </div>

                  {product.originalPrice && (
                    <div className="absolute top-2 right-2 z-20 bg-rose-700 text-white font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded shadow">
                      {Math.round(((parseInt(product.originalPrice.replace(/[^\d]/g, ''), 10) - parseInt(product.price.replace(/[^\d]/g, ''), 10)) / parseInt(product.originalPrice.replace(/[^\d]/g, ''), 10)) * 100)}% OFF
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex flex-col flex-grow justify-between text-left">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-amber-400/80 font-medium block mb-1">
                      {product.category}
                    </span>
                    <Link 
                      href={`/product/${product.id}`}
                      className="text-xs md:text-sm font-serif text-white hover:text-amber-300 transition-colors line-clamp-1 block mb-2"
                    >
                      {product.name}
                    </Link>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-sm font-bold text-amber-300 tracking-wider">
                        {formatPrice(product.price)}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatPrice(product.originalPrice)}
                        </span>
                      )}
                    </div>

                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        addToCart({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          originalPrice: product.originalPrice,
                          allowCOD: product.allowCOD,
                          image: product.image,
                          quantity: 1,
                          size: 'M',
                          originalSellerLink: product.originalSellerLink
                        });
                        setCartOpen(true);
                      }}
                      className="w-full py-2.5 px-3 rounded bg-amber-400 hover:bg-amber-300 text-amber-950 font-bold text-[10px] md:text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 shadow"
                    >
                      <ShoppingBag size={13} />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom View All Link */}
          <div className="text-center mt-12">
            <Link 
              href="/shop?category=3-piece-suit"
              className="inline-flex items-center gap-3 px-8 py-4 rounded-full border-2 border-amber-400 text-amber-300 hover:bg-amber-400 hover:text-amber-950 font-semibold text-xs md:text-sm uppercase tracking-widest transition-all duration-300 shadow-[0_0_25px_rgba(251,191,36,0.2)]"
            >
              <span>Explore Entire Diwali Festive Collection</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}

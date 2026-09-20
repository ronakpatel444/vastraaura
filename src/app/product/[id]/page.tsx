'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useStore, StockBySize } from '@/store/useStore';
import { Heart, ArrowRight, Star } from 'lucide-react';
import gsap from 'gsap';
import Link from 'next/link';
import Image from 'next/image';

// Removed static SIZES array

export default function ProductDetailPage() {
  const params = useParams();
  const { adminProducts, setCursorType, addToCart } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);

  // Find the actual product from our global state
  const product = adminProducts.find(p => p.id === params.id);
  
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  // Review state
  const { submitReview } = useStore();
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Accordion state
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  useEffect(() => {
    if (product && product.colors && product.colors.length > 0) {
      setSelectedColor(product.colors[0]);
    }
  }, [product]);

  // Set the first available size on mount
  useEffect(() => {
    if (product && product.sizes && product.sizes.length > 0) {
      const firstAvailableSize = product.sizes.find(size => size.stock > 0);
      setSelectedSize(firstAvailableSize ? firstAvailableSize.name : '');
    }
  }, [product]);

  useEffect(() => {
    // Force scroll to top on page load (Fixes Next.js + Lenis scroll retention issue)
    window.scrollTo({ top: 0, behavior: 'instant' });
    
    if (!product) return;
    const ctx = gsap.context(() => {
      gsap.from('.product-gallery > div', { x: -50, opacity: 0, duration: 1.2, stagger: 0.2, ease: 'power3.out' });
      gsap.from('.product-details > div, .product-details > p, .product-details > h1', { y: 40, opacity: 0, duration: 1, stagger: 0.15, ease: 'power2.out', delay: 0.3 });
    }, containerRef);
    return () => ctx.revert();
  }, [product]);

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <h1 className="text-3xl font-serif mb-4">Product Not Found</h1>
        <Link href="/shop" className="text-sm uppercase tracking-widest border-b border-black">Return to Shop</Link>
      </div>
    );
  }

  // Create an array of images including the main image and any additional images
  const galleryImages = [product.image, ...(product.images || [])];

  const handleAddToCart = () => {
    if (!selectedSize) return alert('Please select a size');
    if (product.colors && product.colors.length > 0 && !selectedColor) return alert('Please select a color');
    const sizeDetails = product.sizes?.find(s => s.name === selectedSize);
    if (!sizeDetails || sizeDetails.stock < quantity) return alert('Not enough stock available for this size');

    setIsAdded(true);
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      allowCOD: product.allowCOD,
      image: product.image,
      quantity: quantity,
      size: selectedSize as string,
      color: selectedColor || undefined,
      originalSellerLink: product.originalSellerLink
    });
    setTimeout(() => {
      setIsAdded(false);
    }, 1500);
  };

  const isOutOfStock = !product.sizes || product.sizes.reduce((a, b) => a + b.stock, 0) === 0;

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) return;
    
    setIsSubmittingReview(true);
    const success = await submitReview({
      productId: product.id,
      productName: product.name,
      customerName: reviewName,
      rating: reviewRating,
      comment: reviewComment
    });
    setIsSubmittingReview(false);
    
    if (success) {
      setReviewSubmitted(true);
      setReviewName('');
      setReviewComment('');
      setReviewRating(5);
    } else {
      alert('Failed to submit review. Please try again.');
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-background pt-24 md:pt-32 pb-16 md:pb-24 px-4 md:px-6">
      <div className="container mx-auto">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          
          {/* Left: Product Gallery */}
          <div className="product-gallery w-full lg:w-1/2 flex flex-col gap-4">
            {/* Main Image */}
            <div className="w-full aspect-[3/4] relative rounded-2xl overflow-hidden shadow-sm flex items-center justify-center bg-gray-50">
              <Image 
                src={galleryImages[activeImage]} 
                alt={product.name}
                fill
                priority
                className="object-cover object-top cursor-zoom-in transition-transform duration-700 ease-out hover:scale-[1.02]"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {product.originalPrice && (
                <div className="absolute top-4 right-4 bg-accent text-white text-xs font-bold px-3 py-1 uppercase tracking-widest rounded-md z-10">
                  {Math.round(((parseInt(product.originalPrice.replace(/[^\d]/g, ''), 10) - parseInt(product.price.replace(/[^\d]/g, ''), 10)) / parseInt(product.originalPrice.replace(/[^\d]/g, ''), 10)) * 100)}% OFF
                </div>
              )}
            </div>
            
            {/* Thumbnails Scroll View */}
            <div className="relative group w-full flex items-center mt-2">
              <button 
                onClick={() => {
                  const el = document.getElementById('thumbnail-scroll');
                  if (el) el.scrollBy({ left: -200, behavior: 'smooth' });
                }}
                className="absolute left-0 z-10 w-8 h-8 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center -translate-x-3 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
              >
                <span className="text-gray-600 text-lg font-medium">‹</span>
              </button>
              
              <div id="thumbnail-scroll" className="flex gap-3 overflow-x-auto hide-scrollbar py-2 px-1 w-full snap-x snap-mandatory scroll-smooth">
                {galleryImages.map((img, idx) => (
                  <div 
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`flex-none snap-start relative rounded-lg overflow-hidden cursor-pointer transition-all duration-300 w-24 aspect-[3/4] ${
                      activeImage === idx ? 'ring-2 ring-black shadow-md scale-[1.02]' : 'ring-1 ring-gray-200 hover:ring-gray-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image 
                      src={img} 
                      alt={`Thumbnail ${idx}`}
                      fill
                      loading="lazy"
                      className="object-cover object-center"
                      sizes="96px"
                    />
                  </div>
                ))}
              </div>

              <button 
                onClick={() => {
                  const el = document.getElementById('thumbnail-scroll');
                  if (el) el.scrollBy({ left: 200, behavior: 'smooth' });
                }}
                className="absolute right-0 z-10 w-8 h-8 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center translate-x-3 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50"
              >
                <span className="text-gray-600 text-lg font-medium">›</span>
              </button>
            </div>
          </div>

          {/* Right: Product Details */}
          <div className="product-details w-full lg:w-1/2 flex flex-col justify-center">
            
            <div className="mb-2">
              <span className="text-xs uppercase tracking-widest text-accent">{product.category}</span>
            </div>

            <div className="mb-8">
              <h1 className="text-3xl md:text-5xl font-serif mb-4">{product.name}</h1>
              <div className="flex items-center gap-4">
                <p className="text-2xl font-serif text-accent">{product.price}</p>
                {product.originalPrice && (
                  <p className="text-lg font-serif text-gray-400 line-through">
                    {product.originalPrice}
                  </p>
                )}
              </div>
            </div>
            


            {/* Color Selector */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-8">
                <span className="text-sm uppercase tracking-widest font-medium block mb-4">Color: {selectedColor}</span>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color, idx) => {
                    const isSelected = selectedColor === color;
                    // Look for specific color image in colorDetails, fallback to main gallery
                    const specificColorDetail = product.colorDetails?.find(c => c.name === color);
                    const colorImage = specificColorDetail?.image || galleryImages[idx] || product.image;
                    
                    return (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`group flex flex-col items-center gap-2 p-1 rounded-lg border-2 transition-all ${
                          isSelected 
                            ? 'border-[#8B5E34] bg-[#8B5E34]/5 scale-[1.02] shadow-sm' 
                            : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
                        }`}
                        onMouseEnter={() => setCursorType('MAGNETIC')}
                        onMouseLeave={() => setCursorType('DEFAULT')}
                      >
                        <div 
                          className={`w-20 h-28 bg-cover bg-center rounded-md border ${isSelected ? 'border-[#8B5E34]/30' : 'border-gray-200'}`}
                          style={{ backgroundImage: `url(${colorImage})` }}
                        />
                        <span className={`text-xs font-medium px-1 ${isSelected ? 'text-[#8B5E34]' : 'text-gray-600 group-hover:text-black'}`}>
                          {color.length > 15 ? color.substring(0, 12) + '...' : color}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selector */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm uppercase tracking-widest font-medium">Select Size</span>
              </div>
              <div className="flex flex-wrap gap-4">
                {(product.sizes || []).map((sizeObj) => {
                  const size = sizeObj.name;
                  const stock = sizeObj.stock;
                  const isAvailable = stock > 0;
                  const isSelected = selectedSize === size;

                  return (
                    <button
                      key={size}
                      onClick={() => isAvailable && setSelectedSize(size)}
                      disabled={!isAvailable}
                      className={`relative min-w-[3rem] w-auto px-4 h-12 flex items-center justify-center text-sm font-medium group ${
                        !isAvailable ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                      }`}
                      onMouseEnter={() => isAvailable && setCursorType('MAGNETIC')}
                      onMouseLeave={() => setCursorType('DEFAULT')}
                    >
                      <span className={`relative z-10 transition-colors ${isSelected ? 'text-white' : 'text-foreground group-hover:text-accent'}`}>{size}</span>
                      
                      {/* Backgrounds */}
                      {isSelected ? (
                        <div className="absolute inset-0 bg-foreground rounded-full" />
                      ) : (
                        <div className="absolute inset-0 border border-foreground/20 rounded-full group-hover:border-accent transition-colors" />
                      )}

                      {/* Strike-through for Out of Stock */}
                      {!isAvailable && (
                        <div className="absolute inset-0 flex items-center justify-center transform -rotate-45">
                          <div className="w-10 h-[1px] bg-foreground"></div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              
              {selectedSize && product.sizes?.find(s => s.name === selectedSize)?.stock! > 0 && product.sizes?.find(s => s.name === selectedSize)?.stock! < 5 && (
                <p className="text-xs text-red-600 mt-3 font-medium uppercase tracking-wide">
                  Only {product.sizes?.find(s => s.name === selectedSize)?.stock} left in this size!
                </p>
              )}
            </div>



            {/* Quantity and Actions */}
            <div className="flex gap-4 mb-12">
              <div className="border border-foreground/20 px-4 py-3 flex items-center gap-6 rounded-none">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="opacity-50 hover:opacity-100"
                >-</button>
                <span className="text-sm">{quantity}</span>
                <button 
                  onClick={() => {
                    if (selectedSize && quantity < product.stockBySize[selectedSize]) {
                      setQuantity(quantity + 1);
                    }
                  }}
                  className={`opacity-50 ${selectedSize && quantity < product.stockBySize[selectedSize] ? 'hover:opacity-100 cursor-pointer' : 'cursor-not-allowed'}`}
                >+</button>
              </div>
              
              <button 
                onClick={handleAddToCart}
                disabled={isAdded || isOutOfStock || !selectedSize}
                className={`flex-1 text-xs md:text-sm px-2 md:px-8 py-3 uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${
                  isOutOfStock || !selectedSize
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-foreground text-background hover:bg-accent'
                }`}
                onMouseEnter={() => !isOutOfStock && setCursorType('MAGNETIC')}
                onMouseLeave={() => setCursorType('DEFAULT')}
              >
                {isAdded ? (
                  <>✓ Added to Bag</>
                ) : isOutOfStock ? (
                  <>Sold Out</>
                ) : (
                  <>Add to Bag <ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              <button 
                className="w-14 border border-foreground/20 flex items-center justify-center hover:text-accent hover:border-accent transition-colors"
                onMouseEnter={() => setCursorType('MAGNETIC')}
                onMouseLeave={() => setCursorType('DEFAULT')}
              >
                <Heart className="w-5 h-5" />
              </button>
            </div>

            {/* Product Details (Description & Fabric) */}
            <div className="mb-8 pt-8 border-t border-foreground/10">
              <h3 className="text-sm uppercase tracking-widest font-medium mb-4">Product Details</h3>
              <div 
                className="text-sm opacity-80 leading-relaxed mb-4 prose prose-sm prose-p:mb-2 prose-a:text-accent prose-strong:font-bold max-w-none"
                dangerouslySetInnerHTML={{ __html: product.description || 'A masterpiece of traditional craftsmanship.' }}
              />
              {product.fabric && (
                <p className="text-sm font-medium tracking-wide mt-4">
                  Fabric: <span className="opacity-70 font-normal">{product.fabric}</span>
                </p>
              )}
            </div>

            {/* Accordion Details */}
            <div className="border-t border-foreground/10 pt-4 mt-8">
              
              {/* Shipping Information */}
              <div className="mb-4 border-b border-foreground/10 pb-4">
                <div 
                  className="text-sm uppercase tracking-widest font-medium flex justify-between cursor-pointer"
                  onClick={() => setOpenAccordion(openAccordion === 'shipping' ? null : 'shipping')}
                >
                  Shipping Information <span>{openAccordion === 'shipping' ? '-' : '+'}</span>
                </div>
                {openAccordion === 'shipping' && (
                  <div className="mt-4 text-sm opacity-80 leading-relaxed text-gray-600">
                    <p className="mb-2"><strong className="font-medium text-black">India:</strong> Delivery typically takes 3-4 business days.</p>
                    <p><strong className="font-medium text-black">International:</strong> Delivery takes approximately 1 week depending on customs.</p>
                  </div>
                )}
              </div>

              {/* Reviews */}
              <div className="mb-4 border-b border-foreground/10 pb-4">
                <div 
                  className="text-sm uppercase tracking-widest font-medium flex justify-between cursor-pointer"
                  onClick={() => setOpenAccordion(openAccordion === 'reviews' ? null : 'reviews')}
                >
                  Write a Review <span>{openAccordion === 'reviews' ? '-' : '+'}</span>
                </div>
                {openAccordion === 'reviews' && (
                  <div className="mt-4">
                    {reviewSubmitted ? (
                      <div className="bg-green-50 text-green-800 p-4 rounded-md text-sm">
                        Thank you! Your review has been submitted successfully.
                      </div>
                    ) : (
                      <form onSubmit={handleReviewSubmit} className="space-y-4">
                        <p className="text-xs text-gray-500 mb-4 uppercase tracking-wider">Leave a review for this product</p>
                        
                        <div>
                          <label className="block text-xs uppercase tracking-widest mb-1">Your Name</label>
                          <input 
                            type="text" 
                            required
                            value={reviewName}
                            onChange={(e) => setReviewName(e.target.value)}
                            className="w-full border border-gray-300 p-2 text-sm focus:outline-none focus:border-black"
                            placeholder="John Doe"
                          />
                        </div>

                        <div>
                          <label className="block text-xs uppercase tracking-widest mb-1">Rating</label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReviewRating(star)}
                                className={`p-1 ${reviewRating >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                              >
                                <Star className="w-5 h-5 fill-current" />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs uppercase tracking-widest mb-1">Review</label>
                          <textarea 
                            required
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            className="w-full border border-gray-300 p-2 text-sm h-24 focus:outline-none focus:border-black"
                            placeholder="What did you like about this product?"
                          />
                        </div>

                        <button 
                          type="submit" 
                          disabled={isSubmittingReview}
                          className="w-full bg-black text-white text-xs uppercase tracking-widest py-3 hover:bg-gray-800 disabled:opacity-50"
                        >
                          {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>

              <div className="text-sm uppercase tracking-widest font-medium mb-4 flex justify-between cursor-pointer opacity-60 hover:opacity-100">
                Returns & Exchanges <span>+</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

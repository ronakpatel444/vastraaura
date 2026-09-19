'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { useStore, StockBySize } from '@/store/useStore';
import { Heart, ArrowRight, Star } from 'lucide-react';
import gsap from 'gsap';
import Link from 'next/link';

const SIZES: (keyof StockBySize)[] = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function ProductDetailPage() {
  const params = useParams();
  const { adminProducts, setCursorType, addToCart } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);

  // Find the actual product from our global state
  const product = adminProducts.find(p => p.id === params.id);
  
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<keyof StockBySize | ''>('');
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
    if (product) {
      const firstAvailableSize = SIZES.find(size => product.stockBySize[size] > 0);
      setSelectedSize(firstAvailableSize || '');
    }
  }, [product]);

  useEffect(() => {
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
    if (product.stockBySize[selectedSize as keyof StockBySize] < quantity) return alert('Not enough stock available for this size');

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

  const isOutOfStock = Object.values(product.stockBySize).reduce((a, b) => a + b, 0) === 0;

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
          <div className="product-gallery w-full lg:w-1/2 flex flex-col md:flex-row gap-6 items-center justify-center md:items-start md:justify-start">
            {/* Thumbnails */}
            <div className="flex md:flex-col gap-3 md:gap-4 order-2 md:order-1 overflow-x-auto md:overflow-visible w-full md:w-auto hide-scrollbar justify-center items-center py-2">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-16 h-20 md:w-20 md:h-24 flex-shrink-0 bg-cover bg-center transition-all rounded-lg overflow-hidden ${
                    activeImage === idx ? 'border-2 border-accent opacity-100 scale-105' : 'opacity-60 hover:opacity-100'
                  }`}
                  style={{ backgroundImage: `url(${img})` }}
                  onMouseEnter={() => setCursorType('MAGNETIC')}
                  onMouseLeave={() => setCursorType('DEFAULT')}
                />
              ))}
            </div>
            
            {/* Main Image */}
            <div className="w-full max-w-[90vw] md:max-w-lg aspect-[3/4] order-1 md:order-2 relative rounded-2xl overflow-hidden shadow-sm flex items-center justify-center bg-gray-50">
              <div 
                className="w-full h-full bg-cover bg-top cursor-zoom-in transition-transform duration-700 ease-out hover:scale-[1.02]"
                style={{ backgroundImage: `url(${galleryImages[activeImage]})` }}
              />
              {product.originalPrice && (
                <div className="absolute top-4 right-4 bg-accent text-white text-xs font-bold px-3 py-1 uppercase tracking-widest rounded-md z-10">
                  {Math.round(((parseInt(product.originalPrice.replace(/[^\d]/g, ''), 10) - parseInt(product.price.replace(/[^\d]/g, ''), 10)) / parseInt(product.originalPrice.replace(/[^\d]/g, ''), 10)) * 100)}% OFF
                </div>
              )}
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
            
            <div className="mb-8">
              <p className="text-sm opacity-80 leading-relaxed max-w-md mb-4 whitespace-pre-line">
                {product.description || 'A masterpiece of traditional craftsmanship.'}
              </p>
              {product.fabric && (
                <p className="text-sm font-medium tracking-wide">
                  Fabric: <span className="opacity-70 font-normal">{product.fabric}</span>
                </p>
              )}
            </div>

            {/* Color Selector */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-8">
                <span className="text-sm uppercase tracking-widest font-medium block mb-4">Select Color</span>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => {
                    const isSelected = selectedColor === color;
                    return (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 text-sm font-medium rounded-full border transition-all ${
                          isSelected 
                            ? 'bg-foreground text-white border-foreground' 
                            : 'bg-transparent text-foreground border-foreground/20 hover:border-accent'
                        }`}
                        onMouseEnter={() => setCursorType('MAGNETIC')}
                        onMouseLeave={() => setCursorType('DEFAULT')}
                      >
                        {color}
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
                <button className="text-xs uppercase tracking-widest opacity-60 hover:text-accent border-b border-foreground/20">Size Guide</button>
              </div>
              <div className="flex flex-wrap gap-4">
                {SIZES.map((size) => {
                  const stock = product.stockBySize[size];
                  const isAvailable = stock > 0;
                  const isSelected = selectedSize === size;

                  return (
                    <button
                      key={size}
                      onClick={() => isAvailable && setSelectedSize(size)}
                      disabled={!isAvailable}
                      className={`relative w-12 h-12 flex items-center justify-center text-sm font-medium group ${
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
              
              {selectedSize && product.stockBySize[selectedSize] > 0 && product.stockBySize[selectedSize] < 5 && (
                <p className="text-xs text-red-600 mt-3 font-medium uppercase tracking-wide">
                  Only {product.stockBySize[selectedSize]} left in this size!
                </p>
              )}
            </div>

            {/* Color Selector */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-sm uppercase tracking-widest font-medium">Select Color</span>
                </div>
                <div className="flex flex-wrap gap-4">
                  {product.colors.map((color: string) => {
                    const isSelected = selectedColor === color;
                    return (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 text-sm font-medium border transition-colors ${
                          isSelected ? 'bg-black text-white border-black' : 'bg-transparent text-black border-gray-300 hover:border-black'
                        }`}
                        onMouseEnter={() => setCursorType('MAGNETIC')}
                        onMouseLeave={() => setCursorType('DEFAULT')}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

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

            {/* Accordion Details */}
            <div className="border-t border-foreground/10 pt-8 mt-12">
              
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

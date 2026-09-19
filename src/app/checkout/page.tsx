'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';
import Script from 'next/script';

// Add TypeScript declaration for Razorpay
declare global {
  interface Window {
    Razorpay: any;
  }
}
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function CheckoutPage() {
  const { cartItems, setCartOpen, setCursorType, appliedCoupon, setAppliedCoupon, storeSettings, fetchSettings } = useStore();
  const router = useRouter();
  
  useEffect(() => {
    if (!storeSettings && fetchSettings) {
      fetchSettings();
    }
  }, [storeSettings, fetchSettings]);

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
  });

  const subtotal = cartItems.reduce((acc, item) => {
    const priceVal = parseInt(item.price.replace(/[^\d]/g, ''), 10);
    return acc + (priceVal * item.quantity);
  }, 0);
  
  let discount = 0;
  if (appliedCoupon) {
    cartItems.forEach(item => {
      // Apply discount if coupon has no restrictions, or if item is in the restricted list
      if (appliedCoupon.applicableProductIds.length === 0 || appliedCoupon.applicableProductIds.includes(item.id.toString())) {
        const priceVal = parseInt(item.price.replace(/[^\d]/g, ''), 10);
        discount += (priceVal * item.quantity) * (appliedCoupon.discountPercent / 100);
      }
    });
  }

  // Dynamic Shipping Logic
  const freeThreshold = storeSettings?.freeShippingThreshold ?? 10000;
  const flatRate = storeSettings?.flatShippingRate ?? 250;
  
  const shipping = (freeThreshold > 0 && subtotal > freeThreshold) ? 0 : flatRate;
  const total = subtotal - discount + shipping;

  const isCODRestrictedByProduct = cartItems.some(item => item.allowCOD === false);
  const isCODRestrictedByCoupon = appliedCoupon !== null;
  const isCODDisabled = isCODRestrictedByProduct || isCODRestrictedByCoupon;

  // Auto-switch to Online if COD is disabled
  if (isCODDisabled && paymentMethod === 'COD') {
    setPaymentMethod('ONLINE');
  }

  useEffect(() => {
    if (formData.pincode.length === 6 && /^\d+$/.test(formData.pincode)) {
      const fetchPincodeDetails = async () => {
        try {
          const response = await fetch(`https://api.postalpincode.in/pincode/${formData.pincode}`);
          const data = await response.json();
          if (data && data[0].Status === 'Success') {
            const postOffice = data[0].PostOffice[0];
            setFormData(prev => ({
              ...prev,
              city: postOffice.District,
              state: postOffice.State
            }));
          }
        } catch (error) {
          console.error("Error fetching pincode details", error);
        }
      };
      fetchPincodeDetails();
    }
  }, [formData.pincode]);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    
    setIsApplying(true);
    setCouponError('');
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponInput })
      });
      const data = await res.json();
      
      if (res.ok) {
        setAppliedCoupon(data);
        setCouponInput('');
      } else {
        setCouponError(data.error || 'Invalid coupon');
      }
    } catch (err) {
      setCouponError('Failed to validate coupon');
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const orderData = {
        customer: {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
        },
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        items: cartItems.map(item => ({
          productId: item.id.toString(),
          name: item.name,
          price: item.price,
          image: item.image,
          quantity: item.quantity,
          size: item.size || 'N/A',
          color: item.color || 'N/A',
          originalSellerLink: item.originalSellerLink
        })),
        subtotal,
        discount,
        shippingFee: shipping,
        totalAmount: total,
        paymentMethod: paymentMethod,
        couponCode: appliedCoupon?.code,
        status: paymentMethod === 'ONLINE' ? 'Paid' : 'Pending'
      };

      if (paymentMethod === 'ONLINE') {
        // 1. Create order in backend (Razorpay + DB)
        const createRes = await fetch('/api/razorpay/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        });
        
        if (!createRes.ok) throw new Error('Failed to initiate payment');
        
        const { dbOrderId, razorpayOrderId, amount, currency } = await createRes.json();
        
        // 2. Open Razorpay Checkout Modal
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: amount.toString(),
          currency: currency,
          name: 'VASTRA AURA',
          description: 'Payment for your order',
          order_id: razorpayOrderId,
          handler: async function (response: any) {
            try {
              // 3. Verify Payment
              const verifyRes = await fetch('/api/razorpay/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                  dbOrderId
                })
              });
              
              if (!verifyRes.ok) throw new Error('Payment verification failed');
              
              useStore.setState({ cartItems: [] });
              router.push('/order-success?id=' + dbOrderId);
            } catch (error) {
              console.error(error);
              alert('Payment verification failed. If money was deducted, please contact support.');
            }
          },
          prefill: {
            name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            contact: formData.phone
          },
          theme: {
            color: '#000000'
          }
        };
        
        const rzp1 = new window.Razorpay(options);
        rzp1.on('payment.failed', function (response: any){
          alert('Payment failed. Reason: ' + response.error.description);
        });
        rzp1.open();
        
      } else {
        // COD Flow
        const res = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        });

        if (!res.ok) throw new Error('Failed to create order');
        const createdOrder = await res.json();

        useStore.setState({ cartItems: [] });
        router.push('/order-success?id=' + createdOrder._id);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to process your order. Please try again.');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <h1 className="text-3xl font-serif mb-4">Your Bag is Empty</h1>
        <Link href="/shop" className="text-sm uppercase tracking-widest border-b border-black">Return to Shop</Link>
      </div>
    );
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Left Column: Form */}
      <div className="w-full lg:w-3/5 p-4 md:p-8 lg:p-16 lg:pr-24 flex justify-end bg-white">
        <div className="w-full max-w-xl mt-12 lg:mt-0">
          <Link href="/" className="text-3xl font-serif tracking-widest mb-12 block">VASTRA AURA</Link>
          
          <form onSubmit={handleCheckout} className="space-y-8">
            <section>
              <h2 className="text-lg font-serif mb-4">Contact Information</h2>
              <input 
                type="email" 
                required
                placeholder="Email Address" 
                className="w-full border border-gray-300 rounded p-3 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </section>

            <section>
              <h2 className="text-lg font-serif mb-4">Shipping Address</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <input 
                  type="text" 
                  required
                  placeholder="First Name" 
                  className="w-full border border-gray-300 rounded p-3 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                  value={formData.firstName}
                  onChange={e => setFormData({...formData, firstName: e.target.value})}
                />
                <input 
                  type="text" 
                  required
                  placeholder="Last Name" 
                  className="w-full border border-gray-300 rounded p-3 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                  value={formData.lastName}
                  onChange={e => setFormData({...formData, lastName: e.target.value})}
                />
              </div>
              <input 
                type="text" 
                required
                placeholder="Address" 
                className="w-full border border-gray-300 rounded p-3 text-sm mb-4 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
              />
              <div className="grid grid-cols-3 gap-4 mb-4">
                <input 
                  type="text" 
                  required
                  placeholder="PIN Code" 
                  className="w-full border border-gray-300 rounded p-3 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                  value={formData.pincode}
                  onChange={e => setFormData({...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6)})}
                />
                <input 
                  type="text" 
                  required
                  placeholder="City" 
                  className="w-full border border-gray-300 rounded p-3 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                  value={formData.city}
                  onChange={e => setFormData({...formData, city: e.target.value})}
                />
                <input 
                  type="text"
                  required
                  placeholder="State"
                  className="w-full border border-gray-300 rounded p-3 text-sm bg-white focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                  value={formData.state}
                  onChange={e => setFormData({...formData, state: e.target.value})}
                />
              </div>
              <input 
                type="tel" 
                required
                placeholder="Phone (for delivery updates)" 
                className="w-full border border-gray-300 rounded p-3 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
              />
            </section>

            <section>
              <h2 className="text-lg font-serif mb-4">Payment Method</h2>
              
              <div className={`border rounded p-4 mb-3 flex items-center gap-3 transition-colors ${
                paymentMethod === 'ONLINE' ? 'border-black bg-gray-50' : 'border-gray-300'
              }`}>
                <input 
                  type="radio" 
                  id="online" 
                  name="payment" 
                  checked={paymentMethod === 'ONLINE'} 
                  onChange={() => setPaymentMethod('ONLINE')}
                  className="accent-black w-4 h-4 cursor-pointer" 
                />
                <div className="flex-1">
                  <label htmlFor="online" className="text-sm font-medium cursor-pointer block">Pay Online (Dummy Test)</label>
                  <p className="text-xs text-gray-500 mt-1">Simulate online payment for testing.</p>
                </div>
              </div>

              <div className={`border rounded p-4 flex items-center gap-3 transition-colors ${
                isCODDisabled ? 'bg-gray-100 opacity-50 cursor-not-allowed border-gray-200' : 
                paymentMethod === 'COD' ? 'border-black bg-gray-50' : 'border-gray-300'
              }`}>
                <input 
                  type="radio" 
                  id="cod" 
                  name="payment" 
                  checked={paymentMethod === 'COD' && !isCODDisabled}
                  disabled={isCODDisabled}
                  onChange={() => setPaymentMethod('COD')}
                  className="accent-black w-4 h-4 cursor-pointer" 
                />
                <div className="flex-1">
                  <label htmlFor="cod" className={`text-sm font-medium ${isCODDisabled ? 'cursor-not-allowed' : 'cursor-pointer'} block`}>Cash on Delivery (COD)</label>
                  <p className="text-xs text-gray-500 mt-1">Pay with cash upon delivery.</p>
                </div>
              </div>
              
              {isCODDisabled && (
                <div className="mt-3 p-3 bg-red-50 text-red-600 text-xs rounded border border-red-100">
                  {isCODRestrictedByCoupon 
                    ? "Cash on Delivery is not available when a coupon code is applied."
                    : "Cash on Delivery is not available for some items in your cart."}
                </div>
              )}
            </section>

            <div className="pt-6">
              <button 
                type="submit"
                onMouseEnter={() => setCursorType('MAGNETIC')}
                onMouseLeave={() => setCursorType('DEFAULT')}
                className="w-full bg-black text-white py-4 rounded font-medium tracking-wide hover:bg-gray-800 transition-colors"
              >
                Complete Order
              </button>
            </div>
            
            <div className="text-center">
              <Link href="/shop" className="text-sm text-gray-500 hover:text-black transition-colors">
                &larr; Return to shopping
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Right Column: Order Summary */}
      <div className="w-full lg:w-2/5 p-4 md:p-8 lg:p-16 lg:pl-16 bg-[#FAFAFA] border-t lg:border-t-0 lg:border-l border-gray-200">
        <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="flex flex-col gap-6 mb-8">
            {cartItems.map((item, idx) => (
              <div key={idx} className="flex gap-4 items-center">
                <div className="relative">
                  <div className="w-16 h-20 rounded border border-gray-200 overflow-hidden relative bg-white">
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  </div>
                  <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm leading-tight mb-1">{item.name}</p>
                  <p className="text-xs text-gray-500">
                    {item.size && <span>Size: {item.size}</span>}
                    {item.size && item.color && <span> | </span>}
                    {item.color && <span>Color: {item.color}</span>}
                  </p>
                </div>
                <div className="text-sm font-medium">
                  ₹{(parseInt(item.price.replace(/[^\d]/g, ''), 10) * item.quantity).toLocaleString('en-IN')}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-200 py-6 space-y-3">
            {/* Coupon Section */}
            {!appliedCoupon ? (
              <form onSubmit={handleApplyCoupon} className="flex gap-2 mb-6">
                <input
                  type="text"
                  placeholder="Discount code"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className="flex-1 border border-gray-300 rounded px-4 py-2 text-sm focus:outline-none focus:border-black uppercase"
                />
                <button
                  type="submit"
                  disabled={isApplying || !couponInput.trim()}
                  className="bg-black text-white px-4 py-2 text-sm rounded disabled:opacity-50 hover:bg-gray-800 transition-colors"
                >
                  Apply
                </button>
              </form>
            ) : (
              <div className="flex items-center justify-between bg-gray-100 p-3 rounded mb-6 border border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold bg-black text-white px-2 py-1 rounded flex items-center gap-1">
                    {appliedCoupon.code}
                  </span>
                  <span className="text-xs text-gray-500">(-{appliedCoupon.discountPercent}%)</span>
                </div>
                <button type="button" onClick={handleRemoveCoupon} className="text-xs text-gray-500 hover:text-red-500 underline">
                  Remove
                </button>
              </div>
            )}
            
            {couponError && <p className="text-xs text-red-500 mt-1 mb-4">{couponError}</p>}

            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            
            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span className="font-medium">-₹{discount.toLocaleString('en-IN')}</span>
              </div>
            )}
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span className="font-medium">{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 flex justify-between items-end">
            <span className="text-base font-medium">Total</span>
            <span className="text-2xl font-serif">
              <span className="text-sm text-gray-500 mr-2">INR</span>
              ₹{total.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

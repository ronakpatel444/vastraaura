'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  Search, 
  ArrowRight, 
  AlertCircle,
  ShieldCheck,
  Building,
  ExternalLink,
  MessageCircle
} from 'lucide-react';

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id') || searchParams.get('orderId') || '';

  const [searchQuery, setSearchQuery] = useState(initialId);
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialId) {
      handleTrack(initialId);
    }
  }, [initialId]);

  const handleTrack = async (idToSearch?: string) => {
    const q = idToSearch || searchQuery;
    if (!q.trim()) {
      setError('Please enter your Order ID or registered Phone Number');
      return;
    }

    setIsLoading(true);
    setError('');
    setOrder(null);

    try {
      const res = await fetch(`/api/orders/track?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'No matching order found. Please check and try again.');
      }

      setOrder(data.order);
    } catch (err: any) {
      setError(err.message || 'Failed to find order');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50/60 pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto">
          <span className="text-xs uppercase tracking-widest text-neutral-500 font-semibold">Live Shipment Status</span>
          <h1 className="text-3xl sm:text-4xl font-serif text-neutral-900 mt-1">Track Your Royal Attire</h1>
          <p className="text-neutral-500 text-sm mt-2">
            Enter your Order ID (from invoice/email) or registered mobile number to see real-time courier updates.
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-3 sm:p-4 rounded-2xl shadow-sm border border-neutral-200 max-w-2xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleTrack();
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter Order ID (e.g. ORD-12345678) or Phone Number"
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-200 text-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all font-medium"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-neutral-900 text-white px-7 py-3 rounded-xl font-medium text-sm hover:bg-neutral-800 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 shrink-0"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Tracking...</span>
                </>
              ) : (
                <>
                  <span>Track Order</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* ORDER DETAILS & TRACKING TIMELINE */}
        {order && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Top Shipment Status Card */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-100 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs uppercase tracking-wider font-semibold text-neutral-400">Order ID</span>
                    <span className="font-mono text-base font-bold text-neutral-900">{order.displayId}</span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">Placed on {order.orderDate} • Payment: {order.paymentMethod}</p>
                </div>

                <div className="sm:text-right">
                  <span className="text-xs text-neutral-500 block">Estimated Delivery</span>
                  <span className="text-lg sm:text-xl font-serif font-bold text-green-700">
                    {order.estimatedDelivery}
                  </span>
                </div>
              </div>

              {/* Courier Partner Info */}
              <div className="py-4 flex flex-wrap items-center justify-between gap-3 text-xs bg-neutral-50 p-4 rounded-xl mt-6 border border-neutral-100">
                <div className="flex items-center gap-2">
                  <Truck size={18} className="text-neutral-700" />
                  <span className="text-neutral-600">Courier Partner:</span>
                  <strong className="text-neutral-900 font-semibold">{order.courierPartner}</strong>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-neutral-500">AWB No:</span>
                  <span className="bg-white px-2.5 py-1 rounded border text-neutral-800 font-bold">{order.trackingNumber}</span>
                </div>
                <div className="text-green-700 font-semibold flex items-center gap-1">
                  <ShieldCheck size={15} /> Verified Doorstep Pickup
                </div>
              </div>

              {/* FLIPKART / AMAZON STYLE TIMELINE */}
              <div className="mt-10 px-2 sm:px-6">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-800 mb-8">
                  Shipment Journey
                </h3>

                <div className="relative pl-6 sm:pl-8 border-l-2 border-neutral-200 space-y-8 pb-2">
                  {order.timeline.map((step: any, idx: number) => {
                    const isDone = step.step <= order.currentStep;
                    const isCurrent = step.step === order.currentStep;

                    return (
                      <div key={idx} className="relative group">
                        {/* Node circle */}
                        <div
                          className={`absolute -left-[31px] sm:-left-[39px] top-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                            isDone
                              ? 'bg-green-600 text-white shadow-md'
                              : 'bg-white border-2 border-neutral-300 text-neutral-400'
                          } ${isCurrent ? 'ring-4 ring-green-100' : ''}`}
                        >
                          {isDone ? (
                            <CheckCircle2 size={16} />
                          ) : (
                            <span className="text-xs font-semibold">{step.step}</span>
                          )}
                        </div>

                        {/* Step Details */}
                        <div className="space-y-1">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <h4
                              className={`text-sm sm:text-base font-semibold ${
                                isDone ? 'text-neutral-900' : 'text-neutral-400'
                              }`}
                            >
                              {step.title}
                            </h4>
                            {step.time && (
                              <span className="text-xs text-neutral-400 font-mono">
                                {step.time}
                              </span>
                            )}
                          </div>
                          <p
                            className={`text-xs sm:text-sm leading-relaxed ${
                              isDone ? 'text-neutral-600' : 'text-neutral-400'
                            }`}
                          >
                            {step.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Grid of Items and Shipping Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Ordered Items */}
              <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
                <div className="flex items-center gap-2 pb-4 mb-4 border-b border-neutral-100">
                  <Package size={18} className="text-neutral-700" />
                  <h3 className="font-semibold text-neutral-900 text-sm">Package Contents ({order.items?.length || 0})</h3>
                </div>

                <div className="space-y-4">
                  {order.items?.map((item: any, i: number) => (
                    <div key={i} className="flex gap-3.5 items-center">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-20 object-cover rounded-xl border border-neutral-100 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-neutral-900 truncate">{item.name}</h4>
                        <p className="text-xs text-neutral-500 mt-0.5">Size: <span className="font-semibold text-neutral-700">{item.size}</span> • Qty: {item.quantity}</p>
                        <p className="text-sm font-semibold text-neutral-900 mt-1">₹{item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-5 pt-4 border-t border-neutral-100 flex justify-between items-center text-sm font-semibold">
                  <span className="text-neutral-600">Total Order Value:</span>
                  <span className="font-serif text-base text-neutral-900">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Delivery Address & Help */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl border border-neutral-200 p-6 shadow-sm">
                  <div className="flex items-center gap-2 pb-4 mb-4 border-b border-neutral-100">
                    <MapPin size={18} className="text-neutral-700" />
                    <h3 className="font-semibold text-neutral-900 text-sm">Delivery Address</h3>
                  </div>

                  <div className="text-xs sm:text-sm text-neutral-700 space-y-1">
                    <p className="font-semibold text-neutral-900 text-sm">
                      {order.customer?.firstName} {order.customer?.lastName}
                    </p>
                    <p>{order.shippingAddress?.address}</p>
                    <p>
                      {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                    </p>
                    <p className="text-neutral-500 pt-1 flex items-center gap-1.5 font-mono">
                      <Phone size={13} /> {order.customer?.phone}
                    </p>
                  </div>
                </div>

                {/* Need Help Card */}
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 flex items-start gap-3">
                  <MessageCircle size={22} className="text-amber-800 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-amber-900">Have questions about your order?</h4>
                    <p className="text-xs text-amber-800/80 leading-relaxed">
                      Our concierge support team is ready to assist you on WhatsApp regarding delivery or sizing questions.
                    </p>
                    <a
                      href="https://wa.me/919876543210"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-amber-900 underline mt-2 hover:text-black"
                    >
                      Chat with Support on WhatsApp →
                    </a>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading tracker...</div>}>
      <TrackOrderContent />
    </Suspense>
  );
}

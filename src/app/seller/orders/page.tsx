'use client';

import { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Truck, 
  Package, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  X, 
  AlertCircle, 
  ShieldCheck, 
  Info,
  ArrowRight,
  ExternalLink,
  IndianRupee
} from 'lucide-react';
import Link from 'next/link';

interface Courier {
  id: string;
  name: string;
  logo: string;
  tagline: string;
  baseRate: number;
  rateDetails: string;
  weightSlab: string;
  deliveryTime: string;
  pickupTime: string;
  doorstepPickup: string;
  codHandling: string;
  trackingType: string;
  paymentModeNote: string;
  recommended: boolean;
}

export default function SellerOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State for Shipping
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedCourier, setSelectedCourier] = useState<Courier | null>(null);
  const [customTracking, setCustomTracking] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/seller/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
        if (data.couriers) {
          setCouriers(data.couriers);
          // Set first courier as default selection
          setSelectedCourier(data.couriers[0]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenShippingModal = (order: any) => {
    setSelectedOrder(order);
    setMessage(null);
    setCustomTracking(`AWB-${Math.floor(100000 + Math.random() * 900000)}`);
  };

  const handleConfirmShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !selectedCourier) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/seller/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder._id,
          courierPartner: selectedCourier.name,
          trackingNumber: customTracking,
          status: 'Shipped',
          shippingFee: selectedCourier.baseRate,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to schedule pickup');
      }

      setMessage({
        type: 'success',
        text: `Doorstep pickup successfully booked with ${selectedCourier.name}! Parcel charge ₹${selectedCourier.baseRate} will be adjusted from your payout settlement.`,
      });

      // Update local order status
      setOrders((prev) =>
        prev.map((o) =>
          o._id === selectedOrder._id
            ? {
                ...o,
                status: 'Shipped',
                courierPartner: selectedCourier.name,
                trackingNumber: customTracking,
              }
            : o
        )
      );

      setTimeout(() => {
        setSelectedOrder(null);
      }, 2500);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Error scheduling pickup' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-neutral-900">My Orders & Shipments</h1>
          <p className="text-neutral-500 text-sm mt-1">
            Manage incoming orders, choose your preferred courier partner, and schedule doorstep parcel pickups.
          </p>
        </div>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div className="flex justify-center py-20 bg-white rounded-2xl border border-neutral-200">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-12 text-center">
          <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900">No orders yet</h3>
          <p className="text-neutral-500 mt-2">When customers buy your products, the orders will appear here for dispatch.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
            <h3 className="font-semibold text-neutral-900">Order Management ({orders.length})</h3>
            <span className="text-xs text-neutral-400">Doorstep courier pickup enabled</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-600">
              <thead className="bg-neutral-50 text-neutral-900 border-b border-neutral-200 text-xs uppercase">
                <tr>
                  <th className="p-4 font-medium">Order ID</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Customer & City</th>
                  <th className="p-4 font-medium">Total</th>
                  <th className="p-4 font-medium">Payment</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Shipping Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {orders.map((order) => {
                  const isShipped = order.status === 'Shipped' || order.status === 'Delivered';

                  return (
                    <tr key={order._id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="p-4 font-mono font-bold text-neutral-900">
                        #{order._id.substring(order._id.length - 8).toUpperCase()}
                      </td>
                      <td className="p-4 text-neutral-500 whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-neutral-900">{order.customer?.firstName} {order.customer?.lastName || ''}</p>
                        <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                          <MapPin size={12} /> {order.shippingAddress?.city || 'Gujarat'}
                        </p>
                      </td>
                      <td className="p-4 font-serif font-bold text-neutral-900">
                        ₹{order.totalAmount?.toLocaleString('en-IN')}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          order.paymentMethod === 'Online' || order.status === 'Paid'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-neutral-100 text-neutral-800'
                        }`}>
                          {order.paymentMethod || 'COD'}
                        </span>
                      </td>
                      <td className="p-4">
                        {order.status === 'Delivered' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                            <CheckCircle2 size={13} /> Delivered
                          </span>
                        ) : order.status === 'Shipped' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            <Truck size={13} /> In Transit
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock size={13} /> Ready to Pack
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {isShipped ? (
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-xs font-semibold text-neutral-800 flex items-center gap-1">
                              <Truck size={13} className="text-neutral-500" />
                              {order.courierPartner || 'Delhivery Express'}
                            </span>
                            <span className="text-[11px] font-mono text-neutral-500">
                              AWB: {order.trackingNumber || 'DELH9821IN'}
                            </span>
                            <Link
                              href={`/track-order?id=${order._id}`}
                              target="_blank"
                              className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                            >
                              Live Status <ExternalLink size={10} />
                            </Link>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenShippingModal(order)}
                            className="bg-neutral-900 text-white text-xs font-medium px-4 py-2 rounded-xl hover:bg-neutral-800 transition-all cursor-pointer shadow-xs active:scale-95 inline-flex items-center gap-1.5"
                          >
                            <Truck size={14} />
                            Ship / Request Pickup
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: 5 COURIER SELECTION & DOORSTEP PICKUP DETAILS */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-neutral-200 overflow-hidden max-h-[90vh] flex flex-col">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-neutral-200 flex justify-between items-center bg-neutral-50/60">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-neutral-900 text-white rounded-xl">
                  <Truck size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-semibold text-neutral-900">
                    Schedule Doorstep Courier Pickup
                  </h3>
                  <p className="text-xs text-neutral-500">
                    Order #{selectedOrder._id.substring(selectedOrder._id.length - 8).toUpperCase()} • Delivery to {selectedOrder.shippingAddress?.city}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleConfirmShipment} className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* Feedback Alert */}
              {message && (
                <div
                  className={`p-4 rounded-xl text-xs flex items-center gap-2.5 ${
                    message.type === 'success'
                      ? 'bg-green-50 text-green-800 border border-green-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  <span className="leading-relaxed">{message.text}</span>
                </div>
              )}

              {/* Pickup Address Banner */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                <MapPin className="text-amber-800 shrink-0 mt-0.5" size={18} />
                <div className="text-xs text-amber-900 space-y-0.5">
                  <strong className="block font-semibold">Courier Executive will visit your Store / Home:</strong>
                  <p className="text-amber-800/90">
                    The delivery boy from your chosen courier company will come directly to your registered pickup address to collect this packed item.
                  </p>
                </div>
              </div>

              {/* COURIER PARTNER SELECTION (TOP 5) */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-2">
                  Select Courier Partner (Compare Rates & Speed)
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {couriers.map((c) => {
                    const isSelected = selectedCourier?.id === c.id;

                    return (
                      <div
                        key={c.id}
                        onClick={() => setSelectedCourier(c)}
                        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                          isSelected
                            ? 'border-neutral-900 bg-neutral-50 shadow-sm'
                            : 'border-neutral-200 hover:border-neutral-300 bg-white'
                        }`}
                      >
                        {c.recommended && (
                          <span className="absolute -top-2.5 right-3 bg-neutral-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            ★ Most Popular
                          </span>
                        )}

                        <div>
                          <div className="flex items-center justify-between">
                            <span className="text-xl">{c.logo}</span>
                            <span className="text-base font-serif font-bold text-neutral-900">
                              ₹{c.baseRate} <span className="text-[10px] text-neutral-400 font-sans font-normal">/ 500g</span>
                            </span>
                          </div>

                          <h4 className="font-semibold text-neutral-900 text-sm mt-2">{c.name}</h4>
                          <p className="text-[11px] text-neutral-500 mt-0.5">{c.tagline}</p>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-[11px]">
                          <span className="text-neutral-500">Speed:</span>
                          <span className="font-semibold text-neutral-800">{c.deliveryTime}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SELECTED COURIER DETAILED BREAKDOWN & PAYMENT CHARGES */}
              {selectedCourier && (
                <div className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{selectedCourier.logo}</span>
                      <div>
                        <h4 className="font-semibold text-neutral-900 text-sm">{selectedCourier.name} Rate Card</h4>
                        <p className="text-[11px] text-neutral-500">{selectedCourier.rateDetails}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-neutral-400 block uppercase">Parcel Charge</span>
                      <span className="text-lg font-serif font-bold text-neutral-900">₹{selectedCourier.baseRate}</span>
                    </div>
                  </div>

                  {/* Pricing & Logistics Specs */}
                  <div className="grid grid-cols-2 gap-y-2 text-xs">
                    <div>
                      <span className="text-neutral-500">Weight Slab:</span>
                      <p className="font-medium text-neutral-800">{selectedCourier.weightSlab}</p>
                    </div>
                    <div>
                      <span className="text-neutral-500">Doorstep Pickup:</span>
                      <p className="font-medium text-green-700">{selectedCourier.doorstepPickup}</p>
                    </div>
                    <div>
                      <span className="text-neutral-500">COD Handling:</span>
                      <p className="font-medium text-neutral-800">{selectedCourier.codHandling}</p>
                    </div>
                    <div>
                      <span className="text-neutral-500">Tracking:</span>
                      <p className="font-medium text-neutral-800">{selectedCourier.trackingType}</p>
                    </div>
                  </div>

                  {/* HOW PAYMENT WORKS FOR THIS PARCEL */}
                  <div className="mt-3 pt-3 border-t border-neutral-200/80 text-xs text-neutral-700 bg-white p-3 rounded-xl border border-neutral-200 flex items-start gap-2">
                    <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-neutral-900 block font-semibold">How shipping charge (₹{selectedCourier.baseRate}) is paid:</strong>
                      <p className="text-neutral-600 mt-0.5 leading-relaxed">
                        {selectedCourier.paymentModeNote}. You do not need to pay cash upfront. When customer receives the order, Admin clears your payout balance with this courier fee adjusted.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* AWB Tracking Number Preview */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-700 mb-1.5">
                  Generated AWB Tracking Number
                </label>
                <input
                  type="text"
                  required
                  value={customTracking}
                  onChange={(e) => setCustomTracking(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 font-mono text-sm font-semibold uppercase bg-neutral-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
                <span className="text-[11px] text-neutral-400 mt-1 block">
                  Customer will see this tracking number on their live Flipkart/Amazon style tracking screen.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-50 font-medium text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-neutral-900 text-white font-medium text-xs hover:bg-neutral-800 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-70 shadow-sm"
                >
                  {isSubmitting ? (
                    <span>Scheduling Pickup...</span>
                  ) : (
                    <>
                      <Truck size={14} />
                      Confirm & Schedule Doorstep Pickup (₹{selectedCourier?.baseRate})
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

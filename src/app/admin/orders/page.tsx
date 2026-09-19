'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { ExternalLink, Search } from 'lucide-react';
import Image from 'next/image';

export default function AdminOrdersPage() {
  const { adminOrders, fetchOrders, updateOrderStatus } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = adminOrders.filter(order => 
    order._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customer?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.customer?.lastName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Paid': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Processing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Shipped': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Delivered': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Orders</h1>
        <p className="text-sm md:text-base text-gray-500">Manage all customer orders and update their status.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div className="relative w-full sm:w-auto">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by ID or Name..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black w-full sm:w-64"
            />
          </div>
        </div>

        {/* Orders List */}
        <div className="divide-y divide-gray-200">
          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No orders found.</div>
          ) : (
            filteredOrders.map(order => (
              <div key={order._id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  {/* Left: Order Info & Customer */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-lg">Order #{order._id?.substring(order._id.length - 8).toUpperCase()}</h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-md border ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-semibold text-gray-700 mb-1">Customer Details</p>
                        <p>{order.customer?.firstName} {order.customer?.lastName}</p>
                        <p className="text-gray-600">{order.customer?.email}</p>
                        <p className="text-gray-600">{order.customer?.phone}</p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-700 mb-1">Shipping Address</p>
                        <p>{order.shippingAddress?.address}</p>
                        <p>{order.shippingAddress?.city}, {order.shippingAddress?.state}</p>
                        <p>{order.shippingAddress?.pincode}</p>
                      </div>
                    </div>

                    {/* Status Updater */}
                    <div className="pt-2 flex items-center gap-3">
                      <label className="text-sm font-medium text-gray-700">Update Status:</label>
                      <select 
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                        className="border border-gray-300 rounded-md text-sm px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-black"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Paid">Paid</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {/* Right: Items & Summary */}
                  <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="font-semibold text-sm mb-3">Order Items</h4>
                    <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                      {order.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex gap-3 text-sm bg-white p-2 rounded border border-gray-100">
                          <div className="w-12 h-16 relative bg-gray-100 rounded overflow-hidden flex-shrink-0">
                            {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium line-clamp-1">{item.name}</p>
                            <p className="text-xs text-gray-500 mb-1">Qty: {item.quantity} | Size: {item.size}</p>
                            {item.originalSellerLink && (
                              <a 
                                href={item.originalSellerLink} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium bg-blue-50 px-2 py-1 rounded inline-flex w-fit"
                              >
                                View Original Seller <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          <div className="font-medium text-right">
                            {item.price}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="border-t border-gray-200 pt-3 space-y-1.5 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Subtotal</span>
                        <span>₹{order.subtotal?.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Shipping</span>
                        <span>₹{order.shippingFee?.toLocaleString('en-IN')}</span>
                      </div>
                      {order.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Discount</span>
                          <span>-₹{order.discount?.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold pt-2 border-t border-gray-200 text-base">
                        <span>Total</span>
                        <span>₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 pt-1">
                        <span>Payment Method</span>
                        <span className="font-medium uppercase">{order.paymentMethod}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

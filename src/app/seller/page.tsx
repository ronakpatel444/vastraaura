'use client';
import { useState, useEffect } from 'react';
import { Package, ShoppingBag, TrendingUp, Wallet } from 'lucide-react';

export default function SellerDashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    activeCampaigns: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/seller/stats')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStats(data.stats);
          if (data.recentOrders) {
            setRecentOrders(data.recentOrders);
          }
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif text-neutral-900">Seller Dashboard</h1>
        <p className="text-neutral-500 mt-2">Welcome back to your store overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<TrendingUp className="text-blue-600" />} title="Gross Sales" value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`} subtitle={`${stats.totalOrders} total orders`} />
        <StatCard icon={<Wallet className="text-green-600" />} title="Net Seller Payout" value={`₹${((stats as any).netPayout || stats.totalRevenue).toLocaleString('en-IN')}`} subtitle="Shipping fees deducted" />
        <StatCard icon={<ShoppingBag className="text-purple-600" />} title="Total Orders" value={stats.totalOrders.toString()} subtitle="Delivered & active" />
        <StatCard icon={<Package className="text-orange-600" />} title="Active Products" value={stats.totalProducts.toString()} subtitle="Live on store" />
      </div>
      
      {/* Chart and Recent Orders Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 flex flex-col justify-between h-96">
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-medium text-neutral-900">Sales Overview</h3>
             <span className="text-sm text-neutral-500">Last 7 Days</span>
          </div>
          <div className="flex-1 flex items-end gap-2 pb-4">
             {/* Dummy bar chart */}
             {[40, 70, 45, 90, 65, 85, 110].map((h, i) => (
                <div key={i} className="flex-1 bg-blue-100 rounded-t-sm hover:bg-blue-200 transition-colors relative group" style={{ height: `${h}%` }}>
                   <span className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-xs py-1 px-2 rounded transition-opacity">₹{h*100}</span>
                </div>
             ))}
          </div>
          <div className="flex justify-between text-xs text-neutral-400 mt-2">
             <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
          <h3 className="font-medium text-neutral-900 mb-6">Recent Orders</h3>
          <div className="space-y-4">
             {recentOrders.length > 0 ? recentOrders.map((order: any, i: number) => (
               <div key={i} className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-600 font-medium">
                   {order.customerName.charAt(0)}
                 </div>
                 <div className="flex-1">
                   <p className="text-sm font-medium text-neutral-900">{order.customerName}</p>
                   <p className="text-xs text-neutral-500">{order.itemCount} items • ₹{order.totalAmount}</p>
                 </div>
                 <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">{order.status}</span>
               </div>
             )) : (
               <p className="text-sm text-neutral-500 text-center">No recent orders found</p>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, subtitle }: any) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-neutral-500 font-medium">{title}</h3>
        <div className="p-2 bg-neutral-50 rounded-lg">{icon}</div>
      </div>
      <div className="text-3xl font-serif text-neutral-900 mb-1">{value}</div>
      <p className="text-sm text-neutral-400">{subtitle}</p>
    </div>
  );
}

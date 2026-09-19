'use client';

import { useEffect, useMemo } from 'react';
import { DollarSign, ShoppingCart, Users as UsersIcon, TrendingUp } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function AdminDashboardPage() {
  const { adminOrders, fetchOrders } = useStore();

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const stats = useMemo(() => {
    const totalOrders = adminOrders.length;
    const totalRevenue = adminOrders.reduce((sum, order) => {
      // only count paid or COD orders towards revenue
      if (order.status === 'Paid' || order.paymentMethod === 'COD') {
        return sum + (order.totalAmount || 0);
      }
      return sum;
    }, 0);
    
    const uniqueCustomers = new Set(adminOrders.map(o => o.customer?.email)).size;

    return [
      { title: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN')}`, change: 'Live', icon: DollarSign },
      { title: 'Total Orders', value: totalOrders.toString(), change: 'Live', icon: ShoppingCart },
      { title: 'Active Customers', value: uniqueCustomers.toString(), change: 'Live', icon: UsersIcon },
      { title: 'Conversion Rate', value: 'N/A', change: 'Live', icon: TrendingUp },
    ];
  }, [adminOrders]);

  return (
    <div className="p-10 max-w-7xl">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
        <p className="text-gray-500">Welcome back. Here is what's happening with your store today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-gray-700" />
              </div>
              <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">{stat.change}</span>
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">{stat.title}</h3>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
          <button className="text-sm text-accent font-medium hover:underline">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-6 py-4 font-medium">Order ID</th>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Amount</th>
                <th className="px-6 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {adminOrders.slice(0, 5).map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 line-clamp-1 max-w-[120px] truncate" title={order._id}>{order._id}</td>
                  <td className="px-6 py-4">{order.customer?.firstName} {order.customer?.lastName}</td>
                  <td className="px-6 py-4 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-medium">₹{order.totalAmount?.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      order.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'Paid' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
              {adminOrders.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No orders found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

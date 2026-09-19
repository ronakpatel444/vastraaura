'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Mail, Phone, ExternalLink } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function AdminCustomersPage() {
  const { adminOrders, fetchOrders } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const customers = useMemo(() => {
    const customerMap = new Map();

    adminOrders.forEach(order => {
      if (!order.customer || !order.customer.email) return;
      
      const email = order.customer.email;
      if (!customerMap.has(email)) {
        customerMap.set(email, {
          id: `CUS-${email.substring(0, 5).toUpperCase()}`,
          name: `${order.customer.firstName} ${order.customer.lastName}`,
          email: email,
          phone: order.customer.phone || 'N/A',
          orders: 0,
          spent: 0,
          joined: new Date(order.createdAt).toLocaleDateString()
        });
      }

      const c = customerMap.get(email);
      c.orders += 1;
      if (order.status === 'Paid' || order.paymentMethod === 'COD') {
        c.spent += (order.totalAmount || 0);
      }
    });

    return Array.from(customerMap.values());
  }, [adminOrders]);

  const filteredCustomers = useMemo(() => {
    if (!searchQuery) return customers;
    const lowerQuery = searchQuery.toLowerCase();
    return customers.filter(c => 
      c.name.toLowerCase().includes(lowerQuery) || 
      c.email.toLowerCase().includes(lowerQuery) ||
      c.phone.includes(lowerQuery)
    );
  }, [customers, searchQuery]);

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Customers</h1>
        <p className="text-sm md:text-base text-gray-500">View and manage your registered customers.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
          <div className="relative w-full sm:w-auto">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search customers..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black w-full sm:w-64"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 font-medium">Customer</th>
                <th className="px-6 py-4 font-medium">Contact</th>
                <th className="px-6 py-4 font-medium">Orders</th>
                <th className="px-6 py-4 font-medium">Total Spent</th>
                <th className="px-6 py-4 font-medium">Joined</th>
                <th className="px-6 py-4 font-medium text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCustomers.map((customer) => (
                <tr key={customer.email} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{customer.name}</div>
                    <div className="text-xs text-gray-500">{customer.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600 mb-1">
                      <Mail className="w-3 h-3" /> {customer.email}
                    </div>
                    <div className="flex items-center gap-2 text-gray-500 text-xs">
                      <Phone className="w-3 h-3" /> {customer.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-700">{customer.orders}</td>
                  <td className="px-6 py-4 font-medium text-green-700">₹{customer.spent.toLocaleString('en-IN')}</td>
                  <td className="px-6 py-4 text-gray-500">{customer.joined}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-400 hover:text-black transition-colors inline-flex items-center justify-center p-2 rounded-lg hover:bg-gray-100">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">No customers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

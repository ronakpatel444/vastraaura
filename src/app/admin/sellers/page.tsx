'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Store, MapPin, Eye } from 'lucide-react';
import Link from 'next/link';

export default function AdminSellers() {
  const [sellers, setSellers] = useState<any[]>([]);

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    try {
      const res = await fetch('/api/admin/sellers');
      const data = await res.json();
      if (res.ok) setSellers(data.sellers);
    } catch (err) {
      console.error('Failed to fetch sellers');
    }
  };

  const updateStatus = async (id: string, status: string, reason?: string) => {
    try {
      const res = await fetch('/api/admin/sellers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sellerId: id, status, reason }),
      });
      if (res.ok) fetchSellers(); // Refresh list
    } catch (err) {
      console.error('Failed to update status');
    }
  };

  const handleApprove = (id: string) => updateStatus(id, 'active');
  const handleReject = (id: string) => {
    const reason = prompt("Please provide a reason for rejecting this seller:");
    if (reason !== null) {
      updateStatus(id, 'rejected', reason);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-serif text-neutral-900 mb-6">Manage Sellers</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 text-neutral-500 text-sm border-b border-neutral-200">
                <th className="p-4 font-medium">Seller Info</th>
                <th className="p-4 font-medium">Business Details</th>
                <th className="p-4 font-medium">Status</th>
                <th className="p-4 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sellers.map((seller) => (
                <tr key={seller._id} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="p-4">
                    <Link href={`/admin/sellers/${seller._id}`} className="font-medium text-neutral-900 hover:text-accent hover:underline">
                      {seller.name}
                    </Link>
                  </td>
                  <td className="p-4">
                    <p className="text-neutral-900 font-medium flex items-center gap-2"><Store size={14} /> {seller.businessName}</p>
                    <p className="text-xs text-neutral-500 mt-1">{seller.sellingCategories?.join(', ')} • {seller.hasOfflineShop ? 'Offline Shop' : 'Online Only'}</p>
                  </td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      seller.status === 'active' ? 'bg-green-100 text-green-700' : 
                      seller.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-red-100 text-red-700'
                    }`}>
                      {seller.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Link href={`/admin/sellers/${seller._id}`} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100" title="View Profile">
                        <Eye size={18} />
                      </Link>
                      {seller.status === 'pending' && (
                        <>
                          <button onClick={() => handleApprove(seller._id)} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100" title="Approve"><Check size={18} /></button>
                          <button onClick={() => handleReject(seller._id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100" title="Reject"><X size={18} /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

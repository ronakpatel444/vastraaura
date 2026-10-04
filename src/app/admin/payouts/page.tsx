'use client';

import { useState, useEffect } from 'react';
import { Check, X, CreditCard, Banknote, Building2 } from 'lucide-react';

export default function AdminPayouts() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayouts();
  }, []);

  const fetchPayouts = async () => {
    try {
      const res = await fetch('/api/admin/payouts');
      const data = await res.json();
      if (res.ok && data.payouts) {
        setPayouts(data.payouts);
      }
    } catch (err) {
      console.error('Failed to fetch payouts');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    if (status === 'Paid') {
      const confirmPaid = confirm("Are you sure you want to mark this as Paid? You should have already transferred the money.");
      if (!confirmPaid) return;
    }

    try {
      const res = await fetch('/api/admin/payouts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payoutId: id, status }),
      });
      if (res.ok) {
        fetchPayouts(); // Refresh list
      }
    } catch (err) {
      console.error('Failed to update payout status');
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-neutral-900 mb-2">Seller Payouts</h1>
        <p className="text-neutral-500">Manage withdrawal requests and view seller sales breakdowns (Online vs COD).</p>
      </div>
      
      {loading ? (
        <div className="text-center p-10 text-neutral-500">Loading payout requests...</div>
      ) : payouts.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-10 text-center text-neutral-500">
          No payout requests found.
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 text-neutral-500 text-sm border-b border-neutral-200">
                  <th className="p-4 font-medium">Request Date</th>
                  <th className="p-4 font-medium">Seller Info</th>
                  <th className="p-4 font-medium">Seller's Total Sales</th>
                  <th className="p-4 font-medium">Payout Request</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout) => (
                  <tr key={payout._id} className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
                    <td className="p-4 text-sm text-neutral-600">
                      {new Date(payout.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-neutral-900 flex items-center gap-2">
                        <Building2 size={14} /> {payout.sellerDetails?.businessName || 'N/A'}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">{payout.sellerDetails?.name}</p>
                    </td>
                    <td className="p-4">
                      <div className="text-sm">
                        <p className="text-green-600 flex items-center gap-1"><CreditCard size={12}/> Online: ₹{(payout.sellerDetails?.online || 0).toLocaleString()}</p>
                        <p className="text-orange-500 flex items-center gap-1 mt-1"><Banknote size={12}/> COD: ₹{(payout.sellerDetails?.cod || 0).toLocaleString()}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-neutral-900 text-lg">₹{payout.amount?.toLocaleString()}</p>
                      <p className="text-xs text-neutral-500 mt-1 truncate max-w-[150px]" title={payout.method}>{payout.method}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        payout.status === 'Paid' ? 'bg-green-100 text-green-700' : 
                        payout.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-red-100 text-red-700'
                      }`}>
                        {payout.status?.toUpperCase() || 'PENDING'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {payout.status === 'Pending' && (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => updateStatus(payout._id, 'Paid')} 
                            className="bg-neutral-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-neutral-800 transition-colors flex items-center gap-1"
                          >
                            <Check size={14} /> Mark Paid
                          </button>
                          <button 
                            onClick={() => updateStatus(payout._id, 'Rejected')} 
                            className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors flex items-center gap-1"
                          >
                            <X size={14} /> Reject
                          </button>
                        </div>
                      )}
                      {payout.status === 'Paid' && (
                        <span className="text-xs text-neutral-500">Ref: {payout.reference}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

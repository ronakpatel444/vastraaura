'use client';

import { useEffect, useState } from 'react';
import { Wallet, ArrowUpRight, Clock, CheckCircle2 } from 'lucide-react';

interface Payout {
  id: string;
  date: string;
  amount: number;
  status: string;
  method: string;
  reference: string;
}

export default function InfluencerEarnings() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState('');

  useEffect(() => {
    async function fetchPayouts() {
      try {
        const res = await fetch('/api/influencer/earnings');
        const data = await res.json();
        setPayouts(data);
      } catch (error) {
        console.error('Failed to fetch payouts');
      } finally {
        setIsLoading(false);
      }
    }
    fetchPayouts();
  }, []);

  const totalEarned = payouts.filter(p => p.status === 'Paid').reduce((acc, p) => acc + p.amount, 0);
  const pendingAmount = payouts.filter(p => p.status === 'Pending').reduce((acc, p) => acc + p.amount, 0);

  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(payoutAmount);
    if (!isNaN(amountNum) && amountNum >= 1000) {
      const newPayout = {
        id: 'PAY-' + Math.floor(Math.random() * 1000),
        date: new Date().toISOString(),
        amount: amountNum,
        status: 'Pending',
        method: 'Bank Transfer',
        reference: 'Processing'
      };
      setPayouts([newPayout, ...payouts]);
      setPayoutAmount('');
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif text-neutral-900">Payouts & Earnings</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors"
        >
          Request Payout
        </button>
      </div>

      {/* Custom Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-xl font-serif text-neutral-900 mb-4">Request Payout</h2>
            <form onSubmit={handleRequestPayout}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-2">Amount to Withdraw (Min ₹1000)</label>
                <input 
                  type="number" 
                  required
                  min="1000"
                  placeholder="e.g. 1500"
                  className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-pink-600 text-white hover:bg-pink-700 transition-colors"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-neutral-500">Total Earned</p>
              <h3 className="text-3xl font-serif text-neutral-900 mt-2">₹{totalEarned.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
              <Wallet size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-neutral-500">Pending Clearance</p>
              <h3 className="text-3xl font-serif text-neutral-900 mt-2">₹{pendingAmount.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Clock size={24} />
            </div>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
        </div>
      ) : payouts.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200">
            <h3 className="font-medium text-neutral-900">Payout History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-600">
              <thead className="bg-neutral-50 text-neutral-900 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Date</th>
                  <th className="px-6 py-4 font-medium">Amount</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Payment Method</th>
                  <th className="px-6 py-4 font-medium text-right">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {payouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(payout.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 font-medium text-neutral-900">
                      ₹{payout.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {payout.status === 'Paid' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          <CheckCircle2 size={14} /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock size={14} /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {payout.method}
                    </td>
                    <td className="px-6 py-4 text-right text-xs font-mono text-neutral-500">
                      {payout.reference}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 text-center">
          <Wallet className="w-12 h-12 text-pink-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900">No earnings yet</h3>
          <p className="text-neutral-500 mt-2">Track your fixed collaboration payouts here.</p>
        </div>
      )}
    </div>
  );
}

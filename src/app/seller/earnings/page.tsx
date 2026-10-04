'use client';

import { useEffect, useState } from 'react';
import { 
  Wallet, 
  Clock, 
  CheckCircle2, 
  X, 
  IndianRupee, 
  Building, 
  Smartphone, 
  AlertCircle,
  ArrowUpRight,
  ShieldCheck,
  Truck,
  TrendingUp,
  Receipt,
  Info
} from 'lucide-react';

interface Payout {
  id: string;
  date: string;
  amount: number;
  status: string;
  method: string;
  reference: string;
  notes?: string;
}

interface Summary {
  totalOrders: number;
  grossSales: number;
  avgShippingPerOrder: number;
  shippingDeductions: number;
  platformCommission: number;
  netEarnings: number;
  totalPaid: number;
  pendingClearance: number;
  availableBalance: number;
}

export default function SellerEarnings() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalOrders: 100,
    grossSales: 100000,
    avgShippingPerOrder: 60,
    shippingDeductions: 6000,
    platformCommission: 0,
    netEarnings: 94000,
    totalPaid: 37500,
    pendingClearance: 7500,
    availableBalance: 49000,
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'bank' | 'upi'>('bank');
  const [bankDetails, setBankDetails] = useState({
    accountName: '',
    bankName: 'State Bank of India',
    accountNumber: '',
    ifscCode: '',
    upiId: '',
  });
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    fetchPayouts();
  }, []);

  async function fetchPayouts() {
    try {
      setIsLoading(true);
      const res = await fetch('/api/seller/earnings');
      const data = await res.json();
      if (data.success) {
        if (Array.isArray(data.payouts)) setPayouts(data.payouts);
        if (data.summary) setSummary(data.summary);
      } else if (Array.isArray(data)) {
        setPayouts(data);
      }
    } catch (error) {
      console.error('Failed to fetch payouts');
    } finally {
      setIsLoading(false);
    }
  }

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSuccessMessage('');

    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount < 1000) {
      setFormError('Minimum withdrawal amount is ₹1,000');
      return;
    }

    if (summary.availableBalance && parsedAmount > summary.availableBalance) {
      setFormError(`Amount cannot exceed your available balance of ₹${summary.availableBalance.toLocaleString('en-IN')}`);
      return;
    }

    if (method === 'bank') {
      if (!bankDetails.accountNumber || !bankDetails.ifscCode) {
        setFormError('Please enter Account Number and IFSC Code');
        return;
      }
    } else {
      if (!bankDetails.upiId || !bankDetails.upiId.includes('@')) {
        setFormError('Please enter a valid UPI ID (e.g. mobile@upi)');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/seller/earnings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parsedAmount,
          method: method === 'bank' ? 'Bank Transfer' : 'UPI',
          bankDetails: method === 'bank' ? {
            accountName: bankDetails.accountName,
            bankName: bankDetails.bankName,
            accountNumber: bankDetails.accountNumber,
            ifscCode: bankDetails.ifscCode,
          } : {
            upiId: bankDetails.upiId,
          },
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit payout request');
      }

      if (data.payout) {
        setPayouts((prev) => [data.payout, ...prev]);
        setSummary((prev) => ({
          ...prev,
          pendingClearance: prev.pendingClearance + parsedAmount,
          availableBalance: Math.max(0, prev.availableBalance - parsedAmount),
        }));
      }

      setSuccessMessage(`Payout request of ₹${parsedAmount.toLocaleString()} submitted successfully! Admin will transfer it to your bank within 24-48 hours.`);
      setAmount('');
      setNotes('');
      setTimeout(() => {
        setIsModalOpen(false);
        setSuccessMessage('');
      }, 2500);
    } catch (err: any) {
      setFormError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-neutral-900">Earnings & Payout Settlement</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Transparent revenue breakdown, shipping fee adjustments, and instant withdrawal requests.
          </p>
        </div>
        <button
          onClick={() => {
            setFormError('');
            setSuccessMessage('');
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-neutral-900 text-white px-5 py-2.5 rounded-xl hover:bg-neutral-800 transition-all shadow-sm active:scale-95 font-medium cursor-pointer"
        >
          <ArrowUpRight size={18} />
          Request Payout
        </button>
      </div>

      {/* DETAILED FINANCIAL STATEMENT CARD (Gross Sales - Shipping = Net Payable) */}
      <div className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-neutral-700/80">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-amber-400 font-semibold mb-1">
              <Receipt size={14} /> Settlement Breakdown
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif text-white">
              Net Payable to Seller: <span className="text-amber-300 font-bold">₹{summary.netEarnings.toLocaleString('en-IN')}</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-1">
              Calculated as Gross Product Sales minus actual Doorstep Courier charges.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-left sm:text-right">
            <span className="text-xs text-neutral-300 block">Available to Withdraw Now</span>
            <span className="text-2xl font-serif font-bold text-green-400">
              ₹{summary.availableBalance.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* The Math Formula Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 text-sm">
          
          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <div className="flex items-center justify-between text-neutral-400 text-xs">
              <span>Gross Product Sales</span>
              <TrendingUp size={14} className="text-blue-400" />
            </div>
            <div className="text-xl font-bold font-serif text-white mt-1">
              ₹{summary.grossSales.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-neutral-400 block mt-0.5">{summary.totalOrders} Delivered Orders</span>
          </div>

          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <div className="flex items-center justify-between text-neutral-400 text-xs">
              <span>Shipping Fee Deductions</span>
              <Truck size={14} className="text-red-400" />
            </div>
            <div className="text-xl font-bold font-serif text-red-400 mt-1">
              - ₹{summary.shippingDeductions.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-neutral-400 block mt-0.5">
              Avg ₹{summary.avgShippingPerOrder}/parcel ({summary.totalOrders} orders)
            </span>
          </div>

          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <div className="flex items-center justify-between text-neutral-400 text-xs">
              <span>Platform Commission</span>
              <ShieldCheck size={14} className="text-green-400" />
            </div>
            <div className="text-xl font-bold font-serif text-green-400 mt-1">
              ₹{summary.platformCommission} (0%)
            </div>
            <span className="text-[11px] text-green-300 block mt-0.5">Special Partner Promo</span>
          </div>

          <div className="bg-white/5 p-4 rounded-xl border border-white/10">
            <div className="flex items-center justify-between text-neutral-400 text-xs">
              <span>Already Transferred</span>
              <Wallet size={14} className="text-green-400" />
            </div>
            <div className="text-xl font-bold font-serif text-white mt-1">
              ₹{summary.totalPaid.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-neutral-400 block mt-0.5">Directly to your bank</span>
          </div>

        </div>

        {/* Explanatory Footer Note */}
        <div className="mt-6 pt-4 border-t border-neutral-700/60 flex items-start gap-2 text-xs text-neutral-300">
          <Info size={16} className="text-amber-400 shrink-0 mt-0.5" />
          <span>
            <strong>Calculation Example:</strong> If you sell 100 lehengas worth ₹1,00,000, courier doorstep pickup fee (₹60 × 100 = ₹6,000) is deducted at source. You receive exactly <strong>₹94,000</strong> net in your bank account!
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-neutral-500">Total Payouts Received</p>
              <h3 className="text-3xl font-serif text-neutral-900 mt-2">
                ₹{summary.totalPaid.toLocaleString('en-IN')}
              </h3>
              <p className="text-xs text-neutral-400 mt-1">Directly credited to your registered bank account</p>
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
              <h3 className="text-3xl font-serif text-neutral-900 mt-2">
                ₹{summary.pendingClearance.toLocaleString('en-IN')}
              </h3>
              <p className="text-xs text-amber-600 mt-1 font-medium">Under admin review or bank clearance</p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Clock size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Payout History Table */}
      {isLoading ? (
        <div className="flex justify-center py-16 bg-white rounded-2xl border border-neutral-200">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
        </div>
      ) : payouts.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200 flex justify-between items-center">
            <h3 className="font-semibold text-neutral-900">Payout Settlement History</h3>
            <span className="text-xs text-neutral-400">Total {payouts.length} transactions</span>
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
                  <tr key={payout.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-neutral-700">
                      {new Date(payout.date).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 font-semibold text-neutral-900">
                      ₹{payout.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      {payout.status === 'Paid' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                          <CheckCircle2 size={13} /> Paid
                        </span>
                      ) : payout.status === 'Rejected' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                          <AlertCircle size={13} /> Rejected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                          <Clock size={13} /> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-neutral-700">
                      {payout.method}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-xs text-neutral-500">
                      {payout.reference}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-12 text-center">
          <Wallet className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900">No payouts yet</h3>
          <p className="text-neutral-500 mt-2 max-w-md mx-auto">
            Once you receive orders and deliver products, your earnings will appear here and you can withdraw them directly to your bank account.
          </p>
        </div>
      )}

      {/* Request Payout Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-neutral-200 overflow-hidden transform transition-all">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-neutral-200 flex justify-between items-center bg-neutral-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-neutral-900 text-white rounded-xl">
                  <IndianRupee size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-serif font-semibold text-neutral-900">Request Payout</h3>
                  <p className="text-xs text-neutral-500">
                    Available Balance: <strong className="text-green-700">₹{summary.availableBalance.toLocaleString('en-IN')}</strong>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleRequestPayout} className="p-6 space-y-5">
              
              {/* Messages */}
              {formError && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {successMessage && (
                <div className="p-3.5 bg-green-50 border border-green-200 text-green-700 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} className="shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Amount Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                  Withdrawal Amount (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 font-semibold">₹</span>
                  <input
                    type="number"
                    min="1000"
                    max={summary.availableBalance || 1000000}
                    step="100"
                    required
                    placeholder="Enter amount (min ₹1,000)"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent text-neutral-900 font-medium text-base transition-all"
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  {[5000, 10000, 25000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setAmount(val.toString())}
                      className="px-2.5 py-1 text-xs rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 transition-colors"
                    >
                      +₹{val.toLocaleString()}
                    </button>
                  ))}
                  {summary.availableBalance > 0 && (
                    <button
                      type="button"
                      onClick={() => setAmount(summary.availableBalance.toString())}
                      className="px-2.5 py-1 text-xs rounded-lg border border-neutral-900 bg-neutral-900 text-white font-medium hover:bg-neutral-800 transition-colors"
                    >
                      Full Balance (₹{summary.availableBalance.toLocaleString()})
                    </button>
                  )}
                </div>
              </div>

              {/* Payout Method */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                  Payout Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMethod('bank')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                      method === 'bank'
                        ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                        : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <Building size={16} />
                    Bank Transfer
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod('upi')}
                    className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${
                      method === 'upi'
                        ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                        : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    <Smartphone size={16} />
                    UPI / QR
                  </button>
                </div>
              </div>

              {/* Dynamic Bank / UPI Details */}
              {method === 'bank' ? (
                <div className="space-y-3 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">Account Holder Name</label>
                    <input
                      type="text"
                      placeholder="Name as per Bank Passbook"
                      value={bankDetails.accountName}
                      onChange={(e) => setBankDetails({ ...bankDetails, accountName: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs text-neutral-500 mb-1">Account Number <span className="text-red-500">*</span></label>
                      <input
                        type="password"
                        placeholder="e.g. 5010023456789"
                        value={bankDetails.accountNumber}
                        onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                        className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-neutral-500 mb-1">IFSC Code <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        placeholder="e.g. SBIN0001234"
                        value={bankDetails.ifscCode}
                        onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900 font-mono uppercase"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                  <div>
                    <label className="block text-xs text-neutral-500 mb-1">UPI ID / VPA <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      placeholder="e.g. yourname@okaxis, 9876543210@paytm"
                      value={bankDetails.upiId}
                      onChange={(e) => setBankDetails({ ...bankDetails, upiId: e.target.value })}
                      className="w-full px-3 py-2 text-sm bg-white rounded-lg border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                    />
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Settlement for September orders"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              {/* Security Badge */}
              <div className="flex items-center gap-2 text-xs text-neutral-500 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                <ShieldCheck size={16} className="text-green-600 shrink-0" />
                <span>Payouts are verified by Admin and transferred directly into your registered bank or UPI within 24-48 business hours.</span>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-50 font-medium text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-neutral-900 text-white font-medium text-sm hover:bg-neutral-800 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <span>Submit Request</span>
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

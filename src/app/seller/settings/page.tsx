'use client';

import { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle,
  Save,
  Store
} from 'lucide-react';

export default function SellerSettings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    businessName: '',
    phoneNumber: '',
    panCardNumber: '',
    gstNumber: '',
    hasOfflineShop: false,
    pickupAddress: {
      address: '',
      city: '',
      state: 'Gujarat',
      pincode: '',
    },
    bankDetails: {
      accountName: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
    },
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/seller/settings');
        const data = await res.json();
        if (res.ok && data) {
          setFormData((prev) => ({
            ...prev,
            businessName: data.businessName || '',
            phoneNumber: data.phoneNumber || '',
            panCardNumber: data.panCardNumber || '',
            gstNumber: data.gstNumber || '',
            hasOfflineShop: Boolean(data.hasOfflineShop),
            pickupAddress: {
              address: data.pickupAddress?.address || '',
              city: data.pickupAddress?.city || '',
              state: data.pickupAddress?.state || 'Gujarat',
              pincode: data.pickupAddress?.pincode || '',
            },
            bankDetails: {
              accountName: data.bankDetails?.accountName || '',
              bankName: data.bankDetails?.bankName || '',
              accountNumber: data.bankDetails?.accountNumber || '',
              ifscCode: data.bankDetails?.ifscCode || '',
            },
          }));
        }
      } catch (e) {
        console.error('Failed to load settings', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess(false);

    try {
      const res = await fetch('/api/seller/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save settings');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-serif text-neutral-900">Store Settings</h1>
        <p className="text-sm text-neutral-500 mt-1">
          Manage your business information, pickup location, and bank account for payouts.
        </p>
      </div>

      {success && (
        <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl flex items-center gap-2">
          <CheckCircle2 size={18} />
          <span>Your store and payout settings have been saved successfully!</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 md:p-8">
          <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-neutral-100">
            <Store className="text-neutral-700" size={20} />
            <h2 className="text-lg font-serif font-semibold text-neutral-900">Business Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                Business / Store Name
              </label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-neutral-900 outline-none transition-all"
                placeholder="e.g. Royal Heritage Studio"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                Support Phone Number
              </label>
              <input
                type="text"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-neutral-900 outline-none transition-all"
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                PAN Card Number
              </label>
              <input
                type="text"
                value={formData.panCardNumber}
                onChange={(e) => setFormData({ ...formData, panCardNumber: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-neutral-900 outline-none uppercase font-mono transition-all"
                placeholder="ABCDE1234F"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                GSTIN Number (Optional)
              </label>
              <input
                type="text"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-neutral-900 outline-none uppercase font-mono transition-all"
                placeholder="24ABCDE1234F1Z5"
              />
            </div>
          </div>
        </div>

        {/* Pickup & Dispatch Address */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 md:p-8">
          <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-neutral-100">
            <MapPin className="text-neutral-700" size={20} />
            <h2 className="text-lg font-serif font-semibold text-neutral-900">Pickup & Dispatch Address</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                Address Line / Shop No.
              </label>
              <input
                type="text"
                value={formData.pickupAddress.address}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    pickupAddress: { ...formData.pickupAddress, address: e.target.value },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-neutral-900 outline-none transition-all"
                placeholder="Shop No. 12, Market Complex"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                  City
                </label>
                <input
                  type="text"
                  value={formData.pickupAddress.city}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pickupAddress: { ...formData.pickupAddress, city: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-neutral-900 outline-none transition-all"
                  placeholder="Surat / Ahmedabad"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                  State
                </label>
                <input
                  type="text"
                  value={formData.pickupAddress.state}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pickupAddress: { ...formData.pickupAddress, state: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-neutral-900 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                  PIN Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={formData.pickupAddress.pincode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pickupAddress: { ...formData.pickupAddress, pincode: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-neutral-900 outline-none transition-all font-mono"
                  placeholder="395002"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bank & Payout Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 md:p-8">
          <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-neutral-100">
            <CreditCard className="text-neutral-700" size={20} />
            <div>
              <h2 className="text-lg font-serif font-semibold text-neutral-900">Bank Details for Payouts</h2>
              <p className="text-xs text-neutral-500 mt-0.5">Admin will transfer your requested payouts to this bank account.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                Account Holder Name
              </label>
              <input
                type="text"
                value={formData.bankDetails.accountName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bankDetails: { ...formData.bankDetails, accountName: e.target.value },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-neutral-900 outline-none transition-all"
                placeholder="Name on bank passbook"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                Bank Name
              </label>
              <input
                type="text"
                value={formData.bankDetails.bankName}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bankDetails: { ...formData.bankDetails, bankName: e.target.value },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-neutral-900 outline-none transition-all"
                placeholder="State Bank of India / HDFC"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                Bank Account Number
              </label>
              <input
                type="text"
                value={formData.bankDetails.accountNumber}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bankDetails: { ...formData.bankDetails, accountNumber: e.target.value },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-neutral-900 outline-none font-mono transition-all"
                placeholder="e.g. 5010045239123"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                IFSC Code
              </label>
              <input
                type="text"
                value={formData.bankDetails.ifscCode}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bankDetails: { ...formData.bankDetails, ifscCode: e.target.value.toUpperCase() },
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-neutral-300 focus:ring-2 focus:ring-neutral-900 outline-none uppercase font-mono transition-all"
                placeholder="SBIN0001234"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 bg-neutral-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-neutral-800 transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-70"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Save Store Settings</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Store, User, MapPin, CheckCircle, ArrowRight, ArrowLeft, Sparkles, Check } from 'lucide-react';
import Link from 'next/link';

export default function SellerRegistration() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    businessName: '',
    panCardNumber: '',
    gstNumber: '',
    hasOfflineShop: 'no',
    sellingCategories: [] as string[],
    pickupAddress: {
      address: '',
      city: '',
      state: '',
      pincode: '',
    },
    bankDetails: {
      accountName: '',
      accountNumber: '',
      ifscCode: '',
      bankName: '',
    }
  });

  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleCategoryToggle = (category: string) => {
    setFormData((prev) => ({
      ...prev,
      sellingCategories: prev.sellingCategories.includes(category)
        ? prev.sellingCategories.filter((c) => c !== category)
        : [...prev.sellingCategories, category]
    }));
  };

  const submitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role: 'SELLER' }),
      });
      
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        window.location.href = '/login';
      } else {
        alert(data.error || 'Failed to submit application');
      }
    } catch (err) {
      alert('Network error while submitting application');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      
      <div className="w-full max-w-3xl mb-8">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-serif text-neutral-900 tracking-wider">VASTRA AURA</Link>
          <h2 className="mt-4 text-xl text-neutral-600">Join as a Premium Seller</h2>
        </div>
        
        {/* Progress Bar */}
        <div className="flex justify-between items-center relative mb-12">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-neutral-200 -z-10"></div>
          <div 
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-neutral-900 -z-10 transition-all duration-500"
            style={{ width: `${((step - 1) / 3) * 100}%` }}
          ></div>
          
          {[
            { icon: User, label: 'Basic Info' },
            { icon: Store, label: 'Business' },
            { icon: MapPin, label: 'Location' },
            { icon: Sparkles, label: '₹3,999 Activation' }
          ].map((s, i) => (
            <div key={i} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-500 ${step > i ? 'bg-neutral-900 text-white' : 'bg-white border-2 border-neutral-300 text-neutral-400'}`}>
                <s.icon size={20} />
              </div>
              <span className={`text-xs mt-2 ${step > i ? 'text-neutral-900 font-medium' : 'text-neutral-500'}`}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <form onSubmit={submitForm} className="p-8 sm:p-12">
          <AnimatePresence mode="wait">
            
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-2xl font-serif text-neutral-900">Personal Information</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Full Name</label>
                    <input type="text" className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-neutral-900 focus:ring-neutral-900 py-3 px-4 bg-neutral-50" placeholder="John Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Phone Number</label>
                    <input type="tel" className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-neutral-900 focus:ring-neutral-900 py-3 px-4 bg-neutral-50" placeholder="+91 9876543210" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700">Email Address</label>
                    <input type="email" className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-neutral-900 focus:ring-neutral-900 py-3 px-4 bg-neutral-50" placeholder="john@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700">Password</label>
                    <input type="password" className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-neutral-900 focus:ring-neutral-900 py-3 px-4 bg-neutral-50" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-2xl font-serif text-neutral-900">Business Details</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700">Business / Brand Name</label>
                    <input type="text" className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-neutral-900 focus:ring-neutral-900 py-3 px-4 bg-neutral-50" value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">PAN Card Number <span className="text-red-500">*</span></label>
                    <input type="text" className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-neutral-900 focus:ring-neutral-900 py-3 px-4 bg-neutral-50 uppercase" placeholder="ABCDE1234F" value={formData.panCardNumber} onChange={e => setFormData({...formData, panCardNumber: e.target.value})} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">GST Number (Optional)</label>
                    <input type="text" className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-neutral-900 focus:ring-neutral-900 py-3 px-4 bg-neutral-50 uppercase" value={formData.gstNumber} onChange={e => setFormData({...formData, gstNumber: e.target.value})} />
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Do you have an offline shop?</label>
                    <div className="flex gap-4">
                      <button type="button" onClick={() => setFormData({...formData, hasOfflineShop: 'yes'})} className={`flex-1 py-3 border rounded-lg transition-colors ${formData.hasOfflineShop === 'yes' ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-300 hover:border-neutral-500 text-neutral-700'}`}>Yes, I have an offline shop</button>
                      <button type="button" onClick={() => setFormData({...formData, hasOfflineShop: 'no'})} className={`flex-1 py-3 border rounded-lg transition-colors ${formData.hasOfflineShop === 'no' ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-300 hover:border-neutral-500 text-neutral-700'}`}>No, online only</button>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 mb-2">What categories will you sell?</label>
                    <div className="flex flex-wrap gap-3">
                      {['Mens', 'Womens', 'Kids', 'Accessories'].map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => handleCategoryToggle(cat)}
                          className={`px-4 py-2 rounded-full border transition-all ${formData.sellingCategories.includes(cat) ? 'border-neutral-900 bg-neutral-100 text-neutral-900 font-medium' : 'border-neutral-200 text-neutral-500 hover:border-neutral-400'}`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <h3 className="text-2xl font-serif text-neutral-900">Pickup Location</h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700">Complete Address</label>
                    <textarea className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-neutral-900 focus:ring-neutral-900 py-3 px-4 bg-neutral-50" rows={3} value={formData.pickupAddress.address} onChange={e => setFormData({...formData, pickupAddress: {...formData.pickupAddress, address: e.target.value}})} required></textarea>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">City</label>
                    <input type="text" className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-neutral-900 focus:ring-neutral-900 py-3 px-4 bg-neutral-50" value={formData.pickupAddress.city} onChange={e => setFormData({...formData, pickupAddress: {...formData.pickupAddress, city: e.target.value}})} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700">Pincode</label>
                    <input type="text" className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-neutral-900 focus:ring-neutral-900 py-3 px-4 bg-neutral-50" value={formData.pickupAddress.pincode} onChange={e => setFormData({...formData, pickupAddress: {...formData.pickupAddress, pincode: e.target.value}})} required />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 py-4"
              >
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-semibold border border-amber-200 mb-3">
                    <Sparkles size={14} className="text-amber-600" /> One-Time Registration & Onboarding
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-serif text-neutral-900">
                    Activate Your Seller Account
                  </h3>
                  <p className="text-neutral-500 text-sm mt-1 max-w-lg mx-auto">
                    To maintain an exclusive, high-quality designer marketplace, we charge a one-time onboarding fee of ₹3,999.
                  </p>
                </div>

                {/* Plan Card */}
                <div className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-700 pb-6 mb-6">
                    <div>
                      <span className="text-xs uppercase tracking-widest text-neutral-400 font-semibold">Package</span>
                      <h4 className="text-xl font-serif mt-0.5">Vastra Aura Partner Onboarding</h4>
                      <p className="text-xs text-neutral-400 mt-1">One-time lifetime setup fee • No monthly subscription</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-3xl sm:text-4xl font-serif font-bold text-amber-300">₹3,999</div>
                      <span className="text-[11px] text-neutral-400">One-time activation fee</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                    <div className="flex items-start gap-2.5">
                      <div className="p-1 bg-green-500/20 text-green-400 rounded-full mt-0.5 shrink-0">
                        <Check size={12} />
                      </div>
                      <span className="text-neutral-200"><strong>Doorstep Courier Pickup:</strong> Delivery partner collects parcels directly from your shop/home.</span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="p-1 bg-green-500/20 text-green-400 rounded-full mt-0.5 shrink-0">
                        <Check size={12} />
                      </div>
                      <span className="text-neutral-200"><strong>Creator Collaborations:</strong> Hire top fashion influencers directly for video ads & reels.</span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="p-1 bg-green-500/20 text-green-400 rounded-full mt-0.5 shrink-0">
                        <Check size={12} />
                      </div>
                      <span className="text-neutral-200"><strong>Verified Seller Badge:</strong> Build high trust with premium ethnic wear buyers.</span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="p-1 bg-green-500/20 text-green-400 rounded-full mt-0.5 shrink-0">
                        <Check size={12} />
                      </div>
                      <span className="text-neutral-200"><strong>0% Commission:</strong> Zero platform commission on your first 10 orders.</span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="p-1 bg-green-500/20 text-green-400 rounded-full mt-0.5 shrink-0">
                        <Check size={12} />
                      </div>
                      <span className="text-neutral-200"><strong>Storefront & Catalogs:</strong> Upload and showcase up to 100 designer products.</span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <div className="p-1 bg-green-500/20 text-green-400 rounded-full mt-0.5 shrink-0">
                        <Check size={12} />
                      </div>
                      <span className="text-neutral-200"><strong>Dedicated Account Manager:</strong> Direct WhatsApp & phone assistance for orders.</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center pt-2">
                  <button 
                    type="submit" 
                    className="w-full sm:w-auto bg-neutral-900 text-white px-10 py-4 rounded-xl font-medium text-base hover:bg-neutral-800 transition-all shadow-md active:scale-95 inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Pay ₹3,999 & Submit Application</span>
                    <ArrowRight size={18} />
                  </button>
                  <p className="text-xs text-neutral-400 mt-2">100% secure payment gateway • Invoice provided upon registration</p>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="mt-10 flex justify-between pt-6 border-t border-neutral-100">
            {step > 1 ? (
              <button type="button" onClick={prevStep} className="flex items-center gap-2 px-6 py-3 text-neutral-600 hover:text-neutral-900 transition-colors font-medium">
                <ArrowLeft size={18} /> Back
              </button>
            ) : <div></div>}

            {step < 4 && (
              <button type="button" onClick={nextStep} className="flex items-center gap-2 bg-neutral-900 text-white px-8 py-3 rounded-xl hover:bg-neutral-800 transition-colors font-medium">
                Next <ArrowRight size={18} />
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { Percent, IndianRupee, Truck, ShieldCheck, Info, CheckCircle2, Globe } from 'lucide-react';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  const [formData, setFormData] = useState({
    storeName: '',
    contactEmail: '',
    storeDescription: '',
    currency: 'INR',
    flatShippingRate: 100,
    freeShippingThreshold: 999,
    handlingChargeType: 'PERCENTAGE', // 'PERCENTAGE' | 'FIXED'
    handlingChargeValue: 0,
    standardCourierFee: 100,
    blueDartCourierFee: 120,
    adPackage24hPrice: 2000,
    adPackage3dPrice: 5000,
    adPackage7dPrice: 10000,
    autoShipToAdminAddress: false,
    internationalMultiplier: 2.5,
    enableInternationalPricing: true,
  });

  const { fetchSettings } = useStore();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        if (res.ok) {
          const data = await res.json();
          setFormData({
            storeName: data.storeName || 'VASTRA AURA',
            contactEmail: data.contactEmail || 'hello@vastraaura.com',
            storeDescription: data.storeDescription || '',
            currency: data.currency || 'INR',
            flatShippingRate: data.flatShippingRate ?? 100,
            freeShippingThreshold: data.freeShippingThreshold ?? 999,
            handlingChargeType: data.handlingChargeType || 'PERCENTAGE',
            handlingChargeValue: data.handlingChargeValue ?? 0,
            standardCourierFee: data.standardCourierFee ?? 100,
            blueDartCourierFee: data.blueDartCourierFee ?? 120,
            adPackage24hPrice: data.adPackage24hPrice ?? 2000,
            adPackage3dPrice: data.adPackage3dPrice ?? 5000,
            adPackage7dPrice: data.adPackage7dPrice ?? 10000,
            autoShipToAdminAddress: data.autoShipToAdminAddress ?? false,
            internationalMultiplier: data.internationalMultiplier ?? 2.5,
            enableInternationalPricing: data.enableInternationalPricing ?? true,
          });
        }
      } catch (error) {
        console.error('Failed to load settings', error);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
      return;
    }

    setFormData(prev => ({ 
      ...prev, 
      [name]: ['flatShippingRate', 'freeShippingThreshold', 'handlingChargeValue', 'standardCourierFee', 'blueDartCourierFee', 'adPackage24hPrice', 'adPackage3dPrice', 'adPackage7dPrice', 'internationalMultiplier'].includes(name) 
        ? Number(value) 
        : value 
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        setMessage('Settings saved successfully!');
        if (fetchSettings) {
          await fetchSettings();
        }
      } else {
        setMessage('Failed to save settings.');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage('Error saving settings.');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3500);
    }
  };

  if (loading) {
    return <div className="p-10 max-w-4xl">Loading settings...</div>;
  }

  return (
    <div className="p-6 md:p-10 max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Platform & Store Settings</h1>
        <p className="text-gray-500">Configure handling charges, courier fees, and store preferences.</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${
          message.includes('successfully') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          <CheckCircle2 size={16} />
          <span>{message}</span>
        </div>
      )}

      {/* 1. ORDER HANDLING CHARGE (DYNAMIC: % OR ₹) */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck size={20} className="text-indigo-600" />
              Order Handling / Platform Charge
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Control the handling fee charged to customers at checkout. Set to 0 to keep it completely hidden.
            </p>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
            formData.handlingChargeValue === 0 
              ? 'bg-gray-100 text-gray-600' 
              : 'bg-green-100 text-green-700 font-semibold'
          }`}>
            {formData.handlingChargeValue === 0 ? 'Disabled (Hidden)' : `Active (${formData.handlingChargeValue}${formData.handlingChargeType === 'PERCENTAGE' ? '%' : '₹'})`}
          </span>
        </div>

        <div className="p-6 space-y-6">
          {/* Charge Type Selector: % or ₹ */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-2">
              Handling Fee Calculation Mode
            </label>
            <div className="grid grid-cols-2 gap-4 max-w-md">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, handlingChargeType: 'PERCENTAGE' })}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                  formData.handlingChargeType === 'PERCENTAGE'
                    ? 'border-black bg-black text-white shadow-xs'
                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Percent size={16} />
                Percentage (%) on Order
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, handlingChargeType: 'FIXED' })}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl border text-sm font-medium transition-all ${
                  formData.handlingChargeType === 'FIXED'
                    ? 'border-black bg-black text-white shadow-xs'
                    : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <IndianRupee size={16} />
                Fixed Amount (₹) per Order
              </button>
            </div>
          </div>

          {/* Value Input */}
          <div className="max-w-md space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
              Charge Value {formData.handlingChargeType === 'PERCENTAGE' ? '(in %)' : '(in ₹)'}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">
                {formData.handlingChargeType === 'PERCENTAGE' ? '%' : '₹'}
              </span>
              <input
                type="number"
                min="0"
                step="1"
                name="handlingChargeValue"
                value={formData.handlingChargeValue}
                onChange={handleChange}
                placeholder="0 = No charge"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black font-semibold text-gray-900"
              />
            </div>
            
            <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-xl text-xs text-blue-900 flex items-start gap-2 mt-2">
              <Info size={16} className="shrink-0 mt-0.5 text-blue-600" />
              <div>
                {formData.handlingChargeValue === 0 ? (
                  <p>
                    <strong>Currently 0:</strong> Customers will <strong>NOT</strong> see any handling charge on checkout (completely hidden).
                  </p>
                ) : formData.handlingChargeType === 'PERCENTAGE' ? (
                  <p>
                    <strong>Percentage Active:</strong> Customers will be charged <strong>{formData.handlingChargeValue}%</strong> handling fee on their order subtotal (e.g., on ₹3,000 order = ₹{(3000 * (formData.handlingChargeValue / 100)).toFixed(0)} fee).
                  </p>
                ) : (
                  <p>
                    <strong>Fixed Rupee Active:</strong> Customers will be charged a flat <strong>₹{formData.handlingChargeValue}</strong> handling fee per order.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. COURIER SHIPPING CHARGES (FIXED: BLUE DART ₹120 / OTHERS ₹100) */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Truck size={20} className="text-blue-600" />
            Courier Shipping Rates (Seller Parcel Charges)
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Compulsory shipping rates deducted from seller order payouts when scheduling doorstep pickups.
          </p>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block">
              Standard Couriers Fee (Compulsory)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
              <input
                type="number"
                name="standardCourierFee"
                value={formData.standardCourierFee}
                onChange={handleChange}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black font-semibold text-gray-900 bg-white"
              />
            </div>
            <p className="text-[11px] text-gray-500">
              Fixed rate for Delhivery, Shiprocket, DTDC, and Shadowfax per parcel.
            </p>
          </div>

          <div className="space-y-2 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-700 block">
              Blue Dart Air Express Fee (Fixed)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₹</span>
              <input
                type="number"
                name="blueDartCourierFee"
                value={formData.blueDartCourierFee}
                onChange={handleChange}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black font-semibold text-gray-900 bg-white"
              />
            </div>
            <p className="text-[11px] text-gray-500">
              Fixed rate for Blue Dart Air priority delivery per parcel.
            </p>
          </div>
        </div>
      </div>

      {/* ADMIN AUTO-SHIPPING SETTINGS */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Truck size={20} className="text-indigo-600" />
            Admin Auto-Shipping Settings
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure automated shipping for orders fulfilled by Admin.
          </p>
        </div>
        <div className="p-6">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="relative flex items-center mt-0.5">
              <input
                type="checkbox"
                name="autoShipToAdminAddress"
                checked={formData.autoShipToAdminAddress}
                onChange={handleChange}
                className="sr-only"
              />
              <div className={`w-11 h-6 rounded-full transition-colors ${formData.autoShipToAdminAddress ? 'bg-black' : 'bg-gray-200'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.autoShipToAdminAddress ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </div>
            <div>
              <span className="block text-sm font-semibold text-gray-900 group-hover:text-black">
                Ship Admin Orders to Admin Address
              </span>
              <span className="block text-xs text-gray-500 mt-1">
                If enabled, physical shipments for admin-sold products will be sent to the Admin's configured address.
                Shipping details won't be sent to third-party shipping APIs since it is handled automatically from outside.
              </span>
            </div>
          </label>
        </div>
      </div>

      {/* AD PACKAGE PRICING */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Percent size={20} className="text-purple-600" />
            Ad Package Pricing (Digital Real Estate)
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Configure the pricing for seller slot bookings (Hero Banners).
          </p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">24 Hours Price (₹)</label>
            <input type="number" name="adPackage24hPrice" value={formData.adPackage24hPrice} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-black" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">3 Days Price (₹)</label>
            <input type="number" name="adPackage3dPrice" value={formData.adPackage3dPrice} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-black" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">7 Days Price (₹)</label>
            <input type="number" name="adPackage7dPrice" value={formData.adPackage7dPrice} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-black" />
          </div>
        </div>
      </div>

      {/* 3. TIER-1 INTERNATIONAL DYNAMIC PRICING */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Globe size={20} className="text-emerald-600" />
              Tier-1 International Dynamic Pricing (US, UK, Canada, Australia)
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Automatically detect international visitors from Tier-1 countries and multiply selling price (2x to 3x) in their local currency.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="enableInternationalPricing"
              checked={formData.enableInternationalPricing}
              onChange={handleChange}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
            <span className="ml-3 text-xs font-semibold text-gray-700">
              {formData.enableInternationalPricing ? 'Enabled' : 'Disabled'}
            </span>
          </label>
        </div>

        <div className="p-6 space-y-6">
          <div className="max-w-md space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
              International Multiplier (e.g. 2.0x, 2.5x, 3.0x)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="5.0"
                name="internationalMultiplier"
                value={formData.internationalMultiplier}
                onChange={handleChange}
                disabled={!formData.enableInternationalPricing}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-black font-semibold text-gray-900 disabled:opacity-50"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">X</span>
            </div>
            <p className="text-xs text-gray-500">
              Recommended: <strong>2.5x</strong>. This absorbs international courier fees (DHL/FedEx ₹1,500+) and delivers premium profit margins.
            </p>
          </div>

          {/* Live Calculation Preview */}
          <div className="bg-emerald-50/70 border border-emerald-200 p-4 rounded-xl text-xs text-emerald-950 space-y-2">
            <div className="font-semibold text-emerald-900 flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-600" />
              Live Pricing Preview based on ₹1,499 Base Product:
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-white p-3 rounded-lg border border-emerald-100 shadow-2xs">
                <div className="text-[10px] text-gray-500 font-medium">🇮🇳 India (1.0x)</div>
                <div className="text-base font-bold text-gray-900 mt-1">₹1,499</div>
                <div className="text-[10px] text-gray-400">COD Available</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-emerald-100 shadow-2xs">
                <div className="text-[10px] text-gray-500 font-medium">🇺🇸 USA ({formData.internationalMultiplier}x)</div>
                <div className="text-base font-bold text-gray-900 mt-1">
                  ${Math.round((1499 * formData.internationalMultiplier) / 87)}
                </div>
                <div className="text-[10px] text-gray-400">Prepaid Only</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-emerald-100 shadow-2xs">
                <div className="text-[10px] text-gray-500 font-medium">🇬🇧 UK ({formData.internationalMultiplier}x)</div>
                <div className="text-base font-bold text-gray-900 mt-1">
                  £{Math.round((1499 * formData.internationalMultiplier) / 112)}
                </div>
                <div className="text-[10px] text-gray-400">Prepaid Only</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-emerald-100 shadow-2xs">
                <div className="text-[10px] text-gray-500 font-medium">🇨🇦 Canada ({formData.internationalMultiplier}x)</div>
                <div className="text-base font-bold text-gray-900 mt-1">
                  CA${Math.round((1499 * formData.internationalMultiplier) / 64)}
                </div>
                <div className="text-[10px] text-gray-400">Prepaid Only</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. STORE DETAILS */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 bg-gray-50/50">
          <h2 className="text-lg font-bold text-gray-900">General Store Details</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">Store Name</label>
              <input type="text" name="storeName" value={formData.storeName} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-black" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">Contact Email</label>
              <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-black" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">Store Description</label>
            <textarea rows={2} name="storeDescription" value={formData.storeDescription} onChange={handleChange} className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-black" />
          </div>
        </div>
        
        <div className="p-5 bg-gray-50 border-t border-gray-200 flex justify-end">
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-black text-white px-8 py-3 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all disabled:opacity-70 shadow-sm cursor-pointer"
          >
            {saving ? 'Saving Changes...' : 'Save All Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}

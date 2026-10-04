'use client';

import { useState, useEffect, useMemo } from 'react';
import { Megaphone, Calendar as CalendarIcon, Clock, CreditCard, Wallet, AlertCircle } from 'lucide-react';

const DEFAULT_PACKAGES = [
  { id: '24h', label: '24 Hours', days: 1, price: 2000, type: 'Hero Banner' },
  { id: '3d', label: '3 Days', days: 3, price: 5000, type: 'Hero Banner' },
  { id: '7d', label: '1 Week', days: 7, price: 10000, type: 'Hero Banner' },
];

export default function SellerAdsPage() {
  const [allSlots, setAllSlots] = useState<any[]>([]);
  const [myBookings, setMyBookings] = useState<any[]>([]);
  const [packages, setPackages] = useState(DEFAULT_PACKAGES);
  
  const [selectedPkg, setSelectedPkg] = useState(DEFAULT_PACKAGES[0]);
  const [startDate, setStartDate] = useState('');
  
  const [paymentMethod, setPaymentMethod] = useState('Wallet Deduction');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    const [res, settingsRes] = await Promise.all([
      fetch('/api/seller/ads'),
      fetch('/api/admin/settings')
    ]);
    const data = await res.json();
    if (data.success) {
      setAllSlots(data.allSlots);
      setMyBookings(data.myBookings);
    }
    if (settingsRes.ok) {
      const settings = await settingsRes.json();
      const dynamicPkgs = [
        { id: '24h', label: '24 Hours', days: 1, price: settings.adPackage24hPrice || 2000, type: 'Hero Banner' },
        { id: '3d', label: '3 Days', days: 3, price: settings.adPackage3dPrice || 5000, type: 'Hero Banner' },
        { id: '7d', label: '1 Week', days: 7, price: settings.adPackage7dPrice || 10000, type: 'Hero Banner' },
      ];
      setPackages(dynamicPkgs);
      setSelectedPkg(dynamicPkgs[0]);
    }
  };

  const endDate = useMemo(() => {
    if (!startDate) return '';
    const d = new Date(startDate);
    d.setDate(d.getDate() + selectedPkg.days - 1);
    return d.toISOString().split('T')[0];
  }, [startDate, selectedPkg]);

  // Check if chosen dates overlap with any booked Hero Banner
  const isOverlapping = useMemo(() => {
    if (!startDate || !endDate) return false;
    const s = new Date(startDate);
    const e = new Date(endDate);
    
    return allSlots.some(slot => {
      if (slot.type !== 'Hero Banner' || slot.status === 'Rejected') return false;
      const slotS = new Date(slot.startDate);
      const slotE = new Date(slot.endDate);
      return (s <= slotE && e >= slotS);
    });
  }, [startDate, endDate, allSlots]);

  const handleBook = async () => {
    if (!startDate) return alert('Please select a start date');
    if (isOverlapping) return alert('Selected dates overlap with an already booked slot.');

    setLoading(true);
    try {
      const res = await fetch('/api/seller/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedPkg.type,
          startDate,
          endDate,
          amountPaid: selectedPkg.price,
          paymentMethod,
          sellerName: 'My Store', // In real app, fetch from context
          contentUrl: 'Banner image placeholder'
        })
      });
      const data = await res.json();
      if (data.success) {
        alert('Slot booked successfully! Pending Admin approval.');
        fetchSlots();
      } else {
        alert(data.error || 'Failed to book slot');
      }
    } catch (err) {
      alert('Error booking slot');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif text-neutral-900 flex items-center gap-2">
            <Megaphone size={28} className="text-accent" /> Ads & Promotions
          </h1>
          <p className="text-neutral-500">Book premium real estate on Vastra Aura to multiply your sales.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Booking Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
            <h2 className="text-lg font-bold text-neutral-900 mb-4 border-b border-neutral-100 pb-2">1. Select Package (Hero Banner)</h2>
            <div className="grid grid-cols-3 gap-4">
              {packages.map(pkg => (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedPkg(pkg)}
                  className={`p-4 rounded-xl border-2 text-center transition-colors ${
                    selectedPkg.id === pkg.id ? 'border-neutral-900 bg-neutral-900 text-white' : 'border-neutral-200 text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  <p className="font-bold">{pkg.label}</p>
                  <p className={`text-sm mt-1 ${selectedPkg.id === pkg.id ? 'text-neutral-300' : 'text-neutral-500'}`}>₹{pkg.price}</p>
                </button>
              ))}
            </div>

            <h2 className="text-lg font-bold text-neutral-900 mt-8 mb-4 border-b border-neutral-100 pb-2">2. Choose Dates</h2>
            <div className="flex gap-4 items-center">
              <div>
                <label className="block text-sm text-neutral-500 mb-1">Start Date</label>
                <input 
                  type="date" 
                  min={new Date().toISOString().split('T')[0]}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border border-neutral-300 rounded-lg p-2 focus:ring-2 focus:ring-black outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-500 mb-1">End Date (Auto)</label>
                <input 
                  type="date" 
                  value={endDate}
                  disabled
                  className="border border-neutral-200 bg-neutral-100 rounded-lg p-2 text-neutral-500"
                />
              </div>
            </div>

            {isOverlapping && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm">
                <AlertCircle size={16} /> This slot is already booked by another seller. Please select different dates.
              </div>
            )}

            <h2 className="text-lg font-bold text-neutral-900 mt-8 mb-4 border-b border-neutral-100 pb-2">3. Payment Method</h2>
            <div className="flex gap-4">
              <label className={`flex-1 p-4 rounded-xl border flex flex-col items-center gap-2 cursor-pointer transition-colors ${paymentMethod === 'Wallet Deduction' ? 'border-blue-500 bg-blue-50' : 'border-neutral-200 hover:bg-neutral-50'}`}>
                <input type="radio" name="payment" className="hidden" checked={paymentMethod === 'Wallet Deduction'} onChange={() => setPaymentMethod('Wallet Deduction')} />
                <Wallet size={24} className={paymentMethod === 'Wallet Deduction' ? 'text-blue-500' : 'text-neutral-400'} />
                <span className="font-medium text-sm">Wallet Auto-Cut</span>
              </label>
              
              <label className={`flex-1 p-4 rounded-xl border flex flex-col items-center gap-2 cursor-pointer transition-colors ${paymentMethod === 'Direct Transfer' ? 'border-green-500 bg-green-50' : 'border-neutral-200 hover:bg-neutral-50'}`}>
                <input type="radio" name="payment" className="hidden" checked={paymentMethod === 'Direct Transfer'} onChange={() => setPaymentMethod('Direct Transfer')} />
                <CreditCard size={24} className={paymentMethod === 'Direct Transfer' ? 'text-green-500' : 'text-neutral-400'} />
                <span className="font-medium text-sm">Direct UPI / Bank</span>
              </label>
            </div>

            <button 
              onClick={handleBook}
              disabled={loading || isOverlapping || !startDate}
              className="mt-8 w-full bg-accent text-white py-3 rounded-xl font-bold hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Processing...' : `Book Slot for ₹${selectedPkg.price}`}
            </button>
          </div>
        </div>

        {/* Right Col: My Bookings & Calendar hint */}
        <div className="space-y-6">
          <div className="bg-neutral-900 text-white rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-2 flex items-center gap-2"><CalendarIcon size={20} /> Availability Calendar</h3>
            <p className="text-sm text-neutral-400 mb-4">Bookings are first-come, first-serve. Below are currently booked slots by other sellers:</p>
            <ul className="space-y-2">
              {allSlots.filter(s => s.status !== 'Rejected').length === 0 && (
                <li className="text-sm text-neutral-500 italic">All slots are currently open!</li>
              )}
              {allSlots.filter(s => s.status !== 'Rejected').map(slot => (
                <li key={slot._id} className="text-sm bg-neutral-800 p-2 rounded flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  {new Date(slot.startDate).toLocaleDateString()} to {new Date(slot.endDate).toLocaleDateString()}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200">
            <h3 className="font-bold text-lg mb-4">My Ad Bookings</h3>
            {myBookings.length === 0 ? (
              <p className="text-sm text-neutral-500">You haven't booked any ads yet.</p>
            ) : (
              <ul className="space-y-4">
                {myBookings.map(slot => (
                  <li key={slot._id} className="border-b border-neutral-100 pb-3 last:border-0 last:pb-0">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium">{slot.type}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        slot.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>{slot.status}</span>
                    </div>
                    <p className="text-xs text-neutral-500 flex items-center gap-1"><Clock size={12}/> {new Date(slot.startDate).toLocaleDateString()} - {new Date(slot.endDate).toLocaleDateString()}</p>
                    <p className="text-xs text-neutral-900 mt-1 font-bold">₹{slot.amountPaid} via {slot.paymentMethod}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

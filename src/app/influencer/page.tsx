'use client';

import { useState, useEffect } from 'react';
import { Users, MousePointerClick, Wallet, Check, X, Clock, Video, Store, Sparkles } from 'lucide-react';

export default function InfluencerDashboard() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/influencer/collaborations');
      const data = await res.json();
      if (data.success && Array.isArray(data.requests)) {
        setRequests(data.requests);
      }
    } catch (e) {
      console.error('Failed to fetch requests', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/influencer/collaborations', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        fetchRequests();
      }
    } catch (e) {
      console.error('Failed to update status', e);
    }
  };

  const activeCount = requests.filter(r => r.status === 'Accepted' || r.status === 'In Progress').length;
  const pendingCount = requests.filter(r => r.status === 'Pending').length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif text-neutral-900">Influencer Dashboard</h1>
        <p className="text-neutral-500 mt-2">Manage your collaborations, brand deals, and fixed payouts.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<Users className="text-blue-600" />} title="Active Deals" value={activeCount.toString()} subtitle="Sellers currently working with you" />
        <StatCard icon={<Sparkles className="text-amber-600" />} title="Pending Requests" value={pendingCount.toString()} subtitle="New seller ad proposals" />
        <StatCard icon={<Wallet className="text-green-600" />} title="Fixed Payouts" value="₹25,000" subtitle="Earned from collaborations" />
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-serif text-neutral-900">Brand Collaboration Requests</h2>
            <p className="text-xs text-neutral-500 mt-0.5">Sellers on Vastra Aura wanting to hire you for reels & reviews</p>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 bg-neutral-100 rounded-full text-neutral-700">
            {requests.length} Total
          </span>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
          </div>
        ) : requests.length > 0 ? (
          <div className="space-y-4">
            {requests.map((req) => (
              <div
                key={req._id}
                className="p-5 rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-pink-700 bg-pink-50 px-2 py-0.5 rounded border border-pink-200">
                      {req.campaignType}
                    </span>
                    <span className="text-xs text-neutral-400">•</span>
                    <span className="text-xs text-neutral-500 font-medium flex items-center gap-1">
                      <Store size={12} /> {req.sellerName}
                    </span>
                  </div>

                  <h4 className="text-base font-semibold text-neutral-900">
                    Product: {req.productName}
                  </h4>

                  {req.instructions && (
                    <p className="text-xs text-neutral-600 bg-white p-2.5 rounded-lg border border-neutral-200">
                      <span className="font-semibold text-neutral-700">Brief: </span> {req.instructions}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-neutral-500 pt-1">
                    <span>Offer: <strong className="text-neutral-900 font-serif text-sm">₹{req.budget?.toLocaleString()}</strong></span>
                    {req.targetDate && <span>Target Date: <strong>{req.targetDate}</strong></span>}
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                  {req.status === 'Pending' ? (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(req._id, 'Accepted')}
                        className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium px-4 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                      >
                        <Check size={14} /> Accept Deal
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(req._id, 'Declined')}
                        className="flex items-center gap-1 bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-700 text-xs font-medium px-3 py-2 rounded-xl transition-all cursor-pointer"
                      >
                        <X size={14} /> Decline
                      </button>
                    </>
                  ) : (
                    <span className={`px-3 py-1 text-xs rounded-full font-medium ${
                      req.status === 'Accepted' ? 'bg-green-100 text-green-700' : 'bg-neutral-200 text-neutral-700'
                    }`}>
                      {req.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-neutral-400">
            No pending requests at the moment. When a seller requests an ad or video collaboration, it will appear here.
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, subtitle }: any) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-neutral-200 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-neutral-500 font-medium">{title}</h3>
        <div className="p-2 bg-neutral-50 rounded-lg">{icon}</div>
      </div>
      <div className="text-3xl font-serif text-neutral-900 mb-1">{value}</div>
      <p className="text-sm text-neutral-400">{subtitle}</p>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  MapPin, 
  Users, 
  Send, 
  Clock, 
  CheckCircle2, 
  X, 
  AlertCircle,
  Video,
  Star,
  Search,
  Filter
} from 'lucide-react';

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

interface Influencer {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  followers: string;
  niche: string;
  location: string;
  pricePerReel: number;
  rating: number;
  completedCampaigns: number;
  badge?: string;
}

interface Campaign {
  _id: string;
  influencerName: string;
  influencerHandle: string;
  productName: string;
  campaignType: string;
  budget: number;
  status: string;
  instructions?: string;
  targetDate?: string;
  createdAt: string;
}

export default function SellerCollaborations() {
  const [activeTab, setActiveTab] = useState<'browse' | 'campaigns'>('browse');
  const [influencers, setInfluencers] = useState<Influencer[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInfluencer, setSelectedInfluencer] = useState<Influencer | null>(null);
  const [productName, setProductName] = useState('');
  const [campaignType, setCampaignType] = useState('Instagram Reel');
  const [budget, setBudget] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [instructions, setInstructions] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setIsLoading(true);
      const res = await fetch('/api/seller/collaborations');
      const data = await res.json();
      if (data.success) {
        setInfluencers(data.influencers || []);
        setCampaigns(data.campaigns || []);
      }
    } catch (e) {
      console.error('Failed to load collaborations:', e);
    } finally {
      setIsLoading(false);
    }
  }

  const handleOpenModal = (inf: Influencer) => {
    setSelectedInfluencer(inf);
    setBudget(inf.pricePerReel.toString());
    setFeedback(null);
    setIsModalOpen(true);
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInfluencer) return;

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/seller/collaborations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          influencerId: selectedInfluencer.id,
          influencerName: selectedInfluencer.name,
          influencerHandle: selectedInfluencer.handle,
          productName,
          campaignType,
          budget: Number(budget),
          targetDate,
          instructions,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit request');
      }

      setFeedback({
        type: 'success',
        text: `Ad collaboration request sent to ${selectedInfluencer.name}! The creator will review and accept it.`,
      });

      if (data.campaign) {
        setCampaigns((prev) => [data.campaign, ...prev]);
      }

      setProductName('');
      setInstructions('');

      setTimeout(() => {
        setIsModalOpen(false);
        setActiveTab('campaigns');
      }, 2000);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Error sending request' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredInfluencers = influencers.filter(
    (inf) =>
      inf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inf.niche.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inf.handle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-lg">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-amber-300 mb-3 border border-white/10">
            <Sparkles size={14} /> Influencer Ads & Creator Marketing
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-light tracking-wide leading-tight">
            Hire Top Fashion Creators for Video Ads & Reels
          </h1>
          <p className="text-neutral-300 text-sm mt-2 leading-relaxed">
            Send your lehengas and sarees to verified fashion influencers. Get viral Instagram reels, styling videos, and boost your sales directly.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 justify-between items-center gap-4">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab('browse')}
            className={`pb-4 text-sm font-medium transition-all relative ${
              activeTab === 'browse'
                ? 'text-neutral-900 font-semibold'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            Explore Fashion Creators ({influencers.length})
            {activeTab === 'browse' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('campaigns')}
            className={`pb-4 text-sm font-medium transition-all relative ${
              activeTab === 'campaigns'
                ? 'text-neutral-900 font-semibold'
                : 'text-neutral-500 hover:text-neutral-700'
            }`}
          >
            My Ad Requests ({campaigns.length})
            {activeTab === 'campaigns' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-neutral-900" />
            )}
          </button>
        </div>

        {activeTab === 'browse' && (
          <div className="relative pb-3 hidden sm:block w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by niche or creator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-neutral-900"
            />
          </div>
        )}
      </div>

      {/* TAB 1: BROWSE INFLUENCERS */}
      {activeTab === 'browse' && (
        <>
          {isLoading ? (
            <div className="flex justify-center py-20 bg-white rounded-2xl border border-neutral-200">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
            </div>
          ) : filteredInfluencers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInfluencers.map((inf) => (
                <div
                  key={inf.id}
                  className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div className="p-6">
                    <div className="flex items-start gap-4">
                      <img
                        src={inf.avatar}
                        alt={inf.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-neutral-100 shadow-xs"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-semibold text-neutral-900">{inf.name}</h3>
                          {inf.badge && (
                            <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">
                              {inf.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-500 font-mono mt-0.5 flex items-center gap-1">
                          <InstagramIcon className="text-pink-600" />
                          {inf.handle}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-neutral-600">
                          <span className="flex items-center gap-0.5 text-amber-500 font-semibold">
                            <Star size={12} fill="currentColor" /> {inf.rating}
                          </span>
                          <span>•</span>
                          <span>{inf.completedCampaigns} ads done</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-neutral-100 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-500">Audience / Followers:</span>
                        <span className="font-semibold text-neutral-900">{inf.followers}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-500">Niche:</span>
                        <span className="font-medium text-neutral-800 text-right">{inf.niche}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-neutral-500">Location:</span>
                        <span className="text-neutral-600">{inf.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-neutral-50/70 border-t border-neutral-100 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-neutral-400 block uppercase font-medium">Reel / Ad Charge</span>
                      <span className="text-base font-bold text-neutral-900 font-serif">
                        ₹{inf.pricePerReel.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenModal(inf)}
                      className="flex items-center gap-1.5 bg-neutral-900 text-white text-xs font-medium px-4 py-2 rounded-xl hover:bg-neutral-800 transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      <Send size={13} />
                      Request Ad
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-12 text-center border border-neutral-200">
              <Users className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-600 font-medium">No influencers found matching your query</p>
            </div>
          )}
        </>
      )}

      {/* TAB 2: MY AD CAMPAIGNS */}
      {activeTab === 'campaigns' && (
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-neutral-200">
            <h3 className="font-semibold text-neutral-900">Your Requested Collaborations</h3>
          </div>

          {campaigns.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-neutral-600">
                <thead className="bg-neutral-50 text-neutral-900 border-b border-neutral-200 text-xs uppercase">
                  <tr>
                    <th className="px-6 py-4 font-medium">Creator</th>
                    <th className="px-6 py-4 font-medium">Product to Promote</th>
                    <th className="px-6 py-4 font-medium">Campaign Type</th>
                    <th className="px-6 py-4 font-medium">Budget</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Target Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {campaigns.map((camp) => (
                    <tr key={camp._id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="px-6 py-4 font-medium text-neutral-900">
                        <div>
                          <p className="font-semibold">{camp.influencerName}</p>
                          <p className="text-xs text-neutral-400 font-mono">{camp.influencerHandle}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-neutral-800 font-medium">
                        {camp.productName}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-neutral-100 text-neutral-800">
                          <Video size={12} /> {camp.campaignType}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-neutral-900">
                        ₹{camp.budget?.toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4">
                        {camp.status === 'Accepted' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                            <CheckCircle2 size={12} /> Accepted
                          </span>
                        ) : camp.status === 'Completed' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            <CheckCircle2 size={12} /> Live / Done
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock size={12} /> Reviewing
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-neutral-500">
                        {camp.targetDate || 'Within 7 Days'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Sparkles className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <h4 className="text-base font-semibold text-neutral-900">No campaigns requested yet</h4>
              <p className="text-sm text-neutral-500 mt-1 max-w-sm mx-auto">
                Explore the creators list and click "Request Ad" to launch your first influencer marketing campaign.
              </p>
              <button
                onClick={() => setActiveTab('browse')}
                className="mt-4 px-4 py-2 bg-neutral-900 text-white text-xs font-medium rounded-xl hover:bg-neutral-800"
              >
                Browse Creators
              </button>
            </div>
          )}
        </div>
      )}

      {/* REQUEST AD MODAL */}
      {isModalOpen && selectedInfluencer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-neutral-200 overflow-hidden transform transition-all">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-neutral-200 flex justify-between items-center bg-neutral-50/50">
              <div className="flex items-center gap-3">
                <img
                  src={selectedInfluencer.avatar}
                  alt={selectedInfluencer.name}
                  className="w-10 h-10 rounded-full object-cover border"
                />
                <div>
                  <h3 className="text-base font-semibold text-neutral-900">Request Ad with {selectedInfluencer.name}</h3>
                  <p className="text-xs text-neutral-500 font-mono">{selectedInfluencer.handle}</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleRequestSubmit} className="p-6 space-y-4">
              
              {feedback && (
                <div
                  className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                    feedback.type === 'success'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {feedback.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  <span>{feedback.text}</span>
                </div>
              )}

              {/* Product to Promote */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                  Product to Promote <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Maroon Silk Navratri Lehenga"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm font-medium"
                />
              </div>

              {/* Campaign Type */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                  Campaign Format
                </label>
                <select
                  value={campaignType}
                  onChange={(e) => setCampaignType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm font-medium bg-white"
                >
                  <option value="Instagram Reel">Instagram Reel (30-60s Styling)</option>
                  <option value="Story Series">Instagram Story Mention (3 Frames + Link)</option>
                  <option value="Full Video Showcase">Full Lookbook Video & Post</option>
                </select>
              </div>

              {/* Budget & Target Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                    Budget (₹) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                    Target Live Date
                  </label>
                  <input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900 text-xs"
                  />
                </div>
              </div>

              {/* Content Brief / Instructions */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5">
                  Creative Brief / Instructions
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Focus on the handcrafted zari embroidery, traditional Gujarati flair, and tag @vastraaura."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-50 font-medium text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-neutral-900 text-white font-medium text-xs hover:bg-neutral-800 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <span>Sending Request...</span>
                  ) : (
                    <>
                      <Send size={14} /> Send Ad Request
                    </>
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

'use client';

import { useEffect, useState } from 'react';
import { LinkIcon, Copy, ExternalLink, Activity } from 'lucide-react';
import Link from 'next/link';

interface CollabLink {
  id: string;
  productName: string;
  url: string;
  clicks: number;
  conversions: number;
  earnings: number;
  status: string;
  createdAt: string;
}

export default function InfluencerLinks() {
  const [links, setLinks] = useState<CollabLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLinkUrl, setNewLinkUrl] = useState('');

  useEffect(() => {
    async function fetchLinks() {
      try {
        const res = await fetch('/api/influencer/links');
        const data = await res.json();
        setLinks(data);
      } catch (error) {
        console.error('Failed to fetch links');
      } finally {
        setIsLoading(false);
      }
    }
    fetchLinks();
  }, []);

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    alert('Link copied to clipboard!'); // Ideally also change this to a toast later, but fixing prompt first
  };

  const handleGenerateLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (newLinkUrl) {
      const newLink = {
        id: 'LNK-' + Math.floor(Math.random() * 1000),
        productName: 'Custom Generated Link',
        url: newLinkUrl + '?ref=riyafashion',
        clicks: 0,
        conversions: 0,
        earnings: 0,
        status: 'Active',
        createdAt: new Date().toISOString()
      };
      setLinks([newLink, ...links]);
      setNewLinkUrl('');
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif text-neutral-900">Collaboration Links</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-pink-700 transition-colors"
        >
          <LinkIcon size={18} /> Generate New Link
        </button>
      </div>

      {/* Custom Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-serif text-neutral-900 mb-4">Generate Tracking Link</h2>
            <form onSubmit={handleGenerateLink}>
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-700 mb-2">Product URL</label>
                <input 
                  type="url" 
                  required
                  placeholder="https://vastraaura.com/shop/..."
                  className="w-full px-4 py-2 rounded-lg border border-neutral-300 focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
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
                  Generate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
        </div>
      ) : links.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-600">
              <thead className="bg-neutral-50 text-neutral-900 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-4 font-medium">Product / Link</th>
                  <th className="px-6 py-4 font-medium">Performance</th>
                  <th className="px-6 py-4 font-medium">Earnings</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {links.map((link) => (
                  <tr key={link.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-neutral-900">{link.productName}</div>
                      <div className="flex items-center gap-2 text-xs text-pink-600 mt-1">
                        <span className="truncate max-w-[200px]">{link.url}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="text-xs text-neutral-400">Clicks</div>
                          <div className="font-medium text-neutral-900">{link.clicks}</div>
                        </div>
                        <div>
                          <div className="text-xs text-neutral-400">Sales</div>
                          <div className="font-medium text-neutral-900">{link.conversions}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-medium text-green-600">₹{link.earnings.toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {link.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleCopy(link.url)} className="p-2 text-neutral-400 hover:text-pink-600 transition-colors" title="Copy Link">
                        <Copy size={16} />
                      </button>
                      <button className="p-2 text-neutral-400 hover:text-pink-600 transition-colors" title="View Analytics">
                        <Activity size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8 text-center">
          <LinkIcon className="w-12 h-12 text-pink-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-neutral-900">No active links</h3>
          <p className="text-neutral-500 mt-2">Generate and manage your collaboration tracking links here.</p>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function InfluencerRegistration() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    instagramHandle: '',
    youtubeLink: '',
    followerCount: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // We pass INFLUENCER role, and also their social details
        body: JSON.stringify({ ...formData, role: 'INFLUENCER' }),
      });
      
      const data = await res.json();
      if (res.ok) {
        alert("Influencer Application Submitted! You can now log in.");
        window.location.href = '/login';
      } else {
        alert(data.error || 'Failed to submit application');
        setIsLoading(false);
      }
    } catch (err) {
      alert('Network error while submitting application');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-2xl bg-white p-8 sm:p-12 rounded-2xl shadow-xl">
        <div className="text-center mb-10">
          <Link href="/" className="text-3xl font-serif text-neutral-900 tracking-wider">VASTRA AURA</Link>
          <h2 className="mt-4 text-xl font-medium text-pink-600">Join as an Influencer</h2>
          <p className="mt-2 text-sm text-neutral-500">Collaborate with premium brands and earn fixed payouts.</p>
        </div>
        
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-neutral-700">Full Name</label>
              <input
                type="text" required
                className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 py-3 px-4 bg-neutral-50"
                value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700">Phone Number</label>
              <input
                type="tel" required
                className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 py-3 px-4 bg-neutral-50"
                value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-neutral-700">Email Address</label>
              <input
                type="email" required
                className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 py-3 px-4 bg-neutral-50"
                value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-neutral-700">Password</label>
              <input
                type="password" required
                className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 py-3 px-4 bg-neutral-50"
                value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
            
            <div className="sm:col-span-2 pt-4 border-t border-neutral-100">
              <h3 className="text-lg font-medium text-neutral-900 mb-4">Social Media Profiles</h3>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700">Instagram Handle</label>
              <input
                type="text" placeholder="@username" required
                className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 py-3 px-4 bg-neutral-50"
                value={formData.instagramHandle} onChange={(e) => setFormData({...formData, instagramHandle: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700">Total Followers</label>
              <select
                required
                className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 py-3 px-4 bg-neutral-50"
                value={formData.followerCount} onChange={(e) => setFormData({...formData, followerCount: e.target.value})}
              >
                <option value="">Select range</option>
                <option value="10k-50k">10K - 50K</option>
                <option value="50k-100k">50K - 100K</option>
                <option value="100k-500k">100K - 500K</option>
                <option value="500k+">500K+</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-neutral-700">YouTube Channel Link (Optional)</label>
              <input
                type="url" placeholder="https://youtube.com/c/..."
                className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 py-3 px-4 bg-neutral-50"
                value={formData.youtubeLink} onChange={(e) => setFormData({...formData, youtubeLink: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-lg font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-neutral-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-pink-600 hover:text-pink-500">
              Sign In here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

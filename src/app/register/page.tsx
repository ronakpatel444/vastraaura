'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role: 'CUSTOMER' }),
      });
      
      const data = await res.json();
      if (res.ok) {
        alert("Account Created! You can now log in.");
        window.location.href = '/login';
      } else {
        alert(data.error || 'Failed to create account');
        setIsLoading(false);
      }
    } catch (err) {
      alert('Network error while creating account');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white/5 p-8 rounded-2xl shadow-xl border border-white/10 backdrop-blur-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-serif tracking-widest text-foreground">
            VASTRA AURA
          </h2>
          <p className="mt-2 text-center text-sm text-foreground/60 uppercase tracking-widest">
            Create a Customer Account
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="sr-only">Full Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-none text-foreground placeholder-foreground/40 focus:outline-none focus:border-accent transition-colors"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="sr-only">Email address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-none text-foreground placeholder-foreground/40 focus:outline-none focus:border-accent transition-colors"
                placeholder="Email address"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="sr-only">Phone Number</label>
              <input
                type="tel"
                required
                className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-none text-foreground placeholder-foreground/40 focus:outline-none focus:border-accent transition-colors"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div>
              <label className="sr-only">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-none text-foreground placeholder-foreground/40 focus:outline-none focus:border-accent transition-colors"
                placeholder="Create Password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium uppercase tracking-widest text-background bg-foreground hover:bg-foreground/90 transition-colors focus:outline-none disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center text-xs uppercase tracking-widest text-foreground/60 space-y-4">
          <p>
            Already have an account?{' '}
            <Link href="/login" className="text-accent hover:text-accent/80 font-medium">
              Sign In
            </Link>
          </p>
          <div className="pt-4 border-t border-white/10">
            <p>
              Want to sell with us?{' '}
              <a href="/seller/register" className="text-accent hover:text-accent/80 font-medium">
                Apply as Seller
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

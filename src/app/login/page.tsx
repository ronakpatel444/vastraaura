'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOtpScreen, setShowOtpScreen] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        if (data.requireOtp) {
          setShowOtpScreen(true);
          setIsLoading(false);
        } else {
          window.location.href = data.redirectUrl;
        }
      } else {
        alert(data.error || 'Login failed');
        setIsLoading(false);
      }
    } catch (err) {
      alert('Network error');
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        window.location.href = data.redirectUrl;
      } else {
        alert(data.error || 'Invalid OTP');
        setIsLoading(false);
      }
    } catch (err) {
      alert('Network error during verification');
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
            {showOtpScreen ? 'Enter Verification Code' : 'Sign in to your account'}
          </p>
        </div>
        
        {!showOtpScreen ? (
          <form className="mt-8 space-y-6" onSubmit={handleLoginSubmit}>
            <div className="space-y-4">
              <div>
                <label className="sr-only">Email address</label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-none text-foreground placeholder-foreground/40 focus:outline-none focus:border-accent transition-colors"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="sr-only">Password</label>
                <input
                  type="password"
                  required
                  className="w-full px-4 py-3 bg-transparent border border-white/20 rounded-none text-foreground placeholder-foreground/40 focus:outline-none focus:border-accent transition-colors"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs uppercase tracking-widest">
              <div className="flex items-center">
                <input id="remember-me" type="checkbox" className="h-4 w-4 rounded border-white/20 bg-transparent text-accent focus:ring-accent" />
                <label htmlFor="remember-me" className="ml-2 block text-foreground/70">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-accent hover:text-accent/80">
                  Forgot password?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium uppercase tracking-widest text-background bg-foreground hover:bg-foreground/90 transition-colors focus:outline-none disabled:opacity-50"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleOtpSubmit}>
            <div className="space-y-4">
              <p className="text-sm text-foreground/70 text-center">
                We sent a 6-digit verification code to {email}. It will expire in 10 minutes.
              </p>
              <div>
                <label className="sr-only">Verification Code (OTP)</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  className="w-full px-4 py-3 text-center tracking-[0.5em] text-2xl bg-transparent border border-white/20 rounded-none text-foreground placeholder-foreground/40 focus:outline-none focus:border-accent transition-colors"
                  placeholder="------"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium uppercase tracking-widest text-background bg-foreground hover:bg-foreground/90 transition-colors focus:outline-none disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Verify & Login'}
              </button>
            </div>
          </form>
        )}
        
        <div className="mt-6 text-center text-xs uppercase tracking-widest text-foreground/60 space-y-4">
          <p>
            Don't have an account?{' '}
            <Link href="/register" className="text-accent hover:text-accent/80 font-medium">
              Create Account
            </Link>
          </p>
          <div className="pt-4 border-t border-white/10 flex justify-center gap-6">
            <p>
              <a href="/seller/register" className="text-accent hover:text-accent/80 font-medium">
                Apply as Seller
              </a>
            </p>
            <p className="text-white/20">|</p>
            <p>
              <a href="/influencer/register" className="text-accent hover:text-accent/80 font-medium">
                Apply as Influencer
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

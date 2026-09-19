'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function OrderSuccessContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [orderNumber, setOrderNumber] = useState('');
  const searchParams = useSearchParams();
  const orderId = searchParams?.get('id');

  useEffect(() => {
    if (orderId) {
      setOrderNumber(orderId.substring(0, 8).toUpperCase());
    } else {
      setOrderNumber(Math.floor(Math.random() * 90000) + 10000 + '');
    }

    // Trigger confetti
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults, particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults, particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white p-12 rounded-2xl shadow-xl flex flex-col items-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        
        <h1 className="text-4xl font-serif mb-2">Thank You!</h1>
        <p className="text-gray-500 mb-8">Your order {orderNumber ? `#ORD-${orderNumber}` : ''} has been confirmed.</p>
        
        <div className="w-full bg-gray-50 rounded-lg p-6 mb-8 text-left">
          <h3 className="font-medium mb-2 text-sm uppercase tracking-widest text-gray-500">Next Steps</h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            We've sent an order confirmation to your email. You will receive another notification once your royal attire has been dispatched.
          </p>
        </div>
        <div className="flex flex-col w-full gap-3 mt-6">
          {orderId && (
            <Link 
              href={`/invoice/${orderId}`}
              className="w-full bg-white text-black border border-black py-4 rounded font-medium tracking-wide hover:bg-gray-50 transition-colors block text-center"
            >
              Download Bill / Invoice
            </Link>
          )}
          
          <Link 
            href="/shop"
            className="w-full bg-black text-white py-4 rounded font-medium tracking-wide hover:bg-gray-800 transition-colors block text-center"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center">Loading...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}

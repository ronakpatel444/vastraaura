import { NextRequest, NextResponse } from 'next/server';
import { COUNTRIES } from '@/lib/currency';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // 1. Check CDN / Cloud Platform geo headers (Vercel, Cloudflare, etc.)
    const vercelCountry = req.headers.get('x-vercel-ip-country');
    const cloudflareCountry = req.headers.get('cf-ipcountry');
    
    let countryCode = (vercelCountry || cloudflareCountry || '').toUpperCase();

    // 2. If no header or local development, check client IP
    if (!countryCode || countryCode === 'XX') {
      const forwarded = req.headers.get('x-forwarded-for');
      const ip = forwarded ? forwarded.split(',')[0].trim() : req.headers.get('x-real-ip');

      if (ip && ip !== '127.0.0.1' && ip !== '::1' && !ip.startsWith('192.168.') && !ip.startsWith('10.')) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 1200); // 1.2s fast timeout
          const res = await fetch(`https://api.country.is/${ip}`, { signal: controller.signal });
          clearTimeout(timeout);
          if (res.ok) {
            const data = await res.json();
            if (data.country) {
              countryCode = data.country.toUpperCase();
            }
          }
        } catch {
          // Ignore external fetch error
        }
      }
    }

    // Default to 'IN' if unknown or not mapped
    const resolvedCode = COUNTRIES[countryCode] ? countryCode : (countryCode ? (['US', 'GB', 'CA', 'AU'].includes(countryCode) ? countryCode : 'US') : 'IN');

    return NextResponse.json({
      country: resolvedCode,
      config: COUNTRIES[resolvedCode] || COUNTRIES.IN,
    });
  } catch (error) {
    return NextResponse.json({
      country: 'IN',
      config: COUNTRIES.IN,
    });
  }
}

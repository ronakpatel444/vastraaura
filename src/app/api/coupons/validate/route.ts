import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Coupon from '@/models/Coupon';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, cartCount } = body;

    if (!code) {
      return NextResponse.json({ error: 'Coupon code is required' }, { status: 400 });
    }

    await connectToDatabase();
    
    // Support matching uppercase code and handle common WELCOME15/WELECOM15 alias
    const searchCode = code.toUpperCase().trim();
    const lookupCodes = [searchCode];
    if (searchCode === 'WELCOME15') lookupCodes.push('WELECOM15');
    if (searchCode === 'WELECOM15') lookupCodes.push('WELCOME15');

    const coupon = await Coupon.findOne({ 
      code: { $in: lookupCodes }, 
      isActive: true 
    });
    
    if (!coupon) {
      return NextResponse.json({ error: 'Invalid or expired coupon' }, { status: 404 });
    }

    if (coupon.minQuantity && coupon.minQuantity > 0 && typeof cartCount === 'number' && cartCount < coupon.minQuantity) {
      return NextResponse.json({ 
        error: `This coupon is valid only on purchase of ${coupon.minQuantity} or more items.` 
      }, { status: 400 });
    }
    
    return NextResponse.json(coupon);
  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 });
  }
}

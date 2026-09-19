import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Coupon from '@/models/Coupon';

export async function GET() {
  try {
    await connectToDatabase();
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    return NextResponse.json(coupons);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json({ error: 'Failed to fetch coupons' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await connectToDatabase();
    
    // Ensure code is uppercase
    if (body.code) {
      body.code = body.code.toUpperCase();
    }

    const newCoupon = await Coupon.create(body);
    return NextResponse.json(newCoupon, { status: 201 });
  } catch (error: any) {
    console.error('Error creating coupon:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
  }
}

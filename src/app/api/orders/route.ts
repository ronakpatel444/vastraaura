import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import { sendCustomerOrderEmail, sendAdminOrderEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    const orders = await Order.find({}).sort({ createdAt: -1 });
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await connectToDatabase();
    
    // In a real production app, we would calculate the subtotal/total on the server side
    // to prevent tampering, but for this MVP we accept the client's calculations.
    
    const newOrder = await Order.create(body);
    
    // Trigger emails asynchronously for COD orders (Razorpay triggers in verify route)
    if (newOrder.paymentMethod === 'COD') {
      sendCustomerOrderEmail(newOrder).catch(console.error);
      const adminEmail = process.env.ADMIN_EMAIL || 'hello@vastraaura.com';
      sendAdminOrderEmail(newOrder, adminEmail).catch(console.error);
    }
    
    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}

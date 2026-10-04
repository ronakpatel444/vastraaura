import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Product from '@/models/Product';
import Order from '@/models/Order';
import Payout from '@/models/Payout';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const seller = await User.findById(id).lean();
    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    const products = await Product.find({ sellerId: id }).lean();
    const orders = await Order.find({ 'items.sellerId': id }).lean();
    const payouts = await Payout.find({ userId: id }).lean();

    let onlineSales = 0;
    let codSales = 0;

    orders.forEach(order => {
      const isCod = order.paymentMethod === 'COD';
      order.items.forEach((item: any) => {
        if (item.sellerId?.toString() === id) {
          const itemTotal = item.price * item.quantity;
          if (isCod) onlineSales += 0; // Wait, COD is not online
          if (isCod) codSales += itemTotal;
          else onlineSales += itemTotal;
        }
      });
    });

    const pendingPayout = payouts
      .filter(p => p.status === 'Pending')
      .reduce((sum, p) => sum + p.amount, 0);

    return NextResponse.json({
      success: true,
      seller,
      products,
      stats: {
        onlineSales,
        codSales,
        pendingPayout,
        totalOrders: orders.length
      }
    });

  } catch (error) {
    console.error('Error fetching seller details:', error);
    return NextResponse.json({ error: 'Failed to fetch seller' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Payout from '@/models/Payout';
import Order from '@/models/Order';
import User from '@/models/User';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Fetch all payouts
    const payouts = await Payout.find({ userType: 'seller' }).sort({ createdAt: -1 }).lean();
    
    // Group seller stats
    const sellerIds = [...new Set(payouts.map(p => p.userId))];
    
    const sellerStats: Record<string, { online: number, cod: number, name: string, businessName: string }> = {};
    
    // Fetch user details for these sellers
    const users = await User.find({ _id: { $in: sellerIds } }).lean();
    users.forEach(u => {
      sellerStats[u._id.toString()] = { online: 0, cod: 0, name: u.name, businessName: u.businessName || 'N/A' };
    });
    
    // Aggregate orders for these sellers
    const orders = await Order.find({ 'items.sellerId': { $in: sellerIds } }).lean();
    
    orders.forEach(order => {
      const isCod = order.paymentMethod === 'COD';
      
      order.items.forEach((item: any) => {
        const sid = item.sellerId?.toString();
        if (sid && sellerStats[sid]) {
          const itemTotal = item.price * item.quantity;
          if (isCod) {
            sellerStats[sid].cod += itemTotal;
          } else {
            sellerStats[sid].online += itemTotal;
          }
        }
      });
    });

    const enrichedPayouts = payouts.map(p => {
      const sid = p.userId?.toString();
      return {
        ...p,
        sellerDetails: sellerStats[sid] || { online: 0, cod: 0, name: 'Unknown', businessName: 'Unknown' }
      };
    });
    
    return NextResponse.json({ success: true, payouts: enrichedPayouts });
  } catch (err: any) {
    console.error('Error fetching admin payouts:', err);
    return NextResponse.json({ success: false, error: 'Failed to fetch payouts' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { payoutId, status, reference } = await req.json();
    await connectToDatabase();
    
    const updated = await Payout.findByIdAndUpdate(
      payoutId,
      { status, reference: reference || `REF-${Date.now()}` },
      { new: true }
    );
    
    return NextResponse.json({ success: true, payout: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: 'Failed to update payout' }, { status: 500 });
  }
}

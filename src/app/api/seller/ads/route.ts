import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import AdSlot from '@/models/AdSlot';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    
    // Fetch all slots to show availability calendar
    const slots = await AdSlot.find({}).sort({ startDate: 1 }).lean();
    
    // Also fetch the logged in seller's bookings specifically
    const session = await getSession();
    const myBookings = session?.userId && session.userId !== 'test_seller_123' 
      ? slots.filter(s => s.sellerId === session.userId)
      : [];

    return NextResponse.json({ success: true, allSlots: slots, myBookings });
  } catch (error) {
    console.error('Error fetching ad slots:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch slots' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId || session.userId === 'test_seller_123') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, startDate, endDate, amountPaid, paymentMethod, transactionId, contentUrl, sellerName } = await req.json();
    
    await connectToDatabase();

    // Check for double booking (Overlap logic)
    // If it's a Hero Banner, only 1 seller can have it at a time.
    if (type === 'Hero Banner') {
      const overlapping = await AdSlot.findOne({
        type: 'Hero Banner',
        status: { $in: ['Pending', 'Approved'] },
        $or: [
          { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }
        ]
      });

      if (overlapping) {
        return NextResponse.json({ error: 'This slot is already booked for the selected dates.' }, { status: 400 });
      }
    }

    const newSlot = await AdSlot.create({
      sellerId: session.userId,
      sellerName,
      type,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      amountPaid,
      paymentMethod,
      transactionId,
      contentUrl,
      status: 'Pending'
    });

    return NextResponse.json({ success: true, slot: newSlot }, { status: 201 });
  } catch (error) {
    console.error('Error booking ad slot:', error);
    return NextResponse.json({ success: false, error: 'Failed to book slot' }, { status: 500 });
  }
}

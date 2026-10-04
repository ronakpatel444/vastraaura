import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User, { UserRole } from '@/models/User';
import { sendSellerApprovalEmail, sendSellerRejectionEmail } from '@/lib/email';

export async function GET(req: Request) {
  try {
    await connectToDatabase();
    const sellers = await User.find({ role: UserRole.SELLER }).select('-passwordHash').sort({ createdAt: -1 });
    return NextResponse.json({ success: true, sellers });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch sellers' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const { sellerId, status, reason } = await req.json();
    
    if (!['active', 'suspended', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    await connectToDatabase();
    
    const updatedSeller = await User.findByIdAndUpdate(
      sellerId,
      { status },
      { new: true }
    ).select('-passwordHash');

    if (!updatedSeller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    // Send emails
    if (status === 'active') {
      await sendSellerApprovalEmail(updatedSeller.email, updatedSeller.name);
    } else if (status === 'rejected') {
      await sendSellerRejectionEmail(updatedSeller.email, updatedSeller.name, reason || 'Does not meet platform guidelines.');
    }

    return NextResponse.json({ success: true, seller: updatedSeller });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update seller status' }, { status: 500 });
  }
}

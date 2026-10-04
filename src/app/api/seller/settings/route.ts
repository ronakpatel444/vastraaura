import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      // Return default dummy seller data if not signed in or in test mode
      return NextResponse.json({
        businessName: 'Vastra Aura Studio',
        name: 'Seller Partner',
        email: 'seller@vastraaura.com',
        phoneNumber: '+91 98765 43210',
        panCardNumber: 'ABCDE1234F',
        gstNumber: '24ABCDE1234F1Z5',
        hasOfflineShop: true,
        pickupAddress: {
          address: '402, Ring Road Textile Market',
          city: 'Surat',
          state: 'Gujarat',
          pincode: '395002',
        },
        bankDetails: {
          accountName: 'Vastra Aura Studio',
          bankName: 'State Bank of India',
          accountNumber: '389271638291',
          ifscCode: 'SBIN0001234',
        }
      });
    }

    await connectToDatabase();
    const user = await User.findById(session.userId).select('-passwordHash -otp -otpExpiry');
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching seller settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const session = await getSession();

    if (!session?.userId || session.userId === 'test_seller_123') {
      // In demo/test mode, return updated data immediately
      return NextResponse.json({ success: true, message: 'Settings saved successfully' });
    }

    await connectToDatabase();
    const updated = await User.findByIdAndUpdate(
      session.userId,
      {
        businessName: body.businessName,
        phoneNumber: body.phoneNumber,
        panCardNumber: body.panCardNumber,
        gstNumber: body.gstNumber,
        hasOfflineShop: body.hasOfflineShop,
        pickupAddress: body.pickupAddress,
        bankDetails: body.bankDetails,
      },
      { new: true }
    );

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    console.error('Error updating seller settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}

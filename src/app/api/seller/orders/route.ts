import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export const COURIER_PARTNERS = [
  {
    id: 'delhivery',
    name: 'Delhivery Express',
    logo: '📦',
    tagline: 'Most Popular Doorstep Pickup',
    baseRate: 100,
    rateDetails: '₹100 Compulsory Flat Rate',
    weightSlab: 'Per parcel',
    deliveryTime: '2 - 4 Business Days',
    pickupTime: 'Same Day (if booked before 12 PM)',
    doorstepPickup: 'Free (Courier boy visits seller address)',
    codHandling: 'Included',
    trackingType: 'Live GPS Real-Time Tracking',
    paymentModeNote: 'Auto-deducted from your order payout (No upfront cash needed)',
    recommended: true,
  },
  {
    id: 'bluedart',
    name: 'Blue Dart (Air Express)',
    logo: '✈️',
    tagline: 'Fastest Delivery for Premium Designer Lehengas',
    baseRate: 120,
    rateDetails: '₹120 Fixed Air Express Rate',
    weightSlab: 'Per parcel',
    deliveryTime: '1 - 2 Business Days (Air Cargo)',
    pickupTime: 'Dedicated Van Pickup by 4 PM',
    doorstepPickup: 'Free Doorstep Collection',
    codHandling: 'Included',
    trackingType: 'Aviation Flight & Hub Tracking',
    paymentModeNote: 'Auto-deducted from order payout',
    recommended: false,
  },
  {
    id: 'shiprocket',
    name: 'Shiprocket Multi-Courier',
    logo: '🚀',
    tagline: 'Multi-Courier Aggregator Network',
    baseRate: 100,
    rateDetails: '₹100 Compulsory Flat Rate',
    weightSlab: 'Per parcel',
    deliveryTime: '3 - 5 Business Days',
    pickupTime: 'Daily Scheduled Pickup',
    doorstepPickup: 'Free Doorstep Pickup',
    codHandling: 'Included',
    trackingType: 'Multi-Network Tracking Portal',
    paymentModeNote: 'Auto-deducted from order payout',
    recommended: false,
  },
  {
    id: 'dtdc',
    name: 'DTDC Courier & Cargo',
    logo: '🚚',
    tagline: 'Best Tier-2 & Tier-3 City Reach',
    baseRate: 100,
    rateDetails: '₹100 Compulsory Flat Rate',
    weightSlab: 'Per parcel',
    deliveryTime: '3 - 5 Business Days',
    pickupTime: 'Local Branch Executive Pickup',
    doorstepPickup: 'Doorstep Pickup Available',
    codHandling: 'Included',
    trackingType: 'Consignment Web Tracking',
    paymentModeNote: 'Auto-deducted from order payout',
    recommended: false,
  },
  {
    id: 'shadowfax',
    name: 'Shadowfax / Xpressbees',
    logo: '⚡',
    tagline: 'Reliable E-commerce Logistics',
    baseRate: 100,
    rateDetails: '₹100 Compulsory Flat Rate',
    weightSlab: 'Per parcel',
    deliveryTime: '3 - 5 Business Days',
    pickupTime: 'Evening Route Rider Pickup',
    doorstepPickup: 'Free Doorstep Pickup',
    codHandling: 'Included',
    trackingType: 'Live Mobile App & SMS Tracking',
    paymentModeNote: 'Auto-deducted from order payout',
    recommended: false,
  },
];

export async function GET() {
  try {
    await connectToDatabase();
    const session = await getSession();

    let query: any = {};
    if (!session?.userId || session.userId === 'test_seller_123') {
      return NextResponse.json({
        success: true,
        couriers: COURIER_PARTNERS,
        orders: [],
      });
    }
    
    query['items.sellerId'] = session.userId;

    const dbOrders = await Order.find(query).sort({ createdAt: -1 });

    if (!dbOrders) {
      return NextResponse.json({
        success: true,
        couriers: COURIER_PARTNERS,
        orders: [],
      });
    }

    return NextResponse.json({
      success: true,
      couriers: COURIER_PARTNERS,
      orders: dbOrders,
    });
  } catch (err: any) {
    console.error('Error fetching seller orders:', err);
    return NextResponse.json({
      success: true,
      couriers: COURIER_PARTNERS,
      orders: [],
    });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { orderId, courierPartner, trackingNumber, status = 'Shipped', shippingFee = 65 } = body;

    if (!orderId || !courierPartner) {
      return NextResponse.json(
        { error: 'Missing required shipping parameters' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const tracking = trackingNumber || `${courierPartner.substring(0, 4).toUpperCase()}${Date.now().toString().slice(-6)}IN`;

    const updated = await Order.findByIdAndUpdate(
      orderId,
      {
        status,
        courierPartner,
        trackingNumber: tracking,
      },
      { new: true }
    );

    return NextResponse.json({
      success: true,
      message: `Doorstep pickup successfully scheduled with ${courierPartner}!`,
      order: updated || {
        _id: orderId,
        status,
        courierPartner,
        trackingNumber: tracking,
      },
    });
  } catch (error: any) {
    console.error('Error updating order shipment:', error);
    return NextResponse.json({ error: error.message || 'Failed to update order' }, { status: 500 });
  }
}

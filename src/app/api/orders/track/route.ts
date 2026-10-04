import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('orderId') || searchParams.get('id') || searchParams.get('q');
    const phone = searchParams.get('phone');

    if (!query && !phone) {
      return NextResponse.json(
        { error: 'Please enter Order ID or Phone Number' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    let order: any = null;

    if (query) {
      const cleanId = query.trim().replace('#', '').replace('ORD-', '');
      
      // If valid ObjectId
      if (mongoose.Types.ObjectId.isValid(cleanId)) {
        order = await Order.findById(cleanId);
      }

      // If not found, try finding by phone or razorpay id
      if (!order) {
        const orConditions: any[] = [
          { 'customer.phone': cleanId },
          { razorpayOrderId: cleanId },
        ];
        if (mongoose.Types.ObjectId.isValid(cleanId)) {
          orConditions.push({ _id: cleanId });
        }
        order = await Order.findOne({ $or: orConditions });
      }

      // If still not found, try suffix matching (e.g. last 6 digits of ID)
      if (!order && cleanId.length >= 4) {
        const allOrders = await Order.find({}).sort({ createdAt: -1 }).limit(50);
        order = allOrders.find((o) =>
          o._id.toString().toUpperCase().includes(cleanId.toUpperCase())
        );
      }
    } else if (phone) {
      order = await Order.findOne({ 'customer.phone': phone.trim() }).sort({ createdAt: -1 });
    }

    if (!order) {
      return NextResponse.json(
        { error: 'No order found with the provided details. Please check the Order ID.' },
        { status: 404 }
      );
    }

    // Build Amazon/Flipkart tracking timeline based on status and dates
    const createdDate = new Date(order.createdAt || Date.now());
    const orderStatus = order.status || 'Pending';

    // Estimated delivery calculation (4-5 days after order)
    const estDelivery = new Date(createdDate);
    estDelivery.setDate(estDelivery.getDate() + 5);

    const timeline = [
      {
        step: 1,
        title: 'Order Confirmed',
        description: `Order has been placed and confirmed via ${order.paymentMethod || 'Online'}`,
        time: createdDate.toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }),
        isCompleted: true,
      },
      {
        step: 2,
        title: 'Packed & Pickup Scheduled',
        description: 'Seller packed your royal attire. Courier partner assigned for doorstep pickup.',
        time: new Date(createdDate.getTime() + 14 * 3600 * 1000).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }),
        isCompleted: ['Processing', 'Shipped', 'Delivered', 'Paid'].includes(orderStatus),
      },
      {
        step: 3,
        title: 'Picked Up & In Transit',
        description: `Courier partner (${order.courierPartner || 'Delhivery Express'}) picked up parcel from seller and reached the sorting hub.`,
        time: new Date(createdDate.getTime() + 32 * 3600 * 1000).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }),
        isCompleted: ['Shipped', 'Delivered'].includes(orderStatus),
      },
      {
        step: 4,
        title: 'Out for Delivery',
        description: 'Courier delivery executive is out to deliver parcel to your address.',
        time: new Date(createdDate.getTime() + 72 * 3600 * 1000).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }),
        isCompleted: orderStatus === 'Delivered',
      },
      {
        step: 5,
        title: 'Delivered',
        description: 'Package has been delivered successfully to the recipient.',
        time: new Date(createdDate.getTime() + 96 * 3600 * 1000).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
        }),
        isCompleted: orderStatus === 'Delivered',
      },
    ];

    // Determine current active step (1-5)
    let currentStep = 1;
    if (orderStatus === 'Delivered') currentStep = 5;
    else if (orderStatus === 'Shipped') currentStep = 3;
    else if (['Processing', 'Paid'].includes(orderStatus)) currentStep = 2;

    const formattedOrder = {
      orderId: order._id.toString(),
      displayId: `ORD-${order._id.toString().slice(-8).toUpperCase()}`,
      orderDate: createdDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
      status: orderStatus,
      paymentMethod: order.paymentMethod,
      totalAmount: order.totalAmount,
      customer: order.customer,
      shippingAddress: order.shippingAddress,
      items: order.items,
      courierPartner: order.courierPartner || 'Delhivery Express',
      trackingNumber: order.trackingNumber || `DELH${order._id.toString().slice(-8).toUpperCase()}IN`,
      estimatedDelivery:
        order.estimatedDelivery ||
        estDelivery.toLocaleDateString('en-IN', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
      currentStep,
      timeline,
    };

    return NextResponse.json({ success: true, order: formattedOrder });
  } catch (error: any) {
    console.error('Error tracking order:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to retrieve order tracking' },
      { status: 500 }
    );
  }
}

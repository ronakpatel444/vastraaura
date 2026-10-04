import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    const session = await getSession();

    let orderQuery: any = {};
    let productQuery: any = {};

    if (!session?.userId || session.userId === 'test_seller_123') {
      return NextResponse.json({
        success: true,
        stats: { totalRevenue: 0, shippingDeductions: 0, netPayout: 0, totalOrders: 0, totalProducts: 0, activeCampaigns: 0 },
        recentOrders: []
      });
    }

    orderQuery['items.sellerId'] = session.userId;
    productQuery.sellerId = session.userId;

    const [dbOrders, productCount, recentOrdersDb] = await Promise.all([
      Order.find(orderQuery),
      Product.countDocuments(productQuery),
      Order.find(orderQuery).sort({ createdAt: -1 }).limit(5),
    ]);

    let totalOrders = dbOrders?.length || 0;
    let totalRevenue = 0;
    let shippingDeductions = 0;

    if (dbOrders && dbOrders.length > 0) {
      totalRevenue = dbOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      shippingDeductions = totalOrders * 60; // ₹60/parcel
    }

    const netPayout = Math.max(0, totalRevenue - shippingDeductions);
    
    // Process recent orders for the frontend
    const recentOrders = recentOrdersDb.map(order => ({
      _id: order._id,
      customerName: `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || 'Guest User',
      itemCount: order.items?.length || 1,
      totalAmount: order.totalAmount || 0,
      status: order.status || 'Paid',
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalRevenue,
        shippingDeductions,
        netPayout,
        totalOrders,
        totalProducts: productCount || 0,
        activeCampaigns: 0,
      },
      recentOrders,
    });
  } catch (e) {
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch stats',
      stats: {
        totalRevenue: 0,
        shippingDeductions: 0,
        netPayout: 0,
        totalOrders: 0,
        totalProducts: 0,
        activeCampaigns: 0,
      },
      recentOrders: []
    });
  }
}

import { NextResponse } from 'next/server';

export async function GET() {
  // Simulating database fetch
  const dummyLinks = [
    {
      id: 'LNK-001',
      productName: 'Royal Blue Velvet Lehenga',
      url: 'https://vastraaura.com/shop/royal-blue?ref=riyafashion',
      clicks: 342,
      conversions: 12,
      earnings: 12000, // INR
      status: 'Active',
      createdAt: '2026-09-20T10:00:00Z'
    },
    {
      id: 'LNK-002',
      productName: 'Pink Floral Chaniya Choli',
      url: 'https://vastraaura.com/shop/pink-floral?ref=riyafashion',
      clicks: 128,
      conversions: 3,
      earnings: 3000,
      status: 'Active',
      createdAt: '2026-09-25T14:30:00Z'
    }
  ];

  return NextResponse.json(dummyLinks);
}

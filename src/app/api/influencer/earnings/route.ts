import { NextResponse } from 'next/server';

export async function GET() {
  const dummyEarnings = [
    {
      id: 'PAY-001',
      date: '2026-09-28T10:00:00Z',
      amount: 15000,
      status: 'Paid',
      method: 'Bank Transfer (HDFC****1234)',
      reference: 'TXN-987654321'
    },
    {
      id: 'PAY-002',
      date: '2026-09-15T14:30:00Z',
      amount: 8500,
      status: 'Paid',
      method: 'UPI (riya@okicici)',
      reference: 'TXN-123456789'
    },
    {
      id: 'PAY-003',
      date: '2026-10-05T00:00:00Z',
      amount: 4000,
      status: 'Pending',
      method: 'Bank Transfer (HDFC****1234)',
      reference: 'Upcoming'
    }
  ];

  return NextResponse.json(dummyEarnings);
}

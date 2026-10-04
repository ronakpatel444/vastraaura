import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Collaboration from '@/models/Collaboration';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();
    const session = await getSession();

    let query: any = {};
    if (session?.userId) {
      query.influencerId = session.userId;
    }

    const requests = await Collaboration.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error('Error fetching influencer collaborations:', error);
    return NextResponse.json({
      success: true,
      requests: [],
    });
  }
}

export async function PUT(req: Request) {
  try {
    const { id, status } = await req.json();
    if (!id || !status) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    await connectToDatabase();
    const updated = await Collaboration.findByIdAndUpdate(id, { status }, { new: true });

    return NextResponse.json({ success: true, updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

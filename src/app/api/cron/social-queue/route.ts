import { NextResponse } from 'next/server';
import { processSocialQueue } from '@/lib/socialQueue';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await processSocialQueue();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      result,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


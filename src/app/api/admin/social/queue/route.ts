import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import SocialQueue from '@/models/SocialQueue';
import { processSocialQueue, scheduleNextQueueRun } from '@/lib/socialQueue';

// GET: Fetch queue list and counts
export async function GET() {
  try {
    await dbConnect();

    // Check & trigger if any item is already due
    processSocialQueue().catch(() => {});

    const [pending, published, failed] = await Promise.all([
      SocialQueue.find({ status: { $in: ['PENDING', 'PROCESSING'] } })
        .sort({ scheduledAt: 1 })
        .limit(50),
      SocialQueue.find({ status: 'PUBLISHED' })
        .sort({ publishedAt: -1 })
        .limit(20),
      SocialQueue.find({ status: 'FAILED' })
        .sort({ updatedAt: -1 })
        .limit(20),
    ]);

    const totalPending = await SocialQueue.countDocuments({ status: 'PENDING' });
    const totalPublished = await SocialQueue.countDocuments({ status: 'PUBLISHED' });
    const totalFailed = await SocialQueue.countDocuments({ status: 'FAILED' });

    return NextResponse.json({
      success: true,
      stats: {
        pending: totalPending,
        published: totalPublished,
        failed: totalFailed,
      },
      queue: {
        pending,
        published,
        failed,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Manage queue (Process now, Delete, Retry)
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { action, id } = await req.json();

    if (action === 'process_now') {
      const result = await processSocialQueue();
      return NextResponse.json({
        success: true,
        message: result.processed ? 'Processed due item successfully!' : (result.error || 'No items due right now.'),
        result,
      });
    }

    if (action === 'delete' && id) {
      await SocialQueue.findByIdAndDelete(id);
      scheduleNextQueueRun();
      return NextResponse.json({ success: true, message: 'Queue item removed.' });
    }

    if (action === 'retry' && id) {
      await SocialQueue.findByIdAndUpdate(id, {
        status: 'PENDING',
        scheduledAt: new Date(),
        attempts: 0,
        error: '',
      });
      processSocialQueue().catch(() => {});
      return NextResponse.json({ success: true, message: 'Item rescheduled for immediate publishing.' });
    }

    if (action === 'clear_all_failed') {
      await SocialQueue.deleteMany({ status: 'FAILED' });
      return NextResponse.json({ success: true, message: 'Cleared all failed items.' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


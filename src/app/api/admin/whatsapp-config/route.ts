import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Settings from '@/models/Settings';

// GET: Fetch WhatsApp automation config
export async function GET() {
  try {
    await dbConnect();
    const settings = await Settings.findOne() || {};
    return NextResponse.json({
      whatsappAllowedGroups: settings.whatsappAllowedGroups || [],
      whatsappAutoSocial: settings.whatsappAutoSocial || false,
      whatsappAutoSocialChannels: settings.whatsappAutoSocialChannels || ['instagram_feed', 'facebook_page'],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Update WhatsApp automation config
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { whatsappAllowedGroups, whatsappAutoSocial, whatsappAutoSocialChannels } = await req.json();

    const updateData: any = {};
    if (whatsappAllowedGroups !== undefined) updateData.whatsappAllowedGroups = whatsappAllowedGroups;
    if (whatsappAutoSocial !== undefined) updateData.whatsappAutoSocial = whatsappAutoSocial;
    if (whatsappAutoSocialChannels !== undefined) updateData.whatsappAutoSocialChannels = whatsappAutoSocialChannels;

    await Settings.findOneAndUpdate({}, updateData, { upsert: true, new: true });
    return NextResponse.json({ success: true, message: 'WhatsApp automation config updated!' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


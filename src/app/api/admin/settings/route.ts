import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Settings from '@/models/Settings';

export async function GET() {
  try {
    await dbConnect();
    let settings = await Settings.findOne();
    
    // If no settings exist yet, create default
    if (!settings) {
      settings = await Settings.create({});
    }
    
    return NextResponse.json(settings);
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await dbConnect();
    const data = await req.json();
    
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = await Settings.create(data);
    } else {
      settings = await Settings.findOneAndUpdate({}, data, { new: true });
    }
    
    return NextResponse.json(settings);
  } catch (error: any) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

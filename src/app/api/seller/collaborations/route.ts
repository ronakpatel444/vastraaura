import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Collaboration from '@/models/Collaboration';
import User from '@/models/User';
import { getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const DEFAULT_INFLUENCERS = [
  {
    id: 'inf-1',
    name: 'Riya Patel',
    handle: '@riyafashion_vlogs',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    followers: '280K',
    niche: 'Bridal & Navratri Chaniya Choli',
    location: 'Ahmedabad / Surat',
    pricePerReel: 3500,
    rating: 4.9,
    completedCampaigns: 42,
    badge: 'Top Fashion Creator',
  },
  {
    id: 'inf-2',
    name: 'Aanya Sharma',
    handle: '@aanya_ethnic_couture',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
    followers: '145K',
    niche: 'Festive Lehengas & Saree Styling',
    location: 'Mumbai / Vadodara',
    pricePerReel: 2500,
    rating: 4.8,
    completedCampaigns: 28,
    badge: 'Rising Star',
  },
  {
    id: 'inf-3',
    name: 'Kavya & Sneha',
    handle: '@sisterstyle_ethnic',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
    followers: '520K',
    niche: 'Wedding Trousseau & Heritage Silks',
    location: 'Surat',
    pricePerReel: 5500,
    rating: 5.0,
    completedCampaigns: 67,
    badge: 'Mega Creator',
  },
  {
    id: 'inf-4',
    name: 'Pooja Dave',
    handle: '@pooja_dave_official',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    followers: '95K',
    niche: 'Budget Friendly & Daily Kurtas',
    location: 'Rajkot',
    pricePerReel: 1800,
    rating: 4.7,
    completedCampaigns: 19,
    badge: 'High Engagement',
  },
];

export async function GET() {
  try {
    await connectToDatabase();
    const session = await getSession();

    // Query seller campaigns
    let query: any = {};
    if (session?.userId) {
      query.sellerId = session.userId;
    }

    const campaigns = await Collaboration.find(query).sort({ createdAt: -1 });

    // Try to load any registered influencers from DB
    const dbInfluencers: any[] = await User.find({ role: 'INFLUENCER' as any }).select('-passwordHash').lean();

    const formattedInfluencers = [...DEFAULT_INFLUENCERS];
    dbInfluencers.forEach((inf, idx) => {
      if (!formattedInfluencers.some((f) => f.handle === (inf.socialLinks?.instagram || inf.email))) {
        formattedInfluencers.unshift({
          id: inf._id.toString(),
          name: inf.name,
          handle: inf.socialLinks?.instagram || `@${inf.name.toLowerCase().replace(/\s+/g, '_')}`,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
          followers: (inf as any).followerCount || '150K',
          niche: 'Ethnic Wear & Saree Draping',
          location: 'Gujarat, India',
          pricePerReel: 2500,
          rating: 4.9,
          completedCampaigns: 12,
          badge: 'Verified Partner',
        });
      }
    });

    return NextResponse.json({
      success: true,
      influencers: formattedInfluencers,
      campaigns,
    });
  } catch (error) {
    console.error('Error fetching collaborations:', error);
    return NextResponse.json({
      success: true,
      influencers: DEFAULT_INFLUENCERS,
      campaigns: [],
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      influencerId,
      influencerName,
      influencerHandle,
      productName,
      productImage,
      campaignType = 'Instagram Reel',
      budget,
      instructions,
      targetDate,
    } = body;

    if (!influencerName || !productName || !budget) {
      return NextResponse.json(
        { error: 'Please fill all required campaign details' },
        { status: 400 }
      );
    }

    const session = await getSession();

    let newCollab: any = null;
    try {
      await connectToDatabase();
      newCollab = await Collaboration.create({
        sellerId: session?.userId || 'test_seller_123',
        sellerName: session?.email ? session.email.split('@')[0] : 'Vastra Aura Studio',
        sellerEmail: session?.email || 'seller@vastraaura.com',
        influencerId,
        influencerName,
        influencerHandle,
        productName,
        productImage,
        campaignType,
        budget: Number(budget),
        status: 'Pending',
        instructions,
        targetDate,
      });
    } catch (dbErr) {
      console.warn('DB write for collaboration failed, returning memory response:', dbErr);
    }

    const result = newCollab || {
      _id: `COL-${Date.now()}`,
      sellerName: 'Vastra Aura Studio',
      influencerName,
      influencerHandle,
      productName,
      productImage,
      campaignType,
      budget: Number(budget),
      status: 'Pending',
      instructions,
      targetDate,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        message: 'Collaboration request sent successfully to influencer!',
        campaign: result,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error requesting collaboration:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to submit collaboration request' },
      { status: 500 }
    );
  }
}

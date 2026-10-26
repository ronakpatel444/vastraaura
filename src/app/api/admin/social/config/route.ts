import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Settings from '@/models/Settings';
import axios from 'axios';

export async function GET() {
  try {
    await dbConnect();
    const settings = await Settings.findOne() || {};

    const token = settings.metaAccessToken || process.env.META_ACCESS_TOKEN || '';
    const pageId = settings.metaPageId || process.env.META_PAGE_ID || '';
    const igAccountId = settings.metaIgAccountId || process.env.META_IG_ACCOUNT_ID || '';
    const adAccountId = settings.metaAdAccountId || process.env.META_AD_ACCOUNT_ID || '';
    const pinterestToken = settings.pinterestAccessToken || process.env.PINTEREST_ACCESS_TOKEN || '';
    const pinterestBoardId = settings.pinterestBoardId || process.env.PINTEREST_BOARD_ID || '';

    let isConnected = false;
    let igUsername = '';
    let pageName = '';
    let connectionError = '';

    if (token && igAccountId) {
      try {
        const res = await axios.get(`https://graph.facebook.com/v19.0/${igAccountId}?fields=id,username,name,profile_picture_url&access_token=${token}`, {
          timeout: 5000,
        });
        if (res.data?.id) {
          isConnected = true;
          igUsername = res.data.username || res.data.name || '';
        }
      } catch (err: any) {
        connectionError = err.response?.data?.error?.message || err.message;
      }
    }

    if (token && pageId) {
      try {
        const pageRes = await axios.get(`https://graph.facebook.com/v19.0/${pageId}?fields=id,name&access_token=${token}`, {
          timeout: 5000,
        });
        if (pageRes.data?.name) {
          pageName = pageRes.data.name;
        }
      } catch (e) {
        // silent
      }
    }

    // Check Pinterest connectivity and fetch user's boards
    let isPinterestConnected = false;
    let pinterestUsername = '';
    let pinterestBoards: { id: string; name: string }[] = [];
    let pinterestConnectionError = '';

    if (pinterestToken) {
      try {
        const pinUserRes = await axios.get('https://api.pinterest.com/v5/user_account', {
          headers: { Authorization: `Bearer ${pinterestToken}` },
          timeout: 5000,
        });
        if (pinUserRes.data?.username) {
          isPinterestConnected = true;
          pinterestUsername = pinUserRes.data.username;
        }

        const pinBoardsRes = await axios.get('https://api.pinterest.com/v5/boards', {
          headers: { Authorization: `Bearer ${pinterestToken}` },
          timeout: 5000,
        });
        if (Array.isArray(pinBoardsRes.data?.items)) {
          pinterestBoards = pinBoardsRes.data.items.map((b: any) => ({
            id: b.id,
            name: b.name,
          }));
        }
      } catch (err: any) {
        pinterestConnectionError = err.response?.data?.message || err.message;
      }
    }

    return NextResponse.json({
      isConfigured: Boolean(token && (igAccountId || pageId)),
      isConnected,
      igUsername,
      pageName,
      connectionError,
      pageId,
      igAccountId,
      adAccountId,
      hasToken: Boolean(token),
      // Pinterest
      hasPinterestToken: Boolean(pinterestToken),
      isPinterestConnected,
      pinterestUsername,
      pinterestBoardId,
      pinterestBoards,
      pinterestConnectionError,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { 
      metaAccessToken, 
      metaPageId, 
      metaIgAccountId, 
      metaAdAccountId,
      pinterestAccessToken,
      pinterestBoardId,
    } = await req.json();

    const updateData: any = {};
    if (metaAccessToken !== undefined) updateData.metaAccessToken = metaAccessToken.trim();
    if (metaPageId !== undefined) updateData.metaPageId = metaPageId.trim();
    if (metaIgAccountId !== undefined) updateData.metaIgAccountId = metaIgAccountId.trim();
    if (metaAdAccountId !== undefined) updateData.metaAdAccountId = metaAdAccountId.trim();
    if (pinterestAccessToken !== undefined) updateData.pinterestAccessToken = pinterestAccessToken.trim();
    if (pinterestBoardId !== undefined) updateData.pinterestBoardId = pinterestBoardId.trim();

    await Settings.findOneAndUpdate({}, updateData, { upsert: true, new: true });

    return NextResponse.json({ success: true, message: 'Social credentials updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

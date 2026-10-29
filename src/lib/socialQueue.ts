import dbConnect from '@/lib/mongodb';
import Settings from '@/models/Settings';
import SocialQueue, { ISocialQueue } from '@/models/SocialQueue';
import axios from 'axios';

const GRAPH_API = 'https://graph.facebook.com/v19.0';
const DEFAULT_GAP_MINUTES = 30; // 30-minute spacing between posts

// In-memory timer handle to avoid duplicate timer chains
let queueTimer: NodeJS.Timeout | null = null;

/**
 * Calculate the next available schedule time with 30-minute spacing
 */
export async function calculateNextScheduleTime(gapMinutes: number = DEFAULT_GAP_MINUTES): Promise<Date> {
  await dbConnect();
  const now = new Date();
  const gapMs = gapMinutes * 60 * 1000;

  // 1. Find the latest scheduled item that is still PENDING or PROCESSING
  const latestPending = await SocialQueue.findOne({
    status: { $in: ['PENDING', 'PROCESSING'] },
  }).sort({ scheduledAt: -1 });

  if (latestPending && new Date(latestPending.scheduledAt).getTime() > now.getTime()) {
    // Schedule 30 minutes after the latest pending item
    return new Date(new Date(latestPending.scheduledAt).getTime() + gapMs);
  }

  // 2. If nothing pending in the future, check when the last post was actually PUBLISHED
  const lastPublished = await SocialQueue.findOne({
    status: 'PUBLISHED',
  }).sort({ publishedAt: -1 });

  if (lastPublished && lastPublished.publishedAt) {
    const elapsedSinceLast = now.getTime() - new Date(lastPublished.publishedAt).getTime();
    if (elapsedSinceLast < gapMs) {
      // Less than 30 minutes have passed since last post -> wait remaining time
      return new Date(new Date(lastPublished.publishedAt).getTime() + gapMs);
    }
  }

  // 3. Otherwise: no recent posts -> post IMMEDIATELY!
  return now;
}

/**
 * Add a new post/reel to the social queue
 */
export async function addToSocialQueue({
  productId,
  title,
  caption,
  mediaType,
  images = [],
  videoUrl = '',
  channels = ['instagram_feed', 'facebook_page'],
  gapMinutes = DEFAULT_GAP_MINUTES,
}: {
  productId?: any;
  title: string;
  caption: string;
  mediaType: 'IMAGE' | 'CAROUSEL' | 'REEL';
  images?: string[];
  videoUrl?: string;
  channels?: string[];
  gapMinutes?: number;
}) {
  await dbConnect();

  const scheduledAt = await calculateNextScheduleTime(gapMinutes);

  const queueItem = await SocialQueue.create({
    productId,
    title,
    caption,
    mediaType,
    images,
    videoUrl,
    channels,
    status: 'PENDING',
    scheduledAt,
    attempts: 0,
  });

  const delayMs = scheduledAt.getTime() - Date.now();
  const delayMinutes = Math.round(delayMs / 60000);

  console.log(`[SocialQueue] 📥 Enqueued "${title}" (${mediaType}) for ${scheduledAt.toLocaleTimeString()} (${delayMinutes <= 0 ? 'Immediately' : `in ${delayMinutes} mins`})`);

  // Trigger processor
  scheduleNextQueueRun();

  return queueItem;
}

/**
 * Process single queue item via Meta API
 */
async function publishQueueItem(item: ISocialQueue, settings: any) {
  const token = settings?.metaAccessToken || process.env.META_ACCESS_TOKEN || '';
  const pageId = settings?.metaPageId || process.env.META_PAGE_ID || '';
  const igAccountId = settings?.metaIgAccountId || process.env.META_IG_ACCOUNT_ID || '';
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vastraaura.com';

  if (!token) {
    throw new Error('Meta Access Token is missing. Please update credentials in Social Settings.');
  }

  const results: any = {};
  const caption = item.caption;

  // Format image URLs
  const fullImages = (item.images || []).map((img) => {
    if (img.startsWith('http')) return img;
    return `${baseUrl}${img.startsWith('/') ? img : '/' + img}`;
  });

  // ── CASE 1: VIDEO REEL ───────────────────────────────────────────────────
  if (item.mediaType === 'REEL' && item.videoUrl) {
    const fullVideoUrl = item.videoUrl.startsWith('http') ? item.videoUrl : `${baseUrl}${item.videoUrl.startsWith('/') ? item.videoUrl : '/' + item.videoUrl}`;

    // Instagram Reel
    if (igAccountId && (item.channels.includes('instagram_reel') || item.channels.includes('instagram_feed'))) {
      console.log(`[SocialQueue] 🎬 Publishing Instagram Reel for: "${item.title}"`);
      const igRes = await axios.post(`${GRAPH_API}/${igAccountId}/media`, {
        media_type: 'REELS',
        video_url: fullVideoUrl,
        caption: caption,
        share_to_feed: true,
        access_token: token,
      });

      // Poll until ready (video upload takes time)
      let status = 'IN_PROGRESS';
      let attempts = 0;
      while (status === 'IN_PROGRESS' && attempts < 12) {
        await new Promise((r) => setTimeout(r, 10000)); // wait 10s
        const statusRes = await axios.get(`${GRAPH_API}/${igRes.data.id}?fields=status_code&access_token=${token}`);
        status = statusRes.data.status_code || 'FINISHED';
        attempts++;
      }

      if (status === 'FINISHED' || status === 'READY') {
        const pubRes = await axios.post(`${GRAPH_API}/${igAccountId}/media_publish`, {
          creation_id: igRes.data.id,
          access_token: token,
        });
        results.instagramReel = { success: true, id: pubRes.data.id };
        console.log(`✅ [SocialQueue] Instagram Reel published! ID: ${pubRes.data.id}`);
      } else {
        throw new Error(`Instagram Reel processing status: ${status}`);
      }
    }

    // Facebook Reel
    if (pageId && item.channels.includes('facebook_page')) {
      console.log(`[SocialQueue] 🎬 Publishing Facebook Reel for: "${item.title}"`);
      const initRes = await axios.post(`${GRAPH_API}/${pageId}/video_reels`, {
        upload_phase: 'start',
        access_token: token,
      });
      const videoId = initRes.data.video_id;

      await axios.post(`https://rupload.facebook.com/video-upload/v19.0/${videoId}`, null, {
        headers: {
          Authorization: `OAuth ${token}`,
          file_url: fullVideoUrl,
        },
      });

      const finishRes = await axios.post(`${GRAPH_API}/${pageId}/video_reels`, {
        upload_phase: 'finish',
        video_id: videoId,
        video_state: 'PUBLISHED',
        description: caption,
        access_token: token,
      });

      results.facebookReel = { success: true, id: finishRes.data?.video_id || videoId };
      console.log(`✅ [SocialQueue] Facebook Reel published! ID: ${videoId}`);
    }

    return results;
  }

  // ── CASE 2: IMAGE / CAROUSEL POST ─────────────────────────────────────────

  // Instagram Feed
  if (igAccountId && item.channels.includes('instagram_feed') && fullImages.length > 0) {
    if (fullImages.length === 1) {
      console.log(`[SocialQueue] 📸 Publishing Instagram Single Image for: "${item.title}"`);
      const containerRes = await axios.post(`${GRAPH_API}/${igAccountId}/media`, {
        image_url: fullImages[0],
        caption: caption,
        access_token: token,
      });
      const pubRes = await axios.post(`${GRAPH_API}/${igAccountId}/media_publish`, {
        creation_id: containerRes.data.id,
        access_token: token,
      });
      results.instagram = { success: true, id: pubRes.data.id };
      console.log(`✅ [SocialQueue] Instagram single post published! ID: ${pubRes.data.id}`);
    } else {
      console.log(`[SocialQueue] 📸 Publishing Instagram Carousel (${fullImages.length} images) for: "${item.title}"`);
      const carouselSlice = fullImages.slice(0, 10);
      const childIds: string[] = [];

      for (const imgUrl of carouselSlice) {
        const itemRes = await axios.post(`${GRAPH_API}/${igAccountId}/media`, {
          image_url: imgUrl,
          is_carousel_item: true,
          access_token: token,
        });
        childIds.push(itemRes.data.id);
      }

      const carouselRes = await axios.post(`${GRAPH_API}/${igAccountId}/media`, {
        media_type: 'CAROUSEL',
        children: childIds,
        caption: caption,
        access_token: token,
      });

      const pubRes = await axios.post(`${GRAPH_API}/${igAccountId}/media_publish`, {
        creation_id: carouselRes.data.id,
        access_token: token,
      });
      results.instagram = { success: true, id: pubRes.data.id, count: carouselSlice.length };
      console.log(`✅ [SocialQueue] Instagram carousel published! ID: ${pubRes.data.id}`);
    }
  }

  // Facebook Page
  if (pageId && item.channels.includes('facebook_page') && fullImages.length > 0) {
    if (fullImages.length === 1) {
      console.log(`[SocialQueue] 📘 Publishing Facebook Single Photo for: "${item.title}"`);
      const fbRes = await axios.post(`${GRAPH_API}/${pageId}/photos`, {
        url: fullImages[0],
        message: caption,
        access_token: token,
      });
      results.facebook = { success: true, id: fbRes.data.id || fbRes.data.post_id };
      console.log(`✅ [SocialQueue] Facebook single photo published!`);
    } else {
      console.log(`[SocialQueue] 📘 Publishing Facebook Multi-Photo (${fullImages.length} images) for: "${item.title}"`);
      const photoIds: { media_fbid: string }[] = [];
      for (const imgUrl of fullImages.slice(0, 10)) {
        const photoRes = await axios.post(`${GRAPH_API}/${pageId}/photos`, {
          url: imgUrl,
          published: false,
          access_token: token,
        });
        photoIds.push({ media_fbid: photoRes.data.id });
      }

      const feedRes = await axios.post(`${GRAPH_API}/${pageId}/feed`, {
        message: caption,
        attached_media: photoIds,
        access_token: token,
      });
      results.facebook = { success: true, id: feedRes.data.id, count: photoIds.length };
      console.log(`✅ [SocialQueue] Facebook multi-photo published!`);
    }
  }

  return results;
}

/**
 * Process the next due queue item
 */
export async function processSocialQueue(): Promise<{ processed: boolean; item?: any; error?: string }> {
  try {
    await dbConnect();
    const settings = (await Settings.findOne()) || {};
    const now = new Date();

    // Find the oldest PENDING item that is scheduled at or before now
    const item = await SocialQueue.findOne({
      status: 'PENDING',
      scheduledAt: { $lte: now },
    }).sort({ scheduledAt: 1 });

    if (!item) {
      // Nothing due right now -> check if there are future items and schedule timer
      scheduleNextQueueRun();
      return { processed: false };
    }

    // Mark as PROCESSING
    item.status = 'PROCESSING';
    item.attempts = (item.attempts || 0) + 1;
    await item.save();

    console.log(`[SocialQueue] ⏳ Processing queue item: "${item.title}" (ID: ${item._id})`);

    try {
      const results = await publishQueueItem(item, settings);
      item.status = 'PUBLISHED';
      item.publishedAt = new Date();
      item.results = results;
      item.error = '';
      await item.save();

      console.log(`🎉 [SocialQueue] SUCCESS: "${item.title}" published! Next item will be in 30 minutes.`);

      // Schedule next item
      scheduleNextQueueRun();

      return { processed: true, item };
    } catch (publishErr: any) {
      console.error(`❌ [SocialQueue] FAILED for "${item.title}":`, publishErr.response?.data || publishErr.message);
      item.status = item.attempts >= 3 ? 'FAILED' : 'PENDING'; // retry up to 3 times
      item.error = publishErr.response?.data?.error?.message || publishErr.message;
      await item.save();

      // Still schedule next run
      scheduleNextQueueRun();

      return { processed: false, item, error: item.error };
    }
  } catch (err: any) {
    console.error('[SocialQueue] Global processor error:', err.message);
    return { processed: false, error: err.message };
  }
}

/**
 * Schedule in-memory timer for the next pending queue item
 */
export async function scheduleNextQueueRun() {
  try {
    await dbConnect();
    const nextItem = await SocialQueue.findOne({
      status: 'PENDING',
    }).sort({ scheduledAt: 1 });

    if (!nextItem) {
      if (queueTimer) {
        clearTimeout(queueTimer);
        queueTimer = null;
      }
      return;
    }

    const delayMs = Math.max(1000, new Date(nextItem.scheduledAt).getTime() - Date.now());

    // Clear existing timer if any
    if (queueTimer) {
      clearTimeout(queueTimer);
    }

    // Don't set setTimeout longer than 24 hours (node timer limit safety)
    const safeDelay = Math.min(delayMs, 24 * 60 * 60 * 1000);

    console.log(`[SocialQueue] ⏰ Next queue check scheduled in ${Math.round(safeDelay / 60000)} minutes (${new Date(nextItem.scheduledAt).toLocaleTimeString()})`);

    queueTimer = setTimeout(() => {
      processSocialQueue();
    }, safeDelay);
  } catch (err: any) {
    console.warn('[SocialQueue] scheduleNextQueueRun warn:', err.message);
  }
}


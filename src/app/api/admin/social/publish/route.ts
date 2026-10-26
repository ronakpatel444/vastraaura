import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Settings from '@/models/Settings';
import axios from 'axios';

const GRAPH_API = 'https://graph.facebook.com/v19.0';

function formatImageUrl(url: string, baseUrl: string): string {
  if (!url) return '';
  let fullUrl = url;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    const cleanBase = baseUrl.replace(/\/$/, '');
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    fullUrl = `${cleanBase}${cleanPath}`;
  }
  try {
    return encodeURI(decodeURI(fullUrl));
  } catch {
    return encodeURI(fullUrl);
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const settings = await Settings.findOne() || {};

    const token = settings.metaAccessToken || process.env.META_ACCESS_TOKEN || '';
    const pageId = settings.metaPageId || process.env.META_PAGE_ID || '';
    const igAccountId = settings.metaIgAccountId || process.env.META_IG_ACCOUNT_ID || '';
    const pinterestToken = settings.pinterestAccessToken || process.env.PINTEREST_ACCESS_TOKEN || '';
    const defaultBoardId = settings.pinterestBoardId || process.env.PINTEREST_BOARD_ID || '';
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vastraaura.com';

    const {
      channels = [], // ['instagram_feed', 'instagram_story', 'facebook_page', 'pinterest_pin']
      caption = '',
      images = [], // array of image URLs
      storyImageCount = 1,
      productTitle = '',
      productLink = '',
      boardId = '',
    } = await req.json();

    if (!channels.length) {
      return NextResponse.json({ error: 'Please select at least one channel to publish.' }, { status: 400 });
    }

    if (!images.length) {
      return NextResponse.json({ error: 'No image selected to post.' }, { status: 400 });
    }

    const hasMetaChannels = channels.some((c: string) => ['instagram_feed', 'instagram_story', 'facebook_page'].includes(c));
    if (hasMetaChannels && !token) {
      return NextResponse.json({
        error: 'Meta Access Token is missing. Please enter your Meta credentials in Social Settings.',
      }, { status: 400 });
    }

    if (channels.includes('pinterest_pin') && !pinterestToken) {
      return NextResponse.json({
        error: 'Pinterest Access Token is missing. Please enter your Pinterest credentials in Social Settings.',
      }, { status: 400 });
    }

    const results: any = {
      instagramFeed: null,
      instagramStory: null,
      facebookPage: null,
      pinterestPin: null,
    };

    const formattedImages = images.map((img: string) => formatImageUrl(img, baseUrl));

    // 1. Instagram Feed
    if (channels.includes('instagram_feed')) {
      if (!igAccountId) {
        throw new Error('Instagram Account ID is not configured.');
      }

      if (formattedImages.length === 1) {
        // Single Image Post
        const containerRes = await axios.post(`${GRAPH_API}/${igAccountId}/media`, {
          image_url: formattedImages[0],
          caption: caption,
          access_token: token,
        });

        const creationId = containerRes.data.id;

        const publishRes = await axios.post(`${GRAPH_API}/${igAccountId}/media_publish`, {
          creation_id: creationId,
          access_token: token,
        });

        results.instagramFeed = {
          success: true,
          postId: publishRes.data.id,
        };
      } else {
        // Multi-image Carousel Post (up to 10 images)
        const carouselSlice = formattedImages.slice(0, 10);
        const childContainerIds: string[] = [];

        for (const imgUrl of carouselSlice) {
          const itemRes = await axios.post(`${GRAPH_API}/${igAccountId}/media`, {
            image_url: imgUrl,
            is_carousel_item: true,
            access_token: token,
          });
          childContainerIds.push(itemRes.data.id);
        }

        const carouselContainerRes = await axios.post(`${GRAPH_API}/${igAccountId}/media`, {
          media_type: 'CAROUSEL',
          children: childContainerIds,
          caption: caption,
          access_token: token,
        });

        const publishRes = await axios.post(`${GRAPH_API}/${igAccountId}/media_publish`, {
          creation_id: carouselContainerRes.data.id,
          access_token: token,
        });

        results.instagramFeed = {
          success: true,
          postId: publishRes.data.id,
          itemCount: carouselSlice.length,
        };
      }
    }

    // 2. Instagram Story
    if (channels.includes('instagram_story')) {
      if (!igAccountId) {
        throw new Error('Instagram Account ID is not configured for Stories.');
      }

      const count = Math.max(1, Math.min(storyImageCount || 1, formattedImages.length));
      const storyImages = formattedImages.slice(0, count);
      const storyIds: string[] = [];

      for (const storyImg of storyImages) {
        const storyContainerRes = await axios.post(`${GRAPH_API}/${igAccountId}/media`, {
          image_url: storyImg,
          media_type: 'STORY',
          access_token: token,
        });

        const storyPublishRes = await axios.post(`${GRAPH_API}/${igAccountId}/media_publish`, {
          creation_id: storyContainerRes.data.id,
          access_token: token,
        });

        storyIds.push(storyPublishRes.data.id);
      }

      results.instagramStory = {
        success: true,
        storyIds,
        count: storyIds.length,
      };
    }

    // 3. Facebook Page
    if (channels.includes('facebook_page')) {
      if (!pageId) {
        throw new Error('Facebook Page ID is not configured.');
      }

      const fbRes = await axios.post(`${GRAPH_API}/${pageId}/photos`, {
        url: formattedImages[0],
        message: caption,
        access_token: token,
      });

      results.facebookPage = {
        success: true,
        postId: fbRes.data.id || fbRes.data.post_id,
      };
    }

    // 4. Pinterest Pin
    if (channels.includes('pinterest_pin')) {
      const targetBoardId = (boardId || defaultBoardId || '').trim();
      if (!targetBoardId) {
        throw new Error('Pinterest Board ID is required to create a Pin. Please select or configure a Board ID in Social Settings.');
      }

      const pinTitle = (productTitle || caption.split('\n')[0] || 'Vastra Aura Collection').slice(0, 99);
      const pinDesc = caption.slice(0, 790);
      const pinLink = productLink ? formatImageUrl(productLink, baseUrl) : baseUrl;

      const pinRes = await axios.post(
        'https://api.pinterest.com/v5/pins',
        {
          board_id: targetBoardId,
          title: pinTitle,
          description: pinDesc,
          link: pinLink,
          alt_text: pinTitle,
          media_source: {
            source_type: 'image_url',
            url: formattedImages[0],
          },
        },
        {
          headers: {
            Authorization: `Bearer ${pinterestToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      results.pinterestPin = {
        success: true,
        pinId: pinRes.data?.id,
        url: pinRes.data?.id ? `https://www.pinterest.com/pin/${pinRes.data.id}/` : null,
      };
    }

    return NextResponse.json({
      success: true,
      message: 'Published successfully to selected channels!',
      results,
    });
  } catch (error: any) {
    console.error('Social Publish Error:', error.response?.data || error);
    const apiError = error.response?.data?.message || error.response?.data?.error?.message || error.message || 'Failed to publish to selected platforms';
    return NextResponse.json({ error: apiError }, { status: 500 });
  }
}

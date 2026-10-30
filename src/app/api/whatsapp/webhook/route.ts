import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import Settings from '@/models/Settings';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { addToSocialQueue } from '@/lib/socialQueue';

// In-memory buffer to group multiple images sent with a caption in WhatsApp bursts
interface CatalogBuffer {
  [chatId: string]: {
    images: string[];
    videoUrl?: string;
    folderKey: string;
    caption: string;
    timer: NodeJS.Timeout | null;
  };
}

const catalogBuffer: CatalogBuffer = {};

// Helper: Detect category from text
function detectCategory(text: string = ''): string {
  const lower = text.toLowerCase();
  if (lower.includes('3 piece') || lower.includes('3 pis') || lower.includes('3pis') || lower.includes('3pc') || (lower.includes('suit') && lower.includes('pant'))) {
    return '3 Piece Suit';
  }
  if (lower.includes('short kurti') || lower.includes('short top') || lower.includes('short kurtis') || lower.includes('tunic')) {
    return 'Short Kurtis';
  }
  if (lower.includes('chaniya') || lower.includes('choli') || lower.includes('navratri') || lower.includes('kediya')) {
    return 'Chaniya Choli';
  }
  if (lower.includes('lehenga') || lower.includes('ghagra')) {
    return 'Lehenga';
  }
  if (lower.includes('saree') || lower.includes('sari') || lower.includes('patola')) {
    return 'Saree';
  }
  if (lower.includes('kurta set') || lower.includes('kurti set') || lower.includes('kurta') || lower.includes('frock') || lower.includes('gown') || lower.includes('dress') || lower.includes('anarkali') || lower.includes('coord') || lower.includes('co-ord')) {
    return 'Kurta Sets';
  }
  return '3 Piece Suit';
}

// Helper: Extract fabric
function extractFabric(text: string = ''): string {
  const fabrics = ['Cotton', 'Rayon', 'Georgette', 'Roman Silk', 'Silk', 'Chiffon', 'Organza', 'Chanderi', 'Crepe', 'Muslin', 'Satin', 'Bandhani'];
  for (const f of fabrics) {
    if (new RegExp(`\\b${f}\\b`, 'i').test(text)) {
      return f;
    }
  }
  return 'Premium Fabric';
}

// Helper: Clean raw WhatsApp text for public product description (remove wholesale rates, prices, fixed price notes, booking CTAs, design codes with rates & phone numbers)
export function cleanWhatsAppDescription(rawText: string = ''): string {
  if (!rawText) return '';

  const lines = rawText.split(/\r?\n/);
  const cleanedLines: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (cleanedLines.length > 0 && cleanedLines[cleanedLines.length - 1] !== '') {
        cleanedLines.push('');
      }
      continue;
    }

    // Punctuation / placeholder / divider only lines (e.g. '.', '---', '===', '•')
    if (/^[.\-—_•*~–=+\s]+$/.test(trimmed)) {
      continue;
    }

    // Normalize Unicode fancy fonts (e.g., 𝐑𝐀𝐓𝐄 -> RATE, 𝐏𝐑𝐈𝐂𝐄 -> PRICE)
    const normalized = trimmed.normalize('NFKD');

    // 1. Remove wholesale prices, rates, MRP, and design-code price lines (e.g. '251005 – 1950/-', 'PRICE :- 999/-INR')
    const isPriceLine =
      /(?:price|rate|mrp|cost|wholesale\s*rate|reseller|fixed\s*price|fixed\s*rate|no\s*less|no\s*bargain)\b/i.test(normalized) ||
      /^[💰💵🏷️⚠️🚨➕💲\s*~`'"-]*\s*(?:price|rate|mrp|inr|rs\.?|₹)\s*[:=-]?\s*[\d,]+/i.test(normalized) ||
      /(?:₹|rs\.?|inr)\s*[\d,]+\s*(?:\/-|\+|-|\bonly\b|\+?\s*ship)/i.test(normalized) ||
      /[\d,]+\s*(?:\/-\s*inr|\/-|\+ship)/i.test(normalized) ||
      /^(?:price|rate)\s*[:=-]/i.test(normalized) ||
      /^\s*[*_~`]?\s*(?:[a-zA-Z0-9_\s#.-]+[-–—:])?​\s*₹?\s*\d{3,5}\s*(?:\/-|\+|-|\bonly\b)/i.test(normalized);

    if (isPriceLine) {
      continue;
    }

    // 2. Remove supplier CTAs, DMs, photo references, shipping extra notes, phone numbers, and booking links
    const isCtaOrContactLine =
      /(?:dm\s*(?:now|to|for|us)|book\s*(?:now|fast|your|here)|inbox\s*(?:us|now)|order\s*(?:now|fast|here|on)|ping\s*(?:us|now|for))\b/i.test(normalized) ||
      /(?:whatsapp|call|contact)\s*(?:us|me|on|at|no\.?|number|\:)?\s*[\d+]/i.test(normalized) ||
      /\b(?:https?:\/\/|wa\.me\/|bit\.ly\/)\S+/i.test(normalized) ||
      /\b[6-9]\d{9}\b/.test(normalized) ||
      /(?:single\s*pc\s*available|set\s*to\s*set|no\s*cod|ready\s*to\s*ship|dispatch\s*within)\b/i.test(normalized) ||
      /(?:shipping|ship)\s*:\s*(?:extra|charge)/i.test(normalized) ||
      /\bshipping\s*extra\b/i.test(normalized) ||
      /mentioned\s*on\s*photo/i.test(normalized);

    if (isCtaOrContactLine) {
      continue;
    }

    // Remove standalone decorative emojis from lines that previously had price/warnings
    const cleanedLine = trimmed.replace(/^[💰⚠️🚨🚚📸➕💲\s`*-]+$/, '').trim();
    if (cleanedLine) {
      cleanedLines.push(cleanedLine);
    }
  }

  while (cleanedLines.length > 0 && cleanedLines[0] === '') cleanedLines.shift();
  while (cleanedLines.length > 0 && cleanedLines[cleanedLines.length - 1] === '') cleanedLines.pop();

  return cleanedLines.join('\n');
}

// Helper: Extract price and compute profit markup (User rule: ₹800-₹1000+ profit, e.g. ₹800 wholesale -> ₹1999 listing)
function extractPrice(text: string = '') {
  const rateMatch = text.match(/(?:rate|price|rs\.?|inr|₹)\s*[:=-]?\s*(\d{3,5})/i) ||
                    text.match(/(\d{3,5})\s*(?:\/-|\+)/i) ||
                    text.match(/\b(\d{3,4})\b/);

  let basePrice = 800;
  if (rateMatch && rateMatch[1]) {
    basePrice = parseInt(rateMatch[1], 10);
  }

  // Profit Margin Formula: ₹800 to ₹1200 profit, rounded to psychological .99 pricing
  // Exactly as requested: ₹800 wholesale -> ₹1999 listing!
  let retailPrice = 1999;
  if (basePrice <= 500) {
    retailPrice = 1499; // +₹1000 profit
  } else if (basePrice <= 950) {
    retailPrice = 1999; // +₹1050 to ₹1200 profit (e.g. 800 -> 1999!)
  } else if (basePrice <= 1400) {
    retailPrice = 2499; // +₹1100 to ₹1200 profit
  } else if (basePrice <= 1900) {
    retailPrice = 2999; // +₹1100 to ₹1200 profit
  } else {
    // High-ticket lehengas: Wholesale + ₹1200 profit rounded to 99
    retailPrice = Math.ceil((basePrice + 1199) / 100) * 100 - 1;
  }

  const originalPrice = retailPrice + 1000; // Anchor MRP (e.g. 1999 -> MRP 2999)

  return {
    price: retailPrice.toString(),
    originalPrice: originalPrice.toString(),
    supplierRate: basePrice.toString(),
  };
}

// Helper: Extract available sizes from WhatsApp text & assign 5 stock each
function extractSizes(text: string = '', category: string = '') {
  if (category === 'Saree') {
    return [{ name: 'Free Size (5.5m + Blouse)', stock: 5 }];
  }

  const lower = text.toLowerCase();
  const detectedSizes: string[] = [];

  // Check for common size range patterns like "M to XXL", "M-XXL", "M, L, XL, XXL"
  if (/m\s*(?:to|-)\s*xxl/i.test(text) || /m\s*,\s*l\s*,\s*xl\s*,\s*xxl/i.test(text)) {
    detectedSizes.push('M', 'L', 'XL', 'XXL');
  } else if (/m\s*(?:to|-)\s*3xl/i.test(text)) {
    detectedSizes.push('M', 'L', 'XL', 'XXL', '3XL');
  } else if (/s\s*(?:to|-)\s*xxl/i.test(text)) {
    detectedSizes.push('S', 'M', 'L', 'XL', 'XXL');
  } else {
    // Check individual sizes
    const sizeCandidates = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL'];
    for (const sz of sizeCandidates) {
      const regex = new RegExp(`(?:size|sizes|\\b)[^a-z0-9]*\\b${sz}\\b`, 'i');
      if (regex.test(text) && !detectedSizes.includes(sz)) {
        detectedSizes.push(sz);
      }
    }

    // Check numeric chest sizing: 36, 38, 40, 42, 44, 46
    if (/\b36\b/.test(text) && !detectedSizes.includes('S')) detectedSizes.push('S (36)');
    if (/\b38\b/.test(text) && !detectedSizes.includes('M')) detectedSizes.push('M (38)');
    if (/\b40\b/.test(text) && !detectedSizes.includes('L')) detectedSizes.push('L (40)');
    if (/\b42\b/.test(text) && !detectedSizes.includes('XL')) detectedSizes.push('XL (42)');
    if (/\b44\b/.test(text) && !detectedSizes.includes('XXL')) detectedSizes.push('XXL (44)');
    if (/\b46\b/.test(text) && !detectedSizes.includes('3XL')) detectedSizes.push('3XL (46)');
  }

  if (lower.includes('free size') || lower.includes('freesize') || lower.includes('semi stitch') || lower.includes('unstitched')) {
    if (detectedSizes.length === 0) {
      return [{ name: 'Free Size / Semi-Stitched', stock: 5 }];
    }
  }

  // If no specific sizes mentioned in text, default to standard M, L, XL, XXL
  const finalSizes = detectedSizes.length > 0 ? detectedSizes : ['M', 'L', 'XL', 'XXL'];

  // User rule: Every available size gets exactly 5 stock!
  return finalSizes.map(sz => ({
    name: sz,
    stock: 5,
  }));
}

// Helper: Generate Clean Title & SEO Description
function generateMetadata(category: string, fabric: string, rawText: string, price: string, originalPrice: string) {
  const firstLine = rawText.split('\n')[0].replace(/[-_]/g, ' ').replace(/[^\w\s]/gi, '').trim().substring(0, 45);
  const cleanDesign = firstLine.length > 5 ? firstLine : 'Royal Festive Collection';
  const name = `Exclusive Handcrafted ${fabric} ${category} (${cleanDesign}) | Vastra Aura`;

  const cleanedSpecs = cleanWhatsAppDescription(rawText);

  let description =
    `Experience Surat artisan luxury with this beautiful ${fabric} ${category}. ` +
    `Designed with intricate detailing, comfortable tailoring, and vibrant colors. ` +
    `Perfect for weddings, festivals, and parties. ` +
    `\n\n✓ All India Free Cash on Delivery (COD)` +
    `\n✓ Instant Dispatch & Worldwide Shipping`;

  if (cleanedSpecs) {
    description += `\n\n✨ Product Details & Specifications:\n${cleanedSpecs}`;
  }

  return { name, description };
}

// Helper: Download image to local public disk so links never expire
async function downloadAndSaveImage(downloadUrl: string, folderKey: string, index: number): Promise<string> {
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'incoming-catalogs', folderKey);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `item_${index}.jpg`;
    const filePath = path.join(uploadDir, fileName);

    const response = await axios.get(downloadUrl, {
      responseType: 'arraybuffer',
      timeout: 20000,
    });

    fs.writeFileSync(filePath, Buffer.from(response.data));
    return `/incoming-catalogs/${folderKey}/${fileName}`;
  } catch (err: any) {
    console.warn(`[Image Download Warn] Using remote URL directly: ${err.message}`);
    return downloadUrl;
  }
}

// Helper: Download video to local public disk
async function downloadAndSaveVideo(downloadUrl: string, folderKey: string): Promise<string> {
  try {
    const uploadDir = path.join(process.cwd(), 'public', 'incoming-catalogs', folderKey);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `reel.mp4`;
    const filePath = path.join(uploadDir, fileName);

    const response = await axios.get(downloadUrl, {
      responseType: 'arraybuffer',
      timeout: 60000,
    });

    fs.writeFileSync(filePath, Buffer.from(response.data));
    return `/incoming-catalogs/${folderKey}/${fileName}`;
  } catch (err: any) {
    console.warn(`[Video Download Warn] Using remote URL directly: ${err.message}`);
    return downloadUrl;
  }
}

// ============================================================
// ============================================================
// VIRAL CAPTION GENERATOR — Hook formulas for Instagram/Facebook
// ============================================================
function generateViralCaption(product: any, baseUrl: string): string {
  const name = (product.name || '').split('|')[0].trim();
  const category = product.category || 'Ethnic Wear';
  const fabric = product.fabric || 'Premium Fabric';
  const price = product.price ? `₹${product.price}` : '';
  const productUrl = `${baseUrl}/products/${product._id}`;
  const handle = '@vastraaura21';

  // Rotate viral hooks based on product id (so each product gets different hook)
  const idNum = parseInt((product._id || '0').toString().slice(-2), 16) || 0;

  const hooks = [
    // 1. Metro Boutique Expose
    `POV: You found the direct Surat studio where Mumbai & Delhi boutiques buy their ${category} for ${price}... 🤯\n\nThey sell it to you for ₹12,000+. We sell direct! 👇`,
    // 2. Price Shock
    `Boutique in Mumbai: ₹15,999 ❌\nVastra Aura Direct from Surat: ${price} ✅\n\nSame quality. Zero middleman. 🤫`,
    // 3. Flare/Reveal Hook
    `Wait till the full flare opens... 😱 Handcrafted with real ${fabric} — delivered FREE across India! 🇮🇳`,
    // 4. Relatable
    `My brain: "You already have enough outfits!"\nMe seeing this ${category} at ${price}: "Add to cart!" 😭✨`,
    // 5. NRI Hook
    `How NRI brides in USA & UK are getting designer ${category} delivered in 5 days under $60! ✈️`,
    // 6. Urgency Drop
    `Only 5 pieces left in this batch! Once sold, restock takes 3 weeks ⏳\n\n${name}`,
    // 7. Navratri/Festival
    `Wear this to your next Garba or Sangeet and everyone will ask: "WHERE DID YOU GET THIS?!" 💃✨`,
    // 8. Artisan BTS
    `48 hours of pure hand-craftsmanship in Surat → this breathtaking ${category} 🪡✨\n\nDirect to your door. Free COD!`,
  ];

  const hook = hooks[idNum % hooks.length];

  // Dynamic hashtags
  const catTag = `#${category.replace(/\s+/g, '')}`;
  const fabricTag = fabric !== 'Premium Fabric' ? `#${fabric.replace(/\s+/g, '')}` : '#PremiumFabric';
  const hashtags = [
    '#VastraAura', '#vastraaura21', catTag, fabricTag,
    '#EthnicWear', '#IndianFashion', '#SuratFashion',
    '#DirectFromSurat', '#FreeCOD', '#CashOnDelivery',
    '#FestiveWear', '#WeddingOutfit', '#ReelItFeelIt',
    '#FYPIndia', '#ExplorePage', '#TrendingReels',
    '#MumbaiFashion', '#DelhiBoutiques', '#NRIWedding',
    '#DesignerWear', '#HandcraftedIndia', '#AllIndiaDelivery',
  ].join(' ');

  return (
    `${hook}\n\n` +
    `✨ ${name}\n` +
    `🧵 Fabric: ${fabric} • Direct Surat Artisan\n` +
    `🏷️ ${price} (No boutique markup!)\n` +
    `📦 Free Cash on Delivery — All India\n` +
    `✈️ Express Shipping: USA, UK, Canada, Dubai\n\n` +
    `🛒 Order Now 👇\n${productUrl}\n\n` +
    `💬 Comment "PRICE" for direct link in DM!\n` +
    `Follow ${handle} for daily drops ✨\n\n` +
    `${hashtags}`
  );
}

// ENQUEUE TO 30-MINUTE SOCIAL MEDIA QUEUE (called after product is saved)
// ============================================================
async function autoPublishToSocial(
  product: any,
  images: string[],
  videoLocalUrl?: string,
  settings?: any
) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://vastraaura.com';
    const channels: string[] = settings?.whatsappAutoSocialChannels || ['instagram_feed', 'facebook_page', 'pinterest_pin'];

    // 🔥 VIRAL caption — hook formula based
    const socialCaption = generateViralCaption(product, baseUrl);
    const mediaType: 'IMAGE' | 'CAROUSEL' | 'REEL' = videoLocalUrl
      ? 'REEL'
      : (images && images.length > 1)
      ? 'CAROUSEL'
      : 'IMAGE';

    console.log(`[WhatsApp Webhook] 📥 Adding "${product.name}" to 30-Minute Social Queue (${mediaType})...`);

    const queueItem = await addToSocialQueue({
      productId: product._id,
      title: product.name,
      caption: socialCaption,
      mediaType,
      images,
      videoUrl: videoLocalUrl,
      channels,
      gapMinutes: 30, // 30-minute spacing between posts!
    });

    return queueItem;
  } catch (err: any) {
    console.error('[WhatsApp Webhook] Error adding to social queue:', err.message);
  }
}

// ============================================================
// HARDCODED ALLOWED GROUPS — Fakt aa groups mathi j product leva
// (partial match — group name ma aa words hoy to process karase)
// ============================================================
const HARDCODED_ALLOWED_GROUPS = [
  'mudra ethnic',           // Mudra Ethnic - Premium Saree's
  'fashion hub',            // Fashion Hub™ Brand Update & FASHION HUB ™ DRESSES AND KURTI
  'kurti, gown, lahenga',   // Kurti, Gown, Lahenga - Mudra Ethnic - Reseller's Update
  'reseller',               // Any reseller update group
  'saree',                  // Mudra Ethnic - Under 1000 Saree's Update
  'under 1000',             // Under 1000 Saree's Update
  'dresses and kurti',      // FASHION HUB ™ DRESSES AND KURTI
];

// ============================================================
// CHECK: Is this chatId/chatName from an ALLOWED group?
// ============================================================
function isAllowedGroup(chatId: string, chatName: string, dbGroups: string[]): boolean {
  const chatNameLower = (chatName || '').toLowerCase().trim();
  const chatIdLower = (chatId || '').toLowerCase().trim();

  // 1. Check HARDCODED groups (always active)
  const hardcodedMatch = HARDCODED_ALLOWED_GROUPS.some((g) =>
    chatNameLower.includes(g.toLowerCase()) || chatIdLower.includes(g.toLowerCase())
  );
  if (hardcodedMatch) return true;

  // 2. Check Admin panel configured groups (if any added)
  if (dbGroups && dbGroups.length > 0) {
    const dbMatch = dbGroups.some((g) => {
      const gl = g.toLowerCase().trim();
      return chatNameLower.includes(gl) || chatIdLower.includes(gl);
    });
    if (dbMatch) return true;
  }

  // 3. If no hardcoded match and no DB groups configured → BLOCK
  return false;
}

// Helper: Create product in Database + auto-post to social
async function saveCatalogProduct(
  images: string[],
  caption: string,
  messageId: string,
  chatName: string,
  videoLocalUrl?: string,
  settings?: any
) {
  await connectToDatabase();

  const category = detectCategory(caption);
  const fabric = extractFabric(caption);
  const { price, originalPrice } = extractPrice(caption);
  const { name, description } = generateMetadata(category, fabric, caption, price, originalPrice);
  const sizes = extractSizes(caption, category);

  // Avoid duplicate listings of the same WhatsApp message
  const existing = await Product.findOne({
    $or: [
      { name },
      { originalSellerLink: messageId }
    ]
  });

  if (existing) {
    console.log(`[WhatsApp Webhook] Skipped duplicate product: "${name}"`);
    return existing;
  }

  const newProduct = new Product({
    name,
    price,
    originalPrice,
    allowCOD: true,
    category,
    status: 'Active',
    image: images[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80',
    images: images.length > 0 ? images : [images[0]],
    fabric,
    description,
    originalSellerLink: chatName ? `WhatsApp Group: ${chatName}` : (messageId || `wp-wh-${Date.now()}`),
    sizes: sizes,
    isPlatformShipping: true,
  });

  await newProduct.save();
  console.log(`🎉 [WHATSAPP WEBHOOK] Auto-created Product: ${name} (₹${price}) from "${chatName}" with sizes: ${sizes.map(s => `${s.name}(${s.stock})`).join(', ')}`);

  // 🚀 AUTO SOCIAL MEDIA PUBLISH (non-blocking)
  const autoSocial = settings?.whatsappAutoSocial ?? false;
  if (autoSocial) {
    console.log('[AutoSocial] Triggering auto social publish...');
    autoPublishToSocial(newProduct, images, videoLocalUrl, settings).catch((err) => {
      console.error('[AutoSocial] Background publish error:', err.message);
    });
  }

  return newProduct;
}

// -------------------------------------------------------------
// GET: Webhook Health Check (GreenAPI/Whapi URL Verification)
// -------------------------------------------------------------
export async function GET() {
  return NextResponse.json({
    status: 'active',
    service: 'Vastra Aura WhatsApp Catalog Webhook API',
    timestamp: new Date().toISOString(),
    supportedProviders: ['GreenAPI', 'Whapi', 'Custom JSON'],
    instructions: 'Send POST requests with incomingMessageReceived or direct payload to this endpoint.',
  });
}

// -------------------------------------------------------------
// POST: Webhook Listener for Incoming WhatsApp Messages
// -------------------------------------------------------------
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Load settings for group filter + auto-social config
    await connectToDatabase();
    const settings = await Settings.findOne() || {};
    const allowedGroups: string[] = settings?.whatsappAllowedGroups || [];

    // 1. Direct Manual / Custom JSON payload test
    if (body.caption && (body.imageUrl || (body.images && body.images.length > 0))) {
      const images = body.images || [body.imageUrl];
      const product = await saveCatalogProduct(
        images,
        body.caption,
        body.messageId || `manual-${Date.now()}`,
        body.chatName || 'Manual Test',
        body.videoUrl,
        settings
      );
      return NextResponse.json({
        success: true,
        message: 'Product catalog created successfully!',
        product: { id: product._id, name: product.name, price: product.price },
      });
    }

    // 2. GreenAPI Payload Format: "incomingMessageReceived" or "outgoingMessageReceived"
    if (
      body.typeWebhook === 'incomingMessageReceived' ||
      body.typeWebhook === 'outgoingMessageReceived' ||
      body.typeWebhook === 'outgoingAPIMessageReceived'
    ) {
      const messageData = body.messageData;
      const senderData = body.senderData || {};
      const chatId = senderData.chatId || 'default-chat';
      const chatName = senderData.chatName || senderData.senderName || 'WhatsApp Group';
      const messageId = body.idMessage || `msg-${Date.now()}`;

      // 🚫 PERSONAL MESSAGE BLOCK — fakt @g.us (group) j allow, @c.us (personal DM) reject
      const isGroupChat = chatId.endsWith('@g.us') || chatId.includes('@g.us');
      if (!isGroupChat) {
        console.log(`[WhatsApp Webhook] 🚫 Personal DM ignored: "${chatName}" (${chatId})`);
        return NextResponse.json({ success: true, ignored: true, reason: 'Personal DM — only group messages allowed' });
      }

      // 🔒 GROUP FILTER: Only process messages from allowed groups
      if (!isAllowedGroup(chatId, chatName, allowedGroups)) {
        console.log(`[WhatsApp Webhook] ⛔ BLOCKED: "${chatName}" (${chatId}) — not in allowed list`);
        return NextResponse.json({ success: true, ignored: true, reason: 'Group not in whitelist' });
      }
      console.log(`[WhatsApp Webhook] ✅ ALLOWED: "${chatName}" — processing message...`);

      // ── VIDEO MESSAGE → Reel ──────────────────────────────────────────────
      if (messageData?.typeMessage === 'videoMessage' && messageData?.fileMessageData) {
        const fileData = messageData.fileMessageData;
        const downloadUrl = fileData.downloadUrl;
        const caption = (fileData.caption || '').trim();
        const folderKey = `cat-${Date.now().toString().slice(-6)}`;

        const videoLocalUrl = downloadUrl ? await downloadAndSaveVideo(downloadUrl, folderKey) : '';

        if (caption.length > 3) {
          // Video + caption → create product + publish as reel
          const product = await saveCatalogProduct(
            [], // no static images for video products
            caption,
            messageId,
            chatName,
            videoLocalUrl || downloadUrl,
            settings
          );
          return NextResponse.json({
            success: true,
            created: true,
            type: 'video_reel',
            productId: product._id,
            name: product.name,
          });
        }

        // Buffer the video, wait for caption text
        if (!catalogBuffer[chatId]) {
          catalogBuffer[chatId] = { images: [], folderKey, caption: '', timer: null };
        }
        catalogBuffer[chatId].videoUrl = videoLocalUrl || downloadUrl;

        return NextResponse.json({ success: true, buffered: true, type: 'video_buffered' });
      }

      // Case A: Image Message with Caption or Album
      if (messageData?.typeMessage === 'imageMessage' && messageData?.fileMessageData) {
        const fileData = messageData.fileMessageData;
        const downloadUrl = fileData.downloadUrl;
        const caption = (fileData.caption || '').trim();

        // Initialize buffer for this chat if not exists
        if (!catalogBuffer[chatId]) {
          const fk = `cat-${Date.now().toString().slice(-6)}`;
          catalogBuffer[chatId] = { images: [], folderKey: fk, caption: '', timer: null };
        }

        const buf = catalogBuffer[chatId];

        // Download & save image
        const localImgUrl = downloadUrl ? await downloadAndSaveImage(downloadUrl, buf.folderKey, buf.images.length + 1) : '';
        if (localImgUrl) buf.images.push(localImgUrl);

        // If caption came with this image, save it
        if (caption.length > 5) {
          buf.caption = caption;
        }

        // Clear existing timer (restart 4-second burst window)
        if (buf.timer) clearTimeout(buf.timer);

        // Set timer: 4 seconds silence = burst done → create product
        buf.timer = setTimeout(async () => {
          const finalBuf = catalogBuffer[chatId];
          if (!finalBuf) return;

          const finalCaption = finalBuf.caption || `${chatName} Product`;
          if (finalBuf.images.length > 0 && finalCaption.length > 3) {
            try {
              await saveCatalogProduct(
                finalBuf.images,
                finalCaption,
                messageId,
                chatName,
                undefined,
                settings
              );
              console.log(`✅ [Burst Done] Created product with ${finalBuf.images.length} images from "${chatName}"`);
            } catch (err: any) {
              console.error('[Burst Timer] Save error:', err.message);
            }
          }
          delete catalogBuffer[chatId];
        }, 4000);

        return NextResponse.json({
          success: true,
          buffered: true,
          imagesCount: buf.images.length,
          hasCaption: buf.caption.length > 0,
        });
      }

      // Case B: Text Message (often arrives as separate description for the photo/video)
      if (messageData?.typeMessage === 'textMessage' && messageData?.textMessageData?.textMessage) {
        const text = messageData.textMessageData.textMessage.trim();

        if (catalogBuffer[chatId]) {
          const buf = catalogBuffer[chatId];

          // Has buffered video → publish as reel
          if (buf.videoUrl) {
            const product = await saveCatalogProduct(
              buf.images,
              text,
              messageId,
              chatName,
              buf.videoUrl,
              settings
            );
            delete catalogBuffer[chatId];
            return NextResponse.json({
              success: true,
              created: true,
              type: 'video_reel',
              productId: product._id,
              name: product.name,
            });
          }

          // Has buffered images → publish as photo post
          if (buf.images.length > 0) {
            const product = await saveCatalogProduct(
              buf.images,
              text,
              messageId,
              chatName,
              undefined,
              settings
            );
            delete catalogBuffer[chatId];
            return NextResponse.json({
              success: true,
              created: true,
              productId: product._id,
              name: product.name,
            });
          }
        }
      }
    }

    // Default acknowledgement to provider (HTTP 200)
    return NextResponse.json({ success: true, received: true });
  } catch (err: any) {
    console.error('WhatsApp Webhook Error:', err);
    return NextResponse.json({ error: err.message || 'Webhook processing failed' }, { status: 500 });
  }
}

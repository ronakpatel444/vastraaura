import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

// In-memory buffer to group multiple images sent with a caption in WhatsApp bursts
interface CatalogBuffer {
  [chatId: string]: {
    images: string[];
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
  if (lower.includes('kurta set') || lower.includes('kurti set') || lower.includes('kurta')) {
    return 'Kurta Sets';
  }
  if (lower.includes('chaniya') || lower.includes('choli') || lower.includes('navratri') || lower.includes('kediya')) {
    return 'Chaniya Choli';
  }
  if (lower.includes('lehenga') || lower.includes('ghagra')) {
    return 'Lehenga';
  }
  if (lower.includes('saree') || lower.includes('sari') || lower.includes('patola') || lower.includes('silk')) {
    return 'Saree';
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

// Helper: Extract price and compute profit markup
function extractPrice(text: string = '') {
  const rateMatch = text.match(/(?:rate|price|rs\.?|inr|₹)\s*[:=-]?\s*(\d{3,5})/i) ||
                    text.match(/(\d{3,5})\s*(?:\/-|\+)/i) ||
                    text.match(/\b(\d{3,4})\b/);

  let basePrice = 1199;
  if (rateMatch && rateMatch[1]) {
    basePrice = parseInt(rateMatch[1], 10);
  }

  // Automatic Retail Margin: +₹450 on top of wholesale rate
  const retailPrice = basePrice <= 600 ? basePrice + 350 : basePrice + 450;
  const originalPrice = retailPrice + 900; // Anchor MRP

  return {
    price: retailPrice.toString(),
    originalPrice: originalPrice.toString(),
    supplierRate: basePrice.toString(),
  };
}

// Helper: Generate Clean Title & SEO Description
function generateMetadata(category: string, fabric: string, rawText: string, price: string, originalPrice: string) {
  const firstLine = rawText.split('\n')[0].replace(/[-_]/g, ' ').replace(/[^\w\s]/gi, '').trim().substring(0, 45);
  const cleanDesign = firstLine.length > 5 ? firstLine : 'Royal Festive Collection';
  const name = `Exclusive Handcrafted ${fabric} ${category} (${cleanDesign}) | Vastra Aura`;

  const description =
    `Experience Surat artisan luxury with this beautiful ${fabric} ${category}. ` +
    `Designed with intricate detailing, comfortable tailoring, and vibrant colors. ` +
    `Perfect for weddings, festivals, and parties. ` +
    `\n\n✓ All India Free Cash on Delivery (COD)` +
    `\n✓ Instant Dispatch & Worldwide Shipping` +
    `\n\n📌 Original Supplier Specifications:\n${rawText}`;

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

// Helper: Create product in Database
async function saveCatalogProduct(images: string[], caption: string, messageId: string, chatName: string) {
  await connectToDatabase();

  const category = detectCategory(caption);
  const fabric = extractFabric(caption);
  const { price, originalPrice } = extractPrice(caption);
  const { name, description } = generateMetadata(category, fabric, caption, price, originalPrice);

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
    originalSellerLink: messageId || `wp-wh-${Date.now()}`,
    sizes: [
      { name: 'S', stock: 5 },
      { name: 'M', stock: 5 },
      { name: 'L', stock: 5 },
      { name: 'XL', stock: 5 },
      { name: 'XXL', stock: 5 },
    ],
    isPlatformShipping: true,
  });

  await newProduct.save();
  console.log(`🎉 [WHATSAPP WEBHOOK] Auto-created Product: ${name} (₹${price}) from "${chatName}"`);
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

    // 1. Direct Manual / Custom JSON payload test
    if (body.caption && (body.imageUrl || (body.images && body.images.length > 0))) {
      const images = body.images || [body.imageUrl];
      const product = await saveCatalogProduct(
        images,
        body.caption,
        body.messageId || `manual-${Date.now()}`,
        body.chatName || 'Manual Test'
      );
      return NextResponse.json({
        success: true,
        message: 'Product catalog created successfully!',
        product: { id: product._id, name: product.name, price: product.price },
      });
    }

    // 2. GreenAPI Payload Format: "incomingMessageReceived"
    if (body.typeWebhook === 'incomingMessageReceived') {
      const messageData = body.messageData;
      const senderData = body.senderData || {};
      const chatId = senderData.chatId || 'default-chat';
      const chatName = senderData.chatName || senderData.senderName || 'WhatsApp Group';
      const messageId = body.idMessage || `msg-${Date.now()}`;

      // Case A: Image Message with Caption or Album
      if (messageData?.typeMessage === 'imageMessage' && messageData?.fileMessageData) {
        const fileData = messageData.fileMessageData;
        const downloadUrl = fileData.downloadUrl;
        const caption = (fileData.caption || '').trim();

        const folderKey = `cat-${Date.now().toString().slice(-6)}`;
        const localImgUrl = downloadUrl ? await downloadAndSaveImage(downloadUrl, folderKey, 1) : '';

        // If caption is present with image, save immediately
        if (caption.length > 10) {
          const product = await saveCatalogProduct(
            [localImgUrl || downloadUrl],
            caption,
            messageId,
            chatName
          );
          return NextResponse.json({
            success: true,
            created: true,
            productId: product._id,
            name: product.name,
          });
        }

        // Otherwise buffer image and wait for text description
        if (!catalogBuffer[chatId]) {
          catalogBuffer[chatId] = {
            images: [],
            folderKey,
            caption: '',
            timer: null,
          };
        }
        catalogBuffer[chatId].images.push(localImgUrl || downloadUrl);

        return NextResponse.json({
          success: true,
          buffered: true,
          imagesCount: catalogBuffer[chatId].images.length,
        });
      }

      // Case B: Text Message (often arrives as separate description for the photo)
      if (messageData?.typeMessage === 'textMessage' && messageData?.textMessageData?.textMessage) {
        const text = messageData.textMessageData.textMessage.trim();

        if (catalogBuffer[chatId] && catalogBuffer[chatId].images.length > 0) {
          const buf = catalogBuffer[chatId];
          const product = await saveCatalogProduct(
            buf.images,
            text,
            messageId,
            chatName
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

    // Default acknowledgement to provider (HTTP 200)
    return NextResponse.json({ success: true, received: true });
  } catch (err: any) {
    console.error('WhatsApp Webhook Error:', err);
    return NextResponse.json({ error: err.message || 'Webhook processing failed' }, { status: 500 });
  }
}

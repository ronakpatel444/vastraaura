const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// 1. Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Database!'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// 2. Define Product Schema
const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: String, required: true },
  originalPrice: { type: String },
  allowCOD: { type: Boolean, default: true },
  category: { type: String, required: true },
  status: { type: String, required: true, default: 'Active' },
  image: { type: String, required: true },
  images: { type: [String], default: [] },
  fabric: { type: String },
  description: { type: String },
  originalSellerLink: { type: String },
  colors: { type: [String], default: [] },
  sizes: { type: [{ name: String, stock: Number }], default: [] },
  isPlatformShipping: { type: Boolean, default: true },
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

// 3. Category Inference from text
function detectCategory(text = '') {
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
  if (lower.includes('saree') || lower.includes('sari') || lower.includes('patola')) {
    return 'Saree';
  }
  return '3 Piece Suit';
}

// 4. Generate SEO Metadata
function generateSEOMetadata(category, rawTitle, fabric, price) {
  const cleanDesign = rawTitle.replace(/[-_]/g, ' ').substring(0, 50).trim();
  let seoTitle = '';
  let seoDesc = '';

  const numPrice = parseInt(price.replace(/[^\d]/g, ''), 10) || 1499;
  const originalPrice = (numPrice + 1200).toString();

  switch (category) {
    case '3 Piece Suit':
      seoTitle = `Designer Embroidered ${fabric || 'Rayon Slub'} 3-Piece Suit (${cleanDesign}) | Kurti, Pant & Dupatta`;
      seoDesc = `Exclusive handcrafted ${cleanDesign} 3-piece suit set from Vastra Aura Surat. Featuring fine ${fabric || 'Rayon Slub'} with intricate embroidery work, matching tailored pant, and graceful dupatta. Ideal for festivals, parties, and weddings. Free Cash on Delivery & Express Worldwide Shipping.`;
      break;

    case 'Short Kurtis':
      seoTitle = `Chic Printed Pure Cotton Short Kurti (${cleanDesign}) | Daily & Casual Ethnic Top`;
      seoDesc = `Experience effortless comfort with ${cleanDesign} premium cotton short kurti by Vastra Aura Surat. Vibrant artisan print work, lightweight breathable fabric, and durable colorfast quality. Ideal for pairing with jeans or trousers.`;
      break;

    case 'Kurta Sets':
      seoTitle = `Elegant Handcrafted ${fabric || 'Cotton Silk'} Kurta Set (${cleanDesign}) with Dupatta`;
      seoDesc = `Stunning ${cleanDesign} luxury Kurta Set from Surat ethnic collection. Tailored with ${fabric || 'Cotton Silk'} with exquisite embroidery detailing and paired with matching bottom and designer dupatta.`;
      break;

    case 'Chaniya Choli':
      seoTitle = `Festive Navratri Traditional Chaniya Choli (${cleanDesign}) | Mirror & Thread Work`;
      seoDesc = `Celebrate authentic Gujarati heritage with the ${cleanDesign} Chaniya Choli from Vastra Aura Surat. Embellished with heavy Gamthi embroidery, real mirror work, and full flair flair kalidar skirt with matching blouse and dupatta.`;
      break;

    case 'Lehenga':
      seoTitle = `Designer Festive Semi-Stitched Lehenga Choli (${cleanDesign})`;
      seoDesc = `Stun every occasion with this magnificent ${cleanDesign} designer lehenga choli set from Surat. Features premium fabric, royal border embroidery, zari embellishments, and full matching dupatta.`;
      break;

    case 'Saree':
      seoTitle = `Pure Traditional Heritage Designer Saree (${cleanDesign}) with Blouse`;
      seoDesc = `Drape pure grace with ${cleanDesign} luxury saree from Vastra Aura Surat. Premium weave, rich pallu, and matching unstitched blouse.`;
      break;

    default:
      seoTitle = `Luxury Designer Ethnic Wear - ${cleanDesign} | Vastra Aura Surat`;
      seoDesc = `High quality handcrafted fashion directly from Surat fashion house. Premium fabric, unbeatable wholesale pricing, and instant dispatch.`;
      break;
  }

  return { seoTitle, seoDesc, originalPrice };
}

// Clean raw WhatsApp text for public product description (remove wholesale rates, prices, fixed price notes, booking CTAs & phone numbers)
function cleanWhatsAppDescription(rawText = '') {
  if (!rawText) return '';

  const lines = rawText.split(/\r?\n/);
  const cleanedLines = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (cleanedLines.length > 0 && cleanedLines[cleanedLines.length - 1] !== '') {
        cleanedLines.push('');
      }
      continue;
    }

    // Punctuation / placeholder only lines (e.g. '.', '...', '---', '•')
    if (/^[.\-—_•*~–\s]+$/.test(trimmed)) {
      continue;
    }

    // 1. Remove wholesale prices, rates, MRP, and design-code price lines (e.g. '251005 – 1950/-')
    const isPriceLine =
      /(?:price|rate|mrp|cost|wholesale\s*rate|reseller|fixed\s*price|fixed\s*rate|no\s*less|no\s*bargain)\b/i.test(trimmed) ||
      /^[💰💵🏷️⚠️🚨\s*~-]*\s*(?:price|rate|mrp|inr|rs\.?|₹)\s*[:=-]?\s*[\d,]+/i.test(trimmed) ||
      /(?:₹|rs\.?|inr)\s*[\d,]+\s*(?:\/-|\+|-|\bonly\b|\+?\s*ship)/i.test(trimmed) ||
      /^(?:price|rate)\s*[:=-]/i.test(trimmed) ||
      /^\s*[*_~]?\s*(?:[a-zA-Z0-9_\s#.-]+[-–—:])?\s*₹?\s*\d{3,5}\s*(?:\/-|\+|-|\bonly\b)/i.test(trimmed) ||
      /\b\d{3,5}\s*(?:\/-|\+ship)/i.test(trimmed);

    if (isPriceLine) {
      continue;
    }

    // 2. Remove supplier CTAs, DMs, photo references, shipping extra notes, phone numbers, and booking links
    const isCtaOrContactLine =
      /(?:dm\s*(?:now|to|for|us)|book\s*(?:now|fast|your|here)|inbox\s*(?:us|now)|order\s*(?:now|fast|here|on)|ping\s*(?:us|now|for))\b/i.test(trimmed) ||
      /(?:whatsapp|call|contact)\s*(?:us|me|on|at|no\.?|number|\:)?\s*[\d+]/i.test(trimmed) ||
      /\b(?:https?:\/\/|wa\.me\/|bit\.ly\/)\S+/i.test(trimmed) ||
      /\b[6-9]\d{9}\b/.test(trimmed) ||
      /(?:single\s*pc\s*available|set\s*to\s*set|no\s*cod|ready\s*to\s*ship|dispatch\s*within)\b/i.test(trimmed) ||
      /(?:shipping|ship)\s*:\s*(?:extra|charge)/i.test(trimmed) ||
      /\bshipping\s*extra\b/i.test(trimmed) ||
      /mentioned\s*on\s*photo/i.test(trimmed);

    if (isCtaOrContactLine) {
      continue;
    }

    const cleanedLine = trimmed.replace(/^[💰⚠️🚨🚚📸\s]+$/, '').trim();
    if (cleanedLine) {
      cleanedLines.push(cleanedLine);
    }
  }

  while (cleanedLines.length > 0 && cleanedLines[0] === '') cleanedLines.shift();
  while (cleanedLines.length > 0 && cleanedLines[cleanedLines.length - 1] === '') cleanedLines.pop();

  return cleanedLines.join('\n');
}

// 5. Save base64 media to disk
function saveMediaToDisk(media, folderName, index = 1) {
  const categorySlug = 'whatsapp';
  const targetDir = path.join(__dirname, 'public', 'images', 'products', categorySlug, folderName);
  fs.mkdirSync(targetDir, { recursive: true });

  const ext = media.mimetype.includes('png') ? 'png' : media.mimetype.includes('webp') ? 'webp' : 'jpg';
  const fileName = `${index}.${ext}`;
  const filePath = path.join(targetDir, fileName);

  fs.writeFileSync(filePath, Buffer.from(media.data, 'base64'));
  return `/images/products/${categorySlug}/${folderName}/${fileName}`;
}

// 6. Memory Buffer to group multiple photos sent in burst before/with text
const catalogBuffer = {};

// 7. Process Catalog and Insert to MongoDB
async function createProductFromCatalog(catalog) {
  const { chatName, images, caption, messageId } = catalog;
  if (!images || images.length === 0) return null;

  // Extract Price
  const priceMatch = caption.match(/(?:₹|rs\.?|rate:?|price:?)\s*(\d{3,5})/i) || caption.match(/(\d{3,5})\s*(?:\/-|\+ship)/i);
  const price = priceMatch ? priceMatch[1] : '1499';

  // Extract Fabric
  const fabricMatch = caption.match(/(?:fabric|cloth|material):?\s*([a-zA-Z\s]+)/i);
  const fabric = fabricMatch ? fabricMatch[1].split('\n')[0].trim() : 'Premium Rayon Slub';

  // Extract Design Name
  const lines = caption.split('\n').map(l => l.trim()).filter(Boolean);
  const designMatch = caption.match(/(?:design|code|d\.?no|no\.?):?\s*([a-zA-Z0-9-_]+)/i);
  const rawDesignName = designMatch 
    ? designMatch[1].toUpperCase() 
    : (lines[0] ? lines[0].substring(0, 40) : `CATALOG-${Date.now().toString().slice(-4)}`);

  // Detect Category
  const category = detectCategory(caption);

  // Generate SEO Content
  const { seoTitle, seoDesc, originalPrice } = generateSEOMetadata(category, rawDesignName, fabric, price);

  // Check for duplicate in DB
  const existing = await Product.findOne({
    $or: [
      { name: seoTitle },
      { originalSellerLink: messageId }
    ]
  });

  if (existing) {
    console.log(`ℹ️ [Duplicate skipped] "${seoTitle}" is already in DB.`);
    return existing;
  }

  const newProduct = new Product({
    name: seoTitle,
    price: price,
    originalPrice: originalPrice,
    allowCOD: true,
    category: category,
    status: 'Active',
    image: images[0],
    images: images,
    fabric: fabric,
    description: cleanWhatsAppDescription(caption) ? `${seoDesc}\n\n✨ Product Details & Specifications:\n${cleanWhatsAppDescription(caption)}` : seoDesc,
    originalSellerLink: messageId || `wp-${Date.now()}`,
    sizes: [
      { name: 'S', stock: 5 },
      { name: 'M', stock: 5 },
      { name: 'L', stock: 5 },
      { name: 'XL', stock: 5 },
      { name: 'XXL', stock: 5 },
    ],
    isPlatformShipping: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await newProduct.save();
  console.log(`\n🎉 [AUTO-LISTED] ${seoTitle}`);
  console.log(`   🏷️ Category: ${category} | 💰 Price: ₹${price} (MRP: ₹${originalPrice}) | 📸 Images: ${images.length}`);
  console.log(`   🌐 Live at: /shop?category=${category.toLowerCase().replace(/\s+/g, '-')}\n`);

  return newProduct;
}

// 8. Scan Past Messages in Chat ("je already aavi gayu cheh e pn")
async function scanPastMessages(chat, messageLimit = 150) {
  console.log(`\n🔍 Scanning past ${messageLimit} messages in "${chat.name}" for catalogs that already arrived...`);
  const messages = await chat.fetchMessages({ limit: messageLimit });
  console.log(`📥 Retrieved ${messages.length} past messages. Analyzing catalogs...`);

  let currentImages = [];
  let currentCaption = '';
  let folderKey = `past-${Date.now().toString().slice(-6)}`;
  let importedCount = 0;

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];

    if (msg.hasMedia) {
      try {
        const media = await msg.downloadMedia();
        if (media && media.mimetype && media.mimetype.startsWith('image/')) {
          const imgUrl = saveMediaToDisk(media, folderKey, currentImages.length + 1);
          currentImages.push(imgUrl);
          if (msg.caption && msg.caption.trim().length > 10) {
            currentCaption = msg.caption.trim();
          }
        }
      } catch (err) {
        // media expired or skipped
      }
    } else if (msg.body && msg.body.trim().length > 10) {
      // It's a text description message!
      if (currentImages.length > 0) {
        currentCaption = msg.body.trim();
        const saved = await createProductFromCatalog({
          chatName: chat.name,
          images: currentImages,
          caption: currentCaption,
          messageId: msg.id._serialized,
        });
        if (saved) importedCount++;

        // Reset for next catalog
        currentImages = [];
        currentCaption = '';
        folderKey = `past-${Date.now().toString().slice(-6)}-${i}`;
      }
    }
  }

  // If last images still pending with caption
  if (currentImages.length > 0 && currentCaption.length > 10) {
    const saved = await createProductFromCatalog({
      chatName: chat.name,
      images: currentImages,
      caption: currentCaption,
      messageId: `past-final-${Date.now()}`,
    });
    if (saved) importedCount++;
  }

  console.log(`✅ Finished scanning "${chat.name}"! Imported ${importedCount} past catalogs directly to Website!\n`);
}

// 9. Initialize WhatsApp Client
const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  }
});

client.on('loading_screen', (percent, message) => {
  console.log(`⏳ Loading WhatsApp Web: ${percent}% (${message || 'initializing'})...`);
});

client.on('authenticated', () => {
  console.log('🔑 WhatsApp Authenticated Successfully!');
});

client.on('auth_failure', (msg) => {
  console.error('❌ Authentication Failure:', msg);
});

client.on('qr', (qr) => {
  console.log('\n===============================================================');
  console.log('📱 SCAN QR CODE WITH YOUR PHONE (WhatsApp -> Linked Devices):');
  console.log('===============================================================\n');
  qrcode.generate(qr, { small: true });
});

client.on('ready', async () => {
  console.log('\n===============================================================');
  console.log('🚀 WHATSAPP BOT IS READY & CONNECTED!');
  console.log('===============================================================');
  console.log('⚡ Automatic Catalog Ingestion & SEO Listing is ACTIVE.');
  console.log('👉 Any new catalog received in WhatsApp will be auto-listed live!');
  console.log('👉 Tip: Type "!import" or "!scan" in any group to import past catalogs!\n');

  // Allow WhatsApp Web 5 seconds to fully sync chats into memory
  setTimeout(async () => {
    try {
      const chats = await client.getChats();
      const catalogKeywords = ['catalog', 'mudra', 'reseller', 'saree', 'kurti', 'suit', 'update', 'wholesale'];
      
      console.log(`📋 Found ${chats.length} chats. Searching for Catalog & Reseller groups...`);
      const targetChats = chats.filter(c => 
        c && c.name && catalogKeywords.some(kw => c.name.toLowerCase().includes(kw))
      );

      if (targetChats.length > 0) {
        console.log(`🎯 Found ${targetChats.length} catalog group(s): ${targetChats.map(c => `"${c.name}"`).join(', ')}`);
        for (const tChat of targetChats.slice(0, 3)) { // Scan top 3 catalog groups on startup
          await scanPastMessages(tChat, 60);
        }
      } else {
        console.log('💡 Tip: Type "!import" in any WhatsApp catalog group to import its past messages!');
      }
    } catch (err) {
      console.log('💡 Note: You can type "!import" in any WhatsApp group anytime to import its catalogs.');
    }
  }, 5000);
});

// 10. Real-time Incoming & Forwarded Message Listener
client.on('message_create', async (msg) => {
  try {
    // 0️⃣ Ignore WhatsApp Status Updates and Channels/Broadcasts immediately
    if (!msg || !msg.from || msg.from === 'status@broadcast' || msg.from.includes('@newsletter') || msg.broadcast) {
      return;
    }

    // Resolve chatId (handles both incoming messages and messages forwarded to oneself)
    const chatId = msg.fromMe ? (msg.to || msg.from) : msg.from;
    let chatName = msg._data?.notifyName || (chatId.includes('@g.us') ? 'WhatsApp Group' : chatId.split('@')[0]);
    let chatObj = null;

    try {
      chatObj = await msg.getChat();
      if (chatObj && chatObj.name) chatName = chatObj.name;
    } catch {
      // getChat evaluation error on some chats, fallback to safe chatName
    }

    // Command: !import or !scan in any group/chat to import past messages
    if (msg.body && (msg.body.trim().toLowerCase() === '!import' || msg.body.trim().toLowerCase() === '!scan')) {
      console.log(`⚡ Received !import command from: "${chatName}" (${chatId})`);
      if (chatObj) {
        await scanPastMessages(chatObj, 100);
        await msg.reply('✅ Automation: Past catalogs have been scanned and listed to the website with SEO!');
      } else {
        await msg.reply('⚠️ Please wait a moment while WhatsApp finishes syncing, then try !import again.');
      }
      return;
    }

    // 1️⃣ Message is an Image with caption attached
    if (msg.hasMedia && msg.caption && msg.caption.trim().length > 10) {
      console.log(`📸 Image with caption received from "${chatName}"...`);
      const media = await msg.downloadMedia();
      if (media && media.mimetype && media.mimetype.startsWith('image/')) {
        const folderKey = `wp-${Date.now().toString().slice(-6)}`;
        const imgUrl = saveMediaToDisk(media, folderKey, 1);
        await createProductFromCatalog({
          chatName: chatName,
          images: [imgUrl],
          caption: msg.caption.trim(),
          messageId: msg.id._serialized,
        });
      }
      return;
    }

    // 2️⃣ Message is an Image without caption (part of an album burst)
    if (msg.hasMedia) {
      const media = await msg.downloadMedia();
      if (media && media.mimetype && media.mimetype.startsWith('image/')) {
        if (!catalogBuffer[chatId]) {
          catalogBuffer[chatId] = {
            images: [],
            folderKey: `wp-${Date.now().toString().slice(-6)}`,
            timer: null,
          };
        }

        const buf = catalogBuffer[chatId];
        const imgUrl = saveMediaToDisk(media, buf.folderKey, buf.images.length + 1);
        buf.images.push(imgUrl);
        console.log(`📸 Received photo (${buf.images.length}) in "${chatName}"... waiting for description.`);

        // Debounce timer: wait 15 seconds for description
        if (buf.timer) clearTimeout(buf.timer);
        buf.timer = setTimeout(() => {
          if (catalogBuffer[chatId] && catalogBuffer[chatId].caption) {
            createProductFromCatalog({
              chatName: chatName,
              images: catalogBuffer[chatId].images,
              caption: catalogBuffer[chatId].caption,
              messageId: msg.id._serialized,
            });
            delete catalogBuffer[chatId];
          }
        }, 15000);
      }
      return;
    }

    // 3️⃣ Message is Text (Description for the buffered photos)
    if (!msg.hasMedia && msg.body && msg.body.trim().length > 10) {
      if (catalogBuffer[chatId] && catalogBuffer[chatId].images.length > 0) {
        const buf = catalogBuffer[chatId];
        if (buf.timer) clearTimeout(buf.timer);

        await createProductFromCatalog({
          chatName: chatName,
          images: buf.images,
          caption: msg.body.trim(),
          messageId: msg.id._serialized,
        });

        delete catalogBuffer[chatId];
      }
    }
  } catch (err) {
    console.error('❌ Error in message listener:', err.message || err);
  }
});

console.log('🚀 Starting WhatsApp Automation Client... Please wait for QR code.');
client.initialize();

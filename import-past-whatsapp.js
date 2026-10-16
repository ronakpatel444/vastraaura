const { Client, LocalAuth } = require('whatsapp-web.js');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// 1. Connect MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Database!'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// 2. Product Schema
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

// 3. Category Detection
function detectCategory(text = '', chatName = '') {
  const combined = `${chatName} ${text}`.toLowerCase();
  
  if (combined.includes('kid')) {
    return 'Kids Wear';
  }
  if (combined.includes('saree') || combined.includes('sari') || combined.includes('patola')) {
    return 'Saree';
  }
  if (combined.includes('chaniya') || combined.includes('choli') || combined.includes('navratri') || combined.includes('kediya')) {
    return 'Chaniya Choli';
  }
  if (combined.includes('lehenga') || combined.includes('ghagra')) {
    return 'Lehenga';
  }
  if (combined.includes('short kurti') || combined.includes('short top') || combined.includes('tunic')) {
    return 'Short Kurtis';
  }
  if (combined.includes('co-ord') || combined.includes('coord') || combined.includes('kurti with pant') || combined.includes('kurta set') || combined.includes('kurti set')) {
    return 'Kurta Sets';
  }
  if (combined.includes('3 piece') || combined.includes('3 pis') || combined.includes('3pc') || (combined.includes('suit') && combined.includes('dupatta'))) {
    return '3 Piece Suit';
  }
  return 'Kurta Sets';
}

// 4. Save Media File to disk
function saveMedia(media, folderName, index = 1) {
  const targetDir = path.join(__dirname, 'public', 'images', 'products', 'whatsapp', folderName);
  fs.mkdirSync(targetDir, { recursive: true });

  const ext = media.mimetype && media.mimetype.includes('png') ? 'png' : (media.mimetype && media.mimetype.includes('webp') ? 'webp' : 'jpg');
  const fileName = `${index}.${ext}`;
  const filePath = path.join(targetDir, fileName);

  fs.writeFileSync(filePath, Buffer.from(media.data, 'base64'));
  return `/images/products/whatsapp/${folderName}/${fileName}`;
}

// 5. Parse Catalog Text & Generate SEO
function parseCatalog(caption, chatName) {
  // Extract Price
  const priceMatch = caption.match(/(?:₹|rs\.?|rate:?|price:?)\s*(\d{3,5})/i) || 
                     caption.match(/(\d{3,5})\s*(?:\/-|\+ship)/i) ||
                     caption.match(/(?:₹|\*Price:\s*₹?)\s*(\d{3,5})/i);
  const price = priceMatch ? priceMatch[1] : '899';
  const numPrice = parseInt(price, 10);
  const originalPrice = (numPrice + (numPrice < 1000 ? 700 : 1200)).toString();

  // Extract Fabric
  const fabricMatch = caption.match(/(?:fabric|cloth|material):?\s*([^\n\r]+)/i);
  const fabric = fabricMatch ? fabricMatch[1].replace(/[()]/g, '').trim() : 'Heavy Premium Cotton';

  // Extract Sizes
  const sizeMatch = caption.match(/(?:sizes?\s*available|size):?\s*([^\n\r]+)/i);
  let sizes = [
    { name: 'M', stock: 5 },
    { name: 'L', stock: 5 },
    { name: 'XL', stock: 5 },
    { name: 'XXL', stock: 5 }
  ];
  if (sizeMatch) {
    const rawSizes = sizeMatch[1].split(/[,/ ]+/).map(s => s.trim().toUpperCase()).filter(s => ['S', 'M', 'L', 'XL', 'XXL', '3XL'].includes(s));
    if (rawSizes.length > 0) {
      sizes = rawSizes.map(s => ({ name: s, stock: 5 }));
    }
  }

  // Extract Colors
  const colorMatch = caption.match(/colors?:?\s*([^\n\r]+)/i);
  let colors = [];
  if (colorMatch) {
    colors = colorMatch[1].replace(/[({\[].*?[)}\]]/g, '').split(/[,/]+/).map(c => c.trim()).filter(Boolean);
  }

  // Extract Title Line
  const lines = caption.split('\n').map(l => l.trim().replace(/^[\s*~✨🌸🔥👗💰📦]+|[\s*~✨🌸🔥👗💰📦]+$/g, '')).filter(Boolean);
  let rawTitle = lines[0] || 'Designer Ethnic Wear';
  if (rawTitle.toLowerCase().startsWith('new arrival:')) {
    rawTitle = rawTitle.replace(/new arrival:\s*/i, '');
  }

  const category = detectCategory(caption, chatName);

  // SEO Optimized Title & Description
  const seoTitle = `Designer ${fabric} ${rawTitle} | Vastra Aura Surat`;
  const seoDesc = `Shop the latest ${rawTitle} directly from Vastra Aura Surat. Crafted in luxury ${fabric}. Features authentic handwork detailing, premium stitching, and modern elegant fit. Comes with Cash on Delivery and Express Priority Shipping.`;

  return {
    name: seoTitle,
    price: price,
    originalPrice: originalPrice,
    category: category,
    fabric: fabric,
    description: `${seoDesc}\n\n📌 Catalog Details:\n${caption}`,
    sizes: sizes,
    colors: colors,
  };
}

// 6. Main Import Function
async function importPastCatalogs() {
  console.log('\n===============================================================');
  console.log('📦 WHATSAPP PAST CATALOGS IMPORT AUTOMATION');
  console.log('===============================================================');
  console.log('Connecting to WhatsApp session...\n');

  const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    }
  });

  client.on('qr', () => {
    console.log('⚠️ Session not found or expired. Please run "node whatsapp-bot.js" first to scan QR code.');
    process.exit(1);
  });

  client.on('ready', async () => {
    console.log('🚀 Connected to WhatsApp successfully!\n');
    console.log('Fetching groups and catalog channels...');

    // Wait 5 seconds for WhatsApp Web memory sync
    await new Promise(r => setTimeout(r, 5000));

    let chats = [];
    try {
      chats = await client.getChats();
    } catch (err) {
      console.log('Notice: Reading chats directly from active chat list...');
    }

    console.log(`📋 Total chats found: ${chats.length}`);

    // Groups we want to scan (from screenshot & reseller list)
    const targetKeywords = [
      'jaipur vastra',
      'mudra ethnic',
      'saree',
      'kurti',
      'suit',
      'reseller',
      'catalog',
      'update',
      'wholesale'
    ];

    const targetChats = chats.filter(c => {
      const name = (c.name || '').toLowerCase();
      return targetKeywords.some(kw => name.includes(kw));
    });

    console.log(`\n🎯 Found ${targetChats.length} Catalog Chat(s):`);
    targetChats.forEach((c, idx) => console.log(`   ${idx + 1}. "${c.name}"`));
    console.log('---------------------------------------------------------------\n');

    let totalImported = 0;

    for (const chat of targetChats) {
      console.log(`\n🔍 Scanning chat: "${chat.name}"...`);
      try {
        const messages = await chat.fetchMessages({ limit: 80 });
        console.log(`   Retrieved ${messages.length} recent messages. Processing catalogs...`);

        // Group messages: detect catalogs (image bursts + description)
        let bufferedImages = [];
        let currentFolder = `wp-${Date.now().toString().slice(-6)}`;

        for (let i = 0; i < messages.length; i++) {
          const msg = messages[i];

          // 1. Single Image with Caption
          if (msg.hasMedia && msg.caption && msg.caption.trim().length > 20) {
            try {
              const media = await msg.downloadMedia();
              if (media && media.mimetype && media.mimetype.startsWith('image/')) {
                const folder = `wp-${Date.now().toString().slice(-6)}-${i}`;
                const imgPath = saveMedia(media, folder, 1);
                const catalogData = parseCatalog(msg.caption, chat.name);

                // Check duplicate
                const exists = await Product.findOne({ name: catalogData.name });
                if (!exists) {
                  const newProduct = new Product({
                    ...catalogData,
                    image: imgPath,
                    images: [imgPath],
                    originalSellerLink: msg.id._serialized,
                    allowCOD: true,
                    status: 'Active',
                    isPlatformShipping: true,
                  });
                  await newProduct.save();
                  totalImported++;
                  console.log(`   ✅ [LISTED] ${catalogData.name} | ₹${catalogData.price} | Category: ${catalogData.category}`);
                }
              }
            } catch (e) {
              // skip failed media
            }
            continue;
          }

          // 2. Image part of an album burst
          if (msg.hasMedia && (!msg.caption || msg.caption.trim().length <= 20)) {
            try {
              const media = await msg.downloadMedia();
              if (media && media.mimetype && media.mimetype.startsWith('image/')) {
                const imgPath = saveMedia(media, currentFolder, bufferedImages.length + 1);
                bufferedImages.push(imgPath);
              }
            } catch (e) {
              // skip
            }
          }

          // 3. Text description message after images
          if (!msg.hasMedia && msg.body && msg.body.trim().length > 30) {
            const body = msg.body.trim();
            if (bufferedImages.length > 0 && (body.includes('Price') || body.includes('Fabric') || body.includes('Sizes') || body.includes('₹') || body.includes('Rs'))) {
              const catalogData = parseCatalog(body, chat.name);

              const exists = await Product.findOne({ name: catalogData.name });
              if (!exists) {
                const newProduct = new Product({
                  ...catalogData,
                  image: bufferedImages[0],
                  images: bufferedImages,
                  originalSellerLink: msg.id._serialized,
                  allowCOD: true,
                  status: 'Active',
                  isPlatformShipping: true,
                });
                await newProduct.save();
                totalImported++;
                console.log(`   ✅ [LISTED] ${catalogData.name} (${bufferedImages.length} photos) | ₹${catalogData.price} | Category: ${catalogData.category}`);
              }

              // Reset buffer for next catalog
              bufferedImages = [];
              currentFolder = `wp-${Date.now().toString().slice(-6)}-${i}`;
            }
          }
        }
      } catch (err) {
        console.log(`   ⚠️ Could not read past messages for "${chat.name}":`, err.message);
      }
    }

    console.log('\n===============================================================');
    console.log(`🎉 IMPORT COMPLETE! Successfully listed ${totalImported} past catalogs!`);
    console.log(`🌐 All products are now live with SEO on your website!`);
    console.log('===============================================================\n');

    await client.destroy();
    await mongoose.disconnect();
    process.exit(0);
  });

  client.initialize();
}

importPastCatalogs();

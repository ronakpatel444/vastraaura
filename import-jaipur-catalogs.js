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
function detectCategory(text = '') {
  const combined = text.toLowerCase();
  if (combined.includes('3 piece') || combined.includes('3pc') || (combined.includes('suit') && combined.includes('pant'))) {
    return '3 Piece Suit';
  }
  if (combined.includes('short kurti') || combined.includes('short top') || combined.includes('tunic')) {
    return 'Short Kurtis';
  }
  if (combined.includes('co-ord') || combined.includes('coord') || combined.includes('kurta set') || combined.includes('kurti set') || combined.includes('angrakha') || combined.includes('kurti')) {
    return 'Kurta Sets';
  }
  if (combined.includes('chaniya') || combined.includes('choli') || combined.includes('navratri')) {
    return 'Chaniya Choli';
  }
  if (combined.includes('lehenga') || combined.includes('ghagra')) {
    return 'Lehenga';
  }
  if (combined.includes('saree') || combined.includes('sari')) {
    return 'Saree';
  }
  return 'Kurta Sets';
}

// 4. Save Base64 Image to Disk
function saveBase64Image(base64Data, folderName, index = 1) {
  const targetDir = path.join(__dirname, 'public', 'images', 'products', 'whatsapp', folderName);
  fs.mkdirSync(targetDir, { recursive: true });

  const fileName = `${index}.jpg`;
  const filePath = path.join(targetDir, fileName);

  fs.writeFileSync(filePath, Buffer.from(base64Data, 'base64'));
  return `/images/products/whatsapp/${folderName}/${fileName}`;
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

// 5. Parse Catalog Details with User Pricing Rules
function parseCatalog(caption) {
  // Extract Raw Wholesale Price
  const priceMatch = caption.match(/(?:₹|rs\.?|rate:?|price:?)\s*(\d{3,5})/i) || 
                     caption.match(/(\d{3,5})\s*(?:\/-|\+ship)/i) ||
                     caption.match(/(?:₹|\*Price:\s*₹?)\s*(\d{3,5})/i);
  
  const rawWholesalePrice = priceMatch ? parseInt(priceMatch[1], 10) : 745;

  // RULE 1: Selling Price = Raw Price + 1000
  const sellingPriceNum = rawWholesalePrice + 1000;
  const price = sellingPriceNum.toString();

  // RULE 2: Original MRP Price = Selling Price + Random 30% to 50%
  const randomMarkup = 1.30 + (Math.random() * 0.20); // between 1.30 and 1.50
  const originalPrice = Math.round(sellingPriceNum * randomMarkup).toString();

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

  // Clean Title
  const lines = caption.split('\n').map(l => l.trim().replace(/^[\s*~✨🌸🔥👗💰📦★❣️🦋]+|[\s*~✨🌸🔥👗💰📦★❣️🦋]+$/g, '')).filter(Boolean);
  let rawTitle = lines[0] || 'Designer Ethnic Wear';
  if (rawTitle.toLowerCase().startsWith('new arrival:')) {
    rawTitle = rawTitle.replace(/new arrival:\s*/i, '');
  }

  const category = detectCategory(caption);

  // SEO Rich Title and Description
  const seoTitle = `Designer ${fabric} ${rawTitle} | Vastra Aura Surat`;
  const seoDesc = `Shop the latest ${rawTitle} exclusively from Vastra Aura Surat. Mastercrafted in luxury ${fabric}. Features authentic designer detailing, premium stitching, and modern comfortable fit. Comes with Cash on Delivery and Express Priority Shipping.`;

  return {
    name: seoTitle,
    price: price,
    originalPrice: originalPrice,
    category: category,
    fabric: fabric,
    description: cleanWhatsAppDescription(caption) ? `${seoDesc}\n\n✨ Product Details & Specifications:\n${cleanWhatsAppDescription(caption)}` : seoDesc,
    sizes: sizes,
    colors: colors,
    rawWholesalePrice,
  };
}

// 6. Fast Bulk Import for Jaipur Group
async function importJaipurCatalogs() {
  console.log('\n===============================================================');
  console.log('⚡ JAIPUR VASTRA HUB - FAST BULK IMPORT (1-CLICK AUTOMATION)');
  console.log('===============================================================');
  console.log('Connecting to WhatsApp session...\n');

  const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    }
  });

  client.on('ready', async () => {
    console.log('🚀 Connected to WhatsApp! Finding Jaipur Vastra Hub...');

    try {
      const jaipurData = await client.pupPage.evaluate(async () => {
        const chats = window.require('WAWebCollections').Chat.getModelsArray();
        const jaipurChat = chats.find(c => {
          const id = c.id ? (c.id._serialized || c.id) : '';
          const name = (c.name || c.formattedTitle || '').toLowerCase();
          return id === '120363429032962466@g.us' || (name.includes('jaipur') && name.includes('vastra'));
        });

        if (!jaipurChat) {
          return { error: 'Jaipur Vastra Hub group not found' };
        }

        const chatId = jaipurChat.id._serialized || jaipurChat.id;
        const chatName = jaipurChat.name || jaipurChat.formattedTitle || 'Jaipur Vastra Hub';

        // Load earlier messages (up to 300)
        try {
          const loader = window.require('WAWebChatLoadMessages');
          if (loader && loader.loadEarlierMsgs) {
            await loader.loadEarlierMsgs({ chat: jaipurChat });
            await loader.loadEarlierMsgs({ chat: jaipurChat });
          }
        } catch (e) {}

        const allMsgs = jaipurChat.msgs ? jaipurChat.msgs.getModelsArray() : [];
        
        // Group messages into catalog clusters using direct indices
        const clusters = [];
        let currentCluster = { imageIndices: [], caption: '', id: null, timestamp: 0 };

        for (let i = 0; i < allMsgs.length; i++) {
          const m = allMsgs[i];
          
          if (m.type === 'image') {
            currentCluster.imageIndices.push(i);
            currentCluster.timestamp = m.t || Date.now();
            if (m.caption && m.caption.length > 20) {
              currentCluster.caption = m.caption;
              currentCluster.id = `msg-${i}`;
              clusters.push({ ...currentCluster });
              currentCluster = { imageIndices: [], caption: '', id: null, timestamp: 0 };
            }
          } else if (m.type === 'chat' && m.body && m.body.length > 20) {
            const body = m.body;
            if (currentCluster.imageIndices.length > 0 && (body.includes('Price') || body.includes('Fabric') || body.includes('Rate') || body.includes('₹') || body.includes('size') || body.includes('Size') || body.includes('collection') || body.includes('Collection') || body.includes('Cotton'))) {
              currentCluster.caption = body;
              currentCluster.id = `msg-${i}`;
              clusters.push({ ...currentCluster });
              currentCluster = { imageIndices: [], caption: '', id: null, timestamp: 0 };
            }
          }
        }

        return {
          chatName,
          chatId,
          totalMessages: allMsgs.length,
          totalClusters: clusters.length,
          clusters
        };
      });

      if (jaipurData.error) {
        console.error('❌', jaipurData.error);
        await client.destroy();
        process.exit(1);
      }

      console.log(`📋 Found "${jaipurData.chatName}" with ${jaipurData.totalMessages} messages!`);
      console.log(`🎯 Detected ${jaipurData.totalClusters} complete catalog bundles ready to import!\n`);

      let importedCount = 0;

      for (let cIdx = 0; cIdx < jaipurData.clusters.length; cIdx++) {
        const cluster = jaipurData.clusters[cIdx];
        const catalogData = parseCatalog(cluster.caption);

        console.log(`\n---------------------------------------------------------------`);
        console.log(`📦 Catalog #${cIdx + 1}/${jaipurData.clusters.length}: "${catalogData.name.substring(0, 45)}..."`);
        console.log(`   💰 Wholesale: ₹${catalogData.rawWholesalePrice} ➔ Selling Price: ₹${catalogData.price} (+1k) | MRP: ₹${catalogData.originalPrice}`);
        console.log(`   🏷️ Category: ${catalogData.category} | 🧵 Fabric: ${catalogData.fabric}`);
        console.log(`   📸 Downloading ${cluster.imageIndices.length} album photos...`);

        // Check if duplicate already in DB
        const exists = await Product.findOne({ name: catalogData.name });
        if (exists) {
          console.log(`   ℹ️ [Skipped] Already listed on website!`);
          continue;
        }

        const downloadedImages = [];
        const folderKey = `jaipur-${Date.now().toString().slice(-6)}-${cIdx + 1}`;

        // Download album images directly by message index in browser
        for (let imgIdx = 0; imgIdx < cluster.imageIndices.length; imgIdx++) {
          const targetMsgIndex = cluster.imageIndices[imgIdx];
          try {
            const b64 = await client.pupPage.evaluate(async (mIndex, cId) => {
              const chat = window.require('WAWebCollections').Chat.get(cId);
              const allMsgs = chat && chat.msgs ? chat.msgs.getModelsArray() : [];
              const msg = allMsgs[mIndex];

              if (!msg) return null;
              
              if (msg.mediaData && msg.mediaData.mediaStage !== 'RESOLVED') {
                try {
                  await msg.downloadMedia({ downloadEvenIfExpensive: true, rmrReason: 1 });
                } catch (e) {}
              }

              // Fast wait for resolved
              for (let w = 0; w < 10; w++) {
                if (msg.mediaData && msg.mediaData.mediaStage === 'RESOLVED') break;
                await new Promise(r => setTimeout(r, 100));
              }

              const mockQpl = { addAnnotations: () => {}, addPoint: () => {} };
              let data = null;
              try {
                const decryptedDoc = await window.require('WAWebDownloadManager').downloadManager.downloadAndMaybeDecrypt({
                  directPath: msg.directPath,
                  encFilehash: msg.encFilehash,
                  filehash: msg.filehash,
                  mediaKey: msg.mediaKey,
                  mediaKeyTimestamp: msg.mediaKeyTimestamp,
                  type: 'document', // Safe bypass for octet-stream
                  signal: new AbortController().signal,
                  downloadQpl: mockQpl,
                });
                data = await window.WWebJS.arrayBufferToBase64Async(decryptedDoc);
              } catch (e) {
                // Fallback to body thumbnail if decryption takes too long
                data = msg.body;
              }

              return data || msg.body;
            }, targetMsgIndex, jaipurData.chatId);

            if (b64) {
              const imgUrl = saveBase64Image(b64, folderKey, imgIdx + 1);
              downloadedImages.push(imgUrl);
            }
          } catch (e) {
            // skip failed image
          }
        }

        if (downloadedImages.length === 0) {
          console.log(`   ⚠️ Could not fetch images for this catalog, skipping.`);
          continue;
        }

        // Save to MongoDB
        const newProduct = new Product({
          name: catalogData.name,
          price: catalogData.price,
          originalPrice: catalogData.originalPrice,
          category: catalogData.category,
          status: 'Active',
          allowCOD: true,
          image: downloadedImages[0],
          images: downloadedImages,
          fabric: catalogData.fabric,
          description: catalogData.description,
          originalSellerLink: `jaipur-wp-${cluster.id || Date.now()}`,
          sizes: catalogData.sizes,
          colors: catalogData.colors,
          isPlatformShipping: true,
        });

        await newProduct.save();
        importedCount++;
        console.log(`   ✅ [LIVE ON SITE] Saved with ${downloadedImages.length} photos!`);
      }

      console.log('\n===============================================================');
      console.log(`🎉 JAIPUR IMPORT COMPLETE! Successfully listed ${importedCount} catalogs!`);
      console.log(`🌐 All products are live on your website with SEO & pricing!`);
      console.log('===============================================================\n');

    } catch (err) {
      console.error('Fatal error during import:', err);
    } finally {
      await client.destroy();
      await mongoose.disconnect();
      process.exit(0);
    }
  });

  client.initialize();
}

importJaipurCatalogs();

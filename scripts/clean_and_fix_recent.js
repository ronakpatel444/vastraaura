const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

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

    // Punctuation / placeholder / divider only lines (e.g. '.', '---', '===', '•')
    if (/^[.\-—_•*~–=+\s]+$/.test(trimmed)) {
      continue;
    }

    // Normalize Unicode fancy fonts (e.g., 𝐑𝐀𝐓𝐄 -> RATE, 𝐏𝐑𝐈𝐂𝐄 -> PRICE)
    const normalized = trimmed.normalize('NFKD');

    // 1. Remove wholesale prices, rates, MRP lines
    const isPriceLine =
      /(?:price|rate|mrp|cost|wholesale\s*rate|reseller|fixed\s*price|fixed\s*rate|no\s*less|no\s*bargain)\b/i.test(normalized) ||
      /^[💰💵🏷️⚠️🚨➕💲\s*~`'\"-]*\s*(?:price|rate|mrp|inr|rs\.?|₹)\s*[:=-]?\s*[\d,]+/i.test(normalized) ||
      /(?:₹|rs\.?|inr)\s*[\d,]+\s*(?:\/-|\+|-|\bonly\b|\+?\s*ship)/i.test(normalized) ||
      /[\d,]+\s*(?:\/-\s*inr|\/-|\+ship)/i.test(normalized) ||
      /^(?:price|rate)\s*[:=-]/i.test(normalized) ||
      /^\s*[*_~`]?\s*(?:[a-zA-Z0-9_\s#.-]+[-–—:])?\s*₹?\s*\d{3,5}\s*(?:\/-|\+|-|\bonly\b)/i.test(normalized);

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

    // Standalone decorative emojis leftover
    const cleanedLine = trimmed.replace(/^[💰⚠️🚨🚚📸➕💲\s`*-]+$/, '').trim();
    if (cleanedLine) {
      cleanedLines.push(cleanedLine);
    }
  }

  while (cleanedLines.length > 0 && cleanedLines[0] === '') cleanedLines.shift();
  while (cleanedLines.length > 0 && cleanedLines[cleanedLines.length - 1] === '') cleanedLines.pop();

  return cleanedLines.join('\n');
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const collection = mongoose.connection.collection('products');

  const products = await collection.find({}).toArray();
  let fixedCount = 0;

  for (const p of products) {
    let rawDesc = (p.description || '').replace(/<br\s*\/?>/gi, '\n');
    const hasSupplierHeader = /📌\s*Original Supplier Specifications:?/gi.test(rawDesc);
    const hasProductDetails = /✨\s*Product Details & Specifications:?/gi.test(rawDesc);

    if (!hasSupplierHeader && !hasProductDetails) {
      continue;
    }

    rawDesc = rawDesc.replace(/📌\s*Original Supplier Specifications:?/gi, '✨ Product Details & Specifications:');

    let finalDesc = '';
    if (rawDesc.includes('✨ Product Details & Specifications:')) {
      const parts = rawDesc.split('✨ Product Details & Specifications:');
      const intro = parts[0].trim();
      const specs = cleanWhatsAppDescription(parts.slice(1).join('✨ Product Details & Specifications:'));
      finalDesc = specs ? `${intro}\n\n✨ Product Details & Specifications:\n${specs}` : intro;
    } else {
      finalDesc = cleanWhatsAppDescription(rawDesc);
    }

    const updateFields = {
      description: finalDesc,
      updatedAt: new Date(),
    };

    const idStr = p._id.toString();

    // Fix Product 6ae03396a203b4460eba1cb4 which was miscategorized as Silk Saree (it is Top-Bottom & Dupatta 3 Piece Suit)
    if (idStr === '6ae03396a203b4460eba1cb4') {
      updateFields.category = '3 Piece Suit';
      updateFields.name = 'Exclusive Handcrafted Chanderi Silk 3 Piece Suit (Top, Bottom & Dupatta) | Vastra Aura';
      updateFields.description = updateFields.description.replace(/this beautiful Silk Saree/gi, 'this beautiful Chanderi Silk 3 Piece Suit');
    }

    await collection.updateOne(
      { _id: p._id },
      { $set: updateFields }
    );
    fixedCount++;
    console.log(`✅ Cleaned & Updated product [${idStr}]: ${p.name}`);
  }

  console.log(`\n🎉 Total products processed: ${fixedCount}`);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});

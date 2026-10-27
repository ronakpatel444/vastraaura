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

    if (isPriceLine) continue;

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

    if (isCtaOrContactLine) continue;

    const cleanedLine = trimmed.replace(/^[💰⚠️🚨🚚📸\s]+$/, '').trim();
    if (cleanedLine) {
      cleanedLines.push(cleanedLine);
    }
  }

  while (cleanedLines.length > 0 && cleanedLines[0] === '') cleanedLines.shift();
  while (cleanedLines.length > 0 && cleanedLines[cleanedLines.length - 1] === '') cleanedLines.pop();

  return cleanedLines.join('\n');
}

async function fixProducts() {
  await mongoose.connect(process.env.MONGODB_URI);
  const collection = mongoose.connection.collection('products');

  const products = await collection.find({}).toArray();
  let updatedCount = 0;

  for (const p of products) {
    let rawDesc = (p.description || '').replace(/<br\s*\/?>/gi, '\n');
    const hasSupplierHeader = /📌\s*Original Supplier Specifications:?/gi.test(rawDesc);
    const hasProductDetails = /✨\s*Product Details & Specifications:?/gi.test(rawDesc);
    const hasPriceLine = /(?:rate|price)\s*[:=-]?\s*₹?\s*[\d,]+/i.test(rawDesc) ||
                         /\b\d{3,5}\s*(?:\/-|\+ship)/.test(rawDesc) ||
                         /shipping\s*:\s*extra/i.test(rawDesc) ||
                         /mentioned\s*on\s*photo/i.test(rawDesc);
    const hasDmLine = /dm\s*now\s*to\s*book/i.test(rawDesc);

    if (!hasSupplierHeader && !hasProductDetails && !hasPriceLine && !hasDmLine) {
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
    if (idStr === '6adf619f03b923ce2995813d') {
      updateFields.category = 'Kurta Sets';
      updateFields.name = 'Exclusive Handcrafted Vichitra Silk Floral Flared Frock | Vastra Aura';
      updateFields.description = updateFields.description.replace(/this beautiful Silk Saree/gi, 'this beautiful Vichitra Silk Floral Frock');
    }

    if (idStr === '6adf61dc03b923ce2995813f') {
      updateFields.price = p.price.replace(/[^\d]/g, '') || '1999';
      updateFields.originalPrice = (p.originalPrice || '').replace(/[^\d]/g, '') || '2999';
    }

    await collection.updateOne(
      { _id: p._id },
      { $set: updateFields }
    );
    updatedCount++;
    console.log(`✅ Cleaned & Updated product [${p._id}]: ${p.name}`);
  }

  console.log(`\n🎉 Total products updated and sanitized: ${updatedCount}`);
  process.exit(0);
}

fixProducts().catch(err => {
  console.error('Error fixing products:', err);
  process.exit(1);
});

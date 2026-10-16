const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Product Schema
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

// Category inference helper
function inferCategory(folderName, text = '') {
  const combined = `${folderName} ${text}`.toLowerCase();
  if (combined.includes('3 piece') || combined.includes('3 pis') || combined.includes('3pis') || combined.includes('3p') || combined.includes('suit')) {
    return '3 Piece Suit';
  }
  if (combined.includes('short kurti') || combined.includes('short') || combined.includes('dk-') || combined.includes('top')) {
    return 'Short Kurtis';
  }
  if (combined.includes('kurta') || combined.includes('kurti set')) {
    return 'Kurta Sets';
  }
  if (combined.includes('chaniya') || combined.includes('choli') || combined.includes('navratri') || combined.includes('kediya')) {
    return 'Chaniya Choli';
  }
  if (combined.includes('lehenga') || combined.includes('ghagra')) {
    return 'Lehenga';
  }
  if (combined.includes('saree') || combined.includes('sari') || combined.includes('patola') || combined.includes('silk saree')) {
    return 'Saree';
  }
  return '3 Piece Suit'; // Default popular wholesale catalog
}

// Generate SEO Title and Description
function generateSEO(category, folderName, fabric, parsedPrice) {
  const cleanName = folderName.replace(/[-_]/g, ' ').toUpperCase();
  
  let title = '';
  let description = '';
  let defaultPrice = parsedPrice || '1499';
  let originalPrice = (parseInt(defaultPrice, 10) + 1200).toString();

  switch (category) {
    case '3 Piece Suit':
      title = `Designer Embroidered ${fabric || 'Rayon Slub'} 3-Piece Suit (${cleanName}) | Kurti with Pant & Dupatta`;
      description = `Shop the latest ${cleanName} handcrafted 3-piece suit set from Vastra Aura, Surat. Made with premium ${fabric || 'Rayon Slub'} featuring intricate thread & cording embroidery work. Comes complete with heavy work top, matching tailored pant, and graceful designer dupatta. Ideal for festive events, family gatherings, and luxury ethnic fashion. Best wholesale direct price with Cash on Delivery & Worldwide Express Delivery.`;
      if (!parsedPrice) defaultPrice = '1499';
      break;

    case 'Short Kurtis':
      title = `Chic Printed Pure Cotton Short Kurti (${cleanName}) | Women's Daily & College Wear`;
      description = `Discover effortless style with the ${cleanName} pure breathable cotton short kurti by Vastra Aura Surat. Featuring high-grade vibrant print work, comfortable regular fit, and soft lightweight handfeel. Perfect pairing with jeans, palazzo, or trousers for daily, office, and college wear. High durability, colorfast dye, and fast COD delivery across India.`;
      if (!parsedPrice) defaultPrice = '599';
      break;

    case 'Kurta Sets':
      title = `Elegant Handcrafted ${fabric || 'Cotton Silk'} Kurta Set (${cleanName}) with Dupatta`;
      description = `Upgrade your ethnic wardrobe with ${cleanName} luxury Kurta Set from Surat's designer collection. Tailored from fine ${fabric || 'Cotton Silk'} with exquisite embroidery detailing and paired with matching bottom and designer dupatta. Available with Cash on Delivery and worldwide priority shipping.`;
      if (!parsedPrice) defaultPrice = '1399';
      break;

    case 'Chaniya Choli':
      title = `Exclusive Navratri Traditional Chaniya Choli (${cleanName}) | Authentic Mirror & Thread Work`;
      description = `Celebrate in pure authentic Gujarati heritage with the ${cleanName} festive Chaniya Choli from Vastra Aura Surat. Embellished with heavy Gamthi embroidery, real mirror work, and full flair flair kalidar skirt with matching blouse and dupatta. Unmatched Navratri fashion with guaranteed premium craftsmanship.`;
      if (!parsedPrice) defaultPrice = '2499';
      break;

    case 'Lehenga':
      title = `Bridal & Festive Semi-Stitched Designer Lehenga Choli (${cleanName})`;
      description = `Stun every occasion with this magnificent ${cleanName} designer lehenga choli set from Surat. Features premium fabric, royal border embroidery, zari embellishments, and full matching dupatta. Custom tailored appeal with fast insured global shipping.`;
      if (!parsedPrice) defaultPrice = '3499';
      break;

    case 'Saree':
      title = `Pure Traditional Heritage Designer Saree (${cleanName}) with Blouse Piece`;
      description = `Drape pure elegance with the ${cleanName} luxury saree from Vastra Aura Surat. Crafted in premium soft silk weave with rich pallu design and matching unstitched blouse. Ideal for weddings, puja, and festive occasions.`;
      if (!parsedPrice) defaultPrice = '1299';
      break;

    default:
      title = `Handcrafted Designer Ethnic Wear - ${cleanName} | Vastra Aura Surat`;
      description = `Exclusive designer collection item ${cleanName} from Vastra Aura. Premium textile fabric, artisanal craftsmanship, and unbeatable wholesale pricing directly from Surat fashion house.`;
      if (!parsedPrice) defaultPrice = '1499';
      break;
  }

  originalPrice = (parseInt(defaultPrice, 10) + 1200).toString();

  return { title, description, price: defaultPrice, originalPrice };
}

async function bulkImport() {
  try {
    console.log('🚀 Connecting to MongoDB Database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB!\n');

    // Source folder: can pass as CLI arg or default to incoming-catalogs
    const sourceDir = process.argv[2] 
      ? path.resolve(process.argv[2]) 
      : path.join(__dirname, 'incoming-catalogs');

    if (!fs.existsSync(sourceDir)) {
      fs.mkdirSync(sourceDir, { recursive: true });
      console.log(`📁 Created folder: ${sourceDir}`);
      console.log(`💡 Drop your catalog folders (e.g. Catalog-1, Catalog-2...) inside "${sourceDir}" and re-run this script!`);
      process.exit(0);
    }

    const folders = fs.readdirSync(sourceDir).filter(f => {
      const fullPath = path.join(sourceDir, f);
      return fs.statSync(fullPath).isDirectory();
    });

    if (folders.length === 0) {
      console.log(`⚠️ No catalog folders found inside: ${sourceDir}`);
      console.log(`💡 Put your 17 catalog folders inside "${sourceDir}" (or run: node bulk-catalog-import.js "D:\\Your\\Path")`);
      process.exit(0);
    }

    console.log(`📦 Found ${folders.length} catalogs to import! Starting fast automated listing with SEO...\n`);
    const startTime = Date.now();
    let importedCount = 0;

    for (let i = 0; i < folders.length; i++) {
      const folder = folders[i];
      const folderPath = path.join(sourceDir, folder);

      // Find all image files
      const imageFiles = fs.readdirSync(folderPath).filter(f => 
        /\.(jpg|jpeg|png|webp)$/i.test(f)
      );

      // Sort images: 1.jpg, 2.jpg...
      imageFiles.sort((a, b) => {
        const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
        const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
        return numA - numB;
      });

      if (imageFiles.length === 0) {
        console.log(`[${i + 1}/${folders.length}] ⚠️ Skipping "${folder}": No images found.`);
        continue;
      }

      // Check for optional details.txt or text info
      let customText = '';
      let parsedPrice = null;
      let parsedFabric = null;

      const txtFiles = fs.readdirSync(folderPath).filter(f => /\.(txt)$/i.test(f));
      if (txtFiles.length > 0) {
        customText = fs.readFileSync(path.join(folderPath, txtFiles[0]), 'utf-8');
        const priceMatch = customText.match(/(?:₹|rs\.?|rate:?|price:?)?\s*(\d{3,5})/i);
        if (priceMatch) parsedPrice = priceMatch[1];
        const fabricMatch = customText.match(/fabric:?\s*([a-zA-Z\s]+)/i);
        if (fabricMatch) parsedFabric = fabricMatch[1].trim();
      }

      const category = inferCategory(folder, customText);
      const fabric = parsedFabric || (category === 'Short Kurtis' ? 'Pure Cotton' : category === '3 Piece Suit' ? 'Rayon Slub with Embroidery' : 'Premium Silk');
      const { title, description, price, originalPrice } = generateSEO(category, folder, fabric, parsedPrice);

      // Copy images to public/images/products/<categorySlug>/<folder>/
      const categorySlug = category.toLowerCase().replace(/\s+/g, '-');
      const destDir = path.join(__dirname, 'public', 'images', 'products', categorySlug, folder);
      fs.mkdirSync(destDir, { recursive: true });

      const publicImageUrls = [];
      for (const img of imageFiles) {
        const srcImg = path.join(folderPath, img);
        const destImg = path.join(destDir, img);
        fs.copyFileSync(srcImg, destImg);
        publicImageUrls.push(`/images/products/${categorySlug}/${folder}/${img}`);
      }

      // Check if product already exists to avoid duplicates
      const existing = await Product.findOne({
        $or: [
          { name: title },
          { image: publicImageUrls[0] }
        ]
      });

      if (existing) {
        console.log(`[${i + 1}/${folders.length}] ℹ️ Catalog "${folder}" already exists in DB. Updated images.`);
        existing.images = publicImageUrls;
        existing.category = category;
        await existing.save();
        importedCount++;
        continue;
      }

      // Create Product in MongoDB
      const newProduct = new Product({
        name: title,
        price: price,
        originalPrice: originalPrice,
        allowCOD: true,
        category: category,
        status: 'Active',
        image: publicImageUrls[0],
        images: publicImageUrls,
        fabric: fabric,
        description: description,
        sizes: [
          { name: 'S', stock: 5 },
          { name: 'M', stock: 5 },
          { name: 'L', stock: 5 },
          { name: 'XL', stock: 5 },
          { name: 'XXL', stock: 5 },
        ],
        isPlatformShipping: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      await newProduct.save();
      importedCount++;
      console.log(`[${i + 1}/${folders.length}] ✅ Listed: "${title}" | Category: ${category} | Price: ₹${price} | Images: ${publicImageUrls.length}`);
    }

    const durationSeconds = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\n======================================================`);
    console.log(`🎉 SUCCESS! Listed ${importedCount} Catalogs in ${durationSeconds} seconds with complete SEO!`);
    console.log(`🌐 All products are now LIVE on the website!`);
    console.log(`======================================================\n`);

  } catch (error) {
    console.error('❌ Error in bulk import:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

bulkImport();

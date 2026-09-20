import * as cheerio from 'cheerio';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

// Define the Product schema (simplified for the script)
const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: String, required: true },
    originalPrice: { type: String },
    allowCOD: { type: Boolean, default: true },
    category: { type: String, required: true },
    status: { type: String, required: true, default: 'Active' },
    image: { type: String, required: true },
    images: { type: [String], default: [] },
    description: { type: String },
    originalSellerLink: { type: String },
    colors: { type: [String], default: [] },
    colorDetails: {
      type: [
        {
          name: { type: String },
          image: { type: String },
        }
      ],
      default: []
    },
    sizes: {
      type: [
        {
          name: { type: String },
          stock: { type: Number, default: 0 },
        }
      ],
      default: []
    },
  },
  { timestamps: true }
);

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function scrapeAndSaveProduct(url: string, category: string = 'Gowns') {
  if (!process.env.MONGODB_URI) {
    console.error("❌ MONGODB_URI is not set in .env.local");
    return;
  }

  try {
    // Clean URL
    url = url.split('?')[0];
    console.log(`🔍 Fetching data from: ${url}`);
    
    let title = '';
    let price = '1499';
    let originalPrice = ''; // We will capture this from the site
    let images: string[] = [];
    let description = '';
    let colors: string[] = ['Multi']; // Default
    let colorDetails: {name: string, image: string}[] = [];
    let sizes: { name: string, stock: number }[] = [];

    // THE SECRET TECHNIQUE: Try Shopify JSON endpoint first!
    const jsonUrl = url + '.js';
    try {
      console.log(`🕵️‍♂️ Trying Shopify API technique...`);
      const res = await fetch(jsonUrl);
      if (res.ok) {
        const productJson = await res.json();
        title = productJson.title || title;
        if (productJson.price) {
          price = (productJson.price / 100).toString();
        }
        if (productJson.compare_at_price) {
          originalPrice = (productJson.compare_at_price / 100).toString();
        }
        if (productJson.images && Array.isArray(productJson.images)) {
          images = productJson.images.map((img: string) => {
            return img.startsWith('//') ? 'https:' + img : img;
          });
        }
        description = productJson.description || '';

        // Extract Color and Color Images
        if (productJson.options) {
          const colorOption = productJson.options.find((opt: any) => opt.name.toLowerCase().includes('color') || opt.name.toLowerCase().includes('colour'));
          if (colorOption && colorOption.values.length > 0) {
            colors = colorOption.values;
            
            // Map colors to their featured variant image
            if (productJson.variants && Array.isArray(productJson.variants)) {
              // Find the position of the color option (e.g. option1, option2)
              const colorOptionIndex = productJson.options.findIndex((opt: any) => opt.name.toLowerCase().includes('color') || opt.name.toLowerCase().includes('colour')) + 1;
              const optionKey = `option${colorOptionIndex}`;
              
              colors.forEach(colorName => {
                const variant = productJson.variants.find((v: any) => v[optionKey] === colorName);
                if (variant && variant.featured_image && variant.featured_image.src) {
                  let img = variant.featured_image.src;
                  img = img.startsWith('//') ? 'https:' + img : img;
                  colorDetails.push({ name: colorName, image: img });
                }
              });
            }
          } else {
             // Try to extract from title if options don't exist
             const titleLower = title.toLowerCase();
             if (titleLower.includes('purple')) colors = ['Purple'];
             else if (titleLower.includes('red')) colors = ['Red'];
             else if (titleLower.includes('blue')) colors = ['Blue'];
             else if (titleLower.includes('green')) colors = ['Green'];
             else if (titleLower.includes('black')) colors = ['Black'];
          }
          // Extract Sizes
          if (productJson.options) {
            const sizeOption = productJson.options.find((opt: any) => opt.name.toLowerCase().includes('size'));
            if (sizeOption && sizeOption.values.length > 0) {
              sizes = sizeOption.values.map((val: string) => ({ name: val, stock: 10 })); // Default stock 10
            }
          }
        }
        
        console.log("✅ Successfully extracted using Shopify API!");
      }
    } catch (err) {
      console.log("⚠️ Shopify API failed, falling back to HTML scraping...");
    }

    // If Shopify JSON failed or didn't get images, fallback to HTML scraping
    if (images.length === 0) {
      const response = await fetch(url);
      const html = await response.text();
      const $ = cheerio.load(html);

      title = title || $('h1').first().text().trim() || $('meta[property="og:title"]').attr('content') || 'Unknown Product';
      
      let priceText = $('.price-item--regular').first().text().trim() || 
                      $('.price').first().text().trim() || 
                      $('meta[property="product:price:amount"]').attr('content') || 
                      '999';
      let extractedPrice = priceText.replace(/[^\d.]/g, '');
      if (extractedPrice) price = extractedPrice;

      let originalPriceText = $('.price-item--regular s').first().text().trim() || 
                              $('.compare-at-price').first().text().trim() || '';
      let extractedOriginalPrice = originalPriceText.replace(/[^\d.]/g, '');
      if (extractedOriginalPrice) originalPrice = extractedOriginalPrice;

      $('script[type="application/ld+json"]').each((i, el) => {
        try {
          const json = JSON.parse($(el).html() || '{}');
          if (json['@type'] === 'Product' && json.image) {
            if (Array.isArray(json.image)) images.push(...json.image);
            else if (typeof json.image === 'string') images.push(json.image);
          }
        } catch (e) {}
      });

      if (images.length === 0) {
        const regex = /"(https:\/\/cdn\.shopify\.com\/s\/files\/[^\"]+?\.(?:jpg|jpeg|png|webp)[^\"]*?)"/g;
        let match;
        while ((match = regex.exec(html)) !== null) {
          let fullUrl = match[1].replace(/_\d+x\d+(\.[a-z]+)(\?v=\d+)?$/i, '$1$2');
          if (!images.includes(fullUrl) && !fullUrl.includes('logo')) images.push(fullUrl);
        }
      }

      $('img').each((i, el) => {
        const src = $(el).attr('src') || $(el).attr('data-src');
        if (src && (src.includes('products') || src.includes('cdn.shopify.com'))) {
          let fullUrl = src.startsWith('//') ? 'https:' + src : src;
          fullUrl = fullUrl.replace(/_\d+x\d+(\.[a-z]+)$/i, '$1');
          if (!images.includes(fullUrl)) images.push(fullUrl);
        }
      });

      description = description || $('.product__description').html() || $('meta[property="og:description"]').attr('content') || '';
    }

    // Clean up images
    images = images.map(img => {
       if (img.startsWith('//')) return 'https:' + img;
       return img.split('?')[0]; // Remove query params like ?v=123
    });
    images = [...new Set(images)]; // unique

    const mainImage = images.length > 0 ? images[0] : '';
    const otherImages = images.slice(1); // take all extra images

    // Calculate the 1.5x prices
    const parsedPrice = parseFloat(price) || 999;
    const finalPrice = Math.round(parsedPrice * 1.5).toString();
    
    let finalOriginalPrice;
    if (originalPrice && parseFloat(originalPrice) > parsedPrice) {
      finalOriginalPrice = Math.round(parseFloat(originalPrice) * 1.5).toString();
    } else {
      if (sizes.length === 0) {
        sizes = [
          { name: 'XS', stock: 10 },
          { name: 'S', stock: 10 },
          { name: 'M', stock: 10 },
          { name: 'L', stock: 10 },
          { name: 'XL', stock: 10 },
          { name: 'XXL', stock: 10 },
        ];
      }
      // If there's no original price on the site, just make one up that is higher than the new final price
      finalOriginalPrice = (Math.round(parsedPrice * 1.5) + 500).toString();
    }

    console.log('✅ Extracted Data:');
    console.log('- Title:', title);
    console.log('- Original Site Price: ₹', price, '-> New Price: ₹', finalPrice);
    console.log('- Original Site Compare Price: ₹', originalPrice || 'None', '-> New Compare Price: ₹', finalOriginalPrice);
    console.log('- Colors:', colors.join(', '));
    console.log('- Main Image:', mainImage);
    console.log(`- Extra Images: ${otherImages.length} found!`);
    if (otherImages.length > 0) {
       console.log('  URLs:', otherImages.slice(0, 3).join(', ') + (otherImages.length > 3 ? '...' : ''));
    }

    if (!mainImage) {
      console.error("❌ Could not find any images. Aborting.");
      return;
    }

    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB.');

    // Save to DB
    const newProduct = new Product({
      name: title,
      price: finalPrice,
      originalPrice: finalOriginalPrice,
      category: category,
      image: mainImage,
      images: otherImages,
      description: description,
      colors: colors,
      // Pass colorDetails to DB if it's available (needs to be scoped globally in the function)
      colorDetails: (typeof colorDetails !== 'undefined' ? colorDetails : []),
      sizes: sizes,
      allowCOD: true,
      status: 'Active',
      originalSellerLink: url
    });

    await newProduct.save();
    console.log('🎉 Product successfully saved to database!');

  } catch (error) {
    console.error('❌ Error scraping product:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 MongoDB disconnected.');
  }
}

const url = process.argv[2];
const category = process.argv[3] || 'Gowns'; 

if (!url) {
  console.log('Usage: npx ts-node scrape-product.ts <URL> [Category]');
  process.exit(1);
}

scrapeAndSaveProduct(url, category);

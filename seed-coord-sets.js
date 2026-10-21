const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function seedCoordSets() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const baseDir = path.join(__dirname, 'public', 'images', 'Coord set - 2 piece');
    const folders = fs.readdirSync(baseDir).filter(f => fs.statSync(path.join(baseDir, f)).isDirectory());

    console.log(`Found ${folders.length} folders...`);

    const products = [];

    for (const folder of folders) {
      const folderPath = path.join(baseDir, folder);
      const files = fs.readdirSync(folderPath).filter(f => /\.(png|jpg|jpeg|webp)$/i.test(f));

      // Sort files naturally
      files.sort((a, b) => {
        // prioritize main image without underscore or numbering like D104.png or 1.png
        const aNum = parseInt(a.replace(/\D/g, '')) || 0;
        const bNum = parseInt(b.replace(/\D/g, '')) || 0;
        if (aNum === bNum) {
          return a.localeCompare(b);
        }
        return aNum - bNum;
      });

      if (files.length === 0) {
        console.log(`No images found in ${folder}, skipping...`);
        continue;
      }

      const imageUrls = files.map(file => encodeURI(`/images/Coord set - 2 piece/${folder}/${file}`));
      const mainImage = imageUrls[0];

      const product = {
        name: `Designer Printed 2-Piece Coord Set - ${folder}`,
        price: "999",
        originalPrice: "2199",
        allowCOD: true,
        category: "Coord Sets",
        status: "Active",
        image: mainImage,
        images: imageUrls,
        fabric: "Premium Cotton Rayon Blend",
        description: "Chic and modern 2-piece printed coord set featuring an elegant designer top with matching tailored trouser pant. Designed with breathable, ultra-soft fabric offering all-day comfort and effortless styling. Perfect for casual wear, office chic, travel, and day outs.",
        colors: [],
        colorDetails: [],
        sizes: [
          { name: "XS", stock: 5 },
          { name: "S", stock: 5 },
          { name: "M", stock: 5 },
          { name: "L", stock: 5 },
          { name: "XL", stock: 5 },
          { name: "XXL", stock: 5 }
        ],
        isPlatformShipping: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      products.push(product);
    }

    if (products.length > 0) {
      // Remove any previously seeded coord set products to prevent duplicates if re-run
      await db.collection('products').deleteMany({ category: { $in: ["Coord Sets", "Coord Set"] } });
      const result = await db.collection('products').insertMany(products);
      console.log(`Successfully inserted ${result.insertedCount} coord set products!`);
    } else {
      console.log("No products to insert.");
    }

  } catch (error) {
    console.error('Error seeding coord sets:', error);
  } finally {
    process.exit(0);
  }
}

seedCoordSets();

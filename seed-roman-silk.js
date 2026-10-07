const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({path: '.env.local'});

async function seedRomanSilkSuits() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const baseDir = path.join(__dirname, 'public', 'images', '3Pis Roman Silk');
    const folders = fs.readdirSync(baseDir).filter(f => fs.statSync(path.join(baseDir, f)).isDirectory());

    console.log(`Found ${folders.length} folders...`);

    const products = [];

    for (const folder of folders) {
      const folderPath = path.join(baseDir, folder);
      const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.webp'));
      
      // Sort files
      files.sort((a, b) => {
        const numA = parseInt(a.split('.')[0]) || 0;
        const numB = parseInt(b.split('.')[0]) || 0;
        return numA - numB;
      });

      if (files.length === 0) {
        console.log(`No images found in ${folder}, skipping...`);
        continue;
      }

      const imageUrls = files.map(file => `/images/3Pis Roman Silk/${folder}/${file}`);
      const mainImage = imageUrls[0];

      const product = {
        name: "Premium Roman Silk 3-Piece Suit",
        price: "1799",
        originalPrice: "3599",
        allowCOD: true,
        category: "3 Piece Suit",
        status: "Active",
        image: mainImage,
        images: imageUrls,
        fabric: "Roman Silk with Cording Embroidery",
        description: "Exquisite Roman Silk 3-piece suit featuring beautiful cording embroidery design. Perfect for weddings, festive occasions, and parties. Comes complete with top, bottom, and dupatta for a royal look.",
        colors: [],
        colorDetails: [],
        sizes: [
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
      await db.collection('products').insertMany(products);
      console.log(`Successfully inserted ${products.length} products!`);
    } else {
      console.log("No products to insert.");
    }

  } catch (error) {
    console.error('Error seeding products:', error);
  } finally {
    process.exit(0);
  }
}

seedRomanSilkSuits();

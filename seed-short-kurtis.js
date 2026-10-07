const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({path: '.env.local'});

async function seedShortKurtis() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const baseDir = path.join(__dirname, 'public', 'images', 'Short Kurti');
    const folders = fs.readdirSync(baseDir).filter(f => fs.statSync(path.join(baseDir, f)).isDirectory());

    console.log(`Found ${folders.length} folders...`);

    const products = [];

    for (const folder of folders) {
      const folderPath = path.join(baseDir, folder);
      const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg'));
      
      // Sort files so that 1.png comes before 2.png
      files.sort((a, b) => {
        const numA = parseInt(a.split('.')[0]) || 0;
        const numB = parseInt(b.split('.')[0]) || 0;
        return numA - numB;
      });

      if (files.length === 0) {
        console.log(`No images found in ${folder}, skipping...`);
        continue;
      }

      const imageUrls = files.map(file => `/images/Short Kurti/${folder}/${file}`);
      const mainImage = imageUrls[0];

      const product = {
        name: `Beautiful Print Work Short Kurti - ${folder}`,
        price: "599",
        originalPrice: "1299",
        allowCOD: true,
        category: "Short Kurtis",
        status: "Active",
        image: mainImage,
        images: imageUrls,
        fabric: "Cotton with Print Work",
        description: "Elegant and comfortable cotton short kurti with beautiful print work. Perfect for daily wear and casual outings. Pair it with jeans or leggings for a perfect modern look.",
        colors: [],
        colorDetails: [],
        sizes: [
          { name: "S", stock: 5 },
          { name: "M", stock: 5 },
          { name: "L", stock: 5 },
          { name: "XL", stock: 5 },
          { name: "XXL", stock: 5 }
        ],
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

seedShortKurtis();

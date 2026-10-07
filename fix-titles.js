const mongoose = require('mongoose');
require('dotenv').config({path: '.env.local'});

async function updateTitles() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const products = await db.collection('products').find({ category: 'Short Kurtis' }).toArray();
    
    let count = 0;
    for (const p of products) {
      if (p.name.includes(' - DK-')) {
        const newName = p.name.split(' - DK-')[0]; // Remove ' - DK-201' etc.
        await db.collection('products').updateOne({ _id: p._id }, { $set: { name: newName } });
        count++;
      }
    }
    
    console.log(`Updated ${count} products.`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

updateTitles();

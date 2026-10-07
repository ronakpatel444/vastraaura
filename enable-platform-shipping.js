const mongoose = require('mongoose');
require('dotenv').config({path: '.env.local'});

async function enablePlatformShipping() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const result = await db.collection('products').updateMany(
      { category: { $in: ['Short Kurtis', '3 Piece Suit'] } },
      { $set: { isPlatformShipping: true } }
    );
    
    console.log(`Updated ${result.modifiedCount} products to use Platform Shipping.`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

enablePlatformShipping();

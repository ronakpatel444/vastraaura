const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function seedDiwaliCoupons() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    
    await db.collection('coupons').updateOne(
      { code: 'DIWALI20' },
      { 
        $set: { code: 'DIWALI20', discountPercent: 20, applicableProductIds: [], isActive: true, updatedAt: new Date() }, 
        $setOnInsert: { createdAt: new Date() } 
      },
      { upsert: true }
    );
    
    await db.collection('coupons').updateOne(
      { code: 'DIWALI15' },
      { 
        $set: { code: 'DIWALI15', discountPercent: 15, applicableProductIds: [], isActive: true, updatedAt: new Date() }, 
        $setOnInsert: { createdAt: new Date() } 
      },
      { upsert: true }
    );
    
    console.log('Successfully upserted DIWALI20 and DIWALI15 coupons!');
  } catch (error) {
    console.error('Error seeding coupons:', error);
  } finally {
    process.exit(0);
  }
}

seedDiwaliCoupons();

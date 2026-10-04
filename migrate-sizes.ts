import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function migrateSizes() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log('Connected');
  
  const db = mongoose.connection.db;
  if (!db) return;
  
  const products = await db.collection('products').find({ sizes: { $exists: false } }).toArray();
  let count = 0;
  
  for (const p of products) {
    const sizes = [];
    if (p.stockBySize) {
       for (const key of ['XS', 'S', 'M', 'L', 'XL', 'XXL']) {
         sizes.push({ name: key, stock: p.stockBySize[key] || 10 });
       }
    } else {
       sizes.push({ name: 'Free Size', stock: 10 });
    }
    
    await db.collection('products').updateOne({ _id: p._id }, { $set: { sizes: sizes } });
    count++;
  }
  
  console.log(`Migrated ${count} products`);
  await mongoose.disconnect();
}

migrateSizes();

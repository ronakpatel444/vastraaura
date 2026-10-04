import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function fixCategory() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log('Connected');
  
  const db = mongoose.connection.db;
  if (!db) {
    console.error("DB connection not established");
    return;
  }
  
  const res = await db.collection('products').updateMany(
    { category: 'Kids' },
    { $set: { category: 'Kids Wear' } }
  );
  
  console.log(`Updated ${res.modifiedCount} products`);
  await mongoose.disconnect();
}

fixCategory();

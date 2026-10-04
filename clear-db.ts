import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function clearDB() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log('Connected');
  
  const db = mongoose.connection.db;
  if (!db) return;
  
  await db.collection('products').drop();
  console.log(`Deleted all products from database!`);
  
  await mongoose.disconnect();
}

clearDB();

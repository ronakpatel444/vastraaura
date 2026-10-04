import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function check() {
  await mongoose.connect(process.env.MONGODB_URI as string);
  const db = mongoose.connection.db;
  if (!db) return;
  const res = await db.collection('products').findOne({name: /Kediya/i});
  console.log(JSON.stringify(res, null, 2));
  await mongoose.disconnect();
}
check();

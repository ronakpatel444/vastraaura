require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function test() {
  const client = await MongoClient.connect(process.env.MONGODB_URI);
  const db = client.db();
  const products = await db.collection('products').find({ category: /Combo/i }).limit(1).toArray();
  console.log(products);
  client.close();
}
test();

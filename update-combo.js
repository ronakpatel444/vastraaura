require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function update() {
  const client = await MongoClient.connect(process.env.MONGODB_URI);
  const db = client.db();
  const result = await db.collection('products').updateMany(
    { category: 'Combo' },
    { $set: { price: '1999', originalPrice: '2999' } }
  );
  console.log('Updated:', result.modifiedCount);
  client.close();
}
update();

require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

async function updateSizes() {
  const client = await MongoClient.connect(process.env.MONGODB_URI);
  const db = client.db();
  
  const result = await db.collection('products').updateMany(
    { category: 'Combo' },
    { $set: { sizes: [{ name: 'Free Size', stock: 10 }] } }
  );
  
  console.log('Updated sizes for Combo products:', result.modifiedCount);
  client.close();
}
updateSizes();

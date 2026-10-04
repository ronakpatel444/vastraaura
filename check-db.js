const mongoose = require('mongoose');
require('dotenv').config({path: '.env.local'});
async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const products = await db.collection('products').find().sort({createdAt: -1}).limit(2).toArray();
  console.log(JSON.stringify(products, null, 2));
  process.exit(0);
}
run();

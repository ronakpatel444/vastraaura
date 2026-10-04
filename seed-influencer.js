const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({path: '.env.local'});

async function seedInfluencer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    
    // Check if dummy influencer already exists
    const existing = await db.collection('users').findOne({ email: 'influencer@vastraaura.com' });
    if (existing) {
      console.log('Dummy influencer already exists. Email: influencer@vastraaura.com, Password: password123');
      process.exit(0);
    }
    
    const passwordHash = await bcrypt.hash('password123', 10);
    
    const newInfluencer = {
      name: 'Riya Fashion Vlogs',
      email: 'influencer@vastraaura.com',
      passwordHash: passwordHash,
      role: 'INFLUENCER',
      status: 'active',
      phoneNumber: '9876543210',
      socialLinks: {
        instagram: '@riyafashion',
        youtube: 'https://youtube.com/c/riyafashion',
      },
      followerCount: '100k-500k',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.collection('users').insertOne(newInfluencer);
    console.log('Dummy influencer created successfully!');
    console.log('Login Email: influencer@vastraaura.com');
    console.log('Login Password: password123');
    
  } catch (error) {
    console.error('Error seeding influencer:', error);
  } finally {
    process.exit(0);
  }
}

seedInfluencer();

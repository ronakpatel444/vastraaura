const mongoose = require('mongoose');
require('dotenv').config({path: '.env.local'});

async function seedOrders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    
    const existingOrders = await db.collection('orders').countDocuments();
    if (existingOrders > 0) {
      console.log('Orders already exist in DB. Skipping seed.');
      process.exit(0);
    }
    
    const dummyOrders = [
      {
        customer: { email: 'rahul@example.com', firstName: 'Rahul', lastName: 'Desai', phone: '9876543210' },
        shippingAddress: { address: '123 Main St', city: 'Surat', state: 'Gujarat', pincode: '395003' },
        items: [
          { productId: 'P001', name: 'Designer Lehenga', price: '₹4,999', image: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', quantity: 1, size: 'M' }
        ],
        subtotal: 4999,
        shippingFee: 0,
        totalAmount: 4999,
        paymentMethod: 'COD',
        status: 'Delivered',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
      },
      {
        customer: { email: 'anjali@example.com', firstName: 'Anjali', lastName: 'Patel', phone: '9876543211' },
        shippingAddress: { address: '45 Park Ave', city: 'Ahmedabad', state: 'Gujarat', pincode: '380015' },
        items: [
          { productId: 'P002', name: 'Navratri Special Chaniya Choli', price: '₹2,999', image: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', quantity: 2, size: 'L' }
        ],
        subtotal: 5998,
        discount: 2999, // Combo offer
        shippingFee: 0,
        totalAmount: 2999,
        paymentMethod: 'Online',
        status: 'Paid',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        customer: { email: 'mehul@example.com', firstName: 'Mehul', lastName: 'Shah', phone: '9876543212' },
        shippingAddress: { address: 'Lake View Apt', city: 'Rajkot', state: 'Gujarat', pincode: '360001' },
        items: [
          { productId: 'P003', name: 'Kids Kurta Set', price: '₹1,299', image: 'https://res.cloudinary.com/demo/image/upload/sample.jpg', quantity: 1, size: 'S' }
        ],
        subtotal: 1299,
        shippingFee: 0,
        totalAmount: 1299,
        paymentMethod: 'COD',
        status: 'Pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];
    
    await db.collection('orders').insertMany(dummyOrders);
    console.log('Dummy orders created successfully!');
    
  } catch (error) {
    console.error('Error seeding orders:', error);
  } finally {
    process.exit(0);
  }
}

seedOrders();

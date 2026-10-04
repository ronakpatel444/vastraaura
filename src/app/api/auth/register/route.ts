import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User, { UserRole } from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { email, password, name, phone, role = UserRole.CUSTOMER } = data;

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user object
    const userData: any = {
      name,
      email,
      passwordHash,
      phone,
      role,
      status: role === UserRole.SELLER ? 'pending' : 'active', // Sellers need admin approval
    };

    // If it's a seller, append business details
    if (role === UserRole.SELLER) {
      userData.businessName = data.businessName;
      userData.panCardNumber = data.panCardNumber;
      userData.gstNumber = data.gstNumber;
      userData.hasOfflineShop = data.hasOfflineShop === 'yes';
      userData.sellingCategories = data.sellingCategories;
      userData.pickupAddress = data.pickupAddress;
    }

    const newUser = await User.create(userData);

    return NextResponse.json({ 
      success: true, 
      message: role === UserRole.SELLER 
        ? 'Application submitted! Please wait for Admin approval.' 
        : 'Account created successfully!' 
    });
    
  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Failed to register account' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { encrypt } from '@/lib/auth';
import { UserRole } from '@/models/User';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // HARDCODED TEST ACCOUNTS FOR DEVELOPMENT
    if (email === 'seller@vastraaura.com' && password === 'seller123') {
      const token = await encrypt({
        userId: 'test_seller_123',
        role: UserRole.SELLER,
        email: email,
      });

      const response = NextResponse.json({ success: true, redirectUrl: '/seller' });
      response.cookies.set({
        name: 'session',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
      return response;
    }
    
    if (email === 'influencer@vastraaura.com' && password === 'influencer123') {
      const token = await encrypt({
        userId: 'test_influencer_123',
        role: UserRole.INFLUENCER,
        email: email,
      });

      const response = NextResponse.json({ success: true, redirectUrl: '/influencer' });
      response.cookies.set({
        name: 'session',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
      return response;
    }

    // Real DB Check (For Production)
    await connectToDatabase();
    const user = await User.findOne({ email });
    
    if (user && bcrypt.compareSync(password, user.passwordHash)) {
      if (user.status !== 'active') {
        return NextResponse.json({ error: 'Account pending approval or suspended.' }, { status: 403 });
      }

      if (user.role === UserRole.SELLER) {
        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        await user.save();

        // Dynamically import sendOTPEmail here to avoid circular dependencies in route
        const { sendOTPEmail } = await import('@/lib/email');
        await sendOTPEmail(user.email, user.name, otp);

        return NextResponse.json({ 
          success: true, 
          requireOtp: true,
          message: 'OTP sent to your email.'
        });
      }

      const token = await encrypt({
        userId: user._id.toString(),
        role: user.role,
        email: user.email,
      });

      let redirectUrl = '/account';
      if (user.role === UserRole.ADMIN) redirectUrl = '/admin';
      if (user.role === UserRole.SELLER) redirectUrl = '/seller';
      if (user.role === UserRole.INFLUENCER) redirectUrl = '/influencer';

      const response = NextResponse.json({ success: true, redirectUrl });
      response.cookies.set({
        name: 'session',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
      return response;
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}

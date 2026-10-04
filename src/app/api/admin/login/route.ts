import { NextResponse } from 'next/server';
import { encrypt } from '@/lib/auth';
import { UserRole } from '@/models/User';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    // Preserve legacy hardcoded login if DB doesn't have an admin yet
    const validUsername = process.env.ADMIN_USERNAME || 'vandu';
    const validPassword = process.env.ADMIN_PASSWORD || 'vandu2122';

    let isAuthenticated = false;
    let sessionPayload = null;

    if (username === validUsername && password === validPassword) {
      isAuthenticated = true;
      sessionPayload = {
        userId: 'admin_legacy',
        role: UserRole.ADMIN,
        email: username,
      };
    } else {
      // Check the new database User collection
      await connectToDatabase();
      const user = await User.findOne({ email: username, role: UserRole.ADMIN });
      if (user && bcrypt.compareSync(password, user.passwordHash)) {
        isAuthenticated = true;
        sessionPayload = {
          userId: user._id.toString(),
          role: user.role,
          email: user.email,
        };
      }
    }

    if (isAuthenticated && sessionPayload) {
      const response = NextResponse.json({ success: true });
      
      // Legacy cookie
      response.cookies.set({
        name: 'admin_auth_token',
        value: 'authenticated',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });

      // New JWT session cookie
      const token = await encrypt(sessionPayload);
      response.cookies.set({
        name: 'session',
        value: token,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });

      return response;
    }

    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}

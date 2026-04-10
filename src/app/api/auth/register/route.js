// src/app/api/auth/register/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db/mongoose';
import User from '@/lib/models/User';
import { signToken } from '@/lib/utils/jwt';

export async function POST(request) {
  try {
    await connectDB();
    const { name, email, password, role } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email and password are required' }, { status: 400 });
    }
    if (!['employer', 'candidate'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role. Must be employer or candidate' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const user = await User.create({ name, email: email.toLowerCase(), password, role });
    const token = signToken({ id: user._id.toString(), email: user.email, role: user.role, name: user.name });

    const response = NextResponse.json({
      success: true,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
      token,
    }, { status: 201 });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';

const FLASK_API_BASE = process.env.NEXT_PUBLIC_FLASK_API_BASE || 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { email, otp_code } = body;

    if (!email || !otp_code) {
      return NextResponse.json(
        { error: 'Email and OTP code are required' },
        { status: 400 }
      );
    }

    // Forward to Flask backend
    const response = await fetch(`${FLASK_API_BASE}/api/auth/verify-email-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        otp_code: otp_code.trim(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Failed to verify email' },
        { status: response.status }
      );
    }

    // Create response with tokens
    const result = NextResponse.json(data, { status: 200 });

    // Store access token in httpOnly cookie
    if (data.access_token) {
      result.cookies.set('auth_access_token', data.access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 900, // 15 minutes
        path: '/',
      });
    }

    // Store refresh token in httpOnly cookie
    if (data.refresh_token) {
      result.cookies.set('auth_refresh_token', data.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });
    }

    return result;
  } catch (error) {
    console.error('[v0] Email verification error:', error);
    return NextResponse.json(
      { error: 'An error occurred during verification' },
      { status: 500 }
    );
  }
}

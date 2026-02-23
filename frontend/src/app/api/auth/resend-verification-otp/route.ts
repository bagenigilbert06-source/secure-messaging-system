import { NextRequest, NextResponse } from 'next/server';

const FLASK_API_BASE = process.env.NEXT_PUBLIC_FLASK_API_BASE || 'http://localhost:5000';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Forward to Flask backend
    const response = await fetch(`${FLASK_API_BASE}/api/auth/resend-verification-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Failed to resend OTP' },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('[v0] OTP resend error:', error);
    return NextResponse.json(
      { error: 'An error occurred while resending OTP' },
      { status: 500 }
    );
  }
}

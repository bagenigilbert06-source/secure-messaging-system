import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/register
 * Proxy user registration to Flask backend
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, student_id, password } = body;

    // Input validation
    if (!name || !email || !student_id || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

    // Call Flask backend registration
    const backendResponse = await fetch(`${backendUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, student_id, password }),
    });

    if (!backendResponse.ok) {
      const error = await backendResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: error.error || error.message || 'Registration failed' },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();

    const response = NextResponse.json(
      {
        access_token: data.access_token,
        token_type: data.token_type,
        expires_in: data.expires_in,
        user: data.user,
        message: data.message,
        refresh_token: data.refresh_token, // Include refresh token in response
      },
      { status: 201 }
    );

    // Store refresh token in secure HTTP-only cookie
    if (data.refresh_token) {
      response.cookies.set('auth_refresh_token', data.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('[auth/register] Error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Registration failed',
      },
      { status: 500 }
    );
  }
}

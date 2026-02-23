import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/login
 * Proxy authentication to Flask backend at http://localhost:5000/api/auth/login
 * Handles token secure storage in HTTP-only cookies
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, student_id } = body;

    // Input validation - Accept either email or student_id
    const identifier = email || student_id;
    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Email/Student ID and password are required' },
        { status: 400 }
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

    // Prepare request body for backend
    const backendBody: Record<string, string> = { password };
    if (email) {
      backendBody.email = email;
    } else if (student_id) {
      backendBody.student_id = student_id;
    }

    // Call Flask backend authentication
    const backendResponse = await fetch(`${backendUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendBody),
    });

    if (!backendResponse.ok) {
      const error = await backendResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: error.error || error.message || 'Authentication failed' },
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
        refresh_token: data.refresh_token, // Include refresh token in response
      },
      { status: 200 }
    );

    // Store access token in secure HTTP-only cookie
    response.cookies.set('auth_access_token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: data.expires_in || 3600, // Use backend's expiration
      path: '/',
    });

    // Store refresh token in secure HTTP-only cookie
    response.cookies.set('auth_refresh_token', data.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    // Store a flag to indicate user is logged in (non-sensitive)
    response.cookies.set('auth_token_exists', 'true', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[auth/login] Error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Authentication failed',
      },
      { status: 500 }
    );
  }
}

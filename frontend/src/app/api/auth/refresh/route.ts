import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/refresh
 * Refresh access token using stored refresh token
 */
export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('auth_refresh_token')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token available' },
        { status: 401 }
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

    // Call Flask backend to refresh token
    const backendResponse = await fetch(`${backendUrl}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${refreshToken}`,
      },
    });

    if (!backendResponse.ok) {
      const error = await backendResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: error.error || error.message || 'Token refresh failed' },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();

    const response = NextResponse.json(
      {
        access_token: data.access_token,
        expires_in: data.expires_in,
      },
      { status: 200 }
    );

    // Update refresh token if backend provided new one
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
    console.error('[auth/refresh] Error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Token refresh failed',
      },
      { status: 500 }
    );
  }
}

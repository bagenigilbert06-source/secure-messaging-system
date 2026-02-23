import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/auth/me
 * Fetch current user's profile information
 * Proxies to Flask backend using the access token from the request
 */
export async function GET(request: NextRequest) {
  try {
    // Get the access token from the Authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'No authorization token provided' },
        { status: 401 }
      );
    }

    const accessToken = authHeader.replace('Bearer ', '');
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

    // Call Flask backend to get user profile
    const backendResponse = await fetch(`${backendUrl}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!backendResponse.ok) {
      const error = await backendResponse.json().catch(() => ({}));
      return NextResponse.json(
        { error: error.error || error.message || 'Failed to fetch user profile' },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('[auth/me] Error:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to fetch user profile',
      },
      { status: 500 }
    );
  }
}

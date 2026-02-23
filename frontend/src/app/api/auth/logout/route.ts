import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/logout
 * Clear authentication tokens and session
 */
export async function POST(request: NextRequest) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    const accessToken = request.cookies.get('auth_access_token')?.value;

    // Notify backend of logout to revoke the token
    if (accessToken) {
      try {
        await fetch(`${backendUrl}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
        }).catch((error) => {
          // Log but don't fail - proceed with clearing cookies anyway
          console.error('[logout] Backend logout failed:', error);
        });
      } catch (error) {
        // Silently handle errors
        console.error('[logout] Error notifying backend:', error);
      }
    }

    const response = NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );

    // Clear authentication cookies
    response.cookies.set('auth_refresh_token', '', {
      httpOnly: true,
      maxAge: 0,
      path: '/',
    });

    response.cookies.set('auth_token_exists', '', {
      httpOnly: false,
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('[auth/logout] Error:', error);
    // Return success even if there's an error - client should clear tokens anyway
    const response = NextResponse.json(
      { message: 'Logout processed' },
      { status: 200 }
    );

    response.cookies.set('auth_refresh_token', '', {
      httpOnly: true,
      maxAge: 0,
      path: '/',
    });

    return response;
  }
}

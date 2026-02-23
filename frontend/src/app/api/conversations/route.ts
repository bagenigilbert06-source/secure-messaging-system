import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const FLASK_API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('auth_access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - No access token found' },
        { status: 401 }
      );
    }

    const backendResponse = await fetch(`${FLASK_API}/api/messages/conversations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      // Return empty conversations if backend fails
      return NextResponse.json({ conversations: [] });
    }

    return NextResponse.json({ conversations: data.conversations || [] });
  } catch (error) {
    console.error('[API] Error fetching conversations:', error);
    // Return empty array instead of error for graceful handling
    return NextResponse.json({ conversations: [] });
  }
}

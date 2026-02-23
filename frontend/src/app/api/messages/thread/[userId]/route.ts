import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const FLASK_API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('auth_access_token')?.value;
    const userId = params.userId;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - No access token found' },
        { status: 401 }
      );
    }

    const backendResponse = await fetch(
      `${FLASK_API}/api/messages/conversations/${userId}/messages`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json({ messages: [] });
    }

    return NextResponse.json({ messages: data.messages || [] });
  } catch (error) {
    console.error('[API] Error fetching thread messages:', error);
    return NextResponse.json({ messages: [] });
  }
}

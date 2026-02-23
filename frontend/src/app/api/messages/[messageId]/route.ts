import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const FLASK_API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('auth_access_token')?.value;
    const messageId = params.messageId;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - No access token found' },
        { status: 401 }
      );
    }

    const backendResponse = await fetch(
      `${FLASK_API}/api/messages/${messageId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(data, { status: backendResponse.status });
    }

    return NextResponse.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    console.error('[API] Error deleting message:', error);
    return NextResponse.json(
      { error: 'Failed to delete message' },
      { status: 500 }
    );
  }
}

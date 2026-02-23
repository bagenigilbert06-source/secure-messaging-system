import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const FLASK_API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function POST(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('auth_access_token')?.value;
    const messageId = params.messageId;
    const body = await request.json();
    const { emoji } = body;

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - No access token found' },
        { status: 401 }
      );
    }

    if (!emoji) {
      return NextResponse.json(
        { error: 'Emoji is required' },
        { status: 400 }
      );
    }

    const backendResponse = await fetch(
      `${FLASK_API}/api/messages/${messageId}/react`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ emoji }),
      }
    );

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(data, { status: backendResponse.status });
    }

    // Deduplicate reactions - ensure each user ID appears only once per emoji
    const dedupedReactions: Record<string, string[]> = {};
    if (data.reactions) {
      for (const [emoji, userIds] of Object.entries(data.reactions)) {
        if (Array.isArray(userIds)) {
          // Remove duplicates by converting to Set and back to Array
          const uniqueUserIds = Array.from(new Set(userIds));
          if (uniqueUserIds.length > 0) {
            dedupedReactions[emoji] = uniqueUserIds;
          }
        }
      }
    }

    return NextResponse.json({ success: true, reactions: dedupedReactions });
  } catch (error) {
    console.error('[API] Error adding reaction:', error);
    return NextResponse.json(
      { error: 'Failed to add reaction' },
      { status: 500 }
    );
  }
}

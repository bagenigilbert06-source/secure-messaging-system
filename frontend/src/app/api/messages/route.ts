import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const FLASK_API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('auth_access_token')?.value;
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - No access token found' },
        { status: 401 }
      );
    }

    // Call Flask backend with the access token
    const backendResponse = await fetch(`${FLASK_API}/api/messages?${queryString}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(data, { status: backendResponse.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[API] Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// Sample messages (kept for reference)
const SAMPLE_MESSAGES = [
  {
    id: 'msg-1',
    item_id: '5',
    item_title: 'Samsung Galaxy Watch 5',
    content: 'Your claim for the Galaxy Watch 5 has been reviewed. Please come to the Lost & Found office to verify your ownership.',
    message: 'Your claim for the Galaxy Watch 5 has been reviewed. Please come to the Lost & Found office to verify your ownership.',
    timestamp: '2024-02-12T10:30:00Z',
    created_at: '2024-02-12T10:30:00Z',
    is_from_office: true,
    read: false
  },
  {
    id: 'msg-2',
    item_id: '9',
    item_title: 'Silver House Keys',
    content: 'Great news! Your claim for the house keys has been approved. You can pick them up during office hours.',
    message: 'Great news! Your claim for the house keys has been approved. You can pick them up during office hours.',
    timestamp: '2024-02-11T14:45:00Z',
    created_at: '2024-02-11T14:45:00Z',
    is_from_office: true,
    read: false
  },
  {
    id: 'msg-3',
    item_id: '1',
    item_title: 'Silver MacBook Pro 16-inch',
    content: 'We found an item matching your description. Can you provide proof of ownership?',
    message: 'We found an item matching your description. Can you provide proof of ownership?',
    timestamp: '2024-02-10T09:15:00Z',
    created_at: '2024-02-10T09:15:00Z',
    is_from_office: true,
    read: true
  },
  {
    id: 'msg-4',
    item_id: '3',
    item_title: 'Red University ID Card',
    content: 'Your ID has been found! Please collect it from the Lost & Found office at your earliest convenience.',
    message: 'Your ID has been found! Please collect it from the Lost & Found office at your earliest convenience.',
    timestamp: '2024-02-09T13:20:00Z',
    created_at: '2024-02-09T13:20:00Z',
    is_from_office: true,
    read: true
  }
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Create a new message
    const newMessage = {
      id: `msg-${Date.now()}`,
      ...body,
      timestamp: new Date().toISOString(),
      created_at: new Date().toISOString(),
      read: false,
      is_from_office: false
    };

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error('[API] Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

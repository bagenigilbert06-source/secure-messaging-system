import { NextRequest, NextResponse } from 'next/server';

const FLASK_API = process.env.NEXT_PUBLIC_FLASK_API || 'http://localhost:5000';

export async function GET(request: NextRequest) {
  try {
    const cookies = request.headers.get('cookie') || '';
    
    const backendResponse = await fetch(`${FLASK_API}/api/messages/admin`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies,
      },
    });

    if (!backendResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch admin' },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Admin fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin' },
      { status: 500 }
    );
  }
}

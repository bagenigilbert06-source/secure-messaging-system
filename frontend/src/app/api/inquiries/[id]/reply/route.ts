import { NextRequest, NextResponse } from 'next/server';

// This would be replaced with actual database operations
const mockInquiries: Record<string, any> = {};

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { message } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // In a real app, this would update the inquiry in the database
    const inquiry = mockInquiries[id] || {
      id,
      itemName: 'Sample Item',
      message: 'Sample inquiry',
      status: 'pending',
      replies: [],
      createdAt: new Date().toISOString(),
    };

    const reply = {
      id: `reply_${Date.now()}`,
      message,
      sentBy: 'user',
      createdAt: new Date().toISOString(),
    };

    inquiry.replies = [...(inquiry.replies || []), reply];
    inquiry.updatedAt = new Date().toISOString();

    mockInquiries[id] = inquiry;

    return NextResponse.json(inquiry);
  } catch (error) {
    console.error('Error sending reply:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

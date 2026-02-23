import { NextRequest, NextResponse } from 'next/server';

const mockInquiries: Record<string, any> = {};

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status } = body;

    if (!status || !['pending', 'replied', 'resolved'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
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

    inquiry.status = status;
    inquiry.updatedAt = new Date().toISOString();

    mockInquiries[id] = inquiry;

    return NextResponse.json(inquiry);
  } catch (error) {
    console.error('Error updating inquiry status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';

// Mock database for demonstrations
const inquiries: Record<string, any> = {};
let inquiryCounter = 1;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, itemName, message } = body;

    if (!studentId || !itemName || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const inquiryId = `inquiry_${inquiryCounter++}`;
    const newInquiry = {
      id: inquiryId,
      itemId: `item_${Date.now()}`,
      itemName,
      message,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      replies: [],
      studentId,
      studentName: 'Student User',
    };

    inquiries[inquiryId] = newInquiry;

    return NextResponse.json(newInquiry, { status: 201 });
  } catch (error) {
    console.error('Error creating inquiry:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const studentId = searchParams.get('studentId');
    const status = searchParams.get('status');

    let filteredInquiries = Object.values(inquiries);

    if (studentId) {
      filteredInquiries = filteredInquiries.filter((i) => i.studentId === studentId);
    }

    if (status && status !== 'all') {
      filteredInquiries = filteredInquiries.filter((i) => i.status === status);
    }

    return NextResponse.json(filteredInquiries);
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

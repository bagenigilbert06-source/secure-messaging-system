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
    const backendResponse = await fetch(`${FLASK_API}/api/items/my-items?${queryString}`, {
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
    console.error('[API] Error fetching user items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user items' },
      { status: 500 }
    );
  }
}

// Sample user items (kept for reference)
const SAMPLE_USER_ITEMS = [
  {
    id: 'my-1',
    name: 'Gold Diamond Ring',
    category: 'Jewelry',
    description: 'Vintage gold ring with diamond stone. Lost near the library.',
    location_found: 'Unknown',
    location_stored: 'Reported Lost',
    date_found: '2024-02-10',
    color: 'Gold',
    distinctive_marks: 'Family heirloom, inscription inside',
    status: 'reported_lost',
    images: [],
    created_at: '2024-02-10T08:00:00Z'
  },
  {
    id: 'my-2',
    name: 'Red Jacket',
    category: 'Clothing',
    description: 'Red Columbia winter jacket with hood. Lost in the dormitory.',
    location_found: 'Dormitory',
    location_stored: 'Reported Lost',
    date_found: '2024-02-09',
    color: 'Red',
    distinctive_marks: 'Size M, Columbia brand',
    status: 'reported_lost',
    images: [],
    created_at: '2024-02-09T14:30:00Z'
  },
  {
    id: 'my-3',
    name: 'Psychology Textbook',
    category: 'Books',
    description: 'College psychology textbook, 8th edition. Lost in the science building.',
    location_found: 'Science Building',
    location_stored: 'Reported Lost',
    date_found: '2024-02-08',
    color: 'Blue',
    distinctive_marks: 'Has name written on first page',
    status: 'reported_lost',
    images: [],
    created_at: '2024-02-08T11:15:00Z'
  }
];

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
    const backendResponse = await fetch(`${FLASK_API}/api/items/my-claims?${queryString}`, {
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
    console.error('[API] Error fetching user claims:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user claims' },
      { status: 500 }
    );
  }
}

// Sample claims (kept for reference)
const SAMPLE_CLAIMS = [
  {
    id: '5',
    name: 'Samsung Galaxy Watch 5',
    category: 'Electronics',
    description: 'Black smartwatch with a leather band. Screen shows minor scratches but fully functional.',
    location_found: 'Gymnasium',
    location_stored: 'Lost & Found Office',
    date_found: '2024-02-04',
    color: 'Black',
    brand: 'Samsung',
    distinctive_marks: 'Minor screen scratches, leather band',
    status: 'claimed_pending',
    images: [],
    created_at: '2024-02-04T11:20:00Z',
    claimed_at: '2024-02-12T09:00:00Z'
  },
  {
    id: '9',
    name: 'Silver House Keys (Set of 3)',
    category: 'Keys',
    description: 'Three silver house keys on a metal keychain with a green plastic tag labeled "Home".',
    location_found: 'Dormitory Main Gate',
    location_stored: 'Lost & Found Office',
    date_found: '2024-01-31',
    color: 'Silver',
    distinctive_marks: 'Green "Home" tag on keychain',
    status: 'claimed_approved',
    images: [],
    created_at: '2024-01-31T08:00:00Z',
    claimed_at: '2024-02-11T14:30:00Z'
  }
];

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('auth_access_token')?.value;
    const body = await request.json();

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - No access token found' },
        { status: 401 }
      );
    }

    const backendResponse = await fetch(`${FLASK_API}/api/items/my-claims`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const data = await backendResponse.json();

    if (!backendResponse.ok) {
      return NextResponse.json(data, { status: backendResponse.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[API] Error claiming item:', error);
    return NextResponse.json(
      { error: 'Failed to claim item' },
      { status: 500 }
    );
  }
}

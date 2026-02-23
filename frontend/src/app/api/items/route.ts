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
    const backendResponse = await fetch(`${FLASK_API}/api/items?${queryString}`, {
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
    console.error('[API] Error fetching items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

// Sample items data (kept for reference)
const SAMPLE_ITEMS = [
  {
    id: '1',
    name: 'Silver MacBook Pro 16-inch',
    category: 'Electronics',
    description: 'A sleek silver MacBook Pro with a 16-inch display. Features AppleCare+ sticker on the back.',
    location_found: 'Central Library, 3rd Floor',
    location_stored: 'Lost & Found Office',
    date_found: '2024-02-08',
    color: 'Silver',
    brand: 'Apple',
    distinctive_marks: 'AppleCare+ sticker on back',
    status: 'unclaimed',
    images: [],
    created_at: '2024-02-08T10:00:00Z'
  },
  {
    id: '2',
    name: 'Apple AirPods Pro (Left Pod Missing)',
    category: 'Accessories',
    description: 'Premium wireless earbuds in white. One ear pod is missing but comes with charging case.',
    location_found: 'Student Cafeteria',
    location_stored: 'Lost & Found Office',
    date_found: '2024-02-07',
    color: 'White',
    brand: 'Apple',
    distinctive_marks: 'Left pod missing',
    status: 'unclaimed',
    images: [],
    created_at: '2024-02-07T14:30:00Z'
  },
  {
    id: '3',
    name: 'Red University ID Card',
    category: 'Documents',
    description: "Student ID with the name 'John Mwangi' and student number Z2024/1234. Red stripe on the front.",
    location_found: 'Computer Lab A, Building 2',
    location_stored: 'Lost & Found Office',
    date_found: '2024-02-06',
    color: 'Red',
    distinctive_marks: 'Z2024/1234 - John Mwangi',
    status: 'unclaimed',
    images: [],
    created_at: '2024-02-06T09:15:00Z'
  },
  {
    id: '4',
    name: 'Gold Car Key with Key Ring',
    category: 'Keys',
    description: 'A gold-colored car key with a black leather key ring and a small university medallion charm.',
    location_found: 'Sports Complex, Parking Lot',
    location_stored: 'Lost & Found Office',
    date_found: '2024-02-05',
    color: 'Gold',
    distinctive_marks: 'Black leather keyring with medallion',
    status: 'unclaimed',
    images: [],
    created_at: '2024-02-05T16:45:00Z'
  },
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
    status: 'unclaimed',
    images: [],
    created_at: '2024-02-04T11:20:00Z'
  },
  {
    id: '6',
    name: 'Blue Backpack with Laptop Compartment',
    category: 'Accessories',
    description: 'Navy blue hiking backpack with multiple compartments. Contains initials "AM" written inside.',
    location_found: 'Business School Building',
    location_stored: 'Lost & Found Office',
    date_found: '2024-02-03',
    color: 'Blue',
    distinctive_marks: 'Initials "AM" inside, multiple compartments',
    status: 'unclaimed',
    images: [],
    created_at: '2024-02-03T13:00:00Z'
  },
  {
    id: '7',
    name: 'Passport - Kenya',
    category: 'Documents',
    description: 'Blue Kenyan passport in relatively good condition. Located inside an envelope with study notes.',
    location_found: 'International Office',
    location_stored: 'Lost & Found Office',
    date_found: '2024-02-02',
    color: 'Blue',
    distinctive_marks: 'A12345678',
    status: 'unclaimed',
    images: [],
    created_at: '2024-02-02T10:30:00Z'
  },
  {
    id: '8',
    name: 'Sony Wireless Headphones (WH-CH720N)',
    category: 'Electronics',
    description: 'Black Sony noise-canceling headphones. Good battery condition, comes with original case.',
    location_found: 'Music Department',
    location_stored: 'Lost & Found Office',
    date_found: '2024-02-01',
    color: 'Black',
    brand: 'Sony',
    distinctive_marks: 'Model WH-CH720N, with original case',
    status: 'unclaimed',
    images: [],
    created_at: '2024-02-01T15:45:00Z'
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
    status: 'unclaimed',
    images: [],
    created_at: '2024-01-31T08:00:00Z'
  },
  {
    id: '10',
    name: 'Black Leather Wallet',
    category: 'Accessories',
    description: 'RFID-protected leather wallet with card slots. Contains old student ID, no money inside.',
    location_found: 'Student Union Building',
    location_stored: 'Lost & Found Office',
    date_found: '2024-01-30',
    color: 'Black',
    distinctive_marks: 'RFID-protected, leather, card slots',
    status: 'unclaimed',
    images: [],
    created_at: '2024-01-30T12:15:00Z'
  },
  {
    id: '11',
    name: 'iPhone 14 Pro Max (Space Black)',
    category: 'Electronics',
    description: 'Premium smartphone with a cracked screen protector but display intact. Comes with charger.',
    location_found: 'Library West Wing',
    location_stored: 'Lost & Found Office',
    date_found: '2024-01-29',
    color: 'Space Black',
    brand: 'Apple',
    distinctive_marks: 'Cracked screen protector, has charger',
    status: 'unclaimed',
    images: [],
    created_at: '2024-01-29T14:00:00Z'
  },
  {
    id: '12',
    name: 'Faculty ID Badge - Dr. Sarah',
    category: 'Documents',
    description: 'Faculty identification badge with lanyard. Name and office number visible on card.',
    location_found: 'Science Building',
    location_stored: 'Lost & Found Office',
    date_found: '2024-01-28',
    color: 'White',
    distinctive_marks: 'Dr. Sarah - Faculty Badge',
    status: 'unclaimed',
    images: [],
    created_at: '2024-01-28T09:45:00Z'
  },
];

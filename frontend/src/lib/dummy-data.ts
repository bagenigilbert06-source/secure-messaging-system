export interface Item {
  id: string;
  title: string;
  category: 'Electronics' | 'IDs' | 'Keys' | 'Accessories';
  description: string;
  location: string;
  date: string;
  image: string;
  color: string;
  serialNumber?: string;
}

export const DUMMY_ITEMS: Item[] = [
  {
    id: '1',
    title: 'Silver MacBook Pro 16-inch',
    category: 'Electronics',
    description:
      'A sleek silver MacBook Pro with a 16-inch display. Features AppleCare+ sticker on the back.',
    location: 'Central Library, 3rd Floor',
    date: '2024-02-08',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=400&fit=crop',
    color: 'Silver',
    serialNumber: 'C02X7XXXXX9',
  },
  {
    id: '2',
    title: 'Apple AirPods Pro (Left Pod Missing)',
    category: 'Accessories',
    description:
      'Premium wireless earbuds in white. One ear pod is missing but comes with charging case.',
    location: 'Student Cafeteria',
    date: '2024-02-07',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=400&fit=crop',
    color: 'White',
    serialNumber: 'XXXXX97D4A',
  },
  {
    id: '3',
    title: 'Red University ID Card',
    category: 'IDs',
    description:
      "Student ID with the name 'John Mwangi' and student number Z2024/1234. Red stripe on the front.",
    location: 'Computer Lab A, Building 2',
    date: '2024-02-06',
    image: 'https://images.unsplash.com/photo-1565974375261-97c61a37dd41?w=500&h=400&fit=crop',
    color: 'Red',
    serialNumber: 'Z2024/1234',
  },
  {
    id: '4',
    title: 'Gold Car Key with Key Ring',
    category: 'Keys',
    description:
      'A gold-colored car key with a black leather key ring and a small university medallion charm.',
    location: 'Sports Complex, Parking Lot',
    date: '2024-02-05',
    image: 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=500&h=400&fit=crop',
    color: 'Gold',
    serialNumber: 'KA-7834',
  },
  {
    id: '5',
    title: 'Samsung Galaxy Watch 5',
    category: 'Electronics',
    description:
      'Black smartwatch with a leather band. Screen shows minor scratches but fully functional.',
    location: 'Gymnasium',
    date: '2024-02-04',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=400&fit=crop',
    color: 'Black',
    serialNumber: 'SM5-92847XX',
  },
  {
    id: '6',
    title: 'Blue Backpack with Laptop Compartment',
    category: 'Accessories',
    description:
      'Navy blue hiking backpack with multiple compartments. Contains initials "AM" written inside.',
    location: 'Business School Building',
    date: '2024-02-03',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=400&fit=crop',
    color: 'Blue',
  },
  {
    id: '7',
    title: 'Passport - Kenya',
    category: 'IDs',
    description:
      'Blue Kenyan passport in relatively good condition. Located inside an envelope with study notes.',
    location: 'International Office',
    date: '2024-02-02',
    image: 'https://images.unsplash.com/photo-1568262996410-be78f64b6934?w=500&h=400&fit=crop',
    color: 'Blue',
    serialNumber: 'A12345678',
  },
  {
    id: '8',
    title: 'Sony Wireless Headphones (WH-CH720N)',
    category: 'Electronics',
    description:
      'Black Sony noise-canceling headphones. Good battery condition, comes with original case.',
    location: 'Music Department',
    date: '2024-02-01',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=400&fit=crop',
    color: 'Black',
    serialNumber: 'CH720N-2024',
  },
  {
    id: '9',
    title: 'Silver House Keys (Set of 3)',
    category: 'Keys',
    description:
      'Three silver house keys on a metal keychain with a green plastic tag labeled "Home".',
    location: 'Dormitory Main Gate',
    date: '2024-01-31',
    image: 'https://images.unsplash.com/photo-1607737337241-5b1da34e9850?w=500&h=400&fit=crop',
    color: 'Silver',
    serialNumber: 'KH-0021',
  },
  {
    id: '10',
    title: 'Black Leather Wallet',
    category: 'Accessories',
    description:
      'RFID-protected leather wallet with card slots. Contains old student ID, no money inside.',
    location: 'Student Union Building',
    date: '2024-01-30',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&h=400&fit=crop',
    color: 'Black',
  },
  {
    id: '11',
    title: 'iPhone 14 Pro Max (Space Black)',
    category: 'Electronics',
    description:
      'Premium smartphone with a cracked screen protector but display intact. Comes with charger.',
    location: 'Library West Wing',
    date: '2024-01-29',
    image: 'https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=500&h=400&fit=crop',
    color: 'Space Black',
    serialNumber: 'DMPXXXXXX9',
  },
  {
    id: '12',
    title: 'Faculty ID Badge - Dr. Sarah',
    category: 'IDs',
    description:
      'Faculty identification badge with lanyard. Name and office number visible on card.',
    location: 'Science Building',
    date: '2024-01-28',
    image: 'https://images.unsplash.com/photo-1565974375261-97c61a37dd41?w=500&h=400&fit=crop',
    color: 'White/Blue',
    serialNumber: 'FACULTY-2024-045',
  },
];

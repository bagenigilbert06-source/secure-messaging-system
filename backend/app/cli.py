"""
CLI commands for the application.
"""

import click
import uuid
from datetime import datetime, timedelta
import requests
import os
from . import db
from .models import User, Item, Image

SEED_ITEMS = [
    {
        'name': 'Silver MacBook Pro 16-inch',
        'category': 'Electronics',
        'description': 'A sleek silver MacBook Pro with a 16-inch display. Features AppleCare+ sticker on the back.',
        'location_found': 'Central Library, 3rd Floor',
        'color': 'Silver',
        'brand': 'Apple',
        'distinctive_marks': 'Has a university logo sticker on the back',
        'image_url': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=400&fit=crop'
    },
    {
        'name': 'Apple AirPods Pro',
        'category': 'Accessories',
        'description': 'Premium wireless earbuds in white with charging case.',
        'location_found': 'Student Cafeteria',
        'color': 'White',
        'brand': 'Apple',
        'distinctive_marks': 'Case has a small dent on the corner',
        'image_url': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=400&fit=crop'
    },
    {
        'name': 'Student ID Card',
        'category': 'Documents',
        'description': 'Campus student ID with photo identification.',
        'location_found': 'Computer Lab A, Building 2',
        'color': 'Red',
        'brand': 'Zetech University',
        'distinctive_marks': 'Red stripe with hologram',
        'image_url': 'https://images.unsplash.com/photo-1565974375261-97c61a37dd41?w=500&h=400&fit=crop'
    },
    {
        'name': 'Gold Car Key with Keychain',
        'category': 'Keys',
        'description': 'A gold-colored car key with a black leather key ring and university medallion charm.',
        'location_found': 'Sports Complex, Parking Lot',
        'color': 'Gold',
        'brand': 'Toyota',
        'distinctive_marks': 'Black leather keyring with silver charm',
        'image_url': 'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=500&h=400&fit=crop'
    },
    {
        'name': 'Samsung Galaxy Watch 5',
        'category': 'Electronics',
        'description': 'Black smartwatch with a leather band. Fully functional.',
        'location_found': 'Gymnasium',
        'color': 'Black',
        'brand': 'Samsung',
        'distinctive_marks': 'Minor scratches on the screen',
        'image_url': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=400&fit=crop'
    },
    {
        'name': 'Navy Blue Backpack',
        'category': 'Bags',
        'description': 'Hiking backpack with multiple compartments and laptop pocket.',
        'location_found': 'Business School Building',
        'color': 'Navy Blue',
        'brand': 'North Face',
        'distinctive_marks': 'Initials "AM" written inside the front pocket',
        'image_url': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=400&fit=crop'
    },
    {
        'name': 'Passport - Kenya',
        'category': 'Documents',
        'description': 'Blue Kenyan passport in good condition.',
        'location_found': 'International Office',
        'color': 'Blue',
        'brand': 'Government of Kenya',
        'distinctive_marks': 'Located inside an envelope with study notes',
        'image_url': 'https://images.unsplash.com/photo-1568262996410-be78f64b6934?w=500&h=400&fit=crop'
    },
    {
        'name': 'Sony Wireless Headphones',
        'category': 'Electronics',
        'description': 'Black Sony noise-canceling headphones with original case.',
        'location_found': 'Music Department',
        'color': 'Black',
        'brand': 'Sony',
        'distinctive_marks': 'Model WH-CH720N in excellent condition',
        'image_url': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=400&fit=crop'
    },
    {
        'name': 'Silver House Keys',
        'category': 'Keys',
        'description': 'Three silver house keys on a metal keychain with green plastic tag.',
        'location_found': 'Dormitory Main Gate',
        'color': 'Silver',
        'brand': 'Generic',
        'distinctive_marks': 'Green tag labeled "Home" and a small lucky charm',
        'image_url': 'https://images.unsplash.com/photo-1607737337241-5b1da34e9850?w=500&h=400&fit=crop'
    },
    {
        'name': 'Black Leather Wallet',
        'category': 'Accessories',
        'description': 'RFID-protected leather wallet with multiple card slots.',
        'location_found': 'Student Union Building',
        'color': 'Black',
        'brand': 'Fossil',
        'distinctive_marks': 'Wallet contains old student ID but no money',
        'image_url': 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&h=400&fit=crop'
    },
    {
        'name': 'iPhone 14 Pro Max',
        'category': 'Electronics',
        'description': 'Premium smartphone with space black finish. Comes with charger.',
        'location_found': 'Library West Wing',
        'color': 'Space Black',
        'brand': 'Apple',
        'distinctive_marks': 'Has a cracked screen protector but display intact',
        'image_url': 'https://images.unsplash.com/photo-1511707267537-b85faf00021e?w=500&h=400&fit=crop'
    },
    {
        'name': 'Canvas Laptop Bag',
        'category': 'Bags',
        'description': 'Khaki canvas messenger bag with multiple pockets for laptop and accessories.',
        'location_found': 'Main Gate Security Booth',
        'color': 'Khaki',
        'brand': 'Everlane',
        'distinctive_marks': 'Has a coffee stain on the left side',
        'image_url': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=400&fit=crop'
    },
]

def download_image(url):
    """Download image from URL."""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        
        upload_dir = os.path.join(os.path.dirname(__file__), '../../backend/uploads')
        os.makedirs(upload_dir, exist_ok=True)
        
        filename = f"{uuid.uuid4()}.jpg"
        filepath = os.path.join(upload_dir, filename)
        
        with open(filepath, 'wb') as f:
            f.write(response.content)
        
        return filename, filepath, 'image/jpeg', len(response.content)
    except Exception as e:
        click.echo(f"Error downloading {url}: {e}", err=True)
        return None, None, None, None

@click.command('seed-db')
def seed_db():
    """Seed the database with sample data."""
    
    try:
        click.echo("Clearing existing data...")
        Image.query.delete()
        Item.query.delete()
        User.query.delete()
        db.session.commit()
        
        click.echo("Creating test users...")
        
        user1 = User(
            id=str(uuid.uuid4()),
            name='John Mwangi',
            email='john@zetech.ac.ke',
            student_id='DCS-01-8601/2024',
            student_type='diploma',
            department='DCS',
            phone='0712345678',
            hostel='Kennedy',
            room_number='A-205',
            is_verified=True,
            email_verified=True,
            email_verified_at=datetime.utcnow(),
            role='student',
            is_active=True
        )
        user1.set_password('password123')
        
        user2 = User(
            id=str(uuid.uuid4()),
            name='Sarah Kipchoge',
            email='sarah@zetech.ac.ke',
            student_id='BIT-02-5432/2024',
            student_type='degree',
            department='BIT',
            phone='0723456789',
            hostel='Kenyatta',
            room_number='B-115',
            is_verified=True,
            email_verified=True,
            email_verified_at=datetime.utcnow(),
            role='admin',
            is_active=True
        )
        user2.set_password('admin123')
        
        user3 = User(
            id=str(uuid.uuid4()),
            name='David Omondi',
            email='david@zetech.ac.ke',
            student_id='BCS-03-7890/2023',
            student_type='degree',
            department='BCS',
            phone='0734567890',
            hostel='Moi',
            room_number='C-342',
            is_verified=True,
            email_verified=True,
            email_verified_at=datetime.utcnow(),
            role='student',
            is_active=True
        )
        user3.set_password('password123')
        
        db.session.add_all([user1, user2, user3])
        db.session.commit()
        
        click.echo(f"✓ Created 3 test users")
        
        click.echo("Seeding items with Unsplash images...")
        
        count = 0
        for idx, item_data in enumerate(SEED_ITEMS):
            try:
                image_url = item_data.pop('image_url')
                filename, filepath, mime, size = download_image(image_url)
                
                if not filename:
                    click.echo(f"⚠ Skipping item {idx + 1} due to image download failure")
                    continue
                
                item = Item(
                    id=str(uuid.uuid4()),
                    name=item_data['name'],
                    description=item_data['description'],
                    category=item_data['category'],
                    status='unclaimed',
                    location_found=item_data['location_found'],
                    location_stored='Security Office - Cabinet A',
                    date_found=datetime.utcnow() - timedelta(days=5 - idx),
                    color=item_data['color'],
                    brand=item_data['brand'],
                    distinctive_marks=item_data['distinctive_marks'],
                    reported_by_id=user1.id,
                    created_at=datetime.utcnow() - timedelta(days=5 - idx)
                )
                
                db.session.add(item)
                db.session.flush()
                
                image = Image(
                    id=str(uuid.uuid4()),
                    filename=filename,
                    file_path=filepath,
                    mime_type=mime,
                    size=size,
                    item_id=item.id
                )
                
                db.session.add(image)
                click.echo(f"✓ Item {idx + 1}: {item_data['name']}")
                count += 1
                
            except Exception as e:
                click.echo(f"✗ Error seeding item {idx + 1}: {e}", err=True)
                db.session.rollback()
                continue
        
        db.session.commit()
        click.echo(f"\n✓ Successfully seeded {count} items")
        click.echo("\nTest Account Credentials:")
        click.echo("=" * 50)
        click.echo("Admin User:")
        click.echo(f"  Email: sarah@zetech.ac.ke")
        click.echo(f"  Password: admin123")
        click.echo("Student User:")
        click.echo(f"  Email: john@zetech.ac.ke")
        click.echo(f"  Password: password123")
        click.echo("=" * 50)
        
    except Exception as e:
        click.echo(f"Error: {e}", err=True)
        raise

def register_cli(app):
    """Register CLI commands with the app."""
    app.cli.add_command(seed_db)

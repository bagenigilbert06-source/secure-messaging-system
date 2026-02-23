"""
Migration script to add email verification OTP columns to users table.

Run this script to add the new columns for OTP-based email verification:
- email_verification_code: VARCHAR(6) - stores the 6-digit OTP
- email_verification_code_expires: TIMESTAMP - stores OTP expiry time (Postgres TIMESTAMP)
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app import create_app, db
from sqlalchemy import text

def run_migration():
    """Run the migration to add OTP columns"""
    app = create_app()
    
    with app.app_context():
        try:
            # Get the database connection
            connection = db.engine.raw_connection()
            cursor = connection.cursor()
            
            # Check if columns already exist
            cursor.execute("""
                SELECT COLUMN_NAME 
                FROM INFORMATION_SCHEMA.COLUMNS 
                WHERE TABLE_NAME='users' AND COLUMN_NAME='email_verification_code'
            """)
            
            if cursor.fetchone():
                print("✓ OTP columns already exist in users table")
                cursor.close()
                connection.close()
                return True
            
            # Add email_verification_code column
            cursor.execute("""
                ALTER TABLE users 
                ADD COLUMN email_verification_code VARCHAR(6) NULL
            """)
            print("✓ Added email_verification_code column")
            
            # Add email_verification_code_expires column (Postgres uses TIMESTAMP)
            cursor.execute("""
                ALTER TABLE users 
                ADD COLUMN email_verification_code_expires TIMESTAMP NULL
            """)
            print("✓ Added email_verification_code_expires column")
            
            # Create index on email_verification_code for faster lookups
            cursor.execute("""
                CREATE INDEX idx_email_verification_code 
                ON users(email_verification_code)
            """)
            print("✓ Created index on email_verification_code")
            
            connection.commit()
            cursor.close()
            connection.close()
            
            print("\n✅ Migration completed successfully!")
            return True
            
        except Exception as e:
            print(f"\n❌ Migration failed: {str(e)}")
            if 'cursor' in locals():
                cursor.close()
            if 'connection' in locals():
                connection.close()
            return False


if __name__ == '__main__':
    success = run_migration()
    sys.exit(0 if success else 1)

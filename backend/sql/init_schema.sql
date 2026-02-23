-- Set schema to public
SET search_path TO public;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    student_id VARCHAR(50) UNIQUE,
    student_type VARCHAR(20) DEFAULT 'diploma',
    department VARCHAR(20),
    is_verified BOOLEAN DEFAULT FALSE NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE NOT NULL,
    email_verified_at TIMESTAMP,
    roll_number VARCHAR(50) UNIQUE,
    phone VARCHAR(20),
    hostel VARCHAR(100),
    room_number VARCHAR(20),
    role VARCHAR(20) DEFAULT 'student' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    password_reset_token VARCHAR(255),
    password_reset_token_expires TIMESTAMP,
    email_verification_token VARCHAR(255),
    email_verification_token_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    last_login TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_student_id ON users(student_id);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);
CREATE INDEX IF NOT EXISTS idx_users_roll_number ON users(roll_number);

-- Create items table
CREATE TABLE IF NOT EXISTS items (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'unclaimed' NOT NULL,
    location_found VARCHAR(255) NOT NULL,
    location_stored VARCHAR(255),
    date_found TIMESTAMP NOT NULL,
    color VARCHAR(100),
    brand VARCHAR(100),
    distinctive_marks TEXT,
    reported_by_id VARCHAR(36) NOT NULL,
    claimed_by_id VARCHAR(36),
    claim_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    claimed_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_items_reported_by FOREIGN KEY (reported_by_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_items_claimed_by FOREIGN KEY (claimed_by_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_items_reported_by_id ON items(reported_by_id);
CREATE INDEX IF NOT EXISTS idx_items_claimed_by_id ON items(claimed_by_id);
CREATE INDEX IF NOT EXISTS idx_items_status ON items(status);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);

-- Create images table
CREATE TABLE IF NOT EXISTS images (
    id VARCHAR(36) PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) UNIQUE NOT NULL,
    mime_type VARCHAR(50) NOT NULL,
    size INTEGER NOT NULL,
    item_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_images_item FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_images_item_id ON images(item_id);
CREATE INDEX IF NOT EXISTS idx_images_file_path ON images(file_path);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(36) PRIMARY KEY,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(50) DEFAULT 'inquiry' NOT NULL,
    status VARCHAR(20) DEFAULT 'unread' NOT NULL,
    sender_id VARCHAR(36) NOT NULL,
    receiver_id VARCHAR(36) NOT NULL,
    item_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    read_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_messages_sender FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_messages_receiver FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_messages_item FOREIGN KEY (item_id) REFERENCES items(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_item_id ON messages(item_id);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);

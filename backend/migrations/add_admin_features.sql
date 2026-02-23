-- Migration: Add admin features (categories, departments, storage locations, activity logs)
-- This migration adds new tables for complete admin dashboard functionality

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_categories_name ON categories(name);
CREATE INDEX idx_categories_is_active ON categories(is_active);

-- Create departments table
CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    location VARCHAR(255),
    contact_person VARCHAR(100),
    contact_phone VARCHAR(20),
    contact_email VARCHAR(120),
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_departments_name ON departments(name);
CREATE INDEX idx_departments_is_active ON departments(is_active);

-- Create storage_locations table
CREATE TABLE IF NOT EXISTS storage_locations (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    building VARCHAR(100),
    floor VARCHAR(50),
    room VARCHAR(50),
    capacity INTEGER,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    department_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

CREATE INDEX idx_storage_locations_name ON storage_locations(name);
CREATE INDEX idx_storage_locations_department_id ON storage_locations(department_id);
CREATE INDEX idx_storage_locations_is_active ON storage_locations(is_active);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id VARCHAR(36) PRIMARY KEY,
    admin_id VARCHAR(36) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(36),
    entity_name VARCHAR(255),
    old_values JSON,
    new_values JSON,
    details TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_activity_logs_admin_id ON activity_logs(admin_id);
CREATE INDEX idx_activity_logs_action_type ON activity_logs(action_type);
CREATE INDEX idx_activity_logs_entity_type ON activity_logs(entity_type);
CREATE INDEX idx_activity_logs_entity_id ON activity_logs(entity_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- Insert default categories if they don't exist
INSERT INTO categories (id, name, description, icon, color, is_active, created_at, updated_at)
VALUES
    (UUID(), 'Electronics', 'Electronic devices and gadgets', 'laptop', 'bg-blue-500', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (UUID(), 'Documents', 'Important documents and papers', 'file', 'bg-yellow-500', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (UUID(), 'Clothing', 'Clothes and fashion items', 'shirt', 'bg-purple-500', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (UUID(), 'Books', 'Books and educational materials', 'book', 'bg-green-500', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (UUID(), 'Accessories', 'Bags, wallets, and accessories', 'bag', 'bg-pink-500', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (UUID(), 'Sports', 'Sports equipment and gear', 'activity', 'bg-red-500', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (UUID(), 'Other', 'Miscellaneous items', 'box', 'bg-gray-500', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE name=name;

-- Insert default departments (Zetech example)
INSERT INTO departments (id, name, location, contact_person, contact_phone, contact_email, is_active, created_at, updated_at)
VALUES
    (UUID(), 'Computer Science', 'Block A', 'Mr. Kipchoge', '+254712345678', 'cs@zetech.ac.ke', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (UUID(), 'Business', 'Block B', 'Mrs. Kipchoge', '+254712345679', 'biz@zetech.ac.ke', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (UUID(), 'Engineering', 'Block C', 'Eng. Kipchoge', '+254712345680', 'eng@zetech.ac.ke', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    (UUID(), 'Administration', 'Main Hall', 'Mr. Admin', '+254712345681', 'admin@zetech.ac.ke', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE name=name;

# Campus Lost and Found Backend

A Flask-based REST API backend for the Campus Lost and Found Items Recording and Communication Platform.

## Features

- **User Management**: Student and admin registration/login with JWT authentication
- **Item Management**: Report, track, and manage lost/found items with images
- **Image Handling**: Upload, store, and optimize item photos
- **Messaging System**: Communication between students and admins for claim verification
- **Search & Filter**: Find items by category, status, and search terms
- **Statistics**: Track items by category and status

## Project Structure

```
backend/
├── app/
│   ├── __init__.py           # Flask app factory
│   ├── models.py             # Database models (User, Item, Image, Message)
│   ├── schemas.py            # Pydantic validation schemas
│   └── routes/
│       ├── auth.py           # Authentication endpoints
│       ├── items.py          # Item management endpoints
│       └── messages.py       # Messaging endpoints
├── config.py                 # Configuration management
├── app.py                    # Application entry point
├── requirements.txt          # Python dependencies
└── .env.example              # Environment variable template
```

## Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Setup environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and update the secret keys for production.

5. **Run the application**
   ```bash
   python app.py
   ```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Items
- `GET /api/items` - Get items (with filtering and pagination)
- `GET /api/items/<id>` - Get item details
- `POST /api/items` - Create item report
- `PUT /api/items/<id>` - Update item
- `DELETE /api/items/<id>` - Delete item
- `POST /api/items/<id>/images` - Add images to item
- `DELETE /api/items/images/<image_id>` - Delete image
- `GET /api/items/categories` - Get all categories
- `GET /api/items/stats` - Get statistics

### Messages
- `GET /api/messages` - Get user messages
- `GET /api/messages/<id>` - Get message details
- `POST /api/messages` - Create message
- `PUT /api/messages/<id>` - Update message
- `DELETE /api/messages/<id>` - Delete message
- `GET /api/messages/count/unread` - Get unread count
- `GET /api/messages/item/<item_id>` - Get messages for item

## Environment Variables

```
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=your-secret-key-change-in-production
JWT_SECRET_KEY=your-jwt-secret-key-change-in-production
DATABASE_URL=sqlite:///lost_and_found.db
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216
```

## Database Models

### User
- id, name, email, password_hash, roll_number, phone, hostel, room_number, role, is_active
- Relationships: items_reported, items_claimed, messages_sent, messages_received

### Item
- id, name, description, category, status, location_found, location_stored
- date_found, color, brand, distinctive_marks, reported_by_id, claimed_by_id
- Relationships: images, messages

### Image
- id, filename, file_path, mime_type, size, item_id

### Message
- id, subject, content, message_type, status, sender_id, receiver_id, item_id

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in requests:

```
Authorization: Bearer <access_token>
```

## CORS

CORS is enabled for all routes under `/api/*` to allow requests from any origin. Configure as needed in production.

## Error Handling

All endpoints return JSON responses with appropriate HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## File Uploads

- Maximum file size: 16MB
- Allowed formats: PNG, JPG, JPEG, GIF, WEBP
- Images are automatically optimized on upload

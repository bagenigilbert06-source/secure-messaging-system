from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime

# User Schemas
class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(..., min_length=6)
    roll_number: str
    phone: Optional[str] = None
    hostel: Optional[str] = None
    room_number: Optional[str] = None
    role: str = 'student'

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    roll_number: str
    phone: Optional[str]
    hostel: Optional[str]
    room_number: Optional[str]
    role: str
    is_active: bool
    created_at: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    hostel: Optional[str] = None
    room_number: Optional[str] = None

# Item Schemas
class ItemCreate(BaseModel):
    name: str
    description: Optional[str] = None
    category: str
    location_found: str
    location_stored: Optional[str] = None
    date_found: str
    color: Optional[str] = None
    brand: Optional[str] = None
    distinctive_marks: Optional[str] = None

class ItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None
    location_found: Optional[str] = None
    location_stored: Optional[str] = None
    color: Optional[str] = None
    brand: Optional[str] = None
    distinctive_marks: Optional[str] = None

class ImageResponse(BaseModel):
    id: str
    filename: str
    file_path: str
    mime_type: str
    size: int
    created_at: str

class ItemResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    category: str
    status: str
    location_found: str
    location_stored: Optional[str]
    date_found: str
    color: Optional[str]
    brand: Optional[str]
    distinctive_marks: Optional[str]
    reported_by: UserResponse
    claimed_by: Optional[UserResponse]
    images: List[ImageResponse]
    created_at: str
    claimed_at: Optional[str]
    updated_at: str

# Message Schemas
class MessageCreate(BaseModel):
    subject: str
    content: str
    receiver_id: str
    item_id: Optional[str] = None
    message_type: str = 'inquiry'

class MessageResponse(BaseModel):
    id: str
    subject: str
    content: str
    message_type: str
    status: str
    sender: UserResponse
    receiver: UserResponse
    item_id: Optional[str]
    created_at: str
    read_at: Optional[str]
    updated_at: str

# Token Schemas
class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    expires_in: int

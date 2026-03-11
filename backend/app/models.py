from datetime import datetime, timedelta
import uuid

from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.ext.mutable import MutableDict
from app import db


def _uuid():
    return str(uuid.uuid4())


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.String(36), primary_key=True, default=_uuid)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)

    # Zetech fields
    student_id = db.Column(db.String(50), unique=True, nullable=True, index=True)
    student_type = db.Column(db.String(20), nullable=True, default="diploma")
    department = db.Column(db.String(20), nullable=True, index=True)
    is_verified = db.Column(db.Boolean, default=False, nullable=False)
    email_verified = db.Column(db.Boolean, default=False, nullable=False)
    email_verified_at = db.Column(db.DateTime, nullable=True)

    # Legacy
    roll_number = db.Column(db.String(50), unique=True, nullable=True, index=True)

    # Contact
    phone = db.Column(db.String(20), nullable=True)
    hostel = db.Column(db.String(100), nullable=True)
    room_number = db.Column(db.String(20), nullable=True)

    # Account
    role = db.Column(db.String(20), default="student", nullable=False)  # student/admin
    is_active = db.Column(db.Boolean, default=True, nullable=False)

    # Password reset
    password_reset_token = db.Column(db.String(255), nullable=True)
    password_reset_token_expires = db.Column(db.DateTime, nullable=True)

    # Email verification token
    email_verification_token = db.Column(db.String(255), nullable=True)
    email_verification_token_expires = db.Column(db.DateTime, nullable=True)

    # OTP verification
    email_verification_code = db.Column(db.String(6), nullable=True)
    email_verification_code_expires = db.Column(db.DateTime, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    last_login = db.Column(db.DateTime, nullable=True)

    # Relationships
    items_reported = db.relationship("Item", foreign_keys="Item.reported_by_id", backref="reported_by_user")
    items_claimed = db.relationship("Item", foreign_keys="Item.claimed_by_id", backref="claimed_by_user")

    messages_sent = db.relationship("Message", foreign_keys="Message.sender_id", backref="sender")
    messages_received = db.relationship("Message", foreign_keys="Message.receiver_id", backref="receiver")

    claims = db.relationship("Claim", foreign_keys="Claim.claimant_id", backref="claimant")

    def set_password(self, password: str):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def generate_email_verification_token(self, expiry_hours=24):
        import secrets
        self.email_verification_token = secrets.token_urlsafe(64)
        self.email_verification_token_expires = datetime.utcnow() + timedelta(hours=expiry_hours)
        return self.email_verification_token

    def verify_email_token(self, token: str) -> bool:
        if (
            self.email_verification_token == token
            and self.email_verification_token_expires
            and self.email_verification_token_expires > datetime.utcnow()
        ):
            self.email_verified = True
            self.email_verified_at = datetime.utcnow()
            self.email_verification_token = None
            self.email_verification_token_expires = None
            return True
        return False

    def generate_password_reset_token(self, expiry_hours=1):
        import secrets
        self.password_reset_token = secrets.token_urlsafe(64)
        self.password_reset_token_expires = datetime.utcnow() + timedelta(hours=expiry_hours)
        return self.password_reset_token

    def verify_password_reset_token(self, token: str) -> bool:
        return (
            self.password_reset_token == token
            and self.password_reset_token_expires
            and self.password_reset_token_expires > datetime.utcnow()
        )

    def reset_password(self, new_password: str):
        self.set_password(new_password)
        self.password_reset_token = None
        self.password_reset_token_expires = None

    def to_dict(self, include_sensitive=False):
        data = {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "student_id": self.student_id,
            "student_type": self.student_type,
            "department": self.department,
            "is_verified": self.is_verified,
            "email_verified": self.email_verified,
            "phone": self.phone,
            "hostel": self.hostel,
            "room_number": self.room_number,
            "role": self.role,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_login": self.last_login.isoformat() if self.last_login else None,
        }
        if include_sensitive:
            data["email_verified_at"] = self.email_verified_at.isoformat() if self.email_verified_at else None
        return data


class Item(db.Model):
    __tablename__ = "items"

    id = db.Column(db.String(36), primary_key=True, default=_uuid)

    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(100), nullable=False)

    status = db.Column(db.String(20), default="unclaimed", nullable=False)  # unclaimed/claimed/collected/rejected

    location_found = db.Column(db.String(255), nullable=False)
    location_stored = db.Column(db.String(255), nullable=True)
    date_found = db.Column(db.DateTime, nullable=False)

    color = db.Column(db.String(100), nullable=True)
    brand = db.Column(db.String(100), nullable=True)
    distinctive_marks = db.Column(db.Text, nullable=True)

    reported_by_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False, index=True)
    claimed_by_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=True, index=True)

    claim_notes = db.Column(db.Text, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    claimed_at = db.Column(db.DateTime, nullable=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    images = db.relationship("Image", backref="item", cascade="all, delete-orphan", lazy=True)
    messages = db.relationship("Message", backref="item", cascade="all, delete-orphan", lazy=True)
    claims = db.relationship("Claim", backref="item", cascade="all, delete-orphan", lazy=True)

    def to_dict(self, include_images=True):
        data = {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "category": self.category,
            "status": self.status,
            "location_found": self.location_found,
            "location_stored": self.location_stored,
            "date_found": self.date_found.isoformat() if self.date_found else None,
            "color": self.color,
            "brand": self.brand,
            "distinctive_marks": self.distinctive_marks,
            "claim_notes": self.claim_notes,
            "reported_by": self.reported_by_user.to_dict() if self.reported_by_user else None,
            "claimed_by": self.claimed_by_user.to_dict() if self.claimed_by_user else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "claimed_at": self.claimed_at.isoformat() if self.claimed_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_images:
            data["images"] = [img.to_dict() for img in self.images]
        return data


class Image(db.Model):
    __tablename__ = "images"

    id = db.Column(db.String(36), primary_key=True, default=_uuid)

    filename = db.Column(db.String(255), nullable=False)

    # IMPORTANT: store relative path like: "uploads/items/<itemId>/<file>.jpg"
    file_path = db.Column(db.String(500), nullable=False, unique=True)

    mime_type = db.Column(db.String(50), nullable=False)
    size = db.Column(db.Integer, nullable=False)

    item_id = db.Column(db.String(36), db.ForeignKey("items.id"), nullable=False, index=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        # frontend needs a URL, not only file_path
        return {
            "id": self.id,
            "filename": self.filename,
            "file_path": self.file_path,  # relative path
            "url": f"/api/items/images/{self.id}",  # public API endpoint
            "mime_type": self.mime_type,
            "size": self.size,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Claim(db.Model):
    """
    Claim model (needed for research project).
    This tracks the claim request and verification workflow.
    """
    __tablename__ = "claims"

    id = db.Column(db.String(36), primary_key=True, default=_uuid)

    item_id = db.Column(db.String(36), db.ForeignKey("items.id"), nullable=False, index=True)
    claimant_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False, index=True)

    status = db.Column(db.String(30), default="pending", nullable=False)
    # pending / under_review / approved / rejected / collected

    evidence_answers = db.Column(MutableDict.as_mutable(db.JSON), default=dict, nullable=False)
    # example:
    # {
    #   "where_lost": "...",
    #   "date_lost": "...",
    #   "proof_color": "...",
    #   "serial_number": "...",
    #   "extra_details": "..."
    # }

    admin_notes = db.Column(db.Text, nullable=True)
    reviewed_by_admin_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=True, index=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    reviewed_at = db.Column(db.DateTime, nullable=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    reviewed_by = db.relationship("User", foreign_keys=[reviewed_by_admin_id])

    def to_dict(self):
        return {
            "id": self.id,
            "item_id": self.item_id,
            "claimant": self.claimant.to_dict() if self.claimant else None,
            "status": self.status,
            "evidence_answers": self.evidence_answers or {},
            "admin_notes": self.admin_notes,
            "reviewed_by_admin": self.reviewed_by.to_dict() if self.reviewed_by else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "reviewed_at": self.reviewed_at.isoformat() if self.reviewed_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class Message(db.Model):
    __tablename__ = "messages"

    id = db.Column(db.String(36), primary_key=True, default=_uuid)
    subject = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)

    message_type = db.Column(db.String(50), default="inquiry", nullable=False)
    status = db.Column(db.String(20), default="unread", nullable=False)

    sender_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False, index=True)
    receiver_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False, index=True)

    item_id = db.Column(db.String(36), db.ForeignKey("items.id"), nullable=True, index=True)
    replied_to_message_id = db.Column(db.String(36), db.ForeignKey("messages.id"), nullable=True, index=True)

    is_starred = db.Column(db.Boolean, default=False, nullable=False)
    reactions = db.Column(MutableDict.as_mutable(db.JSON), default=dict, nullable=False)
    deleted_at = db.Column(db.DateTime, nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    read_at = db.Column(db.DateTime, nullable=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "subject": self.subject,
            "content": self.content,
            "message_type": self.message_type,
            "status": self.status,
            "sender": self.sender.to_dict() if self.sender else None,
            "receiver": self.receiver.to_dict() if self.receiver else None,
            "item": {"id": self.item.id, "name": self.item.name, "status": self.item.status} if self.item else None,
            "item_id": self.item_id,
            "replied_to_message_id": self.replied_to_message_id,
            "is_starred": self.is_starred,
            "reactions": self.reactions or {},
            "deleted_at": self.deleted_at.isoformat() if self.deleted_at else None,
            "is_deleted": self.deleted_at is not None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "read_at": self.read_at.isoformat() if self.read_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class Category(db.Model):
    __tablename__ = "categories"

    id = db.Column(db.String(36), primary_key=True, default=_uuid)
    name = db.Column(db.String(100), nullable=False, unique=True, index=True)
    description = db.Column(db.Text, nullable=True)
    icon = db.Column(db.String(50), nullable=True)
    color = db.Column(db.String(20), nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "icon": self.icon,
            "color": self.color,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class Department(db.Model):
    __tablename__ = "departments"

    id = db.Column(db.String(36), primary_key=True, default=_uuid)
    name = db.Column(db.String(100), nullable=False, unique=True, index=True)
    location = db.Column(db.String(255), nullable=True)
    contact_person = db.Column(db.String(100), nullable=True)
    contact_phone = db.Column(db.String(20), nullable=True)
    contact_email = db.Column(db.String(120), nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)

    storage_locations = db.relationship("StorageLocation", backref="department", cascade="all, delete-orphan", lazy=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "location": self.location,
            "contact_person": self.contact_person,
            "contact_phone": self.contact_phone,
            "contact_email": self.contact_email,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class StorageLocation(db.Model):
    __tablename__ = "storage_locations"

    id = db.Column(db.String(36), primary_key=True, default=_uuid)
    name = db.Column(db.String(100), nullable=False)

    building = db.Column(db.String(100), nullable=True)
    floor = db.Column(db.String(50), nullable=True)
    room = db.Column(db.String(50), nullable=True)

    capacity = db.Column(db.Integer, nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False)

    department_id = db.Column(db.String(36), db.ForeignKey("departments.id"), nullable=True, index=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "building": self.building,
            "floor": self.floor,
            "room": self.room,
            "capacity": self.capacity,
            "is_active": self.is_active,
            "department_id": self.department_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class ActivityLog(db.Model):
    __tablename__ = "activity_logs"

    id = db.Column(db.String(36), primary_key=True, default=_uuid)
    admin_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False, index=True)

    action_type = db.Column(db.String(50), nullable=False, index=True)
    entity_type = db.Column(db.String(50), nullable=False, index=True)
    entity_id = db.Column(db.String(36), nullable=True, index=True)
    entity_name = db.Column(db.String(255), nullable=True)

    old_values = db.Column(db.JSON, nullable=True)
    new_values = db.Column(db.JSON, nullable=True)

    details = db.Column(db.Text, nullable=True)
    ip_address = db.Column(db.String(50), nullable=True)

    admin = db.relationship("User", backref="activity_logs", foreign_keys=[admin_id])

    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)

    def to_dict(self):
        return {
            "id": self.id,
            "admin_id": self.admin_id,
            "admin_name": self.admin.name if self.admin else None,
            "action_type": self.action_type,
            "entity_type": self.entity_type,
            "entity_id": self.entity_id,
            "entity_name": self.entity_name,
            "old_values": self.old_values,
            "new_values": self.new_values,
            "details": self.details,
            "ip_address": self.ip_address,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
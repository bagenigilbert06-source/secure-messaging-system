from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .. import db
from ..models import User, Item, Message, Category, Department, StorageLocation, ActivityLog
from ..utils.decorators import admin_required
from datetime import datetime, timedelta
from sqlalchemy import func, and_, or_
import uuid
import bcrypt

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

# ==================== USER MANAGEMENT ====================

@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_all_users():
    """Get all users with optional filtering."""
    try:
        role = request.args.get('role')  # filter by role (student, admin)
        is_verified = request.args.get('is_verified')  # filter by verification status
        is_active = request.args.get('is_active')  # filter by active status
        search = request.args.get('search')  # search by name, email, student_id
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        query = User.query
        
        # Apply filters
        if role:
            query = query.filter_by(role=role)
        
        if is_verified is not None:
            query = query.filter_by(is_verified=is_verified.lower() == 'true')
        
        if is_active is not None:
            query = query.filter_by(is_active=is_active.lower() == 'true')
        
        # Search functionality
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    User.name.ilike(search_term),
                    User.email.ilike(search_term),
                    User.student_id.ilike(search_term)
                )
            )
        
        # Pagination
        paginated = query.order_by(User.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        users = [user.to_dict(include_sensitive=True) for user in paginated.items]
        
        return jsonify({
            'users': users,
            'total': paginated.total,
            'pages': paginated.pages,
            'current_page': page
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<user_id>', methods=['GET'])
@admin_required
def get_user_details(user_id):
    """Get detailed info about a specific user."""
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get user's reported items
        reported_items = Item.query.filter_by(reported_by_id=user_id).count()
        
        # Get user's claimed items
        claimed_items = Item.query.filter_by(claimed_by_id=user_id).count()
        
        # Get user's messages
        sent_messages = Message.query.filter_by(sender_id=user_id).count()
        received_messages = Message.query.filter_by(receiver_id=user_id).count()
        
        user_data = user.to_dict(include_sensitive=True)
        user_data.update({
            'reported_items_count': reported_items,
            'claimed_items_count': claimed_items,
            'sent_messages_count': sent_messages,
            'received_messages_count': received_messages
        })
        
        return jsonify(user_data), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users', methods=['POST'])
@admin_required
def create_user():
    """Create a new user (admin-only)."""
    try:
        data = request.get_json()
        current_user_id = get_jwt_identity()
        
        # Validation
        if not data.get('name') or not data.get('email') or not data.get('password'):
            return jsonify({'error': 'Name, email, and password are required'}), 400
        
        # Check if email already exists
        if User.query.filter_by(email=data.get('email')).first():
            return jsonify({'error': 'Email already registered'}), 400
        
        # Hash password
        hashed_password = bcrypt.hashpw(
            data.get('password').encode('utf-8'),
            bcrypt.gensalt()
        ).decode('utf-8')
        
        # Create new user
        user = User(
            id=str(uuid.uuid4()),
            name=data.get('name'),
            email=data.get('email'),
            password_hash=hashed_password,
            student_id=data.get('student_id'),
            role=data.get('role', 'student'),
            is_active=True,
            is_verified=True,  # Admin-created users are verified by default
            email_verified=True,
            email_verified_at=datetime.utcnow()
        )
        
        db.session.add(user)
        db.session.commit()
        
        # Log activity
        log_activity(current_user_id, 'create', 'user', user.id, user.name, {}, user.to_dict())
        
        return jsonify({
            'message': 'User created successfully',
            'user': user.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<user_id>/verify', methods=['POST'])
@admin_required
def verify_user(user_id):
    """Manually verify a user account."""
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        user.is_verified = True
        user.email_verified = True
        user.email_verified_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'User verified successfully',
            'user': user.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<user_id>/deactivate', methods=['POST'])
@admin_required
def deactivate_user(user_id):
    """Deactivate a user account."""
    try:
        # Prevent deactivating self
        current_user_id = get_jwt_identity()
        if current_user_id == user_id:
            return jsonify({'error': 'Cannot deactivate your own account'}), 400
        
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        user.is_active = False
        db.session.commit()
        
        return jsonify({
            'message': 'User deactivated successfully',
            'user': user.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<user_id>/activate', methods=['POST'])
@admin_required
def activate_user(user_id):
    """Activate a deactivated user account."""
    try:
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        user.is_active = True
        db.session.commit()
        
        return jsonify({
            'message': 'User activated successfully',
            'user': user.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<user_id>', methods=['PUT'])
@admin_required
def update_user(user_id):
    """Update user details (admin-only)."""
    try:
        user = User.query.get(user_id)
        current_user_id = get_jwt_identity()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        old_values = user.to_dict()
        
        # Admin can update these fields
        allowed_fields = ['name', 'phone', 'hostel', 'room_number', 'student_type', 'is_verified', 'is_active', 'student_id']
        
        # Check if email is being changed and if it's already in use
        if 'email' in data and data['email'] != user.email:
            existing = User.query.filter_by(email=data['email']).first()
            if existing:
                return jsonify({'error': 'Email already in use'}), 400
            user.email = data['email']
        
        # Update allowed fields
        for field in allowed_fields:
            if field in data:
                setattr(user, field, data[field])
        
        # Admin can change role
        if 'role' in data and data['role'] in ['student', 'admin']:
            user.role = data['role']
        
        # Admin can update password
        if 'password' in data and data['password']:
            hashed_password = bcrypt.hashpw(
                data['password'].encode('utf-8'),
                bcrypt.gensalt()
            ).decode('utf-8')
            user.password_hash = hashed_password
        
        db.session.commit()
        
        # Log activity
        log_activity(current_user_id, 'update', 'user', user.id, user.name, old_values, user.to_dict())
        
        return jsonify({
            'message': 'User updated successfully',
            'user': user.to_dict(include_sensitive=True)
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<user_id>', methods=['DELETE'])
@admin_required
def delete_user(user_id):
    """Delete a user account (admin-only)."""
    try:
        # Prevent deleting self
        current_user_id = get_jwt_identity()
        if current_user_id == user_id:
            return jsonify({'error': 'Cannot delete your own account'}), 400
        
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        user_data = user.to_dict()
        
        # Optionally reassign items or delete them
        # For now, we'll keep items but remove the reporter relationship
        items = Item.query.filter_by(reported_by_id=user_id).all()
        for item in items:
            item.reported_by_id = None
        
        db.session.delete(user)
        db.session.commit()
        
        # Log activity
        log_activity(current_user_id, 'delete', 'user', user_id, user.name, user_data, {})
        
        return jsonify({'message': 'User deleted successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ==================== ITEM MANAGEMENT ====================

@admin_bp.route('/items', methods=['GET'])
@admin_required
def get_all_items():
    """Get all items with advanced filtering."""
    try:
        status = request.args.get('status')  # unclaimed, claimed, collected
        category = request.args.get('category')
        department = request.args.get('department')  # filter by reporter's department
        search = request.args.get('search')  # search in name, description
        date_from = request.args.get('date_from')  # filter by date range
        date_to = request.args.get('date_to')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        sort_by = request.args.get('sort_by', 'created_at')  # created_at, claimed_at, name
        sort_order = request.args.get('sort_order', 'desc')  # asc or desc
        
        query = Item.query
        
        # Apply filters
        if status:
            query = query.filter_by(status=status)
        
        if category:
            query = query.filter_by(category=category)
        
        # Filter by reporter's department
        if department:
            query = query.join(User).filter(User.department == department)
        
        # Search functionality
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Item.name.ilike(search_term),
                    Item.description.ilike(search_term)
                )
            )
        
        # Date range filter
        if date_from:
            try:
                date_from_obj = datetime.fromisoformat(date_from.replace('Z', '+00:00'))
                query = query.filter(Item.date_found >= date_from_obj)
            except:
                pass
        
        if date_to:
            try:
                date_to_obj = datetime.fromisoformat(date_to.replace('Z', '+00:00'))
                query = query.filter(Item.date_found <= date_to_obj)
            except:
                pass
        
        # Sorting
        if sort_by == 'claimed_at':
            sort_col = Item.claimed_at
        elif sort_by == 'name':
            sort_col = Item.name
        else:
            sort_col = Item.created_at
        
        if sort_order == 'asc':
            query = query.order_by(sort_col.asc())
        else:
            query = query.order_by(sort_col.desc())
        
        # Pagination
        paginated = query.paginate(page=page, per_page=per_page, error_out=False)
        
        items = [item.to_dict() for item in paginated.items]
        
        return jsonify({
            'items': items,
            'total': paginated.total,
            'pages': paginated.pages,
            'current_page': page
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/items/<item_id>', methods=['PUT'])
@admin_required
def update_item_admin(item_id):
    """Update item details with full admin privileges."""
    try:
        item = Item.query.get(item_id)
        
        if not item:
            return jsonify({'error': 'Item not found'}), 404
        
        data = request.get_json()
        
        # Admin can update all fields except reported_by_id
        updatable_fields = [
            'name', 'description', 'category', 'status', 
            'location_found', 'location_stored', 'color', 'brand',
            'distinctive_marks', 'claim_notes', 'claimed_by_id'
        ]
        
        for field in updatable_fields:
            if field in data:
                setattr(item, field, data[field])
        
        # Handle status changes
        if 'status' in data:
            if data['status'] == 'claimed' and item.claimed_at is None:
                item.claimed_at = datetime.utcnow()
            elif data['status'] == 'collected':
                pass  # Already claimed, just mark as collected
        
        db.session.commit()
        
        return jsonify({
            'message': 'Item updated successfully',
            'item': item.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/items/<item_id>', methods=['DELETE'])
@admin_required
def delete_item_admin(item_id):
    """Delete an item and its associated data."""
    try:
        item = Item.query.get(item_id)
        
        if not item:
            return jsonify({'error': 'Item not found'}), 404
        
        # Delete associated images from file system
        import os
        from flask import current_app
        
        for image in item.images:
            try:
                if os.path.exists(image.file_path):
                    os.remove(image.file_path)
            except Exception as e:
                print(f"Error deleting image file: {e}")
        
        db.session.delete(item)
        db.session.commit()
        
        return jsonify({'message': 'Item deleted successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ==================== MESSAGE MANAGEMENT ====================

@admin_bp.route('/messages', methods=['GET'])
@admin_required
def get_all_messages():
    """Get all messages with filtering."""
    try:
        status = request.args.get('status')  # unread, read, replied
        message_type = request.args.get('message_type')  # inquiry, claim_verification, update
        item_id = request.args.get('item_id')
        user_id = request.args.get('user_id')  # sender or receiver
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        query = Message.query
        
        # Apply filters
        if status:
            query = query.filter_by(status=status)
        
        if message_type:
            query = query.filter_by(message_type=message_type)
        
        if item_id:
            query = query.filter_by(item_id=item_id)
        
        if user_id:
            # Get messages where user is sender or receiver
            query = query.filter(
                or_(
                    Message.sender_id == user_id,
                    Message.receiver_id == user_id
                )
            )
        
        # Pagination
        paginated = query.order_by(Message.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        messages = [msg.to_dict() for msg in paginated.items]
        
        return jsonify({
            'messages': messages,
            'total': paginated.total,
            'pages': paginated.pages,
            'current_page': page
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/messages/<message_id>', methods=['PUT'])
@admin_required
def update_message_admin(message_id):
    """Update message status."""
    try:
        message = Message.query.get(message_id)
        
        if not message:
            return jsonify({'error': 'Message not found'}), 404
        
        data = request.get_json()
        
        if 'status' in data:
            message.status = data['status']
            if data['status'] == 'read' and message.read_at is None:
                message.read_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Message updated successfully',
            'data': message.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/messages/<message_id>', methods=['DELETE'])
@admin_required
def delete_message_admin(message_id):
    """Delete a message."""
    try:
        message = Message.query.get(message_id)
        
        if not message:
            return jsonify({'error': 'Message not found'}), 404
        
        db.session.delete(message)
        db.session.commit()
        
        return jsonify({'message': 'Message deleted successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/messages/<message_id>/reply', methods=['POST', 'OPTIONS'])
@admin_required
def reply_to_message(message_id):
    """Admin reply to a message."""
    try:
        message = Message.query.get(message_id)
        
        if not message:
            return jsonify({'error': 'Message not found'}), 404
        
        data = request.get_json()
        reply_content = data.get('content', '').strip()
        
        if not reply_content:
            return jsonify({'error': 'Reply content is required'}), 400
        
        # Get current admin user
        admin_id = get_jwt_identity()
        
        # Create reply message
        reply_message = Message(
            subject=f"Re: {message.subject}",
            content=reply_content,
            message_type=message.message_type,
            sender_id=admin_id,
            receiver_id=message.sender_id,
            item_id=message.item_id
        )
        
        # Update original message status
        message.status = 'replied'
        message.read_at = datetime.utcnow()
        
        db.session.add(reply_message)
        db.session.commit()
        
        return jsonify({
            'message': 'Reply sent successfully',
            'data': reply_message.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/messages/<message_id>/edit', methods=['PUT', 'OPTIONS'])
@admin_required
def edit_message(message_id):
    """Edit an admin message (only replies)."""
    try:
        message = Message.query.get(message_id)
        
        if not message:
            return jsonify({'error': 'Message not found'}), 404
        
        admin_id = get_jwt_identity()
        
        # Only allow editing messages sent by the current admin
        if message.sender_id != admin_id:
            return jsonify({'error': 'You can only edit your own messages'}), 403
        
        data = request.get_json()
        new_content = data.get('content', '').strip()
        
        if not new_content:
            return jsonify({'error': 'Message content is required'}), 400
        
        # Update message
        message.content = new_content
        message.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Message edited successfully',
            'data': message.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/messages/<message_id>/read', methods=['POST', 'OPTIONS'])
@admin_required
def mark_message_read(message_id):
    """Mark message as read."""
    try:
        message = Message.query.get(message_id)
        
        if not message:
            return jsonify({'error': 'Message not found'}), 404
        
        if message.status != 'read':
            message.status = 'read'
            message.read_at = datetime.utcnow()
            db.session.commit()
        
        return jsonify({
            'message': 'Message marked as read',
            'data': message.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/messages/search', methods=['GET'])
@admin_required
def search_messages():
    """Search messages by subject or content."""
    try:
        query = request.args.get('q', '').strip()
        status_filter = request.args.get('status', '')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        # Base query
        messages_query = Message.query
        
        if status_filter:
            messages_query = messages_query.filter_by(status=status_filter)
        
        # Search by subject or content
        if query:
            messages_query = messages_query.filter(
                db.or_(
                    Message.subject.ilike(f'%{query}%'),
                    Message.content.ilike(f'%{query}%')
                )
            )
        
        # Paginate
        paginated = messages_query.order_by(Message.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'messages': [msg.to_dict() for msg in paginated.items],
            'total': paginated.total,
            'pages': paginated.pages,
            'current_page': page
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== DASHBOARD STATISTICS ====================

@admin_bp.route('/dashboard/stats', methods=['GET'])
@admin_required
def get_dashboard_stats():
    """Get comprehensive dashboard statistics."""
    try:
        # User statistics
        total_users = User.query.count()
        total_students = User.query.filter_by(role='student').count()
        total_admins = User.query.filter_by(role='admin').count()
        verified_users = User.query.filter_by(is_verified=True).count()
        active_users = User.query.filter_by(is_active=True).count()
        
        # Item statistics
        total_items = Item.query.count()
        unclaimed_items = Item.query.filter_by(status='unclaimed').count()
        claimed_items = Item.query.filter_by(status='claimed').count()
        collected_items = Item.query.filter_by(status='collected').count()
        
        # Category breakdown
        category_stats = db.session.query(
            Item.category,
            func.count(Item.id).label('count')
        ).group_by(Item.category).all()
        
        categories = {cat: count for cat, count in category_stats}
        
        # Message statistics
        total_messages = Message.query.count()
        unread_messages = Message.query.filter_by(status='unread').count()
        
        # Department breakdown
        dept_stats = db.session.query(
            User.department,
            func.count(User.id).label('count')
        ).filter(User.department != None).group_by(User.department).all()
        
        departments = {dept: count for dept, count in dept_stats if dept}
        
        # Recent activity (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        recent_registrations = User.query.filter(
            User.created_at >= thirty_days_ago
        ).count()
        recent_items = Item.query.filter(
            Item.created_at >= thirty_days_ago
        ).count()
        
        return jsonify({
            'users': {
                'total': total_users,
                'students': total_students,
                'admins': total_admins,
                'verified': verified_users,
                'active': active_users
            },
            'items': {
                'total': total_items,
                'unclaimed': unclaimed_items,
                'claimed': claimed_items,
                'collected': collected_items,
                'by_category': categories
            },
            'messages': {
                'total': total_messages,
                'unread': unread_messages
            },
            'departments': departments,
            'activity': {
                'recent_registrations': recent_registrations,
                'recent_items': recent_items
            }
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/dashboard/recent-activity', methods=['GET'])
@admin_required
def get_recent_activity():
    """Get recent activity logs."""
    try:
        limit = request.args.get('limit', 20, type=int)
        
        # Get recent registrations
        recent_users = User.query.order_by(User.created_at.desc()).limit(limit).all()
        
        # Get recent items
        recent_items = Item.query.order_by(Item.created_at.desc()).limit(limit).all()
        
        # Get recent messages
        recent_messages = Message.query.order_by(Message.created_at.desc()).limit(limit).all()
        
        activity = {
            'recent_registrations': [user.to_dict() for user in recent_users],
            'recent_items': [item.to_dict() for item in recent_items],
            'recent_messages': [msg.to_dict() for msg in recent_messages]
        }
        
        return jsonify(activity), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== REPORTS & EXPORTS ====================

@admin_bp.route('/reports/items-by-category', methods=['GET'])
@admin_required
def get_items_by_category():
    """Get detailed report of items by category."""
    try:
        report = db.session.query(
            Item.category,
            func.count(Item.id).label('total'),
            func.sum((Item.status == 'unclaimed').cast(db.Integer)).label('unclaimed'),
            func.sum((Item.status == 'claimed').cast(db.Integer)).label('claimed'),
            func.sum((Item.status == 'collected').cast(db.Integer)).label('collected')
        ).group_by(Item.category).all()
        
        data = [
            {
                'category': row[0],
                'total': row[1],
                'unclaimed': row[2] or 0,
                'claimed': row[3] or 0,
                'collected': row[4] or 0
            }
            for row in report
        ]
        
        return jsonify({'data': data}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/reports/user-activity', methods=['GET'])
@admin_required
def get_user_activity_report():
    """Get report of user activity (items reported, claimed, messages)."""
    try:
        limit = request.args.get('limit', 100, type=int)
        
        report = db.session.query(
            User.id,
            User.name,
            User.email,
            User.student_id,
            func.count(Item.id).filter(Item.reported_by_id == User.id).label('items_reported'),
            func.count(Item.id).filter(Item.claimed_by_id == User.id).label('items_claimed'),
            func.count(Message.id).filter(Message.sender_id == User.id).label('messages_sent')
        ).outerjoin(Item, Item.reported_by_id == User.id)\
         .outerjoin(Message, Message.sender_id == User.id)\
         .group_by(User.id).limit(limit).all()
        
        data = [
            {
                'user_id': row[0],
                'name': row[1],
                'email': row[2],
                'student_id': row[3],
                'items_reported': row[4],
                'items_claimed': row[5],
                'messages_sent': row[6]
            }
            for row in report
        ]
        
        return jsonify({'data': data}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== CATEGORIES MANAGEMENT ====================

@admin_bp.route('/categories', methods=['GET'])
@admin_required
def get_categories():
    """Get all categories with optional filtering."""
    try:
        is_active = request.args.get('is_active')
        search = request.args.get('search')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        query = Category.query
        
        if is_active is not None:
            query = query.filter_by(is_active=is_active.lower() == 'true')
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(Category.name.ilike(search_term))
        
        paginated = query.order_by(Category.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        categories = [cat.to_dict() for cat in paginated.items]
        
        return jsonify({
            'categories': categories,
            'total': paginated.total,
            'pages': paginated.pages,
            'current_page': page
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/categories', methods=['POST'])
@admin_required
def create_category():
    """Create a new category."""
    try:
        data = request.get_json()
        current_user_id = get_jwt_identity()
        
        if not data.get('name'):
            return jsonify({'error': 'Category name is required'}), 400
        
        category = Category(
            id=str(uuid.uuid4()),
            name=data.get('name'),
            description=data.get('description'),
            icon=data.get('icon'),
            color=data.get('color'),
            is_active=data.get('is_active', True)
        )
        
        db.session.add(category)
        db.session.commit()
        
        # Log activity
        log_activity(current_user_id, 'create', 'category', category.id, category.name, {}, category.to_dict())
        
        return jsonify({
            'message': 'Category created successfully',
            'category': category.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/categories/<category_id>', methods=['PUT'])
@admin_required
def update_category(category_id):
    """Update a category."""
    try:
        category = Category.query.get(category_id)
        
        if not category:
            return jsonify({'error': 'Category not found'}), 404
        
        data = request.get_json()
        current_user_id = get_jwt_identity()
        old_values = category.to_dict()
        
        if 'name' in data:
            category.name = data['name']
        if 'description' in data:
            category.description = data['description']
        if 'icon' in data:
            category.icon = data['icon']
        if 'color' in data:
            category.color = data['color']
        if 'is_active' in data:
            category.is_active = data['is_active']
        
        db.session.commit()
        
        # Log activity
        log_activity(current_user_id, 'update', 'category', category.id, category.name, old_values, category.to_dict())
        
        return jsonify({
            'message': 'Category updated successfully',
            'category': category.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/categories/<category_id>', methods=['DELETE'])
@admin_required
def delete_category(category_id):
    """Delete a category."""
    try:
        category = Category.query.get(category_id)
        
        if not category:
            return jsonify({'error': 'Category not found'}), 404
        
        current_user_id = get_jwt_identity()
        category_data = category.to_dict()
        
        db.session.delete(category)
        db.session.commit()
        
        # Log activity
        log_activity(current_user_id, 'delete', 'category', category.id, category.name, category_data, {})
        
        return jsonify({'message': 'Category deleted successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ==================== DEPARTMENTS MANAGEMENT ====================

@admin_bp.route('/departments', methods=['GET'])
@admin_required
def get_departments():
    """Get all departments with optional filtering."""
    try:
        is_active = request.args.get('is_active')
        search = request.args.get('search')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        query = Department.query
        
        if is_active is not None:
            query = query.filter_by(is_active=is_active.lower() == 'true')
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(or_(
                Department.name.ilike(search_term),
                Department.location.ilike(search_term)
            ))
        
        paginated = query.order_by(Department.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        departments = [dept.to_dict() for dept in paginated.items]
        
        return jsonify({
            'departments': departments,
            'total': paginated.total,
            'pages': paginated.pages,
            'current_page': page
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/departments', methods=['POST'])
@admin_required
def create_department():
    """Create a new department."""
    try:
        data = request.get_json()
        current_user_id = get_jwt_identity()
        
        if not data.get('name'):
            return jsonify({'error': 'Department name is required'}), 400
        
        department = Department(
            id=str(uuid.uuid4()),
            name=data.get('name'),
            location=data.get('location'),
            contact_person=data.get('contact_person'),
            contact_phone=data.get('contact_phone'),
            contact_email=data.get('contact_email'),
            is_active=data.get('is_active', True)
        )
        
        db.session.add(department)
        db.session.commit()
        
        # Log activity
        log_activity(current_user_id, 'create', 'department', department.id, department.name, {}, department.to_dict())
        
        return jsonify({
            'message': 'Department created successfully',
            'department': department.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/departments/<dept_id>', methods=['PUT'])
@admin_required
def update_department(dept_id):
    """Update a department."""
    try:
        department = Department.query.get(dept_id)
        
        if not department:
            return jsonify({'error': 'Department not found'}), 404
        
        data = request.get_json()
        current_user_id = get_jwt_identity()
        old_values = department.to_dict()
        
        if 'name' in data:
            department.name = data['name']
        if 'location' in data:
            department.location = data['location']
        if 'contact_person' in data:
            department.contact_person = data['contact_person']
        if 'contact_phone' in data:
            department.contact_phone = data['contact_phone']
        if 'contact_email' in data:
            department.contact_email = data['contact_email']
        if 'is_active' in data:
            department.is_active = data['is_active']
        
        db.session.commit()
        
        # Log activity
        log_activity(current_user_id, 'update', 'department', department.id, department.name, old_values, department.to_dict())
        
        return jsonify({
            'message': 'Department updated successfully',
            'department': department.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/departments/<dept_id>', methods=['DELETE'])
@admin_required
def delete_department(dept_id):
    """Delete a department."""
    try:
        department = Department.query.get(dept_id)
        
        if not department:
            return jsonify({'error': 'Department not found'}), 404
        
        current_user_id = get_jwt_identity()
        dept_data = department.to_dict()
        
        db.session.delete(department)
        db.session.commit()
        
        # Log activity
        log_activity(current_user_id, 'delete', 'department', department.id, department.name, dept_data, {})
        
        return jsonify({'message': 'Department deleted successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ==================== STORAGE LOCATIONS MANAGEMENT ====================

@admin_bp.route('/locations', methods=['GET'])
@admin_required
def get_locations():
    """Get all storage locations with optional filtering."""
    try:
        department_id = request.args.get('department_id')
        is_active = request.args.get('is_active')
        search = request.args.get('search')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        query = StorageLocation.query
        
        if department_id:
            query = query.filter_by(department_id=department_id)
        
        if is_active is not None:
            query = query.filter_by(is_active=is_active.lower() == 'true')
        
        if search:
            search_term = f"%{search}%"
            query = query.filter(or_(
                StorageLocation.name.ilike(search_term),
                StorageLocation.building.ilike(search_term)
            ))
        
        paginated = query.order_by(StorageLocation.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        locations = [loc.to_dict() for loc in paginated.items]
        
        return jsonify({
            'locations': locations,
            'total': paginated.total,
            'pages': paginated.pages,
            'current_page': page
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/locations', methods=['POST'])
@admin_required
def create_location():
    """Create a new storage location."""
    try:
        data = request.get_json()
        current_user_id = get_jwt_identity()
        
        if not data.get('name'):
            return jsonify({'error': 'Location name is required'}), 400
        
        location = StorageLocation(
            id=str(uuid.uuid4()),
            name=data.get('name'),
            building=data.get('building'),
            floor=data.get('floor'),
            room=data.get('room'),
            capacity=data.get('capacity'),
            department_id=data.get('department_id'),
            is_active=data.get('is_active', True)
        )
        
        db.session.add(location)
        db.session.commit()
        
        # Log activity
        log_activity(current_user_id, 'create', 'location', location.id, location.name, {}, location.to_dict())
        
        return jsonify({
            'message': 'Location created successfully',
            'location': location.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/locations/<loc_id>', methods=['PUT'])
@admin_required
def update_location(loc_id):
    """Update a storage location."""
    try:
        location = StorageLocation.query.get(loc_id)
        
        if not location:
            return jsonify({'error': 'Location not found'}), 404
        
        data = request.get_json()
        current_user_id = get_jwt_identity()
        old_values = location.to_dict()
        
        if 'name' in data:
            location.name = data['name']
        if 'building' in data:
            location.building = data['building']
        if 'floor' in data:
            location.floor = data['floor']
        if 'room' in data:
            location.room = data['room']
        if 'capacity' in data:
            location.capacity = data['capacity']
        if 'department_id' in data:
            location.department_id = data['department_id']
        if 'is_active' in data:
            location.is_active = data['is_active']
        
        db.session.commit()
        
        # Log activity
        log_activity(current_user_id, 'update', 'location', location.id, location.name, old_values, location.to_dict())
        
        return jsonify({
            'message': 'Location updated successfully',
            'location': location.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/locations/<loc_id>', methods=['DELETE'])
@admin_required
def delete_location(loc_id):
    """Delete a storage location."""
    try:
        location = StorageLocation.query.get(loc_id)
        
        if not location:
            return jsonify({'error': 'Location not found'}), 404
        
        current_user_id = get_jwt_identity()
        loc_data = location.to_dict()
        
        db.session.delete(location)
        db.session.commit()
        
        # Log activity
        log_activity(current_user_id, 'delete', 'location', location.id, location.name, loc_data, {})
        
        return jsonify({'message': 'Location deleted successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ==================== ACTIVITY LOGS ====================

@admin_bp.route('/activity-logs', methods=['GET'])
@admin_required
def get_activity_logs():
    """Get activity logs with filtering."""
    try:
        admin_id = request.args.get('admin_id')
        action_type = request.args.get('action_type')
        entity_type = request.args.get('entity_type')
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        
        query = ActivityLog.query
        
        if admin_id:
            query = query.filter_by(admin_id=admin_id)
        
        if action_type:
            query = query.filter_by(action_type=action_type)
        
        if entity_type:
            query = query.filter_by(entity_type=entity_type)
        
        if date_from:
            try:
                date_from_obj = datetime.fromisoformat(date_from.replace('Z', '+00:00'))
                query = query.filter(ActivityLog.created_at >= date_from_obj)
            except:
                pass
        
        if date_to:
            try:
                date_to_obj = datetime.fromisoformat(date_to.replace('Z', '+00:00'))
                query = query.filter(ActivityLog.created_at <= date_to_obj)
            except:
                pass
        
        paginated = query.order_by(ActivityLog.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        logs = [log.to_dict() for log in paginated.items]
        
        return jsonify({
            'logs': logs,
            'total': paginated.total,
            'pages': paginated.pages,
            'current_page': page
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== EXPORTS ====================

@admin_bp.route('/export/users', methods=['GET'])
@admin_required
def export_users():
    """Export users data as CSV."""
    try:
        import csv
        from io import StringIO
        
        format_type = request.args.get('format', 'csv')  # csv or json
        
        users = User.query.all()
        
        if format_type == 'json':
            return jsonify({
                'users': [user.to_dict(include_sensitive=True) for user in users]
            }), 200
        
        # CSV format
        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(['ID', 'Name', 'Email', 'Student ID', 'Department', 'Role', 'Verified', 'Active', 'Created At'])
        
        for user in users:
            writer.writerow([
                user.id,
                user.name,
                user.email,
                user.student_id or '',
                user.department or '',
                user.role,
                'Yes' if user.is_verified else 'No',
                'Yes' if user.is_active else 'No',
                user.created_at.isoformat() if user.created_at else ''
            ])
        
        return output.getvalue(), 200, {
            'Content-Disposition': 'attachment; filename=users_export.csv',
            'Content-Type': 'text/csv'
        }
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/export/items', methods=['GET'])
@admin_required
def export_items():
    """Export items data as CSV."""
    try:
        import csv
        from io import StringIO
        
        format_type = request.args.get('format', 'csv')  # csv or json
        
        items = Item.query.all()
        
        if format_type == 'json':
            return jsonify({
                'items': [item.to_dict(include_images=False) for item in items]
            }), 200
        
        # CSV format
        output = StringIO()
        writer = csv.writer(output)
        writer.writerow(['ID', 'Name', 'Category', 'Status', 'Location Found', 'Reported By', 'Claimed By', 'Created At'])
        
        for item in items:
            writer.writerow([
                item.id,
                item.name,
                item.category,
                item.status,
                item.location_found,
                item.reported_by_user.name if item.reported_by_user else '',
                item.claimed_by_user.name if item.claimed_by_user else '',
                item.created_at.isoformat() if item.created_at else ''
            ])
        
        return output.getvalue(), 200, {
            'Content-Disposition': 'attachment; filename=items_export.csv',
            'Content-Type': 'text/csv'
        }
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== HELPER FUNCTIONS ====================

def log_activity(admin_id, action_type, entity_type, entity_id, entity_name, old_values, new_values, details=None):
    """Helper function to log admin activities."""
    try:
        log = ActivityLog(
            id=str(uuid.uuid4()),
            admin_id=admin_id,
            action_type=action_type,
            entity_type=entity_type,
            entity_id=entity_id,
            entity_name=entity_name,
            old_values=old_values if old_values else None,
            new_values=new_values if new_values else None,
            details=details
        )
        db.session.add(log)
        db.session.commit()
    except Exception as e:
        print(f"Error logging activity: {e}")

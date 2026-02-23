from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .. import db
from ..models import User, Message, Item
from datetime import datetime

messages_bp = Blueprint('messages', __name__, url_prefix='/api/messages')

@messages_bp.route('', methods=['GET'])
@jwt_required()
def get_messages():
    """Get user messages (received and sent)."""
    try:
        user_id = get_jwt_identity()
        message_type = request.args.get('type', 'all')  # all, received, sent
        status = request.args.get('status')  # unread, read, replied
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        query = Message.query
        
        # Filter by message type
        if message_type == 'received':
            query = query.filter_by(receiver_id=user_id)
        elif message_type == 'sent':
            query = query.filter_by(sender_id=user_id)
        else:
            # Get both received and sent
            query = query.filter(
                (Message.receiver_id == user_id) | (Message.sender_id == user_id)
            )
        
        # Filter by status
        if status:
            query = query.filter_by(status=status)
        
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

@messages_bp.route('/<message_id>', methods=['GET'])
@jwt_required()
def get_message(message_id):
    """Get message details."""
    try:
        user_id = get_jwt_identity()
        message = Message.query.get(message_id)
        
        if not message:
            return jsonify({'error': 'Message not found'}), 404
        
        # Check authorization
        if message.receiver_id != user_id and message.sender_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Mark as read if receiver
        if message.receiver_id == user_id and message.status == 'unread':
            message.status = 'read'
            message.read_at = datetime.utcnow()
            db.session.commit()
        
        return jsonify(message.to_dict()), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@messages_bp.route('', methods=['POST'])
@jwt_required()
def create_message():
    """Create new message."""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        if not data.get('subject') or not data.get('content') or not data.get('receiver_id'):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Verify receiver exists
        receiver = User.query.get(data['receiver_id'])
        if not receiver:
            return jsonify({'error': 'Receiver not found'}), 404
        
        # Verify item exists if provided
        item_id = data.get('item_id')
        if item_id:
            item = Item.query.get(item_id)
            if not item:
                return jsonify({'error': 'Item not found'}), 404
        
        message = Message(
            subject=data['subject'],
            content=data['content'],
            message_type=data.get('message_type', 'inquiry'),
            sender_id=user_id,
            receiver_id=data['receiver_id'],
            item_id=item_id
        )
        
        db.session.add(message)
        db.session.commit()
        
        return jsonify({
            'message': 'Message sent successfully',
            'data': message.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@messages_bp.route('/<message_id>', methods=['PUT'])
@jwt_required()
def update_message(message_id):
    """Update message (mark as read/replied)."""
    try:
        user_id = get_jwt_identity()
        message = Message.query.get(message_id)
        
        if not message:
            return jsonify({'error': 'Message not found'}), 404
        
        # Check authorization
        if message.receiver_id != user_id and message.sender_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.get_json()
        
        # Mark as read
        if data.get('status') == 'read' and message.receiver_id == user_id:
            message.status = 'read'
            message.read_at = datetime.utcnow()
        
        # Mark as replied
        if data.get('status') == 'replied' and message.receiver_id == user_id:
            message.status = 'replied'
        
        db.session.commit()
        
        return jsonify({
            'message': 'Message updated successfully',
            'data': message.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@messages_bp.route('/<message_id>', methods=['DELETE'])
@jwt_required()
def delete_message(message_id):
    """Soft delete message (marks as deleted)."""
    try:
        user_id = get_jwt_identity()
        message = Message.query.get(message_id)
        
        if not message:
            return jsonify({'error': 'Message not found'}), 404
        
        # Check authorization - only sender and receiver can delete
        if message.sender_id != user_id and message.receiver_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Soft delete - mark as deleted instead of removing from database
        message.deleted_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({'message': 'Message deleted successfully', 'data': message.to_dict()}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@messages_bp.route('/count/unread', methods=['GET'])
@jwt_required()
def get_unread_count():
    """Get count of unread messages for current user."""
    try:
        user_id = get_jwt_identity()
        unread_count = Message.query.filter_by(
            receiver_id=user_id,
            status='unread'
        ).count()
        
        return jsonify({'unread_count': unread_count}), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@messages_bp.route('/item/<item_id>', methods=['GET'])
@jwt_required()
def get_item_messages(item_id):
    """Get all messages for a specific item."""
    try:
        user_id = get_jwt_identity()
        item = Item.query.get(item_id)
        
        if not item:
            return jsonify({'error': 'Item not found'}), 404
        
        # Only reporter, admin, and claimant can view messages
        user = User.query.get(user_id)
        if item.reported_by_id != user_id and item.claimed_by_id != user_id:
            if not user or user.role != 'admin':
                return jsonify({'error': 'Unauthorized'}), 403
        
        messages = Message.query.filter_by(item_id=item_id).order_by(
            Message.created_at.desc()
        ).all()
        
        return jsonify({
            'messages': [msg.to_dict() for msg in messages]
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@messages_bp.route('/conversations', methods=['GET'])
@jwt_required()
def get_conversations():
    """
    Get all unique conversations for the current user.
    Groups messages by the other participant and returns the latest message info.
    """
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get all messages where user is sender or receiver, ordered by most recent
        messages = Message.query.filter(
            (Message.sender_id == user_id) | (Message.receiver_id == user_id)
        ).order_by(Message.created_at.desc()).all()
        
        # Group conversations by the other participant
        conversations_dict = {}
        
        for msg in messages:
            # Determine the other user in the conversation
            other_user_id = msg.receiver_id if msg.sender_id == user_id else msg.sender_id
            
            # Only process if we haven't seen this user yet (first occurrence is most recent)
            if other_user_id not in conversations_dict:
                other_user = User.query.get(other_user_id)
                if not other_user:
                    continue
                
                # Count unread messages from this user
                unread_count = Message.query.filter_by(
                    sender_id=other_user_id,
                    receiver_id=user_id,
                    status='unread'
                ).count()
                
                conversations_dict[other_user_id] = {
                    'userId': other_user_id,
                    'userName': other_user.name,
                    'userRole': other_user.role,
                    'userEmail': other_user.email,
                    'lastMessage': msg.content[:100] if msg.content else '',  # First 100 chars
                    'lastMessageTime': msg.created_at.isoformat() if msg.created_at else None,
                    'unreadCount': unread_count,
                    'lastMessageId': msg.id,
                    'lastMessageStatus': msg.status
                }
        
        # Sort by most recent message first
        conversations_list = sorted(
            conversations_dict.values(),
            key=lambda x: x['lastMessageTime'] or '',
            reverse=True
        )
        
        return jsonify({
            'success': True,
            'conversations': conversations_list,
            'total': len(conversations_list)
        }), 200
    
    except Exception as e:
        print(f'[Error] get_conversations: {str(e)}')
        return jsonify({'error': str(e)}), 500

@messages_bp.route('/conversations/<user_id>/messages', methods=['GET'])
@jwt_required()
def get_conversation_thread(user_id):
    """
    Get all messages in a conversation with a specific user.
    Automatically marks unread messages as read.
    """
    try:
        current_user_id = get_jwt_identity()
        
        # Validate current user
        current_user = User.query.get(current_user_id)
        if not current_user:
            return jsonify({'error': 'Current user not found'}), 404
        
        # Get other user
        other_user = User.query.get(user_id)
        if not other_user:
            return jsonify({'error': 'Conversation user not found'}), 404
        
        # Get all messages between the two users, ordered chronologically
        messages = Message.query.filter(
            ((Message.sender_id == current_user_id) & (Message.receiver_id == user_id)) |
            ((Message.sender_id == user_id) & (Message.receiver_id == current_user_id))
        ).order_by(Message.created_at.asc()).all()
        
        # Mark all received unread messages as read
        unread_count = 0
        for msg in messages:
            if msg.receiver_id == current_user_id and msg.status == 'unread':
                msg.status = 'read'
                msg.read_at = datetime.utcnow()
                unread_count += 1
        
        if unread_count > 0:
            db.session.commit()
        
        return jsonify({
            'success': True,
            'messages': [msg.to_dict() for msg in messages],
            'total': len(messages),
            'other_user': other_user.to_dict(),
            'marked_as_read': unread_count
        }), 200
    
    except Exception as e:
        db.session.rollback()
        print(f'[Error] get_conversation_thread: {str(e)}')
        return jsonify({'error': str(e)}), 500

@messages_bp.route('/conversations/<user_id>/send', methods=['POST'])
@jwt_required()
def send_conversation_message(user_id):
    """
    Send a message to a specific user in a conversation.
    
    Request JSON:
    {
        "content": "Message content",
        "subject": "Optional subject",
        "item_id": "Optional item ID",
        "message_type": "Optional message type (inquiry, claim_verification, update)"
    }
    """
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        
        if not current_user:
            return jsonify({'error': 'Current user not found'}), 404
        
        # Verify receiver exists
        receiver = User.query.get(user_id)
        if not receiver:
            return jsonify({'error': 'Recipient not found'}), 404
        
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        content = data.get('content', '').strip()
        
        if not content:
            return jsonify({'error': 'Message content is required'}), 400
        
        if len(content) > 5000:
            return jsonify({'error': 'Message content cannot exceed 5000 characters'}), 400
        
        # Verify item exists if provided
        item_id = data.get('item_id')
        if item_id:
            item = Item.query.get(item_id)
            if not item:
                return jsonify({'error': 'Item not found'}), 404
        
        # Create message with proper defaults
        message = Message(
            subject=data.get('subject', 'Message') or 'Message',
            content=content,
            message_type=data.get('message_type', 'inquiry'),
            sender_id=current_user_id,
            receiver_id=user_id,
            item_id=item_id,
            status='unread'
        )
        
        db.session.add(message)
        db.session.commit()
        
        # Return full message object with all fields
        return jsonify({
            'success': True,
            'message': 'Message sent successfully',
            'data': message.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        print(f'[Error] send_conversation_message: {str(e)}')
        return jsonify({'error': f'Failed to send message: {str(e)}'}), 500

@messages_bp.route('/<message_id>/star', methods=['POST'])
@jwt_required()
def toggle_star_message(message_id):
    """Toggle star status on a message."""
    try:
        user_id = get_jwt_identity()
        message = Message.query.get(message_id)
        
        if not message:
            return jsonify({'error': 'Message not found'}), 404
        
        # Check authorization
        if message.receiver_id != user_id and message.sender_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        # Toggle star status
        message.is_starred = not message.is_starred
        db.session.commit()
        
        return jsonify({
            'message': 'Message starred' if message.is_starred else 'Message unstarred',
            'data': message.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@messages_bp.route('/<message_id>/react', methods=['POST'])
@jwt_required()
def add_reaction(message_id):
    """Add or remove emoji reaction to a message."""
    try:
        user_id = get_jwt_identity()
        message = Message.query.get(message_id)
        
        if not message:
            return jsonify({'error': 'Message not found'}), 404
        
        # Check authorization
        if message.receiver_id != user_id and message.sender_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.get_json()
        emoji = data.get('emoji')
        
        if not emoji:
            return jsonify({'error': 'Emoji is required'}), 400
        
        # Initialize reactions dict if empty
        if not message.reactions:
            message.reactions = {}
        
        # Toggle reaction
        if emoji in message.reactions:
            if user_id in message.reactions[emoji]:
                message.reactions[emoji].remove(user_id)
                if not message.reactions[emoji]:
                    del message.reactions[emoji]
            else:
                message.reactions[emoji].append(user_id)
        else:
            message.reactions[emoji] = [user_id]
        
        db.session.commit()
        
        return jsonify({
            'message': 'Reaction added',
            'data': message.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@messages_bp.route('/<message_id>/reply', methods=['POST'])
@jwt_required()
def reply_to_message(message_id):
    """Send a reply to a specific message."""
    try:
        current_user_id = get_jwt_identity()
        original_message = Message.query.get(message_id)
        
        if not original_message:
            return jsonify({'error': 'Original message not found'}), 404
        
        # Check authorization
        if original_message.receiver_id != current_user_id and original_message.sender_id != current_user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.get_json()
        
        if not data or not data.get('content'):
            return jsonify({'error': 'Message content is required'}), 400
        
        # Determine receiver: reply goes to the sender of the original message
        receiver_id = original_message.sender_id if original_message.receiver_id == current_user_id else original_message.receiver_id
        
        # Create reply message
        reply_message = Message(
            subject='Re: ' + original_message.subject,
            content=data.get('content'),
            message_type=original_message.message_type,
            sender_id=current_user_id,
            receiver_id=receiver_id,
            item_id=original_message.item_id,
            replied_to_message_id=message_id,
            status='unread'
        )
        
        db.session.add(reply_message)
        db.session.commit()
        
        return jsonify({
            'message': 'Reply sent successfully',
            'data': reply_message.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@messages_bp.route('/<message_id>/copy', methods=['GET'])
@jwt_required()
def copy_message(message_id):
    """Get message content for copying."""
    try:
        user_id = get_jwt_identity()
        message = Message.query.get(message_id)
        
        if not message:
            return jsonify({'error': 'Message not found'}), 404
        
        # Check authorization
        if message.receiver_id != user_id and message.sender_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        return jsonify({
            'content': message.content,
            'subject': message.subject
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@messages_bp.route('/admin', methods=['GET'])
@jwt_required()
def get_admin_user():
    """
    Get the admin user for contact.
    Returns the first active admin user available in the system.
    """
    try:
        # Try to get an active admin
        admin = User.query.filter_by(role='admin', is_active=True).first()
        
        # If no active admin, get any admin
        if not admin:
            admin = User.query.filter_by(role='admin').first()
        
        if not admin:
            return jsonify({
                'error': 'No admin available',
                'success': False
            }), 404
        
        return jsonify({
            'success': True,
            'admin': {
                'id': admin.id,
                'name': admin.name,
                'email': admin.email,
                'role': admin.role,
                'is_active': admin.is_active
            }
        }), 200
    
    except Exception as e:
        print(f'[Error] get_admin_user: {str(e)}')
        return jsonify({'error': str(e), 'success': False}), 500

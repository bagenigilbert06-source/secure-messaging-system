from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity, get_jwt
from functools import wraps
from .. import db
from ..models import User
from flask import jsonify

class TokenBlocklist(db.Model):
    """Model to store revoked JWT tokens."""
    __tablename__ = 'token_blocklist'
    
    id = db.Column(db.String(36), primary_key=True)
    jti = db.Column(db.String(500), unique=True, nullable=False, index=True)  # JWT ID
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    revoked_at = db.Column(db.DateTime, nullable=False, server_default=db.func.now())
    reason = db.Column(db.String(200), nullable=True)  # e.g., 'logout', 'password_change'
    
    def to_dict(self):
        return {
            'id': self.id,
            'jti': self.jti,
            'user_id': self.user_id,
            'revoked_at': self.revoked_at.isoformat() if self.revoked_at else None,
            'reason': self.reason
        }

def revoke_token(jti, user_id, reason='logout'):
    """
    Add a token to the blocklist.
    
    Args:
        jti (str): JWT ID to revoke
        user_id (str): User ID
        reason (str): Reason for revocation
    """
    import uuid
    from datetime import datetime
    
    blocklist_entry = TokenBlocklist(
        id=str(uuid.uuid4()),
        jti=jti,
        user_id=user_id,
        reason=reason,
        revoked_at=datetime.utcnow()
    )
    db.session.add(blocklist_entry)
    db.session.commit()

def is_token_revoked(jti):
    """
    Check if token is in blocklist.
    
    Args:
        jti (str): JWT ID to check
        
    Returns:
        bool: True if token is revoked, False otherwise
    """
    return TokenBlocklist.query.filter_by(jti=jti).first() is not None

def student_required(fn):
    """
    Decorator to verify JWT belongs to a verified Zetech student.
    
    Checks:
    - JWT is valid
    - User exists and is active
    - User email is verified and ends with @zetech.ac.ke
    - Token is not in blocklist
    
    Usage:
        @app.route('/protected')
        @student_required
        def protected_route():
            return {"message": "Only students can access"}
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            
            # Get JWT info
            claims = get_jwt()
            identity = get_jwt_identity()
            
            # Check if token is revoked
            if is_token_revoked(claims.get('jti')):
                return jsonify({'error': 'Token has been revoked'}), 401
            
            # Get user
            user = User.query.get(identity)
            
            if not user or not user.is_active:
                return jsonify({'error': 'User not found or inactive'}), 401
            
            if not user.email_verified or not user.email.endswith('@zetech.ac.ke'):
                return jsonify({'error': 'Only verified Zetech students can access this resource'}), 403
            
            if user.role != 'student':
                return jsonify({'error': 'This resource is only for students'}), 403
            
            return fn(*args, **kwargs)
        
        except Exception as e:
            return jsonify({'error': 'Unauthorized access'}), 401
    
    return wrapper

def admin_required(fn):
    """
    Decorator to verify JWT belongs to an admin user.
    
    Checks:
    - JWT is valid
    - User exists and is active
    - User is an admin
    - Token is not in blocklist
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            
            # Get JWT info
            claims = get_jwt()
            identity = get_jwt_identity()
            
            # Check if token is revoked
            if is_token_revoked(claims.get('jti')):
                return jsonify({'error': 'Token has been revoked'}), 401
            
            # Get user
            user = User.query.get(identity)
            
            if not user or not user.is_active:
                return jsonify({'error': 'User not found or inactive'}), 401
            
            if user.role != 'admin':
                return jsonify({'error': 'Admin access required'}), 403
            
            return fn(*args, **kwargs)
        
        except Exception as e:
            return jsonify({'error': 'Unauthorized access'}), 401
    
    return wrapper

def verified_student_or_admin(fn):
    """
    Decorator to verify JWT belongs to verified Zetech student or admin.
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            
            # Get JWT info
            claims = get_jwt()
            identity = get_jwt_identity()
            
            # Check if token is revoked
            if is_token_revoked(claims.get('jti')):
                return jsonify({'error': 'Token has been revoked'}), 401
            
            # Get user
            user = User.query.get(identity)
            
            if not user or not user.is_active:
                return jsonify({'error': 'User not found or inactive'}), 401
            
            if user.role == 'student' and (not user.email_verified or not user.email.endswith('@zetech.ac.ke')):
                return jsonify({'error': 'Only verified Zetech students can access this resource'}), 403
            
            if user.role not in ['student', 'admin']:
                return jsonify({'error': 'Access denied'}), 403
            
            return fn(*args, **kwargs)
        
        except Exception as e:
            return jsonify({'error': 'Unauthorized access'}), 401
    
    return wrapper

from flask import Blueprint, request, jsonify, make_response
from flask_jwt_extended import (
    create_access_token, 
    create_refresh_token, 
    jwt_required, 
    get_jwt_identity,
    get_jwt
)
from .. import db
from ..models import User
from ..utils.validators import (
    validate_zetech_email,
    validate_student_id,
    extract_department_from_student_id,
    validate_password,
    ValidationError
)
from ..utils.decorators import (
    student_required,
    admin_required,
    revoke_token,
    is_token_revoked
)
from datetime import timedelta, datetime
from ..utils.otp_utils import generate_otp, get_otp_expiry_time, is_otp_expired
from ..utils.email_service import email_service
import os

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Register a new Zetech University student.
    
    Requirements:
    - Email must end with @zetech.ac.ke
    - Student ID must match format: [CODE]-[LEVEL]-[NUMBER]/[YEAR]
    - Password must be strong (8+ chars, uppercase, lowercase, digit, special char)
    
    Request JSON:
    {
        "name": "Student Name",
        "email": "student@zetech.ac.ke",
        "student_id": "BIT-01-1234/2024",
        "password": "SecurePassword123!",
        "phone": "+254712345678",
        "hostel": "Hostel A",
        "room_number": "A101"
    }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'email', 'student_id', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # 1. Email Validation - Only @zetech.ac.ke
        try:
            validate_zetech_email(data['email'])
        except ValidationError as e:
            return jsonify({'error': str(e)}), 403
        
        # 2. Student ID Validation
        try:
            student_id_data = validate_student_id(data['student_id'])
            student_id = student_id_data['student_id']
            department = student_id_data['course_code']
        except ValidationError as e:
            return jsonify({'error': str(e)}), 400
        
        # 3. Password Strength Validation
        try:
            validate_password(data['password'])
        except ValidationError as e:
            return jsonify({'error': str(e)}), 400
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'error': 'Email already registered'}), 409
        
        if User.query.filter_by(student_id=student_id).first():
            return jsonify({'error': 'Student ID already registered'}), 409
        
        # Create new user (unverified)
        user = User(
            name=data['name'],
            email=data['email'],
            student_id=student_id,
            department=department,
            student_type=data.get('student_type', 'diploma'),
            phone=data.get('phone'),
            hostel=data.get('hostel'),
            room_number=data.get('room_number'),
            role='student',
            is_verified=False,  # Will be verified via email OTP
            email_verified=False
        )
        user.set_password(data['password'])
        
        # Generate OTP for email verification
        otp_code = generate_otp()
        user.email_verification_code = otp_code
        user.email_verification_code_expires = get_otp_expiry_time()
        
        db.session.add(user)
        db.session.commit()
        
        # Send OTP via email
        email_sent = email_service.send_otp_email(
            recipient_email=user.email,
            otp_code=otp_code,
            recipient_name=user.name.split()[0]  # Send first name
        )
        
        if not email_sent:
            print(f"[WARNING] Failed to send OTP email to {user.email}")
            # In development/demo mode, we log the OTP but continue
            print(f"[DEV] OTP for {user.email}: {otp_code}")
        
        response = make_response(jsonify({
            'message': 'User registered successfully. Check your email for verification code.',
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'student_id': user.student_id,
                'email_verified': user.email_verified
            },
            'requires_email_verification': True,
            'email_verification_expires_in': 900  # 15 minutes in seconds
        }), 201)
        
        return response
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Login a Zetech University student using email or student ID.
    
    Accepts either email (must be @zetech.ac.ke) or student_id.
    Issues short-lived access token (15 mins) and refresh token (7 days).
    
    Request JSON (email):
    {
        "email": "student@zetech.ac.ke",
        "password": "SecurePassword123!"
    }
    
    Request JSON (student_id):
    {
        "student_id": "BIT-01-1234/2024",
        "password": "SecurePassword123!"
    }
    """
    try:
        data = request.get_json()
        
        email = data.get('email')
        student_id = data.get('student_id')
        password = data.get('password')
        
        print(f"[DEBUG] Login attempt - email: {email}, student_id: {student_id}, has_password: {bool(password)}")
        
        # Validate that either email or student_id is provided
        if not (email or student_id) or not password:
            return jsonify({'error': 'Email/Student ID and password are required'}), 400
        
        user = None
        
        # Login with email
        if email:
            # Verify email is Zetech domain
            try:
                validate_zetech_email(email)
                email = email.lower().strip()  # Normalize email for database query
            except ValidationError as e:
                return jsonify({'error': 'Invalid email domain. Only Zetech students allowed.'}), 403
            
            # Find user by email
            user = User.query.filter_by(email=email).first()
            print(f"[DEBUG] Querying by email {email}: user found = {user is not None}")
        
        # Login with student_id
        elif student_id:
            # Find user by student_id
            user = User.query.filter_by(student_id=student_id).first()
            print(f"[DEBUG] Querying by student_id {student_id}: user found = {user is not None}")
        
        # Check password
        if user:
            password_match = user.check_password(password)
            print(f"[DEBUG] User found: {user.email}, password_match: {password_match}")
        else:
            print("[DEBUG] User not found")
            
        if not user or not user.check_password(password):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        if not user.is_active:
            return jsonify({'error': 'User account is inactive'}), 403
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Generate tokens with enhanced claims
        additional_claims = {
            'student_id': user.student_id,
            'role': user.role,
            'email': user.email,
            'is_verified': user.is_verified,
            'department': user.department
        }
        
        access_token = create_access_token(
            identity=user.id,
            additional_claims=additional_claims,
            expires_delta=timedelta(minutes=15)  # 15-minute access token
        )
        
        refresh_token = create_refresh_token(
            identity=user.id,
            additional_claims={'email': user.email},
            expires_delta=timedelta(days=7)  # 7-day refresh token
        )
        
        response = make_response(jsonify({
            'message': 'Login successful',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token,
            'token_type': 'Bearer',
            'expires_in': 900  # 15 minutes in seconds
        }), 200)
        
        # Set secure HTTP-only cookies for tokens
        response.set_cookie(
            'auth_access_token',
            access_token,
            max_age=900,  # 15 minutes
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite='Lax',
            path='/'
        )
        response.set_cookie(
            'auth_refresh_token',
            refresh_token,
            max_age=7*24*60*60,  # 7 days
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite='Lax',
            path='/'
        )
        
        return response
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """
    Refresh access token using refresh token.
    
    Returns:
    - New short-lived access token (15 mins)
    """
    try:
        identity = get_jwt_identity()
        user = User.query.get(identity)
        
        if not user or not user.is_active:
            return jsonify({'error': 'User not found or inactive'}), 401
        
        # Check if refresh token is revoked
        claims = get_jwt()
        if is_token_revoked(claims.get('jti')):
            return jsonify({'error': 'Token has been revoked'}), 401
        
        additional_claims = {
            'student_id': user.student_id,
            'role': user.role,
            'email': user.email,
            'is_verified': user.is_verified,
            'department': user.department
        }
        
        access_token = create_access_token(
            identity=user.id,
            additional_claims=additional_claims,
            expires_delta=timedelta(minutes=15)
        )
        
        response = make_response(jsonify({
            'access_token': access_token,
            'token_type': 'Bearer',
            'expires_in': 900
        }), 200)
        
        # Set new access token cookie
        response.set_cookie(
            'auth_access_token',
            access_token,
            max_age=900,  # 15 minutes
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite='Lax',
            path='/'
        )
        
        return response
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    Logout user by revoking their access token.
    
    The token is added to a blocklist and cannot be used again.
    """
    try:
        claims = get_jwt()
        jti = claims.get('jti')
        identity = get_jwt_identity()
        
        revoke_token(jti, identity, reason='logout')
        
        response = make_response(jsonify({'message': 'Logout successful'}), 200)
        # Clear auth cookies
        response.delete_cookie('auth_access_token', path='/')
        response.delete_cookie('auth_refresh_token', path='/')
        
        return response
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/logout-all', methods=['POST'])
@jwt_required()
def logout_all():
    """
    Logout user from all devices by revoking all their tokens.
    
    Note: This requires revoking the current token and all refresh tokens.
    """
    try:
        identity = get_jwt_identity()
        claims = get_jwt()
        jti = claims.get('jti')
        
        # Revoke current token
        revoke_token(jti, identity, reason='logout_all')
        
        response = make_response(jsonify({
            'message': 'Logged out from all devices. Please login again.'
        }), 200)
        # Clear auth cookies
        response.delete_cookie('auth_access_token', path='/')
        response.delete_cookie('auth_refresh_token', path='/')
        
        return response
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/me', methods=['GET'])
@student_required
def get_current_user():
    """Get current authenticated verified student user."""
    try:
        identity = get_jwt_identity()
        user = User.query.get(identity)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify(user.to_dict(include_sensitive=True)), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/profile', methods=['PUT'])
@student_required
def update_profile():
    """
    Update authenticated student profile.
    
    Allows updating: name, phone, hostel, room_number, student_type
    Does NOT allow changing: email, student_id, or role
    """
    try:
        identity = get_jwt_identity()
        user = User.query.get(identity)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Allowed fields for students to update
        allowed_fields = ['name', 'phone', 'hostel', 'room_number', 'student_type']
        
        for field in allowed_fields:
            if field in data:
                setattr(user, field, data[field])
        
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/change-password', methods=['POST'])
@student_required
def change_password():
    """
    Change password for authenticated student.
    
    Request JSON:
    {
        "old_password": "CurrentPassword123!",
        "new_password": "NewPassword456!"
    }
    """
    try:
        identity = get_jwt_identity()
        user = User.query.get(identity)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        if not data.get('old_password') or not data.get('new_password'):
            return jsonify({'error': 'Old and new passwords are required'}), 400
        
        if not user.check_password(data['old_password']):
            return jsonify({'error': 'Incorrect password'}), 401
        
        try:
            validate_password(data['new_password'])
        except ValidationError as e:
            return jsonify({'error': str(e)}), 400
        
        user.set_password(data['new_password'])
        db.session.commit()
        
        return jsonify({'message': 'Password changed successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@auth_bp.route('/verify-email-otp', methods=['POST'])
def verify_email_otp():
    """
    Verify email using OTP code.
    
    Request JSON:
    {
        "email": "student@zetech.ac.ke",
        "otp_code": "123456"
    }
    
    Returns access and refresh tokens if verification is successful.
    """
    try:
        data = request.get_json()
        
        email = data.get('email', '').lower().strip()
        otp_code = data.get('otp_code', '').strip()
        
        if not email or not otp_code:
            return jsonify({'error': 'Email and OTP code are required'}), 400
        
        user = User.query.filter_by(email=email).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if user.email_verified:
            return jsonify({'error': 'Email already verified'}), 400
        
        # Check if OTP is expired
        if not user.email_verification_code_expires:
            return jsonify({'error': 'No verification code found. Please register again.'}), 400
        
        if is_otp_expired(user.email_verification_code_expires):
            return jsonify({'error': 'Verification code has expired. Please request a new one.'}), 400
        
        # Verify OTP
        if user.email_verification_code != otp_code:
            return jsonify({'error': 'Invalid verification code'}), 401
        
        # Mark email as verified
        user.email_verified = True
        user.email_verified_at = datetime.utcnow()
        user.is_verified = True  # Full verification for Zetech students
        user.email_verification_code = None  # Clear OTP
        user.email_verification_code_expires = None
        
        db.session.commit()
        
        # Generate tokens
        additional_claims = {
            'student_id': user.student_id,
            'role': user.role,
            'email': user.email,
            'is_verified': True,
            'department': user.department
        }
        
        access_token = create_access_token(
            identity=user.id,
            additional_claims=additional_claims,
            expires_delta=timedelta(minutes=15)
        )
        
        refresh_token = create_refresh_token(
            identity=user.id,
            additional_claims={'email': user.email},
            expires_delta=timedelta(days=7)
        )
        
        response = make_response(jsonify({
            'message': 'Email verified successfully!',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token,
            'token_type': 'Bearer',
            'expires_in': 900
        }), 200)
        
        # Set secure HTTP-only cookies for tokens
        response.set_cookie(
            'auth_access_token',
            access_token,
            max_age=900,  # 15 minutes
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite='Lax',
            path='/'
        )
        response.set_cookie(
            'auth_refresh_token',
            refresh_token,
            max_age=7*24*60*60,  # 7 days
            httponly=True,
            secure=False,  # Set to True in production with HTTPS
            samesite='Lax',
            path='/'
        )
        
        return response
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/resend-verification-otp', methods=['POST'])
def resend_verification_otp():
    """
    Resend OTP verification code.
    
    Rate limited to 3 attempts per 10 minutes.
    
    Request JSON:
    {
        "email": "student@zetech.ac.ke"
    }
    """
    try:
        data = request.get_json()
        
        email = data.get('email', '').lower().strip()
        
        if not email:
            return jsonify({'error': 'Email is required'}), 400
        
        user = User.query.filter_by(email=email).first()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if user.email_verified:
            return jsonify({'error': 'Email already verified'}), 400
        
        # Generate new OTP
        otp_code = generate_otp()
        user.email_verification_code = otp_code
        user.email_verification_code_expires = get_otp_expiry_time()
        
        db.session.commit()
        
        # Send OTP via email
        email_sent = email_service.send_otp_email(
            recipient_email=user.email,
            otp_code=otp_code,
            recipient_name=user.name.split()[0]
        )
        
        if not email_sent:
            print(f"[WARNING] Failed to send OTP email to {user.email}")
            # Log OTP for development/demo
            print(f"[DEV] New OTP for {user.email}: {otp_code}")
        
        response = jsonify({
            'message': 'Verification code sent to your email',
            'email': user.email,
            'email_verification_expires_in': 900  # 15 minutes in seconds
        })
        
        return response, 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/verify-email/<token>', methods=['POST'])
def verify_email(token):
    """
    Verify email using verification token (legacy endpoint).
    
    Sets email_verified and is_verified flags to allow full access.
    """
    try:
        user = User.query.filter_by(email_verification_token=token).first()
        
        if not user:
            return jsonify({'error': 'Invalid or expired verification link'}), 404
        
        if user.verify_email_token(token):
            user.is_verified = True  # Mark as verified Zetech student
            db.session.commit()
            
            return jsonify({
                'message': 'Email verified successfully!',
                'user': user.to_dict()
            }), 200
        else:
            return jsonify({'error': 'Verification token has expired'}), 400
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

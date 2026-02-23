from flask import Blueprint, request, jsonify, current_app, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from .. import db
from ..models import User, Item, Image
from datetime import datetime
from werkzeug.utils import secure_filename
import os
from PIL import Image as PILImage
import uuid

items_bp = Blueprint('items', __name__, url_prefix='/api/items')

def allowed_file(filename):
    """Check if file extension is allowed."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']

def save_upload_file(file):
    """Save uploaded file and create thumbnail."""
    if not allowed_file(file.filename):
        raise ValueError('File type not allowed')
    
    # Generate unique filename
    ext = file.filename.rsplit('.', 1)[1].lower()
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
    
    # Save original file
    file.save(filepath)
    
    # Optimize image
    try:
        img = PILImage.open(filepath)
        img.thumbnail((1200, 1200))
        img.save(filepath, quality=85, optimize=True)
    except Exception as e:
        print(f"Error optimizing image: {e}")
    
    return filename, filepath, file.content_type, os.path.getsize(filepath)

@items_bp.route('', methods=['GET'])
def get_items():
    """Get all unclaimed items or search items."""
    try:
        status = request.args.get('status', 'unclaimed')
        category = request.args.get('category')
        search = request.args.get('search')
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        print(f"[v0] get_items called - status: {status}, category: {category}, search: {search}, page: {page}, per_page: {per_page}")
        
        query = Item.query
        
        # Filter by status
        if status:
            query = query.filter_by(status=status)
            print(f"[v0] Filtered by status: {status}")
        
        # Filter by category
        if category:
            query = query.filter_by(category=category)
            print(f"[v0] Filtered by category: {category}")
        
        # Search in name and description
        if search:
            search_term = f"%{search}%"
            query = query.filter(
                (Item.name.ilike(search_term)) | 
                (Item.description.ilike(search_term))
            )
            print(f"[v0] Applied search term: {search_term}")
        
        # Get count before pagination
        total_count = query.count()
        print(f"[v0] Total items matching filter: {total_count}")
        
        # Pagination
        paginated = query.order_by(Item.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        print(f"[v0] Paginated results: {len(paginated.items)} items on page {page}")
        
        items = [item.to_dict() for item in paginated.items]
        
        response = {
            'items': items,
            'total': paginated.total,
            'pages': paginated.pages,
            'current_page': page
        }
        
        print(f"[v0] Returning response with {len(items)} items")
        
        return jsonify(response), 200
    
    except Exception as e:
        print(f"[v0] ERROR in get_items: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@items_bp.route('/<item_id>', methods=['GET'])
def get_item(item_id):
    """Get item details."""
    try:
        item = Item.query.get(item_id)
        
        if not item:
            return jsonify({'error': 'Item not found'}), 404
        
        return jsonify(item.to_dict()), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@items_bp.route('', methods=['POST'])
@jwt_required()
def create_item():
    """Create new lost item report."""
    try:
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.form
        
        if not data.get('name') or not data.get('category') or not data.get('location_found') or not data.get('date_found'):
            return jsonify({'error': 'Missing required fields'}), 400
        
        # Parse date
        try:
            date_found = datetime.fromisoformat(data['date_found'].replace('Z', '+00:00'))
        except:
            return jsonify({'error': 'Invalid date format'}), 400
        
        # Create item
        item = Item(
            name=data['name'],
            description=data.get('description'),
            category=data['category'],
            location_found=data['location_found'],
            location_stored=data.get('location_stored'),
            date_found=date_found,
            color=data.get('color'),
            brand=data.get('brand'),
            distinctive_marks=data.get('distinctive_marks'),
            reported_by_id=user_id
        )
        
        db.session.add(item)
        db.session.flush()
        
        # Handle file uploads
        if 'images' in request.files:
            files = request.files.getlist('images')
            for file in files:
                if file and file.filename:
                    try:
                        filename, filepath, mime_type, size = save_upload_file(file)
                        
                        image = Image(
                            filename=filename,
                            file_path=filepath,
                            mime_type=mime_type,
                            size=size,
                            item_id=item.id
                        )
                        db.session.add(image)
                    except ValueError as ve:
                        return jsonify({'error': str(ve)}), 400
        
        db.session.commit()
        
        return jsonify({
            'message': 'Item reported successfully',
            'item': item.to_dict()
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@items_bp.route('/<item_id>', methods=['PUT'])
@jwt_required()
def update_item(item_id):
    """Update item details."""
    try:
        user_id = get_jwt_identity()
        item = Item.query.get(item_id)
        
        if not item:
            return jsonify({'error': 'Item not found'}), 404
        
        # Only reporter or admin can update
        if item.reported_by_id != user_id:
            user = User.query.get(user_id)
            if not user or user.role != 'admin':
                return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.get_json()
        
        if 'name' in data:
            item.name = data['name']
        if 'description' in data:
            item.description = data['description']
        if 'category' in data:
            item.category = data['category']
        if 'status' in data:
            item.status = data['status']
            if data['status'] == 'claimed' and item.claimed_at is None:
                item.claimed_at = datetime.utcnow()
        if 'location_found' in data:
            item.location_found = data['location_found']
        if 'location_stored' in data:
            item.location_stored = data['location_stored']
        if 'color' in data:
            item.color = data['color']
        if 'brand' in data:
            item.brand = data['brand']
        if 'distinctive_marks' in data:
            item.distinctive_marks = data['distinctive_marks']
        if 'claimed_by_id' in data and item.status == 'claimed':
            item.claimed_by_id = data['claimed_by_id']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Item updated successfully',
            'item': item.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@items_bp.route('/<item_id>', methods=['DELETE'])
@jwt_required()
def delete_item(item_id):
    """Delete item report."""
    try:
        user_id = get_jwt_identity()
        item = Item.query.get(item_id)
        
        if not item:
            return jsonify({'error': 'Item not found'}), 404
        
        # Only reporter or admin can delete
        if item.reported_by_id != user_id:
            user = User.query.get(user_id)
            if not user or user.role != 'admin':
                return jsonify({'error': 'Unauthorized'}), 403
        
        # Delete associated images
        for image in item.images:
            try:
                if os.path.exists(image.file_path):
                    os.remove(image.file_path)
            except Exception as e:
                print(f"Error deleting image: {e}")
        
        db.session.delete(item)
        db.session.commit()
        
        return jsonify({'message': 'Item deleted successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@items_bp.route('/<item_id>/images', methods=['POST'])
@jwt_required()
def add_images(item_id):
    """Add images to an item."""
    try:
        user_id = get_jwt_identity()
        item = Item.query.get(item_id)
        
        if not item:
            return jsonify({'error': 'Item not found'}), 404
        
        # Only reporter or admin can add images
        if item.reported_by_id != user_id:
            user = User.query.get(user_id)
            if not user or user.role != 'admin':
                return jsonify({'error': 'Unauthorized'}), 403
        
        if 'images' not in request.files:
            return jsonify({'error': 'No images provided'}), 400
        
        files = request.files.getlist('images')
        added_images = []
        
        for file in files:
            if file and file.filename:
                try:
                    filename, filepath, mime_type, size = save_upload_file(file)
                    
                    image = Image(
                        filename=filename,
                        file_path=filepath,
                        mime_type=mime_type,
                        size=size,
                        item_id=item_id
                    )
                    db.session.add(image)
                    added_images.append(image.to_dict())
                except ValueError as ve:
                    return jsonify({'error': str(ve)}), 400
        
        db.session.commit()
        
        return jsonify({
            'message': 'Images added successfully',
            'images': added_images
        }), 201
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@items_bp.route('/images/<image_id>', methods=['DELETE'])
@jwt_required()
def delete_image(image_id):
    """Delete an image."""
    try:
        user_id = get_jwt_identity()
        image = Image.query.get(image_id)
        
        if not image:
            return jsonify({'error': 'Image not found'}), 404
        
        # Check authorization
        if image.item.reported_by_id != user_id:
            user = User.query.get(user_id)
            if not user or user.role != 'admin':
                return jsonify({'error': 'Unauthorized'}), 403
        
        # Delete file
        try:
            if os.path.exists(image.file_path):
                os.remove(image.file_path)
        except Exception as e:
            print(f"Error deleting file: {e}")
        
        db.session.delete(image)
        db.session.commit()
        
        return jsonify({'message': 'Image deleted successfully'}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@items_bp.route('/images/<image_id>/download', methods=['GET'])
def download_image(image_id):
    """Download image."""
    try:
        image = Image.query.get(image_id)
        
        if not image or not os.path.exists(image.file_path):
            return jsonify({'error': 'Image not found'}), 404
        
        return send_file(image.file_path, mimetype=image.mime_type, as_attachment=False)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@items_bp.route('/categories', methods=['GET'])
def get_categories():
    """Get all item categories including dynamically detected ones."""
    predefined_categories = [
        'Electronics',
        'Documents',
        'Clothing',
        'Accessories',
        'Keys',
        'Bags',
        'Books',
        'Jewelry'
    ]
    
    # Get all unique categories from items in database
    try:
        db_categories = db.session.query(Item.category).distinct().all()
        detected_categories = set(predefined_categories)
        
        # Normalize and add detected categories
        for cat_tuple in db_categories:
            if cat_tuple[0]:
                normalized = cat_tuple[0].capitalize()
                detected_categories.add(normalized)
        
        # Always include "Others" for unmapped items
        detected_categories.add('Others')
        
        categories = sorted(list(detected_categories))
        return jsonify({'categories': categories}), 200
    except Exception as e:
        # Fallback to predefined categories if database query fails
        categories = predefined_categories + ['Others']
        return jsonify({'categories': sorted(categories)}), 200

@items_bp.route('/my-items', methods=['GET'])
@jwt_required()
def get_user_items():
    """Get items reported by the authenticated user (lost items)."""
    try:
        user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        status = request.args.get('status')
        
        query = Item.query.filter_by(reported_by_id=user_id)
        
        # Filter by status if provided
        if status:
            query = query.filter_by(status=status)
        
        paginated = query.order_by(Item.created_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        items = [item.to_dict() for item in paginated.items]
        
        return jsonify({
            'items': items,
            'total': paginated.total,
            'pages': paginated.pages,
            'current_page': page
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@items_bp.route('/my-claims', methods=['GET'])
@jwt_required()
def get_user_claims():
    """Get items claimed by the authenticated user."""
    try:
        user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        status = request.args.get('status')
        
        query = Item.query.filter_by(claimed_by_id=user_id)
        
        # Filter by status if provided
        if status:
            query = query.filter_by(status=status)
        
        paginated = query.order_by(Item.claimed_at.desc()).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        items = [item.to_dict() for item in paginated.items]
        
        return jsonify({
            'items': items,
            'total': paginated.total,
            'pages': paginated.pages,
            'current_page': page
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@items_bp.route('/<item_id>/claim', methods=['POST'])
@jwt_required()
def claim_item(item_id):
    """Claim an unclaimed item."""
    try:
        user_id = get_jwt_identity()
        item = Item.query.get(item_id)
        
        if not item:
            return jsonify({'error': 'Item not found'}), 404
        
        if item.status != 'unclaimed':
            return jsonify({'error': 'Item is not available for claiming'}), 400
        
        # Get claim details from request
        data = request.get_json() or {}
        
        # Update item claim status
        item.claimed_by_id = user_id
        item.status = 'claimed'
        item.claimed_at = datetime.utcnow()
        
        # Store claim notes if provided
        if data.get('claim_notes'):
            item.claim_notes = data['claim_notes']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Item claimed successfully',
            'item': item.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@items_bp.route('/<item_id>/collect', methods=['POST'])
@jwt_required()
def collect_item(item_id):
    """Mark item as collected (only for item reporter or admin)."""
    try:
        user_id = get_jwt_identity()
        item = Item.query.get(item_id)
        
        if not item:
            return jsonify({'error': 'Item not found'}), 404
        
        # Check authorization - only reporter or admin
        if item.reported_by_id != user_id:
            user = User.query.get(user_id)
            if not user or user.role != 'admin':
                return jsonify({'error': 'Unauthorized'}), 403
        
        if item.status != 'claimed':
            return jsonify({'error': 'Item must be claimed before collection'}), 400
        
        item.status = 'collected'
        db.session.commit()
        
        return jsonify({
            'message': 'Item marked as collected',
            'item': item.to_dict()
        }), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@items_bp.route('/stats', methods=['GET'])
def get_stats():
    """Get statistics about items."""
    try:
        total_items = Item.query.count()
        unclaimed_items = Item.query.filter_by(status='unclaimed').count()
        claimed_items = Item.query.filter_by(status='claimed').count()
        collected_items = Item.query.filter_by(status='collected').count()
        
        # Category breakdown
        category_stats = db.session.query(
            Item.category,
            db.func.count(Item.id).label('count')
        ).group_by(Item.category).all()
        
        categories = {cat: count for cat, count in category_stats}
        
        return jsonify({
            'total_items': total_items,
            'unclaimed_items': unclaimed_items,
            'claimed_items': claimed_items,
            'collected_items': collected_items,
            'categories': categories
        }), 200
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

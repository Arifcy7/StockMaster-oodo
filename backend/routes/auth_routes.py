from flask import Blueprint, request, jsonify, current_app
from pymongo import MongoClient
from datetime import datetime
import os

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

def get_db():
    client = MongoClient(os.getenv('MONGO_URI'))
    return client['stockmaster']

@bp.route('/register', methods=['POST'])
def register():
    """Register a new user after Firebase authentication"""
    try:
        data = request.json
        db = get_db()
        
        # Check if user already exists
        existing_user = db.users.find_one({'email': data['email']})
        if existing_user:
            return jsonify({'error': 'User already exists'}), 400
        
        # Create new user document
        user_doc = {
            'firebase_uid': data.get('firebase_uid'),
            'name': data['name'],
            'email': data['email'],
            'role': data.get('role', 'staff'),  # admin, manager, staff
            'department': data.get('department', 'General'),
            'phone': data.get('phone'),
            'location': data.get('location', 'Main Office'),
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'status': 'active'
        }
        
        result = db.users.insert_one(user_doc)
        user_doc['_id'] = str(result.inserted_id)
        
        # Remove sensitive information
        user_doc.pop('firebase_uid', None)
        
        return jsonify({
            'message': 'User registered successfully',
            'user': user_doc
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/profile', methods=['GET'])
def get_profile():
    """Get user profile"""
    try:
        # In development mode, return mock user
        if os.getenv('FLASK_ENV') == 'development':
            return jsonify({
                'id': 'dev-user-123',
                'name': 'Development User',
                'email': 'dev@example.com',
                'role': 'admin',
                'department': 'IT',
                'location': 'Main Office',
                'status': 'active'
            })
        
        # Production logic would verify Firebase token
        # and fetch user from database
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'No token provided'}), 401
            
        # TODO: Implement Firebase token verification
        
        return jsonify({'message': 'Profile endpoint ready for Firebase integration'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/update-profile', methods=['PUT'])
def update_profile():
    """Update user profile"""
    try:
        data = request.json
        db = get_db()
        
        # In development mode, simulate update
        if os.getenv('FLASK_ENV') == 'development':
            return jsonify({
                'message': 'Profile updated successfully',
                'user': data
            })
        
        # TODO: Implement actual profile update with Firebase verification
        
        return jsonify({'message': 'Update profile endpoint ready for Firebase integration'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/users', methods=['GET'])
def get_users():
    """Get all users (admin only)"""
    try:
        db = get_db()
        
        # Mock data for development
        mock_users = [
            {
                'id': '1',
                'name': 'Admin User',
                'email': 'admin@stockmaster.com',
                'role': 'admin',
                'department': 'Management',
                'location': 'Head Office',
                'status': 'active',
                'created_at': '2024-01-01T00:00:00Z'
            },
            {
                'id': '2',
                'name': 'Inventory Manager',
                'email': 'manager@stockmaster.com',
                'role': 'manager',
                'department': 'Warehouse',
                'location': 'Warehouse A',
                'status': 'active',
                'created_at': '2024-01-02T00:00:00Z'
            },
            {
                'id': '3',
                'name': 'Staff Member',
                'email': 'staff@stockmaster.com',
                'role': 'staff',
                'department': 'Operations',
                'location': 'Warehouse B',
                'status': 'active',
                'created_at': '2024-01-03T00:00:00Z'
            }
        ]
        
        if os.getenv('FLASK_ENV') == 'development':
            return jsonify({'users': mock_users})
        
        # Production logic
        users = list(db.users.find({}, {'firebase_uid': 0}))
        for user in users:
            user['_id'] = str(user['_id'])
        
        return jsonify({'users': users})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import os

bp = Blueprint('users', __name__, url_prefix='/api/users')

def get_db():
    client = MongoClient(os.getenv('MONGO_URI'))
    return client['stockmaster']

def serialize_doc(doc):
    """Convert ObjectId to string in documents"""
    if doc is None:
        return None
    if isinstance(doc, list):
        return [serialize_doc(d) for d in doc]
    if isinstance(doc, dict):
        result = {}
        for key, value in doc.items():
            if isinstance(value, ObjectId):
                result[key] = str(value)
            elif isinstance(value, (dict, list)):
                result[key] = serialize_doc(value)
            else:
                result[key] = value
        return result
    return doc

@bp.route('/', methods=['GET'])
def get_users():
    """Get all users (admin only)"""
    try:
        if os.getenv('FLASK_ENV') == 'development':
            mock_users = [
                {
                    "id": "1",
                    "name": "Admin User",
                    "email": "admin@stockmaster.com",
                    "role": "admin",
                    "department": "Management",
                    "location": "Head Office",
                    "phone": "+1-555-0001",
                    "status": "active",
                    "last_login": "2024-01-21T08:00:00Z",
                    "created_at": "2024-01-01T00:00:00Z",
                    "updated_at": "2024-01-21T08:00:00Z"
                },
                {
                    "id": "2",
                    "name": "Inventory Manager",
                    "email": "manager@stockmaster.com",
                    "role": "manager",
                    "department": "Warehouse",
                    "location": "Warehouse A",
                    "phone": "+1-555-0002",
                    "status": "active",
                    "last_login": "2024-01-21T07:30:00Z",
                    "created_at": "2024-01-02T00:00:00Z",
                    "updated_at": "2024-01-21T07:30:00Z"
                },
                {
                    "id": "3",
                    "name": "Warehouse Staff",
                    "email": "staff@stockmaster.com",
                    "role": "staff",
                    "department": "Operations",
                    "location": "Warehouse B",
                    "phone": "+1-555-0003",
                    "status": "active",
                    "last_login": "2024-01-20T16:45:00Z",
                    "created_at": "2024-01-03T00:00:00Z",
                    "updated_at": "2024-01-20T16:45:00Z"
                },
                {
                    "id": "4",
                    "name": "Quality Inspector",
                    "email": "inspector@stockmaster.com",
                    "role": "staff",
                    "department": "Quality Control",
                    "location": "Main Store",
                    "phone": "+1-555-0004",
                    "status": "active",
                    "last_login": "2024-01-21T06:15:00Z",
                    "created_at": "2024-01-05T00:00:00Z",
                    "updated_at": "2024-01-21T06:15:00Z"
                }
            ]
            
            # Apply filters
            role_filter = request.args.get('role')
            department_filter = request.args.get('department')
            status_filter = request.args.get('status')
            
            filtered_users = mock_users
            
            if role_filter:
                filtered_users = [u for u in filtered_users if u['role'] == role_filter]
            
            if department_filter:
                filtered_users = [u for u in filtered_users if u['department'] == department_filter]
            
            if status_filter:
                filtered_users = [u for u in filtered_users if u['status'] == status_filter]
            
            return jsonify({
                'users': filtered_users,
                'total': len(filtered_users)
            })
        
        db = get_db()
        
        # Build query
        query = {}
        role_filter = request.args.get('role')
        if role_filter:
            query['role'] = role_filter
        
        department_filter = request.args.get('department')
        if department_filter:
            query['department'] = department_filter
        
        status_filter = request.args.get('status')
        if status_filter:
            query['status'] = status_filter
        
        users = list(db.users.find(query, {'firebase_uid': 0}))
        
        return jsonify({
            'users': serialize_doc(users),
            'total': len(users)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<user_id>', methods=['GET'])
def get_user(user_id):
    """Get a specific user by ID"""
    try:
        if os.getenv('FLASK_ENV') == 'development':
            mock_user = {
                "id": user_id,
                "name": "Admin User",
                "email": "admin@stockmaster.com",
                "role": "admin",
                "department": "Management",
                "location": "Head Office",
                "phone": "+1-555-0001",
                "status": "active",
                "permissions": [
                    "users.read",
                    "users.write",
                    "products.read",
                    "products.write",
                    "operations.read",
                    "operations.write",
                    "reports.read"
                ],
                "last_login": "2024-01-21T08:00:00Z",
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-21T08:00:00Z"
            }
            return jsonify({'user': mock_user})
        
        db = get_db()
        user = db.users.find_one({'_id': ObjectId(user_id)}, {'firebase_uid': 0})
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({'user': serialize_doc(user)})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/', methods=['POST'])
def create_user():
    """Create a new user (admin only)"""
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['name', 'email', 'role']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        if os.getenv('FLASK_ENV') == 'development':
            # Check if email already exists in mock data
            new_user = {
                "id": str(ObjectId()),
                "name": data['name'],
                "email": data['email'],
                "role": data['role'],
                "department": data.get('department', 'General'),
                "location": data.get('location', 'Main Office'),
                "phone": data.get('phone', ''),
                "status": "active",
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            return jsonify({
                'message': 'User created successfully',
                'user': new_user
            }), 201
        
        db = get_db()
        
        # Check if user already exists
        existing_user = db.users.find_one({'email': data['email']})
        if existing_user:
            return jsonify({'error': 'User with this email already exists'}), 400
        
        user_doc = {
            'name': data['name'],
            'email': data['email'],
            'role': data['role'],
            'department': data.get('department', 'General'),
            'location': data.get('location', 'Main Office'),
            'phone': data.get('phone', ''),
            'status': 'active',
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'created_by': getattr(request, 'user', {}).get('uid', 'system')
        }
        
        result = db.users.insert_one(user_doc)
        user_doc['_id'] = str(result.inserted_id)
        
        # Remove sensitive info
        user_doc.pop('firebase_uid', None)
        
        return jsonify({
            'message': 'User created successfully',
            'user': serialize_doc(user_doc)
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<user_id>', methods=['PUT'])
def update_user(user_id):
    """Update a user (admin only)"""
    try:
        data = request.json
        
        if os.getenv('FLASK_ENV') == 'development':
            updated_user = {
                **data,
                'id': user_id,
                'updated_at': datetime.utcnow().isoformat()
            }
            return jsonify({
                'message': 'User updated successfully',
                'user': updated_user
            })
        
        db = get_db()
        
        # Check if user exists
        existing_user = db.users.find_one({'_id': ObjectId(user_id)})
        if not existing_user:
            return jsonify({'error': 'User not found'}), 404
        
        # Don't allow updating email if it would conflict
        if 'email' in data and data['email'] != existing_user['email']:
            email_exists = db.users.find_one({'email': data['email'], '_id': {'$ne': ObjectId(user_id)}})
            if email_exists:
                return jsonify({'error': 'Email already in use by another user'}), 400
        
        data['updated_at'] = datetime.utcnow()
        data['updated_by'] = getattr(request, 'user', {}).get('uid', 'system')
        
        db.users.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': data}
        )
        
        updated_user = db.users.find_one({'_id': ObjectId(user_id)}, {'firebase_uid': 0})
        
        return jsonify({
            'message': 'User updated successfully',
            'user': serialize_doc(updated_user)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<user_id>', methods=['DELETE'])
def delete_user(user_id):
    """Delete/deactivate a user (admin only)"""
    try:
        if os.getenv('FLASK_ENV') == 'development':
            return jsonify({'message': 'User deleted successfully'})
        
        db = get_db()
        
        # Instead of deleting, we'll deactivate the user
        result = db.users.update_one(
            {'_id': ObjectId(user_id)},
            {
                '$set': {
                    'status': 'inactive',
                    'updated_at': datetime.utcnow(),
                    'updated_by': getattr(request, 'user', {}).get('uid', 'system')
                }
            }
        )
        
        if result.matched_count == 0:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({'message': 'User deactivated successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/departments', methods=['GET'])
def get_departments():
    """Get all departments"""
    try:
        if os.getenv('FLASK_ENV') == 'development':
            return jsonify({
                'departments': [
                    'Management',
                    'Warehouse',
                    'Operations',
                    'Quality Control',
                    'IT',
                    'Sales',
                    'Finance'
                ]
            })
        
        db = get_db()
        departments = db.users.distinct('department')
        
        return jsonify({'departments': departments})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/roles', methods=['GET'])
def get_roles():
    """Get all available roles"""
    try:
        return jsonify({
            'roles': [
                {'value': 'admin', 'label': 'Administrator', 'description': 'Full system access'},
                {'value': 'manager', 'label': 'Inventory Manager', 'description': 'Manage inventory and operations'},
                {'value': 'staff', 'label': 'Warehouse Staff', 'description': 'Basic inventory operations'}
            ]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/activity/<user_id>', methods=['GET'])
def get_user_activity(user_id):
    """Get user activity history"""
    try:
        if os.getenv('FLASK_ENV') == 'development':
            mock_activity = [
                {
                    'id': '1',
                    'action': 'Created product',
                    'details': 'Steel Rods (STL-001)',
                    'timestamp': '2024-01-21T08:30:00Z',
                    'ip_address': '192.168.1.100'
                },
                {
                    'id': '2',
                    'action': 'Updated receipt',
                    'details': 'RCP-20240120-001 status changed to done',
                    'timestamp': '2024-01-20T15:30:00Z',
                    'ip_address': '192.168.1.100'
                },
                {
                    'id': '3',
                    'action': 'Login',
                    'details': 'Successful authentication',
                    'timestamp': '2024-01-21T08:00:00Z',
                    'ip_address': '192.168.1.100'
                }
            ]
            return jsonify({'activity': mock_activity, 'total': len(mock_activity)})
        
        # In production, you'd fetch from an audit log collection
        db = get_db()
        
        # For now, return empty array - implement audit logging as needed
        return jsonify({'activity': [], 'total': 0})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore, auth as firebase_auth, storage
from datetime import datetime, timedelta
import uuid
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:8080", "http://localhost:8081", "*"])

print("🚀 StockMaster Backend API starting...")
print("🔥 Database Status: FIREBASE - Data will persist in Firebase Firestore")
print("🔧 Environment: Development Mode with Firebase Backend")

# Initialize Firebase Admin SDK
try:
    # Check if Firebase is already initialized
    if not firebase_admin._apps:
        # For development, we'll use the default project
        # In production, use service account key
        firebase_admin.initialize_app()
    
    # Get Firestore client
    db = firestore.client()
    
    # Get Storage bucket
    bucket = storage.bucket()
    
    print("✅ Successfully connected to Firebase:")
    print("   🔥 Firestore Database")
    print("   🔐 Firebase Authentication")
    print("   💾 Firebase Storage")
    
except Exception as e:
    print(f"❌ Failed to initialize Firebase: {str(e)}")
    print("📝 Make sure Firebase project is configured and credentials are available")
    db = None
    bucket = None

# Helper functions
def generate_id():
    return str(uuid.uuid4())

def generate_sku(name):
    """Generate SKU from product name"""
    clean_name = ''.join(c.upper() for c in name if c.isalpha())[:3]
    timestamp = str(int(datetime.now().timestamp()))[-4:]
    return f"{clean_name}-{timestamp}"

def firestore_to_dict(doc):
    """Convert Firestore document to dictionary"""
    if doc.exists:
        data = doc.to_dict()
        data['id'] = doc.id
        return data
    return None

def collection_to_list(collection_ref):
    """Convert Firestore collection to list of dictionaries"""
    docs = collection_ref.stream()
    return [firestore_to_dict(doc) for doc in docs if doc.exists]

# Health check
@app.route('/health')
def health():
    firebase_status = "connected" if db else "disconnected"
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0',
        'message': 'StockMaster Backend API is running - FIREBASE MODE',
        'database_status': firebase_status,
        'services': {
            'firestore': db is not None,
            'auth': firebase_admin._apps != {},
            'storage': bucket is not None
        }
    })

# Authentication middleware
def verify_token(request):
    """Verify Firebase ID token"""
    try:
        # Get the token from Authorization header
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None, 'No authorization header'
        
        # Extract token from "Bearer <token>"
        if not auth_header.startswith('Bearer '):
            return None, 'Invalid authorization header format'
        
        token = auth_header.split(' ')[1]
        
        # Verify the token with Firebase
        decoded_token = firebase_auth.verify_id_token(token)
        return decoded_token, None
        
    except Exception as e:
        return None, f'Token verification failed: {str(e)}'

# Dashboard endpoints
@app.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    """Return dashboard statistics"""
    try:
        if not db:
            return jsonify({'success': False, 'message': 'Firebase not connected'}), 500
        
        # Get collections
        products_ref = db.collection('products')
        users_ref = db.collection('users')
        operations_ref = db.collection('operations')
        
        # Get product statistics
        products = collection_to_list(products_ref)
        total_products = len(products)
        in_stock = len([p for p in products if p.get('stock', 0) > 0])
        low_stock = len([p for p in products if 0 < p.get('stock', 0) <= p.get('reorder_level', 10)])
        out_of_stock = len([p for p in products if p.get('stock', 0) == 0])
        
        # Get operation statistics
        operations = collection_to_list(operations_ref)
        pending_receipts = len([o for o in operations if o.get('type') == 'receipt' and o.get('status') == 'pending'])
        pending_deliveries = len([o for o in operations if o.get('type') == 'delivery' and o.get('status') == 'pending'])
        internal_transfers = len([o for o in operations if o.get('type') == 'transfer'])
        
        # Get recent activity (last 5 operations)
        recent_operations = sorted(operations, key=lambda x: x.get('date', ''), reverse=True)[:5]
        
        users = collection_to_list(users_ref)
        
        stats = {
            'products': {
                'total': total_products,
                'in_stock': in_stock,
                'low_stock': low_stock,
                'out_of_stock': out_of_stock,
                'trend': {
                    'value': f'{in_stock} items available',
                    'is_positive': True
                }
            },
            'operations': {
                'pending_receipts': pending_receipts,
                'pending_deliveries': pending_deliveries,
                'internal_transfers': internal_transfers,
                'pending_adjustments': 0
            },
            'activity': {
                'products_added_today': 0,
                'orders_processed_today': 0,
                'stock_movements_week': len(operations)
            },
            'alerts': [],
            'recent_activity': recent_operations
        }
        
        return jsonify({
            'success': True,
            'stats': stats,
            'message': f'Dashboard stats from Firebase: {total_products} products, {len(users)} users, {len(operations)} operations'
        })
        
    except Exception as e:
        print(f"❌ Error getting dashboard stats: {str(e)}")
        return jsonify({'success': False, 'message': f'Error getting dashboard stats: {str(e)}'}), 500

# Products endpoints
@app.route('/api/products', methods=['GET', 'POST'])
def handle_products():
    if request.method == 'GET':
        try:
            if not db:
                return jsonify({'success': False, 'message': 'Firebase not connected'}), 500
            
            products_ref = db.collection('products')
            products = collection_to_list(products_ref)
            
            return jsonify({
                'success': True,
                'products': products,
                'total': len(products),
                'message': f'Retrieved {len(products)} products from Firebase Firestore'
            })
            
        except Exception as e:
            print(f"❌ Error getting products: {str(e)}")
            return jsonify({'success': False, 'message': f'Error getting products: {str(e)}'}), 500
    
    elif request.method == 'POST':
        try:
            if not db:
                return jsonify({'success': False, 'message': 'Firebase not connected'}), 500
            
            # Verify authentication
            decoded_token, error = verify_token(request)
            if error:
                return jsonify({'success': False, 'message': f'Authentication required: {error}'}), 401
            
            data = request.get_json()
            
            # Validate required fields
            if not data.get('name'):
                return jsonify({'success': False, 'message': 'Product name is required'}), 400
            
            if not data.get('category'):
                return jsonify({'success': False, 'message': 'Category is required'}), 400
            
            # Generate unique SKU
            sku = generate_sku(data['name'])
            products_ref = db.collection('products')
            
            # Check if SKU already exists
            while products_ref.where('sku', '==', sku).limit(1).get():
                sku = generate_sku(data['name'])
            
            # Determine status based on stock and reorder level
            stock = data.get('stock', 0)
            reorder_level = data.get('reorder_level', 10)
            
            if stock == 0:
                status = 'Out of Stock'
            elif stock <= reorder_level:
                status = 'Low Stock'
            else:
                status = 'In Stock'
            
            # Create new product document
            new_product = {
                'name': data['name'],
                'sku': sku,
                'category': data['category'],
                'stock': stock,
                'unit': data.get('unit', 'pieces'),
                'status': status,
                'location': data.get('location', 'Main Warehouse'),
                'reorder_level': reorder_level,
                'supplier': data.get('supplier', ''),
                'cost_price': float(data.get('cost_price', 0)),
                'selling_price': float(data.get('selling_price', 0)),
                'description': data.get('description', ''),
                'created_by': decoded_token['uid'],
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP
            }
            
            # Add to Firestore
            doc_ref = products_ref.add(new_product)
            new_product['id'] = doc_ref[1].id
            
            print(f"✅ Product created in Firebase: {new_product['name']} (SKU: {new_product['sku']})")
            
            return jsonify({
                'success': True,
                'message': 'Product created successfully in Firebase Firestore',
                'product': new_product
            }), 201
            
        except Exception as e:
            print(f"❌ Error creating product: {str(e)}")
            return jsonify({
                'success': False,
                'message': f'Error creating product: {str(e)}'
            }), 500

# Users endpoints
@app.route('/api/users', methods=['GET', 'POST'])
def handle_users():
    if request.method == 'GET':
        try:
            if not db:
                return jsonify({'success': False, 'message': 'Firebase not connected'}), 500
            
            users_ref = db.collection('users')
            users = collection_to_list(users_ref)
            
            return jsonify({
                'success': True,
                'users': users,
                'total': len(users),
                'message': f'Retrieved {len(users)} users from Firebase Firestore'
            })
            
        except Exception as e:
            print(f"❌ Error getting users: {str(e)}")
            return jsonify({'success': False, 'message': f'Error getting users: {str(e)}'}), 500
    
    elif request.method == 'POST':
        try:
            if not db:
                return jsonify({'success': False, 'message': 'Firebase not connected'}), 500
            
            # Verify authentication
            decoded_token, error = verify_token(request)
            if error:
                return jsonify({'success': False, 'message': f'Authentication required: {error}'}), 401
            
            data = request.get_json()
            
            # Validate required fields
            if not data.get('name'):
                return jsonify({'success': False, 'message': 'Name is required'}), 400
            
            if not data.get('email'):
                return jsonify({'success': False, 'message': 'Email is required'}), 400
            
            if not data.get('role'):
                return jsonify({'success': False, 'message': 'Role is required'}), 400
            
            firebase_uid = data.get('firebase_uid')
            if not firebase_uid:
                return jsonify({'success': False, 'message': 'Firebase UID is required'}), 400
            
            users_ref = db.collection('users')
            
            # Check if user already exists
            if users_ref.where('firebase_uid', '==', firebase_uid).limit(1).get():
                return jsonify({'success': False, 'message': 'User already exists'}), 400
            
            # Create new user document
            new_user = {
                'firebase_uid': firebase_uid,
                'name': data['name'],
                'email': data['email'],
                'role': data['role'],
                'department': data.get('department', 'General'),
                'location': data.get('location', 'Main Office'),
                'phone': data.get('phone', ''),
                'status': 'Active',
                'created_by': decoded_token['uid'],
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP
            }
            
            # Add to Firestore
            doc_ref = users_ref.add(new_user)
            new_user['id'] = doc_ref[1].id
            
            print(f"✅ User created in Firebase: {new_user['name']} ({new_user['email']})")
            
            return jsonify({
                'success': True,
                'message': 'User created successfully in Firebase Firestore',
                'user': new_user
            }), 201
            
        except Exception as e:
            print(f"❌ Error creating user: {str(e)}")
            return jsonify({
                'success': False,
                'message': f'Error creating user: {str(e)}'
            }), 500

# Operations endpoints
@app.route('/api/operations', methods=['GET', 'POST'])
def handle_operations():
    if request.method == 'GET':
        try:
            if not db:
                return jsonify({'success': False, 'message': 'Firebase not connected'}), 500
            
            operations_ref = db.collection('operations')
            operations = collection_to_list(operations_ref)
            
            # Sort by date (most recent first)
            operations.sort(key=lambda x: x.get('date', ''), reverse=True)
            
            return jsonify({
                'success': True,
                'operations': operations,
                'total': len(operations),
                'message': f'Retrieved {len(operations)} operations from Firebase Firestore'
            })
            
        except Exception as e:
            print(f"❌ Error getting operations: {str(e)}")
            return jsonify({'success': False, 'message': f'Error getting operations: {str(e)}'}), 500
    
    elif request.method == 'POST':
        try:
            if not db:
                return jsonify({'success': False, 'message': 'Firebase not connected'}), 500
            
            # Verify authentication
            decoded_token, error = verify_token(request)
            if error:
                return jsonify({'success': False, 'message': f'Authentication required: {error}'}), 401
            
            data = request.get_json()
            
            # Validate required fields
            if not data.get('type'):
                return jsonify({'success': False, 'message': 'Operation type is required'}), 400
            
            if not data.get('description'):
                return jsonify({'success': False, 'message': 'Description is required'}), 400
            
            # Create new operation document
            new_operation = {
                'type': data['type'],
                'description': data['description'],
                'status': data.get('status', 'pending'),
                'date': firestore.SERVER_TIMESTAMP,
                'created_by': decoded_token['uid'],
                'updated_at': firestore.SERVER_TIMESTAMP
            }
            
            # Add type-specific fields
            if data['type'] == 'receipt':
                new_operation.update({
                    'supplier': data.get('supplier', ''),
                    'items_count': data.get('items_count', 0),
                    'total_value': float(data.get('total_value', 0))
                })
            elif data['type'] == 'delivery':
                new_operation.update({
                    'customer': data.get('customer', ''),
                    'delivery_address': data.get('delivery_address', ''),
                    'items_count': data.get('items_count', 0)
                })
            elif data['type'] == 'transfer':
                new_operation.update({
                    'from_location': data.get('from_location', ''),
                    'to_location': data.get('to_location', ''),
                    'product_id': data.get('product_id', ''),
                    'quantity': data.get('quantity', 0)
                })
            
            # Add to Firestore
            operations_ref = db.collection('operations')
            doc_ref = operations_ref.add(new_operation)
            new_operation['id'] = doc_ref[1].id
            
            print(f"✅ Operation created in Firebase: {new_operation['type']} - {new_operation['description']}")
            
            return jsonify({
                'success': True,
                'message': 'Operation created successfully in Firebase Firestore',
                'operation': new_operation
            }), 201
            
        except Exception as e:
            print(f"❌ Error creating operation: {str(e)}")
            return jsonify({
                'success': False,
                'message': f'Error creating operation: {str(e)}'
            }), 500

# Image upload endpoint
@app.route('/api/upload-image', methods=['POST'])
def upload_image():
    """Upload image to Firebase Storage"""
    try:
        if not bucket:
            return jsonify({'success': False, 'message': 'Firebase Storage not connected'}), 500
        
        # Verify authentication
        decoded_token, error = verify_token(request)
        if error:
            return jsonify({'success': False, 'message': f'Authentication required: {error}'}), 401
        
        if 'file' not in request.files:
            return jsonify({'success': False, 'message': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'success': False, 'message': 'No file selected'}), 400
        
        # Generate unique filename
        file_extension = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
        filename = f"images/{decoded_token['uid']}/{generate_id()}.{file_extension}"
        
        # Upload to Firebase Storage
        blob = bucket.blob(filename)
        blob.upload_from_string(file.read(), content_type=file.content_type)
        
        # Make the file publicly accessible
        blob.make_public()
        
        # Get the public URL
        public_url = blob.public_url
        
        print(f"✅ Image uploaded to Firebase Storage: {filename}")
        
        return jsonify({
            'success': True,
            'message': 'Image uploaded successfully',
            'url': public_url,
            'filename': filename
        }), 201
        
    except Exception as e:
        print(f"❌ Error uploading image: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error uploading image: {str(e)}'
        }), 500

# Add sample data endpoint
@app.route('/api/admin/add-sample-data', methods=['POST'])
def add_sample_data():
    """Add sample data to Firebase Firestore"""
    try:
        if not db:
            return jsonify({'success': False, 'message': 'Firebase not connected'}), 500
        
        # Verify authentication
        decoded_token, error = verify_token(request)
        if error:
            return jsonify({'success': False, 'message': f'Authentication required: {error}'}), 401
        
        # Check if data already exists
        products_ref = db.collection('products')
        if len(collection_to_list(products_ref)) > 0:
            return jsonify({'success': False, 'message': 'Sample data already exists'}), 400
        
        # Sample products
        sample_products = [
            {
                'name': 'Steel Rods',
                'sku': 'STL-001',
                'category': 'Raw Materials',
                'stock': 250,
                'unit': 'kg',
                'status': 'In Stock',
                'location': 'Warehouse A',
                'reorder_level': 50,
                'supplier': 'Metal Corp',
                'cost_price': 15.50,
                'selling_price': 25.00,
                'description': 'High-quality steel rods for construction',
                'created_by': decoded_token['uid'],
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP
            },
            {
                'name': 'Aluminum Sheets',
                'sku': 'ALU-002',
                'category': 'Raw Materials',
                'stock': 15,
                'unit': 'pieces',
                'status': 'Low Stock',
                'location': 'Warehouse B',
                'reorder_level': 20,
                'supplier': 'Aluminum Inc',
                'cost_price': 45.00,
                'selling_price': 65.00,
                'description': 'Lightweight aluminum sheets',
                'created_by': decoded_token['uid'],
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP
            },
            {
                'name': 'Plastic Containers',
                'sku': 'PLS-003',
                'category': 'Packaging',
                'stock': 500,
                'unit': 'pieces',
                'status': 'In Stock',
                'location': 'Warehouse C',
                'reorder_level': 100,
                'supplier': 'Packaging Solutions',
                'cost_price': 2.50,
                'selling_price': 5.00,
                'description': 'Durable plastic containers for storage',
                'created_by': decoded_token['uid'],
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP
            }
        ]
        
        # Add products to Firestore
        products_added = 0
        for product in sample_products:
            products_ref.add(product)
            products_added += 1
        
        # Sample users
        sample_users = [
            {
                'firebase_uid': generate_id(),
                'name': 'Admin User',
                'email': 'admin@stockmaster.com',
                'role': 'admin',
                'department': 'IT',
                'location': 'Main Office',
                'phone': '+1-555-0001',
                'status': 'Active',
                'created_by': decoded_token['uid'],
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP
            },
            {
                'firebase_uid': generate_id(),
                'name': 'John Manager',
                'email': 'john.manager@stockmaster.com',
                'role': 'manager',
                'department': 'Operations',
                'location': 'Warehouse A',
                'phone': '+1-555-0002',
                'status': 'Active',
                'created_by': decoded_token['uid'],
                'created_at': firestore.SERVER_TIMESTAMP,
                'updated_at': firestore.SERVER_TIMESTAMP
            }
        ]
        
        # Add users to Firestore
        users_ref = db.collection('users')
        users_added = 0
        for user in sample_users:
            users_ref.add(user)
            users_added += 1
        
        # Sample operations
        sample_operations = [
            {
                'type': 'receipt',
                'description': 'Received 100kg steel rods from Metal Corp',
                'status': 'completed',
                'supplier': 'Metal Corp',
                'items_count': 1,
                'total_value': 1550.00,
                'date': firestore.SERVER_TIMESTAMP,
                'created_by': decoded_token['uid'],
                'updated_at': firestore.SERVER_TIMESTAMP
            },
            {
                'type': 'delivery',
                'description': 'Delivered 50 plastic containers to Customer A',
                'status': 'pending',
                'customer': 'Customer A',
                'delivery_address': '123 Business St',
                'items_count': 50,
                'date': firestore.SERVER_TIMESTAMP,
                'created_by': decoded_token['uid'],
                'updated_at': firestore.SERVER_TIMESTAMP
            },
            {
                'type': 'transfer',
                'description': 'Transfer aluminum sheets from Warehouse B to Production Floor',
                'status': 'in_progress',
                'from_location': 'Warehouse B',
                'to_location': 'Production Floor',
                'quantity': 10,
                'date': firestore.SERVER_TIMESTAMP,
                'created_by': decoded_token['uid'],
                'updated_at': firestore.SERVER_TIMESTAMP
            }
        ]
        
        # Add operations to Firestore
        operations_ref = db.collection('operations')
        operations_added = 0
        for operation in sample_operations:
            operations_ref.add(operation)
            operations_added += 1
        
        print(f"✅ Sample data added to Firebase: {products_added} products, {users_added} users, {operations_added} operations")
        
        return jsonify({
            'success': True,
            'message': f'Sample data added successfully to Firebase: {products_added} products, {users_added} users, {operations_added} operations',
            'data': {
                'products_added': products_added,
                'users_added': users_added,
                'operations_added': operations_added
            }
        }), 201
        
    except Exception as e:
        print(f"❌ Error adding sample data: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error adding sample data: {str(e)}'
        }), 500

if __name__ == '__main__':
    print("🌐 Starting server on http://localhost:5000")
    if db:
        print("🎯 Backend ready - Firebase connected and ready to store data!")
        print("   🔥 Firestore for data storage")
        print("   🔐 Firebase Auth for authentication")
        print("   💾 Firebase Storage for images")
    else:
        print("⚠️  Warning: Firebase not connected - check configuration")
    app.run(host='0.0.0.0', port=5000, debug=True)
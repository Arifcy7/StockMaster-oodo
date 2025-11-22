from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
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
print("📊 Database Status: MONGODB - Data will persist in database")
print("🔧 Environment: Development Mode with MongoDB Database")

# MongoDB configuration
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017/')
DATABASE_NAME = os.getenv('DATABASE_NAME', 'stockmaster')

# Initialize MongoDB client
try:
    client = MongoClient(MONGO_URI)
    db = client[DATABASE_NAME]
    
    # Test connection
    client.admin.command('ping')
    print(f"✅ Successfully connected to MongoDB: {DATABASE_NAME}")
    
    # Get collections
    products_collection = db.products
    users_collection = db.users
    operations_collection = db.operations
    
    # Create indexes for better performance
    products_collection.create_index("sku", unique=True)
    users_collection.create_index("email", unique=True)
    
    print("📊 MongoDB collections ready: products, users, operations")
    
except Exception as e:
    print(f"❌ Failed to connect to MongoDB: {str(e)}")
    print("📝 Using in-memory fallback - data will not persist!")
    client = None
    db = None

# Helper functions
def generate_id():
    return str(uuid.uuid4())

def generate_sku(name):
    """Generate SKU from product name"""
    clean_name = ''.join(c.upper() for c in name if c.isalpha())[:3]
    timestamp = str(int(datetime.now().timestamp()))[-4:]
    return f"{clean_name}-{timestamp}"

def serialize_doc(doc):
    """Convert MongoDB document to JSON serializable format"""
    if doc is None:
        return None
    if isinstance(doc, list):
        return [serialize_doc(item) for item in doc]
    if isinstance(doc, dict):
        result = {}
        for key, value in doc.items():
            if key == '_id':
                result['id'] = str(value)
            elif isinstance(value, ObjectId):
                result[key] = str(value)
            elif isinstance(value, datetime):
                result[key] = value.isoformat()
            else:
                result[key] = value
        return result
    return doc

# Health check
@app.route('/health')
def health():
    mongo_status = "connected" if client else "disconnected"
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0',
        'message': f'StockMaster Backend API is running - MONGODB MODE',
        'database_status': mongo_status,
        'database_name': DATABASE_NAME if client else 'none'
    })

# Dashboard endpoints
@app.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    """Return dashboard statistics"""
    try:
        if not client:
            return jsonify({'success': False, 'message': 'Database not connected'}), 500
        
        # Get product statistics
        total_products = products_collection.count_documents({})
        in_stock = products_collection.count_documents({"stock": {"$gt": 0}})
        low_stock = products_collection.count_documents({
            "$expr": {"$and": [{"$gt": ["$stock", 0]}, {"$lte": ["$stock", "$reorder_level"]}]}
        })
        out_of_stock = products_collection.count_documents({"stock": 0})
        
        # Get operation statistics
        pending_receipts = operations_collection.count_documents({"type": "receipt", "status": "pending"})
        pending_deliveries = operations_collection.count_documents({"type": "delivery", "status": "pending"})
        internal_transfers = operations_collection.count_documents({"type": "transfer"})
        
        # Get recent activity
        recent_operations = list(operations_collection.find().sort("date", -1).limit(5))
        
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
                'stock_movements_week': operations_collection.count_documents({})
            },
            'alerts': [],
            'recent_activity': serialize_doc(recent_operations)
        }
        
        return jsonify({
            'success': True,
            'stats': stats,
            'message': f'Dashboard stats: {total_products} products, {users_collection.count_documents({})} users, {operations_collection.count_documents({})} operations'
        })
        
    except Exception as e:
        print(f"❌ Error getting dashboard stats: {str(e)}")
        return jsonify({'success': False, 'message': f'Error getting dashboard stats: {str(e)}'}), 500

# Products endpoints
@app.route('/api/products', methods=['GET', 'POST'])
def handle_products():
    if request.method == 'GET':
        try:
            if not client:
                return jsonify({'success': False, 'message': 'Database not connected'}), 500
            
            products = list(products_collection.find())
            serialized_products = serialize_doc(products)
            
            return jsonify({
                'success': True,
                'products': serialized_products,
                'total': len(serialized_products),
                'message': f'Retrieved {len(serialized_products)} products from MongoDB'
            })
            
        except Exception as e:
            print(f"❌ Error getting products: {str(e)}")
            return jsonify({'success': False, 'message': f'Error getting products: {str(e)}'}), 500
    
    elif request.method == 'POST':
        try:
            if not client:
                return jsonify({'success': False, 'message': 'Database not connected'}), 500
            
            data = request.get_json()
            
            # Validate required fields
            if not data.get('name'):
                return jsonify({'success': False, 'message': 'Product name is required'}), 400
            
            if not data.get('category'):
                return jsonify({'success': False, 'message': 'Category is required'}), 400
            
            # Generate unique SKU
            sku = generate_sku(data['name'])
            while products_collection.find_one({"sku": sku}):
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
                'created_at': datetime.now(),
                'updated_at': datetime.now()
            }
            
            # Insert into MongoDB
            result = products_collection.insert_one(new_product)
            new_product['_id'] = result.inserted_id
            
            print(f"✅ Product created in MongoDB: {new_product['name']} (SKU: {new_product['sku']})")
            
            return jsonify({
                'success': True,
                'message': 'Product created successfully in MongoDB',
                'product': serialize_doc(new_product)
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
            if not client:
                return jsonify({'success': False, 'message': 'Database not connected'}), 500
            
            users = list(users_collection.find())
            serialized_users = serialize_doc(users)
            
            return jsonify({
                'success': True,
                'users': serialized_users,
                'total': len(serialized_users),
                'message': f'Retrieved {len(serialized_users)} users from MongoDB'
            })
            
        except Exception as e:
            print(f"❌ Error getting users: {str(e)}")
            return jsonify({'success': False, 'message': f'Error getting users: {str(e)}'}), 500
    
    elif request.method == 'POST':
        try:
            if not client:
                return jsonify({'success': False, 'message': 'Database not connected'}), 500
            
            data = request.get_json()
            
            # Validate required fields
            if not data.get('name'):
                return jsonify({'success': False, 'message': 'Name is required'}), 400
            
            if not data.get('email'):
                return jsonify({'success': False, 'message': 'Email is required'}), 400
            
            if not data.get('role'):
                return jsonify({'success': False, 'message': 'Role is required'}), 400
            
            # Check if email already exists
            if users_collection.find_one({"email": data['email']}):
                return jsonify({'success': False, 'message': 'Email already exists'}), 400
            
            # Create new user document
            new_user = {
                'firebase_uid': data.get('firebase_uid', generate_id()),
                'name': data['name'],
                'email': data['email'],
                'role': data['role'],
                'department': data.get('department', 'General'),
                'location': data.get('location', 'Main Office'),
                'phone': data.get('phone', ''),
                'status': 'Active',
                'created_at': datetime.now(),
                'updated_at': datetime.now()
            }
            
            # Insert into MongoDB
            result = users_collection.insert_one(new_user)
            new_user['_id'] = result.inserted_id
            
            print(f"✅ User created in MongoDB: {new_user['name']} ({new_user['email']})")
            
            return jsonify({
                'success': True,
                'message': 'User created successfully in MongoDB',
                'user': serialize_doc(new_user)
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
            if not client:
                return jsonify({'success': False, 'message': 'Database not connected'}), 500
            
            operations = list(operations_collection.find().sort("date", -1))
            serialized_operations = serialize_doc(operations)
            
            return jsonify({
                'success': True,
                'operations': serialized_operations,
                'total': len(serialized_operations),
                'message': f'Retrieved {len(serialized_operations)} operations from MongoDB'
            })
            
        except Exception as e:
            print(f"❌ Error getting operations: {str(e)}")
            return jsonify({'success': False, 'message': f'Error getting operations: {str(e)}'}), 500
    
    elif request.method == 'POST':
        try:
            if not client:
                return jsonify({'success': False, 'message': 'Database not connected'}), 500
            
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
                'date': datetime.now(),
                'created_by': data.get('created_by', 'system'),
                'updated_at': datetime.now()
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
            
            # Insert into MongoDB
            result = operations_collection.insert_one(new_operation)
            new_operation['_id'] = result.inserted_id
            
            print(f"✅ Operation created in MongoDB: {new_operation['type']} - {new_operation['description']}")
            
            return jsonify({
                'success': True,
                'message': 'Operation created successfully in MongoDB',
                'operation': serialize_doc(new_operation)
            }), 201
            
        except Exception as e:
            print(f"❌ Error creating operation: {str(e)}")
            return jsonify({
                'success': False,
                'message': f'Error creating operation: {str(e)}'
            }), 500

# Add sample data endpoint
@app.route('/api/admin/add-sample-data', methods=['POST'])
def add_sample_data():
    """Add sample data to MongoDB"""
    try:
        if not client:
            return jsonify({'success': False, 'message': 'Database not connected'}), 500
        
        # Check if data already exists
        if products_collection.count_documents({}) > 0:
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
                'created_at': datetime.now(),
                'updated_at': datetime.now()
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
                'created_at': datetime.now(),
                'updated_at': datetime.now()
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
                'created_at': datetime.now(),
                'updated_at': datetime.now()
            }
        ]
        
        # Insert products
        products_result = products_collection.insert_many(sample_products)
        
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
                'created_at': datetime.now(),
                'updated_at': datetime.now()
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
                'created_at': datetime.now(),
                'updated_at': datetime.now()
            }
        ]
        
        # Insert users
        users_result = users_collection.insert_many(sample_users)
        
        # Sample operations
        sample_operations = [
            {
                'type': 'receipt',
                'description': 'Received 100kg steel rods from Metal Corp',
                'status': 'completed',
                'supplier': 'Metal Corp',
                'items_count': 1,
                'total_value': 1550.00,
                'date': datetime.now() - timedelta(hours=2),
                'created_by': 'system',
                'updated_at': datetime.now()
            },
            {
                'type': 'delivery',
                'description': 'Delivered 50 plastic containers to Customer A',
                'status': 'pending',
                'customer': 'Customer A',
                'delivery_address': '123 Business St',
                'items_count': 50,
                'date': datetime.now() - timedelta(hours=1),
                'created_by': 'system',
                'updated_at': datetime.now()
            },
            {
                'type': 'transfer',
                'description': 'Transfer aluminum sheets from Warehouse B to Production Floor',
                'status': 'in_progress',
                'from_location': 'Warehouse B',
                'to_location': 'Production Floor',
                'quantity': 10,
                'date': datetime.now() - timedelta(minutes=30),
                'created_by': 'system',
                'updated_at': datetime.now()
            }
        ]
        
        # Insert operations
        operations_result = operations_collection.insert_many(sample_operations)
        
        print(f"✅ Sample data added to MongoDB: {len(products_result.inserted_ids)} products, {len(users_result.inserted_ids)} users, {len(operations_result.inserted_ids)} operations")
        
        return jsonify({
            'success': True,
            'message': f'Sample data added successfully: {len(sample_products)} products, {len(sample_users)} users, {len(sample_operations)} operations',
            'data': {
                'products_added': len(products_result.inserted_ids),
                'users_added': len(users_result.inserted_ids),
                'operations_added': len(operations_result.inserted_ids)
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
    if client:
        print("🎯 Backend ready - MongoDB connected and ready to store data!")
    else:
        print("⚠️  Warning: MongoDB not connected - check connection string")
    app.run(host='0.0.0.0', port=5000, debug=True)
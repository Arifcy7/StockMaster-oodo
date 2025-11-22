from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import uuid
import json
import os
from pathlib import Path

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:8080", "http://localhost:8081", "*"])

print("🚀 StockMaster Backend API starting...")
print("📊 Database Status: JSON FILE PERSISTENCE - Data will persist in JSON files")
print("🔧 Environment: Development Mode with File-based Database")

# File-based database paths
DATA_DIR = Path(__file__).parent / "data"
DATA_DIR.mkdir(exist_ok=True)

PRODUCTS_FILE = DATA_DIR / "products.json"
USERS_FILE = DATA_DIR / "users.json"
OPERATIONS_FILE = DATA_DIR / "operations.json"

print(f"📁 Data directory: {DATA_DIR}")

# Helper functions
def load_json_data(file_path):
    """Load data from JSON file"""
    try:
        if file_path.exists():
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        return []
    except Exception as e:
        print(f"❌ Error loading {file_path}: {str(e)}")
        return []

def save_json_data(file_path, data):
    """Save data to JSON file"""
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, default=str)
        return True
    except Exception as e:
        print(f"❌ Error saving {file_path}: {str(e)}")
        return False

def generate_id():
    return str(uuid.uuid4())

def generate_sku(name):
    """Generate SKU from product name"""
    clean_name = ''.join(c.upper() for c in name if c.isalpha())[:3]
    timestamp = str(int(datetime.now().timestamp()))[-4:]
    return f"{clean_name}-{timestamp}"

# Initialize data files
products_data = load_json_data(PRODUCTS_FILE)
users_data = load_json_data(USERS_FILE)
operations_data = load_json_data(OPERATIONS_FILE)

print(f"📊 Loaded existing data: {len(products_data)} products, {len(users_data)} users, {len(operations_data)} operations")

# Health check
@app.route('/health')
def health():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0',
        'message': 'StockMaster Backend API is running - FILE PERSISTENCE MODE',
        'database_status': 'file-based',
        'data_directory': str(DATA_DIR)
    })

# Dashboard endpoints
@app.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    """Return dashboard statistics"""
    try:
        # Reload data to get latest
        products = load_json_data(PRODUCTS_FILE)
        users = load_json_data(USERS_FILE)
        operations = load_json_data(OPERATIONS_FILE)
        
        # Get product statistics
        total_products = len(products)
        in_stock = len([p for p in products if p.get('stock', 0) > 0])
        low_stock = len([p for p in products if 0 < p.get('stock', 0) <= p.get('reorder_level', 10)])
        out_of_stock = len([p for p in products if p.get('stock', 0) == 0])
        
        # Get operation statistics
        pending_receipts = len([o for o in operations if o.get('type') == 'receipt' and o.get('status') == 'pending'])
        pending_deliveries = len([o for o in operations if o.get('type') == 'delivery' and o.get('status') == 'pending'])
        internal_transfers = len([o for o in operations if o.get('type') == 'transfer'])
        
        # Get recent activity (last 5 operations)
        recent_operations = sorted(operations, key=lambda x: x.get('date', ''), reverse=True)[:5]
        
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
            'message': f'Dashboard stats: {total_products} products, {len(users)} users, {len(operations)} operations'
        })
        
    except Exception as e:
        print(f"❌ Error getting dashboard stats: {str(e)}")
        return jsonify({'success': False, 'message': f'Error getting dashboard stats: {str(e)}'}), 500

# Products endpoints
@app.route('/api/products', methods=['GET', 'POST'])
def handle_products():
    global products_data
    
    if request.method == 'GET':
        try:
            # Reload from file to get latest data
            products_data = load_json_data(PRODUCTS_FILE)
            
            return jsonify({
                'success': True,
                'products': products_data,
                'total': len(products_data),
                'message': f'Retrieved {len(products_data)} products from file database'
            })
            
        except Exception as e:
            print(f"❌ Error getting products: {str(e)}")
            return jsonify({'success': False, 'message': f'Error getting products: {str(e)}'}), 500
    
    elif request.method == 'POST':
        try:
            data = request.get_json()
            
            # Validate required fields
            if not data.get('name'):
                return jsonify({'success': False, 'message': 'Product name is required'}), 400
            
            if not data.get('category'):
                return jsonify({'success': False, 'message': 'Category is required'}), 400
            
            # Reload current data
            products_data = load_json_data(PRODUCTS_FILE)
            
            # Generate unique SKU
            sku = generate_sku(data['name'])
            while any(p.get('sku') == sku for p in products_data):
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
            
            # Create new product
            new_product = {
                'id': generate_id(),
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
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }
            
            # Add to products list
            products_data.append(new_product)
            
            # Save to file
            if save_json_data(PRODUCTS_FILE, products_data):
                print(f"✅ Product created and saved: {new_product['name']} (SKU: {new_product['sku']})")
                
                return jsonify({
                    'success': True,
                    'message': 'Product created and saved successfully',
                    'product': new_product
                }), 201
            else:
                return jsonify({'success': False, 'message': 'Failed to save product to file'}), 500
            
        except Exception as e:
            print(f"❌ Error creating product: {str(e)}")
            return jsonify({
                'success': False,
                'message': f'Error creating product: {str(e)}'
            }), 500

# Users endpoints
@app.route('/api/users', methods=['GET', 'POST'])
def handle_users():
    global users_data
    
    if request.method == 'GET':
        try:
            # Reload from file to get latest data
            users_data = load_json_data(USERS_FILE)
            
            return jsonify({
                'success': True,
                'users': users_data,
                'total': len(users_data),
                'message': f'Retrieved {len(users_data)} users from file database'
            })
            
        except Exception as e:
            print(f"❌ Error getting users: {str(e)}")
            return jsonify({'success': False, 'message': f'Error getting users: {str(e)}'}), 500
    
    elif request.method == 'POST':
        try:
            data = request.get_json()
            
            # Validate required fields
            if not data.get('name'):
                return jsonify({'success': False, 'message': 'Name is required'}), 400
            
            if not data.get('email'):
                return jsonify({'success': False, 'message': 'Email is required'}), 400
            
            if not data.get('role'):
                return jsonify({'success': False, 'message': 'Role is required'}), 400
            
            # Reload current data
            users_data = load_json_data(USERS_FILE)
            
            # Check if email already exists
            if any(u.get('email') == data['email'] for u in users_data):
                return jsonify({'success': False, 'message': 'Email already exists'}), 400
            
            # Create new user
            new_user = {
                'id': generate_id(),
                'firebase_uid': data.get('firebase_uid', generate_id()),
                'name': data['name'],
                'email': data['email'],
                'role': data['role'],
                'department': data.get('department', 'General'),
                'location': data.get('location', 'Main Office'),
                'phone': data.get('phone', ''),
                'status': 'Active',
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }
            
            # Add to users list
            users_data.append(new_user)
            
            # Save to file
            if save_json_data(USERS_FILE, users_data):
                print(f"✅ User created and saved: {new_user['name']} ({new_user['email']})")
                
                return jsonify({
                    'success': True,
                    'message': 'User created and saved successfully',
                    'user': new_user
                }), 201
            else:
                return jsonify({'success': False, 'message': 'Failed to save user to file'}), 500
            
        except Exception as e:
            print(f"❌ Error creating user: {str(e)}")
            return jsonify({
                'success': False,
                'message': f'Error creating user: {str(e)}'
            }), 500

# Operations endpoints
@app.route('/api/operations', methods=['GET', 'POST'])
def handle_operations():
    global operations_data
    
    if request.method == 'GET':
        try:
            # Reload from file to get latest data
            operations_data = load_json_data(OPERATIONS_FILE)
            
            # Sort by date (most recent first)
            operations_data.sort(key=lambda x: x.get('date', ''), reverse=True)
            
            return jsonify({
                'success': True,
                'operations': operations_data,
                'total': len(operations_data),
                'message': f'Retrieved {len(operations_data)} operations from file database'
            })
            
        except Exception as e:
            print(f"❌ Error getting operations: {str(e)}")
            return jsonify({'success': False, 'message': f'Error getting operations: {str(e)}'}), 500
    
    elif request.method == 'POST':
        try:
            data = request.get_json()
            
            # Validate required fields
            if not data.get('type'):
                return jsonify({'success': False, 'message': 'Operation type is required'}), 400
            
            if not data.get('description'):
                return jsonify({'success': False, 'message': 'Description is required'}), 400
            
            # Reload current data
            operations_data = load_json_data(OPERATIONS_FILE)
            
            # Create new operation
            new_operation = {
                'id': generate_id(),
                'type': data['type'],
                'description': data['description'],
                'status': data.get('status', 'pending'),
                'date': datetime.now().isoformat(),
                'created_by': data.get('created_by', 'system'),
                'updated_at': datetime.now().isoformat()
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
            
            # Add to operations list
            operations_data.append(new_operation)
            
            # Save to file
            if save_json_data(OPERATIONS_FILE, operations_data):
                print(f"✅ Operation created and saved: {new_operation['type']} - {new_operation['description']}")
                
                return jsonify({
                    'success': True,
                    'message': 'Operation created and saved successfully',
                    'operation': new_operation
                }), 201
            else:
                return jsonify({'success': False, 'message': 'Failed to save operation to file'}), 500
            
        except Exception as e:
            print(f"❌ Error creating operation: {str(e)}")
            return jsonify({
                'success': False,
                'message': f'Error creating operation: {str(e)}'
            }), 500

# Add sample data endpoint
@app.route('/api/admin/add-sample-data', methods=['POST'])
def add_sample_data():
    """Add sample data to file database"""
    try:
        # Check if data already exists
        current_products = load_json_data(PRODUCTS_FILE)
        if len(current_products) > 0:
            return jsonify({'success': False, 'message': 'Sample data already exists'}), 400
        
        # Sample products
        sample_products = [
            {
                'id': generate_id(),
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
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            },
            {
                'id': generate_id(),
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
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            },
            {
                'id': generate_id(),
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
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }
        ]
        
        # Sample users
        sample_users = [
            {
                'id': generate_id(),
                'firebase_uid': generate_id(),
                'name': 'Admin User',
                'email': 'admin@stockmaster.com',
                'role': 'admin',
                'department': 'IT',
                'location': 'Main Office',
                'phone': '+1-555-0001',
                'status': 'Active',
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            },
            {
                'id': generate_id(),
                'firebase_uid': generate_id(),
                'name': 'John Manager',
                'email': 'john.manager@stockmaster.com',
                'role': 'manager',
                'department': 'Operations',
                'location': 'Warehouse A',
                'phone': '+1-555-0002',
                'status': 'Active',
                'created_at': datetime.now().isoformat(),
                'updated_at': datetime.now().isoformat()
            }
        ]
        
        # Sample operations
        sample_operations = [
            {
                'id': generate_id(),
                'type': 'receipt',
                'description': 'Received 100kg steel rods from Metal Corp',
                'status': 'completed',
                'supplier': 'Metal Corp',
                'items_count': 1,
                'total_value': 1550.00,
                'date': (datetime.now() - timedelta(hours=2)).isoformat(),
                'created_by': 'system',
                'updated_at': datetime.now().isoformat()
            },
            {
                'id': generate_id(),
                'type': 'delivery',
                'description': 'Delivered 50 plastic containers to Customer A',
                'status': 'pending',
                'customer': 'Customer A',
                'delivery_address': '123 Business St',
                'items_count': 50,
                'date': (datetime.now() - timedelta(hours=1)).isoformat(),
                'created_by': 'system',
                'updated_at': datetime.now().isoformat()
            },
            {
                'id': generate_id(),
                'type': 'transfer',
                'description': 'Transfer aluminum sheets from Warehouse B to Production Floor',
                'status': 'in_progress',
                'from_location': 'Warehouse B',
                'to_location': 'Production Floor',
                'quantity': 10,
                'date': (datetime.now() - timedelta(minutes=30)).isoformat(),
                'created_by': 'system',
                'updated_at': datetime.now().isoformat()
            }
        ]
        
        # Save all data
        products_saved = save_json_data(PRODUCTS_FILE, sample_products)
        users_saved = save_json_data(USERS_FILE, sample_users)
        operations_saved = save_json_data(OPERATIONS_FILE, sample_operations)
        
        if products_saved and users_saved and operations_saved:
            # Update global variables
            global products_data, users_data, operations_data
            products_data = sample_products
            users_data = sample_users
            operations_data = sample_operations
            
            print(f"✅ Sample data saved to files: {len(sample_products)} products, {len(sample_users)} users, {len(sample_operations)} operations")
            
            return jsonify({
                'success': True,
                'message': f'Sample data saved successfully: {len(sample_products)} products, {len(sample_users)} users, {len(sample_operations)} operations',
                'data': {
                    'products_added': len(sample_products),
                    'users_added': len(sample_users),
                    'operations_added': len(sample_operations)
                }
            }), 201
        else:
            return jsonify({'success': False, 'message': 'Failed to save sample data to files'}), 500
        
    except Exception as e:
        print(f"❌ Error adding sample data: {str(e)}")
        return jsonify({
            'success': False,
            'message': f'Error adding sample data: {str(e)}'
        }), 500

if __name__ == '__main__':
    print("🌐 Starting server on http://localhost:5000")
    print("🎯 Backend ready - File-based database will persist data!")
    print(f"💾 Data files will be stored in: {DATA_DIR}")
    app.run(host='0.0.0.0', port=5000, debug=True)
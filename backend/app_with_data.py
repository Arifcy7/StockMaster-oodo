from flask import Flask, request, jsonify
from flask_cors import CORS
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
print("📊 Database Status: IN-MEMORY - Data will persist during session")
print("🔧 Environment: Development Mode with In-Memory Database")

# In-memory databases
products_db = []
users_db = []
operations_db = []

# Helper functions
def generate_id():
    return str(uuid.uuid4())

def generate_sku(name):
    """Generate SKU from product name"""
    clean_name = ''.join(c.upper() for c in name if c.isalpha())[:3]
    timestamp = str(int(datetime.now().timestamp()))[-4:]
    return f"{clean_name}-{timestamp}"

# Health check
@app.route('/health')
def health():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0',
        'message': 'StockMaster Backend API is running - IN-MEMORY DATABASE MODE',
        'database_status': 'in-memory'
    })

# Dashboard endpoints
@app.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    """Return dashboard statistics"""
    total_products = len(products_db)
    in_stock = len([p for p in products_db if p.get('stock', 0) > 0])
    low_stock = len([p for p in products_db if 0 < p.get('stock', 0) <= p.get('reorder_level', 10)])
    out_of_stock = len([p for p in products_db if p.get('stock', 0) == 0])
    
    pending_receipts = len([o for o in operations_db if o.get('type') == 'receipt' and o.get('status') == 'pending'])
    pending_deliveries = len([o for o in operations_db if o.get('type') == 'delivery' and o.get('status') == 'pending'])
    internal_transfers = len([o for o in operations_db if o.get('type') == 'transfer'])
    
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
            'stock_movements_week': len(operations_db)
        },
        'alerts': [],
        'recent_activity': operations_db[-5:] if operations_db else []
    }
    
    return jsonify({
        'success': True,
        'stats': stats,
        'message': f'Dashboard stats: {total_products} products, {len(users_db)} users, {len(operations_db)} operations'
    })

# Products endpoints
@app.route('/api/products', methods=['GET', 'POST'])
def handle_products():
    if request.method == 'GET':
        return jsonify({
            'success': True,
            'products': products_db,
            'total': len(products_db),
            'message': f'Retrieved {len(products_db)} products'
        })
    
    elif request.method == 'POST':
        try:
            data = request.get_json()
            
            # Validate required fields
            if not data.get('name'):
                return jsonify({'success': False, 'message': 'Product name is required'}), 400
            
            if not data.get('category'):
                return jsonify({'success': False, 'message': 'Category is required'}), 400
            
            # Create new product
            new_product = {
                'id': generate_id(),
                'name': data['name'],
                'sku': generate_sku(data['name']),
                'category': data['category'],
                'stock': data.get('stock', 0),
                'unit': data.get('unit', 'pieces'),
                'status': 'In Stock' if data.get('stock', 0) > 0 else 'Out of Stock',
                'location': data.get('location', 'Main Warehouse'),
                'reorder_level': data.get('reorder_level', 10),
                'supplier': data.get('supplier', ''),
                'cost_price': data.get('cost_price', 0),
                'selling_price': data.get('selling_price', 0),
                'description': data.get('description', ''),
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }
            
            # Add to database
            products_db.append(new_product)
            
            print(f"✅ Product created: {new_product['name']} (SKU: {new_product['sku']})")
            
            return jsonify({
                'success': True,
                'message': 'Product created successfully',
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
        return jsonify({
            'success': True,
            'users': users_db,
            'total': len(users_db),
            'message': f'Retrieved {len(users_db)} users'
        })
    
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
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }
            
            # Add to database
            users_db.append(new_user)
            
            print(f"✅ User created: {new_user['name']} ({new_user['email']})")
            
            return jsonify({
                'success': True,
                'message': 'User created successfully',
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
        return jsonify({
            'success': True,
            'operations': operations_db,
            'total': len(operations_db),
            'message': f'Retrieved {len(operations_db)} operations'
        })
    
    elif request.method == 'POST':
        try:
            data = request.get_json()
            
            # Validate required fields
            if not data.get('type'):
                return jsonify({'success': False, 'message': 'Operation type is required'}), 400
            
            if not data.get('description'):
                return jsonify({'success': False, 'message': 'Description is required'}), 400
            
            # Create new operation
            new_operation = {
                'id': generate_id(),
                'type': data['type'],
                'description': data['description'],
                'status': data.get('status', 'pending'),
                'date': datetime.utcnow().isoformat(),
                'created_by': data.get('created_by', 'system'),
                'updated_at': datetime.utcnow().isoformat()
            }
            
            # Add type-specific fields
            if data['type'] == 'receipt':
                new_operation.update({
                    'supplier': data.get('supplier', ''),
                    'items_count': data.get('items_count', 0),
                    'total_value': data.get('total_value', 0)
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
            
            # Add to database
            operations_db.append(new_operation)
            
            print(f"✅ Operation created: {new_operation['type']} - {new_operation['description']}")
            
            return jsonify({
                'success': True,
                'message': 'Operation created successfully',
                'operation': new_operation
            }), 201
            
        except Exception as e:
            print(f"❌ Error creating operation: {str(e)}")
            return jsonify({
                'success': False,
                'message': f'Error creating operation: {str(e)}'
            }), 500

# Add some sample data on startup
def add_sample_data():
    """Add sample data for testing"""
    print("📝 Adding sample data...")
    
    # Sample products
    sample_products = [
        {
            'name': 'Steel Rods',
            'category': 'Raw Materials',
            'stock': 250,
            'unit': 'kg',
            'location': 'Warehouse A',
            'reorder_level': 50,
            'supplier': 'Metal Corp',
            'cost_price': 15.50,
            'selling_price': 25.00,
            'description': 'High-quality steel rods for construction'
        },
        {
            'name': 'Aluminum Sheets',
            'category': 'Raw Materials',
            'stock': 15,
            'unit': 'pieces',
            'location': 'Warehouse B',
            'reorder_level': 20,
            'supplier': 'Aluminum Inc',
            'cost_price': 45.00,
            'selling_price': 65.00,
            'description': 'Lightweight aluminum sheets'
        },
        {
            'name': 'Plastic Containers',
            'category': 'Packaging',
            'stock': 500,
            'unit': 'pieces',
            'location': 'Warehouse C',
            'reorder_level': 100,
            'supplier': 'Packaging Solutions',
            'cost_price': 2.50,
            'selling_price': 5.00,
            'description': 'Durable plastic containers for storage'
        }
    ]
    
    for product_data in sample_products:
        product = {
            'id': generate_id(),
            'name': product_data['name'],
            'sku': generate_sku(product_data['name']),
            'category': product_data['category'],
            'stock': product_data['stock'],
            'unit': product_data['unit'],
            'status': 'In Stock' if product_data['stock'] > product_data['reorder_level'] else 'Low Stock',
            'location': product_data['location'],
            'reorder_level': product_data['reorder_level'],
            'supplier': product_data['supplier'],
            'cost_price': product_data['cost_price'],
            'selling_price': product_data['selling_price'],
            'description': product_data['description'],
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        products_db.append(product)
    
    # Sample users
    sample_users = [
        {
            'name': 'Admin User',
            'email': 'admin@stockmaster.com',
            'role': 'admin',
            'department': 'IT',
            'location': 'Main Office',
            'phone': '+1-555-0001'
        },
        {
            'name': 'John Manager',
            'email': 'john.manager@stockmaster.com',
            'role': 'manager',
            'department': 'Operations',
            'location': 'Warehouse A',
            'phone': '+1-555-0002'
        }
    ]
    
    for user_data in sample_users:
        user = {
            'id': generate_id(),
            'firebase_uid': generate_id(),
            'name': user_data['name'],
            'email': user_data['email'],
            'role': user_data['role'],
            'department': user_data['department'],
            'location': user_data['location'],
            'phone': user_data['phone'],
            'status': 'Active',
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        users_db.append(user)
    
    # Sample operations
    sample_operations = [
        {
            'type': 'receipt',
            'description': 'Received 100kg steel rods from Metal Corp',
            'status': 'completed',
            'supplier': 'Metal Corp',
            'items_count': 1,
            'total_value': 1550.00
        },
        {
            'type': 'delivery',
            'description': 'Delivered 50 plastic containers to Customer A',
            'status': 'pending',
            'customer': 'Customer A',
            'delivery_address': '123 Business St',
            'items_count': 50
        },
        {
            'type': 'transfer',
            'description': 'Transfer aluminum sheets from Warehouse B to Production Floor',
            'status': 'in_progress',
            'from_location': 'Warehouse B',
            'to_location': 'Production Floor',
            'quantity': 10
        }
    ]
    
    for op_data in sample_operations:
        operation = {
            'id': generate_id(),
            'type': op_data['type'],
            'description': op_data['description'],
            'status': op_data['status'],
            'date': (datetime.utcnow() - timedelta(hours=2)).isoformat(),
            'created_by': 'system',
            'updated_at': datetime.utcnow().isoformat()
        }
        
        # Add type-specific fields
        if op_data['type'] == 'receipt':
            operation.update({
                'supplier': op_data.get('supplier', ''),
                'items_count': op_data.get('items_count', 0),
                'total_value': op_data.get('total_value', 0)
            })
        elif op_data['type'] == 'delivery':
            operation.update({
                'customer': op_data.get('customer', ''),
                'delivery_address': op_data.get('delivery_address', ''),
                'items_count': op_data.get('items_count', 0)
            })
        elif op_data['type'] == 'transfer':
            operation.update({
                'from_location': op_data.get('from_location', ''),
                'to_location': op_data.get('to_location', ''),
                'quantity': op_data.get('quantity', 0)
            })
        
        operations_db.append(operation)
    
    print(f"✅ Sample data added: {len(products_db)} products, {len(users_db)} users, {len(operations_db)} operations")

if __name__ == '__main__':
    print("🌐 Starting server on http://localhost:5000")
    add_sample_data()
    print("🎯 Backend ready - Connect frontend to see data!")
    app.run(host='0.0.0.0', port=5000, debug=True)
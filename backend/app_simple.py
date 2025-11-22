from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:8080", "http://localhost:8081", "*"])

print("🚀 StockMaster Backend API starting...")
print(f"🔧 Environment: {os.getenv('FLASK_ENV', 'development')}")

# Mock user for development
def get_mock_user():
    return {
        'uid': 'dev-user-123',
        'email': 'dev@stockmaster.com',
        'role': 'admin'
    }

# Utility function for mock data
def get_mock_products():
    return [
        {
            "id": "1",
            "name": "Steel Rods",
            "sku": "STL-001",
            "category": "Raw Materials",
            "stock": 250,
            "unit": "kg",
            "status": "In Stock",
            "location": "Warehouse A",
            "reorder_level": 50,
            "supplier": "Steel Corp Ltd",
            "cost_price": 2.50,
            "selling_price": 3.75,
            "created_at": "2024-01-01T00:00:00Z",
            "updated_at": "2024-01-20T10:30:00Z"
        },
        {
            "id": "2",
            "name": "Office Chairs",
            "sku": "OFC-205",
            "category": "Furniture",
            "stock": 45,
            "unit": "units",
            "status": "In Stock",
            "location": "Warehouse B",
            "reorder_level": 20,
            "supplier": "Furniture Plus",
            "cost_price": 85.00,
            "selling_price": 120.00,
            "created_at": "2024-01-02T00:00:00Z",
            "updated_at": "2024-01-19T14:20:00Z"
        },
        {
            "id": "3",
            "name": "Laptop Batteries",
            "sku": "BAT-102",
            "category": "Electronics",
            "stock": 8,
            "unit": "units",
            "status": "Low Stock",
            "location": "Main Store",
            "reorder_level": 15,
            "supplier": "Tech Supplies Co",
            "cost_price": 45.00,
            "selling_price": 65.00,
            "created_at": "2024-01-03T00:00:00Z",
            "updated_at": "2024-01-21T09:15:00Z"
        },
        {
            "id": "4",
            "name": "Paint Cans",
            "sku": "PNT-450",
            "category": "Supplies",
            "stock": 0,
            "unit": "liters",
            "status": "Out of Stock",
            "location": "Storage Room",
            "reorder_level": 25,
            "supplier": "Paint World",
            "cost_price": 15.00,
            "selling_price": 22.50,
            "created_at": "2024-01-04T00:00:00Z",
            "updated_at": "2024-01-18T16:45:00Z"
        }
    ]

# New endpoints for dynamic content

@app.route('/api/operations', methods=['GET', 'POST'])
def handle_operations():
    """Get all operations or create new operation"""
    if request.method == 'GET':
        try:
            # TODO: Replace with actual database query
            # For now, return empty array since no database is connected
            operations = []  # Empty - no data in database
            
            return jsonify({
                'success': True,
                'operations': operations,
                'total': len(operations),
                'message': 'No operations found in database' if len(operations) == 0 else None
            }), 200
        except Exception as e:
            print(f"Error getting operations: {str(e)}")
            return jsonify({
                'success': False,
                'message': 'Failed to retrieve operations',
                'error': str(e)
            }), 500
    
    elif request.method == 'POST':
        try:
            data = request.get_json()
            operation_type = data.get('type', 'general')
            created_by = data.get('createdBy')
            
            new_operation = {
                'id': f"OP-{datetime.now().timestamp()}",
                'type': operation_type,
                'title': f"New {operation_type.title()}",
                'description': "Pending",
                'status': "draft",
                'date': datetime.now().strftime('%Y-%m-%d'),
                'createdBy': created_by,
                'createdAt': datetime.utcnow().isoformat()
            }
            
            # In a real app, save to database
            print(f"Created new operation: {new_operation}")
            
            return jsonify({
                'success': True,
                'message': 'Operation created successfully',
                'operation': new_operation
            }), 201
        except Exception as e:
            print(f"Error creating operation: {str(e)}")
            return jsonify({
                'success': False,
                'message': 'Failed to create operation',
                'error': str(e)
            }), 500

@app.route('/api/movements', methods=['GET'])
def get_movements():
    """Get movement history"""
    try:
        # TODO: Replace with actual database query
        # For now, return empty array since no database is connected
        movements = []  # Empty - no data in database
        
        return jsonify({
            'success': True,
            'movements': movements,
            'total': len(movements),
            'message': 'No movement history found in database' if len(movements) == 0 else None
        }), 200
        
    except Exception as e:
        print(f"Error getting movements: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to retrieve movements',
            'error': str(e)
        }), 500

@app.route('/api/profile', methods=['GET', 'PUT'])
def handle_profile():
    """Get or update user profile"""
    if request.method == 'GET':
        try:
            # TODO: Replace with actual database query based on authenticated user
            # For now, return null since no database profile exists
            profile = None  # No profile in database
            
            if profile is None:
                return jsonify({
                    'success': False,
                    'message': 'No profile found in database for this user',
                    'profile': None
                }), 404
            
            return jsonify({
                'success': True,
                'profile': profile
            }), 200
        except Exception as e:
            print(f"Error getting profile: {str(e)}")
            return jsonify({
                'success': False,
                'message': 'Failed to retrieve profile',
                'error': str(e)
            }), 500
    
    elif request.method == 'PUT':
        try:
            data = request.get_json()
            print(f"Profile update request: {data}")
            
            return jsonify({
                'success': True,
                'message': 'Profile updated successfully',
                'profile': data
            }), 200
        except Exception as e:
            print(f"Error updating profile: {str(e)}")
            return jsonify({
                'success': False,
                'message': 'Failed to update profile',
                'error': str(e)
            }), 500

@app.route('/api/settings', methods=['GET', 'PUT'])
def handle_settings():
    """Get or update system settings"""
    if request.method == 'GET':
        try:
            # TODO: Replace with actual database query
            # For now, return null since no settings exist in database
            settings = None  # No settings in database
            
            if settings is None:
                return jsonify({
                    'success': False,
                    'message': 'No system settings found in database',
                    'settings': None
                }), 404
            
            return jsonify({
                'success': True,
                'settings': settings
            }), 200
        except Exception as e:
            print(f"Error getting settings: {str(e)}")
            return jsonify({
                'success': False,
                'message': 'Failed to retrieve settings',
                'error': str(e)
            }), 500
    
    elif request.method == 'PUT':
        try:
            data = request.get_json()
            print(f"Settings update request: {data}")
            
            return jsonify({
                'success': True,
                'message': 'Settings updated successfully',
                'settings': data
            }), 200
        except Exception as e:
            print(f"Error updating settings: {str(e)}")
            return jsonify({
                'success': False,
                'message': 'Failed to update settings',
                'error': str(e)
            }), 500

@app.route('/api/users', methods=['GET'])
def get_users():
    """Get all users"""
    try:
        users = [
            {
                "id": "1",
                "name": "John Doe",
                "email": "john.doe@example.com",
                "role": "admin",
                "status": "active",
                "lastLogin": "2024-01-20T10:30:00Z",
                "createdAt": "2024-01-01T00:00:00Z"
            },
            {
                "id": "2",
                "name": "Jane Smith",
                "email": "jane.smith@example.com",
                "role": "manager",
                "status": "active",
                "lastLogin": "2024-01-19T14:20:00Z",
                "createdAt": "2024-01-05T00:00:00Z"
            },
            {
                "id": "3",
                "name": "Bob Wilson",
                "email": "bob.wilson@example.com",
                "role": "staff",
                "status": "active",
                "lastLogin": "2024-01-18T09:15:00Z",
                "createdAt": "2024-01-10T00:00:00Z"
            }
        ]
        
        return jsonify({
            'success': True,
            'users': users,
            'total': len(users)
        }), 200
        
    except Exception as e:
        print(f"Error getting users: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to retrieve users',
            'error': str(e)
        }), 500

@app.route('/api/users', methods=['POST'])
def create_user():
    """Create a new user"""
    try:
        data = request.get_json()
        print(f"User creation request: {data}")
        
        # In a real app, create user in Firebase and database
        new_user = {
            "id": f"new-{datetime.now().timestamp()}",
            "name": data.get('name'),
            "email": data.get('email'),
            "role": data.get('role'),
            "status": "active",
            "lastLogin": None,
            "createdAt": datetime.utcnow().isoformat()
        }
        
        return jsonify({
            'success': True,
            'message': 'User created successfully',
            'user': new_user
        }), 201
        
    except Exception as e:
        print(f"Error creating user: {str(e)}")
        return jsonify({
            'success': False,
            'message': 'Failed to create user',
            'error': str(e)
        }), 500

# Keep existing endpoints...

# Health check
@app.route('/health')
def health():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0',
        'message': 'StockMaster Backend API is running'
    })
    return jsonify({
        'id': 'dev-user-123',
        'name': 'Development User',
        'email': 'dev@stockmaster.com',
        'role': 'admin',
        'department': 'IT',
        'location': 'Main Office',
        'status': 'active'
    })

# Products endpoints
@app.route('/api/products', methods=['GET', 'POST'])
def handle_products():
    if request.method == 'GET':
        try:
            # TODO: Replace with actual database query
            # For now, return empty array since no database is connected
            products = []  # Empty - no data in database
            
            # Apply filters (when we have data)
            search = request.args.get('search', '').lower()
            category = request.args.get('category')
            status = request.args.get('status')
            location = request.args.get('location')
            
            return jsonify({
                'success': True,
                'products': products,
                'total': len(products),
                'message': 'No products found in database' if len(products) == 0 else None
            }), 200
        except Exception as e:
            print(f"Error getting products: {str(e)}")
            return jsonify({
                'success': False,
                'message': 'Failed to retrieve products',
                'error': str(e)
            }), 500
    
    elif request.method == 'POST':
        try:
            data = request.get_json()
            name = data.get('name', 'New Product')
            category = data.get('category', 'General')
            created_by = data.get('createdBy')
            
            new_product = {
                'id': str(int(datetime.now().timestamp())),
                'name': name,
                'sku': f"PRD-{datetime.now().timestamp():.0f}",
                'category': category,
                'stock': 0,
                'unit': 'units',
                'status': 'In Stock',
                'location': 'Main Warehouse',
                'reorder_level': 10,
                'supplier': 'TBD',
                'cost_price': 0.00,
                'selling_price': 0.00,
                'createdBy': created_by,
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }
            
            print(f"Created new product: {new_product}")
            
            return jsonify({
                'success': True,
                'message': 'Product created successfully',
                'product': new_product
            }), 201
        except Exception as e:
            print(f"Error creating product: {str(e)}")
            return jsonify({
                'success': False,
                'message': 'Failed to create product',
                'error': str(e)
            }), 500

@app.route('/api/products', methods=['POST'])
def create_product():
    data = request.json
    new_product = {
        'id': f"new-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}",
        'name': data['name'],
        'sku': data['sku'],
        'category': data['category'],
        'stock': data.get('stock', 0),
        'unit': data['unit'],
        'status': 'In Stock' if data.get('stock', 0) > 0 else 'Out of Stock',
        'location': data['location'],
        'created_at': datetime.utcnow().isoformat(),
        'updated_at': datetime.utcnow().isoformat()
    }
    
    return jsonify({
        'message': 'Product created successfully',
        'product': new_product
    }), 201

@app.route('/api/products/<product_id>', methods=['GET'])
def get_product(product_id):
    products = get_mock_products()
    product = next((p for p in products if p['id'] == product_id), None)
    
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    
    return jsonify({'product': product})

@app.route('/api/products/<product_id>', methods=['PUT'])
def update_product(product_id):
    data = request.json
    return jsonify({
        'message': 'Product updated successfully',
        'product': {**data, 'id': product_id, 'updated_at': datetime.utcnow().isoformat()}
    })

@app.route('/api/products/<product_id>', methods=['DELETE'])
def delete_product(product_id):
    return jsonify({'message': 'Product deleted successfully'})

@app.route('/api/products/categories', methods=['GET'])
def get_categories():
    return jsonify({
        'categories': [
            'Raw Materials',
            'Furniture', 
            'Electronics',
            'Supplies',
            'Tools',
            'Equipment'
        ]
    })

@app.route('/api/products/locations', methods=['GET'])
def get_locations():
    return jsonify({
        'locations': [
            'Warehouse A',
            'Warehouse B',
            'Main Store',
            'Storage Room',
            'Production Floor'
        ]
    })

# Operations endpoints
@app.route('/api/operations/receipts', methods=['GET'])
def get_receipts():
    receipts = [
        {
            "id": "R001",
            "receipt_id": "RCP-20240120-001",
            "supplier": "Steel Corp Ltd",
            "items": [{"product_name": "Steel Rods", "quantity": 100}],
            "total_items": 1,
            "total_value": 250.00,
            "status": "done",
            "created_at": "2024-01-20T09:00:00Z"
        },
        {
            "id": "R002",
            "receipt_id": "RCP-20240121-002",
            "supplier": "Furniture Plus",
            "items": [{"product_name": "Office Chairs", "quantity": 10}],
            "total_items": 1,
            "total_value": 850.00,
            "status": "waiting",
            "created_at": "2024-01-21T10:15:00Z"
        }
    ]
    return jsonify({'receipts': receipts, 'total': len(receipts)})

@app.route('/api/operations/deliveries', methods=['GET'])
def get_deliveries():
    deliveries = [
        {
            "id": "D001",
            "delivery_id": "DEL-20240120-001",
            "customer": "Tech Solutions Inc",
            "items": [{"product_name": "Laptop Batteries", "quantity": 5}],
            "status": "ready",
            "created_at": "2024-01-20T11:00:00Z"
        }
    ]
    return jsonify({'deliveries': deliveries, 'total': len(deliveries)})

@app.route('/api/operations/transfers', methods=['GET'])
def get_transfers():
    transfers = [
        {
            "id": "T001",
            "transfer_id": "TRF-20240120-001",
            "from_location": "Warehouse A",
            "to_location": "Production Floor",
            "items": [{"product_name": "Steel Rods", "quantity": 20}],
            "status": "done",
            "created_at": "2024-01-20T07:00:00Z"
        }
    ]
    return jsonify({'transfers': transfers, 'total': len(transfers)})

@app.route('/api/operations/adjustments', methods=['GET'])
def get_adjustments():
    adjustments = [
        {
            "id": "A001",
            "adjustment_id": "ADJ-20240119-001",
            "product_name": "Steel Rods",
            "quantity": -5,
            "reason": "Damaged goods",
            "status": "done",
            "created_at": "2024-01-19T14:30:00Z"
        }
    ]
    return jsonify({'adjustments': adjustments, 'total': len(adjustments)})

# Dashboard endpoints
@app.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    """Return empty/zero stats when no database is connected"""
    try:
        # TODO: Calculate from actual database
        # Return zero stats since no database is connected
        stats = {
            'products': {
                'total': 0,
                'in_stock': 0,
                'low_stock': 0,
                'out_of_stock': 0,
                'trend': {
                    'value': 'No data available',
                    'is_positive': False
                }
            },
            'operations': {
                'pending_receipts': 0,
                'pending_deliveries': 0,
                'internal_transfers': 0,
                'pending_adjustments': 0
            },
            'activity': {
                'products_added_today': 0,
                'orders_processed_today': 0,
                'stock_movements_week': 0
            },
            'alerts': [],
            'recent_activity': [],
            'message': 'No data in database - connect to see real statistics'
        }
        return jsonify(stats)

@app.route('/api/dashboard/low-stock', methods=['GET'])
def get_low_stock():
    products = [p for p in get_mock_products() if p['status'] == 'Low Stock']
    limit = int(request.args.get('limit', 10))
    return jsonify({'products': products[:limit]})

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    print(f"🌐 Starting server on http://localhost:{port}")
    print("✅ All endpoints are ready for frontend integration!")
    app.run(debug=debug, port=port, host='0.0.0.0')
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://localhost:5173", "http://localhost:8080", "*"])

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

# Health check
@app.route('/health')
def health():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0',
        'message': 'StockMaster Backend API is running'
    })

# Authentication endpoints
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    return jsonify({
        'message': 'User registered successfully',
        'user': {
            'id': 'new-user-123',
            'name': data.get('name', 'New User'),
            'email': data.get('email', 'user@example.com'),
            'role': data.get('role', 'staff')
        }
    }), 201

@app.route('/api/auth/profile', methods=['GET'])
def get_profile():
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
@app.route('/api/products', methods=['GET'])
def get_products():
    products = get_mock_products()
    
    # Apply filters
    search = request.args.get('search', '').lower()
    category = request.args.get('category')
    status = request.args.get('status')
    location = request.args.get('location')
    
    if search:
        products = [p for p in products 
                   if search in p['name'].lower() or 
                      search in p['sku'].lower() or
                      search in p['category'].lower()]
    
    if category:
        products = [p for p in products if p['category'] == category]
    
    if status:
        products = [p for p in products if p['status'] == status]
    
    if location:
        products = [p for p in products if p['location'] == location]
    
    return jsonify({
        'products': products,
        'total': len(products)
    })

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
    stats = {
        'products': {
            'total': 1234,
            'in_stock': 1150,
            'low_stock': 23,
            'out_of_stock': 61,
            'trend': {
                'value': '+12% from last month',
                'is_positive': True
            }
        },
        'operations': {
            'pending_receipts': 15,
            'pending_deliveries': 8,
            'internal_transfers': 5,
            'pending_adjustments': 3
        },
        'activity': {
            'products_added_today': 12,
            'orders_processed_today': 47,
            'stock_movements_week': 89
        },
        'alerts': [
            {
                'type': 'low_stock',
                'message': '23 products are running low on stock',
                'priority': 'high',
                'timestamp': (datetime.utcnow() - timedelta(hours=2)).isoformat()
            }
        ],
        'recent_activity': [
            {
                'id': '1',
                'user': 'Admin User',
                'action': 'Created new product',
                'details': 'Steel Rods (STL-001)',
                'timestamp': (datetime.utcnow() - timedelta(minutes=10)).isoformat()
            }
        ]
    }
    return jsonify(stats)

@app.route('/api/dashboard/low-stock', methods=['GET'])
def get_low_stock():
    products = [p for p in get_mock_products() if p['status'] == 'Low Stock']
    limit = int(request.args.get('limit', 10))
    return jsonify({'products': products[:limit]})

# Users endpoints
@app.route('/api/users', methods=['GET'])
def get_users():
    users = [
        {
            "id": "1",
            "name": "Admin User",
            "email": "admin@stockmaster.com",
            "role": "admin",
            "department": "Management",
            "location": "Head Office",
            "status": "active"
        },
        {
            "id": "2",
            "name": "Inventory Manager", 
            "email": "manager@stockmaster.com",
            "role": "manager",
            "department": "Warehouse",
            "location": "Warehouse A",
            "status": "active"
        }
    ]
    return jsonify({'users': users, 'total': len(users)})

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
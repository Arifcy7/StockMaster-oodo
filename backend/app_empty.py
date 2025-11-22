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
print("📊 Database Status: EMPTY - No data will be returned")
print("🔧 Environment: Empty Database Mode")

# Health check
@app.route('/health')
def health():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0',
        'message': 'StockMaster Backend API is running - EMPTY DATABASE MODE',
        'database_status': 'empty'
    })

# Dashboard endpoints - EMPTY DATA
@app.route('/api/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    """Return zero stats - no database data"""
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
        'recent_activity': []
    }
    return jsonify({
        'success': True,
        'stats': stats,
        'message': 'No data in database'
    })

# Products endpoints - EMPTY DATA
@app.route('/api/products', methods=['GET', 'POST'])
def handle_products():
    if request.method == 'GET':
        return jsonify({
            'success': True,
            'products': [],
            'total': 0,
            'message': 'No products found in database'
        })
    
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
                'createdBy': created_by,
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }
            
            print(f"⚠️  Product created but not saved - no database: {new_product}")
            
            return jsonify({
                'success': True,
                'message': 'Product created (not saved - no database)',
                'product': new_product
            }), 201
        except Exception as e:
            return jsonify({
                'success': False,
                'message': 'Failed to create product',
                'error': str(e)
            }), 500

# Operations endpoints - EMPTY DATA
@app.route('/api/operations', methods=['GET', 'POST'])
def handle_operations():
    if request.method == 'GET':
        return jsonify({
            'success': True,
            'operations': [],
            'total': 0,
            'message': 'No operations found in database'
        })
    
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
            
            print(f"⚠️  Operation created but not saved - no database: {new_operation}")
            
            return jsonify({
                'success': True,
                'message': 'Operation created (not saved - no database)',
                'operation': new_operation
            }), 201
        except Exception as e:
            return jsonify({
                'success': False,
                'message': 'Failed to create operation',
                'error': str(e)
            }), 500

# Movements endpoints - EMPTY DATA
@app.route('/api/movements', methods=['GET'])
def get_movements():
    return jsonify({
        'success': True,
        'movements': [],
        'total': 0,
        'message': 'No movement history found in database'
    })

# Users endpoints - EMPTY DATA
@app.route('/api/users', methods=['GET', 'POST'])
def handle_users():
    if request.method == 'GET':
        return jsonify({
            'success': True,
            'users': [],
            'total': 0,
            'message': 'No users found in database'
        })
    
    elif request.method == 'POST':
        try:
            data = request.get_json()
            
            new_user = {
                'id': str(int(datetime.now().timestamp())),
                'name': data.get('name'),
                'email': data.get('email'),
                'role': data.get('role'),
                'status': 'active',
                'lastLogin': None,
                'createdAt': datetime.utcnow().isoformat(),
                'createdBy': data.get('createdBy')
            }
            
            print(f"⚠️  User created but not saved - no database: {new_user}")
            
            return jsonify({
                'success': True,
                'message': 'User created (not saved - no database)',
                'user': new_user
            }), 201
        except Exception as e:
            return jsonify({
                'success': False,
                'message': 'Failed to create user',
                'error': str(e)
            }), 500

# Profile endpoints - EMPTY DATA
@app.route('/api/profile', methods=['GET', 'PUT'])
def handle_profile():
    if request.method == 'GET':
        return jsonify({
            'success': False,
            'message': 'No profile found in database for this user',
            'profile': None
        }), 404
    
    elif request.method == 'PUT':
        try:
            data = request.get_json()
            print(f"⚠️  Profile update received but not saved - no database: {data}")
            
            return jsonify({
                'success': True,
                'message': 'Profile updated (not saved - no database)',
                'profile': data
            }), 200
        except Exception as e:
            return jsonify({
                'success': False,
                'message': 'Failed to update profile',
                'error': str(e)
            }), 500

# Settings endpoints - EMPTY DATA
@app.route('/api/settings', methods=['GET', 'PUT'])
def handle_settings():
    if request.method == 'GET':
        return jsonify({
            'success': False,
            'message': 'No system settings found in database',
            'settings': None
        }), 404
    
    elif request.method == 'PUT':
        try:
            data = request.get_json()
            print(f"⚠️  Settings update received but not saved - no database: {data}")
            
            return jsonify({
                'success': True,
                'message': 'Settings updated (not saved - no database)',
                'settings': data
            }), 200
        except Exception as e:
            return jsonify({
                'success': False,
                'message': 'Failed to update settings',
                'error': str(e)
            }), 500

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
    print("📊 EMPTY DATABASE MODE - All endpoints return empty data")
    print("✅ Connect a real database to see actual data!")
    app.run(debug=debug, port=port, host='0.0.0.0')
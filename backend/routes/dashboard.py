from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timedelta
import os

bp = Blueprint('dashboard', __name__, url_prefix='/api/dashboard')

def get_db():
    client = MongoClient(os.getenv('MONGO_URI'))
    return client['stockmaster']

@bp.route('/stats', methods=['GET'])
def get_dashboard_stats():
    """Get dashboard statistics and KPIs"""
    try:
        if os.getenv('FLASK_ENV') == 'development':
            # Mock dashboard data
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
                    },
                    {
                        'type': 'out_of_stock',
                        'message': '5 products are completely out of stock',
                        'priority': 'critical',
                        'timestamp': (datetime.utcnow() - timedelta(hours=1)).isoformat()
                    },
                    {
                        'type': 'pending_receipts',
                        'message': '3 receipts pending approval for more than 24h',
                        'priority': 'medium',
                        'timestamp': (datetime.utcnow() - timedelta(minutes=30)).isoformat()
                    }
                ],
                'recent_activity': [
                    {
                        'id': '1',
                        'user': 'Admin User',
                        'action': 'Created new product',
                        'details': 'Steel Rods (STL-001)',
                        'timestamp': (datetime.utcnow() - timedelta(minutes=10)).isoformat()
                    },
                    {
                        'id': '2',
                        'user': 'Inventory Manager',
                        'action': 'Updated receipt status',
                        'details': 'RCP-20240120-001 marked as done',
                        'timestamp': (datetime.utcnow() - timedelta(minutes=25)).isoformat()
                    },
                    {
                        'id': '3',
                        'user': 'Warehouse Staff',
                        'action': 'Completed transfer',
                        'details': 'TRF-20240121-002 from Warehouse A to Production',
                        'timestamp': (datetime.utcnow() - timedelta(minutes=35)).isoformat()
                    },
                    {
                        'id': '4',
                        'user': 'Quality Inspector',
                        'action': 'Created adjustment',
                        'details': 'ADJ-20240121-003 for damaged goods',
                        'timestamp': (datetime.utcnow() - timedelta(hours=1)).isoformat()
                    },
                    {
                        'id': '5',
                        'user': 'Inventory Manager',
                        'action': 'Updated delivery status',
                        'details': 'DEL-20240120-001 ready for dispatch',
                        'timestamp': (datetime.utcnow() - timedelta(hours=2)).isoformat()
                    }
                ]
            }
            return jsonify(stats)
        
        # Production logic would aggregate data from MongoDB
        db = get_db()
        
        # Get product statistics
        total_products = db.products.count_documents({})
        low_stock_products = db.products.count_documents({'status': 'Low Stock'})
        out_of_stock_products = db.products.count_documents({'status': 'Out of Stock'})
        in_stock_products = total_products - low_stock_products - out_of_stock_products
        
        # Get operations statistics
        pending_receipts = db.receipts.count_documents({'status': {'$in': ['draft', 'waiting']}})
        pending_deliveries = db.deliveries.count_documents({'status': {'$in': ['draft', 'waiting']}})
        internal_transfers = db.transfers.count_documents({'status': {'$in': ['draft', 'waiting']}})
        
        stats = {
            'products': {
                'total': total_products,
                'in_stock': in_stock_products,
                'low_stock': low_stock_products,
                'out_of_stock': out_of_stock_products
            },
            'operations': {
                'pending_receipts': pending_receipts,
                'pending_deliveries': pending_deliveries,
                'internal_transfers': internal_transfers
            }
        }
        
        return jsonify(stats)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/chart-data', methods=['GET'])
def get_chart_data():
    """Get data for dashboard charts"""
    try:
        chart_type = request.args.get('type', 'stock_levels')
        
        if os.getenv('FLASK_ENV') == 'development':
            if chart_type == 'stock_levels':
                data = {
                    'labels': ['In Stock', 'Low Stock', 'Out of Stock'],
                    'datasets': [{
                        'data': [1150, 23, 61],
                        'backgroundColor': ['#22c55e', '#f59e0b', '#ef4444'],
                        'borderColor': ['#16a34a', '#d97706', '#dc2626'],
                        'borderWidth': 2
                    }]
                }
            elif chart_type == 'operations_trend':
                data = {
                    'labels': ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    'datasets': [{
                        'label': 'Receipts',
                        'data': [12, 8, 15, 22, 18, 6, 3],
                        'borderColor': '#3b82f6',
                        'backgroundColor': 'rgba(59, 130, 246, 0.1)',
                        'tension': 0.4
                    }, {
                        'label': 'Deliveries',
                        'data': [8, 12, 10, 15, 20, 4, 2],
                        'borderColor': '#10b981',
                        'backgroundColor': 'rgba(16, 185, 129, 0.1)',
                        'tension': 0.4
                    }, {
                        'label': 'Transfers',
                        'data': [5, 7, 8, 6, 9, 2, 1],
                        'borderColor': '#f59e0b',
                        'backgroundColor': 'rgba(245, 158, 11, 0.1)',
                        'tension': 0.4
                    }]
                }
            elif chart_type == 'category_distribution':
                data = {
                    'labels': ['Raw Materials', 'Furniture', 'Electronics', 'Supplies', 'Tools'],
                    'datasets': [{
                        'data': [425, 289, 156, 234, 130],
                        'backgroundColor': [
                            '#3b82f6',
                            '#10b981',
                            '#f59e0b',
                            '#ef4444',
                            '#8b5cf6'
                        ]
                    }]
                }
            else:
                return jsonify({'error': 'Invalid chart type'}), 400
            
            return jsonify({'chart_data': data})
        
        # Production logic would query MongoDB and aggregate data
        db = get_db()
        
        if chart_type == 'stock_levels':
            # Aggregate stock levels by status
            pipeline = [
                {'$group': {
                    '_id': '$status',
                    'count': {'$sum': 1}
                }}
            ]
            result = list(db.products.aggregate(pipeline))
            # Transform result for chart format
            # ... implement aggregation logic
        
        return jsonify({'chart_data': {}})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/low-stock', methods=['GET'])
def get_low_stock_products():
    """Get products with low stock levels"""
    try:
        limit = int(request.args.get('limit', 10))
        
        if os.getenv('FLASK_ENV') == 'development':
            mock_low_stock = [
                {
                    'id': '3',
                    'name': 'Laptop Batteries',
                    'sku': 'BAT-102',
                    'current_stock': 8,
                    'reorder_level': 15,
                    'location': 'Main Store',
                    'status': 'Low Stock'
                },
                {
                    'id': '6',
                    'name': 'Safety Helmets',
                    'sku': 'SAF-200',
                    'current_stock': 5,
                    'reorder_level': 20,
                    'location': 'Warehouse A',
                    'status': 'Low Stock'
                },
                {
                    'id': '7',
                    'name': 'Printer Paper',
                    'sku': 'PPR-150',
                    'current_stock': 12,
                    'reorder_level': 50,
                    'location': 'Main Store',
                    'status': 'Low Stock'
                }
            ]
            return jsonify({'products': mock_low_stock[:limit]})
        
        db = get_db()
        low_stock_products = list(db.products.find(
            {'status': 'Low Stock'},
            {'name': 1, 'sku': 1, 'stock': 1, 'reorder_level': 1, 'location': 1, 'status': 1}
        ).limit(limit))
        
        # Convert ObjectId to string
        for product in low_stock_products:
            product['_id'] = str(product['_id'])
        
        return jsonify({'products': low_stock_products})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/recent-operations', methods=['GET'])
def get_recent_operations():
    """Get recent operations across all types"""
    try:
        limit = int(request.args.get('limit', 5))
        
        if os.getenv('FLASK_ENV') == 'development':
            mock_operations = [
                {
                    'id': 'R002',
                    'type': 'receipt',
                    'title': 'Receipt RCP-20240121-002',
                    'description': 'Office Chairs from Furniture Plus',
                    'status': 'waiting',
                    'timestamp': (datetime.utcnow() - timedelta(hours=1)).isoformat()
                },
                {
                    'id': 'D001',
                    'type': 'delivery',
                    'title': 'Delivery DEL-20240120-001',
                    'description': 'Laptop Batteries to Tech Solutions Inc',
                    'status': 'ready',
                    'timestamp': (datetime.utcnow() - timedelta(hours=3)).isoformat()
                },
                {
                    'id': 'T002',
                    'type': 'transfer',
                    'title': 'Transfer TRF-20240121-002',
                    'description': 'Cleaning Supplies: Main Store → Warehouse B',
                    'status': 'waiting',
                    'timestamp': (datetime.utcnow() - timedelta(hours=4)).isoformat()
                },
                {
                    'id': 'A002',
                    'type': 'adjustment',
                    'title': 'Adjustment ADJ-20240120-002',
                    'description': 'Paint Cans stock count correction (+10)',
                    'status': 'done',
                    'timestamp': (datetime.utcnow() - timedelta(hours=8)).isoformat()
                }
            ]
            return jsonify({'operations': mock_operations[:limit]})
        
        # In production, you'd union results from multiple collections
        # and sort by timestamp
        db = get_db()
        
        # This is a simplified version - you might want to use aggregation
        # to properly combine and sort operations from different collections
        operations = []
        
        return jsonify({'operations': operations})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/performance', methods=['GET'])
def get_performance_metrics():
    """Get performance metrics for the dashboard"""
    try:
        period = request.args.get('period', 'week')  # day, week, month
        
        if os.getenv('FLASK_ENV') == 'development':
            if period == 'day':
                metrics = {
                    'operations_completed': 23,
                    'products_processed': 156,
                    'average_processing_time': '2.3 hours',
                    'efficiency_score': 87.5
                }
            elif period == 'week':
                metrics = {
                    'operations_completed': 127,
                    'products_processed': 892,
                    'average_processing_time': '1.8 hours',
                    'efficiency_score': 91.2
                }
            else:  # month
                metrics = {
                    'operations_completed': 543,
                    'products_processed': 3421,
                    'average_processing_time': '2.1 hours',
                    'efficiency_score': 89.8
                }
            
            return jsonify({'metrics': metrics})
        
        # Production logic would calculate real metrics from database
        db = get_db()
        
        # Calculate date range based on period
        now = datetime.utcnow()
        if period == 'day':
            start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        elif period == 'week':
            start_date = now - timedelta(days=7)
        else:  # month
            start_date = now - timedelta(days=30)
        
        # Aggregate metrics from operations collections
        # ... implement aggregation queries
        
        return jsonify({'metrics': {}})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
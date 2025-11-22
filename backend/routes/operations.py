from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import os

bp = Blueprint('operations', __name__, url_prefix='/api/operations')

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

def generate_id(prefix):
    """Generate a unique ID with prefix"""
    timestamp = datetime.now().strftime('%Y%m%d%H%M%S')
    return f"{prefix}{timestamp}"

# RECEIPTS ROUTES
@bp.route('/receipts', methods=['GET'])
def get_receipts():
    """Get all receipts"""
    try:
        if os.getenv('FLASK_ENV') == 'development':
            mock_receipts = [
                {
                    "id": "R001",
                    "receipt_id": "RCP-20240120-001",
                    "supplier": "Steel Corp Ltd",
                    "items": [
                        {
                            "product_id": "1",
                            "product_name": "Steel Rods",
                            "sku": "STL-001",
                            "quantity": 100,
                            "unit_price": 2.50
                        },
                        {
                            "product_id": "5",
                            "product_name": "Cleaning Supplies",
                            "sku": "CLN-300",
                            "quantity": 25,
                            "unit_price": 8.50
                        }
                    ],
                    "total_items": 2,
                    "total_value": 462.50,
                    "status": "done",
                    "notes": "Weekly delivery as scheduled",
                    "created_by": "dev-user-123",
                    "created_at": "2024-01-20T09:00:00Z",
                    "updated_at": "2024-01-20T15:30:00Z"
                },
                {
                    "id": "R002",
                    "receipt_id": "RCP-20240121-002",
                    "supplier": "Furniture Plus",
                    "items": [
                        {
                            "product_id": "2",
                            "product_name": "Office Chairs",
                            "sku": "OFC-205",
                            "quantity": 10,
                            "unit_price": 85.00
                        }
                    ],
                    "total_items": 1,
                    "total_value": 850.00,
                    "status": "waiting",
                    "notes": "Awaiting quality inspection",
                    "created_by": "manager-456",
                    "created_at": "2024-01-21T10:15:00Z",
                    "updated_at": "2024-01-21T10:15:00Z"
                }
            ]
            return jsonify({'receipts': mock_receipts, 'total': len(mock_receipts)})
        
        db = get_db()
        receipts = list(db.receipts.find())
        return jsonify({'receipts': serialize_doc(receipts), 'total': len(receipts)})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/receipts', methods=['POST'])
def create_receipt():
    """Create a new receipt"""
    try:
        data = request.json
        
        receipt_doc = {
            'receipt_id': generate_id('RCP-'),
            'supplier': data['supplier'],
            'items': data['items'],
            'total_items': len(data['items']),
            'total_value': sum(item['quantity'] * item.get('unit_price', 0) for item in data['items']),
            'status': data.get('status', 'draft'),
            'notes': data.get('notes', ''),
            'created_by': getattr(request, 'user', {}).get('uid', 'system'),
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        if os.getenv('FLASK_ENV') == 'development':
            receipt_doc['id'] = str(ObjectId())
            return jsonify({
                'message': 'Receipt created successfully',
                'receipt': receipt_doc
            }), 201
        
        db = get_db()
        result = db.receipts.insert_one(receipt_doc)
        receipt_doc['_id'] = str(result.inserted_id)
        
        return jsonify({
            'message': 'Receipt created successfully',
            'receipt': serialize_doc(receipt_doc)
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# DELIVERIES ROUTES
@bp.route('/deliveries', methods=['GET'])
def get_deliveries():
    """Get all deliveries"""
    try:
        if os.getenv('FLASK_ENV') == 'development':
            mock_deliveries = [
                {
                    "id": "D001",
                    "delivery_id": "DEL-20240120-001",
                    "customer": "Tech Solutions Inc",
                    "items": [
                        {
                            "product_id": "3",
                            "product_name": "Laptop Batteries",
                            "sku": "BAT-102",
                            "quantity": 5,
                            "unit_price": 65.00
                        }
                    ],
                    "total_items": 1,
                    "total_value": 325.00,
                    "status": "ready",
                    "delivery_address": "123 Business St, Tech City",
                    "notes": "Urgent delivery requested",
                    "created_by": "dev-user-123",
                    "created_at": "2024-01-20T11:00:00Z",
                    "updated_at": "2024-01-20T14:30:00Z"
                },
                {
                    "id": "D002",
                    "delivery_id": "DEL-20240121-002",
                    "customer": "Construction Co Ltd",
                    "items": [
                        {
                            "product_id": "1",
                            "product_name": "Steel Rods",
                            "sku": "STL-001",
                            "quantity": 50,
                            "unit_price": 3.75
                        }
                    ],
                    "total_items": 1,
                    "total_value": 187.50,
                    "status": "draft",
                    "delivery_address": "789 Industrial Ave, Construction Zone",
                    "notes": "Schedule with site manager",
                    "created_by": "manager-456",
                    "created_at": "2024-01-21T08:30:00Z",
                    "updated_at": "2024-01-21T08:30:00Z"
                }
            ]
            return jsonify({'deliveries': mock_deliveries, 'total': len(mock_deliveries)})
        
        db = get_db()
        deliveries = list(db.deliveries.find())
        return jsonify({'deliveries': serialize_doc(deliveries), 'total': len(deliveries)})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/deliveries', methods=['POST'])
def create_delivery():
    """Create a new delivery"""
    try:
        data = request.json
        
        delivery_doc = {
            'delivery_id': generate_id('DEL-'),
            'customer': data['customer'],
            'items': data['items'],
            'total_items': len(data['items']),
            'total_value': sum(item['quantity'] * item.get('unit_price', 0) for item in data['items']),
            'status': data.get('status', 'draft'),
            'delivery_address': data.get('delivery_address', ''),
            'notes': data.get('notes', ''),
            'created_by': getattr(request, 'user', {}).get('uid', 'system'),
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        if os.getenv('FLASK_ENV') == 'development':
            delivery_doc['id'] = str(ObjectId())
            return jsonify({
                'message': 'Delivery created successfully',
                'delivery': delivery_doc
            }), 201
        
        db = get_db()
        result = db.deliveries.insert_one(delivery_doc)
        delivery_doc['_id'] = str(result.inserted_id)
        
        return jsonify({
            'message': 'Delivery created successfully',
            'delivery': serialize_doc(delivery_doc)
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# TRANSFERS ROUTES
@bp.route('/transfers', methods=['GET'])
def get_transfers():
    """Get all transfers"""
    try:
        if os.getenv('FLASK_ENV') == 'development':
            mock_transfers = [
                {
                    "id": "T001",
                    "transfer_id": "TRF-20240120-001",
                    "from_location": "Warehouse A",
                    "to_location": "Production Floor",
                    "items": [
                        {
                            "product_id": "1",
                            "product_name": "Steel Rods",
                            "sku": "STL-001",
                            "quantity": 20
                        }
                    ],
                    "total_items": 1,
                    "status": "done",
                    "notes": "Weekly production transfer",
                    "created_by": "dev-user-123",
                    "created_at": "2024-01-20T07:00:00Z",
                    "updated_at": "2024-01-20T16:00:00Z"
                },
                {
                    "id": "T002",
                    "transfer_id": "TRF-20240121-002",
                    "from_location": "Main Store",
                    "to_location": "Warehouse B",
                    "items": [
                        {
                            "product_id": "5",
                            "product_name": "Cleaning Supplies",
                            "sku": "CLN-300",
                            "quantity": 15
                        }
                    ],
                    "total_items": 1,
                    "status": "waiting",
                    "notes": "Rebalancing inventory",
                    "created_by": "manager-456",
                    "created_at": "2024-01-21T12:00:00Z",
                    "updated_at": "2024-01-21T12:00:00Z"
                }
            ]
            return jsonify({'transfers': mock_transfers, 'total': len(mock_transfers)})
        
        db = get_db()
        transfers = list(db.transfers.find())
        return jsonify({'transfers': serialize_doc(transfers), 'total': len(transfers)})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/transfers', methods=['POST'])
def create_transfer():
    """Create a new transfer"""
    try:
        data = request.json
        
        transfer_doc = {
            'transfer_id': generate_id('TRF-'),
            'from_location': data['from_location'],
            'to_location': data['to_location'],
            'items': data['items'],
            'total_items': len(data['items']),
            'status': data.get('status', 'draft'),
            'notes': data.get('notes', ''),
            'created_by': getattr(request, 'user', {}).get('uid', 'system'),
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        if os.getenv('FLASK_ENV') == 'development':
            transfer_doc['id'] = str(ObjectId())
            return jsonify({
                'message': 'Transfer created successfully',
                'transfer': transfer_doc
            }), 201
        
        db = get_db()
        result = db.transfers.insert_one(transfer_doc)
        transfer_doc['_id'] = str(result.inserted_id)
        
        return jsonify({
            'message': 'Transfer created successfully',
            'transfer': serialize_doc(transfer_doc)
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ADJUSTMENTS ROUTES
@bp.route('/adjustments', methods=['GET'])
def get_adjustments():
    """Get all inventory adjustments"""
    try:
        if os.getenv('FLASK_ENV') == 'development':
            mock_adjustments = [
                {
                    "id": "A001",
                    "adjustment_id": "ADJ-20240119-001",
                    "product_id": "1",
                    "product_name": "Steel Rods",
                    "sku": "STL-001",
                    "quantity": -5,
                    "reason": "Damaged goods",
                    "location": "Warehouse A",
                    "status": "done",
                    "notes": "Damaged during handling",
                    "created_by": "dev-user-123",
                    "created_at": "2024-01-19T14:30:00Z",
                    "updated_at": "2024-01-19T15:00:00Z"
                },
                {
                    "id": "A002",
                    "adjustment_id": "ADJ-20240120-002",
                    "product_id": "4",
                    "product_name": "Paint Cans",
                    "sku": "PNT-450",
                    "quantity": 10,
                    "reason": "Stock count correction",
                    "location": "Storage Room",
                    "status": "done",
                    "notes": "Physical count revealed discrepancy",
                    "created_by": "manager-456",
                    "created_at": "2024-01-20T10:00:00Z",
                    "updated_at": "2024-01-20T10:30:00Z"
                }
            ]
            return jsonify({'adjustments': mock_adjustments, 'total': len(mock_adjustments)})
        
        db = get_db()
        adjustments = list(db.adjustments.find())
        return jsonify({'adjustments': serialize_doc(adjustments), 'total': len(adjustments)})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/adjustments', methods=['POST'])
def create_adjustment():
    """Create a new inventory adjustment"""
    try:
        data = request.json
        
        adjustment_doc = {
            'adjustment_id': generate_id('ADJ-'),
            'product_id': data['product_id'],
            'product_name': data['product_name'],
            'sku': data['sku'],
            'quantity': data['quantity'],  # Can be positive or negative
            'reason': data['reason'],
            'location': data['location'],
            'status': data.get('status', 'draft'),
            'notes': data.get('notes', ''),
            'created_by': getattr(request, 'user', {}).get('uid', 'system'),
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        
        if os.getenv('FLASK_ENV') == 'development':
            adjustment_doc['id'] = str(ObjectId())
            return jsonify({
                'message': 'Adjustment created successfully',
                'adjustment': adjustment_doc
            }), 201
        
        db = get_db()
        result = db.adjustments.insert_one(adjustment_doc)
        adjustment_doc['_id'] = str(result.inserted_id)
        
        return jsonify({
            'message': 'Adjustment created successfully',
            'adjustment': serialize_doc(adjustment_doc)
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# STOCK MOVEMENTS (LEDGER) ROUTES
@bp.route('/movements', methods=['GET'])
def get_movements():
    """Get stock movement history"""
    try:
        product_id = request.args.get('product_id')
        movement_type = request.args.get('type')
        limit = int(request.args.get('limit', 50))
        
        if os.getenv('FLASK_ENV') == 'development':
            mock_movements = [
                {
                    "id": "M001",
                    "movement_id": "MOV-20240120-001",
                    "type": "receipt",
                    "product_id": "1",
                    "product_name": "Steel Rods",
                    "sku": "STL-001",
                    "quantity": 100,
                    "from_location": "External",
                    "to_location": "Warehouse A",
                    "reference_id": "RCP-20240120-001",
                    "created_by": "dev-user-123",
                    "timestamp": "2024-01-20T15:30:00Z"
                },
                {
                    "id": "M002",
                    "movement_id": "MOV-20240120-002",
                    "type": "transfer",
                    "product_id": "1",
                    "product_name": "Steel Rods",
                    "sku": "STL-001",
                    "quantity": 20,
                    "from_location": "Warehouse A",
                    "to_location": "Production Floor",
                    "reference_id": "TRF-20240120-001",
                    "created_by": "dev-user-123",
                    "timestamp": "2024-01-20T16:00:00Z"
                }
            ]
            return jsonify({'movements': mock_movements, 'total': len(mock_movements)})
        
        db = get_db()
        query = {}
        if product_id:
            query['product_id'] = ObjectId(product_id)
        if movement_type:
            query['type'] = movement_type
            
        movements = list(db.stock_movements.find(query).sort('timestamp', -1).limit(limit))
        return jsonify({'movements': serialize_doc(movements), 'total': len(movements)})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# STATUS UPDATE ROUTES
@bp.route('/<operation_type>/<operation_id>/status', methods=['PUT'])
def update_operation_status(operation_type, operation_id):
    """Update operation status"""
    try:
        data = request.json
        new_status = data.get('status')
        
        if not new_status:
            return jsonify({'error': 'Status is required'}), 400
        
        valid_statuses = ['draft', 'waiting', 'ready', 'done', 'canceled']
        if new_status not in valid_statuses:
            return jsonify({'error': 'Invalid status'}), 400
        
        if os.getenv('FLASK_ENV') == 'development':
            return jsonify({
                'message': f'{operation_type.title()} status updated successfully',
                'status': new_status
            })
        
        db = get_db()
        collection_map = {
            'receipts': db.receipts,
            'deliveries': db.deliveries,
            'transfers': db.transfers,
            'adjustments': db.adjustments
        }
        
        collection = collection_map.get(operation_type)
        if not collection:
            return jsonify({'error': 'Invalid operation type'}), 400
        
        result = collection.update_one(
            {'_id': ObjectId(operation_id)},
            {
                '$set': {
                    'status': new_status,
                    'updated_at': datetime.utcnow(),
                    'updated_by': getattr(request, 'user', {}).get('uid', 'system')
                }
            }
        )
        
        if result.matched_count == 0:
            return jsonify({'error': 'Operation not found'}), 404
        
        return jsonify({'message': f'{operation_type.title()} status updated successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
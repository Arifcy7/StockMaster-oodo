from flask import Blueprint, request, jsonify
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import os

bp = Blueprint('products', __name__, url_prefix='/api/products')

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
def get_products():
    """Get all products with optional filtering"""
    try:
        db = get_db()
        
        # Mock data for development
        mock_products = [
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
            },
            {
                "id": "5",
                "name": "Cleaning Supplies",
                "sku": "CLN-300",
                "category": "Supplies",
                "stock": 75,
                "unit": "units",
                "status": "In Stock",
                "location": "Storage Room",
                "reorder_level": 30,
                "supplier": "Clean Pro",
                "cost_price": 8.50,
                "selling_price": 12.00,
                "created_at": "2024-01-05T00:00:00Z",
                "updated_at": "2024-01-20T11:30:00Z"
            }
        ]
        
        if os.getenv('FLASK_ENV') == 'development':
            # Apply filters to mock data
            search = request.args.get('search', '').lower()
            category = request.args.get('category')
            status = request.args.get('status')
            location = request.args.get('location')
            
            filtered_products = mock_products
            
            if search:
                filtered_products = [p for p in filtered_products 
                                   if search in p['name'].lower() or 
                                      search in p['sku'].lower() or
                                      search in p['category'].lower()]
            
            if category:
                filtered_products = [p for p in filtered_products if p['category'] == category]
            
            if status:
                filtered_products = [p for p in filtered_products if p['status'] == status]
            
            if location:
                filtered_products = [p for p in filtered_products if p['location'] == location]
            
            return jsonify({
                'products': filtered_products,
                'total': len(filtered_products)
            })
        
        # Production logic
        query = {}
        search = request.args.get('search')
        if search:
            query['$or'] = [
                {'name': {'$regex': search, '$options': 'i'}},
                {'sku': {'$regex': search, '$options': 'i'}},
                {'category': {'$regex': search, '$options': 'i'}}
            ]
        
        category = request.args.get('category')
        if category:
            query['category'] = category
        
        status = request.args.get('status')
        if status:
            query['status'] = status
        
        location = request.args.get('location')
        if location:
            query['location'] = location
        
        products = list(db.products.find(query))
        products = serialize_doc(products)
        
        return jsonify({
            'products': products,
            'total': len(products)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/', methods=['POST'])
def create_product():
    """Create a new product"""
    try:
        data = request.json
        db = get_db()
        
        # Validate required fields
        required_fields = ['name', 'sku', 'category', 'unit', 'location']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400
        
        # Check if SKU already exists
        if db.products.find_one({'sku': data['sku']}):
            return jsonify({'error': 'Product with this SKU already exists'}), 400
        
        # Determine status based on stock
        stock = data.get('stock', 0)
        reorder_level = data.get('reorder_level', 0)
        
        if stock == 0:
            status = 'Out of Stock'
        elif stock <= reorder_level:
            status = 'Low Stock'
        else:
            status = 'In Stock'
        
        product_doc = {
            'name': data['name'],
            'sku': data['sku'],
            'category': data['category'],
            'stock': stock,
            'unit': data['unit'],
            'status': status,
            'location': data['location'],
            'reorder_level': reorder_level,
            'supplier': data.get('supplier'),
            'cost_price': data.get('cost_price', 0),
            'selling_price': data.get('selling_price', 0),
            'description': data.get('description'),
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow(),
            'created_by': getattr(request, 'user', {}).get('uid', 'system')
        }
        
        if os.getenv('FLASK_ENV') == 'development':
            product_doc['id'] = str(ObjectId())
            return jsonify({
                'message': 'Product created successfully',
                'product': product_doc
            }), 201
        
        result = db.products.insert_one(product_doc)
        product_doc['_id'] = str(result.inserted_id)
        
        return jsonify({
            'message': 'Product created successfully',
            'product': serialize_doc(product_doc)
        }), 201
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<product_id>', methods=['GET'])
def get_product(product_id):
    """Get a specific product by ID"""
    try:
        if os.getenv('FLASK_ENV') == 'development':
            # Return mock product
            mock_product = {
                "id": product_id,
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
                "description": "High quality steel rods for construction",
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-20T10:30:00Z"
            }
            return jsonify({'product': mock_product})
        
        db = get_db()
        product = db.products.find_one({'_id': ObjectId(product_id)})
        
        if not product:
            return jsonify({'error': 'Product not found'}), 404
        
        return jsonify({'product': serialize_doc(product)})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<product_id>', methods=['PUT'])
def update_product(product_id):
    """Update a product"""
    try:
        data = request.json
        
        if os.getenv('FLASK_ENV') == 'development':
            return jsonify({
                'message': 'Product updated successfully',
                'product': {**data, 'id': product_id, 'updated_at': datetime.utcnow().isoformat()}
            })
        
        db = get_db()
        
        # Check if product exists
        existing_product = db.products.find_one({'_id': ObjectId(product_id)})
        if not existing_product:
            return jsonify({'error': 'Product not found'}), 404
        
        # Update status based on stock if stock is being updated
        if 'stock' in data:
            stock = data['stock']
            reorder_level = data.get('reorder_level', existing_product.get('reorder_level', 0))
            
            if stock == 0:
                data['status'] = 'Out of Stock'
            elif stock <= reorder_level:
                data['status'] = 'Low Stock'
            else:
                data['status'] = 'In Stock'
        
        data['updated_at'] = datetime.utcnow()
        data['updated_by'] = getattr(request, 'user', {}).get('uid', 'system')
        
        db.products.update_one(
            {'_id': ObjectId(product_id)},
            {'$set': data}
        )
        
        updated_product = db.products.find_one({'_id': ObjectId(product_id)})
        
        return jsonify({
            'message': 'Product updated successfully',
            'product': serialize_doc(updated_product)
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/<product_id>', methods=['DELETE'])
def delete_product(product_id):
    """Delete a product"""
    try:
        if os.getenv('FLASK_ENV') == 'development':
            return jsonify({'message': 'Product deleted successfully'})
        
        db = get_db()
        
        result = db.products.delete_one({'_id': ObjectId(product_id)})
        
        if result.deleted_count == 0:
            return jsonify({'error': 'Product not found'}), 404
        
        return jsonify({'message': 'Product deleted successfully'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/categories', methods=['GET'])
def get_categories():
    """Get all product categories"""
    try:
        if os.getenv('FLASK_ENV') == 'development':
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
        
        db = get_db()
        categories = db.products.distinct('category')
        
        return jsonify({'categories': categories})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@bp.route('/locations', methods=['GET'])
def get_locations():
    """Get all product locations"""
    try:
        if os.getenv('FLASK_ENV') == 'development':
            return jsonify({
                'locations': [
                    'Warehouse A',
                    'Warehouse B',
                    'Main Store',
                    'Storage Room',
                    'Production Floor'
                ]
            })
        
        db = get_db()
        locations = db.products.distinct('location')
        
        return jsonify({'locations': locations})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
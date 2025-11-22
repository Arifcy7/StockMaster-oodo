"""
Database schema definitions and sample data
"""

from datetime import datetime
from bson import ObjectId

# User Schema
USER_SCHEMA = {
    "firebase_uid": str,  # Firebase authentication UID
    "name": str,
    "email": str,
    "role": str,  # admin, manager, staff
    "department": str,
    "phone": str,
    "location": str,
    "status": str,  # active, inactive
    "created_at": datetime,
    "updated_at": datetime,
    "last_login": datetime,
}

# Product Schema
PRODUCT_SCHEMA = {
    "name": str,
    "sku": str,  # Unique identifier
    "category": str,
    "stock": int,
    "unit": str,  # kg, units, liters, etc.
    "status": str,  # In Stock, Low Stock, Out of Stock
    "location": str,
    "reorder_level": int,
    "supplier": str,
    "cost_price": float,
    "selling_price": float,
    "description": str,
    "created_at": datetime,
    "updated_at": datetime,
    "created_by": str,  # User ID
}

# Receipt Schema
RECEIPT_SCHEMA = {
    "receipt_id": str,  # Generated ID like RCP-YYYYMMDD-001
    "supplier": str,
    "items": [
        {
            "product_id": str,  # Reference to product
            "product_name": str,
            "sku": str,
            "quantity": int,
            "unit_price": float
        }
    ],
    "total_items": int,
    "total_value": float,
    "status": str,  # draft, waiting, ready, done, canceled
    "notes": str,
    "created_by": str,
    "created_at": datetime,
    "updated_at": datetime,
}

# Delivery Schema
DELIVERY_SCHEMA = {
    "delivery_id": str,  # Generated ID like DEL-YYYYMMDD-001
    "customer": str,
    "items": [
        {
            "product_id": str,
            "product_name": str,
            "sku": str,
            "quantity": int,
            "unit_price": float
        }
    ],
    "total_items": int,
    "total_value": float,
    "status": str,  # draft, waiting, ready, done, canceled
    "delivery_address": str,
    "notes": str,
    "created_by": str,
    "created_at": datetime,
    "updated_at": datetime,
}

# Transfer Schema
TRANSFER_SCHEMA = {
    "transfer_id": str,  # Generated ID like TRF-YYYYMMDD-001
    "from_location": str,
    "to_location": str,
    "items": [
        {
            "product_id": str,
            "product_name": str,
            "sku": str,
            "quantity": int
        }
    ],
    "total_items": int,
    "status": str,  # draft, waiting, ready, done, canceled
    "notes": str,
    "created_by": str,
    "created_at": datetime,
    "updated_at": datetime,
}

# Adjustment Schema
ADJUSTMENT_SCHEMA = {
    "adjustment_id": str,  # Generated ID like ADJ-YYYYMMDD-001
    "product_id": str,
    "product_name": str,
    "sku": str,
    "quantity": int,  # Can be positive or negative
    "reason": str,
    "location": str,
    "status": str,  # draft, waiting, ready, done, canceled
    "notes": str,
    "created_by": str,
    "created_at": datetime,
    "updated_at": datetime,
}

# Stock Movement (Ledger) Schema
STOCK_MOVEMENT_SCHEMA = {
    "movement_id": str,  # Generated ID like MOV-YYYYMMDD-001
    "type": str,  # receipt, delivery, transfer, adjustment
    "product_id": str,
    "product_name": str,
    "sku": str,
    "quantity": int,
    "from_location": str,
    "to_location": str,
    "reference_id": str,  # ID of the source operation
    "created_by": str,
    "timestamp": datetime,
}

# Sample data for development/testing
SAMPLE_USERS = [
    {
        "firebase_uid": "admin-123",
        "name": "Administrator",
        "email": "admin@stockmaster.com",
        "role": "admin",
        "department": "Management",
        "phone": "+1-555-0001",
        "location": "Head Office",
        "status": "active",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    },
    {
        "firebase_uid": "manager-456",
        "name": "Inventory Manager",
        "email": "manager@stockmaster.com",
        "role": "manager",
        "department": "Warehouse",
        "phone": "+1-555-0002",
        "location": "Warehouse A",
        "status": "active",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
    }
]

SAMPLE_PRODUCTS = [
    {
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
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "created_by": "admin-123"
    },
    {
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
        "description": "Ergonomic office chairs with lumbar support",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        "created_by": "admin-123"
    }
]

def get_collection_indexes():
    """Define database indexes for better performance"""
    return {
        'users': [
            {'email': 1},  # Unique index on email
            {'firebase_uid': 1},  # Index on Firebase UID
            {'role': 1, 'status': 1}
        ],
        'products': [
            {'sku': 1},  # Unique index on SKU
            {'category': 1},
            {'location': 1},
            {'status': 1},
            {'name': 'text', 'description': 'text'}  # Text search index
        ],
        'receipts': [
            {'receipt_id': 1},
            {'supplier': 1},
            {'status': 1},
            {'created_at': -1}
        ],
        'deliveries': [
            {'delivery_id': 1},
            {'customer': 1},
            {'status': 1},
            {'created_at': -1}
        ],
        'transfers': [
            {'transfer_id': 1},
            {'from_location': 1},
            {'to_location': 1},
            {'status': 1},
            {'created_at': -1}
        ],
        'adjustments': [
            {'adjustment_id': 1},
            {'product_id': 1},
            {'status': 1},
            {'created_at': -1}
        ],
        'stock_movements': [
            {'product_id': 1},
            {'type': 1},
            {'timestamp': -1},
            {'reference_id': 1}
        ]
    }
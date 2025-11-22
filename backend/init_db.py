"""
Database initialization script
Run this to set up the MongoDB database with sample data
"""

import os
import sys
from pymongo import MongoClient
from dotenv import load_dotenv
from models.schemas import SAMPLE_USERS, SAMPLE_PRODUCTS, get_collection_indexes

# Load environment variables
load_dotenv()

def init_database():
    """Initialize the MongoDB database with collections and sample data"""
    try:
        # Connect to MongoDB
        client = MongoClient(os.getenv('MONGO_URI'))
        db = client['stockmaster']
        
        print("🔧 Initializing StockMaster Database...")
        
        # Create collections and indexes
        collections_to_create = [
            'users', 'products', 'receipts', 'deliveries', 
            'transfers', 'adjustments', 'stock_movements'
        ]
        
        indexes = get_collection_indexes()
        
        for collection_name in collections_to_create:
            collection = db[collection_name]
            
            # Create indexes if they don't exist
            if collection_name in indexes:
                for index in indexes[collection_name]:
                    try:
                        if isinstance(index, dict):
                            collection.create_index(list(index.items()))
                        else:
                            collection.create_index(index)
                        print(f"✅ Created index for {collection_name}: {index}")
                    except Exception as e:
                        print(f"⚠️  Index might already exist for {collection_name}: {e}")
        
        # Insert sample data if collections are empty
        if db.users.count_documents({}) == 0:
            db.users.insert_many(SAMPLE_USERS)
            print("✅ Inserted sample users")
        else:
            print("ℹ️  Users collection already has data")
        
        if db.products.count_documents({}) == 0:
            db.products.insert_many(SAMPLE_PRODUCTS)
            print("✅ Inserted sample products")
        else:
            print("ℹ️  Products collection already has data")
        
        # Create additional sample data
        if db.receipts.count_documents({}) == 0:
            sample_receipt = {
                "receipt_id": "RCP-20240120-001",
                "supplier": "Steel Corp Ltd",
                "items": [
                    {
                        "product_id": str(db.products.find_one({"sku": "STL-001"})["_id"]),
                        "product_name": "Steel Rods",
                        "sku": "STL-001",
                        "quantity": 100,
                        "unit_price": 2.50
                    }
                ],
                "total_items": 1,
                "total_value": 250.00,
                "status": "done",
                "notes": "Weekly delivery as scheduled",
                "created_by": "admin-123",
                "created_at": "2024-01-20T09:00:00Z",
                "updated_at": "2024-01-20T15:30:00Z"
            }
            db.receipts.insert_one(sample_receipt)
            print("✅ Inserted sample receipt")
        
        print("\n🎉 Database initialization completed successfully!")
        print("\n📊 Database Statistics:")
        print(f"   Users: {db.users.count_documents({})}")
        print(f"   Products: {db.products.count_documents({})}")
        print(f"   Receipts: {db.receipts.count_documents({})}")
        print(f"   Deliveries: {db.deliveries.count_documents({})}")
        print(f"   Transfers: {db.transfers.count_documents({})}")
        print(f"   Adjustments: {db.adjustments.count_documents({})}")
        print(f"   Stock Movements: {db.stock_movements.count_documents({})}")
        
        return True
        
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        return False
    finally:
        if 'client' in locals():
            client.close()

def reset_database():
    """Reset the database by dropping all collections"""
    try:
        client = MongoClient(os.getenv('MONGO_URI'))
        db = client['stockmaster']
        
        print("⚠️  RESETTING DATABASE - This will delete all data!")
        confirm = input("Are you sure? Type 'yes' to continue: ")
        
        if confirm.lower() == 'yes':
            collections = db.list_collection_names()
            for collection_name in collections:
                db[collection_name].drop()
                print(f"🗑️  Dropped collection: {collection_name}")
            
            print("✅ Database reset completed")
            return True
        else:
            print("❌ Reset cancelled")
            return False
            
    except Exception as e:
        print(f"❌ Error resetting database: {e}")
        return False
    finally:
        if 'client' in locals():
            client.close()

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "reset":
        reset_database()
    else:
        init_database()
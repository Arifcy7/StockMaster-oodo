from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, auth
from bson import ObjectId
import json
from functools import wraps

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://localhost:5173", "*"])

# MongoDB connection
try:
    client = MongoClient(os.getenv('MONGO_URI'))
    db = client['stockmaster']
    print("✅ Connected to MongoDB")
except Exception as e:
    print(f"❌ Failed to connect to MongoDB: {e}")

# Initialize Firebase Admin SDK
try:
    # For development, you can use the Firebase config directly
    # In production, use a service account key file
    firebase_config = {
        "type": "service_account",
        "project_id": "shopping-app-5779c",
        "private_key_id": "dummy",
        "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
        "client_email": "firebase-adminsdk@shopping-app-5779c.iam.gserviceaccount.com",
        "client_id": "dummy",
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
    }
    
    # For now, we'll skip Firebase Admin initialization in development
    # Uncomment and configure properly for production
    # cred = credentials.Certificate(firebase_config)
    # firebase_admin.initialize_app(cred)
    print("⚠️  Firebase Admin SDK not initialized (development mode)")
except Exception as e:
    print(f"⚠️  Firebase Admin SDK initialization skipped: {e}")

# Middleware for authentication
def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # For development, skip auth verification
        if os.getenv('FLASK_ENV') == 'development':
            # Mock user for development
            request.user = {
                'uid': 'dev-user-123',
                'email': 'dev@example.com',
                'role': 'admin'
            }
            return f(*args, **kwargs)
            
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'No token provided'}), 401
        
        try:
            # Remove 'Bearer ' prefix
            token = token.replace('Bearer ', '')
            decoded_token = auth.verify_id_token(token)
            
            # Get user from database
            user = db.users.find_one({'firebase_uid': decoded_token['uid']})
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            request.user = {
                'uid': decoded_token['uid'],
                'email': decoded_token.get('email'),
                'role': user.get('role', 'staff')
            }
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'error': 'Invalid token', 'details': str(e)}), 401
    
    return decorated_function

def require_role(required_role):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user_role = getattr(request, 'user', {}).get('role')
            if user_role != required_role and user_role != 'admin':
                return jsonify({'error': 'Insufficient permissions'}), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator

# Utility function to convert ObjectId to string
def serialize_doc(doc):
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

# Import routes
from routes import auth_routes, products, operations, users, dashboard

app.register_blueprint(auth_routes.bp)
app.register_blueprint(products.bp)
app.register_blueprint(operations.bp)
app.register_blueprint(users.bp)
app.register_blueprint(dashboard.bp)

@app.route('/health')
def health():
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.utcnow().isoformat(),
        'version': '1.0.0'
    })

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV') == 'development'
    app.run(debug=debug, port=port, host='0.0.0.0')
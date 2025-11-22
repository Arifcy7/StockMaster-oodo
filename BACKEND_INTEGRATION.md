# StockMaster Backend Integration Guide

This document provides instructions for integrating StockMaster with Firebase Authentication, MongoDB database, and Flask backend API.

## Architecture Overview

StockMaster follows a modern full-stack architecture:

```
Frontend (React + TypeScript)
    ↓
Firebase Authentication
    ↓
Flask Backend API
    ↓
MongoDB Database
```

## 1. Firebase Authentication Setup

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Authentication in the Firebase Console
4. Enable Email/Password authentication provider
5. Enable Phone authentication for OTP-based password reset

### Step 2: Get Firebase Configuration
From Firebase Console → Project Settings → General, copy your config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

### Step 3: Install Firebase SDK
```bash
npm install firebase
```

### Step 4: Create Firebase Service
Create `src/services/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  // Your config here
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

### Step 5: Integrate Authentication
Update the auth handlers in `src/pages/Auth.tsx` to use Firebase:

```typescript
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail 
} from 'firebase/auth';
import { auth } from '@/services/firebase';

// Login
const { user } = await signInWithEmailAndPassword(auth, email, password);

// Signup
const { user } = await createUserWithEmailAndPassword(auth, email, password);

// Password Reset
await sendPasswordResetEmail(auth, email);
```

## 2. MongoDB Setup

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Create a database user
4. Whitelist your IP address
5. Get connection string

### Step 2: Database Schema

Create the following collections:

#### users
```json
{
  "_id": "ObjectId",
  "firebase_uid": "string",
  "name": "string",
  "email": "string",
  "role": "admin | manager | staff",
  "department": "string",
  "phone": "string",
  "location": "string",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

#### products
```json
{
  "_id": "ObjectId",
  "name": "string",
  "sku": "string",
  "category": "string",
  "stock": "number",
  "unit": "string",
  "status": "string",
  "location": "string",
  "reorder_level": "number",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

#### receipts
```json
{
  "_id": "ObjectId",
  "receipt_id": "string",
  "supplier": "string",
  "items": [
    {
      "product_id": "ObjectId",
      "quantity": "number"
    }
  ],
  "status": "draft | waiting | ready | done | canceled",
  "created_by": "ObjectId",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

#### deliveries
```json
{
  "_id": "ObjectId",
  "delivery_id": "string",
  "customer": "string",
  "items": [
    {
      "product_id": "ObjectId",
      "quantity": "number"
    }
  ],
  "status": "draft | waiting | ready | done | canceled",
  "created_by": "ObjectId",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

#### transfers
```json
{
  "_id": "ObjectId",
  "transfer_id": "string",
  "from_location": "string",
  "to_location": "string",
  "items": [
    {
      "product_id": "ObjectId",
      "quantity": "number"
    }
  ],
  "status": "draft | waiting | ready | done | canceled",
  "created_by": "ObjectId",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

#### stock_movements (Ledger)
```json
{
  "_id": "ObjectId",
  "movement_id": "string",
  "type": "receipt | delivery | transfer | adjustment",
  "product_id": "ObjectId",
  "quantity": "number",
  "from_location": "string",
  "to_location": "string",
  "reference_id": "string",
  "created_by": "ObjectId",
  "timestamp": "timestamp"
}
```

## 3. Flask Backend Setup

### Step 1: Install Flask and Dependencies
```bash
pip install flask flask-cors pymongo firebase-admin python-dotenv
```

### Step 2: Create Flask Application Structure
```
backend/
├── app.py
├── config.py
├── requirements.txt
├── routes/
│   ├── __init__.py
│   ├── auth.py
│   ├── products.py
│   ├── operations.py
│   └── users.py
├── models/
│   ├── __init__.py
│   ├── product.py
│   ├── user.py
│   └── operation.py
└── middleware/
    ├── __init__.py
    └── auth.py
```

### Step 3: Create Basic Flask App (app.py)
```python
from flask import Flask
from flask_cors import CORS
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# MongoDB Connection
client = MongoClient(os.getenv('MONGODB_URI'))
db = client['stockmaster']

# Import routes
from routes import auth, products, operations, users

app.register_blueprint(auth.bp)
app.register_blueprint(products.bp)
app.register_blueprint(operations.bp)
app.register_blueprint(users.bp)

@app.route('/health')
def health():
    return {'status': 'healthy'}

if __name__ == '__main__':
    app.run(debug=True, port=5000)
```

### Step 4: Create API Endpoints

#### Products Route (routes/products.py)
```python
from flask import Blueprint, request, jsonify
from bson import ObjectId

bp = Blueprint('products', __name__, url_prefix='/api/products')

@bp.route('/', methods=['GET'])
def get_products():
    # Get products from MongoDB
    products = db.products.find()
    return jsonify([{**p, '_id': str(p['_id'])} for p in products])

@bp.route('/', methods=['POST'])
def create_product():
    data = request.json
    result = db.products.insert_one(data)
    return jsonify({'id': str(result.inserted_id)}), 201

@bp.route('/<product_id>', methods=['PUT'])
def update_product(product_id):
    data = request.json
    db.products.update_one(
        {'_id': ObjectId(product_id)},
        {'$set': data}
    )
    return jsonify({'message': 'Product updated'})

@bp.route('/<product_id>', methods=['DELETE'])
def delete_product(product_id):
    db.products.delete_one({'_id': ObjectId(product_id)})
    return jsonify({'message': 'Product deleted'})
```

### Step 5: Create Authentication Middleware
```python
from functools import wraps
from flask import request, jsonify
import firebase_admin
from firebase_admin import auth

def require_auth(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'No token provided'}), 401
        
        try:
            # Verify Firebase token
            decoded_token = auth.verify_id_token(token.replace('Bearer ', ''))
            request.user = decoded_token
            return f(*args, **kwargs)
        except Exception as e:
            return jsonify({'error': 'Invalid token'}), 401
    
    return decorated_function

def require_role(role):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if request.user.get('role') != role:
                return jsonify({'error': 'Insufficient permissions'}), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator
```

## 4. Frontend API Integration

### Step 1: Create API Service
Create `src/services/api.ts`:

```typescript
import axios from 'axios';
import { auth } from './firebase';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const productsApi = {
  getAll: () => api.get('/products'),
  create: (data: any) => api.post('/products', data),
  update: (id: string, data: any) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
};

export const operationsApi = {
  getReceipts: () => api.get('/operations/receipts'),
  createReceipt: (data: any) => api.post('/operations/receipts', data),
  // Add more endpoints
};

export default api;
```

### Step 2: Use React Query for Data Fetching
Update pages to use React Query:

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '@/services/api';

// In your component
const { data: products, isLoading } = useQuery({
  queryKey: ['products'],
  queryFn: productsApi.getAll,
});

const queryClient = useQueryClient();
const createProduct = useMutation({
  mutationFn: productsApi.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
  },
});
```

## 5. Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
```

### Backend (.env)
```
MONGODB_URI=your_mongodb_connection_string
FIREBASE_CREDENTIALS_PATH=path/to/firebase-admin-credentials.json
PORT=5000
```

## 6. Deployment Considerations

### Frontend
- Deploy to Vercel, Netlify, or similar
- Update CORS settings in Flask to allow your domain

### Backend
- Deploy to Heroku, Railway, or similar
- Set environment variables in deployment platform
- Use production MongoDB connection string

## Testing the Integration

1. Start Flask backend: `python app.py`
2. Start React frontend: `npm run dev`
3. Test authentication flow
4. Test CRUD operations for products
5. Test operations (receipts, deliveries, transfers)

## Security Best Practices

1. **Never commit credentials** - Use environment variables
2. **Implement rate limiting** on API endpoints
3. **Validate all inputs** on both frontend and backend
4. **Use HTTPS** in production
5. **Implement proper RBAC** - Check user roles before operations
6. **Sanitize MongoDB queries** to prevent injection attacks
7. **Use Firebase Admin SDK** on backend for token verification

## Support

For issues or questions about the integration, refer to:
- [Firebase Documentation](https://firebase.google.com/docs)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Flask Documentation](https://flask.palletsprojects.com/)

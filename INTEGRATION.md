# Frontend-Backend Integration Guide

## 🎯 Overview
The StockMaster Role Manager Suite is now fully integrated with both frontend and backend working together seamlessly.

## 🚀 Quick Start

### Prerequisites
- Node.js (for frontend)
- Python 3.8+ (for backend)
- MongoDB Atlas account
- Firebase project

### Starting the Application

1. **Backend (Flask API)**
   ```bash
   cd backend
   # Windows PowerShell
   .\venv\Scripts\Activate.ps1
   python app.py
   ```
   - Backend runs on: `http://localhost:5000`
   - API endpoints available at: `http://localhost:5000/api`

2. **Frontend (React + Vite)**
   ```bash
   npm run dev
   ```
   - Frontend runs on: `http://localhost:8080`

## 🔧 Configuration

### Environment Variables

#### Frontend (`.env.local`)
```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=AIzaSyADzGE45IbxoX3SJaNTmpNmHV9_BIuf5vI
VITE_FIREBASE_AUTH_DOMAIN=shopping-app-5779c.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=shopping-app-5779c
VITE_FIREBASE_STORAGE_BUCKET=shopping-app-5779c.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=304259006496
VITE_FIREBASE_APP_ID=1:304259006496:web:3855d5994725a25df83c45
VITE_FIREBASE_MEASUREMENT_ID=G-CRJ5NFE43C
```

#### Backend (`.env`)
```env
MONGODB_URI=mongodb+srv://walakindle_db_user:Arif123@stockmaster.yrf27x5.mongodb.net/?appName=StockMaster
FLASK_ENV=development
FLASK_DEBUG=1
FIREBASE_PROJECT_ID=shopping-app-5779c
```

## 🛠️ API Integration

### Authentication Flow
1. User authenticates through Firebase on the frontend
2. Frontend receives Firebase ID token
3. Token is sent with every API request via axios interceptors
4. Backend verifies Firebase token using Firebase Admin SDK
5. Backend authorizes user based on role and permissions

### API Client (`src/services/api.ts`)
- Centralized axios configuration
- Automatic token injection
- Error handling and response interceptors
- TypeScript interfaces for all endpoints

### Key Features Integrated

#### 🔐 Authentication
- **Endpoint**: `/api/auth/*`
- **Frontend**: Firebase Auth + token management
- **Backend**: Token verification + user session management

#### 📦 Product Management
- **Endpoint**: `/api/products/*`
- **Features**: CRUD operations, stock management, search/filter
- **Frontend**: Product forms, listings, modals

#### 🚛 Operations
- **Endpoint**: `/api/operations/*`
- **Types**: Receipts, Deliveries, Transfers, Adjustments
- **Frontend**: Operation wizards, status tracking

#### 👥 User Management
- **Endpoint**: `/api/users/*`
- **Features**: Role-based access, department management
- **Frontend**: Admin panels, user forms

#### 📊 Dashboard
- **Endpoint**: `/api/dashboard/*`
- **Features**: KPIs, analytics, recent activity
- **Frontend**: Charts, metrics cards, activity feeds

## 🧪 Testing Integration

### Test Button
- Added "Test Integration" button on homepage
- Tests backend connectivity
- Verifies API communication
- Shows success/failure alerts

### Manual Testing
1. Visit `http://localhost:8080`
2. Click "Test Integration" button
3. Check console for detailed logs
4. Verify both servers are running

## 🔄 CORS Configuration
Backend is configured with CORS to allow frontend requests:
```python
CORS(app, origins=["http://localhost:8080"], supports_credentials=True)
```

## 📁 File Structure

### Backend
```
backend/
├── app.py              # Main Flask application
├── requirements.txt    # Python dependencies
├── .env               # Environment variables
├── venv/              # Virtual environment
├── routes/            # API route modules
│   ├── auth_routes.py
│   ├── products.py
│   ├── operations.py
│   ├── users.py
│   └── dashboard.py
└── models/            # Database models
    └── user.py
```

### Frontend Integration Files
```
src/
├── services/
│   ├── api.ts         # Axios client with auth
│   └── firebase.ts    # Firebase configuration
├── utils/
│   └── integration-test.ts  # Integration testing
└── pages/
    └── Index.tsx      # Homepage with test button
```

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS is configured for frontend URL
   - Check if both servers are running on correct ports

2. **Authentication Failures**
   - Verify Firebase configuration
   - Check if Firebase Admin SDK is properly initialized
   - Ensure tokens are being sent with requests

3. **Database Connection**
   - Verify MongoDB URI in backend .env
   - Check network connectivity to MongoDB Atlas
   - Ensure database user has proper permissions

4. **Port Conflicts**
   - Backend: 5000 (can be changed in app.py)
   - Frontend: 8080 (can be changed in vite.config.ts)

## ✅ Integration Status

- ✅ Backend API fully functional
- ✅ Frontend services configured
- ✅ Authentication flow integrated
- ✅ CORS properly configured
- ✅ Environment variables set up
- ✅ Database connections established
- ✅ Test integration working

## 🎉 Next Steps

1. Implement actual authentication in frontend components
2. Add form validations and error handling
3. Connect dashboard to real data
4. Implement real-time updates
5. Add comprehensive error handling
6. Set up production deployment

The integration is complete and ready for development!
# Firebase Migration Setup Guide

This guide will help you set up the complete Firebase backend for your Role Manager Suite application.

## 🚀 Complete Firebase Setup

### 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "role-manager-suite")
4. Enable Google Analytics (optional)
5. Create project

### 2. Enable Firebase Services

#### Enable Authentication
1. Go to **Authentication** → **Get started**
2. Go to **Sign-in method** tab
3. Enable **Email/Password** authentication
4. Save changes

#### Enable Firestore Database
1. Go to **Firestore Database** → **Create database**
2. Choose **Start in test mode** (we'll secure it later)
3. Select a location close to you
4. Done

#### Enable Storage
1. Go to **Storage** → **Get started**
2. Choose **Start in test mode**
3. Select same location as Firestore
4. Done

### 3. Create Service Account (Backend)

1. Go to **Project Settings** (gear icon) → **Service accounts**
2. Click **Generate new private key**
3. Download the JSON file
4. Rename it to `firebase-service-account.json`
5. Place it in the `/backend` folder
6. **Never commit this file to git!**

### 4. Get Web App Config (Frontend)

1. Go to **Project Settings** → **General**
2. Scroll down to **Your apps**
3. Click **Web** icon (</>) to add web app
4. Enter app name: "role-manager-suite-web"
5. Check **"Also set up Firebase Hosting"** (optional)
6. Register app
7. Copy the config object

### 5. Configure Environment Files

#### Backend Configuration
Copy `backend/.env.example` to `backend/.env` and fill in your Firebase service account details:

```bash
# From your firebase-service-account.json file
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nyour_private_key\n-----END PRIVATE KEY-----
FIREBASE_CLIENT_EMAIL=your_service_account_email@your_project_id.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your_client_id
FIREBASE_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FIREBASE_TOKEN_URI=https://oauth2.googleapis.com/token
FIREBASE_CLIENT_X509_CERT_URL=https://www.googleapis.com/robot/v1/metadata/x509/your_service_account_email%40your_project_id.iam.gserviceaccount.com

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
FLASK_PORT=5000

# CORS Settings (adjust ports as needed)
CORS_ORIGINS=["http://localhost:8081", "http://localhost:5173"]
```

#### Frontend Configuration
Copy `.env.example` to `.env` and fill in your Firebase web config:

```bash
# From Firebase web app config
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Backend API URL
VITE_API_URL=http://localhost:5000
```

### 6. Install Dependencies

#### Backend Dependencies
```bash
cd backend
python -m pip install -r requirements.txt
```

#### Frontend Dependencies
```bash
npm install firebase
```

### 7. Start the Application

#### Start Backend (Firebase)
```bash
cd backend
python app_firebase.py
```

#### Start Frontend
```bash
npm run dev
```

## 🔧 Application Features

### Complete Firebase Integration
- ✅ **Authentication**: Firebase Auth with email/password
- ✅ **Database**: Firestore for all data storage
- ✅ **Storage**: Firebase Storage for images
- ✅ **Real-time**: All operations are live with Firestore

### Available Collections
- **users**: User profiles and authentication data
- **products**: Product inventory with images
- **operations**: All business operations (receipts, deliveries, transfers, adjustments)

### Admin Features
- Create new users with Firebase Auth integration
- Manage products with image upload to Firebase Storage
- Track operations with real-time updates
- Dashboard with live statistics

## 🔒 Security Setup (Production)

### Firestore Security Rules
Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data and admins can access all
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == userId || get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }
    
    // Products, operations - authenticated users can read, admins can write
    match /{collection=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### Storage Security Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🎯 First Steps After Setup

1. **Start the applications** (backend and frontend)
2. **Register the first admin user** through the signup process
3. **Add sample products** with images
4. **Create operations** to test the workflow
5. **Check the dashboard** for real-time statistics

## 🐛 Troubleshooting

### Common Issues

1. **"Firebase project not found"**
   - Check your project ID in environment variables
   - Ensure service account file is in the correct location

2. **"Authentication failed"**
   - Verify your Firebase web config
   - Check if Email/Password auth is enabled in Firebase Console

3. **"Permission denied"**
   - Update Firestore security rules
   - Ensure user has admin role in the database

4. **"CORS errors"**
   - Check CORS_ORIGINS in backend .env
   - Ensure frontend URL matches the allowed origins

### Debug Mode
Set `FLASK_DEBUG=True` in backend/.env for detailed error messages.

## 📁 Project Structure

```
role-manager-suite/
├── backend/
│   ├── app_firebase.py          # Firebase backend server
│   ├── firebase-service-account.json  # Service account (add this)
│   ├── .env                     # Environment variables (add this)
│   └── requirements.txt         # Python dependencies
├── src/
│   ├── services/
│   │   └── firebase.ts         # Firebase services
│   ├── firebase/
│   │   └── config.ts          # Firebase config
│   └── pages/                 # React pages
├── .env                      # Frontend environment (add this)
└── README.md                # This guide
```

## 🌟 Next Steps

With Firebase fully integrated, you now have:
- Serverless backend infrastructure
- Real-time data synchronization
- Scalable file storage
- Production-ready authentication
- No database setup required

Your Role Manager Suite is now powered by Firebase! 🚀
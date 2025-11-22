# StockMaster Inventory Management System

## 📋 Project Overview

StockMaster is a comprehensive inventory management system built with modern web technologies. It provides real-time inventory tracking, role-based user management, operations management, and detailed reporting capabilities with PDF export functionality.

## 🚀 Features

### Core Functionality
- **Real-time Inventory Management** - Track products, stock levels, and inventory movements
- **Operations Management** - Handle receipts, deliveries, transfers, and adjustments
- **User Management** - Role-based access control with admin and user roles
- **Automatic History Tracking** - Complete audit trail of all inventory movements
- **PDF Report Generation** - Beautiful, professional reports for all data
- **Firebase Integration** - Real-time database with offline capabilities

### User Interface
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Modern UI Components** - Built with shadcn/ui components
- **Dark/Light Mode Support** - User preference-based theming
- **Real-time Updates** - Live data synchronization across all users

### Security & Authentication
- **Firebase Authentication** - Secure user login and registration
- **Role-Based Access Control (RBAC)** - Admin and user permission levels
- **Protected Routes** - Secure access to sensitive operations
- **Session Management** - Automatic logout and session handling

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development with excellent IDE support
- **Vite** - Ultra-fast development server and build tool
- **Tailwind CSS** - Utility-first CSS framework for rapid UI development
- **shadcn/ui** - Beautiful, accessible component library
- **Lucide React** - Modern icon library
- **Sonner** - Toast notification system

### Backend & Database
- **Firebase Firestore** - NoSQL cloud database with real-time synchronization
- **Firebase Authentication** - Complete authentication solution
- **Firebase Storage** - Cloud storage for file uploads
- **Firebase Security Rules** - Database-level security

### PDF Generation
- **jsPDF** - Client-side PDF generation
- **html2canvas** - HTML to canvas conversion for reports

### Development Tools
- **ESLint** - Code linting and quality assurance
- **PostCSS** - CSS processing and optimization
- **TypeScript Compiler** - Type checking and compilation
- **Vite Dev Server** - Hot module replacement (HMR)

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── Layout/         # Layout components (Navbar, Sidebar)
│   └── Dashboard/      # Dashboard-specific components
├── pages/              # Main application pages
│   ├── Auth.tsx        # Authentication page
│   ├── Dashboard.tsx   # Main dashboard
│   ├── Products.tsx    # Product management
│   ├── Operations.tsx  # Operations management
│   ├── History.tsx     # Movement history
│   ├── Admin.tsx       # Admin panel
│   └── Settings.tsx    # User settings
├── services/           # Business logic and API services
│   └── firebaseService.ts # Firebase integration
├── lib/                # Utility functions
│   ├── utils.ts        # General utilities
│   └── pdfExport.ts    # PDF generation utilities
├── hooks/              # Custom React hooks
└── firebase/           # Firebase configuration
    └── config.ts       # Firebase initialization
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- Firebase account and project

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd role-manager-suite-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Configuration**
   Create a `.env` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
   ```

4. **Firebase Setup**
   - Enable Authentication (Email/Password)
   - Create Firestore Database
   - Configure Security Rules
   - Set up user roles in Firestore

### Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🔐 Security Features

### Environment Variables
- All sensitive data stored in environment variables
- `.env` files excluded from version control
- Separate configurations for development/production

### Firebase Security
- Firestore Security Rules for data protection
- Role-based access control
- Authenticated user requirements
- Input validation and sanitization

### Application Security
- Protected routes with authentication checks
- Role verification for admin operations
- Secure logout and session management
- XSS protection through React's built-in sanitization

## 📊 Data Models

### User
```typescript
interface User {
  id: string;
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  created_at: Timestamp;
  updated_at: Timestamp;
}
```

### Product
```typescript
interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  unit: string;
  cost_price: number;
  selling_price: number;
  supplier: string;
  status: 'active' | 'inactive';
}
```

### Operations (Receipt, Delivery, Transfer, Adjustment)
```typescript
interface Receipt {
  id: string;
  receipt_id: string;
  supplier: string;
  items: OperationItem[];
  total_items: number;
  total_value: number;
  status: 'pending' | 'completed';
  notes: string;
  created_by: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}
```

## 🎯 Usage Guide

### Getting Started
1. **Registration/Login** - Create account or sign in
2. **Dashboard** - View key metrics and recent activities
3. **Products** - Add and manage inventory items
4. **Operations** - Handle receipts, deliveries, transfers
5. **History** - Track all inventory movements
6. **Reports** - Generate PDF reports for analysis

### Admin Functions
- User management and role assignment
- System configuration
- Advanced reporting
- Data export capabilities

### PDF Reports
- Product inventory reports
- Operations summaries
- Movement history
- Custom date range filtering




**Built with ❤️ using React, TypeScript, and Firebase**
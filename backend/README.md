# StockMaster Backend API

A Flask-based REST API for StockMaster inventory management system with MongoDB and Firebase integration.

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- MongoDB Atlas account (or local MongoDB)
- Firebase project (optional for development)

### Installation

1. **Clone and navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate virtual environment:**
   ```bash
   python -m venv venv
   venv\Scripts\activate  # Windows
   # or
   source venv/bin/activate  # Linux/Mac
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   - Copy `.env.example` to `.env`
   - Update MongoDB URI and Firebase credentials

5. **Initialize database (optional):**
   ```bash
   python init_db.py
   ```

6. **Run the application:**
   ```bash
   python app.py
   ```

The API will be available at `http://localhost:5000`

## 📖 API Documentation

### Authentication

All endpoints (except `/health`) require authentication in production. In development mode (`FLASK_ENV=development`), authentication is bypassed.

**Headers:**
```
Authorization: Bearer <firebase_jwt_token>
Content-Type: application/json
```

### Core Endpoints

#### Health Check
```http
GET /health
```

#### Authentication
```http
POST /api/auth/register      # Register new user
GET  /api/auth/profile       # Get user profile
PUT  /api/auth/update-profile # Update user profile
GET  /api/auth/users         # Get all users (admin only)
```

#### Products
```http
GET    /api/products              # Get all products
POST   /api/products              # Create product
GET    /api/products/{id}         # Get specific product
PUT    /api/products/{id}         # Update product
DELETE /api/products/{id}         # Delete product
GET    /api/products/categories   # Get all categories
GET    /api/products/locations    # Get all locations
```

#### Operations

**Receipts:**
```http
GET  /api/operations/receipts     # Get all receipts
POST /api/operations/receipts     # Create receipt
```

**Deliveries:**
```http
GET  /api/operations/deliveries   # Get all deliveries
POST /api/operations/deliveries   # Create delivery
```

**Transfers:**
```http
GET  /api/operations/transfers    # Get all transfers
POST /api/operations/transfers    # Create transfer
```

**Adjustments:**
```http
GET  /api/operations/adjustments  # Get all adjustments
POST /api/operations/adjustments  # Create adjustment
```

**Stock Movements:**
```http
GET  /api/operations/movements    # Get movement history
```

**Status Updates:**
```http
PUT  /api/operations/{type}/{id}/status  # Update operation status
```

#### Users
```http
GET    /api/users                 # Get all users (admin only)
POST   /api/users                 # Create user (admin only)
GET    /api/users/{id}            # Get specific user
PUT    /api/users/{id}            # Update user (admin only)
DELETE /api/users/{id}            # Deactivate user (admin only)
GET    /api/users/departments     # Get all departments
GET    /api/users/roles           # Get all roles
GET    /api/users/activity/{id}   # Get user activity
```

#### Dashboard
```http
GET /api/dashboard/stats          # Get dashboard statistics
GET /api/dashboard/chart-data     # Get chart data
GET /api/dashboard/low-stock      # Get low stock products
GET /api/dashboard/recent-operations  # Get recent operations
GET /api/dashboard/performance    # Get performance metrics
```

## 📊 Database Schema

### Collections

- **users** - User accounts and profiles
- **products** - Product catalog
- **receipts** - Incoming goods receipts
- **deliveries** - Outgoing delivery orders
- **transfers** - Internal location transfers
- **adjustments** - Inventory adjustments
- **stock_movements** - Complete ledger of stock movements

### Sample Product Object
```json
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
  "description": "High quality steel rods",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-20T10:30:00Z",
  "created_by": "admin-123"
}
```

## 🔧 Configuration

### Environment Variables

```bash
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/stockmaster

# Application
FLASK_ENV=development
PORT=5000
SECRET_KEY=your-secret-key

# Firebase (for production)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-auth-domain
```

### Development Mode

When `FLASK_ENV=development`:
- Authentication is bypassed
- Returns mock data for quick frontend development
- Enables debug mode and detailed error messages

### Production Mode

When `FLASK_ENV=production`:
- Full Firebase authentication required
- Connects to MongoDB for real data
- Enhanced security and error handling

## 🛠️ Development

### Project Structure
```
backend/
├── app.py              # Main Flask application
├── requirements.txt    # Python dependencies
├── .env               # Environment variables
├── init_db.py         # Database initialization
├── run.bat            # Windows run script
├── routes/            # API route handlers
│   ├── __init__.py
│   ├── auth_routes.py
│   ├── products.py
│   ├── operations.py
│   ├── users.py
│   └── dashboard.py
└── models/            # Database schemas
    ├── __init__.py
    └── schemas.py
```

### Adding New Features

1. **Create new route file** in `routes/`
2. **Define data models** in `models/schemas.py`
3. **Register blueprint** in `app.py`
4. **Add database indexes** if needed
5. **Update API documentation**

### Database Operations

```bash
# Initialize with sample data
python init_db.py

# Reset database (WARNING: Deletes all data)
python init_db.py reset
```

## 🔐 Security Features

- Firebase JWT token authentication
- Role-based access control (RBAC)
- Input validation and sanitization
- MongoDB injection prevention
- CORS protection
- Rate limiting (planned)

## 📈 Performance

- Database indexing for fast queries
- Connection pooling
- Efficient aggregation pipelines
- Pagination for large datasets
- Caching strategies (planned)

## 🚀 Deployment

### Heroku
```bash
# Install Heroku CLI and login
heroku create stockmaster-api
heroku config:set MONGO_URI="your-mongodb-uri"
heroku config:set FLASK_ENV=production
git push heroku main
```

### Railway
```bash
# Install Railway CLI and login
railway login
railway init
railway add
railway deploy
```

### Docker
```dockerfile
# Dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
```

## 🧪 Testing

```bash
# Install test dependencies
pip install pytest pytest-flask

# Run tests
pytest tests/

# Run with coverage
pytest --cov=app tests/
```

## 📝 API Response Format

### Success Response
```json
{
  "message": "Success message",
  "data": { /* response data */ },
  "timestamp": "2024-01-21T10:30:00Z"
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": "Detailed error information",
  "timestamp": "2024-01-21T10:30:00Z"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the API documentation
2. Review error logs in the console
3. Verify MongoDB connection
4. Check Firebase configuration
5. Create an issue on GitHub

---

**StockMaster Backend API v1.0.0**
Built with ❤️ using Flask, MongoDB, and Firebase
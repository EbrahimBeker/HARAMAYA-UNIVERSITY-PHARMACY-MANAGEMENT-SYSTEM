# Quick Start Guide - Haramaya Pharmacy Backend

## Prerequisites

- Node.js 18+ installed
- MySQL 8.0+ installed and running
- npm or yarn package manager

## Installation Steps

### 1. Navigate to API folder

```bash
cd api
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Server

```bash
npm run dev
```

**That's it!** The database is created automatically on first run.

The server will:
- ✅ Create the database
- ✅ Create all tables
- ✅ Insert default roles
- ✅ Create admin user

### 4. Verify Installation

Open your browser or use curl:

```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Haramaya Pharmacy API is running"
}
```
DB_USER=root
DB_PASSWORD=

JWT_SECRET=haramaya-pharmacy-secret-key-2024
JWT_EXPIRES_IN=24h
```

**Update if needed:**
- Change `DB_PASSWORD` if your MySQL has a password
- Change `DB_USER` if not using root
- Change `JWT_SECRET` for production

### 5. Start the Server

Make sure you're in the `api` folder:

```bash
cd api
```

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

### 6. Test the API

**Health Check:**
```bash
curl http://localhost:5000/health
```

**Login (Default Admin):**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

## Default Credentials

**Admin Account:**
- Username: `admin`
- Password: `admin123`

**⚠️ Important:** Change the admin password after first login!

## API Base URL

```
http://localhost:5000/api
```

## Available Endpoints

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Users (Admin Only)
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Medicines
- `GET /api/medicines` - List medicines
- `POST /api/medicines` - Create medicine
- `GET /api/medicines/search?query=` - Search
- `GET /api/medicines/:id` - Get medicine
- `PUT /api/medicines/:id` - Update medicine
- `DELETE /api/medicines/:id` - Delete medicine

### Categories
- `GET /api/medicine-categories` - List
- `POST /api/medicine-categories` - Create
- `PUT /api/medicine-categories/:id` - Update
- `DELETE /api/medicine-categories/:id` - Delete

### Types
- `GET /api/medicine-types` - List
- `POST /api/medicine-types` - Create
- `PUT /api/medicine-types/:id` - Update
- `DELETE /api/medicine-types/:id` - Delete

### Suppliers
- `GET /api/suppliers` - List
- `POST /api/suppliers` - Create
- `GET /api/suppliers/:id` - Get
- `PUT /api/suppliers/:id` - Update
- `DELETE /api/suppliers/:id` - Delete

## Testing with Postman

1. Import the API endpoints into Postman
2. Login to get the JWT token
3. Add token to Authorization header: `Bearer YOUR_TOKEN`
4. Test other endpoints

## Common Issues

### Database Connection Failed

**Error:** `Database connection failed`

**Solution:**
- Check if MySQL is running
- Verify database credentials in `.env`
- Ensure database `haramaya_pharmacy` exists

### Port Already in Use

**Error:** `Port 5000 already in use`

**Solution:**
- Change `PORT` in `.env` to another port (e.g., 5001)
- Or stop the process using port 5000

### Module Not Found

**Error:** `Cannot find module`

**Solution:**
```bash
rm -rf node_modules
npm install
```

## Next Steps

1. ✅ Test all API endpoints
2. ✅ Create additional user accounts
3. ✅ Add medicine categories and types
4. ✅ Register medicines
5. ✅ Add suppliers
6. ✅ Start managing inventory

## Support

For issues or questions:
- Check the main `README.md`
- Review the `database.sql` schema
- Contact: support@haramaya.edu

---

**Happy Coding! 🚀**

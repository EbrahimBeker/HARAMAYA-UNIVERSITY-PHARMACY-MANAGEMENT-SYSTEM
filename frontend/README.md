# Haramaya University Pharmacy Frontend

React frontend for the Haramaya University Pharmacy Management System.

## Tech Stack

- **React 18** - UI library
- **React Router DOM** - Routing
- **Axios** - HTTP client
- **React Toastify** - Notifications
- **Lucide React** - Icons
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Build tool

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Common/          # Reusable components
│   │   │   ├── Modal.jsx
│   │   │   ├── Loading.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   └── Layout/          # Layout components
│   │       ├── Layout.jsx
│   │       ├── Navbar.jsx
│   │       └── *.css
│   ├── context/
│   │   └── AuthContext.jsx  # Authentication context
│   ├── hooks/
│   │   ├── useApi.js        # API hook
│   │   └── useFetch.js      # Fetch hook
│   ├── pages/
│   │   ├── Login/           # Login page
│   │   ├── Dashboard/       # Dashboard page
│   │   └── Medicines/       # Medicines CRUD
│   ├── services/
│   │   └── api.js           # API service
│   ├── App.jsx              # Main app component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── .env                     # Environment variables
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Installation

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

The `.env` file is already configured:

```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Start Development Server

```bash
npm run dev
```

The app will run on: **http://localhost:3000**

## Features

### ✅ Implemented

- **Authentication**
  - Login/Logout
  - JWT token management
  - Protected routes
  - Role-based access control

- **Dashboard**
  - Statistics overview
  - Quick actions
  - Recent activity

- **Medicines Management**
  - List all medicines
  - Search medicines
  - Create medicine
  - Update medicine
  - Delete medicine
  - Category and type filtering

- **Layout**
  - Responsive navbar
  - User profile display
  - Role-based menu items

### 🔄 Coming Soon

- Users Management
- Suppliers Management
- Stock In/Out
- Prescriptions
- Sales Processing
- Reports

## Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## API Integration

The frontend connects to the backend API at `http://localhost:5000/api`.

Make sure the backend is running before starting the frontend.

## Default Login

- **Username:** `admin`
- **Password:** `admin123`

## Components

### Layout Components

- **Layout** - Main layout wrapper
- **Navbar** - Navigation bar with role-based menu

### Common Components

- **Modal** - Reusable modal component
- **Loading** - Loading spinner
- **ProtectedRoute** - Route protection with role checking

### Context

- **AuthContext** - Authentication state management

### Hooks

- **useApi** - API call hook with loading/error states
- **useFetch** - Data fetching hook

## Styling

- Tailwind CSS utility classes
- Custom component classes in `index.css`
- Responsive design
- Modern UI components
- Consistent color scheme

## Best Practices

- ✅ Component-based architecture
- ✅ Custom hooks for reusability
- ✅ Context API for state management
- ✅ Protected routes
- ✅ Role-based access control
- ✅ Error handling
- ✅ Loading states
- ✅ Toast notifications
- ✅ Form validation
- ✅ Responsive design

## Development

### Adding New Pages

1. Create page component in `src/pages/`
2. Add route in `App.jsx`
3. Add navigation link in `Navbar.jsx`
4. Add API methods in `src/services/api.js`

### Adding New Components

1. Create component in `src/components/`
2. Export from component file
3. Import where needed

## Deployment

```bash
# Build for production
npm run build

# Output will be in dist/ folder
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Proprietary - Haramaya University

---

**Version:** 1.0.0  
**Last Updated:** February 2024

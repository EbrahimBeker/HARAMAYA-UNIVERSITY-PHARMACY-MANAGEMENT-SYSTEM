import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/Common/ProtectedRoute';
import ErrorBoundary from './components/Common/ErrorBoundary';
import Layout from './components/Layout/Layout';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Medicines from './pages/Medicines/Medicines';
import Users from './pages/Users/Users';
import Suppliers from './pages/Suppliers/Suppliers';
import Reports from './pages/Reports/Reports';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <ToastContainer position="top-right" autoClose={3000} />
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={
                <ProtectedRoute roles={['System Administrator', 'Pharmacist', 'Data Clerk / Cashier', 'Physician', 'Ward Nurse', 'Drug Supplier']}>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="dashboard" element={
                <ProtectedRoute roles={['System Administrator', 'Pharmacist', 'Data Clerk / Cashier', 'Physician', 'Ward Nurse']}>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="medicines" element={<Medicines />} />
              <Route path="suppliers" element={<Suppliers />} />
              <Route path="users" element={
                <ProtectedRoute roles={['System Administrator']}>
                  <Users />
                </ProtectedRoute>
              } />
              <Route path="reports" element={<Reports />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

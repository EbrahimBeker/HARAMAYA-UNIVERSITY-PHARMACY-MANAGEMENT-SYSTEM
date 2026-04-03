import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/Common/ProtectedRoute";
import ErrorBoundary from "./components/Common/ErrorBoundary";
import Layout from "./components/Layout/Layout";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Medicines from "./pages/Medicines/Medicines";
import Users from "./pages/Users/Users";
import Suppliers from "./pages/Suppliers/Suppliers";
import Reports from "./pages/Reports/Reports";

// Role-based dashboards
import AdminDashboard from "./pages/Admin/AdminDashboard";
import DataClerkDashboard from "./pages/DataClerk/DataClerkDashboard";
import PhysicianDashboard from "./pages/Physician/PhysicianDashboard";
import PharmacistDashboard from "./pages/Pharmacist/PharmacistDashboard";
import SupplierDashboard from "./pages/Supplier/SupplierDashboard";

// Dashboard Router Component
const DashboardRouter = () => {
  const { user } = useAuth();

  if (!user?.roles?.length) {
    return <Dashboard />;
  }

  const primaryRole = user.roles[0];

  switch (primaryRole) {
    case "Admin":
      return <AdminDashboard />;
    case "Data Clerk":
      return <DataClerkDashboard />;
    case "Physician":
      return <PhysicianDashboard />;
    case "Pharmacist":
      return <PharmacistDashboard />;
    case "Drug Supplier":
      return <SupplierDashboard />;
    default:
      return <Dashboard />;
  }
};

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
              <Route
                index
                element={
                  <ProtectedRoute
                    roles={[
                      "Admin",
                      "Pharmacist",
                      "Data Clerk",
                      "Physician",
                      "Drug Supplier",
                    ]}
                  >
                    <DashboardRouter />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="admin/dashboard"
                element={
                  <ProtectedRoute roles={["Admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Data Clerk Routes */}
              <Route
                path="clerk/dashboard"
                element={
                  <ProtectedRoute roles={["Data Clerk"]}>
                    <DataClerkDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Physician Routes */}
              <Route
                path="physician/dashboard"
                element={
                  <ProtectedRoute roles={["Physician"]}>
                    <PhysicianDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Pharmacist Routes */}
              <Route
                path="pharmacist/dashboard"
                element={
                  <ProtectedRoute roles={["Pharmacist"]}>
                    <PharmacistDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Supplier Routes */}
              <Route
                path="supplier/dashboard"
                element={
                  <ProtectedRoute roles={["Drug Supplier"]}>
                    <SupplierDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Legacy routes - updated for new roles */}
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute
                    roles={[
                      "Admin",
                      "Pharmacist",
                      "Data Clerk",
                      "Physician",
                      "Drug Supplier",
                    ]}
                  >
                    <DashboardRouter />
                  </ProtectedRoute>
                }
              />
              <Route path="medicines" element={<Medicines />} />
              <Route path="suppliers" element={<Suppliers />} />
              <Route
                path="users"
                element={
                  <ProtectedRoute roles={["Admin"]}>
                    <Users />
                  </ProtectedRoute>
                }
              />
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

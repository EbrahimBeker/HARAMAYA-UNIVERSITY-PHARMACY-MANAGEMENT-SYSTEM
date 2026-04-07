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

// Pharmacist specific pages
import DrugDispensing from "./pages/Pharmacist/DrugDispensing";
import PharmacyReports from "./pages/Pharmacist/PharmacyReports";
import StockIn from "./pages/Pharmacist/StockIn";

// Data Clerk specific pages
import PatientRegistration from "./pages/DataClerk/PatientRegistration";
import PatientRecords from "./pages/DataClerk/PatientRecords";
import Billing from "./pages/DataClerk/Billing";
import PatientReports from "./pages/DataClerk/PatientReports";

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
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <ToastContainer
            position="top-right"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop={true}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
            toastClassName="!bg-white !text-gray-900 !rounded-xl !shadow-2xl !border !border-gray-200"
            bodyClassName="!text-sm !font-medium"
            progressClassName="!bg-gradient-to-r !from-blue-600 !to-purple-600"
          />
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
              <Route
                path="clerk/patients/new"
                element={
                  <ProtectedRoute roles={["Data Clerk"]}>
                    <PatientRegistration />
                  </ProtectedRoute>
                }
              />
              <Route
                path="clerk/patients"
                element={
                  <ProtectedRoute roles={["Data Clerk"]}>
                    <PatientRecords />
                  </ProtectedRoute>
                }
              />
              <Route
                path="clerk/billing"
                element={
                  <ProtectedRoute roles={["Data Clerk"]}>
                    <Billing />
                  </ProtectedRoute>
                }
              />
              <Route
                path="clerk/reports"
                element={
                  <ProtectedRoute roles={["Data Clerk"]}>
                    <PatientReports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="clerk/patients/:id"
                element={
                  <ProtectedRoute roles={["Data Clerk"]}>
                    <PatientRecords />
                  </ProtectedRoute>
                }
              />
              <Route
                path="clerk/patients/:id/edit"
                element={
                  <ProtectedRoute roles={["Data Clerk"]}>
                    <PatientRegistration />
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
              <Route
                path="pharmacist/dispensing"
                element={
                  <ProtectedRoute roles={["Pharmacist"]}>
                    <DrugDispensing />
                  </ProtectedRoute>
                }
              />
              <Route
                path="pharmacist/reports"
                element={
                  <ProtectedRoute roles={["Pharmacist"]}>
                    <PharmacyReports />
                  </ProtectedRoute>
                }
              />
              <Route
                path="pharmacist/stock-in"
                element={
                  <ProtectedRoute roles={["Pharmacist"]}>
                    <StockIn />
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
              <Route
                path="medicines"
                element={
                  <ProtectedRoute roles={["Pharmacist", "Physician"]}>
                    <Medicines />
                  </ProtectedRoute>
                }
              />
              <Route
                path="suppliers"
                element={
                  <ProtectedRoute roles={["Pharmacist"]}>
                    <Suppliers />
                  </ProtectedRoute>
                }
              />
              <Route
                path="users"
                element={
                  <ProtectedRoute roles={["Admin"]}>
                    <Users />
                  </ProtectedRoute>
                }
              />
              <Route
                path="reports"
                element={
                  <ProtectedRoute
                    roles={[
                      "Admin",
                      "Pharmacist",
                      "Data Clerk",
                      "Drug Supplier",
                    ]}
                  >
                    <Reports />
                  </ProtectedRoute>
                }
              />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

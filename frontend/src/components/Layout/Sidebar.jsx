import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";
import {
  Home,
  Pill,
  Users,
  Package,
  FileText,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Settings,
  User,
  Activity,
  ShoppingCart,
  ClipboardList,
  BarChart3,
  Truck,
  UserPlus,
  DollarSign,
  Stethoscope,
} from "lucide-react";

const Sidebar = () => {
  const { user, logout, hasAnyRole } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Get role-specific navigation
  const getRoleNavigation = () => {
    const primaryRole = user?.roles?.[0];

    const commonItems = [
      {
        label: "Dashboard",
        icon: Home,
        path: "/dashboard",
        roles: [
          "Admin",
          "Pharmacist",
          "Data Clerk",
          "Physician",
          "Drug Supplier",
        ],
      },
    ];

    const roleSpecificItems = {
      Admin: [
        { label: "Users", icon: Users, path: "/users" },
        { label: "Medicines", icon: Pill, path: "/medicines" },
        { label: "Suppliers", icon: Package, path: "/suppliers" },
        { label: "Reports", icon: FileText, path: "/reports" },
        { label: "Settings", icon: Settings, path: "/settings" },
      ],
      Pharmacist: [
        {
          label: "Drug Dispensing",
          icon: ShoppingCart,
          path: "/pharmacist/dispensing",
        },
        { label: "Stock In", icon: Package, path: "/pharmacist/stock-in" },
        { label: "Inventory", icon: Pill, path: "/medicines" },
        { label: "Suppliers", icon: Truck, path: "/suppliers" },
        { label: "Reports", icon: BarChart3, path: "/pharmacist/reports" },
      ],
      "Data Clerk": [
        {
          label: "Patient Registration",
          icon: UserPlus,
          path: "/clerk/patients/new",
        },
        {
          label: "Patient Records",
          icon: ClipboardList,
          path: "/clerk/patients",
        },
        { label: "Reports", icon: FileText, path: "/clerk/reports" },
      ],
      Physician: [
        { label: "Patients", icon: Users, path: "/clerk/patients" },
        {
          label: "Create Prescription",
          icon: FileText,
          path: "/physician/prescriptions/new",
        },
        { label: "Medicines", icon: Pill, path: "/medicines" },
        { label: "Diagnoses", icon: Stethoscope, path: "/diagnoses" },
        { label: "Reports", icon: FileText, path: "/reports" },
      ],
      "Drug Supplier": [
        { label: "Suppliers", icon: Package, path: "/suppliers" },
        { label: "Medicines", icon: Pill, path: "/medicines" },
        { label: "Reports", icon: FileText, path: "/reports" },
      ],
    };

    return [...commonItems, ...(roleSpecificItems[primaryRole] || [])];
  };

  const navigationItems = getRoleNavigation();

  const isActive = (path) => {
    // Exact match for the path
    if (location.pathname === path) return true;

    // For paths with sub-routes, check if it starts with the path
    // but exclude cases where a longer path might match a shorter one
    // e.g., /clerk/patients/new should not match /clerk/patients
    if (path === "/clerk/patients/new") {
      return location.pathname === "/clerk/patients/new";
    }
    if (path === "/clerk/patients") {
      return (
        location.pathname === "/clerk/patients" ||
        (location.pathname.startsWith("/clerk/patients/") &&
          !location.pathname.startsWith("/clerk/patients/new"))
      );
    }

    // Default behavior for other paths
    return location.pathname.startsWith(path + "/");
  };

  return (
    <div
      className={`${
        collapsed ? "w-20" : "w-64"
      } backdrop-blur-xl bg-white/70 border-r border-white/20 flex flex-col transition-all duration-300 fixed left-0 top-0 h-screen z-50 shadow-2xl shadow-blue-500/10`}
      style={{
        background:
          "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 249, 255, 0.9) 100%)",
      }}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-blue-100/50 backdrop-blur-sm">
        {!collapsed && (
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl group-hover:scale-110 transition-all shadow-lg shadow-blue-500/30">
              <Pill size={20} className="text-white" />
            </div>
            <div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Haramaya
              </span>
              <div className="text-xs text-gray-600 font-medium">Pharmacy</div>
            </div>
          </Link>
        )}
        {collapsed && (
          <div className="p-2.5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl mx-auto shadow-lg shadow-blue-500/30">
            <Pill size={20} className="text-white" />
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white backdrop-blur-xl border border-blue-200 rounded-full flex items-center justify-center hover:scale-110 hover:shadow-lg transition-all shadow-md text-blue-600"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* User Info */}
      <div
        className={`p-4 border-b border-blue-100/50 ${collapsed ? "px-2" : ""}`}
      >
        {!collapsed ? (
          <div className="flex items-center gap-3 bg-white/60 backdrop-blur-md rounded-xl p-3 shadow-sm border border-blue-100/50">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
              <User size={20} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold text-gray-900 truncate">
                {user?.first_name} {user?.last_name}
              </div>
              <div className="text-xs text-gray-600 truncate">
                {user?.roles?.[0]}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
            <User size={20} className="text-white" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent">
        <div className="space-y-1">
          {navigationItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${
                  active
                    ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30"
                    : "text-gray-700 hover:bg-white/60 hover:shadow-md backdrop-blur-sm"
                } ${collapsed ? "justify-center" : ""}`}
                title={collapsed ? item.label : ""}
              >
                <item.icon
                  size={20}
                  className={`flex-shrink-0 ${active ? "text-white" : "text-gray-500 group-hover:text-blue-600"}`}
                />
                {!collapsed && (
                  <span className="text-sm font-medium">{item.label}</span>
                )}
                {!collapsed && active && (
                  <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full shadow-lg"></div>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-blue-100/50 p-2 backdrop-blur-sm">
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50/60 hover:shadow-md transition-all backdrop-blur-sm ${collapsed ? "justify-center" : ""}`}
          title={collapsed ? "Logout" : ""}
        >
          <LogOut size={20} />
          {!collapsed && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>

      {/* Status Indicator */}
      <div
        className={`px-4 py-3 border-t border-blue-100/50 bg-white/40 backdrop-blur-sm ${collapsed ? "px-2" : ""}`}
      >
        {!collapsed ? (
          <div className="flex items-center gap-2 text-xs">
            <div className="relative">
              <div className="w-2 h-2 bg-green-500 rounded-full shadow-lg shadow-green-500/50"></div>
              <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
            </div>
            <span className="text-gray-600 font-medium">System Online</span>
          </div>
        ) : (
          <div className="relative mx-auto w-2 h-2">
            <div className="w-2 h-2 bg-green-500 rounded-full shadow-lg shadow-green-500/50"></div>
            <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;

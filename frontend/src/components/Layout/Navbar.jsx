import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useConnectionStatus } from "../../hooks/useConnectionStatus";
import {
  LogOut,
  User,
  Home,
  Pill,
  Users,
  Package,
  FileText,
  Wifi,
  WifiOff,
  Bell,
  Settings,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";

const Navbar = () => {
  const { user, logout, hasAnyRole } = useAuth();
  const { isConnected } = useConnectionStatus();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navigationItems = [
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
    {
      label: "Medicines",
      icon: Pill,
      path: "/medicines",
      roles: ["Pharmacist", "Physician"],
    },
    {
      label: "Drug Dispensing",
      icon: Package,
      path: "/pharmacist/dispensing",
      roles: ["Pharmacist"],
    },
    {
      label: "Suppliers",
      icon: Package,
      path: "/suppliers",
      roles: ["Pharmacist"],
    },
    {
      label: "Users",
      icon: Users,
      path: "/users",
      roles: ["Admin"],
    },
    {
      label: "Reports",
      icon: FileText,
      path: "/reports",
      roles: ["Admin", "Pharmacist", "Data Clerk", "Drug Supplier"],
    },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 text-gray-900 hover:text-blue-600 transition-colors group"
          >
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl group-hover:scale-110 transition-transform">
              <Pill size={20} className="text-white" />
            </div>
            <div>
              <span className="text-xl font-bold gradient-text">Haramaya</span>
              <div className="text-xs text-gray-500 font-medium">
                Pharmacy System
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navigationItems.map((item) => {
              if (!hasAnyRole(item.roles)) return null;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium"
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Connection Status */}
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${
                isConnected
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {isConnected ? <Wifi size={14} /> : <WifiOff size={14} />}
              <span>{isConnected ? "Online" : "Offline"}</span>
            </div>

            {/* Notifications */}
            <button className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-gray-50 transition-all duration-200 border border-gray-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <User size={16} className="text-white" />
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="text-sm font-semibold text-gray-900">
                      {user?.full_name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user?.roles?.[0]}
                    </div>
                  </div>
                </div>
                <ChevronDown size={16} className="text-gray-400" />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="text-sm font-semibold text-gray-900">
                      {user?.full_name}
                    </div>
                    <div className="text-xs text-gray-500">{user?.email}</div>
                    <div className="mt-1">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        {user?.roles?.[0]}
                      </span>
                    </div>
                  </div>

                  <button className="w-full flex items-center gap-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors">
                    <Settings size={16} />
                    <span className="text-sm">Settings</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    <span className="text-sm">Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200 bg-gray-50">
        <div className="flex overflow-x-auto py-2 px-4 gap-2">
          {navigationItems.map((item) => {
            if (!hasAnyRole(item.roles)) return null;

            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-white transition-all duration-200 whitespace-nowrap text-sm font-medium"
              >
                <item.icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

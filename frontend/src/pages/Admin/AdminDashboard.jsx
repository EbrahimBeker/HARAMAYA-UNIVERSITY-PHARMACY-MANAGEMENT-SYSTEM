import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { reportsAPI } from "../../services/api";
import {
  Pill,
  Users,
  Package,
  TrendingUp,
  Settings,
  FileText,
  Activity,
  AlertTriangle,
} from "lucide-react";
import MedicineManagement from "./MedicineManagement";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await reportsAPI.getDashboard();
      setStats(response.data);
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const adminModules = [
    {
      title: "Medicine Management",
      description: "Add, edit, and manage medicines",
      icon: Pill,
      action: () => setActiveTab("medicines"),
      gradient: "from-blue-500 to-cyan-500",
      iconBg: "bg-gradient-to-br from-blue-500 to-cyan-500",
    },
    {
      title: "User Management",
      description: "Manage system users and roles",
      icon: Users,
      action: () => setActiveTab("users"),
      gradient: "from-purple-500 to-pink-500",
      iconBg: "bg-gradient-to-br from-purple-500 to-pink-500",
    },
    {
      title: "Inventory Overview",
      description: "Monitor stock levels and alerts",
      icon: Package,
      action: () => setActiveTab("inventory"),
      gradient: "from-green-500 to-emerald-500",
      iconBg: "bg-gradient-to-br from-green-500 to-emerald-500",
    },
    {
      title: "System Reports",
      description: "View analytics and reports",
      icon: TrendingUp,
      action: () => navigate("/reports"),
      gradient: "from-orange-500 to-red-500",
      iconBg: "bg-gradient-to-br from-orange-500 to-red-500",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 opacity-20 animate-ping"></div>
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 animate-spin">
              <div className="absolute inset-2 rounded-full bg-white"></div>
            </div>
          </div>
          <p className="text-gray-600 font-semibold text-lg">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Complete system management and control
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl shadow-lg flex items-center gap-2">
                <Activity size={18} />
                <span className="font-semibold">System Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Cards with Neumorphism */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Patients */}
          <div className="group relative bg-white rounded-3xl p-6 shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.9)] hover:shadow-[12px_12px_24px_rgba(0,0,0,0.15),-12px_-12px_24px_rgba(255,255,255,0.95)] transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent rounded-3xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="text-white" size={24} />
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Total
                  </p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    {stats.total_patients || 0}
                  </p>
                </div>
              </div>
              <p className="text-sm font-bold text-gray-700">Patients</p>
              <p className="text-xs text-blue-600 font-medium mt-1">
                Registered in system
              </p>
            </div>
          </div>

          {/* Total Medicines */}
          <div className="group relative bg-white rounded-3xl p-6 shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.9)] hover:shadow-[12px_12px_24px_rgba(0,0,0,0.15),-12px_-12px_24px_rgba(255,255,255,0.95)] transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent rounded-3xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Pill className="text-white" size={24} />
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Total
                  </p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {stats.total_medicines || 0}
                  </p>
                </div>
              </div>
              <p className="text-sm font-bold text-gray-700">Medicines</p>
              <p className="text-xs text-green-600 font-medium mt-1">
                In database
              </p>
            </div>
          </div>

          {/* Pending Prescriptions */}
          <div className="group relative bg-white rounded-3xl p-6 shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.9)] hover:shadow-[12px_12px_24px_rgba(0,0,0,0.15),-12px_-12px_24px_rgba(255,255,255,0.95)] transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent rounded-3xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <FileText className="text-white" size={24} />
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Pending
                  </p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {stats.pending_prescriptions || 0}
                  </p>
                </div>
              </div>
              <p className="text-sm font-bold text-gray-700">Prescriptions</p>
              <p className="text-xs text-purple-600 font-medium mt-1">
                Awaiting dispatch
              </p>
            </div>
          </div>

          {/* Low Stock Alert */}
          <div className="group relative bg-white rounded-3xl p-6 shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.9)] hover:shadow-[12px_12px_24px_rgba(0,0,0,0.15),-12px_-12px_24px_rgba(255,255,255,0.95)] transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent rounded-3xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <AlertTriangle className="text-white" size={24} />
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Alert
                  </p>
                  <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                    {stats.low_stock_medicines || 0}
                  </p>
                </div>
              </div>
              <p className="text-sm font-bold text-gray-700">Low Stock</p>
              <p className="text-xs text-red-600 font-medium mt-1">
                Need attention
              </p>
            </div>
          </div>
        </div>

        {/* Admin Modules */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <div className="w-1.5 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {adminModules.map((module, index) => {
              const Icon = module.icon;
              return (
                <button
                  key={index}
                  onClick={module.action}
                  className="group relative bg-white rounded-3xl p-6 shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.9)] hover:shadow-[12px_12px_24px_rgba(0,0,0,0.15),-12px_-12px_24px_rgba(255,255,255,0.95)] transition-all duration-300 transform hover:scale-105 text-left"
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${module.gradient} opacity-5 rounded-3xl`}
                  ></div>
                  <div className="relative">
                    <div
                      className={`w-16 h-16 ${module.iconBg} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="text-white" size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 group-hover:bg-clip-text group-hover:text-transparent transition-all">
                      {module.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {module.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area Based on Active Tab */}
        {activeTab === "medicines" && <MedicineManagement />}
        {activeTab === "users" && (
          <div className="bg-white rounded-3xl p-8 shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.9)]">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              User Management
            </h3>
            <p className="text-gray-600">
              User management features coming soon...
            </p>
          </div>
        )}
        {activeTab === "inventory" && (
          <div className="bg-white rounded-3xl p-8 shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.9)]">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Inventory Overview
            </h3>
            <p className="text-gray-600">
              Inventory overview features coming soon...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

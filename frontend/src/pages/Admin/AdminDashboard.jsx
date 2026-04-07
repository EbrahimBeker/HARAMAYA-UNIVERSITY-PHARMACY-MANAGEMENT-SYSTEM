import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { reportsAPI } from "../../services/api";

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);

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
      title: "User Management",
      description: "Manage system users and roles",
      icon: "👥",
      link: "/users",
      color: "bg-blue-500",
    },
    {
      title: "System Reports",
      description: "View all system reports and analytics",
      icon: "📊",
      link: "/reports",
      color: "bg-green-500",
    },
    {
      title: "System Settings",
      description: "Configure system settings and preferences",
      icon: "⚙️",
      link: "#",
      color: "bg-purple-500",
    },
    {
      title: "Audit Logs",
      description: "View system activity and audit trails",
      icon: "📋",
      link: "#",
      color: "bg-orange-500",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div
              className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-600 rounded-full animate-spin mx-auto"
              style={{
                animationDirection: "reverse",
                animationDuration: "1.5s",
              }}
            ></div>
          </div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 text-lg">
            Complete system oversight and management control
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-transparent opacity-5 group-hover:opacity-10 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg">
                  <span className="text-3xl">👥</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    Total
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.total_patients || 0}
                  </p>
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-700">
                Total Patients
              </p>
              <p className="text-xs text-blue-600 font-medium mt-1">
                Registered in system
              </p>
            </div>
          </div>

          <div className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-transparent opacity-5 group-hover:opacity-10 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg">
                  <span className="text-3xl">💊</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    Total
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.total_medicines || 0}
                  </p>
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-700">
                Total Medicines
              </p>
              <p className="text-xs text-green-600 font-medium mt-1">
                In inventory
              </p>
            </div>
          </div>

          <div className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-transparent opacity-5 group-hover:opacity-10 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-lg">
                  <span className="text-3xl">📋</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    Pending
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.pending_prescriptions || 0}
                  </p>
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-700">
                Prescriptions
              </p>
              <p className="text-xs text-amber-600 font-medium mt-1">
                Awaiting dispatch
              </p>
            </div>
          </div>

          <div className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-transparent opacity-5 group-hover:opacity-10 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg">
                  <span className="text-3xl">⚠️</span>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    Alert
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.low_stock_medicines || 0}
                  </p>
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-700">
                Low Stock Items
              </p>
              <p className="text-xs text-red-600 font-medium mt-1">
                Need attention
              </p>
            </div>
          </div>
        </div>

        {/* Admin Modules */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <div className="w-1.5 h-8 bg-gradient-to-b from-purple-600 to-blue-600 rounded-full"></div>
            Administration Tools
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {adminModules.map((module, index) => (
              <Link
                key={index}
                to={module.link}
                className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-blue-300 transform hover:scale-105 overflow-hidden"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${module.color.replace("bg-", "from-")} to-transparent opacity-5 group-hover:opacity-10 transition-opacity`}
                ></div>

                <div className="relative z-10">
                  <div
                    className={`w-16 h-16 ${module.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}
                  >
                    <span className="text-3xl">{module.icon}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {module.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {module.description}
                  </p>

                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Today's Activity</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-lg">📝</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    New Prescriptions
                  </span>
                </div>
                <span className="text-2xl font-bold text-blue-600">
                  {stats.todays_prescriptions || 0}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                    <span className="text-white text-lg">💰</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    Monthly Revenue
                  </span>
                </div>
                <span className="text-2xl font-bold text-green-600">
                  {stats.monthly_revenue || 0} ETB
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">System Status</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <div className="relative mr-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-4 h-4 bg-green-500 rounded-full animate-ping"></div>
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  Database: Online
                </span>
              </div>

              <div className="flex items-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
                <div className="relative mr-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 w-4 h-4 bg-green-500 rounded-full animate-ping"></div>
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  API: Operational
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

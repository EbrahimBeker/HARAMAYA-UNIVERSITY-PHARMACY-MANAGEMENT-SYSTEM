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
    <div className="p-6 space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-3">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 text-lg">
          System administration and management
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="dashboard-card hover-lift">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg">
              <span className="text-3xl text-white">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Total Patients
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.total_patients || 0}
              </p>
              <p className="text-xs text-blue-600 font-medium">System wide</p>
            </div>
          </div>
        </div>

        <div className="dashboard-card hover-lift">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-lg">
              <span className="text-3xl text-white">💊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Total Medicines
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.total_medicines || 0}
              </p>
              <p className="text-xs text-green-600 font-medium">In inventory</p>
            </div>
          </div>
        </div>

        <div className="dashboard-card hover-lift">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl shadow-lg">
              <span className="text-3xl text-white">📋</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Pending Prescriptions
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.pending_prescriptions || 0}
              </p>
              <p className="text-xs text-yellow-600 font-medium">
                Awaiting dispatch
              </p>
            </div>
          </div>
        </div>

        <div className="dashboard-card hover-lift">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl shadow-lg">
              <span className="text-3xl text-white">⚠️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Low Stock Items
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.low_stock_medicines || 0}
              </p>
              <p className="text-xs text-red-600 font-medium">Need attention</p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Modules */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span className="w-1 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></span>
          Administration Tools
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminModules.map((module, index) => (
            <Link
              key={index}
              to={module.link}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-blue-200 transform hover:scale-105 overflow-hidden"
            >
              {/* Background Gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${module.color.replace("bg-", "from-")} to-transparent opacity-5 group-hover:opacity-10 transition-opacity`}
              ></div>

              <div className="relative z-10">
                <div
                  className={`w-14 h-14 ${module.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <span className="text-2xl text-white">{module.icon}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {module.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {module.description}
                </p>

                {/* Arrow indicator */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">→</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* System Overview */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></span>
            System Overview
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                Today's Activity
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                  <span className="text-sm text-gray-700 font-medium">
                    New Prescriptions
                  </span>
                  <span className="text-sm font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-lg">
                    {stats.todays_prescriptions || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                  <span className="text-sm text-gray-700 font-medium">
                    Monthly Revenue
                  </span>
                  <span className="text-sm font-bold text-green-600 bg-green-100 px-2 py-1 rounded-lg">
                    {stats.monthly_revenue || 0} ETB
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">
                System Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center p-3 bg-green-50 rounded-xl">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                  <span className="text-sm text-gray-700 font-medium">
                    Database: Online
                  </span>
                </div>
                <div className="flex items-center p-3 bg-green-50 rounded-xl">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                  <span className="text-sm text-gray-700 font-medium">
                    API: Operational
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

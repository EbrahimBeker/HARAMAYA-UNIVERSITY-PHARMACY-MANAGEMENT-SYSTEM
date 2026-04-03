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
      link: "/admin/reports",
      color: "bg-green-500",
    },
    {
      title: "Backup & Restore",
      description: "Manage system backups and data recovery",
      icon: "💾",
      link: "/admin/backup",
      color: "bg-purple-500",
    },
    {
      title: "Medicine Management",
      description: "Manage medicines, categories, and types",
      icon: "💊",
      link: "/admin/medicines",
      color: "bg-red-500",
    },
    {
      title: "Supplier Management",
      description: "Manage drug suppliers and purchase orders",
      icon: "🏢",
      link: "/admin/suppliers",
      color: "bg-yellow-500",
    },
    {
      title: "Audit Logs",
      description: "View system activity and audit trails",
      icon: "🔍",
      link: "/admin/audit",
      color: "bg-indigo-500",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">System administration and management</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Patients
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.total_patients || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">💊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Medicines
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.total_medicines || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">📋</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Pending Prescriptions
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.pending_prescriptions || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Low Stock Items
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.low_stock_medicines || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminModules.map((module, index) => (
          <Link
            key={index}
            to={module.link}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 block"
          >
            <div
              className={`w-12 h-12 ${module.color} rounded-lg flex items-center justify-center mb-4`}
            >
              <span className="text-2xl">{module.icon}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {module.title}
            </h3>
            <p className="text-gray-600 text-sm">{module.description}</p>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            System Overview
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Today's Activity
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    New Prescriptions
                  </span>
                  <span className="text-sm font-medium">
                    {stats.todays_prescriptions || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Monthly Revenue</span>
                  <span className="text-sm font-medium">
                    ${stats.monthly_revenue || 0}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                System Status
              </h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">
                    Database: Online
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">
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

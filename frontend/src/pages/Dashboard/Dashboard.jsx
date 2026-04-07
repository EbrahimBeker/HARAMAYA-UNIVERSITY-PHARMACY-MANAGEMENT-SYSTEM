import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { medicinesAPI, suppliersAPI, usersAPI } from "../../services/api";
import {
  Pill,
  Users,
  Package,
  TrendingUp,
  AlertTriangle,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import Loading from "../../components/Common/Loading";

const Dashboard = () => {
  const { user, hasAnyRole } = useAuth();
  const [stats, setStats] = useState({
    totalMedicines: 0,
    lowStockItems: 0,
    totalSuppliers: 0,
    activeUsers: 0,
    totalStock: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const promises = [
        medicinesAPI.getAll({ limit: 1000 }),
        suppliersAPI.getAll({ limit: 1000 }),
      ];

      if (hasAnyRole(["Admin"])) {
        promises.push(usersAPI.getAll({ limit: 1000 }));
      }

      const responses = await Promise.all(promises);

      const medicines = responses[0].data.data || [];
      const suppliers = responses[1].data.data || [];
      const users = responses[2]?.data.data || [];

      // Calculate statistics
      const lowStockCount = medicines.filter(
        (med) => (med.quantity_available || 0) <= (med.reorder_level || 10),
      ).length;

      const totalStock = medicines.reduce(
        (sum, med) => sum + (med.quantity_available || 0),
        0,
      );

      setStats({
        totalMedicines: medicines.length,
        lowStockItems: lowStockCount,
        totalSuppliers: suppliers.filter((s) => s.is_active).length,
        activeUsers: users.filter((u) => u.is_active).length,
        totalStock,
      });

      // Generate recent activity
      const activities = [];
      if (medicines.length > 0) {
        activities.push({
          id: 1,
          message: `${medicines.length} medicines in inventory with ${totalStock} total units`,
          time: "Current",
          type: "info",
        });
      }
      if (lowStockCount > 0) {
        activities.push({
          id: 2,
          message: `${lowStockCount} medicines need restocking`,
          time: "Alert",
          type: "warning",
        });
      }
      setRecentActivity(activities);
    } catch (error) {
      toast.error("Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const dashboardStats = [
    {
      title: "Total Medicines",
      value: stats.totalMedicines.toString(),
      icon: Pill,
      color: "bg-blue-500",
      link: "/medicines",
      show: true,
    },
    {
      title: "Total Stock Units",
      value: stats.totalStock.toString(),
      icon: Package,
      color: "bg-purple-500",
      link: "/medicines",
      show: true,
    },
    {
      title: "Low Stock Items",
      value: stats.lowStockItems.toString(),
      icon: TrendingUp,
      color: "bg-red-500",
      link: "/medicines",
      show: true,
    },
    {
      title: "Active Suppliers",
      value: stats.totalSuppliers.toString(),
      icon: Package,
      color: "bg-green-500",
      link: "/suppliers",
      show: hasAnyRole(["Admin", "Pharmacist"]),
    },
    {
      title: "Active Users",
      value: stats.activeUsers.toString(),
      icon: Users,
      color: "bg-indigo-500",
      link: "/users",
      show: hasAnyRole(["Admin"]),
    },
  ].filter((stat) => stat.show);

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Welcome back, {user?.first_name}!
            </h1>
            <p className="text-gray-600 mt-2 text-lg">
              Here's what's happening with your pharmacy today
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-lg border border-gray-100">
            <div className="relative">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">System Status</p>
              <p className="text-sm font-bold text-green-600">
                All Systems Operational
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardStats.map((stat, index) => (
            <div
              key={index}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 overflow-hidden"
            >
              {/* Background gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${stat.color.replace("bg-", "from-")} to-transparent opacity-5 group-hover:opacity-10 transition-opacity`}
              ></div>

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`${stat.color} bg-opacity-10 p-3 rounded-xl group-hover:scale-110 transition-transform`}
                  >
                    <stat.icon
                      size={24}
                      className={stat.color.replace("bg-", "text-")}
                    />
                  </div>
                  {stat.link && (
                    <a
                      href={stat.link}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ArrowUpRight
                        size={20}
                        className="text-gray-400 hover:text-blue-600"
                      />
                    </a>
                  )}
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {stat.title}
                  </p>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                      <TrendingUp size={12} />
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Low Stock Alert */}
        {stats.lowStockItems > 0 && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="bg-amber-100 p-3 rounded-xl">
                <AlertTriangle className="text-amber-600" size={28} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-amber-900 mb-2">
                  Low Stock Alert
                </h3>
                <p className="text-amber-800 mb-3">
                  {stats.lowStockItems} medicine
                  {stats.lowStockItems > 1 ? "s" : ""} need immediate restocking
                  to maintain inventory levels.
                </p>
                <a
                  href="/medicines"
                  className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  View Details
                  <ArrowUpRight size={16} />
                </a>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity size={24} />
                Recent Activity
              </h3>
            </div>
            <div className="p-6">
              {recentActivity.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock size={32} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">
                    No recent activity
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Activity will appear here as you use the system
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200"
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          activity.type === "warning"
                            ? "bg-amber-100"
                            : "bg-blue-100"
                        }`}
                      >
                        {activity.type === "warning" ? (
                          <AlertTriangle size={20} className="text-amber-600" />
                        ) : (
                          <CheckCircle size={20} className="text-blue-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                          <Clock size={12} />
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white">Quick Actions</h3>
            </div>
            <div className="p-6 space-y-3">
              <a
                href="/medicines"
                className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-semibold text-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Manage Medicines
              </a>
              <a
                href="/suppliers"
                className="block w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-xl font-semibold text-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Manage Suppliers
              </a>
              {hasAnyRole(["Admin"]) && (
                <a
                  href="/users"
                  className="block w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl font-semibold text-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Manage Users
                </a>
              )}
              <a
                href="/reports"
                className="block w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white px-6 py-3 rounded-xl font-semibold text-center transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                View Reports
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

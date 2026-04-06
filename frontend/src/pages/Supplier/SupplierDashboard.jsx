import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { reportsAPI } from "../../services/api";

const SupplierDashboard = () => {
  const [stats, setStats] = useState({});
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Note: Purchase orders API might not exist yet, so we'll just load dashboard stats
      const statsResponse = await reportsAPI.getDashboard();
      setStats(statsResponse.data);
      // setPurchaseOrders will remain empty until purchase orders API is implemented
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const supplierModules = [
    {
      title: "Supplier Management",
      description: "View and manage supplier information",
      icon: "🏢",
      link: "/suppliers",
      color: "bg-blue-500",
    },
    {
      title: "Medicine Catalog",
      description: "Browse available medicines",
      icon: "💊",
      link: "/medicines",
      color: "bg-green-500",
    },
    {
      title: "Supply Reports",
      description: "View supplier performance reports",
      icon: "📊",
      link: "/reports",
      color: "bg-orange-500",
    },
    {
      title: "System Dashboard",
      description: "Access main system dashboard",
      icon: "📋",
      link: "/dashboard",
      color: "bg-purple-500",
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
          Supplier Dashboard
        </h1>
        <p className="text-gray-600 text-lg">
          Purchase order management and delivery tracking
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="dashboard-card hover-lift">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg">
              <span className="text-3xl text-white">📋</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Total Orders
              </p>
              <p className="text-3xl font-bold text-gray-900">0</p>
              <p className="text-xs text-blue-600 font-medium">All time</p>
            </div>
          </div>
        </div>

        <div className="dashboard-card hover-lift">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl shadow-lg">
              <span className="text-3xl text-white">⏳</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Pending Orders
              </p>
              <p className="text-3xl font-bold text-gray-900">0</p>
              <p className="text-xs text-yellow-600 font-medium">
                Awaiting confirmation
              </p>
            </div>
          </div>
        </div>

        <div className="dashboard-card hover-lift">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-lg">
              <span className="text-3xl text-white">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Delivered Orders
              </p>
              <p className="text-3xl font-bold text-gray-900">0</p>
              <p className="text-xs text-green-600 font-medium">Completed</p>
            </div>
          </div>
        </div>

        <div className="dashboard-card hover-lift">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl shadow-lg">
              <span className="text-3xl text-white">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Monthly Revenue
              </p>
              <p className="text-3xl font-bold text-gray-900">0 ETB</p>
              <p className="text-xs text-purple-600 font-medium">This month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span className="w-1 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></span>
          Supplier Tools
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {supplierModules.map((module, index) => (
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

      {/* Recent Purchase Orders */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></span>
              Recent Purchase Orders
            </h2>
            <Link
              to="/suppliers"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold text-sm bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-all duration-200"
            >
              View All
              <span>→</span>
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Order Date</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Expected Delivery</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {purchaseOrders.length > 0 ? (
                purchaseOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    <td>
                      <span className="font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                        {order.order_number}
                      </span>
                    </td>
                    <td className="text-gray-500">
                      {new Date(order.order_date).toLocaleDateString()}
                    </td>
                    <td className="font-semibold text-gray-900">
                      ${order.total_amount || 0}
                    </td>
                    <td>
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${
                          order.status === "Pending"
                            ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                            : order.status === "Confirmed"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : order.status === "Delivered"
                                ? "bg-green-50 text-green-700 border-green-200"
                                : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="text-gray-500">
                      {order.expected_delivery_date
                        ? new Date(
                            order.expected_delivery_date,
                          ).toLocaleDateString()
                        : "Not set"}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Link
                          to="/suppliers"
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-all duration-200"
                        >
                          View
                        </Link>
                        {order.status === "Pending" && (
                          <Link
                            to="/suppliers"
                            className="inline-flex items-center gap-1 text-green-600 hover:text-green-800 font-medium text-sm bg-green-50 hover:bg-green-100 px-3 py-1 rounded-lg transition-all duration-200"
                          >
                            Confirm
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl text-gray-400">📋</span>
                      </div>
                      <p className="text-gray-500 font-medium">
                        No purchase orders available
                      </p>
                      <Link to="/suppliers" className="btn btn-primary text-sm">
                        Browse Suppliers
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;

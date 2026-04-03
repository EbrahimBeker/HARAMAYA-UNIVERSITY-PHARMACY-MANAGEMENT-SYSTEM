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
      title: "Purchase Orders",
      description: "View and manage purchase orders",
      icon: "📋",
      link: "/supplier/orders",
      color: "bg-blue-500",
    },
    {
      title: "Confirm Availability",
      description: "Confirm medicine availability",
      icon: "✅",
      link: "/supplier/availability",
      color: "bg-green-500",
    },
    {
      title: "Update Order Status",
      description: "Update delivery and order status",
      icon: "🚚",
      link: "/supplier/status",
      color: "bg-purple-500",
    },
    {
      title: "Supplier Reports",
      description: "View supplier performance reports",
      icon: "📊",
      link: "/supplier/reports",
      color: "bg-orange-500",
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
          Supplier Dashboard
        </h1>
        <p className="text-gray-600">
          Purchase order management and delivery tracking
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">📋</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Orders</p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-2xl">⏳</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Pending Orders
              </p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Delivered Orders
              </p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Monthly Revenue
              </p>
              <p className="text-2xl font-semibold text-gray-900">$0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {supplierModules.map((module, index) => (
          <Link
            key={index}
            to={module.link}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 block"
          >
            <div
              className={`w-12 h-12 ${module.color} rounded-lg flex items-center justify-center mb-4`}
            >
              <span className="text-2xl text-white">{module.icon}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {module.title}
            </h3>
            <p className="text-gray-600 text-sm">{module.description}</p>
          </Link>
        ))}
      </div>

      {/* Recent Purchase Orders */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Purchase Orders
          </h2>
          <Link
            to="/supplier/orders"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expected Delivery
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {purchaseOrders.length > 0 ? (
                purchaseOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.order_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${order.total_amount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : order.status === "Confirmed"
                              ? "bg-blue-100 text-blue-800"
                              : order.status === "Delivered"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.expected_delivery_date
                        ? new Date(
                            order.expected_delivery_date,
                          ).toLocaleDateString()
                        : "Not set"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/supplier/orders/${order.id}`}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        View
                      </Link>
                      {order.status === "Pending" && (
                        <Link
                          to={`/supplier/orders/${order.id}/confirm`}
                          className="text-green-600 hover:text-green-900"
                        >
                          Confirm
                        </Link>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No purchase orders available
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

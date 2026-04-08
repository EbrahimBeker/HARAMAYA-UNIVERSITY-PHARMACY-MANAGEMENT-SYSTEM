import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { purchaseOrdersAPI, supplierCatalogAPI } from "../../services/api";
import {
  Package,
  ShoppingCart,
  CheckCircle,
  DollarSign,
  TrendingUp,
  Clock,
  ArrowRight,
  Building2,
} from "lucide-react";

const SupplierDashboard = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    confirmedOrders: 0,
    deliveredOrders: 0,
    totalRevenue: 0,
    catalogItems: 0,
    availableItems: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [ordersRes, catalogStatsRes] = await Promise.all([
        purchaseOrdersAPI.getAll(),
        supplierCatalogAPI.getStats(),
      ]);

      const orders = ordersRes.data.data || [];

      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter((o) => o.status === "pending").length,
        confirmedOrders: orders.filter((o) => o.status === "confirmed").length,
        deliveredOrders: orders.filter((o) => o.status === "delivered").length,
        totalRevenue: orders
          .filter((o) => o.status === "delivered")
          .reduce((sum, o) => sum + (parseFloat(o.total_amount) || 0), 0),
        catalogItems: catalogStatsRes.data.totalItems || 0,
        availableItems: catalogStatsRes.data.availableItems || 0,
      });

      setRecentOrders(orders.slice(0, 5));
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      confirmed: "bg-blue-100 text-blue-800 border-blue-300",
      delivered: "bg-green-100 text-green-800 border-green-300",
      cancelled: "bg-red-100 text-red-800 border-red-300",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold border ${styles[status] || styles.pending}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Header Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute transform rotate-45 -left-20 -top-20 w-96 h-96 bg-white rounded-full"></div>
          <div className="absolute transform -rotate-45 -right-20 -bottom-20 w-96 h-96 bg-white rounded-full"></div>
        </div>

        <div className="relative px-6 py-12">
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
                Supplier Dashboard
              </h1>
              <p className="text-blue-100 text-lg">
                Manage your orders and catalog efficiently
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Orders */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300 border border-blue-400">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <p className="text-sm font-semibold opacity-90 uppercase tracking-wide">
                  Total Orders
                </p>
                <p className="text-4xl font-bold mt-2">{stats.totalOrders}</p>
                <p className="text-xs mt-2 opacity-75">All time</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
                <Package className="text-white" size={32} />
              </div>
            </div>
          </div>

          {/* Pending Orders */}
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300 border border-yellow-400">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <p className="text-sm font-semibold opacity-90 uppercase tracking-wide">
                  Pending
                </p>
                <p className="text-4xl font-bold mt-2">{stats.pendingOrders}</p>
                <p className="text-xs mt-2 opacity-75">Awaiting confirmation</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
                <Clock className="text-white" size={32} />
              </div>
            </div>
          </div>

          {/* Delivered Orders */}
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300 border border-green-400">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <p className="text-sm font-semibold opacity-90 uppercase tracking-wide">
                  Delivered
                </p>
                <p className="text-4xl font-bold mt-2">
                  {stats.deliveredOrders}
                </p>
                <p className="text-xs mt-2 opacity-75">Completed orders</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
                <CheckCircle className="text-white" size={32} />
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300 border border-purple-400">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <p className="text-sm font-semibold opacity-90 uppercase tracking-wide">
                  Total Revenue
                </p>
                <p className="text-4xl font-bold mt-2">
                  {stats.totalRevenue.toFixed(0)}
                </p>
                <p className="text-xs mt-2 opacity-75">
                  ETB from delivered orders
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
                <DollarSign className="text-white" size={32} />
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Manage Orders */}
          <Link
            to="/supplier/orders"
            className="group relative bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>

            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg">
                  <ShoppingCart className="text-white" size={32} />
                </div>
                <ArrowRight
                  className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-2 transition-all duration-300"
                  size={24}
                />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Manage Orders
              </h3>
              <p className="text-gray-600 mb-4">
                View and process purchase orders from pharmacies
              </p>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-600">
                    {stats.pendingOrders} pending
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-600">
                    {stats.confirmedOrders} confirmed
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* Manage Catalog */}
          <Link
            to="/supplier/catalog"
            className="group relative bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-teal-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>

            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl shadow-lg">
                  <Package className="text-white" size={32} />
                </div>
                <ArrowRight
                  className="text-gray-400 group-hover:text-green-600 group-hover:translate-x-2 transition-all duration-300"
                  size={24}
                />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Drug Catalog
              </h3>
              <p className="text-gray-600 mb-4">
                Manage your medicines, prices, and availability
              </p>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600">
                    {stats.availableItems} available
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-gray-600">
                    {stats.catalogItems} total items
                  </span>
                </div>
              </div>
            </div>
          </Link>

          {/* Bank Account Settings */}
          <Link
            to="/supplier/bank-account"
            className="group relative bg-white rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>

            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-lg">
                  <Building2 className="text-white" size={32} />
                </div>
                <ArrowRight
                  className="text-gray-400 group-hover:text-yellow-600 group-hover:translate-x-2 transition-all duration-300"
                  size={24}
                />
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Bank Account
              </h3>
              <p className="text-gray-600 mb-4">
                Set up your payment receiving account
              </p>

              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-600">
                  Required for receiving payments
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                  <TrendingUp className="text-white" size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-900">
                  Recent Orders
                </h2>
              </div>
              <Link
                to="/supplier/orders"
                className="text-blue-600 hover:text-blue-800 font-semibold text-sm flex items-center gap-1"
              >
                View All
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pharmacy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <Package
                        className="mx-auto text-gray-400 mb-3"
                        size={48}
                      />
                      <p className="text-gray-500">No orders yet</p>
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm font-semibold text-blue-600">
                          {order.order_number}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.order_date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.pharmacist_name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {(parseFloat(order.total_amount) || 0).toFixed(2)} ETB
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;

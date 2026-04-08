import { useState, useEffect } from "react";
import { purchaseOrdersAPI } from "../../services/api";
import { toast } from "react-toastify";
import { Package, CheckCircle, XCircle, Eye, Clock } from "lucide-react";

const SupplierOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [confirmingOrder, setConfirmingOrder] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await purchaseOrdersAPI.getAll();
      setOrders(response.data.data || []);
    } catch (error) {
      console.error("Failed to load orders:", error);
      toast.error("Failed to load purchase orders");
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (orderId) => {
    try {
      const response = await purchaseOrdersAPI.getOne(orderId);
      setSelectedOrder(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      toast.error("Failed to load order details");
    }
  };

  const handleConfirmOrder = async (orderId) => {
    if (
      !window.confirm(
        "Confirm this order? This will notify the pharmacy that you can supply the requested items.",
      )
    ) {
      return;
    }

    try {
      setConfirmingOrder(orderId);
      await purchaseOrdersAPI.updateStatus(orderId, { status: "confirmed" });
      toast.success("Order confirmed successfully");
      loadOrders();
      if (selectedOrder?.id === orderId) {
        setShowDetailsModal(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to confirm order");
    } finally {
      setConfirmingOrder(null);
    }
  };

  const handleMarkDelivered = async (orderId) => {
    if (!window.confirm("Mark this order as delivered?")) {
      return;
    }

    try {
      await purchaseOrdersAPI.updateStatus(orderId, {
        status: "delivered",
        actual_delivery_date: new Date().toISOString().split("T")[0],
      });
      toast.success("Order marked as delivered");
      loadOrders();
      if (selectedOrder?.id === orderId) {
        setShowDetailsModal(false);
      }
    } catch (error) {
      toast.error("Failed to update order status");
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

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter((o) => o.status === "confirmed").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Purchase Orders
        </h1>
        <p className="text-gray-600">Manage incoming orders from pharmacies</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Orders</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Package className="text-blue-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Pending</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.pending}
              </p>
            </div>
            <Clock className="text-yellow-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Confirmed</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.confirmed}
              </p>
            </div>
            <CheckCircle className="text-blue-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Delivered</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.delivered}
              </p>
            </div>
            <CheckCircle className="text-green-500" size={32} />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
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
                  Pharmacy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <Package className="mx-auto text-gray-400 mb-3" size={48} />
                    <p className="text-gray-500">No purchase orders yet</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.item_count || 0} items
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {(parseFloat(order.total_amount) || 0).toFixed(2)} ETB
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(order.id)}
                          className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                        >
                          <Eye size={16} />
                          View
                        </button>
                        {order.status === "pending" && (
                          <button
                            onClick={() => handleConfirmOrder(order.id)}
                            disabled={confirmingOrder === order.id}
                            className="text-green-600 hover:text-green-800 font-medium flex items-center gap-1 disabled:opacity-50"
                          >
                            <CheckCircle size={16} />
                            Confirm
                          </button>
                        )}
                        {order.status === "confirmed" && (
                          <button
                            onClick={() => handleMarkDelivered(order.id)}
                            className="text-green-600 hover:text-green-800 font-medium flex items-center gap-1"
                          >
                            <CheckCircle size={16} />
                            Delivered
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Order Details
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Order #{selectedOrder.order_number}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="font-semibold">
                    {new Date(selectedOrder.order_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="mt-1">
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Expected Delivery</p>
                  <p className="font-semibold">
                    {selectedOrder.expected_delivery_date
                      ? new Date(
                          selectedOrder.expected_delivery_date,
                        ).toLocaleDateString()
                      : "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Pharmacist</p>
                  <p className="font-semibold">
                    {selectedOrder.pharmacist_name || "N/A"}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Order Items</h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Medicine
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Quantity
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Unit Price
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedOrder.items?.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item.medicine_name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {item.quantity_ordered}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {(parseFloat(item.unit_price) || 0).toFixed(2)} ETB
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                            {(parseFloat(item.total_price) || 0).toFixed(2)} ETB
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td
                          colSpan="3"
                          className="px-4 py-3 text-right font-semibold text-gray-900"
                        >
                          Total Amount:
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-900">
                          {(
                            parseFloat(selectedOrder.total_amount) || 0
                          ).toFixed(2)}{" "}
                          ETB
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Notes</h3>
                  <p className="text-gray-600 bg-gray-50 p-4 rounded-lg">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedOrder.status === "pending" && (
                  <button
                    onClick={() => handleConfirmOrder(selectedOrder.id)}
                    disabled={confirmingOrder === selectedOrder.id}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Confirm Order
                  </button>
                )}
                {selectedOrder.status === "confirmed" && (
                  <button
                    onClick={() => handleMarkDelivered(selectedOrder.id)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Mark as Delivered
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierOrders;

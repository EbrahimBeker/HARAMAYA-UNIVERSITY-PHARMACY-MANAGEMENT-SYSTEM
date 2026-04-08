import { useState, useEffect } from "react";
import {
  purchaseOrdersAPI,
  suppliersAPI,
  medicinesAPI,
  supplierCatalogAPI,
} from "../../services/api";
import { toast } from "react-toastify";
import { Plus, Package, Eye, Search, Info } from "lucide-react";

const PurchaseOrders = () => {
  const [orders, setOrders] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [supplierCatalog, setSupplierCatalog] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [formData, setFormData] = useState({
    supplier_id: "",
    order_date: new Date().toISOString().split("T")[0],
    expected_delivery_date: "",
    notes: "",
  });
  const [orderItems, setOrderItems] = useState([
    { medicine_id: "", quantity: 1, unit_price: 0 },
  ]);

  useEffect(() => {
    loadOrders();
    loadSuppliers();
    loadMedicines();
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

  const loadSuppliers = async () => {
    try {
      // Fetch suppliers for ordering: Admin-created + own suppliers
      const response = await suppliersAPI.getAll({
        is_active: true,
        for_ordering: true,
      });
      setSuppliers(response.data.data || []);
    } catch (error) {
      console.error("Failed to load suppliers:", error);
    }
  };

  const loadMedicines = async () => {
    try {
      const response = await medicinesAPI.getAll({ limit: 1000 });
      setMedicines(response.data.data || []);
    } catch (error) {
      console.error("Failed to load medicines:", error);
    }
  };

  const loadSupplierCatalog = async (supplierId) => {
    if (!supplierId) {
      setSupplierCatalog([]);
      return;
    }

    console.log("Loading catalog for supplier:", supplierId);

    try {
      const response = await supplierCatalogAPI.getAll({
        supplier_id: supplierId,
        is_available: true,
      });
      console.log("Catalog loaded:", response.data.data);
      setSupplierCatalog(response.data.data || []);
    } catch (error) {
      console.error("Failed to load supplier catalog:", error);
      toast.error("Failed to load supplier catalog");
      setSupplierCatalog([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const validItems = orderItems.filter(
        (item) => item.medicine_id && item.quantity > 0,
      );

      if (validItems.length === 0) {
        toast.error("Please add at least one item");
        return;
      }

      await purchaseOrdersAPI.create({
        ...formData,
        items: validItems,
      });

      toast.success("Purchase order created successfully");
      setShowCreateModal(false);
      resetForm();
      loadOrders();
    } catch (error) {
      console.error("Failed to create order:", error);
      toast.error(error.response?.data?.message || "Failed to create order");
    }
  };

  const resetForm = () => {
    setFormData({
      supplier_id: "",
      order_date: new Date().toISOString().split("T")[0],
      expected_delivery_date: "",
      notes: "",
    });
    setOrderItems([{ medicine_id: "", quantity: 1, unit_price: 0 }]);
    setSupplierCatalog([]);
    setSearchTerm("");
  };

  const handleSupplierChange = (supplierId) => {
    console.log("Supplier changed to:", supplierId);
    setFormData({ ...formData, supplier_id: supplierId });
    setOrderItems([{ medicine_id: "", quantity: 1, unit_price: 0 }]);
    loadSupplierCatalog(supplierId);
  };

  const addItemFromCatalog = (catalogItem) => {
    // Check if item already exists
    const existingIndex = orderItems.findIndex(
      (item) => item.medicine_id === catalogItem.medicine_id.toString(),
    );

    if (existingIndex >= 0) {
      // Update quantity
      const updated = [...orderItems];
      updated[existingIndex].quantity +=
        catalogItem.minimum_order_quantity || 1;
      setOrderItems(updated);
      toast.info("Quantity updated for existing item");
    } else {
      // Add new item
      setOrderItems([
        ...orderItems.filter((item) => item.medicine_id !== ""),
        {
          medicine_id: catalogItem.medicine_id.toString(),
          quantity: catalogItem.minimum_order_quantity || 1,
          unit_price: parseFloat(catalogItem.unit_price) || 0,
        },
      ]);
      toast.success("Item added to order");
    }
  };

  const addItem = () => {
    setOrderItems([
      ...orderItems,
      { medicine_id: "", quantity: 1, unit_price: 0 },
    ]);
  };

  const removeItem = (index) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const updated = [...orderItems];
    updated[index][field] = value;

    // Auto-fill unit price when medicine is selected
    if (field === "medicine_id") {
      const medicine = medicines.find((m) => m.id === parseInt(value));
      if (medicine) {
        updated[index].unit_price = medicine.unit_price || 0;
      }
    }

    setOrderItems(updated);
  };

  const viewOrder = async (orderId) => {
    try {
      const response = await purchaseOrdersAPI.getOne(orderId);
      setSelectedOrder(response.data);
    } catch (error) {
      console.error("Failed to load order:", error);
      toast.error("Failed to load order details");
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return styles[status] || "bg-gray-100 text-gray-800";
  };

  const totalAmount = orderItems.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0,
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Purchase Orders
              </h1>
              <p className="text-gray-600 mt-1">
                Order medicines from suppliers
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
            >
              <Plus size={20} />
              New Order
            </button>
          </div>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading orders...</p>
            </div>
          ) : orders.length > 0 ? (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Order #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Supplier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Order Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono font-semibold text-blue-600">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {order.supplier_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(order.order_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      ${parseFloat(order.total_amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                          order.status,
                        )}`}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => viewOrder(order.id)}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500">No purchase orders yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h2 className="text-2xl font-bold">New Purchase Order</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="text-white hover:text-gray-200"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supplier *
                  </label>
                  <select
                    value={formData.supplier_id}
                    onChange={(e) => handleSupplierChange(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Order Date *
                  </label>
                  <input
                    type="date"
                    value={formData.order_date}
                    onChange={(e) =>
                      setFormData({ ...formData, order_date: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expected Delivery Date
                </label>
                <input
                  type="date"
                  value={formData.expected_delivery_date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      expected_delivery_date: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Supplier Catalog */}
              {formData.supplier_id && supplierCatalog.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                      <Package size={16} className="text-blue-600" />
                      Available from Supplier ({supplierCatalog.length} items)
                    </h3>
                    <div className="relative">
                      <Search
                        size={16}
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        placeholder="Search medicines..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {supplierCatalog
                      .filter(
                        (item) =>
                          !searchTerm ||
                          item.medicine_name
                            .toLowerCase()
                            .includes(searchTerm.toLowerCase()) ||
                          item.generic_name
                            ?.toLowerCase()
                            .includes(searchTerm.toLowerCase()),
                      )
                      .map((item) => (
                        <div
                          key={item.id}
                          className="bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-300 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 text-sm">
                                {item.medicine_name}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {item.generic_name}{" "}
                                {item.strength && `- ${item.strength}`}
                              </div>
                              <div className="flex items-center gap-4 mt-2 text-xs">
                                <span className="text-gray-600">
                                  <span className="font-medium">Price:</span>{" "}
                                  {(parseFloat(item.unit_price) || 0).toFixed(
                                    2,
                                  )}{" "}
                                  ETB
                                </span>
                                <span className="text-gray-600">
                                  <span className="font-medium">
                                    Available:
                                  </span>{" "}
                                  {item.quantity_available}
                                </span>
                                <span className="text-gray-600">
                                  <span className="font-medium">
                                    Min Order:
                                  </span>{" "}
                                  {item.minimum_order_quantity}
                                </span>
                              </div>
                              {item.notes && (
                                <div className="mt-2 text-xs text-gray-500 italic flex items-start gap-1">
                                  <Info
                                    size={12}
                                    className="mt-0.5 flex-shrink-0"
                                  />
                                  {item.notes}
                                </div>
                              )}
                            </div>
                            <button
                              type="button"
                              onClick={() => addItemFromCatalog(item)}
                              className="ml-3 px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {formData.supplier_id && supplierCatalog.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <Package size={32} className="mx-auto text-yellow-500 mb-2" />
                  <p className="text-sm text-yellow-800 font-medium">
                    No catalog available from this supplier
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">
                    You can still add items manually below
                  </p>
                </div>
              )}

              {/* Order Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Order Items *
                  </label>
                  <button
                    type="button"
                    onClick={addItem}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + Add Item
                  </button>
                </div>
                <div className="space-y-2">
                  {orderItems.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <select
                        value={item.medicine_id}
                        onChange={(e) =>
                          updateItem(index, "medicine_id", e.target.value)
                        }
                        required
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Medicine</option>
                        {medicines.map((medicine) => (
                          <option key={medicine.id} value={medicine.id}>
                            {medicine.name} - {medicine.strength}{" "}
                            {medicine.unit}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "quantity",
                            parseInt(e.target.value),
                          )
                        }
                        min="1"
                        required
                        placeholder="Qty"
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) =>
                          updateItem(
                            index,
                            "unit_price",
                            parseFloat(e.target.value),
                          )
                        }
                        min="0"
                        step="0.01"
                        required
                        placeholder="Price"
                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {orderItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-right">
                  <span className="text-sm font-medium text-gray-700">
                    Total: ${totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={2}
                  placeholder="Additional notes..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg"
                >
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Order Modal - Simplified for now */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h2 className="text-2xl font-bold">Order Details</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-white hover:text-gray-200"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">
                    Order Number
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedOrder.order_number}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">
                    Status
                  </label>
                  <p>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(
                        selectedOrder.status,
                      )}`}
                    >
                      {selectedOrder.status.charAt(0).toUpperCase() +
                        selectedOrder.status.slice(1)}
                    </span>
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Items</h3>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.medicine_name}</span>
                      <span>
                        {item.quantity_ordered} × $
                        {parseFloat(item.unit_price).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>
                    ${parseFloat(selectedOrder.total_amount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end rounded-b-xl">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PurchaseOrders;

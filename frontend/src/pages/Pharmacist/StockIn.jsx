import { useState, useEffect } from "react";
import { inventoryAPI, medicinesAPI, suppliersAPI } from "../../services/api";
import { toast } from "react-toastify";
import {
  Package,
  Plus,
  Search,
  Calendar,
  DollarSign,
  Truck,
  CheckCircle,
  X,
} from "lucide-react";
import Loading from "../../components/Common/Loading";

const StockIn = () => {
  const [loading, setLoading] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    medicine_id: "",
    supplier_id: "",
    batch_number: "",
    quantity: "",
    unit_cost: "",
    manufacture_date: "",
    expiry_date: "",
    purchase_order_id: null,
    notes: "",
  });

  const [recentStockIns, setRecentStockIns] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [medicinesRes, suppliersRes, movementsRes] = await Promise.all([
        medicinesAPI.getAll({ limit: 1000 }),
        suppliersAPI.getAll({ limit: 1000 }),
        inventoryAPI.getMovements({ type: "in", limit: 10 }),
      ]);

      setMedicines(medicinesRes.data.data || []);
      setSuppliers(suppliersRes.data.data || []);
      setRecentStockIns(movementsRes.data.data || []);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load initial data");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (
      !formData.medicine_id ||
      !formData.supplier_id ||
      !formData.batch_number ||
      !formData.quantity ||
      !formData.unit_cost ||
      !formData.expiry_date
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      await inventoryAPI.receiveStock({
        ...formData,
        quantity: parseInt(formData.quantity),
        unit_cost: parseFloat(formData.unit_cost),
      });

      toast.success("Stock received successfully!");

      // Reset form
      setFormData({
        medicine_id: "",
        supplier_id: "",
        batch_number: "",
        quantity: "",
        unit_cost: "",
        manufacture_date: "",
        expiry_date: "",
        purchase_order_id: null,
        notes: "",
      });

      setShowForm(false);

      // Reload recent stock ins
      const movementsRes = await inventoryAPI.getMovements({
        type: "in",
        limit: 10,
      });
      setRecentStockIns(movementsRes.data.data || []);
    } catch (error) {
      console.error("Failed to receive stock:", error);
      toast.error(error.response?.data?.message || "Failed to receive stock");
    } finally {
      setLoading(false);
    }
  };

  const filteredMedicines = medicines.filter(
    (med) =>
      med.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (med.generic_name &&
        med.generic_name.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  if (loading && medicines.length === 0) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-green-50 to-blue-50">
      {/* Header */}
      <div className="relative bg-gradient-to-r from-green-600 via-teal-600 to-blue-600 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="relative px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
                    <Package size={32} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                      Stock In Management
                    </h1>
                    <p className="text-green-100 text-sm sm:text-base lg:text-lg mt-1 font-medium">
                      Add purchased drugs to inventory
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-green-600 rounded-xl hover:bg-green-50 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
              >
                {showForm ? (
                  <>
                    <X size={20} />
                    Cancel
                  </>
                ) : (
                  <>
                    <Plus size={20} />
                    Add New Stock
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg
            className="w-full h-8 sm:h-12"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
              className="fill-gray-50"
            ></path>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-4">
        {/* Stock In Form */}
        {showForm && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl">
                <Plus className="text-white" size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Receive New Stock
                </h2>
                <p className="text-sm text-gray-600">
                  Fill in the details to add stock to inventory
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Medicine Selection */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Medicine <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Search
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="text"
                      placeholder="Search medicine..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                    />
                  </div>
                  <select
                    name="medicine_id"
                    value={formData.medicine_id}
                    onChange={handleInputChange}
                    required
                    className="mt-2 w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  >
                    <option value="">Select Medicine</option>
                    {filteredMedicines.map((med) => (
                      <option key={med.id} value={med.id}>
                        {med.name} {med.generic_name && `(${med.generic_name})`}{" "}
                        - {med.strength} {med.unit}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Supplier */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Supplier <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Truck
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <select
                      name="supplier_id"
                      value={formData.supplier_id}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Batch Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Batch Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="batch_number"
                    value={formData.batch_number}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., BATCH-2024-001"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  />
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    required
                    min="1"
                    placeholder="Enter quantity"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  />
                </div>

                {/* Unit Cost */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Unit Cost <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <DollarSign
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="number"
                      name="unit_cost"
                      value={formData.unit_cost}
                      onChange={handleInputChange}
                      required
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                    />
                  </div>
                </div>

                {/* Manufacture Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Manufacture Date
                  </label>
                  <div className="relative">
                    <Calendar
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="date"
                      name="manufacture_date"
                      value={formData.manufacture_date}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                    />
                  </div>
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Expiry Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                    <input
                      type="date"
                      name="expiry_date"
                      value={formData.expiry_date}
                      onChange={handleInputChange}
                      required
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                    />
                  </div>
                </div>

                {/* Purchase Order ID */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Purchase Order ID (Optional)
                  </label>
                  <input
                    type="number"
                    name="purchase_order_id"
                    value={formData.purchase_order_id || ""}
                    onChange={handleInputChange}
                    placeholder="Enter PO number"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  placeholder="Add any additional notes..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all resize-none"
                ></textarea>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-all duration-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl hover:from-green-700 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold disabled:opacity-50"
                >
                  <CheckCircle size={20} />
                  {loading ? "Processing..." : "Receive Stock"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Recent Stock Ins */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
              <Package className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Recent Stock Receipts
              </h2>
              <p className="text-sm text-gray-600">
                Last 10 stock in transactions
              </p>
            </div>
          </div>

          {recentStockIns.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Medicine
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Batch
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Quantity
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Supplier
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Unit Cost
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Received By
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentStockIns.map((stock, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {new Date(stock.received_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">
                        {stock.medicine_name}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {stock.batch_number}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-green-600">
                        +{stock.quantity}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {stock.supplier_name}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        ${parseFloat(stock.unit_cost).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {stock.received_by_name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="text-gray-400" size={32} />
              </div>
              <p className="text-gray-500 font-medium">No stock receipts yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Click "Add New Stock" to receive your first stock
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockIn;

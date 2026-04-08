import { useState, useEffect } from "react";
import { supplierCatalogAPI, medicinesAPI } from "../../services/api";
import { toast } from "react-toastify";
import {
  Plus,
  Upload,
  Download,
  Edit,
  Trash2,
  Package,
  DollarSign,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const SupplierCatalog = () => {
  const { user } = useAuth();
  const [catalog, setCatalog] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [stats, setStats] = useState({
    totalItems: 0,
    availableItems: 0,
    totalValue: 0,
  });
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [supplierId, setSupplierId] = useState(null);

  const [formData, setFormData] = useState({
    medicine_id: "",
    unit_price: "",
    quantity_available: 0,
    minimum_order_quantity: 1,
    is_available: true,
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // First get supplier ID for current user
      const catalogRes = await supplierCatalogAPI.getAll();
      console.log("Catalog response:", catalogRes.data);

      const currentSupplierId =
        catalogRes.data.supplier_id ||
        (catalogRes.data.data && catalogRes.data.data.length > 0
          ? catalogRes.data.data[0].supplier_id
          : null);

      console.log("Current supplier ID:", currentSupplierId);
      setSupplierId(currentSupplierId);

      if (!currentSupplierId) {
        toast.error(
          "No supplier account linked to your user. Please contact admin.",
        );
        setLoading(false);
        return;
      }

      const [medicinesRes, statsRes] = await Promise.all([
        medicinesAPI.getAll({ limit: 1000 }),
        supplierCatalogAPI.getStats(),
      ]);

      setCatalog(catalogRes.data.data || []);
      setMedicines(medicinesRes.data.data || []);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load catalog");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!supplierId) {
        toast.error("Supplier ID not found");
        return;
      }

      await supplierCatalogAPI.upsert({
        supplier_id: supplierId,
        ...formData,
      });

      toast.success(
        editingItem ? "Item updated successfully" : "Item added successfully",
      );
      setShowAddModal(false);
      resetForm();
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      medicine_id: item.medicine_id,
      unit_price: item.unit_price,
      quantity_available: item.quantity_available,
      minimum_order_quantity: item.minimum_order_quantity,
      is_available: item.is_available,
      notes: item.notes || "",
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      await supplierCatalogAPI.delete(id);
      toast.success("Item deleted successfully");
      loadData();
    } catch (error) {
      toast.error("Failed to delete item");
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log("File selected:", file.name, file.type, file.size);

    if (!supplierId) {
      toast.error("Supplier ID not found. Please refresh the page.");
      console.error("Supplier ID is null");
      return;
    }

    console.log("Uploading with supplier_id:", supplierId);

    try {
      setUploadingFile(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("supplier_id", supplierId);

      console.log("Sending bulk upload request...");
      const response = await supplierCatalogAPI.bulkUpload(formData);
      console.log("Upload response:", response.data);

      toast.success(
        `Upload completed: ${response.data.successCount} items added/updated, ${response.data.errorCount} errors`,
      );

      if (response.data.errors && response.data.errors.length > 0) {
        console.log("Upload errors:", response.data.errors);
        toast.warning(`Some items had errors. Check console for details.`);
      }

      loadData();
    } catch (error) {
      console.error("Upload error:", error);
      console.error("Error response:", error.response?.data);
      toast.error(error.response?.data?.message || "Upload failed");
    } finally {
      setUploadingFile(false);
      e.target.value = "";
    }
  };

  const downloadTemplate = () => {
    const template = `medicine_name,unit_price,quantity_available,minimum_order_quantity,notes
Paracetamol,5.50,1000,10,Pain reliever
Amoxicillin,12.00,500,5,Antibiotic
Ibuprofen,8.75,750,10,Anti-inflammatory
Omeprazole,15.00,300,5,Acid reflux medication
Amlodipine,20.00,400,5,Blood pressure medication`;

    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "supplier_catalog_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setFormData({
      medicine_id: "",
      unit_price: "",
      quantity_available: 0,
      minimum_order_quantity: 1,
      is_available: true,
      notes: "",
    });
    setEditingItem(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading catalog...</p>
        </div>
      </div>
    );
  }

  if (!supplierId && !loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-bold text-red-800 mb-2">
              Supplier Account Not Linked
            </h2>
            <p className="text-red-600 mb-4">
              Your user account is not linked to a supplier company. Please
              contact the system administrator to link your account.
            </p>
            <p className="text-sm text-gray-600">
              User ID: {user?.id} | Username: {user?.username}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Drug Catalog
          </h1>
          <p className="text-gray-600">
            Manage your available medicines and prices
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download size={18} />
            Template
          </button>
          <label className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer">
            <Upload size={18} />
            {uploadingFile ? "Uploading..." : "Upload Excel/CSV"}
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              disabled={uploadingFile || !supplierId}
              className="hidden"
            />
          </label>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Item
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total Items</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalItems}
              </p>
            </div>
            <Package className="text-blue-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">
                Available Items
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.availableItems}
              </p>
            </div>
            <Package className="text-green-500" size={32} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">
                Total Inventory Value
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {(parseFloat(stats.totalValue) || 0).toFixed(2)} ETB
              </p>
            </div>
            <DollarSign className="text-purple-500" size={32} />
          </div>
        </div>
      </div>

      {/* Catalog Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Medicine
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Available Qty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Min Order
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
              {catalog.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <Package className="mx-auto text-gray-400 mb-3" size={48} />
                    <p className="text-gray-700 font-semibold mb-2">
                      No items in catalog yet
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Start by uploading your drug inventory using the template
                    </p>
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={downloadTemplate}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                      >
                        Download Template
                      </button>
                      <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                      >
                        Add Manually
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                catalog.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-semibold text-gray-900">
                          {item.medicine_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.generic_name}{" "}
                          {item.strength && `- ${item.strength}`}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.category_name}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                      {(parseFloat(item.unit_price) || 0).toFixed(2)} ETB
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.quantity_available}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.minimum_order_quantity}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          item.is_available
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.is_available ? "Available" : "Unavailable"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingItem ? "Edit Catalog Item" : "Add Catalog Item"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medicine *
                </label>
                <select
                  value={formData.medicine_id}
                  onChange={(e) =>
                    setFormData({ ...formData, medicine_id: e.target.value })
                  }
                  required
                  disabled={editingItem}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Medicine</option>
                  {medicines.map((med) => (
                    <option key={med.id} value={med.id}>
                      {med.name} {med.strength && `- ${med.strength}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit Price (ETB) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.unit_price}
                    onChange={(e) =>
                      setFormData({ ...formData, unit_price: e.target.value })
                    }
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity Available
                  </label>
                  <input
                    type="number"
                    value={formData.quantity_available}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        quantity_available: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Order Quantity
                </label>
                <input
                  type="number"
                  value={formData.minimum_order_quantity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minimum_order_quantity: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_available}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        is_available: e.target.checked,
                      })
                    }
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Available for Order
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {editingItem ? "Update" : "Add"} Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierCatalog;

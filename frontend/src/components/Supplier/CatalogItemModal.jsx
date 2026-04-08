const CatalogItemModal = ({
  show,
  editingItem,
  formData,
  medicines,
  onSubmit,
  onClose,
  onChange,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {editingItem ? "Edit Catalog Item" : "Add Catalog Item"}
          </h2>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Medicine *
            </label>
            <select
              value={formData.medicine_id}
              onChange={(e) =>
                onChange({ ...formData, medicine_id: e.target.value })
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
                  onChange({ ...formData, unit_price: e.target.value })
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
                  onChange({
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
                onChange({
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
              onChange={(e) => onChange({ ...formData, notes: e.target.value })}
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
                  onChange({
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
              onClick={onClose}
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
  );
};

export default CatalogItemModal;

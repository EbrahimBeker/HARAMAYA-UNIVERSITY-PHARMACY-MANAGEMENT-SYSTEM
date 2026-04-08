import { Edit, Trash2, Package } from "lucide-react";

const CatalogTable = ({
  catalog,
  onEdit,
  onDelete,
  onDownloadTemplate,
  onAddItem,
}) => {
  return (
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
                      onClick={onDownloadTemplate}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      Download Template
                    </button>
                    <button
                      onClick={onAddItem}
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
                        onClick={() => onEdit(item)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit item"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete item"
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
  );
};

export default CatalogTable;

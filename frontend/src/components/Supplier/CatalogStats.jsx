import { Package, DollarSign } from "lucide-react";

const CatalogStats = ({ stats }) => {
  return (
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
            <p className="text-sm text-gray-600 font-medium">Available Items</p>
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
  );
};

export default CatalogStats;

import { X } from "lucide-react";

const CartItem = ({
  item,
  index,
  onUpdateQuantity,
  onUpdatePrice,
  onRemove,
}) => {
  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-gradient-to-r from-gray-50 to-white">
      <div className="flex items-center justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-bold text-gray-900">{item.medicine_name}</h4>
          <p className="text-sm text-gray-600">
            {item.strength} {item.unit}
          </p>
        </div>
        <button
          onClick={() => onRemove(index)}
          className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Quantity
          </label>
          <input
            type="number"
            value={item.quantity}
            onChange={(e) => onUpdateQuantity(index, e.target.value)}
            max={item.available_stock}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Unit Price
          </label>
          <input
            type="number"
            value={item.unit_price}
            onChange={(e) => onUpdatePrice(index, e.target.value)}
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Subtotal
          </label>
          <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm font-bold text-gray-900">
            {(item.quantity * item.unit_price).toFixed(2)} ETB
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;

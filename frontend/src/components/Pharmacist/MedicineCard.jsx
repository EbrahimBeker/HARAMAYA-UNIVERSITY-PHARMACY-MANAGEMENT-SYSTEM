import { ShoppingCart, DollarSign } from "lucide-react";

const MedicineCard = ({ medicine, onAddToCart }) => {
  return (
    <div className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-gradient-to-br from-white to-gray-50">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h4 className="font-bold text-gray-900 text-sm">{medicine.name}</h4>
          {medicine.generic_name && (
            <p className="text-xs text-gray-600 italic">
              {medicine.generic_name}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              {medicine.strength} {medicine.unit}
            </span>
            <span
              className={`text-xs px-2 py-1 rounded-full font-medium ${
                (medicine.quantity_available || 0) > medicine.reorder_level
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              Stock: {medicine.quantity_available || 0}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-lg font-bold text-blue-600 flex items-center gap-1">
          <DollarSign size={16} />
          {medicine.unit_price} ETB
        </div>
        <button
          onClick={() => onAddToCart(medicine)}
          disabled={(medicine.quantity_available || 0) === 0}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-green-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-200 transform hover:scale-105"
        >
          <ShoppingCart size={16} />
          Add to Cart
        </button>
      </div>
    </div>
  );
};

export default MedicineCard;

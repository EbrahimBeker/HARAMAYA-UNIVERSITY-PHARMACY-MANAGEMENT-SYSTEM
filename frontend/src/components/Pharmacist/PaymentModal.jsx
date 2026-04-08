import { X, DollarSign, CheckCircle } from "lucide-react";

const PaymentModal = ({
  cartItems,
  cartTotal,
  loading,
  onClose,
  onProcessPayment,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <DollarSign size={24} />
              Cash Payment
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Order Summary
            </h3>
            <div className="space-y-2">
              {cartItems.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>
                    {item.medicine_name} x {item.quantity}
                  </span>
                  <span>
                    {(item.quantity * item.unit_price).toFixed(2)} ETB
                  </span>
                </div>
              ))}
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total:</span>
                  <span className="text-blue-600">
                    {cartTotal.toFixed(2)} ETB
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Payment Method
            </h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-800">
                <DollarSign size={20} />
                <span className="font-medium">Cash Payment Only</span>
              </div>
            </div>
          </div>

          {/* Cash Payment Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Cash Payment Details
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Amount
                </label>
                <input
                  type="number"
                  value={cartTotal}
                  readOnly
                  step="0.01"
                  min={cartTotal}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder={`Minimum: ${cartTotal.toFixed(2)}`}
                />
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-green-700 font-medium">
                    Change to give:
                  </span>
                  <span className="text-green-800 font-bold text-lg">
                    0.00 ETB
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Process Payment Button */}
          <button
            onClick={onProcessPayment}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              <>
                <CheckCircle size={24} />
                Complete Payment
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;

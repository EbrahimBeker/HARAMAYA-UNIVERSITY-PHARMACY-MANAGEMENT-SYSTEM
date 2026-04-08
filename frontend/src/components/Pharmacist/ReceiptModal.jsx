import { X, Receipt } from "lucide-react";

const ReceiptModal = ({ transaction, onClose }) => {
  if (!transaction) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Receipt size={24} />
              Transaction Receipt
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Receipt Header */}
          <div className="text-center mb-6 pb-4 border-b border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900">
              Haramaya University Pharmacy
            </h3>
            <p className="text-gray-600">Management System</p>
            <p className="text-sm text-gray-500 mt-2">
              Transaction ID: {transaction.transaction_id}
            </p>
            <p className="text-sm text-gray-500">
              Date: {new Date(transaction.transaction_date).toLocaleString()}
            </p>
          </div>

          {/* Items */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Items:</h4>
            <div className="space-y-2">
              {transaction.items?.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {item.medicine_name} x {item.quantity}
                  </span>
                  <span className="font-medium text-gray-900">
                    {(item.quantity * item.unit_price).toFixed(2)} ETB
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal:</span>
              <span>{transaction.total_amount.toFixed(2)} ETB</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span className="text-green-600">
                {transaction.total_amount.toFixed(2)} ETB
              </span>
            </div>
            <div className="flex justify-between">
              <span>Payment Method:</span>
              <span className="capitalize">{transaction.payment_method}</span>
            </div>
            <div className="flex justify-between">
              <span>Amount Paid:</span>
              <span>{transaction.amount_paid.toFixed(2)} ETB</span>
            </div>
            {transaction.change_amount > 0 && (
              <div className="flex justify-between text-green-600 font-medium">
                <span>Change:</span>
                <span>{transaction.change_amount.toFixed(2)} ETB</span>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 mb-4">
            <p>Thank you for your business!</p>
            <p>Please keep this receipt for your records.</p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => window.print()}
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Print Receipt
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;

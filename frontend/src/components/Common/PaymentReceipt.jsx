import { X, Printer, Download } from "lucide-react";

const PaymentReceipt = ({ isOpen, onClose, patientData, paymentData }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const currentDate = new Date().toLocaleDateString();
  const currentTime = new Date().toLocaleTimeString();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Payment Receipt
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="border-2 border-dashed border-gray-300 p-4 space-y-4">
          {/* Header */}
          <div className="text-center border-b pb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Haramaya Pharmacy
            </h2>
            <p className="text-sm text-gray-600">Management System</p>
            <p className="text-xs text-gray-500">Registration Receipt</p>
          </div>

          {/* Receipt Details */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{currentDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time:</span>
              <span className="font-medium">{currentTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Receipt #:</span>
              <span className="font-medium">REG-{Date.now()}</span>
            </div>
          </div>

          {/* Patient Info */}
          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-900 mb-2">
              Patient Information
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium">
                  {patientData?.first_name} {patientData?.last_name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-medium">{patientData?.phone}</span>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-900 mb-2">
              Payment Details
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Registration Fee:</span>
                <span className="font-medium">
                  {Number(paymentData?.registration_fee || 0).toFixed(2)} ETB
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-medium capitalize">
                  {paymentData?.payment_method?.replace("_", " ")}
                </span>
              </div>
              {paymentData?.payment_method === "cash" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount Paid:</span>
                    <span className="font-medium">
                      {Number(paymentData?.amount_paid || 0).toFixed(2)} ETB
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Change:</span>
                    <span className="font-medium">
                      {Number(paymentData?.change_amount || 0).toFixed(2)} ETB
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="border-t pt-4 text-center">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              ✓ Payment Completed
            </div>
          </div>

          {/* Footer */}
          <div className="border-t pt-4 text-center text-xs text-gray-500">
            <p>Thank you for choosing Haramaya Pharmacy</p>
            <p>Keep this receipt for your records</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Printer size={16} />
            Print
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentReceipt;

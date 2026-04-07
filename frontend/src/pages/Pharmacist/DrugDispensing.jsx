import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { prescriptionsAPI, medicinesAPI, salesAPI } from "../../services/api";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Search,
  User,
  Calendar,
  Pill,
  CheckCircle,
  AlertTriangle,
  FileText,
  Plus,
  Minus,
  DollarSign,
  ShoppingCart,
  Receipt,
  Trash2,
  Edit3,
  Eye,
  Calculator,
  X,
} from "lucide-react";

const DrugDispensing = () => {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [availableMedicines, setAvailableMedicines] = useState([]);
  const [medicineSearchTerm, setMedicineSearchTerm] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);

  useEffect(() => {
    fetchPendingPrescriptions();
    fetchAvailableMedicines();
  }, []);

  const fetchPendingPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await prescriptionsAPI.getAll({ status: "pending" });
      setPrescriptions(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch prescriptions:", error);
      toast.error("Failed to load prescriptions");
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableMedicines = async () => {
    try {
      const response = await medicinesAPI.getAll({ limit: 100 });
      setAvailableMedicines(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch medicines:", error);
    }
  };

  const handleAddMedicineToCart = (medicine) => {
    const existingIndex = cartItems.findIndex(
      (item) => item.medicine_id === medicine.id,
    );

    if (existingIndex >= 0) {
      setCartItems((prev) =>
        prev.map((item, i) =>
          i === existingIndex
            ? {
                ...item,
                quantity: Math.min(item.quantity + 1, item.available_stock),
              }
            : item,
        ),
      );
      toast.success(`${medicine.name} quantity increased`);
    } else {
      const newItem = {
        medicine_id: medicine.id,
        medicine_name: medicine.name,
        generic_name: medicine.generic_name,
        strength: medicine.strength,
        unit: medicine.unit,
        quantity: 1,
        available_stock: medicine.quantity_available || 0,
        unit_price: medicine.unit_price || 0,
        category_name: medicine.category_name,
        type_name: medicine.type_name,
      };
      setCartItems((prev) => [...prev, newItem]);
      toast.success(`${medicine.name} added to cart`);
    }
  };
  const handleUpdateCartQuantity = (index, quantity) => {
    const newQuantity = Math.max(
      0,
      Math.min(parseInt(quantity) || 0, cartItems[index].available_stock),
    );
    setCartItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, quantity: newQuantity } : item,
      ),
    );
  };

  const handleUpdateCartPrice = (index, price) => {
    const newPrice = Math.max(0, parseFloat(price) || 0);
    setCartItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, unit_price: newPrice } : item,
      ),
    );
  };

  const handleRemoveFromCart = (index) => {
    const removedItem = cartItems[index];
    setCartItems((prev) => prev.filter((_, i) => i !== index));
    toast.success(`${removedItem.medicine_name} removed from cart`);
  };

  const handleClearCart = () => {
    setCartItems([]);
    toast.success("Cart cleared");
  };

  const handleProcessPayment = async () => {
    if (cartItems.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    try {
      setLoading(true);

      // Prepare sale data for API (cash only)
      const saleData = {
        payment_method: "cash",
        items: cartItems.map((item) => ({
          medicine_id: item.medicine_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.quantity * item.unit_price,
        })),
        total_amount: cartTotal,
      };

      // Process sale through API
      const saleResponse = await salesAPI.processSale(saleData);

      setLastTransaction({
        ...saleData,
        transaction_id: saleResponse.data.sale.sale_number,
        transaction_date: new Date().toISOString(),
        change_amount: 0, // No change for exact payment
        amount_paid: cartTotal, // Exact amount
      });
      setShowReceipt(true);
      setCartItems([]);
      setShowPayment(false);

      fetchAvailableMedicines();
      toast.success("Payment processed successfully!");
    } catch (error) {
      console.error("Payment processing error:", error);
      toast.error(error.response?.data?.message || "Payment processing failed");
    } finally {
      setLoading(false);
    }
  };

  const filteredPrescriptions = prescriptions.filter(
    (prescription) =>
      prescription.patient_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      prescription.prescription_number
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  const filteredMedicines = availableMedicines.filter(
    (medicine) =>
      medicine.name.toLowerCase().includes(medicineSearchTerm.toLowerCase()) ||
      (medicine.generic_name &&
        medicine.generic_name
          .toLowerCase()
          .includes(medicineSearchTerm.toLowerCase())),
  );

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.unit_price,
    0,
  );
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/pharmacist/dashboard")}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft size={20} />
                Back to Dashboard
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Pill className="text-blue-600" size={28} />
                Drug Dispensing System
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                Cart: {cartItems.length} items
              </div>
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                Total: ${cartTotal.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Medicine Search & Cart */}
          <div className="lg:col-span-2 space-y-6">
            {/* Medicine Search */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Search size={24} />
                  Available Medicines
                </h2>
              </div>

              <div className="p-6">
                <div className="relative mb-4">
                  <Search
                    size={20}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search medicines by name or generic name..."
                    value={medicineSearchTerm}
                    onChange={(e) => setMedicineSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {filteredMedicines.map((medicine) => (
                    <div
                      key={medicine.id}
                      className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-gradient-to-br from-white to-gray-50"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 text-sm">
                            {medicine.name}
                          </h4>
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
                                (medicine.quantity_available || 0) >
                                medicine.reorder_level
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
                          {medicine.unit_price}
                        </div>
                        <button
                          onClick={() => handleAddMedicineToCart(medicine)}
                          disabled={(medicine.quantity_available || 0) === 0}
                          className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-green-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-200 transform hover:scale-105"
                        >
                          <ShoppingCart size={16} />
                          Add to Cart
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Shopping Cart */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <ShoppingCart size={24} />
                    Shopping Cart ({cartItems.length})
                  </h2>
                  {cartItems.length > 0 && (
                    <button
                      onClick={handleClearCart}
                      className="text-white hover:text-red-200 transition-colors"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6">
                {cartItems.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart
                      size={64}
                      className="text-gray-300 mx-auto mb-4"
                    />
                    <p className="text-gray-500 text-lg font-medium">
                      Your cart is empty
                    </p>
                    <p className="text-gray-400 text-sm">
                      Add medicines from the search above
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 max-h-64 overflow-y-auto mb-6">
                      {cartItems.map((item, index) => (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-xl p-4 bg-gradient-to-r from-gray-50 to-white"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-900">
                                {item.medicine_name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {item.strength} {item.unit}
                              </p>
                            </div>
                            <button
                              onClick={() => handleRemoveFromCart(index)}
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
                                onChange={(e) =>
                                  handleUpdateCartQuantity(
                                    index,
                                    e.target.value,
                                  )
                                }
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
                                onChange={(e) =>
                                  handleUpdateCartPrice(index, e.target.value)
                                }
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
                                ${(item.quantity * item.unit_price).toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Cart Total */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">
                          Total Amount:
                        </span>
                        <span className="text-2xl font-bold text-blue-600">
                          ${cartTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Checkout Button */}
                    <button
                      onClick={() => setShowPayment(true)}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <DollarSign size={24} />
                      Proceed to Payment
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
          {/* Right Column - Prescriptions & Quick Stats */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Calculator size={24} />
                  Quick Stats
                </h2>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Available Medicines
                  </span>
                  <span className="text-lg font-bold text-blue-600">
                    {availableMedicines.length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Cart Items
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    {cartItems.length}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Cart Total
                  </span>
                  <span className="text-lg font-bold text-purple-600">
                    ${cartTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Pending Prescriptions */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-600 to-red-600 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileText size={24} />
                  Pending Prescriptions
                </h2>
              </div>

              <div className="p-6">
                <div className="relative mb-4">
                  <Search
                    size={20}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search prescriptions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="w-8 h-8 border-2 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                      <p className="text-gray-500">Loading prescriptions...</p>
                    </div>
                  ) : filteredPrescriptions.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText
                        size={48}
                        className="text-gray-300 mx-auto mb-2"
                      />
                      <p className="text-gray-500">No pending prescriptions</p>
                    </div>
                  ) : (
                    filteredPrescriptions.map((prescription) => (
                      <div
                        key={prescription.id}
                        className="border border-gray-200 rounded-xl p-4 hover:border-orange-300 hover:shadow-md transition-all duration-200 bg-gradient-to-br from-white to-orange-50"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-gray-900 flex items-center gap-2">
                              <User size={16} />
                              {prescription.patient_name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {prescription.prescription_number}
                            </p>
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <Calendar size={12} />
                              {new Date(
                                prescription.prescription_date,
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                              Pending
                            </span>
                            <button className="block mt-2 text-orange-600 hover:text-orange-800 text-sm font-medium">
                              <Eye size={16} className="inline mr-1" />
                              View
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <DollarSign size={24} />
                  Cash Payment
                </h2>
                <button
                  onClick={() => setShowPayment(false)}
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
                        ${(item.quantity * item.unit_price).toFixed(2)}
                      </span>
                    </div>
                  ))}
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span className="text-blue-600">
                        ${cartTotal.toFixed(2)}
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
                      placeholder={`Minimum: $${cartTotal.toFixed(2)}`}
                    />
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex justify-between items-center">
                      <span className="text-green-700 font-medium">
                        Change to give:
                      </span>
                      <span className="text-green-800 font-bold text-lg">
                        $0.00
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Process Payment Button */}
              <button
                onClick={handleProcessPayment}
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
      )}
      {/* Receipt Modal */}
      {showReceipt && lastTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Receipt size={24} />
                  Transaction Receipt
                </h2>
                <button
                  onClick={() => setShowReceipt(false)}
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
                  Haramaya Pharmacy
                </h3>
                <p className="text-gray-600">Management System</p>
                <p className="text-sm text-gray-500 mt-2">
                  Transaction ID: {lastTransaction.transaction_id}
                </p>
                <p className="text-sm text-gray-500">
                  Date:{" "}
                  {new Date(lastTransaction.transaction_date).toLocaleString()}
                </p>
              </div>

              {/* Items */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">
                  Items Purchased
                </h4>
                <div className="space-y-2">
                  {lastTransaction.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <div>
                        <p className="font-medium">{item.medicine_name}</p>
                        <p className="text-gray-500">
                          Qty: {item.quantity} × ${item.unit_price}
                        </p>
                      </div>
                      <p className="font-medium">
                        ${item.total_price.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="mb-6">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${lastTransaction.total_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span className="text-green-600">
                      ${lastTransaction.total_amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span className="capitalize">
                      {lastTransaction.payment_method}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Amount Paid:</span>
                    <span>${lastTransaction.amount_paid.toFixed(2)}</span>
                  </div>
                  {lastTransaction.change_amount > 0 && (
                    <div className="flex justify-between text-green-600 font-medium">
                      <span>Change:</span>
                      <span>${lastTransaction.change_amount.toFixed(2)}</span>
                    </div>
                  )}
                </div>
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
                  onClick={() => setShowReceipt(false)}
                  className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrugDispensing;

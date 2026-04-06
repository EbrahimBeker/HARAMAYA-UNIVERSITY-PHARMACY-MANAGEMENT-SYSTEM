import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  prescriptionsAPI,
  medicinesAPI,
  patientsAPI,
} from "../../services/api";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Search,
  User,
  Calendar,
  Pill,
  CheckCircle,
  AlertTriangle,
  Package,
  FileText,
  Plus,
  Minus,
  DollarSign,
  ShoppingCart,
  CreditCard,
  Receipt,
  Trash2,
  Edit3,
  Eye,
  Calculator,
} from "lucide-react";

const DrugDispensing = () => {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [dispensingItems, setDispensingItems] = useState([]);
  const [availableMedicines, setAvailableMedicines] = useState([]);
  const [medicineSearchTerm, setMedicineSearchTerm] = useState("");
  const [showMedicineSearch, setShowMedicineSearch] = useState(true);
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountPaid, setAmountPaid] = useState(0);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [showPayment, setShowPayment] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);

  useEffect(() => {
    fetchPendingPrescriptions();
    fetchAvailableMedicines();
  }, []);

  const fetchAvailableMedicines = async () => {
    try {
      const response = await medicinesAPI.getAll({ limit: 100 });
      setAvailableMedicines(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch medicines:", error);
    }
  };

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

  const handleSelectPrescription = async (prescription) => {
    try {
      setSelectedPrescription(prescription);

      // Get full prescription details including items
      const prescriptionDetails = await prescriptionsAPI.getOne(
        prescription.id,
      );
      const prescriptionItems = prescriptionDetails.data.items || [];

      // Initialize dispensing items from prescription items
      const initialDispensingItems = prescriptionItems.map((item) => ({
        medicine_id: item.medicine_id,
        medicine_name: item.medicine_name,
        quantity: item.quantity_prescribed,
        dosage: item.dosage,
        frequency: item.frequency,
        duration: item.duration,
        instructions: item.instructions,
        dispensed_quantity: 0,
        available_stock: 0,
        unit_price: 0,
      }));

      setDispensingItems(initialDispensingItems);

      // Fetch stock information for each medicine
      for (let i = 0; i < initialDispensingItems.length; i++) {
        try {
          const searchResponse = await medicinesAPI.search(
            initialDispensingItems[i].medicine_name,
          );
          if (searchResponse.data.length > 0) {
            const medicine = searchResponse.data[0];
            setDispensingItems((prev) =>
              prev.map((item, index) =>
                index === i
                  ? {
                      ...item,
                      available_stock: medicine.quantity_available || 0,
                      unit_price: medicine.unit_price || 0,
                    }
                  : item,
              ),
            );
          }
        } catch (error) {
          console.warn(
            `Could not fetch stock for ${initialDispensingItems[i].medicine_name}`,
          );
        }
      }
    } catch (error) {
      toast.error("Failed to load prescription details");
    }
  };

  const handleDispenseQuantityChange = (index, quantity) => {
    setDispensingItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, dispensed_quantity: parseInt(quantity) || 0 }
          : item,
      ),
    );
  };

  const handleAddMedicineToDispensing = (medicine) => {
    // Check if medicine is already in dispensing list
    const existingIndex = dispensingItems.findIndex(
      (item) => item.medicine_id === medicine.id,
    );

    if (existingIndex >= 0) {
      // If exists, increase quantity
      setDispensingItems((prev) =>
        prev.map((item, i) =>
          i === existingIndex
            ? {
                ...item,
                dispensed_quantity: Math.min(
                  item.dispensed_quantity + 1,
                  item.available_stock,
                ),
              }
            : item,
        ),
      );
    } else {
      // Add new medicine to dispensing list
      const newItem = {
        medicine_id: medicine.id,
        medicine_name: medicine.name,
        quantity: 1, // Default prescribed quantity for manual additions
        dosage: medicine.strength || "As prescribed",
        frequency: "As prescribed",
        duration: "As prescribed",
        instructions: "As prescribed",
        dispensed_quantity: 1,
        available_stock: medicine.quantity_available || 0,
        unit_price: medicine.unit_price || 0,
      };
      setDispensingItems((prev) => [...prev, newItem]);
    }
    toast.success(`${medicine.name} added to dispensing list`);
  };

  const handleRemoveMedicineFromDispensing = (index) => {
    setDispensingItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddMedicineToCart = (medicine) => {
    // Check if medicine is already in cart
    const existingIndex = cartItems.findIndex(
      (item) => item.medicine_id === medicine.id,
    );

    if (existingIndex >= 0) {
      // If exists, increase quantity
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
      toast.success(`${medicine.name} quantity increased in cart`);
    } else {
      // Add new medicine to cart
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

  const handleAddCartToDispensing = () => {
    if (cartItems.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    // Add all cart items to dispensing
    const newDispensingItems = cartItems.map((cartItem) => ({
      medicine_id: cartItem.medicine_id,
      medicine_name: cartItem.medicine_name,
      quantity: cartItem.quantity,
      dosage: cartItem.strength || "As prescribed",
      frequency: "As prescribed",
      duration: "As prescribed",
      instructions: "As prescribed",
      dispensed_quantity: cartItem.quantity,
      available_stock: cartItem.available_stock,
      unit_price: cartItem.unit_price,
    }));

    setDispensingItems((prev) => [...prev, ...newDispensingItems]);
    setCartItems([]);
    toast.success("Cart items added to dispensing");
  };

  const handleProcessPayment = async () => {
    if (cartItems.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    if (paymentMethod === "cash" && amountPaid < cartTotal) {
      toast.error("Insufficient payment amount");
      return;
    }

    try {
      setLoading(true);

      // Simulate API call to process sale and reduce stock
      const saleData = {
        customer_info: customerInfo,
        payment_method: paymentMethod,
        amount_paid: paymentMethod === "cash" ? amountPaid : cartTotal,
        items: cartItems.map((item) => ({
          medicine_id: item.medicine_id,
          medicine_name: item.medicine_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.quantity * item.unit_price,
        })),
        total_amount: cartTotal,
        change_amount:
          paymentMethod === "cash" ? Math.max(0, amountPaid - cartTotal) : 0,
        transaction_date: new Date().toISOString(),
        transaction_id: `TXN${Date.now()}`,
      };

      // Here you would call an API to:
      // 1. Reduce stock for each medicine
      // 2. Record the sale transaction
      // 3. Generate receipt

      // For now, simulate the process
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setLastTransaction(saleData);
      setShowReceipt(true);
      setCartItems([]);
      setAmountPaid(0);
      setCustomerInfo({ name: "", phone: "", address: "" });
      setShowPayment(false);

      // Refresh available medicines to show updated stock
      fetchAvailableMedicines();

      toast.success("Payment processed successfully!");
    } catch (error) {
      toast.error("Payment processing failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDispensePrescription = async () => {
    try {
      if (!selectedPrescription) return;

      // Validate dispensing quantities
      const invalidItems = dispensingItems.filter(
        (item) =>
          item.dispensed_quantity > item.available_stock ||
          item.dispensed_quantity <= 0,
      );

      if (invalidItems.length > 0) {
        toast.error(
          "Please check dispensing quantities. Some items exceed available stock or are invalid.",
        );
        return;
      }

      setLoading(true);

      // First, get the full prescription details to get prescription items
      const prescriptionDetails = await prescriptionsAPI.getOne(
        selectedPrescription.id,
      );
      const prescriptionItems = prescriptionDetails.data.items || [];

      // Prepare dispensing data in the format expected by the API
      const dispensingData = {
        dispensed_items: prescriptionItems
          .map((item) => {
            const dispensingItem = dispensingItems.find(
              (di) =>
                di.medicine_name === item.medicine_name ||
                di.medicine_id === item.medicine_id,
            );
            return {
              prescription_item_id: item.id,
              quantity_dispensed: dispensingItem
                ? dispensingItem.dispensed_quantity
                : 0,
            };
          })
          .filter((item) => item.quantity_dispensed > 0),
      };

      // Call dispense API
      await prescriptionsAPI.dispense(selectedPrescription.id, dispensingData);

      toast.success("Prescription dispensed successfully!");

      // Reset state and refresh prescriptions
      setSelectedPrescription(null);
      setDispensingItems([]);
      fetchPendingPrescriptions();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to dispense prescription",
      );
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
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate("/pharmacist/dashboard")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Drug Dispensing</h1>
      </div>

      <div className="grid grid-cols-1 2xl:grid-cols-4 xl:grid-cols-2 gap-6">
        {/* Prescriptions List */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={20} />
              Pending Prescriptions
            </h2>

            <div className="relative mb-4">
              <Search
                size={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by patient name or prescription number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-500">Loading prescriptions...</p>
              </div>
            ) : filteredPrescriptions.length === 0 ? (
              <div className="text-center py-8">
                <FileText size={48} className="text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No pending prescriptions found</p>
              </div>
            ) : (
              filteredPrescriptions.map((prescription) => (
                <div
                  key={prescription.id}
                  onClick={() => handleSelectPrescription(prescription)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedPrescription?.id === prescription.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 flex items-center gap-2">
                        <User size={16} />
                        {prescription.patient_name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Prescription: {prescription.prescription_number}
                      </p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Calendar size={12} />
                        {new Date(
                          prescription.prescription_date,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Available Medicines */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Pill size={20} />
                Available Medicines
              </h2>
              <button
                onClick={() => setShowMedicineSearch(!showMedicineSearch)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {showMedicineSearch ? "Hide" : "Show"} Search
              </button>
            </div>

            {showMedicineSearch && (
              <div className="relative mb-4">
                <Search
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search medicines..."
                  value={medicineSearchTerm}
                  onChange={(e) => setMedicineSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredMedicines.length === 0 ? (
              <div className="text-center py-8">
                <Pill size={48} className="text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">No medicines found</p>
              </div>
            ) : (
              filteredMedicines.map((medicine) => (
                <div
                  key={medicine.id}
                  className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm">
                        {medicine.name}
                      </h4>
                      {medicine.generic_name && (
                        <p className="text-xs text-gray-600">
                          {medicine.generic_name}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500">
                          {medicine.strength} {medicine.unit}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
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
                    <div className="text-right">
                      <p className="text-sm font-semibold text-blue-600 flex items-center gap-1">
                        <DollarSign size={12} />
                        {medicine.unit_price}
                      </p>
                      <div className="mt-1 flex gap-1">
                        <button
                          onClick={() => handleAddMedicineToCart(medicine)}
                          disabled={(medicine.quantity_available || 0) === 0}
                          className="bg-green-600 text-white px-2 py-1 rounded text-xs hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          <Plus size={10} />
                          Cart
                        </button>
                        <button
                          onClick={() =>
                            handleAddMedicineToDispensing(medicine)
                          }
                          disabled={(medicine.quantity_available || 0) === 0}
                          className="bg-blue-600 text-white px-2 py-1 rounded text-xs hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-1"
                        >
                          <Plus size={10} />
                          Direct
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Medicine Cart */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Package size={20} />
                Medicine Cart ({cartItems.length})
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCart(!showCart)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  {showCart ? "Hide" : "Show"}
                </button>
                {cartItems.length > 0 && (
                  <button
                    onClick={handleClearCart}
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Cart Total */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">
                  Total Amount:
                </span>
                <span className="text-xl font-bold text-blue-600">
                  ${cartTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {showCart && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {cartItems.length === 0 ? (
                <div className="text-center py-8">
                  <Package size={48} className="text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">Cart is empty</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Add medicines from the search
                  </p>
                </div>
              ) : (
                <>
                  {cartItems.map((item, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 text-sm">
                            {item.medicine_name}
                          </h4>
                          {item.generic_name && (
                            <p className="text-xs text-gray-600">
                              {item.generic_name}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            {item.strength} {item.unit} • Stock:{" "}
                            {item.available_stock}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveFromCart(index)}
                          className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                          title="Remove from cart"
                        >
                          <Minus size={14} />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Quantity
                          </label>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdateCartQuantity(index, e.target.value)
                            }
                            max={item.available_stock}
                            min="1"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Unit Price ($)
                          </label>
                          <input
                            type="number"
                            value={item.unit_price}
                            onChange={(e) =>
                              handleUpdateCartPrice(index, e.target.value)
                            }
                            step="0.01"
                            min="0"
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-600">
                            Subtotal:
                          </span>
                          <span className="text-sm font-semibold text-gray-900">
                            ${(item.quantity * item.unit_price).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Cart Actions */}
                  <div className="pt-3 border-t border-gray-200">
                    <button
                      onClick={handleAddCartToDispensing}
                      className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center gap-2"
                    >
                      <CheckCircle size={16} />
                      Add All to Dispensing
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Dispensing Details */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Pill size={20} />
            Dispensing Details
          </h2>

          {selectedPrescription ? (
            <div className="space-y-4">
              {/* Patient Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Patient Information
                </h3>
                <p>
                  <strong>Name:</strong> {selectedPrescription.patient_name}
                </p>
                <p>
                  <strong>Prescription #:</strong>{" "}
                  {selectedPrescription.prescription_number}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(
                    selectedPrescription.prescription_date,
                  ).toLocaleDateString()}
                </p>
              </div>

              {/* Medicines to Dispense */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Medicines to Dispense
                </h3>
                <div className="space-y-3">
                  {dispensingItems.map((item, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900">
                            {item.medicine_name}
                          </span>
                          <button
                            onClick={() =>
                              handleRemoveMedicineFromDispensing(index)
                            }
                            className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                            title="Remove from dispensing"
                          >
                            <Minus size={14} />
                          </button>
                        </div>
                        <span
                          className={`text-sm px-2 py-1 rounded ${
                            item.available_stock > 0
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          Stock: {item.available_stock}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Prescribed Quantity
                          </label>
                          <input
                            type="number"
                            value={item.quantity || 0}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dispense Quantity
                          </label>
                          <input
                            type="number"
                            value={item.dispensed_quantity}
                            onChange={(e) =>
                              handleDispenseQuantityChange(
                                index,
                                e.target.value,
                              )
                            }
                            max={Math.min(
                              item.quantity || 0,
                              item.available_stock,
                            )}
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>

                      {item.dispensed_quantity > item.available_stock && (
                        <div className="mt-2 flex items-center gap-2 text-red-600 text-sm">
                          <AlertTriangle size={16} />
                          Insufficient stock available
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Amount */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">
                    Total Amount:
                  </span>
                  <span className="text-xl font-bold text-blue-600">
                    $
                    {dispensingItems
                      .reduce(
                        (sum, item) =>
                          sum +
                          item.dispensed_quantity * (item.unit_price || 0),
                        0,
                      )
                      .toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Dispense Button */}
              <button
                onClick={handleDispensePrescription}
                disabled={
                  loading ||
                  dispensingItems.some(
                    (item) =>
                      item.dispensed_quantity > item.available_stock ||
                      item.dispensed_quantity <= 0,
                  )
                }
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <CheckCircle size={20} />
                {loading ? "Dispensing..." : "Dispense Prescription"}
              </button>
            </div>
          ) : (
            <div className="text-center py-12">
              <Package size={48} className="text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                Select a prescription to start dispensing
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DrugDispensing;

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { medicinesAPI, salesAPI, prescriptionsAPI } from "../../services/api";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Search,
  Pill,
  DollarSign,
  ShoppingCart,
  Trash2,
  FileText,
} from "lucide-react";

// Import modular components
import PrescriptionCard from "../../components/Pharmacist/PrescriptionCard";
import MedicineCard from "../../components/Pharmacist/MedicineCard";
import CartItem from "../../components/Pharmacist/CartItem";
import PaymentModal from "../../components/Pharmacist/PaymentModal";
import ReceiptModal from "../../components/Pharmacist/ReceiptModal";

const DrugDispensing = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("prescriptions");
  const [pendingPrescriptions, setPendingPrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [prescriptionSearchTerm, setPrescriptionSearchTerm] = useState("");
  const [availableMedicines, setAvailableMedicines] = useState([]);
  const [medicineSearchTerm, setMedicineSearchTerm] = useState("");
  const [cartItems, setCartItems] = useState([]);
  const [showPayment, setShowPayment] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastTransaction, setLastTransaction] = useState(null);

  useEffect(() => {
    fetchAvailableMedicines();
    fetchPendingPrescriptions();
  }, []);

  const fetchAvailableMedicines = async () => {
    try {
      const response = await medicinesAPI.getAll({ limit: 1000 });
      setAvailableMedicines(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch medicines:", error);
    }
  };

  const fetchPendingPrescriptions = async () => {
    try {
      const response = await prescriptionsAPI.getPending();
      setPendingPrescriptions(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch pending prescriptions:", error);
      toast.error("Failed to load pending prescriptions");
    }
  };

  const handleRefillPrescription = async (prescription) => {
    if (
      !prescription.refills_remaining ||
      prescription.refills_remaining <= 0
    ) {
      toast.error(
        "No refills remaining. Patient must see physician for new prescription.",
      );
      return;
    }

    if (
      !window.confirm(
        `Refill prescription ${prescription.prescription_number}?\nRefills remaining: ${prescription.refills_remaining}`,
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      const response = await prescriptionsAPI.refill(prescription.id);
      toast.success(
        `Prescription refilled successfully! New prescription: ${response.data.prescription.prescription_number}`,
      );
      fetchPendingPrescriptions();
    } catch (error) {
      console.error("Failed to refill prescription:", error);
      toast.error(
        error.response?.data?.message || "Failed to refill prescription",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPrescription = async (prescription) => {
    try {
      setLoading(true);
      const response = await prescriptionsAPI.getOne(prescription.id);
      setSelectedPrescription(response.data);

      const prescriptionCart = response.data.items.map((item) => ({
        medicine_id: item.medicine_id,
        medicine_name: item.medicine_name,
        strength: item.strength,
        unit: item.unit,
        quantity: item.quantity_prescribed,
        prescribed_quantity: item.quantity_prescribed,
        available_stock: 999,
        unit_price: 0,
        dosage_instructions: item.dosage_instructions,
        isPrescription: true,
      }));

      for (let item of prescriptionCart) {
        const medicine = availableMedicines.find(
          (m) => m.id === item.medicine_id,
        );
        if (medicine) {
          item.unit_price = medicine.unit_price || 0;
          item.available_stock = medicine.quantity_available || 0;
        }
      }

      setCartItems(prescriptionCart);
      setActiveTab("direct-sale");
      toast.success(`Prescription loaded: ${prescription.prescription_number}`);
    } catch (error) {
      console.error("Failed to load prescription:", error);
      toast.error("Failed to load prescription details");
    } finally {
      setLoading(false);
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

      const saleResponse = await salesAPI.processSale(saleData);

      // If this was from a prescription, mark it as dispensed
      if (selectedPrescription) {
        try {
          const dispensedItems = cartItems
            .map((item) => ({
              prescription_item_id: selectedPrescription.items.find(
                (pi) => pi.medicine_id === item.medicine_id,
              )?.id,
              quantity_dispensed: item.quantity,
            }))
            .filter((item) => item.prescription_item_id); // Only include items that have prescription_item_id

          if (dispensedItems.length > 0) {
            await prescriptionsAPI.dispense(selectedPrescription.id, {
              dispensed_items: dispensedItems,
            });
            toast.success("Prescription marked as dispensed");
          }
        } catch (dispenseError) {
          console.error(
            "Failed to mark prescription as dispensed:",
            dispenseError,
          );
          toast.warning(
            "Sale completed but failed to update prescription status",
          );
        }
      }

      setLastTransaction({
        ...saleData,
        transaction_id: saleResponse.data.sale.sale_number,
        transaction_date: new Date().toISOString(),
        change_amount: 0,
        amount_paid: cartTotal,
      });
      setShowReceipt(true);
      setCartItems([]);
      setSelectedPrescription(null); // Clear selected prescription
      setShowPayment(false);

      fetchPendingPrescriptions(); // Reload pending prescriptions
      fetchAvailableMedicines();
      toast.success("Payment processed successfully!");
    } catch (error) {
      console.error("Payment processing error:", error);
      toast.error(error.response?.data?.message || "Payment processing failed");
    } finally {
      setLoading(false);
    }
  };

  const filteredMedicines = availableMedicines.filter(
    (medicine) =>
      medicine.name.toLowerCase().includes(medicineSearchTerm.toLowerCase()) ||
      (medicine.generic_name &&
        medicine.generic_name
          .toLowerCase()
          .includes(medicineSearchTerm.toLowerCase())),
  );

  const filteredPrescriptions = pendingPrescriptions.filter(
    (rx) =>
      rx.patient_name
        ?.toLowerCase()
        .includes(prescriptionSearchTerm.toLowerCase()) ||
      rx.patient_id_number
        ?.toLowerCase()
        .includes(prescriptionSearchTerm.toLowerCase()) ||
      rx.prescription_number
        ?.toLowerCase()
        .includes(prescriptionSearchTerm.toLowerCase()),
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
                Total: {cartTotal.toFixed(2)} ETB
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-2 mb-6 flex gap-2">
          <button
            onClick={() => setActiveTab("prescriptions")}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === "prescriptions"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <FileText size={20} />
              Pending Prescriptions ({pendingPrescriptions.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab("direct-sale")}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === "direct-sale"
                ? "bg-blue-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <ShoppingCart size={20} />
              Direct Sale / Cart
            </div>
          </button>
        </div>

        {activeTab === "prescriptions" ? (
          /* Pending Prescriptions View */
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4">
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
                  placeholder="Search by patient name, ID, or prescription number..."
                  value={prescriptionSearchTerm}
                  onChange={(e) => setPrescriptionSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {filteredPrescriptions.length === 0 ? (
                <div className="text-center py-12">
                  <FileText size={64} className="text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg font-medium">
                    No pending prescriptions
                  </p>
                  <p className="text-gray-400 text-sm">
                    All prescriptions have been dispensed
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPrescriptions.map((prescription) => (
                    <PrescriptionCard
                      key={prescription.id}
                      prescription={prescription}
                      loading={loading}
                      onDispense={handleSelectPrescription}
                      onRefill={handleRefillPrescription}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Direct Sale / Cart View */
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-6">
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
                      <MedicineCard
                        key={medicine.id}
                        medicine={medicine}
                        onAddToCart={handleAddMedicineToCart}
                      />
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
                          <CartItem
                            key={index}
                            item={item}
                            index={index}
                            onUpdateQuantity={handleUpdateCartQuantity}
                            onUpdatePrice={handleUpdateCartPrice}
                            onRemove={handleRemoveFromCart}
                          />
                        ))}
                      </div>

                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-4">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-bold text-gray-900">
                            Total Amount:
                          </span>
                          <span className="text-2xl font-bold text-blue-600">
                            {cartTotal.toFixed(2)} ETB
                          </span>
                        </div>
                      </div>

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
          </div>
        )}
      </div>

      {/* Modals */}
      <>
        {showPayment && (
          <PaymentModal
            cartItems={cartItems}
            cartTotal={cartTotal}
            loading={loading}
            onClose={() => setShowPayment(false)}
            onProcessPayment={handleProcessPayment}
          />
        )}

        {showReceipt && lastTransaction && (
          <ReceiptModal
            transaction={lastTransaction}
            onClose={() => setShowReceipt(false)}
          />
        )}
      </>
    </div>
  );
};

export default DrugDispensing;

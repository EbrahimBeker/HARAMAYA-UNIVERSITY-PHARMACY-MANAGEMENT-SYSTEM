import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { prescriptionsAPI, medicinesAPI } from "../../services/api";
import { toast } from "react-toastify";
import {
  ArrowLeft, Search, User, Calendar, Pill, CheckCircle, AlertTriangle,
  Package, FileText, Plus, Minus, DollarSign, ShoppingCart, CreditCard,
  Receipt, Trash2, Edit3, Eye, Calculator, X
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
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [amountPaid, setAmountPaid] = useState(0);
  const [customerInfo, setCustomerInfo] = useState({ name: "", phone: "", address: "" });
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
    const existingIndex = cartItems.findIndex(item => item.medicine_id === medicine.id);
    
    if (existingIndex >= 0) {
      setCartItems(prev => prev.map((item, i) => 
        i === existingIndex ? { 
          ...item, 
          quantity: Math.min(item.quantity + 1, item.available_stock)
        } : item
      ));
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
      setCartItems(prev => [...prev, newItem]);
      toast.success(`${medicine.name} added to cart`);
    }
  };
  const handleUpdateCartQuantity = (index, quantity) => {
    const newQuantity = Math.max(0, Math.min(parseInt(quantity) || 0, cartItems[index].available_stock));
    setCartItems(prev => prev.map((item, i) => 
      i === index ? { ...item, quantity: newQuantity } : item
    ));
  };

  const handleUpdateCartPrice = (index, price) => {
    const newPrice = Math.max(0, parseFloat(price) || 0);
    setCartItems(prev => prev.map((item, i) => 
      i === index ? { ...item, unit_price: newPrice } : item
    ));
  };

  const handleRemoveFromCart = (index) => {
    const removedItem = cartItems[index];
    setCartItems(prev => prev.filter((_, i) => i !== index));
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

    if (paymentMethod === "cash" && amountPaid < cartTotal) {
      toast.error("Insufficient payment amount");
      return;
    }

    try {
      setLoading(true);

      const saleData = {
        customer_info: customerInfo,
        payment_method: paymentMethod,
        amount_paid: paymentMethod === "cash" ? amountPaid : cartTotal,
        items: cartItems.map(item => ({
          medicine_id: item.medicine_id,
          medicine_name: item.medicine_name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.quantity * item.unit_price,
        })),
        total_amount: cartTotal,
        change_amount: paymentMethod === "cash" ? Math.max(0, amountPaid - cartTotal) : 0,
        transaction_date: new Date().toISOString(),
        transaction_id: `TXN${Date.now()}`,
      };

      // Simulate API call to process sale and reduce stock
      await new Promise(resolve => setTimeout(resolve, 1000));

      setLastTransaction(saleData);
      setShowReceipt(true);
      setCartItems([]);
      setAmountPaid(0);
      setCustomerInfo({ name: "", phone: "", address: "" });
      setShowPayment(false);
      
      fetchAvailableMedicines();
      toast.success("Payment processed successfully!");
      
    } catch (error) {
      toast.error("Payment processing failed");
    } finally {
      setLoading(false);
    }
  };

  const filteredPrescriptions = prescriptions.filter(
    (prescription) =>
      prescription.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.prescription_number?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredMedicines = availableMedicines.filter(medicine =>
    medicine.name.toLowerCase().includes(medicineSearchTerm.toLowerCase()) ||
    (medicine.generic_name && medicine.generic_name.toLowerCase().includes(medicineSearchTerm.toLowerCase()))
  );

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const changeAmount = paymentMethod === "cash" ? Math.max(0, amountPaid - cartTotal) : 0;
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
                  <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search medicines by name or generic name..."
                    value={medicineSearchTerm}
                    onChange={(e) => setMedicineSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {filteredMedicines.map((m
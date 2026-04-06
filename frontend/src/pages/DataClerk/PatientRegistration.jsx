import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { patientsAPI } from "../../services/api";
import { toast } from "react-toastify";
import PaymentReceipt from "../../components/Common/PaymentReceipt";
import {
  ArrowLeft,
  Save,
  User,
  Phone,
  Heart,
  AlertTriangle,
  DollarSign,
  CreditCard,
} from "lucide-react";

const PatientRegistration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    phone: "",
    email: "",
    address: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    blood_group: "",
    allergies: "",
  });

  const [paymentData, setPaymentData] = useState({
    registration_fee: 100.0, // Default registration fee in ETB
    payment_method: "cash",
    payment_received: false,
    amount_paid: 0,
    change_amount: 0,
  });

  const [showReceipt, setShowReceipt] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate payment if required
    if (!paymentData.payment_received) {
      toast.error("Please process the registration fee payment first");
      return;
    }

    try {
      setLoading(true);

      // Include payment information in patient data
      const patientData = {
        ...formData,
        registration_fee_paid: paymentData.registration_fee,
        payment_method: paymentData.payment_method,
        payment_status: "paid",
      };

      await patientsAPI.create(patientData);
      toast.success("Patient registered successfully with payment processed");
      setShowReceipt(true); // Show receipt instead of navigating immediately
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentData((prev) => {
      const updated = { ...prev, [name]: value };

      // Calculate change if cash payment
      if (name === "amount_paid" && prev.payment_method === "cash") {
        const amountPaid = parseFloat(value) || 0;
        updated.change_amount = Math.max(0, amountPaid - prev.registration_fee);
        updated.payment_received = amountPaid >= prev.registration_fee;
      } else if (name === "payment_method") {
        // For non-cash payments, assume payment is processed
        updated.payment_received = value !== "cash";
        updated.amount_paid = value === "cash" ? 0 : prev.registration_fee;
        updated.change_amount = 0;
      }

      return updated;
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate("/clerk/dashboard")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft size={20} />
          Back to Dashboard
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          Patient Registration
        </h1>
      </div>

      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User size={20} />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date of Birth *
                </label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender *
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Phone size={20} />
              Contact Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="+251911234567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle size={20} />
              Emergency Contact
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact Name
                </label>
                <input
                  type="text"
                  name="emergency_contact_name"
                  value={formData.emergency_contact_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact Phone
                </label>
                <input
                  type="tel"
                  name="emergency_contact_phone"
                  value={formData.emergency_contact_phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Heart size={20} />
              Medical Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Blood Group
                </label>
                <select
                  name="blood_group"
                  value={formData.blood_group}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Known Allergies
                </label>
                <textarea
                  name="allergies"
                  value={formData.allergies}
                  onChange={handleChange}
                  rows={3}
                  placeholder="List any known allergies or medical conditions..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Registration Fee Payment */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign size={20} />
              Registration Fee Payment
            </h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900">
                  Registration Fee:
                </span>
                <span className="text-2xl font-bold text-blue-600">
                  {paymentData.registration_fee.toFixed(2)} ETB
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method *
                </label>
                <select
                  name="payment_method"
                  value={paymentData.payment_method}
                  onChange={handlePaymentChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>

              {paymentData.payment_method === "cash" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount Received *
                  </label>
                  <input
                    type="number"
                    name="amount_paid"
                    value={paymentData.amount_paid}
                    onChange={handlePaymentChange}
                    step="0.01"
                    min={paymentData.registration_fee}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter amount received"
                  />
                </div>
              )}
            </div>

            {paymentData.payment_method === "cash" &&
              paymentData.amount_paid > 0 && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">
                      Change to give:
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      {paymentData.change_amount.toFixed(2)} ETB
                    </span>
                  </div>
                </div>
              )}

            {paymentData.payment_received && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
                <CreditCard className="text-green-600" size={20} />
                <span className="text-green-700 font-medium">
                  Payment processed successfully
                </span>
              </div>
            )}

            {!paymentData.payment_received &&
              paymentData.payment_method === "cash" && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <span className="text-yellow-700 text-sm">
                    Please collect the registration fee before completing
                    registration
                  </span>
                </div>
              )}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t">
            <button
              type="button"
              onClick={() => navigate("/clerk/dashboard")}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !paymentData.payment_received}
              className={`px-6 py-2 rounded-lg flex items-center gap-2 ${
                paymentData.payment_received
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              } disabled:opacity-50`}
            >
              <Save size={18} />
              {loading
                ? "Registering..."
                : paymentData.payment_received
                  ? "Register Patient"
                  : "Payment Required"}
            </button>
          </div>
        </form>
      </div>

      {/* Payment Receipt Modal */}
      <PaymentReceipt
        isOpen={showReceipt}
        onClose={() => {
          setShowReceipt(false);
          navigate("/clerk/patients");
        }}
        patientData={formData}
        paymentData={paymentData}
      />
    </div>
  );
};

export default PatientRegistration;

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
    registration_fee: 50.0,
    payment_method: "cash",
    payment_received: false,
    amount_paid: 0,
    change_amount: 0,
  });

  const [showReceipt, setShowReceipt] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!paymentData.payment_received) {
      toast.error("Please process the registration fee payment first");
      return;
    }

    try {
      setLoading(true);
      
      const patientData = {
        ...formData,
        registration_fee_paid: paymentData.registration_fee,
        payment_method: paymentData.payment_method,
        payment_status: "paid",
      };
      
      await patientsAPI.create(patientData);
      toast.success("Patient registered successfully with payment processed");
      setShowReceipt(true);
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

      if (name === "amount_paid" && prev.payment_method === "cash") {
        const amountPaid = parseFloat(value) || 0;
        updated.change_amount = Math.max(0, amountPaid - prev.registration_fee);
        updated.payment_received = amountPaid >= prev.registration_fee;
      } else if (name === "payment_method") {
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
          onClick={() => navigate("/clerk/dashboard")
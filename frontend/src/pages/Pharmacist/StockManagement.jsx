import { useState, useEffect } from "react";
import { inventoryAPI, medicinesAPI, suppliersAPI } from "../../services/api";
import { toast } from "react-toastify";
import {
  Package,
  Plus,
  Search,
  TrendingUp,
  Calendar,
  DollarSign,
  ShoppingCart,
} from "lucide-react";
import Loading from "../../components/Common/Loading";

const StockManagement = () => {
  const [loading, setLoading] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    medicine_id: "",
    supplier_id: "",
    quantity: "",
    unit_cost: "",
    batch_number: "",
    expiry_date: "",
    notes: "",
  });

  useEffect(() => {
    fetchDat
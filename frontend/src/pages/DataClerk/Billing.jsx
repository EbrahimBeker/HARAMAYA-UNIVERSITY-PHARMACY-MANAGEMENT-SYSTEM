import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { patientsAPI, prescriptionsAPI } from "../../services/api";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Search,
  DollarSign,
  FileText,
  Calendar,
  User,
  Pill,
  CreditCard,
  Receipt,
} from "lucide-react";

const Billing = () => {
  const navigate = useNavigate();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showBillModal, setShowBillModal] = useState(false);
  const [billData, setBillData] = useState({
    amount: 0,
    payment_method: "cash",
    notes: "",
  });

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      const response = await prescriptionsAPI.getAll({
        status: "dispensed",
        include_patient: true,
      });
      setPrescriptions(response.data.data || []);
    } catch (error) {
      toast.error("Failed to load prescriptions");
      console.error("Error loading prescriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBill = (prescription) => {
    setSelectedPrescription(prescription);
    setBillData({
      amount: prescription.total_amount || 0,
      payment_method: "cash",
      notes: "",
    });
    setShowBillModal(true);
  };

  const handleSubmitBill = async (e) => {
    e.preventDefault();
    try {
      // In a real implementation, you would have a billing API endpoint
      toast.success("Bill created successfully");
      setShowBillModal(false);
      setSelectedPrescription(null);
      loadPrescriptions();
    } catch (error) {
      toast.error("Failed to create bill");
    }
  };

  const filteredPrescriptions = prescriptions.filter(
    (prescription) =>
      prescription.patient?.first_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      prescription.patient?.last_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      prescription.patient?.patient_id
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Billing & Invoices
          </h1>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Today's Revenue
                </p>
                <p className="text-2xl font-semibold text-gray-900">0 ETB</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Pending Bills
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {filteredPrescriptions.length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Receipt className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Monthly Total
                </p>
                <p className="text-2xl font-semibold text-gray-900">0 ETB</p>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by patient name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Prescriptions for Billing */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">
              Dispensed Prescriptions - Ready for Billing
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Prescription
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Date Dispensed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPrescriptions.length > 0 ? (
                    filteredPrescriptions.map((prescription) => (
                      <tr key={prescription.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <User className="h-5 w-5 text-blue-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-semibold text-gray-900">
                                {prescription.patient?.first_name}{" "}
                                {prescription.patient?.last_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {prescription.patient?.patient_id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <Pill className="h-4 w-4 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-semibold text-gray-900">
                                Prescription #{prescription.id}
                              </div>
                              <div className="text-sm text-gray-500">
                                {prescription.medicines?.length || 0} medicines
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(
                              prescription.dispensed_at ||
                                prescription.updated_at,
                            ).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {prescription.total_amount || "0.00"} ETB
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleCreateBill(prescription)}
                            className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 flex items-center gap-1 text-sm font-medium"
                          >
                            <CreditCard size={16} />
                            Create Bill
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <span className="text-4xl mb-2 block">💰</span>
                        <p className="text-gray-500">
                          {searchTerm
                            ? "No prescriptions found matching your search"
                            : "No dispensed prescriptions ready for billing"}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Billing Modal */}
      {showBillModal && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Create Bill for {selectedPrescription.patient?.first_name}{" "}
              {selectedPrescription.patient?.last_name}
            </h3>

            <form onSubmit={handleSubmitBill} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (ETB)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={billData.amount}
                  onChange={(e) =>
                    setBillData({
                      ...billData,
                      amount: parseFloat(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={billData.payment_method}
                  onChange={(e) =>
                    setBillData({ ...billData, payment_method: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="insurance">Insurance</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={billData.notes}
                  onChange={(e) =>
                    setBillData({ ...billData, notes: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowBillModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Bill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;

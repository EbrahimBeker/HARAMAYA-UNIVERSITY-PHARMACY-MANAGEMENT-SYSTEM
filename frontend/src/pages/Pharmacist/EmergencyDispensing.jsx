import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  medicinesAPI,
  emergencyDispensingAPI,
  patientsAPI,
} from "../../services/api";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  AlertTriangle,
  Pill,
  User,
  FileText,
  Clock,
  CheckCircle,
  Search,
} from "lucide-react";

const EmergencyDispensing = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [pendingRecords, setPendingRecords] = useState([]);
  const [medicineSearchTerm, setMedicineSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    patient_id_number: "",
    patient_name: "",
    medicine_id: "",
    quantity: 1,
    reason: "",
  });

  useEffect(() => {
    fetchMedicines();
    fetchPendingRecords();
  }, []);

  const fetchMedicines = async () => {
    try {
      const response = await medicinesAPI.getAll({ limit: 1000 });
      setMedicines(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch medicines:", error);
    }
  };

  const fetchPendingRecords = async () => {
    try {
      const response = await emergencyDispensingAPI.getPending();
      setPendingRecords(response.data.data || []);
    } catch (error) {
      console.error("Failed to fetch pending records:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePatientSearch = async () => {
    if (!formData.patient_id_number) {
      toast.error("Please enter patient ID");
      return;
    }

    try {
      const response = await patientsAPI.getAll({
        search: formData.patient_id_number,
        limit: 1,
      });

      if (response.data.data && response.data.data.length > 0) {
        const patient = response.data.data[0];
        setFormData((prev) => ({
          ...prev,
          patient_name: `${patient.first_name} ${patient.last_name}`,
        }));
        toast.success(
          `Patient found: ${patient.first_name} ${patient.last_name}`,
        );
      } else {
        toast.warning("Patient not found. Please enter name manually.");
      }
    } catch (error) {
      console.error("Failed to search patient:", error);
      toast.error("Failed to search patient");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.patient_id_number ||
      !formData.patient_name ||
      !formData.medicine_id ||
      !formData.reason
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    if (
      !window.confirm(
        "⚠️ EMERGENCY DISPENSING\n\n" +
          "This will dispense medicine WITHOUT a prescription.\n" +
          "A physician prescription MUST be created within 48 hours.\n\n" +
          "Continue?",
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      await emergencyDispensingAPI.create(formData);

      toast.success(
        "✅ Emergency dispensing recorded!\n" +
          "⚠️ Physician prescription required within 48 hours.",
        { autoClose: 8000 },
      );

      // Reset form
      setFormData({
        patient_id_number: "",
        patient_name: "",
        medicine_id: "",
        quantity: 1,
        reason: "",
      });

      fetchPendingRecords();
    } catch (error) {
      console.error("Failed to create emergency dispensing:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to record emergency dispensing",
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredMedicines = medicines.filter(
    (medicine) =>
      medicine.name.toLowerCase().includes(medicineSearchTerm.toLowerCase()) ||
      (medicine.generic_name &&
        medicine.generic_name
          .toLowerCase()
          .includes(medicineSearchTerm.toLowerCase())),
  );

  const getTimeElapsedColor = (hours) => {
    if (hours < 24) return "text-green-600";
    if (hours < 48) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
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
                <AlertTriangle className="text-red-600" size={28} />
                Emergency Dispensing
              </h1>
            </div>
            <div className="bg-red-100 text-red-800 px-4 py-2 rounded-lg text-sm font-medium">
              ⚠️ No Prescription Required
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Emergency Dispensing Form */}
          <div className="bg-white rounded-2xl shadow-lg border border-red-200 overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-orange-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <AlertTriangle size={24} />
                Record Emergency Dispensing
              </h2>
            </div>

            <div className="p-6">
              {/* Warning Banner */}
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    className="text-red-600 flex-shrink-0 mt-1"
                    size={24}
                  />
                  <div>
                    <h3 className="font-bold text-red-900 mb-1">
                      Emergency Use Only
                    </h3>
                    <ul className="text-sm text-red-800 space-y-1">
                      <li>• For genuine medical emergencies only</li>
                      <li>• Physician prescription REQUIRED within 48 hours</li>
                      <li>• Document reason thoroughly</li>
                      <li>• Controlled substances NOT allowed</li>
                    </ul>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Patient Information */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient ID *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="patient_id_number"
                      value={formData.patient_id_number}
                      onChange={handleChange}
                      required
                      placeholder="e.g., PAT000001"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    <button
                      type="button"
                      onClick={handlePatientSearch}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Search size={16} />
                      Search
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient Name *
                  </label>
                  <input
                    type="text"
                    name="patient_name"
                    value={formData.patient_name}
                    onChange={handleChange}
                    required
                    placeholder="Full name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                {/* Medicine Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search Medicine *
                  </label>
                  <input
                    type="text"
                    value={medicineSearchTerm}
                    onChange={(e) => setMedicineSearchTerm(e.target.value)}
                    placeholder="Search by name or generic name..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 mb-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Medicine *
                  </label>
                  <select
                    name="medicine_id"
                    value={formData.medicine_id}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="">Select Medicine</option>
                    {filteredMedicines.map((medicine) => (
                      <option key={medicine.id} value={medicine.id}>
                        {medicine.name} {medicine.strength}
                        {medicine.unit} - Stock:{" "}
                        {medicine.quantity_available || 0}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                {/* Emergency Reason */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Reason * (Be specific)
                  </label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    required
                    rows={4}
                    placeholder="Describe the emergency situation in detail..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Include symptoms, urgency level, and why prescription
                    couldn't be obtained first
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 px-6 rounded-lg font-bold hover:from-red-700 hover:to-orange-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  <AlertTriangle size={20} />
                  {loading ? "Recording..." : "Record Emergency Dispensing"}
                </button>
              </form>
            </div>
          </div>

          {/* Pending Emergency Prescriptions */}
          <div className="bg-white rounded-2xl shadow-lg border border-orange-200 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-600 to-yellow-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Clock size={24} />
                Pending Physician Prescriptions ({pendingRecords.length})
              </h2>
            </div>

            <div className="p-6">
              {pendingRecords.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle
                    size={64}
                    className="text-green-300 mx-auto mb-4"
                  />
                  <p className="text-gray-500 text-lg font-medium">
                    No pending emergency dispensing
                  </p>
                  <p className="text-gray-400 text-sm">
                    All records have physician prescriptions
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {pendingRecords.map((record) => (
                    <div
                      key={record.id}
                      className={`border-2 rounded-xl p-4 ${
                        record.hours_elapsed >= 48
                          ? "border-red-300 bg-red-50"
                          : record.hours_elapsed >= 24
                            ? "border-yellow-300 bg-yellow-50"
                            : "border-green-300 bg-green-50"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-gray-900">
                            {record.patient_name}
                          </h3>
                          <p className="text-sm text-gray-600">
                            ID: {record.patient_id_number}
                          </p>
                        </div>
                        <span
                          className={`text-xs font-bold ${getTimeElapsedColor(
                            record.hours_elapsed,
                          )}`}
                        >
                          {record.hours_elapsed}h ago
                        </span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">
                            Medicine:
                          </span>
                          <span className="ml-2 text-gray-900">
                            {record.medicine_name} {record.strength}
                            {record.unit}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">
                            Quantity:
                          </span>
                          <span className="ml-2 text-gray-900">
                            {record.quantity}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">
                            Pharmacist:
                          </span>
                          <span className="ml-2 text-gray-900">
                            {record.pharmacist_name}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">
                            Reason:
                          </span>
                          <p className="mt-1 text-gray-900 bg-white p-2 rounded border">
                            {record.reason}
                          </p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">
                            Date:
                          </span>
                          <span className="ml-2 text-gray-900">
                            {new Date(record.dispensed_date).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {record.hours_elapsed >= 48 && (
                        <div className="mt-3 bg-red-100 border border-red-300 rounded p-2 text-xs text-red-800 font-medium">
                          ⚠️ URGENT: 48-hour deadline exceeded! Physician
                          prescription required immediately.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyDispensing;

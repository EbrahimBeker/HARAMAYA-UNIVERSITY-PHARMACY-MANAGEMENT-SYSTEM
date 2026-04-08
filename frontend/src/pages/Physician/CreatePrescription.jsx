import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { patientsAPI, medicinesAPI } from "../../services/api";
import { toast } from "react-toastify";
import {
  Save,
  Plus,
  Trash2,
  User,
  Pill,
  FileText,
  AlertTriangle,
  Printer,
} from "lucide-react";
import axios from "axios";

const CreatePrescription = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get("patientId");

  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [formData, setFormData] = useState({
    patient_id: patientId || "",
    diagnosis: "",
    prescription_date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const [prescriptionItems, setPrescriptionItems] = useState([
    {
      medicine_id: "",
      quantity: 1,
      dosage: "",
      frequency: "",
      duration: "",
      instructions: "",
    },
  ]);

  useEffect(() => {
    loadMedicines();
    if (patientId) {
      loadPatient(patientId);
    }
  }, [patientId]);

  const loadPatient = async (id) => {
    try {
      const response = await patientsAPI.getOne(id);
      setPatient(response.data);
      setFormData((prev) => ({ ...prev, patient_id: id }));
    } catch (error) {
      toast.error("Failed to load patient details");
    }
  };

  const loadMedicines = async () => {
    try {
      const response = await medicinesAPI.getAll({ limit: 1000 });
      setMedicines(response.data.data || []);
    } catch (error) {
      console.error("Failed to load medicines:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...prescriptionItems];
    newItems[index][field] = value;
    setPrescriptionItems(newItems);
  };

  const addMedicine = () => {
    setPrescriptionItems([
      ...prescriptionItems,
      {
        medicine_id: "",
        quantity: 1,
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
      },
    ]);
  };

  const removeMedicine = (index) => {
    if (prescriptionItems.length > 1) {
      const newItems = prescriptionItems.filter((_, i) => i !== index);
      setPrescriptionItems(newItems);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.patient_id) {
      toast.error("Please select a patient");
      return;
    }

    if (!formData.diagnosis) {
      toast.error("Please enter diagnosis");
      return;
    }

    const validItems = prescriptionItems.filter((item) => item.medicine_id);
    if (validItems.length === 0) {
      toast.error("Please add at least one medicine");
      return;
    }

    try {
      setLoading(true);

      const prescriptionData = {
        ...formData,
        patient_id: parseInt(formData.patient_id),
        items: validItems.map((item) => ({
          medicine_id: parseInt(item.medicine_id),
          quantity: parseInt(item.quantity),
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          instructions: item.instructions || "",
        })),
      };

      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/prescriptions`,
        prescriptionData,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      toast.success("Prescription created successfully");
      navigate("/physician/dashboard");
    } catch (error) {
      console.error("Error creating prescription:", error);
      toast.error(
        error.response?.data?.message || "Failed to create prescription",
      );
    } finally {
      setLoading(false);
    }
  };

  const getMedicineName = (medicineId) => {
    const medicine = medicines.find((m) => m.id === parseInt(medicineId));
    return medicine
      ? `${medicine.name} ${medicine.strength}${medicine.unit}`
      : "";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Create Prescription
          </h1>
          <p className="text-gray-600 mt-1">
            Write a new prescription for patient
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User size={20} />
              Patient Information
            </h2>

            {patient ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Patient Name</p>
                    <p className="font-semibold text-gray-900">
                      {patient.first_name} {patient.last_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Patient ID</p>
                    <p className="font-semibold text-gray-900">
                      {patient.patient_id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Age/Gender</p>
                    <p className="font-semibold text-gray-900">
                      {new Date().getFullYear() -
                        new Date(patient.date_of_birth).getFullYear()}{" "}
                      years / {patient.gender}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Blood Group</p>
                    <p className="font-semibold text-gray-900">
                      {patient.blood_group || "N/A"}
                    </p>
                  </div>
                  {patient.allergies && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <AlertTriangle size={14} className="text-red-500" />
                        Allergies
                      </p>
                      <p className="font-semibold text-red-600">
                        {patient.allergies}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient ID *
                </label>
                <input
                  type="text"
                  name="patient_id"
                  value={formData.patient_id}
                  onChange={handleChange}
                  required
                  placeholder="Enter patient ID (e.g., PAT000001)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter patient ID and press Tab to load patient details
                </p>
              </div>
            )}
          </div>

          {/* Diagnosis */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={20} />
              Diagnosis
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diagnosis *
                </label>
                <textarea
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleChange}
                  required
                  rows={3}
                  placeholder="Enter diagnosis details..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prescription Date *
                </label>
                <input
                  type="date"
                  name="prescription_date"
                  value={formData.prescription_date}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes (Optional)
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Any additional notes or special instructions..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Medicines */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Pill size={20} />
                Prescribed Medicines
              </h2>
              <button
                type="button"
                onClick={addMedicine}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
              >
                <Plus size={16} />
                Add Medicine
              </button>
            </div>

            <div className="space-y-4">
              {prescriptionItems.map((item, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 relative"
                >
                  {prescriptionItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMedicine(index)}
                      className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Medicine *
                      </label>
                      <select
                        value={item.medicine_id}
                        onChange={(e) =>
                          handleItemChange(index, "medicine_id", e.target.value)
                        }
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Medicine</option>
                        {medicines.map((medicine) => (
                          <option key={medicine.id} value={medicine.id}>
                            {medicine.name} {medicine.strength}
                            {medicine.unit} - {medicine.form}
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
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(index, "quantity", e.target.value)
                        }
                        min="1"
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dosage *
                      </label>
                      <input
                        type="text"
                        value={item.dosage}
                        onChange={(e) =>
                          handleItemChange(index, "dosage", e.target.value)
                        }
                        required
                        placeholder="e.g., 1 tablet"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Frequency *
                      </label>
                      <select
                        value={item.frequency}
                        onChange={(e) =>
                          handleItemChange(index, "frequency", e.target.value)
                        }
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Frequency</option>
                        <option value="Once daily">Once daily</option>
                        <option value="Twice daily">Twice daily</option>
                        <option value="3 times daily">3 times daily</option>
                        <option value="4 times daily">4 times daily</option>
                        <option value="Every 4 hours">Every 4 hours</option>
                        <option value="Every 6 hours">Every 6 hours</option>
                        <option value="Every 8 hours">Every 8 hours</option>
                        <option value="As needed">As needed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration *
                      </label>
                      <input
                        type="text"
                        value={item.duration}
                        onChange={(e) =>
                          handleItemChange(index, "duration", e.target.value)
                        }
                        required
                        placeholder="e.g., 7 days"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Instructions (Optional)
                      </label>
                      <input
                        type="text"
                        value={item.instructions}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "instructions",
                            e.target.value,
                          )
                        }
                        placeholder="e.g., Take after meals"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/physician/dashboard")}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={18} />
              {loading ? "Creating..." : "Create Prescription"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePrescription;

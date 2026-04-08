import { useState, useEffect } from "react";
import { diagnosesAPI, patientsAPI } from "../../services/api";
import { Search, Plus, FileText } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Diagnoses = () => {
  const navigate = useNavigate();
  const [diagnoses, setDiagnoses] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState(null);
  const [formData, setFormData] = useState({
    patient_id: "",
    diagnosis_date: new Date().toISOString().split("T")[0],
    symptoms: "",
    vital_signs: {
      temperature: "",
      blood_pressure: "",
      pulse: "",
      respiratory_rate: "",
    },
    diagnosis: "",
    notes: "",
  });

  useEffect(() => {
    loadDiagnoses();
    loadPatients();
  }, []);

  const loadDiagnoses = async () => {
    try {
      setLoading(true);
      const response = await diagnosesAPI.getAll();
      setDiagnoses(response.data.data || response.data || []);
    } catch (error) {
      console.error("Failed to load diagnoses:", error);
      toast.error("Failed to load diagnoses");
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const response = await patientsAPI.getAll();
      setPatients(response.data.data || response.data || []);
    } catch (error) {
      console.error("Failed to load patients:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await diagnosesAPI.create(formData);
      toast.success("Diagnosis created successfully");
      setShowCreateModal(false);
      resetForm();
      loadDiagnoses();
    } catch (error) {
      console.error("Failed to create diagnosis:", error);
      toast.error(
        error.response?.data?.message || "Failed to create diagnosis",
      );
    }
  };

  const resetForm = () => {
    setFormData({
      patient_id: "",
      diagnosis_date: new Date().toISOString().split("T")[0],
      symptoms: "",
      vital_signs: {
        temperature: "",
        blood_pressure: "",
        pulse: "",
        respiratory_rate: "",
      },
      diagnosis: "",
      notes: "",
    });
  };

  const viewDetails = (diagnosis) => {
    setSelectedDiagnosis(diagnosis);
  };

  const createPrescription = (diagnosis) => {
    // Navigate to create prescription with diagnosis_id and patient_id
    navigate(
      `/physician/prescriptions/new?patientId=${diagnosis.patient_id}&diagnosisId=${diagnosis.id}`,
    );
  };

  const filteredDiagnoses = diagnoses.filter(
    (diagnosis) =>
      diagnosis.patient_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      diagnosis.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      diagnosis.symptoms?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Diagnoses</h1>
              <p className="text-gray-600 mt-1">
                View and manage patient diagnoses
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
            >
              <Plus size={20} />
              New Diagnosis
            </button>
          </div>

          {/* Search */}
          <div className="mt-6">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by patient name, diagnosis, or symptoms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Diagnoses List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading diagnoses...</p>
            </div>
          ) : filteredDiagnoses.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Symptoms
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Diagnosis
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredDiagnoses.map((diagnosis) => (
                    <tr key={diagnosis.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(
                          diagnosis.diagnosis_date,
                        ).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {diagnosis.patient_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {diagnosis.symptoms}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {diagnosis.diagnosis}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => viewDetails(diagnosis)}
                            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                          >
                            View
                          </button>
                          <button
                            onClick={() => createPrescription(diagnosis)}
                            className="flex items-center gap-1 text-green-600 hover:text-green-700 font-medium text-sm"
                          >
                            <FileText size={16} />
                            Prescribe
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="text-4xl mb-2 block">🩺</span>
              <p className="text-gray-500">No diagnoses found</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Diagnosis Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h2 className="text-2xl font-bold">New Diagnosis</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  resetForm();
                }}
                className="text-white hover:text-gray-200"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Patient *
                </label>
                <select
                  value={formData.patient_id}
                  onChange={(e) =>
                    setFormData({ ...formData, patient_id: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Patient</option>
                  {patients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.first_name} {patient.last_name} -{" "}
                      {patient.patient_id}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diagnosis Date *
                </label>
                <input
                  type="date"
                  value={formData.diagnosis_date}
                  onChange={(e) =>
                    setFormData({ ...formData, diagnosis_date: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Symptoms *
                </label>
                <textarea
                  value={formData.symptoms}
                  onChange={(e) =>
                    setFormData({ ...formData, symptoms: e.target.value })
                  }
                  required
                  rows={3}
                  placeholder="Patient's symptoms..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Vital Signs */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-gray-900">
                  Vital Signs (Optional)
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Temperature (°C)
                    </label>
                    <input
                      type="text"
                      value={formData.vital_signs.temperature}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vital_signs: {
                            ...formData.vital_signs,
                            temperature: e.target.value,
                          },
                        })
                      }
                      placeholder="37.0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Blood Pressure
                    </label>
                    <input
                      type="text"
                      value={formData.vital_signs.blood_pressure}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vital_signs: {
                            ...formData.vital_signs,
                            blood_pressure: e.target.value,
                          },
                        })
                      }
                      placeholder="120/80"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Pulse (bpm)
                    </label>
                    <input
                      type="text"
                      value={formData.vital_signs.pulse}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vital_signs: {
                            ...formData.vital_signs,
                            pulse: e.target.value,
                          },
                        })
                      }
                      placeholder="72"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Respiratory Rate
                    </label>
                    <input
                      type="text"
                      value={formData.vital_signs.respiratory_rate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          vital_signs: {
                            ...formData.vital_signs,
                            respiratory_rate: e.target.value,
                          },
                        })
                      }
                      placeholder="16"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diagnosis *
                </label>
                <textarea
                  value={formData.diagnosis}
                  onChange={(e) =>
                    setFormData({ ...formData, diagnosis: e.target.value })
                  }
                  required
                  rows={3}
                  placeholder="Medical diagnosis..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={2}
                  placeholder="Additional notes..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg"
                >
                  Create Diagnosis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedDiagnosis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h2 className="text-2xl font-bold">Diagnosis Details</h2>
              <button
                onClick={() => setSelectedDiagnosis(null)}
                className="text-white hover:text-gray-200"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">
                    Patient
                  </label>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {selectedDiagnosis.patient_name}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase">
                    Date
                  </label>
                  <p className="text-sm text-gray-700 mt-1">
                    {new Date(
                      selectedDiagnosis.diagnosis_date,
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  Symptoms
                </label>
                <p className="text-sm text-gray-900 mt-1">
                  {selectedDiagnosis.symptoms}
                </p>
              </div>

              {selectedDiagnosis.vital_signs && (
                <div className="bg-green-50 rounded-lg p-4">
                  <label className="text-xs font-semibold text-gray-500 uppercase mb-2 block">
                    Vital Signs
                  </label>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {typeof selectedDiagnosis.vital_signs === "string" ? (
                      (() => {
                        try {
                          const vitals = JSON.parse(
                            selectedDiagnosis.vital_signs,
                          );
                          return (
                            <>
                              {vitals.temperature && (
                                <p>
                                  <span className="font-medium">
                                    Temperature:
                                  </span>{" "}
                                  {vitals.temperature}°C
                                </p>
                              )}
                              {vitals.blood_pressure && (
                                <p>
                                  <span className="font-medium">
                                    Blood Pressure:
                                  </span>{" "}
                                  {vitals.blood_pressure}
                                </p>
                              )}
                              {vitals.pulse && (
                                <p>
                                  <span className="font-medium">Pulse:</span>{" "}
                                  {vitals.pulse} bpm
                                </p>
                              )}
                              {vitals.respiratory_rate && (
                                <p>
                                  <span className="font-medium">
                                    Respiratory Rate:
                                  </span>{" "}
                                  {vitals.respiratory_rate}
                                </p>
                              )}
                            </>
                          );
                        } catch {
                          return (
                            <p className="text-gray-500">
                              No vital signs recorded
                            </p>
                          );
                        }
                      })()
                    ) : (
                      <p className="text-gray-500">No vital signs recorded</p>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-purple-50 rounded-lg p-4">
                <label className="text-xs font-semibold text-gray-500 uppercase">
                  Diagnosis
                </label>
                <p className="text-sm text-gray-900 mt-1">
                  {selectedDiagnosis.diagnosis}
                </p>
              </div>

              {selectedDiagnosis.notes && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <label className="text-xs font-semibold text-gray-500 uppercase">
                    Notes
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedDiagnosis.notes}
                  </p>
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-end rounded-b-xl">
              <button
                onClick={() => setSelectedDiagnosis(null)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Diagnoses;

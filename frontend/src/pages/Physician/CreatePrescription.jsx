import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  patientsAPI,
  medicinesAPI,
  prescriptionsAPI,
  diagnosesAPI,
} from "../../services/api";
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
  Search,
} from "lucide-react";

const CreatePrescription = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get("patientId");
  const diagnosisId = searchParams.get("diagnosisId");

  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState(null);
  const [diagnosis, setDiagnosis] = useState(null);
  const [patientPrescriptions, setPatientPrescriptions] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [createdPrescription, setCreatedPrescription] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: patientId || "",
    diagnosis_id: diagnosisId || "",
    prescription_date: new Date().toISOString().split("T")[0],
    notes: "",
    refills_allowed: 0,
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
    if (diagnosisId) {
      loadDiagnosis(diagnosisId);
    }
  }, [patientId, diagnosisId]);

  const loadPatient = async (id) => {
    try {
      setLoading(true);
      setSearchResults([]); // Clear previous search results

      // Check if it's a numeric ID (direct database ID)
      if (!isNaN(id) && Number.isInteger(Number(id))) {
        // Load by numeric id
        const response = await patientsAPI.getOne(id);
        setPatient(response.data);
        setFormData((prev) => ({ ...prev, patient_id: id }));
        toast.success(
          `Patient loaded: ${response.data.first_name} ${response.data.last_name}`,
        );
        // Load patient prescription history
        if (response.data.patient_id) {
          loadPatientPrescriptions(response.data.patient_id);
        }
        return;
      }

      // Otherwise, search by patient_id or name
      const searchResponse = await patientsAPI.getAll({
        search: id,
        limit: 100,
      });

      console.log("Search response:", searchResponse.data);

      if (searchResponse.data.data && searchResponse.data.data.length > 0) {
        const results = searchResponse.data.data;

        // If search term starts with PAT, try to find exact patient_id match
        if (id.toString().toUpperCase().startsWith("PAT")) {
          const exactMatch = results.find(
            (p) => p.patient_id === id.toUpperCase(),
          );

          if (exactMatch) {
            setPatient(exactMatch);
            setFormData((prev) => ({
              ...prev,
              patient_id: exactMatch.id.toString(),
            }));
            toast.success(
              `Patient loaded: ${exactMatch.first_name} ${exactMatch.last_name}`,
            );
            // Load patient prescription history
            if (exactMatch.patient_id) {
              loadPatientPrescriptions(exactMatch.patient_id);
            }
            return;
          }
        }

        // If only one result, use it
        if (results.length === 1) {
          const foundPatient = results[0];
          setPatient(foundPatient);
          setFormData((prev) => ({
            ...prev,
            patient_id: foundPatient.id.toString(),
          }));
          toast.success(
            `Patient loaded: ${foundPatient.first_name} ${foundPatient.last_name}`,
          );
          // Load patient prescription history
          if (foundPatient.patient_id) {
            loadPatientPrescriptions(foundPatient.patient_id);
          }
        } else {
          // Multiple results - show selection list
          setSearchResults(results);
          toast.info(`Found ${results.length} patients. Please select one.`);
        }
      } else {
        toast.error(`No patient found matching "${id}"`);
        setPatient(null);
      }
    } catch (error) {
      console.error("Error loading patient:", error);
      toast.error(
        error.response?.data?.message || "Failed to load patient details",
      );
      setPatient(null);
    } finally {
      setLoading(false);
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

  const loadDiagnosis = async (id) => {
    try {
      const response = await diagnosesAPI.getOne(id);
      setDiagnosis(response.data);
      setFormData((prev) => ({ ...prev, diagnosis_id: id }));
      toast.success("Diagnosis loaded");
    } catch (error) {
      console.error("Failed to load diagnosis:", error);
      toast.error("Failed to load diagnosis details");
    }
  };

  const loadPatientPrescriptions = async (patientIdNumber) => {
    try {
      const response =
        await prescriptionsAPI.getPatientHistory(patientIdNumber);
      setPatientPrescriptions(response.data.data || []);
    } catch (error) {
      console.error("Failed to load patient prescriptions:", error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePatientIdChange = (e) => {
    const value = e.target.value;
    setFormData({
      ...formData,
      patient_id: value,
    });
    // Clear search results when user types
    if (searchResults.length > 0) {
      setSearchResults([]);
    }
  };

  const handlePatientIdKeyDown = async (e) => {
    if (e.key === "Tab" || e.key === "Enter") {
      e.preventDefault();
      const searchValue = formData.patient_id?.trim();
      if (searchValue && !patient) {
        await loadPatient(searchValue);
      }
    }
  };

  const handleSearchClick = async () => {
    const searchValue = formData.patient_id?.trim();
    if (searchValue) {
      await loadPatient(searchValue);
    }
  };

  const selectPatient = (selectedPatient) => {
    setPatient(selectedPatient);
    setFormData((prev) => ({
      ...prev,
      patient_id: selectedPatient.id.toString(),
    }));
    setSearchResults([]);
    toast.success(
      `Patient selected: ${selectedPatient.first_name} ${selectedPatient.last_name}`,
    );
  };

  const searchPatientByName = async (searchTerm) => {
    try {
      const response = await patientsAPI.getAll({
        search: searchTerm,
        limit: 10,
      });
      return response.data.data || [];
    } catch (error) {
      console.error("Failed to search patients:", error);
      return [];
    }
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

    if (!formData.diagnosis_id) {
      toast.error(
        "Please create a diagnosis first before prescribing medicines",
      );
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
        refills_allowed: parseInt(formData.refills_allowed),
        items: validItems.map((item) => ({
          medicine_id: parseInt(item.medicine_id),
          quantity: parseInt(item.quantity),
          dosage: item.dosage,
          frequency: item.frequency,
          duration: item.duration,
          instructions: item.instructions || "",
        })),
      };

      const response = await prescriptionsAPI.create(prescriptionData);

      setCreatedPrescription({
        ...response.data.prescription,
        patient: patient,
        items: validItems.map((item) => ({
          ...item,
          medicine_name: getMedicineName(item.medicine_id),
        })),
      });

      toast.success("✅ Prescription created successfully!", {
        autoClose: 6000,
      });
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

  const handlePrint = () => {
    window.print();
  };

  const handleClose = () => {
    navigate("/physician/dashboard");
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
                  Patient ID or Name *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="patient_id"
                    value={formData.patient_id}
                    onChange={handlePatientIdChange}
                    onKeyDown={handlePatientIdKeyDown}
                    required
                    placeholder="Enter patient ID (e.g., PAT000001) or name"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handleSearchClick}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                  >
                    <Search size={16} />
                    {loading ? "Searching..." : "Search"}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Enter patient ID (e.g., PAT000001) or patient name, then press
                  Tab/Enter or click Search
                </p>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="mt-4 border border-blue-200 rounded-lg bg-blue-50 p-4">
                    <p className="text-sm font-semibold text-gray-900 mb-3">
                      Select a patient from the results:
                    </p>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {searchResults.map((result) => (
                        <button
                          key={result.id}
                          type="button"
                          onClick={() => selectPatient(result)}
                          className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold text-gray-900">
                                {result.first_name} {result.last_name}
                              </p>
                              <p className="text-sm text-gray-600">
                                ID: {result.patient_id} | Phone: {result.phone}
                              </p>
                              <p className="text-xs text-gray-500">
                                {result.gender} |{" "}
                                {new Date().getFullYear() -
                                  new Date(
                                    result.date_of_birth,
                                  ).getFullYear()}{" "}
                                years old
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Diagnosis Display */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={20} />
              Diagnosis
            </h2>

            {diagnosis ? (
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <label className="text-xs font-semibold text-gray-500 uppercase">
                    Symptoms
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {diagnosis.symptoms}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <label className="text-xs font-semibold text-gray-500 uppercase">
                    Diagnosis
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {diagnosis.diagnosis}
                  </p>
                </div>
                {diagnosis.notes && (
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <label className="text-xs font-semibold text-gray-500 uppercase">
                      Notes
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {diagnosis.notes}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <FileText size={48} className="mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600 mb-4">
                  No diagnosis selected. Please create a diagnosis first.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/diagnoses")}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  <Plus size={20} />
                  Create Diagnosis
                </button>
              </div>
            )}

            <div className="space-y-4 mt-4">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Refills Allowed
                </label>
                <select
                  name="refills_allowed"
                  value={formData.refills_allowed}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="0">No Refills</option>
                  <option value="1">1 Refill</option>
                  <option value="2">2 Refills</option>
                  <option value="3">3 Refills</option>
                  <option value="6">6 Refills</option>
                  <option value="12">12 Refills (Chronic Medication)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Allow patient to refill this prescription without seeing
                  physician again
                </p>
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

        {/* Patient Prescription History */}
        {patient && (
          <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText size={20} />
                Patient Prescription History
              </h2>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                {showHistory ? "Hide" : "Show"} History (
                {patientPrescriptions.length})
              </button>
            </div>

            {showHistory && (
              <div className="space-y-3">
                {patientPrescriptions.length > 0 ? (
                  patientPrescriptions.map((prescription) => (
                    <div
                      key={prescription.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="font-mono text-sm font-semibold text-blue-600">
                              {prescription.prescription_number}
                            </span>
                            <span
                              className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                prescription.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : prescription.status === "completed"
                                    ? "bg-green-100 text-green-800"
                                    : prescription.status === "partial"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-red-100 text-red-800"
                              }`}
                            >
                              {prescription.status.charAt(0).toUpperCase() +
                                prescription.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            <span className="font-medium">Date:</span>{" "}
                            {new Date(
                              prescription.prescription_date,
                            ).toLocaleDateString()}
                          </p>
                          {prescription.diagnosis && (
                            <p className="text-sm text-gray-600 mb-1">
                              <span className="font-medium">Diagnosis:</span>{" "}
                              {prescription.diagnosis}
                            </p>
                          )}
                          {prescription.refills_remaining > 0 && (
                            <p className="text-sm text-green-600">
                              <span className="font-medium">Refills:</span>{" "}
                              {prescription.refills_remaining} remaining
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText
                      size={48}
                      className="mx-auto mb-2 text-gray-300"
                    />
                    <p>No previous prescriptions found for this patient</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Success Modal */}
        {createdPrescription && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    ✅ Prescription Created Successfully!
                  </h2>
                  <p className="text-gray-600">
                    Prescription #{createdPrescription.prescription_number}
                  </p>
                </div>

                {/* Prescription Details */}
                <div className="space-y-4 mb-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Patient Information
                    </h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Name:</span>
                        <span className="ml-2 font-medium">
                          {createdPrescription.patient?.first_name}{" "}
                          {createdPrescription.patient?.last_name}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">ID:</span>
                        <span className="ml-2 font-medium">
                          {createdPrescription.patient?.patient_id}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      <h3 className="font-semibold text-gray-900">
                        Prescription Status
                      </h3>
                    </div>
                    <p className="text-sm">
                      <span className="font-medium text-yellow-700">
                        ✅ Status: Pending
                      </span>
                      <span className="text-gray-600 ml-2">
                        - Awaiting pharmacy dispensing
                      </span>
                    </p>
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Prescribed Medicines
                    </h3>
                    <div className="space-y-2">
                      {createdPrescription.items?.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between text-sm bg-white p-2 rounded"
                        >
                          <span className="font-medium">
                            {item.medicine_name}
                          </span>
                          <span className="text-gray-600">
                            Qty: {item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Next Steps */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🎯</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-2">
                        Next Steps - Medicine Dispensing
                      </h3>
                      <div className="space-y-2 text-sm text-gray-700">
                        <div className="flex items-start gap-2">
                          <span className="font-semibold text-blue-600 min-w-[20px]">
                            1.
                          </span>
                          <p>
                            <span className="font-semibold">
                              Print prescription
                            </span>{" "}
                            and give to patient
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="font-semibold text-blue-600 min-w-[20px]">
                            2.
                          </span>
                          <p>
                            Patient takes prescription to{" "}
                            <span className="font-semibold text-purple-600">
                              Pharmacy
                            </span>
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="font-semibold text-blue-600 min-w-[20px]">
                            3.
                          </span>
                          <p>
                            Pharmacist will:
                            <span className="block ml-4 mt-1">
                              • View pending prescription in Drug Dispensing
                            </span>
                            <span className="block ml-4">
                              • Verify medicine availability
                            </span>
                            <span className="block ml-4">
                              • Dispense medicines to patient
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handlePrint}
                    className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 font-medium"
                  >
                    <Printer size={20} />
                    Print Prescription
                  </button>
                  <button
                    onClick={handleClose}
                    className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePrescription;

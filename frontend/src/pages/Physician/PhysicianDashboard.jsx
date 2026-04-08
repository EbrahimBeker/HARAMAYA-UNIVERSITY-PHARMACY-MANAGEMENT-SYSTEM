import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { reportsAPI, prescriptionsAPI } from "../../services/api";

const PhysicianDashboard = () => {
  const [stats, setStats] = useState({});
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [permissionError, setPermissionError] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load dashboard stats first
      const statsResponse = await reportsAPI.getDashboard();
      setStats(statsResponse.data);

      // Try to load prescriptions, but handle errors gracefully
      try {
        console.log("Fetching prescriptions...");
        const prescriptionsResponse = await prescriptionsAPI.getAll({
          limit: 5,
        });
        console.log("Prescriptions response:", prescriptionsResponse);
        console.log("Prescriptions data:", prescriptionsResponse.data);
        const prescriptions = prescriptionsResponse.data.data || [];
        console.log("Setting prescriptions array:", prescriptions);
        console.log("Array length:", prescriptions.length);
        setRecentPrescriptions(prescriptions);
        setPermissionError(false);
      } catch (prescriptionError) {
        console.error("Could not load prescriptions:", prescriptionError);
        console.error("Error details:", prescriptionError.response?.data);

        // Check if it's a permission error
        if (prescriptionError.response?.status === 403) {
          setPermissionError(true);
        }

        // Set empty array if prescriptions can't be loaded
        setRecentPrescriptions([]);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      console.error("Error details:", error.response?.data);
      // Set default empty stats if dashboard fails
      setStats({});
      setRecentPrescriptions([]);
    } finally {
      setLoading(false);
    }
  };

  const viewPrescriptionDetails = async (prescriptionId) => {
    try {
      const response = await prescriptionsAPI.getOne(prescriptionId);
      setSelectedPrescription(response.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error("Failed to load prescription details:", error);
      alert("Failed to load prescription details");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <div
              className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-purple-600 rounded-full animate-spin mx-auto"
              style={{
                animationDirection: "reverse",
                animationDuration: "1.5s",
              }}
            ></div>
          </div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  console.log("Rendering with prescriptions:", recentPrescriptions);
  console.log("Prescription count:", recentPrescriptions.length);
  console.log("Permission error:", permissionError);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with Inline Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Physician Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Patient diagnosis and prescription management
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">System Online</span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {stats.total_patients || 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">Total Patients</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {stats.todays_prescriptions || 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Today's Prescriptions
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">0</p>
              <p className="text-xs text-gray-600 mt-1">
                This Week's Diagnoses
              </p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">
                {stats.pending_prescriptions || 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">Pending</p>
            </div>
          </div>
        </div>

        {/* Recent Prescriptions Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">
              Recent Prescriptions
            </h2>
            <Link
              to="/reports"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All →
            </Link>
          </div>
          <div className="overflow-x-auto">
            {permissionError ? (
              <div className="text-center py-12 px-6">
                <div className="max-w-md mx-auto">
                  <span className="text-4xl mb-4 block">🔒</span>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Permission Error
                  </h3>
                  <p className="text-gray-600 mb-4">
                    You don't have permission to view prescriptions. This might
                    be because your session is outdated.
                  </p>
                  <button
                    onClick={() => {
                      localStorage.clear();
                      window.location.href = "/login";
                    }}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Log Out and Log Back In
                  </button>
                </div>
              </div>
            ) : recentPrescriptions.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Prescription #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentPrescriptions.map((prescription) => (
                    <tr key={prescription.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono font-semibold text-blue-600">
                          {prescription.prescription_number}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                        {prescription.patient_name}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(
                          prescription.prescription_date,
                        ).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
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
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() =>
                            viewPrescriptionDetails(prescription.id)
                          }
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <span className="text-4xl mb-2 block">📝</span>
                <p className="text-gray-500 mb-4">
                  No prescriptions created yet
                </p>
                <Link
                  to="/medicines"
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Browse Medicines
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prescription Detail Modal */}
      {showDetailModal && selectedPrescription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between rounded-t-xl">
              <div>
                <h2 className="text-2xl font-bold">Prescription Details</h2>
                <p className="text-blue-100 text-sm mt-1">
                  {selectedPrescription.prescription_number}
                </p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-white hover:text-gray-200 transition-colors"
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

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Patient & Prescription Info */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">
                      Patient Name
                    </label>
                    <p className="text-lg font-semibold text-gray-900 mt-1">
                      {selectedPrescription.patient_name}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">
                      Patient ID
                    </label>
                    <p className="text-sm text-gray-700 mt-1">
                      {selectedPrescription.patient_id_number || "N/A"}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">
                      Physician
                    </label>
                    <p className="text-sm text-gray-700 mt-1">
                      {selectedPrescription.physician_name}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">
                      Prescription Date
                    </label>
                    <p className="text-sm text-gray-700 mt-1">
                      {new Date(
                        selectedPrescription.prescription_date,
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">
                      Status
                    </label>
                    <div className="mt-1">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          selectedPrescription.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : selectedPrescription.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : selectedPrescription.status === "partial"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-red-100 text-red-800"
                        }`}
                      >
                        {selectedPrescription.status.charAt(0).toUpperCase() +
                          selectedPrescription.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-gray-500 uppercase">
                      Refills
                    </label>
                    <p className="text-sm text-gray-700 mt-1">
                      {selectedPrescription.refills_remaining || 0} of{" "}
                      {selectedPrescription.refills_allowed || 0} remaining
                    </p>
                  </div>
                </div>
              </div>

              {/* Diagnosis */}
              {selectedPrescription.diagnosis && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <label className="text-xs font-semibold text-gray-500 uppercase">
                    Diagnosis
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedPrescription.diagnosis}
                  </p>
                </div>
              )}

              {/* Notes */}
              {selectedPrescription.notes && (
                <div className="bg-yellow-50 rounded-lg p-4">
                  <label className="text-xs font-semibold text-gray-500 uppercase">
                    Notes
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedPrescription.notes}
                  </p>
                </div>
              )}

              {/* Medicines */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Prescribed Medicines
                </h3>
                <div className="space-y-3">
                  {selectedPrescription.items &&
                  selectedPrescription.items.length > 0 ? (
                    selectedPrescription.items.map((item, index) => (
                      <div
                        key={item.id}
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="bg-blue-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                                {index + 1}
                              </span>
                              <h4 className="font-semibold text-gray-900">
                                {item.medicine_name}
                              </h4>
                              {item.strength && (
                                <span className="text-sm text-gray-600">
                                  ({item.strength} {item.unit})
                                </span>
                              )}
                            </div>
                            <div className="ml-9 space-y-1">
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">Quantity:</span>{" "}
                                {item.quantity_prescribed}
                              </p>
                              {item.dosage_instructions && (
                                <p className="text-sm text-gray-700">
                                  <span className="font-medium">
                                    Instructions:
                                  </span>{" "}
                                  {item.dosage_instructions}
                                </p>
                              )}
                              {item.quantity_dispensed > 0 && (
                                <p className="text-sm text-green-700">
                                  <span className="font-medium">
                                    Dispensed:
                                  </span>{" "}
                                  {item.quantity_dispensed}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      No medicines prescribed
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 rounded-b-xl">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
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

export default PhysicianDashboard;

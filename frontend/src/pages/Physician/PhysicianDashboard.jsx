import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { reportsAPI, prescriptionsAPI } from "../../services/api";

const PhysicianDashboard = () => {
  const [stats, setStats] = useState({});
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);
  const [loading, setLoading] = useState(false);

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
        const prescriptionsResponse = await prescriptionsAPI.getAll({
          limit: 5,
        });
        setRecentPrescriptions(prescriptionsResponse.data.data || []);
      } catch (prescriptionError) {
        console.warn("Could not load prescriptions:", prescriptionError);
        // Set empty array if prescriptions can't be loaded
        setRecentPrescriptions([]);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      // Set default empty stats if dashboard fails
      setStats({});
      setRecentPrescriptions([]);
    } finally {
      setLoading(false);
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
            {recentPrescriptions.length > 0 ? (
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
                            prescription.status === "Pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : prescription.status === "Dispensed"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                          }`}
                        >
                          {prescription.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to="/reports"
                          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          View
                        </Link>
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
    </div>
  );
};

export default PhysicianDashboard;

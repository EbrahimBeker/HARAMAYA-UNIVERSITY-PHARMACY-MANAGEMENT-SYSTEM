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
      const [statsResponse, prescriptionsResponse] = await Promise.all([
        reportsAPI.getDashboard(),
        prescriptionsAPI.getAll({ limit: 5 }),
      ]);
      setStats(statsResponse.data);
      setRecentPrescriptions(prescriptionsResponse.data.data || []);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const physicianModules = [
    {
      title: "Patient Diagnosis",
      description: "Create and manage patient diagnoses",
      icon: "🩺",
      link: "/physician/diagnosis",
      color: "bg-blue-500",
    },
    {
      title: "Create Prescription",
      description: "Write prescriptions for patients",
      icon: "📝",
      link: "/physician/prescriptions/new",
      color: "bg-green-500",
    },
    {
      title: "Patient History",
      description: "View patient medical history",
      icon: "📋",
      link: "/physician/patients",
      color: "bg-purple-500",
    },
    {
      title: "My Prescriptions",
      description: "View and manage your prescriptions",
      icon: "💊",
      link: "/physician/prescriptions",
      color: "bg-orange-500",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Physician Dashboard
        </h1>
        <p className="text-gray-600">
          Patient diagnosis and prescription management
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Patients
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.total_patients || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">📝</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Today's Prescriptions
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.todays_prescriptions || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-2xl">🩺</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Diagnoses This Week
              </p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-2xl">⏳</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Pending Prescriptions
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.pending_prescriptions || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {physicianModules.map((module, index) => (
          <Link
            key={index}
            to={module.link}
            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6 block"
          >
            <div
              className={`w-12 h-12 ${module.color} rounded-lg flex items-center justify-center mb-4`}
            >
              <span className="text-2xl text-white">{module.icon}</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {module.title}
            </h3>
            <p className="text-gray-600 text-sm">{module.description}</p>
          </Link>
        ))}
      </div>

      {/* Recent Prescriptions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Prescriptions
          </h2>
          <Link
            to="/physician/prescriptions"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View All
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prescription #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentPrescriptions.length > 0 ? (
                recentPrescriptions.map((prescription) => (
                  <tr key={prescription.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {prescription.prescription_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {prescription.patient_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(
                        prescription.prescription_date,
                      ).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        to={`/physician/prescriptions/${prescription.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    No prescriptions created yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PhysicianDashboard;

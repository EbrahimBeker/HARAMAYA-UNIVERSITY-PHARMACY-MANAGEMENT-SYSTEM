import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { reportsAPI, patientsAPI } from "../../services/api";

const DataClerkDashboard = () => {
  const [stats, setStats] = useState({});
  const [recentPatients, setRecentPatients] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, patientsResponse] = await Promise.all([
        reportsAPI.getDashboard(),
        patientsAPI.getAll({ limit: 5 }),
      ]);
      setStats(statsResponse.data);
      setRecentPatients(patientsResponse.data.data || []);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const clerkModules = [
    {
      title: "Patient Registration",
      description: "Register new patients and manage records",
      icon: "👤",
      link: "/clerk/patients/new",
      color: "bg-blue-500",
    },
    {
      title: "Patient Records",
      description: "View and update patient information",
      icon: "📋",
      link: "/clerk/patients",
      color: "bg-green-500",
    },
    {
      title: "Billing & Invoices",
      description: "Process payments and generate invoices",
      icon: "💰",
      link: "/clerk/billing",
      color: "bg-purple-500",
    },
    {
      title: "Patient Reports",
      description: "Generate patient-related reports",
      icon: "📊",
      link: "/clerk/reports",
      color: "bg-orange-500",
    },
  ];

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
    <div className="p-6 space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-3">
          Data Clerk Dashboard
        </h1>
        <p className="text-gray-600 text-lg">
          Patient registration and record management
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="dashboard-card hover-lift">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg">
              <span className="text-3xl text-white">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Total Patients
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.total_patients || 0}
              </p>
              <p className="text-xs text-green-600 font-medium">
                +12% this month
              </p>
            </div>
          </div>
        </div>

        <div className="dashboard-card hover-lift">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-lg">
              <span className="text-3xl text-white">📋</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Today's Registrations
              </p>
              <p className="text-3xl font-bold text-gray-900">0</p>
              <p className="text-xs text-blue-600 font-medium">
                Ready to register
              </p>
            </div>
          </div>
        </div>

        <div className="dashboard-card hover-lift">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl shadow-lg">
              <span className="text-3xl text-white">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Monthly Revenue
              </p>
              <p className="text-3xl font-bold text-gray-900">
                ${stats.monthly_revenue || 0}
              </p>
              <p className="text-xs text-purple-600 font-medium">
                +8% vs last month
              </p>
            </div>
          </div>
        </div>

        <div className="dashboard-card hover-lift">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-lg">
              <span className="text-3xl text-white">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Pending Invoices
              </p>
              <p className="text-3xl font-bold text-gray-900">0</p>
              <p className="text-xs text-orange-600 font-medium">
                All up to date
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span className="w-1 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></span>
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {clerkModules.map((module, index) => (
            <Link
              key={index}
              to={module.link}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-6 border border-gray-100 hover:border-blue-200 transform hover:scale-105 overflow-hidden"
            >
              {/* Background Gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${module.color.replace("bg-", "from-")} to-transparent opacity-5 group-hover:opacity-10 transition-opacity`}
              ></div>

              <div className="relative z-10">
                <div
                  className={`w-14 h-14 ${module.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <span className="text-2xl text-white">{module.icon}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {module.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {module.description}
                </p>

                {/* Arrow indicator */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">→</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Patients */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></span>
              Recent Patients
            </h2>
            <Link
              to="/clerk/patients"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold text-sm bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-all duration-200"
            >
              View All
              <span>→</span>
            </Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Registration Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentPatients.length > 0 ? (
                recentPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="hover:bg-blue-50 transition-colors"
                  >
                    <td>
                      <span className="font-mono font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                        {patient.patient_id}
                      </span>
                    </td>
                    <td className="font-semibold text-gray-900">
                      {patient.first_name} {patient.last_name}
                    </td>
                    <td className="text-gray-600">{patient.phone}</td>
                    <td className="text-gray-500">
                      {new Date(patient.created_at).toLocaleDateString()}
                    </td>
                    <td>
                      <Link
                        to={`/clerk/patients/${patient.id}`}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg transition-all duration-200"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-2xl text-gray-400">👥</span>
                      </div>
                      <p className="text-gray-500 font-medium">
                        No patients registered yet
                      </p>
                      <Link
                        to="/clerk/patients/new"
                        className="btn btn-primary text-sm"
                      >
                        Register First Patient
                      </Link>
                    </div>
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

export default DataClerkDashboard;

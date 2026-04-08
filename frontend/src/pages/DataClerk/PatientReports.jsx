import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { reportsAPI, patientsAPI } from "../../services/api";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Download,
  Calendar,
  Users,
  FileText,
  BarChart3,
  TrendingUp,
  Activity,
} from "lucide-react";

const PatientReports = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState({
    totalPatients: 0,
    newPatientsThisMonth: 0,
    averageAge: 0,
    genderDistribution: {},
  });
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    loadReportData();
  }, [dateRange]);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const [patientsResponse, dashboardResponse] = await Promise.all([
        patientsAPI.getAll({
          start_date: dateRange.startDate,
          end_date: dateRange.endDate,
        }),
        reportsAPI.getPatients({
          start_date: dateRange.startDate,
          end_date: dateRange.endDate,
        }),
      ]);

      const patients = patientsResponse.data.data || [];

      // Calculate statistics
      const totalPatients = patients.length;
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      const newPatientsThisMonth = patients.filter((patient) => {
        const createdDate = new Date(patient.created_at);
        return (
          createdDate.getMonth() === currentMonth &&
          createdDate.getFullYear() === currentYear
        );
      }).length;

      const ages = patients
        .map((patient) => {
          const today = new Date();
          const birthDate = new Date(patient.date_of_birth);
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
          ) {
            age--;
          }
          return age;
        })
        .filter((age) => age >= 0);

      const averageAge =
        ages.length > 0
          ? Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length)
          : 0;

      const genderDistribution = patients.reduce((acc, patient) => {
        acc[patient.gender] = (acc[patient.gender] || 0) + 1;
        return acc;
      }, {});

      setReportData({
        totalPatients,
        newPatientsThisMonth,
        averageAge,
        genderDistribution,
      });
    } catch (error) {
      toast.error("Failed to load report data");
      console.error("Error loading report data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async (format) => {
    try {
      toast.info(`Exporting report in ${format.toUpperCase()} format...`);
      // In a real implementation, you would call an API endpoint to generate and download the report
      setTimeout(() => {
        toast.success(
          `Report exported successfully as ${format.toUpperCase()}`,
        );
      }, 2000);
    } catch (error) {
      toast.error("Failed to export report");
    }
  };

  const reportTypes = [
    {
      title: "Patient Registration Report",
      description: "Detailed list of all patient registrations",
      icon: Users,
      color: "bg-blue-500",
      action: () => handleExportReport("pdf"),
    },
    {
      title: "Demographics Report",
      description: "Age and gender distribution analysis",
      icon: BarChart3,
      color: "bg-green-500",
      action: () => handleExportReport("excel"),
    },
    {
      title: "Monthly Activity Report",
      description: "Patient registration trends and statistics",
      icon: TrendingUp,
      color: "bg-purple-500",
      action: () => handleExportReport("pdf"),
    },
    {
      title: "Patient Contact List",
      description: "Export patient contact information",
      icon: FileText,
      color: "bg-orange-500",
      action: () => handleExportReport("csv"),
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Patient Reports</h1>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar size={20} />
          Report Period
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, startDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) =>
                setDateRange({ ...dateRange, endDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Patients
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? "..." : reportData.totalPatients}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                New This Month
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? "..." : reportData.newPatientsThisMonth}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Average Age</p>
              <p className="text-2xl font-semibold text-gray-900">
                {loading ? "..." : `${reportData.averageAge} years`}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Gender Split</p>
              <p className="text-sm font-semibold text-gray-900">
                {loading
                  ? "..."
                  : Object.entries(reportData.genderDistribution)
                      .map(([gender, count]) => `${gender}: ${count}`)
                      .join(", ") || "No data"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Gender Distribution Chart */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Gender Distribution
        </h2>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(reportData.genderDistribution).map(
              ([gender, count]) => {
                const percentage =
                  reportData.totalPatients > 0
                    ? Math.round((count / reportData.totalPatients) * 100)
                    : 0;
                return (
                  <div key={gender} className="flex items-center">
                    <div className="w-20 text-sm font-medium text-gray-700">
                      {gender}:
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-blue-600 h-4 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-16 text-sm text-gray-600">
                      {count} ({percentage}%)
                    </div>
                  </div>
                );
              },
            )}
          </div>
        )}
      </div>

      {/* Report Generation */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Generate Reports
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reportTypes.map((report, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 ${report.color} rounded-lg`}>
                  <report.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">
                    {report.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {report.description}
                  </p>
                  <button
                    onClick={report.action}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    <Download size={16} />
                    Generate Report
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatientReports;

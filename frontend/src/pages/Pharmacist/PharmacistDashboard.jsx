import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { reportsAPI, prescriptionsAPI, inventoryAPI } from "../../services/api";

const PharmacistDashboard = () => {
  const [stats, setStats] = useState({});
  const [pendingPrescriptions, setPendingPrescriptions] = useState([]);
  const [lowStockMedicines, setLowStockMedicines] = useState([]);
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

      // Try to load prescriptions and inventory, but handle errors gracefully
      try {
        const prescriptionsResponse = await prescriptionsAPI.getPending();
        setPendingPrescriptions(prescriptionsResponse.data.data || []);
      } catch (prescriptionError) {
        console.warn(
          "Could not load pending prescriptions:",
          prescriptionError,
        );
        setPendingPrescriptions([]);
      }

      try {
        const stockResponse = await inventoryAPI.getCurrentStock({
          low_stock: true,
          limit: 5,
        });
        setLowStockMedicines(stockResponse.data.data || []);
      } catch (stockError) {
        console.warn("Could not load stock data:", stockError);
        setLowStockMedicines([]);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      // Set defaults if everything fails
      setStats({});
      setPendingPrescriptions([]);
      setLowStockMedicines([]);
    } finally {
      setLoading(false);
    }
  };

  const pharmacistModules = [
    {
      title: "Medicine Inventory",
      description: "Manage medicine stock and inventory",
      icon: "📦",
      link: "/medicines",
      color: "bg-green-500",
    },
    {
      title: "Supplier Management",
      description: "Manage suppliers and orders",
      icon: "🏢",
      link: "/suppliers",
      color: "bg-purple-500",
    },
    {
      title: "Stock Reports",
      description: "View inventory and stock reports",
      icon: "📊",
      link: "/reports",
      color: "bg-orange-500",
    },
    {
      title: "System Dashboard",
      description: "Access main system dashboard",
      icon: "💊",
      link: "/dashboard",
      color: "bg-blue-500",
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
          Pharmacist Dashboard
        </h1>
        <p className="text-gray-600 text-lg">
          Medicine dispensing and inventory management
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="dashboard-card hover-lift">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl shadow-lg">
              <span className="text-3xl text-white">💊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Total Medicines
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.total_medicines || 0}
              </p>
              <p className="text-xs text-blue-600 font-medium">In inventory</p>
            </div>
          </div>
        </div>

        <div className="dashboard-card hover-lift">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-2xl shadow-lg">
              <span className="text-3xl text-white">⏳</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Pending Prescriptions
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.pending_prescriptions || 0}
              </p>
              <p className="text-xs text-yellow-600 font-medium">To dispense</p>
            </div>
          </div>
        </div>

        <div className="dashboard-card hover-lift">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl shadow-lg">
              <span className="text-3xl text-white">⚠️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Low Stock Items
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.low_stock_medicines || 0}
              </p>
              <p className="text-xs text-red-600 font-medium">Need reorder</p>
            </div>
          </div>
        </div>

        <div className="dashboard-card hover-lift">
          <div className="flex items-center">
            <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl shadow-lg">
              <span className="text-3xl text-white">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Dispensed Today
              </p>
              <p className="text-3xl font-bold text-gray-900">0</p>
              <p className="text-xs text-green-600 font-medium">Completed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <span className="w-1 h-8 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></span>
          Pharmacy Tools
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pharmacistModules.map((module, index) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Prescriptions */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></span>
                Pending Prescriptions
              </h2>
              <Link
                to="/reports"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold text-sm bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-all duration-200"
              >
                View All
                <span>→</span>
              </Link>
            </div>
          </div>
          <div className="p-6">
            {pendingPrescriptions.length > 0 ? (
              <div className="space-y-4">
                {pendingPrescriptions.slice(0, 5).map((prescription) => (
                  <div
                    key={prescription.id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-100 hover:shadow-md transition-all duration-200"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {prescription.prescription_number}
                      </p>
                      <p className="text-sm text-gray-600">
                        {prescription.patient_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(
                          prescription.prescription_date,
                        ).toLocaleDateString()}
                      </p>
                    </div>
                    <Link
                      to="/reports"
                      className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-xl text-sm hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      View Details
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-gray-400">📋</span>
                </div>
                <p className="text-gray-500 font-medium">
                  No pending prescriptions
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-red-50">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="w-1 h-6 bg-gradient-to-b from-red-600 to-orange-600 rounded-full"></span>
                Low Stock Alerts
              </h2>
              <Link
                to="/medicines"
                className="flex items-center gap-2 text-red-600 hover:text-red-800 font-semibold text-sm bg-red-50 hover:bg-red-100 px-4 py-2 rounded-xl transition-all duration-200"
              >
                View All
                <span>→</span>
              </Link>
            </div>
          </div>
          <div className="p-6">
            {lowStockMedicines.length > 0 ? (
              <div className="space-y-4">
                {lowStockMedicines.slice(0, 5).map((medicine) => (
                  <div
                    key={medicine.id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-100 hover:shadow-md transition-all duration-200"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">
                        {medicine.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {medicine.strength} {medicine.unit}
                      </p>
                      <p className="text-xs text-red-600 font-medium">
                        Stock: {medicine.quantity_available} (Reorder:{" "}
                        {medicine.reorder_level})
                      </p>
                    </div>
                    <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-semibold border border-red-200">
                      {medicine.stock_status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-gray-400">✅</span>
                </div>
                <p className="text-gray-500 font-medium">
                  All medicines are well stocked
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacistDashboard;

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
      const [statsResponse, prescriptionsResponse, stockResponse] =
        await Promise.all([
          reportsAPI.getDashboard(),
          prescriptionsAPI.getPending(),
          inventoryAPI.getCurrentStock({ low_stock: true, limit: 5 }),
        ]);
      setStats(statsResponse.data);
      setPendingPrescriptions(prescriptionsResponse.data.data || []);
      setLowStockMedicines(stockResponse.data.data || []);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const pharmacistModules = [
    {
      title: "Dispense Medicines",
      description: "Process and dispense prescriptions",
      icon: "💊",
      link: "/pharmacist/dispense",
      color: "bg-blue-500",
    },
    {
      title: "Inventory Management",
      description: "Manage medicine stock and inventory",
      icon: "📦",
      link: "/pharmacist/inventory",
      color: "bg-green-500",
    },
    {
      title: "Receive Stock",
      description: "Receive medicines from suppliers",
      icon: "📥",
      link: "/pharmacist/receive",
      color: "bg-purple-500",
    },
    {
      title: "Stock Reports",
      description: "View inventory and stock reports",
      icon: "📊",
      link: "/pharmacist/reports",
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
          Pharmacist Dashboard
        </h1>
        <p className="text-gray-600">
          Medicine dispensing and inventory management
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-2xl">💊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Medicines
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.total_medicines || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
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

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Low Stock Items
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {stats.low_stock_medicines || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Dispensed Today
              </p>
              <p className="text-2xl font-semibold text-gray-900">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {pharmacistModules.map((module, index) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Prescriptions */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Pending Prescriptions
            </h2>
            <Link
              to="/pharmacist/dispense"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          <div className="p-6">
            {pendingPrescriptions.length > 0 ? (
              <div className="space-y-4">
                {pendingPrescriptions.slice(0, 5).map((prescription) => (
                  <div
                    key={prescription.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
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
                      to={`/pharmacist/dispense/${prescription.id}`}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                    >
                      Dispense
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                No pending prescriptions
              </p>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">
              Low Stock Alerts
            </h2>
            <Link
              to="/pharmacist/inventory"
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          <div className="p-6">
            {lowStockMedicines.length > 0 ? (
              <div className="space-y-4">
                {lowStockMedicines.slice(0, 5).map((medicine) => (
                  <div
                    key={medicine.id}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        {medicine.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {medicine.strength} {medicine.unit}
                      </p>
                      <p className="text-xs text-red-600">
                        Stock: {medicine.quantity_available} (Reorder:{" "}
                        {medicine.reorder_level})
                      </p>
                    </div>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                      {medicine.stock_status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                All medicines are well stocked
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacistDashboard;

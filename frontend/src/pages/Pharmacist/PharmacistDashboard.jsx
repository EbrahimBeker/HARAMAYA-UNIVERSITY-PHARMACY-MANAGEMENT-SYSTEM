import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { reportsAPI, prescriptionsAPI, inventoryAPI } from "../../services/api";

const PharmacistDashboard = () => {
  const location = useLocation();
  const [stats, setStats] = useState({});
  const [pendingPrescriptions, setPendingPrescriptions] = useState([]);
  const [lowStockMedicines, setLowStockMedicines] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();

    // Reload data when user returns to this page
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadDashboardData();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // Reload when navigating back to dashboard
  useEffect(() => {
    loadDashboardData();
  }, [location.key]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const statsResponse = await reportsAPI.getDashboard();
      setStats(statsResponse.data);

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
      setStats({});
      setPendingPrescriptions([]);
      setLowStockMedicines([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
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
                Pharmacist Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Manage dispensing and inventory
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
                {stats.total_medicines || 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">Total Medicines</p>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <p className="text-2xl font-bold text-amber-600">
                {stats.pending_prescriptions || 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">Pending</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-2xl font-bold text-red-600">
                {stats.low_stock_medicines || 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">Low Stock</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {stats.dispensed_today || 0}
              </p>
              <p className="text-xs text-gray-600 mt-1">Dispensed Today</p>
            </div>
          </div>
        </div>

        {/* Main Content - 2 Column Layout */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left Sidebar - Actions */}
          <div className="col-span-1 space-y-6">
            {/* Primary Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <Link
                  to="/pharmacist/dispensing"
                  className="flex items-center gap-3 p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <span className="text-2xl">💊</span>
                  <div className="flex-1">
                    <p className="font-semibold">Drug Dispensing</p>
                    <p className="text-xs opacity-90">Process prescriptions</p>
                  </div>
                  {stats.pending_prescriptions > 0 && (
                    <span className="bg-white text-blue-600 text-xs font-bold px-2 py-1 rounded-full">
                      {stats.pending_prescriptions}
                    </span>
                  )}
                </Link>

                <Link
                  to="/pharmacist/stock-in"
                  className="flex items-center gap-3 p-4 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  <span className="text-2xl">📦</span>
                  <div className="flex-1">
                    <p className="font-semibold">Stock In</p>
                    <p className="text-xs opacity-90">Add inventory</p>
                  </div>
                </Link>

                <Link
                  to="/pharmacist/emergency-dispensing"
                  className="flex items-center gap-3 p-4 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <span className="text-2xl">⚠️</span>
                  <div className="flex-1">
                    <p className="font-semibold">Emergency Dispensing</p>
                    <p className="text-xs opacity-90">
                      No prescription required
                    </p>
                  </div>
                </Link>

                <Link
                  to="/medicines"
                  className="flex items-center gap-3 p-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  <span className="text-2xl">🏥</span>
                  <div className="flex-1">
                    <p className="font-semibold">Inventory</p>
                    <p className="text-xs opacity-90">Manage stock</p>
                  </div>
                  {stats.low_stock_medicines > 0 && (
                    <span className="bg-white text-purple-600 text-xs font-bold px-2 py-1 rounded-full">
                      {stats.low_stock_medicines}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            {/* Secondary Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                More Tools
              </h2>
              <div className="space-y-2">
                <Link
                  to="/suppliers"
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <span className="text-xl">🏢</span>
                  <span className="text-sm font-medium text-gray-700">
                    Suppliers
                  </span>
                </Link>
                <Link
                  to="/pharmacist/reports"
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <span className="text-xl">📊</span>
                  <span className="text-sm font-medium text-gray-700">
                    Reports
                  </span>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Content - Data Tables */}
          <div className="col-span-2 space-y-6">
            {/* Pending Prescriptions Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">
                  Pending Prescriptions
                </h2>
                <Link
                  to="/reports"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View All →
                </Link>
              </div>
              <div className="overflow-x-auto">
                {pendingPrescriptions.length > 0 ? (
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
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {pendingPrescriptions.slice(0, 5).map((prescription) => (
                        <tr key={prescription.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <span className="text-sm font-mono font-semibold text-gray-900">
                              {prescription.prescription_number}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">
                            {prescription.patient_name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(
                              prescription.prescription_date,
                            ).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link
                              to="/reports"
                              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                              Dispense
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-12">
                    <span className="text-4xl mb-2 block">📋</span>
                    <p className="text-gray-500">No pending prescriptions</p>
                  </div>
                )}
              </div>
            </div>

            {/* Low Stock Alerts Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">
                  Low Stock Alerts
                </h2>
                <Link
                  to="/medicines"
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  View All →
                </Link>
              </div>
              <div className="overflow-x-auto">
                {lowStockMedicines.length > 0 ? (
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                          Medicine
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                          Strength
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                          Current
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                          Reorder
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {lowStockMedicines.slice(0, 5).map((medicine) => (
                        <tr key={medicine.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                            {medicine.name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {medicine.strength} {medicine.unit}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="text-sm font-bold text-red-600">
                              {medicine.quantity_available}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center text-sm text-gray-600">
                            {medicine.reorder_level}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              {medicine.stock_status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-12">
                    <span className="text-4xl mb-2 block">✅</span>
                    <p className="text-gray-500">All medicines well stocked</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacistDashboard;

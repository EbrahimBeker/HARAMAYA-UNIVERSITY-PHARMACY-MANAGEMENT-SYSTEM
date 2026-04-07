import { useState, useEffect } from "react";
import { reportsAPI } from "../../services/api";
import { toast } from "react-toastify";
import {
  FileText,
  Download,
  Calendar,
  Package,
  AlertTriangle,
  TrendingUp,
  Users,
} from "lucide-react";
import Loading from "../../components/Common/Loading";
import { useAuth } from "../../context/AuthContext";

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    dashboard: {},
    patients: [],
    stock: [],
    prescriptions: [],
    suppliers: [],
    activity: [],
  });
  const { user, hasAnyRole } = useAuth();

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      setLoading(true);

      // Fetch dashboard stats for all users
      const dashboardRes = await reportsAPI.getDashboard();
      const dashboardData = dashboardRes.data;

      let stockData = [];
      let suppliersData = [];

      // Fetch role-specific data
      if (hasAnyRole(["Pharmacist"])) {
        try {
          const [stockRes, suppliersRes] = await Promise.all([
            reportsAPI.getStock(),
            reportsAPI.getSuppliers(),
          ]);
          stockData = stockRes.data.data || [];
          suppliersData = suppliersRes.data.data || [];
        } catch (error) {
          console.warn("Could not fetch stock/supplier data:", error);
        }
      }

      // Calculate derived data
      const lowStockItems = stockData.filter(
        (item) =>
          item.stock_status === "Low Stock" ||
          item.stock_status === "Out of Stock",
      );

      const totalValue = stockData.reduce(
        (sum, item) => sum + parseFloat(item.stock_value || 0),
        0,
      );

      setReportData({
        dashboard: dashboardData,
        stock: stockData,
        suppliers: suppliersData,
        lowStockItems,
        totalValue,
        medicines: stockData, // For compatibility
      });
    } catch (error) {
      console.error("Failed to fetch report data:", error);
      toast.error("Failed to fetch report data");
    } finally {
      setLoading(false);
    }
  };

  const generateCSV = (data, filename) => {
    if (!data || data.length === 0) {
      toast.warning("No data to export");
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map((row) =>
        headers.map((header) => `"${row[header] || ""}"`).join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportMedicinesReport = async () => {
    try {
      const response = await reportsAPI.getStock();
      const stockData = response.data.data || [];

      const exportData = stockData.map((item) => ({
        Name: item.name,
        "Generic Name": item.generic_name || "",
        Category: item.category_name,
        Type: item.type_name,
        Strength: item.strength || "",
        "Unit Price": item.unit_price,
        "Current Stock": item.current_stock,
        "Reorder Level": item.reorder_level,
        "Stock Status": item.stock_status,
        "Stock Value": item.stock_value,
      }));
      generateCSV(exportData, "medicines_inventory");
    } catch (error) {
      toast.error("Failed to export medicines report");
    }
  };

  const exportLowStockReport = async () => {
    try {
      const response = await reportsAPI.getStock({ low_stock_only: true });
      const lowStockData = response.data.data || [];

      const exportData = lowStockData.map((item) => ({
        Name: item.name,
        "Current Stock": item.current_stock,
        "Reorder Level": item.reorder_level,
        "Stock Status": item.stock_status,
        "Unit Price": item.unit_price,
        Category: item.category_name,
        "Stock Value": item.stock_value,
      }));
      generateCSV(exportData, "low_stock_report");
    } catch (error) {
      toast.error("Failed to export low stock report");
    }
  };

  const exportSuppliersReport = async () => {
    try {
      const response = await reportsAPI.getSuppliers();
      const suppliersData = response.data.data || [];

      const exportData = suppliersData.map((supplier) => ({
        Name: supplier.name,
        "Contact Person": supplier.contact_person || "",
        Phone: supplier.phone,
        Email: supplier.email || "",
        "Total Orders": supplier.total_orders || 0,
        "Delivered Orders": supplier.delivered_orders || 0,
        "Total Value": supplier.total_value || 0,
        "Last Order Date": supplier.last_order_date || "",
      }));
      generateCSV(exportData, "suppliers_report");
    } catch (error) {
      toast.error("Failed to export suppliers report");
    }
  };

  const exportPatientReport = async () => {
    try {
      const response = await reportsAPI.getPatients();
      const patientsData = response.data.data || [];

      const exportData = patientsData.map((patient) => ({
        "Patient ID": patient.patient_id,
        "First Name": patient.first_name,
        "Last Name": patient.last_name,
        Gender: patient.gender,
        Phone: patient.phone,
        "Registration Date": new Date(
          patient.registration_date,
        ).toLocaleDateString(),
        "Total Prescriptions": patient.total_prescriptions || 0,
        "Total Diagnoses": patient.total_diagnoses || 0,
      }));
      generateCSV(exportData, "patient_report");
    } catch (error) {
      toast.error("Failed to export patient report");
    }
  };

  const exportSystemActivityReport = async () => {
    try {
      const response = await reportsAPI.getActivity();
      const activityData = response.data.data || [];

      const exportData = activityData.map((activity) => ({
        Action: activity.action,
        Table: activity.table_name,
        User: activity.user_name || activity.username,
        "Date/Time": new Date(activity.created_at).toLocaleString(),
      }));
      generateCSV(exportData, "system_activity_report");
    } catch (error) {
      toast.error("Failed to export system activity report");
    }
  };

  if (loading) return <Loading />;

  // Role-based report filtering
  const getAvailableReports = () => {
    const allReports = [
      // Admin-specific reports
      {
        title: "System Overview",
        icon: FileText,
        color: "bg-purple-500",
        stats: [
          { label: "Total Users", value: "5" },
          {
            label: "Total Patients",
            value: reportData.dashboard.total_patients || 0,
          },
          { label: "System Uptime", value: "99.9%" },
        ],
        action: () => exportSystemActivityReport(),
        actionLabel: "Export System Report",
        roles: ["Admin"],
      },
      {
        title: "User Activity",
        icon: Users,
        color: "bg-indigo-500",
        stats: [
          {
            label: "Total Medicines",
            value: reportData.dashboard.total_medicines || 0,
          },
          {
            label: "Today's Prescriptions",
            value: reportData.dashboard.todays_prescriptions || 0,
          },
          {
            label: "Monthly Revenue",
            value: `${reportData.dashboard.monthly_revenue || 0} ETB`,
          },
        ],
        action: () => exportPatientReport(),
        actionLabel: "Export Patient Report",
        roles: ["Admin"],
      },
      // Pharmacist-specific reports
      {
        title: "Inventory Summary",
        icon: Package,
        color: "bg-blue-500",
        stats: [
          { label: "Total Medicines", value: reportData.stock.length },
          {
            label: "Total Inventory Value",
            value: `${reportData.totalValue.toFixed(2)} ETB`,
          },
          {
            label: "Active Suppliers",
            value: reportData.suppliers.filter((s) => s.is_active !== false)
              .length,
          },
        ],
        action: () => exportMedicinesReport(),
        actionLabel: "Export Inventory",
        roles: ["Pharmacist"],
      },
      {
        title: "Low Stock Alert",
        icon: AlertTriangle,
        color: "bg-red-500",
        stats: [
          {
            label: "Items Below Reorder Level",
            value: reportData.lowStockItems.length,
          },
          {
            label: "Critical Stock Items",
            value: reportData.lowStockItems.filter(
              (item) => item.stock_status === "Out of Stock",
            ).length,
          },
          {
            label: "Restock Required",
            value: reportData.lowStockItems.length > 0 ? "Yes" : "No",
          },
        ],
        action: () => exportLowStockReport(),
        actionLabel: "Export Low Stock",
        roles: ["Pharmacist"],
      },
      {
        title: "Supplier Report",
        icon: TrendingUp,
        color: "bg-green-500",
        stats: [
          { label: "Total Suppliers", value: reportData.suppliers.length },
          {
            label: "Active Suppliers",
            value: reportData.suppliers.filter((s) => s.is_active).length,
          },
          {
            label: "Inactive Suppliers",
            value: reportData.suppliers.filter((s) => !s.is_active).length,
          },
        ],
        action: () => exportSuppliersReport(),
        actionLabel: "Export Suppliers",
        roles: ["Pharmacist", "Drug Supplier"],
      },
    ];

    // Filter reports based on user role
    return allReports.filter((report) => hasAnyRole(report.roles));
  };

  const reportCards = getAvailableReports();

  // Role-based available reports in the bottom section
  const getAvailableReportsList = () => {
    const allReportsList = [
      // Admin reports
      {
        title: "System Performance Report",
        description: "System usage, performance metrics, and health status",
        action: exportSystemActivityReport,
        roles: ["Admin"],
      },
      {
        title: "User Management Report",
        description: "User activity, login history, and role assignments",
        action: exportSystemActivityReport,
        roles: ["Admin"],
      },
      // Pharmacist reports
      {
        title: "Medicine Inventory Report",
        description:
          "Complete list of all medicines with stock levels and values",
        action: exportMedicinesReport,
        roles: ["Pharmacist"],
      },
      {
        title: "Low Stock Report",
        description: "Medicines that need immediate restocking attention",
        action: exportLowStockReport,
        roles: ["Pharmacist"],
      },
      {
        title: "Supplier Directory",
        description: "Complete supplier contact information and status",
        action: exportSuppliersReport,
        roles: ["Pharmacist", "Drug Supplier"],
      },
      // Data Clerk reports
      {
        title: "Patient Reports",
        description: "Patient registration and billing reports",
        action: exportPatientReport,
        roles: ["Admin", "Data Clerk"],
      },
    ];

    return allReportsList.filter((report) => hasAnyRole(report.roles));
  };

  const availableReportsList = getAvailableReportsList();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">
            Generate and export pharmacy reports
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar size={16} />
          <span>Generated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      {reportCards.length === 0 ? (
        <div className="card text-center py-12">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Reports Available
          </h3>
          <p className="text-gray-600">
            You don't have permission to access any reports. Contact your
            administrator for access.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {reportCards.map((report, index) => (
              <div key={index} className="card">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`${report.color} bg-opacity-10 p-3 rounded-lg`}
                  >
                    <report.icon
                      size={24}
                      className={report.color.replace("bg-", "text-")}
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {report.title}
                  </h3>
                </div>

                <div className="space-y-3 mb-4">
                  {report.stats.map((stat, statIndex) => (
                    <div
                      key={statIndex}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm text-gray-600">
                        {stat.label}
                      </span>
                      <span className="font-semibold text-gray-900">
                        {stat.value}
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={report.action}
                  className="w-full btn btn-secondary flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  {report.actionLabel}
                </button>
              </div>
            ))}
          </div>

          {/* Low Stock Alert Section - Only for Pharmacist */}
          {hasAnyRole(["Pharmacist"]) &&
            reportData.lowStockItems.length > 0 && (
              <div className="card bg-red-50 border-red-200 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle className="text-red-600" size={24} />
                  <h3 className="text-lg font-semibold text-red-800">
                    Critical Stock Levels
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-red-200">
                        <th className="text-left py-2 px-3 font-semibold text-red-700">
                          Medicine
                        </th>
                        <th className="text-left py-2 px-3 font-semibold text-red-700">
                          Current Stock
                        </th>
                        <th className="text-left py-2 px-3 font-semibold text-red-700">
                          Reorder Level
                        </th>
                        <th className="text-left py-2 px-3 font-semibold text-red-700">
                          Shortage
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.lowStockItems.slice(0, 10).map((item) => (
                        <tr key={item.id} className="border-b border-red-100">
                          <td className="py-2 px-3 text-red-900">
                            {item.name}
                          </td>
                          <td className="py-2 px-3 text-red-700">
                            {item.quantity_available || 0}
                          </td>
                          <td className="py-2 px-3 text-red-700">
                            {item.reorder_level}
                          </td>
                          <td className="py-2 px-3 text-red-700">
                            {item.reorder_level -
                              (item.quantity_available || 0)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {reportData.lowStockItems.length > 10 && (
                    <p className="text-sm text-red-600 mt-2 px-3">
                      Showing 10 of {reportData.lowStockItems.length} low stock
                      items
                    </p>
                  )}
                </div>
              </div>
            )}

          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <FileText size={24} className="text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Available Reports
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableReportsList.map((report, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <h4 className="font-medium text-gray-900 mb-2">
                    {report.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    {report.description}
                  </p>
                  <button
                    onClick={report.action}
                    className="btn btn-primary text-sm"
                  >
                    Generate Report
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;

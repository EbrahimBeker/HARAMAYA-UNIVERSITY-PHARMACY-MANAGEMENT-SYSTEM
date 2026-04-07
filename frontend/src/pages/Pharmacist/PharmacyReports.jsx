import { useState, useEffect } from "react";
import { reportsAPI } from "../../services/api";
import { toast } from "react-toastify";
import {
  FileText,
  Download,
  Package,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Activity,
} from "lucide-react";
import Loading from "../../components/Common/Loading";

const PharmacyReports = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    dashboard: {},
    sales: [],
    stock: [],
    lowStock: [],
    dailySales: [],
  });
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30))
      .toISOString()
      .split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);

      const [dashboardRes, stockRes, salesRes] = await Promise.all([
        reportsAPI.getPharmacyDashboard(),
        reportsAPI.getPharmacyInventory(),
        reportsAPI.getPharmacySales({
          start_date: dateRange.start,
          end_date: dateRange.end,
        }),
      ]);

      const stockData = stockRes.data.data || [];
      const lowStockData = stockData.filter(
        (item) =>
          item.stock_status === "Low Stock" ||
          item.stock_status === "Out of Stock",
      );

      const salesData = salesRes.data.data || [];

      // Calculate daily sales for the chart
      const dailySalesMap = {};
      salesData.forEach((sale) => {
        const date = new Date(sale.sale_date).toISOString().split("T")[0];
        if (!dailySalesMap[date]) {
          dailySalesMap[date] = { date, total: 0, count: 0 };
        }
        dailySalesMap[date].total += parseFloat(sale.total_amount || 0);
        dailySalesMap[date].count += 1;
      });

      const dailySales = Object.values(dailySalesMap).sort(
        (a, b) => new Date(a.date) - new Date(b.date),
      );

      setReportData({
        dashboard: dashboardRes.data,
        stock: stockData,
        lowStock: lowStockData,
        sales: salesData,
        dailySales,
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

  const exportSalesReport = () => {
    const exportData = reportData.sales.map((sale) => ({
      "Sale Number": sale.sale_number,
      Date: new Date(sale.sale_date).toLocaleDateString(),
      Customer: sale.customer_name || "Walk-in Customer",
      "Total Amount": sale.total_amount,
      "Payment Method": sale.payment_method,
      Cashier: sale.cashier_name,
    }));
    generateCSV(exportData, "sales_report");
  };

  const exportInventoryReport = () => {
    const exportData = reportData.stock.map((item) => ({
      "Medicine Name": item.name,
      "Generic Name": item.generic_name || "",
      Category: item.category_name,
      Type: item.type_name,
      "Current Stock": item.current_stock,
      "Reorder Level": item.reorder_level,
      "Unit Price": item.unit_price,
      "Stock Value": item.stock_value,
      Status: item.stock_status,
    }));
    generateCSV(exportData, "inventory_report");
  };

  const exportLowStockReport = () => {
    const exportData = reportData.lowStock.map((item) => ({
      "Medicine Name": item.name,
      "Current Stock": item.current_stock,
      "Reorder Level": item.reorder_level,
      Shortage: item.reorder_level - item.current_stock,
      "Unit Price": item.unit_price,
      Category: item.category_name,
      Status: item.stock_status,
    }));
    generateCSV(exportData, "low_stock_alert");
  };

  // Calculate summary statistics
  const totalSales = reportData.sales.reduce(
    (sum, sale) => sum + parseFloat(sale.total_amount || 0),
    0,
  );
  const totalTransactions = reportData.sales.length;
  const averageTransaction =
    totalTransactions > 0 ? totalSales / totalTransactions : 0;
  const totalStockValue = reportData.stock.reduce(
    (sum, item) => sum + parseFloat(item.stock_value || 0),
    0,
  );

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
      {/* Attractive Header Section */}
      <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse"></div>
          <div
            className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="relative px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              {/* Title Section */}
              <div className="text-white">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
                    <FileText size={32} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
                      Pharmacy Reports
                    </h1>
                    <p className="text-blue-100 text-sm sm:text-base lg:text-lg mt-1 font-medium">
                      Comprehensive analytics and insights
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-4">
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Activity size={16} className="text-white" />
                    <span className="text-sm font-semibold text-white">
                      {totalTransactions} Transactions
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <DollarSign size={16} className="text-white" />
                    <span className="text-sm font-semibold text-white">
                      {totalSales.toFixed(2)} ETB Revenue
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Package size={16} className="text-white" />
                    <span className="text-sm font-semibold text-white">
                      {reportData.stock.length} Medicines
                    </span>
                  </div>
                </div>
              </div>

              {/* Date Range Filters */}
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-4 sm:p-6 border border-white/20">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Date Range
                  </h3>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      From
                    </label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) =>
                        setDateRange((prev) => ({
                          ...prev,
                          start: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-gray-600 mb-1">
                      To
                    </label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) =>
                        setDateRange((prev) => ({
                          ...prev,
                          end: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-xl text-sm font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            className="w-full h-8 sm:h-12"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
              className="fill-gray-50"
            ></path>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-4">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300 border border-blue-400">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <p className="text-sm font-semibold text-blue-100 uppercase tracking-wide">
                  Total Sales
                </p>
                <p className="text-3xl font-bold mt-2">
                  {totalSales.toFixed(2)} ETB
                </p>
                <p className="text-xs text-blue-100 mt-1">Revenue generated</p>
              </div>
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <DollarSign className="text-white" size={32} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300 border border-green-400">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <p className="text-sm font-semibold text-green-100 uppercase tracking-wide">
                  Transactions
                </p>
                <p className="text-3xl font-bold mt-2">{totalTransactions}</p>
                <p className="text-xs text-green-100 mt-1">Total sales count</p>
              </div>
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Activity className="text-white" size={32} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300 border border-purple-400">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <p className="text-sm font-semibold text-purple-100 uppercase tracking-wide">
                  Avg Transaction
                </p>
                <p className="text-3xl font-bold mt-2">
                  {averageTransaction.toFixed(2)} ETB
                </p>
                <p className="text-xs text-purple-100 mt-1">Per sale average</p>
              </div>
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <TrendingUp className="text-white" size={32} />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all duration-300 border border-orange-400">
            <div className="flex items-center justify-between">
              <div className="text-white">
                <p className="text-sm font-semibold text-orange-100 uppercase tracking-wide">
                  Stock Value
                </p>
                <p className="text-3xl font-bold mt-2">
                  ${totalStockValue.toFixed(2)}
                </p>
                <p className="text-xs text-orange-100 mt-1">Inventory worth</p>
              </div>
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Package className="text-white" size={32} />
              </div>
            </div>
          </div>
        </div>

        {/* Low Stock Alert */}
        {reportData.lowStock.length > 0 && (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-2xl p-6 mb-8 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-red-800">
                  Critical Stock Alert
                </h3>
                <p className="text-sm text-red-600 font-medium">
                  {reportData.lowStock.length} items need attention
                </p>
              </div>
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
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.lowStock.slice(0, 5).map((item, index) => (
                    <tr key={index} className="border-b border-red-100">
                      <td className="py-2 px-3 text-red-900">{item.name}</td>
                      <td className="py-2 px-3 text-red-700">
                        {item.current_stock}
                      </td>
                      <td className="py-2 px-3 text-red-700">
                        {item.reorder_level}
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            item.stock_status === "Out of Stock"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {item.stock_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {reportData.lowStock.length > 5 && (
                <p className="text-sm text-red-600 mt-2">
                  Showing 5 of {reportData.lowStock.length} items requiring
                  attention
                </p>
              )}
            </div>
          </div>
        )}

        {/* Daily Sales Chart - REMOVED */}
        {/* {reportData.dailySales.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                <TrendingUp className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Daily Sales Trend
                </h3>
                <p className="text-sm text-gray-600">
                  Last 14 days performance
                </p>
              </div>
            </div>
            <div className="flex items-end justify-between gap-2 h-64">
              {reportData.dailySales.slice(-14).map((day, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div
                    className="bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg w-full min-h-[8px] transition-all duration-300 hover:from-purple-600 hover:to-purple-400 shadow-lg"
                    style={{
                      height: `${Math.max(
                        8,
                        (day.total /
                          Math.max(
                            ...reportData.dailySales.map((d) => d.total || 1),
                          )) *
                          220,
                      )}px`,
                    }}
                    title={`$${day.total.toFixed(2)} (${day.count} transactions)`}
                  ></div>
                  <span className="text-xs text-gray-700 mt-2 font-medium">
                    {new Date(day.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
              💡 Hover over bars to see daily totals. Showing last 14 days of
              sales data.
            </div>
          </div>
        )} */}

        {/* Report Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Sales Report */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-r from-green-500 to-green-600 p-3 rounded-xl shadow-lg">
                <DollarSign className="text-white" size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Sales Report</h3>
            </div>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Revenue</span>
                <span className="font-semibold">
                  {totalSales.toFixed(2)} ETB
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">
                  Total Transactions
                </span>
                <span className="font-semibold">{totalTransactions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Average Sale</span>
                <span className="font-semibold">
                  ${averageTransaction.toFixed(2)}
                </span>
              </div>
            </div>
            <button
              onClick={exportSalesReport}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
            >
              <Download size={18} />
              Export Sales Report
            </button>
          </div>

          {/* Inventory Report */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
                <Package className="text-white" size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Inventory Report
              </h3>
            </div>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Medicines</span>
                <span className="font-semibold">{reportData.stock.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Stock Value</span>
                <span className="font-semibold">
                  ${totalStockValue.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Low Stock Items</span>
                <span className="font-semibold text-red-600">
                  {reportData.lowStock.length}
                </span>
              </div>
            </div>
            <button
              onClick={exportInventoryReport}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
            >
              <Download size={18} />
              Export Inventory
            </button>
          </div>

          {/* Low Stock Alert Report */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-3 rounded-xl shadow-lg">
                <AlertTriangle className="text-white" size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Stock Alerts</h3>
            </div>
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Low Stock Items</span>
                <span className="font-semibold text-yellow-600">
                  {
                    reportData.lowStock.filter(
                      (item) => item.stock_status === "Low Stock",
                    ).length
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Out of Stock</span>
                <span className="font-semibold text-red-600">
                  {
                    reportData.lowStock.filter(
                      (item) => item.stock_status === "Out of Stock",
                    ).length
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Alerts</span>
                <span className="font-semibold text-red-600">
                  {reportData.lowStock.length}
                </span>
              </div>
            </div>
            <button
              onClick={exportLowStockReport}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
            >
              <Download size={18} />
              Export Alert Report
            </button>
          </div>
        </div>

        {/* Detailed Reports Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl shadow-lg">
              <FileText size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Quick Export Options
              </h3>
              <p className="text-sm text-gray-600">
                Download comprehensive reports
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => {
                const summaryData = [
                  {
                    "Report Period": `${dateRange.start} to ${dateRange.end}`,
                    "Total Sales": totalSales.toFixed(2),
                    "Total Transactions": totalTransactions,
                    "Average Transaction": averageTransaction.toFixed(2),
                    "Stock Value": totalStockValue.toFixed(2),
                    "Low Stock Items": reportData.lowStock.length,
                    "Total Medicines": reportData.stock.length,
                    "Generated At": new Date().toLocaleString(),
                  },
                ];
                generateCSV(summaryData, "pharmacy_summary");
              }}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
            >
              <Download size={20} />
              Export Performance Summary
            </button>

            <button
              onClick={() => {
                if (reportData.dailySales.length === 0) {
                  toast.warning("No daily sales data available");
                  return;
                }
                generateCSV(reportData.dailySales, "daily_sales_breakdown");
              }}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-xl hover:from-indigo-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
            >
              <Download size={20} />
              Export Daily Sales Breakdown
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyReports;

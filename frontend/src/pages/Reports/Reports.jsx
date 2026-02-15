import { useState, useEffect } from 'react';
import { medicinesAPI, suppliersAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { FileText, Download, Calendar, Package, AlertTriangle, TrendingUp } from 'lucide-react';
import Loading from '../../components/Common/Loading';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    medicines: [],
    suppliers: [],
    lowStockItems: [],
    totalValue: 0
  });

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const [medicinesRes, suppliersRes] = await Promise.all([
        medicinesAPI.getAll({ limit: 1000 }),
        suppliersAPI.getAll({ limit: 1000 })
      ]);

      const medicines = medicinesRes.data.data || [];
      const suppliers = suppliersRes.data.data || [];

      // Calculate low stock items
      const lowStockItems = medicines.filter(med => 
        (med.quantity_available || 0) <= (med.reorder_level || 10)
      );

      // Calculate total inventory value
      const totalValue = medicines.reduce((sum, med) => 
        sum + ((med.quantity_available || 0) * (med.unit_price || 0)), 0
      );

      setReportData({
        medicines,
        suppliers,
        lowStockItems,
        totalValue
      });
    } catch (error) {
      toast.error('Failed to fetch report data');
    } finally {
      setLoading(false);
    }
  };

  const generateCSV = (data, filename) => {
    if (data.length === 0) {
      toast.warning('No data to export');
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportMedicinesReport = () => {
    const exportData = reportData.medicines.map(med => ({
      Name: med.name,
      'Generic Name': med.generic_name || '',
      Category: med.category_name,
      Type: med.type_name,
      'Unit Price': med.unit_price,
      'Stock Quantity': med.quantity_available || 0,
      'Reorder Level': med.reorder_level,
      'Total Value': ((med.quantity_available || 0) * (med.unit_price || 0)).toFixed(2)
    }));
    generateCSV(exportData, 'medicines_inventory');
  };

  const exportLowStockReport = () => {
    const exportData = reportData.lowStockItems.map(med => ({
      Name: med.name,
      'Current Stock': med.quantity_available || 0,
      'Reorder Level': med.reorder_level,
      'Shortage': (med.reorder_level - (med.quantity_available || 0)),
      'Unit Price': med.unit_price,
      Category: med.category_name
    }));
    generateCSV(exportData, 'low_stock_report');
  };

  const exportSuppliersReport = () => {
    const exportData = reportData.suppliers.map(supplier => ({
      Name: supplier.name,
      'Contact Person': supplier.contact_person || '',
      Phone: supplier.phone,
      Email: supplier.email || '',
      Address: supplier.address || '',
      Status: supplier.is_active ? 'Active' : 'Inactive'
    }));
    generateCSV(exportData, 'suppliers_report');
  };

  if (loading) return <Loading />;

  const reportCards = [
    {
      title: 'Inventory Summary',
      icon: Package,
      color: 'bg-blue-500',
      stats: [
        { label: 'Total Medicines', value: reportData.medicines.length },
        { label: 'Total Inventory Value', value: `$${reportData.totalValue.toFixed(2)}` },
        { label: 'Active Suppliers', value: reportData.suppliers.filter(s => s.is_active).length }
      ],
      action: () => exportMedicinesReport(),
      actionLabel: 'Export Inventory'
    },
    {
      title: 'Low Stock Alert',
      icon: AlertTriangle,
      color: 'bg-red-500',
      stats: [
        { label: 'Items Below Reorder Level', value: reportData.lowStockItems.length },
        { label: 'Critical Stock Items', value: reportData.lowStockItems.filter(item => (item.quantity_available || 0) === 0).length },
        { label: 'Restock Required', value: reportData.lowStockItems.length > 0 ? 'Yes' : 'No' }
      ],
      action: () => exportLowStockReport(),
      actionLabel: 'Export Low Stock'
    },
    {
      title: 'Supplier Report',
      icon: TrendingUp,
      color: 'bg-green-500',
      stats: [
        { label: 'Total Suppliers', value: reportData.suppliers.length },
        { label: 'Active Suppliers', value: reportData.suppliers.filter(s => s.is_active).length },
        { label: 'Inactive Suppliers', value: reportData.suppliers.filter(s => !s.is_active).length }
      ],
      action: () => exportSuppliersReport(),
      actionLabel: 'Export Suppliers'
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-600 mt-1">Generate and export pharmacy reports</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar size={16} />
          <span>Generated: {new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {reportCards.map((report, index) => (
          <div key={index} className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className={`${report.color} bg-opacity-10 p-3 rounded-lg`}>
                <report.icon size={24} className={report.color.replace('bg-', 'text-')} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
            </div>

            <div className="space-y-3 mb-4">
              {report.stats.map((stat, statIndex) => (
                <div key={statIndex} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{stat.label}</span>
                  <span className="font-semibold text-gray-900">{stat.value}</span>
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

      {reportData.lowStockItems.length > 0 && (
        <div className="card bg-red-50 border-red-200 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="text-red-600" size={24} />
            <h3 className="text-lg font-semibold text-red-800">Critical Stock Levels</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-red-200">
                  <th className="text-left py-2 px-3 font-semibold text-red-700">Medicine</th>
                  <th className="text-left py-2 px-3 font-semibold text-red-700">Current Stock</th>
                  <th className="text-left py-2 px-3 font-semibold text-red-700">Reorder Level</th>
                  <th className="text-left py-2 px-3 font-semibold text-red-700">Shortage</th>
                </tr>
              </thead>
              <tbody>
                {reportData.lowStockItems.slice(0, 10).map((item) => (
                  <tr key={item.id} className="border-b border-red-100">
                    <td className="py-2 px-3 text-red-900">{item.name}</td>
                    <td className="py-2 px-3 text-red-700">{item.quantity_available || 0}</td>
                    <td className="py-2 px-3 text-red-700">{item.reorder_level}</td>
                    <td className="py-2 px-3 text-red-700">
                      {item.reorder_level - (item.quantity_available || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {reportData.lowStockItems.length > 10 && (
              <p className="text-sm text-red-600 mt-2 px-3">
                Showing 10 of {reportData.lowStockItems.length} low stock items
              </p>
            )}
          </div>
        </div>
      )}

      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <FileText size={24} className="text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Available Reports</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Medicine Inventory Report</h4>
            <p className="text-sm text-gray-600 mb-3">Complete list of all medicines with stock levels and values</p>
            <button onClick={exportMedicinesReport} className="btn btn-primary text-sm">
              Generate Report
            </button>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Low Stock Report</h4>
            <p className="text-sm text-gray-600 mb-3">Medicines that need immediate restocking attention</p>
            <button onClick={exportLowStockReport} className="btn btn-primary text-sm">
              Generate Report
            </button>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Supplier Directory</h4>
            <p className="text-sm text-gray-600 mb-3">Complete supplier contact information and status</p>
            <button onClick={exportSuppliersReport} className="btn btn-primary text-sm">
              Generate Report
            </button>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h4 className="font-medium text-gray-900 mb-2">Sales Report</h4>
            <p className="text-sm text-gray-600 mb-3">Coming soon - Sales transactions and revenue analysis</p>
            <button disabled className="btn btn-secondary text-sm opacity-50 cursor-not-allowed">
              Coming Soon
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
import { useState, useEffect } from "react";
import { suppliersAPI } from "../../services/api";
import { toast } from "react-toastify";
import { Building2, Save, CreditCard } from "lucide-react";

const BankAccountSettings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [supplierInfo, setSupplierInfo] = useState(null);
  const [formData, setFormData] = useState({
    bank_name: "",
    account_number: "",
    account_holder_name: "",
  });

  useEffect(() => {
    loadSupplierInfo();
  }, []);

  const loadSupplierInfo = async () => {
    try {
      setLoading(true);
      const response = await suppliersAPI.getMyInfo();
      setSupplierInfo(response.data);
      setFormData({
        bank_name: response.data.bank_name || "",
        account_number: response.data.account_number || "",
        account_holder_name: response.data.account_holder_name || "",
      });
    } catch (error) {
      console.error("Failed to load supplier info:", error);
      toast.error("Failed to load supplier information");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await suppliersAPI.updateBankAccount(formData);
      toast.success("Bank account information updated successfully");
      loadSupplierInfo();
    } catch (error) {
      console.error("Failed to update bank account:", error);
      toast.error(
        error.response?.data?.message || "Failed to update bank account",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
              <Building2 size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Bank Account Settings
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your payment receiving account
              </p>
            </div>
          </div>
        </div>

        {/* Supplier Info */}
        {supplierInfo && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Supplier Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Company Name</p>
                <p className="font-semibold text-gray-900">
                  {supplierInfo.name}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Contact Person</p>
                <p className="font-semibold text-gray-900">
                  {supplierInfo.contact_person || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-semibold text-gray-900">
                  {supplierInfo.phone}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-gray-900">
                  {supplierInfo.email || "N/A"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Bank Account Form */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <CreditCard size={24} className="text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">
              Payment Account Details
            </h2>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> Pharmacists will use this information
              to send payments for purchase orders. Please ensure all details
              are accurate.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Bank Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bank Name <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.bank_name}
                onChange={(e) =>
                  setFormData({ ...formData, bank_name: e.target.value })
                }
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select Bank</option>
                <option value="CBE">Commercial Bank of Ethiopia (CBE)</option>
                <option value="Dashen Bank">Dashen Bank</option>
                <option value="Awash Bank">Awash Bank</option>
              </select>
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Account Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.account_number}
                onChange={(e) =>
                  setFormData({ ...formData, account_number: e.target.value })
                }
                required
                placeholder="Enter your account number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Account Holder Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Account Holder Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.account_holder_name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    account_holder_name: e.target.value,
                  })
                }
                required
                placeholder="Enter account holder name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Name as it appears on the bank account
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Save Bank Account
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Current Account Display */}
          {supplierInfo?.bank_name && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Current Account on File
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Bank:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {supplierInfo.bank_name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Account Number:</span>
                  <span className="text-sm font-mono font-semibold text-gray-900">
                    {supplierInfo.account_number}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Account Holder:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {supplierInfo.account_holder_name}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BankAccountSettings;

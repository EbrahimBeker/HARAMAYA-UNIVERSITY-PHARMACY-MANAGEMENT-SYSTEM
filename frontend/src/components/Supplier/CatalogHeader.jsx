import { Plus, Upload, Download } from "lucide-react";

const CatalogHeader = ({
  onDownloadTemplate,
  onFileUpload,
  onAddItem,
  uploadingFile,
  supplierId,
}) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Drug Catalog</h1>
        <p className="text-gray-600">
          Manage your available medicines and prices
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={onDownloadTemplate}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          <Download size={18} />
          Template
        </button>
        <label className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer">
          <Upload size={18} />
          {uploadingFile ? "Uploading..." : "Upload Excel/CSV"}
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={onFileUpload}
            disabled={uploadingFile || !supplierId}
            className="hidden"
          />
        </label>
        <button
          onClick={onAddItem}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Item
        </button>
      </div>
    </div>
  );
};

export default CatalogHeader;

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCatalogData } from "../../hooks/useCatalogData";
import { useCatalogActions } from "../../hooks/useCatalogActions";

// Components
import CatalogHeader from "../../components/Supplier/CatalogHeader";
import CatalogStats from "../../components/Supplier/CatalogStats";
import CatalogTable from "../../components/Supplier/CatalogTable";
import CatalogItemModal from "../../components/Supplier/CatalogItemModal";
import LoadingState from "../../components/Supplier/LoadingState";
import NoSupplierLinked from "../../components/Supplier/NoSupplierLinked";

const SupplierCatalog = () => {
  const { user } = useAuth();
  const { catalog, medicines, stats, loading, supplierId, loadData } =
    useCatalogData();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    medicine_id: "",
    unit_price: "",
    quantity_available: 0,
    minimum_order_quantity: 1,
    is_available: true,
    notes: "",
  });

  const {
    uploadingFile,
    handleFileUpload,
    handleSubmit,
    handleDelete,
    downloadTemplate,
  } = useCatalogActions(supplierId, loadData);

  const resetForm = () => {
    setFormData({
      medicine_id: "",
      unit_price: "",
      quantity_available: 0,
      minimum_order_quantity: 1,
      is_available: true,
      notes: "",
    });
    setEditingItem(null);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      medicine_id: item.medicine_id,
      unit_price: item.unit_price,
      quantity_available: item.quantity_available,
      minimum_order_quantity: item.minimum_order_quantity,
      is_available: item.is_available,
      notes: item.notes || "",
    });
    setShowAddModal(true);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    handleSubmit(formData, editingItem, resetForm, setShowAddModal);
  };

  const onClose = () => {
    setShowAddModal(false);
    resetForm();
  };

  if (loading) {
    return <LoadingState message="Loading catalog..." />;
  }

  if (!supplierId && !loading) {
    return <NoSupplierLinked user={user} />;
  }

  return (
    <div className="p-6 space-y-6">
      <CatalogHeader
        onDownloadTemplate={downloadTemplate}
        onFileUpload={handleFileUpload}
        onAddItem={() => setShowAddModal(true)}
        uploadingFile={uploadingFile}
        supplierId={supplierId}
      />

      <CatalogStats stats={stats} />

      <CatalogTable
        catalog={catalog}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDownloadTemplate={downloadTemplate}
        onAddItem={() => setShowAddModal(true)}
      />

      <CatalogItemModal
        show={showAddModal}
        editingItem={editingItem}
        formData={formData}
        medicines={medicines}
        onSubmit={onSubmit}
        onClose={onClose}
        onChange={setFormData}
      />
    </div>
  );
};

export default SupplierCatalog;

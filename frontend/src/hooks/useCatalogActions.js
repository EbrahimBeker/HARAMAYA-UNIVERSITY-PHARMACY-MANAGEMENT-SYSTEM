import { useState } from "react";
import { supplierCatalogAPI } from "../services/api";
import { toast } from "react-toastify";

export const useCatalogActions = (supplierId, loadData) => {
  const [uploadingFile, setUploadingFile] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log("File selected:", file.name, file.type, file.size);

    if (!supplierId) {
      toast.error("Supplier ID not found. Please refresh the page.");
      console.error("Supplier ID is null");
      return;
    }

    console.log("Uploading with supplier_id:", supplierId);

    try {
      setUploadingFile(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("supplier_id", supplierId);

      console.log("Sending bulk upload request...");
      const response = await supplierCatalogAPI.bulkUpload(formData);
      console.log("Upload response:", response.data);

      toast.success(
        `Upload completed: ${response.data.successCount} items added/updated, ${response.data.errorCount} errors`,
      );

      if (response.data.errors && response.data.errors.length > 0) {
        console.log("Upload errors:", response.data.errors);
        toast.warning(`Some items had errors. Check console for details.`);
      }

      loadData();
    } catch (error) {
      console.error("Upload error:", error);
      console.error("Error response:", error.response?.data);
      toast.error(error.response?.data?.message || "Upload failed");
    } finally {
      setUploadingFile(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (
    formData,
    editingItem,
    resetForm,
    setShowAddModal,
  ) => {
    try {
      if (!supplierId) {
        toast.error("Supplier ID not found");
        return;
      }

      await supplierCatalogAPI.upsert({
        supplier_id: supplierId,
        ...formData,
      });

      toast.success(
        editingItem ? "Item updated successfully" : "Item added successfully",
      );
      setShowAddModal(false);
      resetForm();
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;

    try {
      await supplierCatalogAPI.delete(id);
      toast.success("Item deleted successfully");
      loadData();
    } catch (error) {
      toast.error("Failed to delete item");
    }
  };

  const downloadTemplate = () => {
    const template = `medicine_name,unit_price,quantity_available,minimum_order_quantity,notes
Paracetamol,5.50,1000,10,Pain reliever
Amoxicillin,12.00,500,5,Antibiotic
Ibuprofen,8.75,750,10,Anti-inflammatory
Omeprazole,15.00,300,5,Acid reflux medication
Amlodipine,20.00,400,5,Blood pressure medication`;

    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "supplier_catalog_template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return {
    uploadingFile,
    handleFileUpload,
    handleSubmit,
    handleDelete,
    downloadTemplate,
  };
};

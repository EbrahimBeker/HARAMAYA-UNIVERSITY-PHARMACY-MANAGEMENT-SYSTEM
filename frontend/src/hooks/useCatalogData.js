import { useState, useEffect } from "react";
import { supplierCatalogAPI, medicinesAPI } from "../services/api";
import { toast } from "react-toastify";

export const useCatalogData = () => {
  const [catalog, setCatalog] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [stats, setStats] = useState({
    totalItems: 0,
    availableItems: 0,
    totalValue: 0,
  });
  const [loading, setLoading] = useState(false);
  const [supplierId, setSupplierId] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);

      // First get supplier ID for current user
      const catalogRes = await supplierCatalogAPI.getAll();
      console.log("Catalog response:", catalogRes.data);

      const currentSupplierId =
        catalogRes.data.supplier_id ||
        (catalogRes.data.data && catalogRes.data.data.length > 0
          ? catalogRes.data.data[0].supplier_id
          : null);

      console.log("Current supplier ID:", currentSupplierId);
      setSupplierId(currentSupplierId);

      if (!currentSupplierId) {
        toast.error(
          "No supplier account linked to your user. Please contact admin.",
        );
        setLoading(false);
        return;
      }

      const [medicinesRes, statsRes] = await Promise.all([
        medicinesAPI.getAll({ limit: 1000 }),
        supplierCatalogAPI.getStats(),
      ]);

      setCatalog(catalogRes.data.data || []);
      setMedicines(medicinesRes.data.data || []);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load catalog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    catalog,
    medicines,
    stats,
    loading,
    supplierId,
    loadData,
  };
};

import { useState, useEffect } from 'react';
import { medicinesAPI, categoriesAPI, typesAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import Modal from '../../components/Common/Modal';
import Loading from '../../components/Common/Loading';
import { useAuth } from '../../context/AuthContext';

const Medicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { hasAnyRole } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    generic_name: '',
    category_id: '',
    type_id: '',
    strength: '',
    unit: '',
    reorder_level: 10,
    unit_price: '',
    requires_prescription: false,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [medicinesRes, categoriesRes, typesRes] = await Promise.all([
        medicinesAPI.getAll(),
        categoriesAPI.getAll(),
        typesAPI.getAll(),
      ]);
      setMedicines(medicinesRes.data.data || []);
      setCategories(categoriesRes.data || []);
      setTypes(typesRes.data || []);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMedicine) {
        await medicinesAPI.update(editingMedicine.id, formData);
        toast.success('Medicine updated successfully');
      } else {
        await medicinesAPI.create(formData);
        toast.success('Medicine created successfully');
      }
      fetchData();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        await medicinesAPI.delete(id);
        toast.success('Medicine deleted successfully');
        fetchData();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Delete failed');
      }
    }
  };

  const openModal = (medicine = null) => {
    if (medicine) {
      setEditingMedicine(medicine);
      setFormData({
        name: medicine.name,
        generic_name: medicine.generic_name || '',
        category_id: medicine.category_id,
        type_id: medicine.type_id,
        strength: medicine.strength || '',
        unit: medicine.unit,
        reorder_level: medicine.reorder_level,
        unit_price: medicine.unit_price,
        requires_prescription: medicine.requires_prescription,
      });
    } else {
      setEditingMedicine(null);
      setFormData({
        name: '',
        generic_name: '',
        category_id: '',
        type_id: '',
        strength: '',
        unit: '',
        reorder_level: 10,
        unit_price: '',
        requires_prescription: false,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMedicine(null);
  };

  const filteredMedicines = medicines.filter((medicine) =>
    medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (medicine.generic_name && medicine.generic_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const canEdit = hasAnyRole(['System Administrator', 'Pharmacist']);

  if (loading) return <Loading />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Medicines</h1>
        {canEdit && (
          <button className="btn btn-primary flex items-center gap-2" onClick={() => openModal()}>
            <Plus size={18} />
            Add Medicine
          </button>
        )}
      </div>

      <div className="mb-6 relative">
        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search medicines..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Generic Name</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Category</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Type</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Strength</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Unit Price</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-700">Stock</th>
              {canEdit && <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filteredMedicines.length === 0 ? (
              <tr>
                <td colSpan={canEdit ? 8 : 7} className="text-center py-8 text-gray-500">
                  No medicines found
                </td>
              </tr>
            ) : (
              filteredMedicines.map((medicine) => (
                <tr key={medicine.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">{medicine.name}</td>
                  <td className="py-3 px-4 text-gray-600">{medicine.generic_name || '-'}</td>
                  <td className="py-3 px-4">{medicine.category_name}</td>
                  <td className="py-3 px-4">{medicine.type_name}</td>
                  <td className="py-3 px-4 text-gray-600">{medicine.strength || '-'}</td>
                  <td className="py-3 px-4">${medicine.unit_price}</td>
                  <td className="py-3 px-4">
                    <span className={`badge ${medicine.quantity_available <= medicine.reorder_level ? 'badge-danger' : 'badge-success'}`}>
                      {medicine.quantity_available || 0}
                    </span>
                  </td>
                  {canEdit && (
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button 
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                          onClick={() => openModal(medicine)}
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                          onClick={() => handleDelete(medicine.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingMedicine ? 'Edit Medicine' : 'Add Medicine'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Medicine Name *</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="form-label">Generic Name</label>
            <input
              type="text"
              className="form-input"
              value={formData.generic_name}
              onChange={(e) => setFormData({ ...formData, generic_name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Category *</label>
              <select
                className="form-input"
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Type *</label>
              <select
                className="form-input"
                value={formData.type_id}
                onChange={(e) => setFormData({ ...formData, type_id: e.target.value })}
                required
              >
                <option value="">Select Type</option>
                {types.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Strength</label>
              <input
                type="text"
                className="form-input"
                value={formData.strength}
                onChange={(e) => setFormData({ ...formData, strength: e.target.value })}
                placeholder="e.g., 500mg"
              />
            </div>

            <div>
              <label className="form-label">Unit *</label>
              <input
                type="text"
                className="form-input"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="e.g., tablet"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Unit Price *</label>
              <input
                type="number"
                step="0.01"
                className="form-input"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                required
              />
            </div>

            <div>
              <label className="form-label">Reorder Level</label>
              <input
                type="number"
                className="form-input"
                value={formData.reorder_level}
                onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.requires_prescription}
                onChange={(e) => setFormData({ ...formData, requires_prescription: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Requires Prescription</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" className="btn btn-secondary" onClick={closeModal}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingMedicine ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Medicines;

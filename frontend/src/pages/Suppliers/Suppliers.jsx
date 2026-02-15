import { useState, useEffect } from 'react';
import { suppliersAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { Plus, Edit, Trash2, Search, Phone, Mail, MapPin, Package } from 'lucide-react';
import Modal from '../../components/Common/Modal';
import Loading from '../../components/Common/Loading';
import { useAuth } from '../../context/AuthContext';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { hasAnyRole } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    is_active: true
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await suppliersAPI.getAll();
      setSuppliers(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSupplier) {
        await suppliersAPI.update(editingSupplier.id, formData);
        toast.success('Supplier updated successfully');
      } else {
        await suppliersAPI.create(formData);
        toast.success('Supplier created successfully');
      }
      fetchSuppliers();
      closeModal();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await suppliersAPI.delete(id);
        toast.success('Supplier deleted successfully');
        fetchSuppliers();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Delete failed');
      }
    }
  };

  const openModal = (supplier = null) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        name: supplier.name,
        contact_person: supplier.contact_person || '',
        email: supplier.email || '',
        phone: supplier.phone,
        address: supplier.address || '',
        is_active: supplier.is_active
      });
    } else {
      setEditingSupplier(null);
      setFormData({
        name: '',
        contact_person: '',
        email: '',
        phone: '',
        address: '',
        is_active: true
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSupplier(null);
  };

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (supplier.contact_person && supplier.contact_person.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (supplier.email && supplier.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const canEdit = hasAnyRole(['System Administrator', 'Pharmacist']);

  if (loading) return <Loading />;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Suppliers</h1>
        {canEdit && (
          <button className="btn btn-primary flex items-center gap-2" onClick={() => openModal()}>
            <Plus size={18} />
            Add Supplier
          </button>
        )}
      </div>

      <div className="mb-6 relative">
        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search suppliers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500">
            <Package size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No suppliers found</p>
          </div>
        ) : (
          filteredSuppliers.map((supplier) => (
            <div key={supplier.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{supplier.name}</h3>
                <span className={`badge ${supplier.is_active ? 'badge-success' : 'badge-danger'}`}>
                  {supplier.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                {supplier.contact_person && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                    <span className="text-sm">{supplier.contact_person}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-gray-600">
                  <Phone size={16} className="text-green-500" />
                  <span className="text-sm">{supplier.phone}</span>
                </div>

                {supplier.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail size={16} className="text-blue-500" />
                    <span className="text-sm">{supplier.email}</span>
                  </div>
                )}

                {supplier.address && (
                  <div className="flex items-start gap-2 text-gray-600">
                    <MapPin size={16} className="text-red-500 mt-0.5" />
                    <span className="text-sm">{supplier.address}</span>
                  </div>
                )}
              </div>

              {canEdit && (
                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <button 
                    className="flex-1 btn btn-secondary text-sm py-2" 
                    onClick={() => openModal(supplier)}
                  >
                    <Edit size={14} className="mr-1" />
                    Edit
                  </button>
                  <button 
                    className="flex-1 btn btn-danger text-sm py-2" 
                    onClick={() => handleDelete(supplier.id)}
                  >
                    <Trash2 size={14} className="mr-1" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingSupplier ? 'Edit Supplier' : 'Add Supplier'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="form-label">Company Name *</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="Ethiopian Pharmaceuticals"
            />
          </div>

          <div>
            <label className="form-label">Contact Person</label>
            <input
              type="text"
              className="form-input"
              value={formData.contact_person}
              onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
              placeholder="Abebe Kebede"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Phone *</label>
              <input
                type="tel"
                className="form-input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                placeholder="+251116123456"
              />
            </div>

            <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@supplier.com"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Address</label>
            <textarea
              className="form-input"
              rows="3"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Street address, City, Region"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Active Supplier</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" className="btn btn-secondary" onClick={closeModal}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingSupplier ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Suppliers;
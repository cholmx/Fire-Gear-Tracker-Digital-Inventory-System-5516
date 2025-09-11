import React,{useState,useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import {useData} from '../contexts/DataContext';
import SafeIcon from '../common/SafeIcon';
import Modal from '../components/Modal';
import * as FiIcons from 'react-icons/fi';

const {FiPlus,FiSearch,FiEdit,FiTrash2,FiPhone,FiMail,FiUser,FiTool,FiMapPin,FiGlobe}=FiIcons;

const Vendors=()=> {
  const location=useLocation();
  const {vendors,addVendor,updateVendor,deleteVendor}=useData();
  const [searchTerm,setSearchTerm]=useState('');
  const [showAddModal,setShowAddModal]=useState(false);
  const [showEditModal,setShowEditModal]=useState(false);
  const [selectedVendor,setSelectedVendor]=useState(null);
  const [formData,setFormData]=useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    website: '',
    services: '',
    certifications: '',
    notes: ''
  });

  // Auto-open add modal if navigated from dashboard
  useEffect(()=> {
    if (location.state?.openAddModal) {
      setShowAddModal(true);
    }
  },[location.state]);

  const filteredVendors=vendors.filter(vendor=> 
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (vendor.contactPerson && vendor.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (vendor.services && vendor.services.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddVendor=(e)=> {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      alert('Company name is required');
      return;
    }

    try {
      addVendor(formData);
      setFormData({
        name: '',
        contactPerson: '',
        phone: '',
        email: '',
        address: '',
        website: '',
        services: '',
        certifications: '',
        notes: ''
      });
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding vendor:',error);
      alert('Error adding vendor. Please try again.');
    }
  };

  const handleEditVendor=(e)=> {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Company name is required');
      return;
    }

    try {
      updateVendor(selectedVendor.id,formData);
      setShowEditModal(false);
      setSelectedVendor(null);
    } catch (error) {
      console.error('Error updating vendor:',error);
      alert('Error updating vendor. Please try again.');
    }
  };

  const openEditModal=(vendor)=> {
    setSelectedVendor(vendor);
    setFormData({
      name: vendor.name || '',
      contactPerson: vendor.contactPerson || '',
      phone: vendor.phone || '',
      email: vendor.email || '',
      address: vendor.address || '',
      website: vendor.website || '',
      services: vendor.services || '',
      certifications: vendor.certifications || '',
      notes: vendor.notes || ''
    });
    setShowEditModal(true);
  };

  const handleDeleteVendor=(vendor)=> {
    if (confirm(`Are you sure you want to delete ${vendor.name}? This action cannot be undone.`)) {
      try {
        deleteVendor(vendor.id);
      } catch (error) {
        console.error('Error deleting vendor:',error);
        alert('Error deleting vendor. Please try again.');
      }
    }
  };

  const resetForm=()=> {
    setFormData({
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      website: '',
      services: '',
      certifications: '',
      notes: ''
    });
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-inter-tight font-bold text-mission-text-primary">Vendors</h1>
          <p className="text-base font-inter text-mission-text-secondary mt-1">
            Manage external service providers and inspection vendors
          </p>
        </div>
        <button
          onClick={()=> {
            resetForm();
            setShowAddModal(true);
          }}
          className="flex items-center space-x-1 bg-fire-red hover:bg-fire-red-dark text-white px-3 py-1.5 rounded text-xs font-roboto-mono font-medium transition-colors mt-4 sm:mt-0"
        >
          <SafeIcon icon={FiPlus} className="w-3 h-3" />
          <span>ADD VENDOR</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-mission-bg-secondary border border-mission-border rounded-lg p-3">
        <div className="relative">
          <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-mission-text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e)=> setSearchTerm(e.target.value)}
            placeholder="Search vendors..."
            className="w-full pl-9 pr-3 py-1.5 text-xs font-inter bg-mission-bg-tertiary border border-mission-border rounded text-mission-text-primary placeholder-mission-text-muted focus:outline-none focus:ring-1 focus:ring-fire-red focus:border-transparent"
          />
        </div>
      </div>

      {/* Vendors Grid */}
      {filteredVendors.length===0 ? (
        <div className="bg-mission-bg-secondary border border-mission-border rounded-lg">
          <div className="text-center py-12">
            <SafeIcon icon={FiTool} className="w-12 h-12 text-mission-text-muted mx-auto mb-4" />
            <p className="text-mission-text-secondary font-inter">
              {vendors.length===0 ? 'No vendors added yet' : 'No vendors found'}
            </p>
            <p className="text-mission-text-muted text-sm font-inter mb-4">
              {vendors.length===0 ? 'Add your first vendor to get started' : 'Try adjusting your search terms'}
            </p>
            {vendors.length===0 && (
              <button
                onClick={()=> {
                  resetForm();
                  setShowAddModal(true);
                }}
                className="inline-flex items-center space-x-1 bg-fire-red hover:bg-fire-red-dark text-white px-3 py-1.5 rounded text-xs font-roboto-mono font-medium transition-colors"
              >
                <SafeIcon icon={FiPlus} className="w-3 h-3" />
                <span>ADD VENDOR</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVendors.map((vendor)=> (
            <div
              key={vendor.id}
              className="bg-mission-bg-secondary border border-mission-border rounded-lg p-6 hover:border-mission-border-light transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-mission-accent-blue rounded-lg mission-glow">
                    <SafeIcon icon={FiTool} className="w-5 h-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-inter-tight font-semibold text-mission-text-primary truncate">
                      {vendor.name}
                    </h3>
                    {vendor.services && (
                      <p className="text-sm font-inter text-mission-text-muted truncate">
                        {vendor.services}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <button
                    onClick={()=> openEditModal(vendor)}
                    className="p-1 text-mission-text-muted hover:text-mission-text-primary hover:bg-mission-bg-primary rounded transition-colors"
                    title="Edit Vendor"
                  >
                    <SafeIcon icon={FiEdit} className="w-3 h-3" />
                  </button>
                  <button
                    onClick={()=> handleDeleteVendor(vendor)}
                    className="p-1 text-mission-text-muted hover:text-red-400 hover:bg-mission-bg-primary rounded transition-colors"
                    title="Delete Vendor"
                  >
                    <SafeIcon icon={FiTrash2} className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {vendor.contactPerson && (
                  <div className="flex items-center space-x-2">
                    <SafeIcon icon={FiUser} className="w-4 h-4 text-mission-text-muted flex-shrink-0" />
                    <p className="text-sm font-inter text-mission-text-secondary truncate">{vendor.contactPerson}</p>
                  </div>
                )}
                {vendor.phone && (
                  <div className="flex items-center space-x-2">
                    <SafeIcon icon={FiPhone} className="w-4 h-4 text-mission-text-muted flex-shrink-0" />
                    <p className="text-sm font-roboto-mono text-mission-text-secondary">{vendor.phone}</p>
                  </div>
                )}
                {vendor.email && (
                  <div className="flex items-center space-x-2">
                    <SafeIcon icon={FiMail} className="w-4 h-4 text-mission-text-muted flex-shrink-0" />
                    <p className="text-sm font-inter text-mission-text-secondary truncate">{vendor.email}</p>
                  </div>
                )}
                {vendor.address && (
                  <div className="flex items-start space-x-2">
                    <SafeIcon icon={FiMapPin} className="w-4 h-4 text-mission-text-muted flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-inter text-mission-text-secondary">{vendor.address}</p>
                  </div>
                )}
                {vendor.website && (
                  <div className="flex items-center space-x-2">
                    <SafeIcon icon={FiGlobe} className="w-4 h-4 text-mission-text-muted flex-shrink-0" />
                    <a
                      href={vendor.website.startsWith('http') ? vendor.website : `https://${vendor.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-inter text-mission-accent-blue hover:text-white transition-colors truncate"
                    >
                      {vendor.website}
                    </a>
                  </div>
                )}
              </div>

              {vendor.certifications && (
                <div className="mt-4 pt-4 border-t border-mission-border">
                  <p className="text-xs font-inter text-mission-text-muted mb-1">Certifications:</p>
                  <p className="text-sm font-inter text-mission-text-secondary">{vendor.certifications}</p>
                </div>
              )}

              {vendor.notes && (
                <div className="mt-4 pt-4 border-t border-mission-border">
                  <p className="text-xs font-inter text-mission-text-muted mb-1">Notes:</p>
                  <p className="text-sm font-inter text-mission-text-secondary line-clamp-2">{vendor.notes}</p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-mission-border">
                <p className="text-xs font-roboto-mono text-mission-text-muted">
                  Added {new Date(vendor.createdAt || vendor.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Vendor Modal */}
      <Modal 
        isOpen={showAddModal} 
        onClose={()=> {
          setShowAddModal(false);
          resetForm();
        }} 
        title="Add Vendor" 
        size="lg"
      >
        <form onSubmit={handleAddVendor} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                Company Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e)=> setFormData({...formData,name: e.target.value})}
                className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-mission-text-primary placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent font-inter"
                placeholder="e.g., ABC Fire Equipment Services"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                Contact Person
              </label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e)=> setFormData({...formData,contactPerson: e.target.value})}
                className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-mission-text-primary placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent font-inter"
                placeholder="Primary contact name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e)=> setFormData({...formData,phone: e.target.value})}
                className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-mission-text-primary placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent font-roboto-mono"
                placeholder="(555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e)=> setFormData({...formData,email: e.target.value})}
                className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-mission-text-primary placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent font-inter"
                placeholder="contact@vendor.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e)=> setFormData({...formData,website: e.target.value})}
                className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-mission-text-primary placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent font-inter"
                placeholder="https://vendor.com"
              />
            </div>
            <div>
              <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e)=> setFormData({...formData,address: e.target.value})}
                className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-mission-text-primary placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent font-inter"
                placeholder="Business address"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
              Services Provided
            </label>
            <textarea
              value={formData.services}
              onChange={(e)=> setFormData({...formData,services: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-mission-text-primary placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent font-inter"
              placeholder="e.g., SCBA testing, ladder inspections, pump testing"
            />
          </div>

          <div>
            <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
              Certifications
            </label>
            <textarea
              value={formData.certifications}
              onChange={(e)=> setFormData({...formData,certifications: e.target.value})}
              rows={2}
              className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-mission-text-primary placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent font-inter"
              placeholder="Relevant certifications and qualifications"
            />
          </div>

          <div>
            <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e)=> setFormData({...formData,notes: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-mission-text-primary placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent font-inter"
              placeholder="Additional notes, pricing info, or special instructions"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={()=> {
                setShowAddModal(false);
                resetForm();
              }}
              className="px-3 py-1.5 text-xs font-roboto-mono text-mission-text-muted hover:text-mission-text-primary transition-colors"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-fire-red hover:bg-fire-red-dark text-white rounded text-xs font-roboto-mono font-medium transition-colors"
            >
              ADD VENDOR
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Vendor Modal */}
      <Modal 
        isOpen={showEditModal} 
        onClose={()=> {
          setShowEditModal(false);
          setSelectedVendor(null);
        }} 
        title="Edit Vendor" 
        size="lg"
      >
        <form onSubmit={handleEditVendor} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                Company Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e)=> setFormData({...formData,name: e.target.value})}
                className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-mission-text-primary placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent font-inter"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                Contact Person
              </label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e)=> setFormData({...formData,contactPerson: e.target.value})}
                className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-mission-text-primary placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent font-inter"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e)=> setFormData({...formData,phone: e.target.value})}
                className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-mission-text-primary placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent font-roboto-mono"
              />
            </div>
            <div>
              <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e)=> setFormData({...formData,email: e.target.value})}
                className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-mission-text-primary placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent font-inter"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                Website
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e)=> setFormData({...formData,website: e.target.value})}
                className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-mission-text-primary placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent font-inter"
              />
            </div>
            <div>
              <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e)=> setFormData({...formData,address: e.target.value})}
                className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-mission-text-primary placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent font-inter"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
              Services Provided
            </label>
            <textarea
              value={formData.services}
              onChange={(e)=> setFormData({...formData,services: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-mission-text-primary placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent font-inter"
            />
          </div>

          <div>
            <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
              Certifications
            </label>
            <textarea
              value={formData.certifications}
              onChange={(e)=> setFormData({...formData,certifications: e.target.value})}
              rows={2}
              className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-mission-text-primary placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent font-inter"
            />
          </div>

          <div>
            <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e)=> setFormData({...formData,notes: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-mission-text-primary placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent font-inter"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={()=> {
                setShowEditModal(false);
                setSelectedVendor(null);
              }}
              className="px-3 py-1.5 text-xs font-roboto-mono text-mission-text-muted hover:text-mission-text-primary transition-colors"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-fire-red hover:bg-fire-red-dark text-white rounded text-xs font-roboto-mono font-medium transition-colors"
            >
              UPDATE VENDOR
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Vendors;
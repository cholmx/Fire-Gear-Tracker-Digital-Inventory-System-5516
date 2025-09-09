import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useData, EQUIPMENT_CATEGORIES, EQUIPMENT_STATUSES } from '../contexts/DataContext';
import SafeIcon from '../common/SafeIcon';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import InspectionBadge from '../components/InspectionBadge';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiSearch, FiEdit, FiTrash2, FiEye, FiFilter, FiAlertTriangle, FiPrinter, FiLock } = FiIcons;

const Equipment = () => {
  const location = useLocation();
  const { equipment, stations, addEquipment, updateEquipment, deleteEquipment, getInspectionStatus } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    serialNumber: '',
    manufacturer: '',
    model: '',
    category: '',
    subcategory: '',
    stationId: '',
    status: 'in-service',
    notes: ''
  });
  const [statusChangeNote, setStatusChangeNote] = useState('');
  const [showStatusNoteError, setShowStatusNoteError] = useState(false);

  // Auto-open add modal if navigated from dashboard
  useEffect(() => {
    if (location.state?.openAddModal) {
      setShowAddModal(true);
    }
  }, [location.state]);

  const filteredEquipment = equipment.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleAddEquipment = (e) => {
    e.preventDefault();
    if (!formData.stationId) {
      alert('Please select a station first');
      return;
    }

    // Check if status is not in-service and no note is provided
    if (formData.status !== 'in-service' && !formData.notes.trim()) {
      setShowStatusNoteError(true);
      return;
    }

    addEquipment(formData);
    setFormData({
      name: '',
      serialNumber: '',
      manufacturer: '',
      model: '',
      category: '',
      subcategory: '',
      stationId: '',
      status: 'in-service',
      notes: ''
    });
    setShowStatusNoteError(false);
    setShowAddModal(false);
  };

  const handleEditEquipment = (e) => {
    e.preventDefault();

    // Check if status changed from in-service to something else, or if current status is not in-service
    const originalStatus = selectedEquipment.status;
    const newStatus = formData.status;

    if (newStatus !== 'in-service') {
      // If status is not in-service, require a note
      if (!formData.notes.trim()) {
        setShowStatusNoteError(true);
        return;
      }

      // If status changed from in-service to something else, add a status change note
      if (originalStatus === 'in-service' && newStatus !== 'in-service') {
        if (!statusChangeNote.trim()) {
          setShowStatusNoteError(true);
          return;
        }

        // Append the status change note to existing notes
        const updatedNotes = formData.notes.trim()
          ? `${formData.notes}\n\n[${new Date().toLocaleString()}] Status changed to ${EQUIPMENT_STATUSES[newStatus].label}: ${statusChangeNote}`
          : `[${new Date().toLocaleString()}] Status changed to ${EQUIPMENT_STATUSES[newStatus].label}: ${statusChangeNote}`;

        formData.notes = updatedNotes;
      }
    }

    updateEquipment(selectedEquipment.id, formData);
    setShowEditModal(false);
    setSelectedEquipment(null);
    setStatusChangeNote('');
    setShowStatusNoteError(false);
  };

  const openEditModal = (item) => {
    setSelectedEquipment(item);
    setFormData({
      name: item.name,
      serialNumber: item.serialNumber,
      manufacturer: item.manufacturer,
      model: item.model,
      category: item.category,
      subcategory: item.subcategory,
      stationId: item.stationId,
      status: item.status,
      notes: item.notes || ''
    });
    setStatusChangeNote('');
    setShowStatusNoteError(false);
    setShowEditModal(true);
  };

  const openViewModal = (item) => {
    setSelectedEquipment(item);
    setShowViewModal(true);
  };

  const getStationName = (stationId) => {
    const station = stations.find(s => s.id === stationId);
    return station ? station.name : 'Unknown Station';
  };

  const handleStatusChange = (newStatus) => {
    const previousStatus = formData.status;
    setFormData({ ...formData, status: newStatus });
    setShowStatusNoteError(false);

    // Clear notes when status changes
    if (previousStatus !== newStatus) {
      setFormData(prev => ({
        ...prev,
        status: newStatus,
        notes: ''
      }));
    }

    // Clear status change note if going back to in-service
    if (newStatus === 'in-service') {
      setStatusChangeNote('');
    }
  };

  const printEquipmentDetails = (equipment) => {
    const station = stations.find(s => s.id === equipment.stationId);
    const category = EQUIPMENT_CATEGORIES[equipment.category];
    const status = EQUIPMENT_STATUSES[equipment.status];

    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Equipment Details - ${equipment.name}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Arial', sans-serif; margin: 8px; color: #000; background: #fff; line-height: 1.2; font-size: 9px; }
            .header { text-align: center; margin-bottom: 12px; border-bottom: 1px solid #000; padding-bottom: 8px; }
            .logo { font-size: 14px; font-weight: bold; margin-bottom: 4px; }
            .title { font-size: 12px; margin-bottom: 2px; }
            .date { font-size: 8px; }
            .equipment-details { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
            .detail-section { border: 1px solid #ccc; padding: 6px; border-radius: 3px; }
            .section-title { font-size: 10px; font-weight: bold; margin-bottom: 6px; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 2px; }
            .detail-item { margin-bottom: 3px; display: flex; }
            .label { font-weight: bold; display: inline-block; width: 60px; color: #555; font-size: 8px; }
            .value { flex: 1; color: #000; font-size: 8px; }
            .status-badge { display: inline-block; padding: 1px 4px; border-radius: 2px; font-size: 7px; font-weight: bold; text-transform: uppercase; }
            .status-in-service { background: #d4edda; color: #155724; }
            .status-out-of-service { background: #f8d7da; color: #721c24; }
            .status-out-for-repair { background: #fff3cd; color: #856404; }
            .status-cannot-locate { background: #ffeaa7; color: #6c757d; }
            .status-in-training { background: #cce5ff; color: #004085; }
            .status-other { background: #e2e3e5; color: #383d41; }
            .history-section { margin-top: 12px; page-break-inside: avoid; }
            .history-table { width: 100%; border-collapse: collapse; margin-top: 6px; }
            .history-table th, .history-table td { border: 1px solid #ddd; padding: 2px; text-align: left; vertical-align: top; font-size: 7px; }
            .history-table th { background-color: #f8f9fa; font-weight: bold; }
            .notes-section { margin-top: 8px; border: 1px solid #ccc; padding: 6px; border-radius: 3px; background-color: #f9f9f9; }
            .notes-content { white-space: pre-wrap; font-size: 7px; line-height: 1.2; }
            @media print { body { margin: 0; font-size: 8px; } .no-print { display: none; } .header { margin-bottom: 8px; } .equipment-details { gap: 8px; margin-bottom: 8px; } }
            .footer { margin-top: 12px; text-align: center; font-size: 6px; color: #666; border-top: 1px solid #ddd; padding-top: 4px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">🛡️ FIRE GEAR TRACKER</div>
            <div class="title">EQUIPMENT DETAILS REPORT</div>
            <div class="date">Generated: ${new Date().toLocaleString()}</div>
          </div>

          <div class="equipment-details">
            <div class="detail-section">
              <div class="section-title">Equipment Information</div>
              <div class="detail-item">
                <span class="label">Name:</span>
                <span class="value">${equipment.name}</span>
              </div>
              <div class="detail-item">
                <span class="label">Serial:</span>
                <span class="value">${equipment.serialNumber}</span>
              </div>
              <div class="detail-item">
                <span class="label">Mfg:</span>
                <span class="value">${equipment.manufacturer || 'N/A'}</span>
              </div>
              <div class="detail-item">
                <span class="label">Model:</span>
                <span class="value">${equipment.model || 'N/A'}</span>
              </div>
              <div class="detail-item">
                <span class="label">Category:</span>
                <span class="value">${category?.name || 'Unknown'}</span>
              </div>
              <div class="detail-item">
                <span class="label">Sub:</span>
                <span class="value">${equipment.subcategory || 'N/A'}</span>
              </div>
            </div>

            <div class="detail-section">
              <div class="section-title">Status & Location</div>
              <div class="detail-item">
                <span class="label">Status:</span>
                <span class="value">
                  <span class="status-badge status-${equipment.status.replace(/-/g, '-')}">
                    ${status?.label || 'Unknown'}
                  </span>
                </span>
              </div>
              <div class="detail-item">
                <span class="label">Station:</span>
                <span class="value">${station?.name || 'Unknown'}</span>
              </div>
              <div class="detail-item">
                <span class="label">Created:</span>
                <span class="value">${new Date(equipment.createdAt).toLocaleDateString()}</span>
              </div>
              <div class="detail-item">
                <span class="label">Updated:</span>
                <span class="value">${equipment.history?.length > 0 ? new Date(equipment.history[equipment.history.length - 1].date).toLocaleDateString() : 'Never'}</span>
              </div>
            </div>
          </div>

          ${equipment.notes ? `
            <div class="notes-section">
              <div class="section-title">Current Notes</div>
              <div class="notes-content">${equipment.notes}</div>
            </div>
          ` : ''}

          ${equipment.history && equipment.history.length > 0 ? `
            <div class="history-section">
              <div class="section-title">Equipment History (${equipment.history.length} entries)</div>
              <table class="history-table">
                <thead>
                  <tr>
                    <th style="width: 50px;">Date</th>
                    <th style="width: 60px;">Action</th>
                    <th style="width: 40px;">User</th>
                    <th>Details</th>
                    <th style="width: 60px;">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${equipment.history.slice(0, 10).map(entry => `
                    <tr>
                      <td>${new Date(entry.date).toLocaleDateString()}</td>
                      <td>${entry.action}</td>
                      <td>${entry.user.split(' ')[0]}</td>
                      <td>${entry.details}${entry.notes ? ` | ${entry.notes.substring(0, 50)}${entry.notes.length > 50 ? '...' : ''}` : ''}</td>
                      <td>${entry.previousStatus && entry.newStatus ? `${EQUIPMENT_STATUSES[entry.previousStatus]?.label || entry.previousStatus} → ${EQUIPMENT_STATUSES[entry.newStatus]?.label || entry.newStatus}` : entry.status ? EQUIPMENT_STATUSES[entry.status]?.label || entry.status : '-'}</td>
                    </tr>
                  `).join('')}
                  ${equipment.history.length > 10 ? `
                    <tr>
                      <td colspan="5" style="text-align: center; font-style: italic;">
                        ... and ${equipment.history.length - 10} more entries (showing most recent 10)
                      </td>
                    </tr>
                  ` : ''}
                </tbody>
              </table>
            </div>
          ` : ''}

          <div class="footer">
            <div>Fire Gear Tracker - Equipment Management System</div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-inter-tight font-bold text-white">Equipment</h1>
          <p className="text-base font-inter text-mission-text-secondary mt-1">
            Manage your fire department equipment inventory
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1 bg-fire-red hover:bg-fire-red-dark text-white px-3 py-1.5 rounded text-xs font-roboto-mono font-medium transition-colors mt-4 sm:mt-0"
        >
          <SafeIcon icon={FiPlus} className="w-3 h-3" />
          <span>ADD EQUIPMENT</span>
        </button>
      </div>

      {/* Show message if no stations exist */}
      {stations.length === 0 && (
        <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
          <div className="flex items-center">
            <SafeIcon icon={FiFilter} className="w-5 h-5 text-yellow-400 mr-3" />
            <div>
              <h3 className="text-yellow-400 font-medium">No Stations Found</h3>
              <p className="text-yellow-300 text-sm">
                You need to add at least one station before you can add equipment.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-mission-bg-secondary border border-mission-border rounded-lg p-3">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-3 lg:space-y-0 lg:space-x-3">
          <div className="flex-1">
            <div className="relative">
              <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-mission-text-muted" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search equipment..."
                className="w-full pl-9 pr-3 py-1.5 text-xs font-inter bg-mission-bg-tertiary border border-mission-border rounded text-white placeholder-mission-text-muted focus:outline-none focus:ring-1 focus:ring-fire-red focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2 py-1.5 text-xs font-inter bg-mission-bg-tertiary border border-mission-border rounded text-white focus:outline-none focus:ring-1 focus:ring-fire-red focus:border-transparent"
          >
            <option value="all">ALL STATUS</option>
            {Object.entries(EQUIPMENT_STATUSES).map(([key, status]) => (
              <option key={key} value={key}>{status.label.toUpperCase()}</option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2 py-1.5 text-xs font-inter bg-mission-bg-tertiary border border-mission-border rounded text-white focus:outline-none focus:ring-1 focus:ring-fire-red focus:border-transparent"
          >
            <option value="all">ALL CATEGORIES</option>
            {Object.entries(EQUIPMENT_CATEGORIES).map(([key, category]) => (
              <option key={key} value={key}>{category.name.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Equipment Table */}
      <div className="bg-mission-bg-secondary border border-mission-border rounded-lg overflow-hidden">
        {filteredEquipment.length === 0 ? (
          <div className="text-center py-12">
            <SafeIcon icon={FiFilter} className="w-12 h-12 text-mission-text-muted mx-auto mb-4" />
            <p className="text-mission-text-secondary">No equipment found</p>
            <p className="text-mission-text-muted text-sm mb-4">
              {equipment.length === 0 ? 'Add your first piece of equipment to get started' : 'Try adjusting your filters'}
            </p>
            {equipment.length === 0 && stations.length > 0 && (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center space-x-1 bg-fire-red hover:bg-fire-red-dark text-white px-3 py-1.5 rounded text-xs font-roboto-mono font-medium transition-colors"
              >
                <SafeIcon icon={FiPlus} className="w-3 h-3" />
                <span>ADD EQUIPMENT</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-mission-bg-tertiary border-b border-mission-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-inter font-medium text-mission-text-muted uppercase tracking-wider">Equipment</th>
                  <th className="px-6 py-3 text-left text-sm font-inter font-medium text-mission-text-muted uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-inter font-medium text-mission-text-muted uppercase tracking-wider">Station</th>
                  <th className="px-6 py-3 text-left text-sm font-inter font-medium text-mission-text-muted uppercase tracking-wider">Inspection</th>
                  <th className="px-6 py-3 text-left text-sm font-inter font-medium text-mission-text-muted uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mission-border">
                {filteredEquipment.map((item) => {
                  const inspectionStatus = getInspectionStatus(item.id);
                  return (
                    <tr key={item.id} className="hover:bg-mission-bg-primary/50 transition-colors">
                      <td className="px-6 py-3">
                        <div>
                          <div className="text-sm font-inter font-medium text-white">{item.name}</div>
                          <div className="text-sm font-roboto-mono text-mission-text-muted">
                            {item.serialNumber}
                            {(item.manufacturer || item.model) && (
                              <span className="ml-2 text-mission-text-muted">
                                • {item.manufacturer} {item.model}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="px-6 py-3 text-sm font-inter text-mission-text-secondary">
                        {getStationName(item.stationId)}
                      </td>
                      <td className="px-6 py-3">
                        {inspectionStatus ? (
                          <InspectionBadge inspectionStatus={inspectionStatus} />
                        ) : (
                          <span className="text-mission-text-muted text-sm">No inspections</span>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => openViewModal(item)}
                            className="p-1 text-mission-text-muted hover:text-mission-accent-blue hover:bg-mission-bg-primary rounded transition-colors"
                            title="View Details"
                          >
                            <SafeIcon icon={FiEye} className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => printEquipmentDetails(item)}
                            className="p-1 text-mission-text-muted hover:text-mission-accent-blue hover:bg-mission-bg-primary rounded transition-colors"
                            title="Print Details"
                          >
                            <SafeIcon icon={FiPrinter} className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1 text-mission-text-muted hover:text-white hover:bg-mission-bg-primary rounded transition-colors"
                            title="Edit Equipment"
                          >
                            <SafeIcon icon={FiEdit} className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this equipment?')) {
                                deleteEquipment(item.id);
                              }
                            }}
                            className="p-1 text-mission-text-muted hover:text-red-400 hover:bg-mission-bg-primary rounded transition-colors"
                            title="Delete Equipment"
                          >
                            <SafeIcon icon={FiTrash2} className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Equipment Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setShowStatusNoteError(false);
        }}
        title="Add Equipment"
        size="lg"
      >
        <form onSubmit={handleAddEquipment} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                Equipment Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-white placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent"
                placeholder="e.g., SCBA Unit, Fire Hose"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                Serial Number *
              </label>
              <input
                type="text"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-white placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent"
                placeholder="Serial or ID number"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                Manufacturer
              </label>
              <input
                type="text"
                value={formData.manufacturer}
                onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-white placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent"
                placeholder="e.g., MSA, Scott"
              />
            </div>
            <div>
              <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                Model
              </label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-white placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent"
                placeholder="Model number"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value, subcategory: '' })}
                className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent"
                required
              >
                <option value="">Select Category</option>
                {Object.entries(EQUIPMENT_CATEGORIES).map(([key, category]) => (
                  <option key={key} value={key}>{category.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                Subcategory
              </label>
              <select
                value={formData.subcategory}
                onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
                className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent"
                disabled={!formData.category}
              >
                <option value="">Select Subcategory</option>
                {formData.category && EQUIPMENT_CATEGORIES[formData.category]?.items.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                Station *
              </label>
              <select
                value={formData.stationId}
                onChange={(e) => setFormData({ ...formData, stationId: e.target.value })}
                className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent"
                required
              >
                <option value="">Select Station</option>
                {stations.map((station) => (
                  <option key={station.id} value={station.id}>{station.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent"
              >
                {Object.entries(EQUIPMENT_STATUSES).map(([key, status]) => (
                  <option key={key} value={key}>{status.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
              Notes {formData.status !== 'in-service' && <span className="text-fire-red">*</span>}
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => {
                setFormData({ ...formData, notes: e.target.value });
                setShowStatusNoteError(false);
              }}
              rows={3}
              className={`w-full px-3 py-2 bg-mission-bg-tertiary border rounded-lg text-white placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent ${showStatusNoteError && formData.status !== 'in-service' && !formData.notes.trim() ? 'border-red-500' : 'border-mission-border'}`}
              placeholder={formData.status !== 'in-service' ? "Required: Please explain why this equipment is not in service" : "Additional notes or details"}
              required={formData.status !== 'in-service'}
            />
            {showStatusNoteError && formData.status !== 'in-service' && !formData.notes.trim() && (
              <p className="text-red-400 text-sm mt-1">
                A note is required when equipment status is not "In Service"
              </p>
            )}
          </div>

          {formData.status !== 'in-service' && (
            <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <SafeIcon icon={FiAlertTriangle} className="w-4 h-4 text-yellow-400 mt-0.5" />
                <p className="text-yellow-300 text-sm">
                  Equipment with status "{EQUIPMENT_STATUSES[formData.status]?.label}" requires a detailed note explaining the reason.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowAddModal(false);
                setShowStatusNoteError(false);
              }}
              className="px-3 py-1.5 text-xs font-roboto-mono text-mission-text-muted hover:text-white transition-colors"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-fire-red hover:bg-fire-red-dark text-white rounded text-xs font-roboto-mono font-medium transition-colors"
            >
              ADD EQUIPMENT
            </button>
          </div>
        </form>
      </Modal>

      {/* View Equipment Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Equipment Details"
        size="xl"
      >
        {selectedEquipment && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-inter-tight font-bold text-white">
                {selectedEquipment.name}
              </h2>
              <button
                onClick={() => printEquipmentDetails(selectedEquipment)}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors"
              >
                <SafeIcon icon={FiPrinter} className="w-4 h-4" />
                <span className="text-sm font-inter">Print Details</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-inter-tight font-medium text-white mb-4">Basic Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-inter text-mission-text-muted">Name</label>
                    <p className="text-white font-inter">{selectedEquipment.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-inter text-mission-text-muted">Serial Number</label>
                    <p className="text-white font-roboto-mono">{selectedEquipment.serialNumber}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-inter text-mission-text-muted">Manufacturer</label>
                    <p className="text-white font-inter">{selectedEquipment.manufacturer || 'Not specified'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-inter text-mission-text-muted">Model</label>
                    <p className="text-white font-inter">{selectedEquipment.model || 'Not specified'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-inter-tight font-medium text-white mb-4">Status & Location</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-inter text-mission-text-muted">Status</label>
                    <StatusBadge status={selectedEquipment.status} />
                  </div>
                  <div>
                    <label className="block text-sm font-inter text-mission-text-muted">Station</label>
                    <p className="text-white font-inter">{getStationName(selectedEquipment.stationId)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-inter text-mission-text-muted">Category</label>
                    <p className="text-white font-inter">
                      {EQUIPMENT_CATEGORIES[selectedEquipment.category]?.name || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-inter text-mission-text-muted">Subcategory</label>
                    <p className="text-white font-inter">{selectedEquipment.subcategory || 'Not specified'}</p>
                  </div>
                </div>
              </div>
            </div>

            {selectedEquipment.notes && (
              <div>
                <h3 className="text-lg font-inter-tight font-medium text-white mb-2">Current Notes</h3>
                <div className="text-mission-text-secondary bg-mission-bg-tertiary rounded-lg p-3 whitespace-pre-wrap font-inter">
                  {selectedEquipment.notes}
                </div>
              </div>
            )}

            {selectedEquipment.history && selectedEquipment.history.length > 0 && (
              <div>
                <h3 className="text-lg font-inter-tight font-medium text-white mb-4">Equipment History</h3>
                <div className="bg-mission-bg-tertiary rounded-lg overflow-hidden">
                  <div className="max-h-96 overflow-y-auto">
                    <table className="w-full">
                      <thead className="bg-mission-bg-primary sticky top-0">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-inter font-medium text-mission-text-muted uppercase">Date</th>
                          <th className="px-4 py-2 text-left text-xs font-inter font-medium text-mission-text-muted uppercase">Action</th>
                          <th className="px-4 py-2 text-left text-xs font-inter font-medium text-mission-text-muted uppercase">Details</th>
                          <th className="px-4 py-2 text-left text-xs font-inter font-medium text-mission-text-muted uppercase">User</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-mission-border">
                        {selectedEquipment.history
                          .sort((a, b) => new Date(b.date) - new Date(a.date))
                          .map((entry, index) => (
                            <tr key={index} className="hover:bg-mission-bg-primary/50">
                              <td className="px-4 py-3">
                                <div className="text-sm font-inter text-white">
                                  {new Date(entry.date).toLocaleDateString()}
                                </div>
                                <div className="text-xs font-roboto-mono text-mission-text-muted">
                                  {new Date(entry.date).toLocaleTimeString()}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-sm font-inter font-medium text-white">{entry.action}</div>
                                {(entry.previousStatus && entry.newStatus) && (
                                  <div className="text-xs font-roboto-mono text-mission-text-muted">
                                    {EQUIPMENT_STATUSES[entry.previousStatus]?.label} → {EQUIPMENT_STATUSES[entry.newStatus]?.label}
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-sm font-inter text-mission-text-secondary">{entry.details}</div>
                                {entry.notes && (
                                  <div className="text-sm font-inter text-mission-text-muted italic mt-1">{entry.notes}</div>
                                )}
                                {entry.cost && (
                                  <div className="text-sm font-roboto-mono text-green-400 font-medium mt-1">Cost: ${entry.cost}</div>
                                )}
                                {entry.vendor && (
                                  <div className="text-sm font-inter text-mission-text-muted mt-1">Vendor: {entry.vendor}</div>
                                )}
                                {entry.performedBy && (
                                  <div className="text-sm font-inter text-mission-text-muted mt-1">Performed by: {entry.performedBy}</div>
                                )}
                              </td>
                              <td className="px-4 py-3 text-sm font-inter text-mission-text-muted">{entry.user}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Edit Equipment Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setShowStatusNoteError(false);
          setStatusChangeNote('');
        }}
        title="Edit Equipment"
        size="lg"
      >
        <form onSubmit={handleEditEquipment} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                Equipment Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.name}
                  className="w-full px-3 py-2 bg-mission-bg-primary border border-mission-border-light rounded-lg text-mission-text-muted cursor-not-allowed"
                  readOnly
                />
                <SafeIcon icon={FiLock} className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-mission-text-muted" />
              </div>
              <p className="text-xs font-inter text-mission-text-muted mt-1">Equipment name cannot be changed after creation</p>
            </div>
            <div>
              <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                Serial Number *
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.serialNumber}
                  className="w-full px-3 py-2 bg-mission-bg-primary border border-mission-border-light rounded-lg text-mission-text-muted cursor-not-allowed"
                  readOnly
                />
                <SafeIcon icon={FiLock} className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-mission-text-muted" />
              </div>
              <p className="text-xs font-inter text-mission-text-muted mt-1">Serial number cannot be changed after creation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                Manufacturer
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.manufacturer}
                  className="w-full px-3 py-2 bg-mission-bg-primary border border-mission-border-light rounded-lg text-mission-text-muted cursor-not-allowed"
                  readOnly
                />
                <SafeIcon icon={FiLock} className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-mission-text-muted" />
              </div>
              <p className="text-xs font-inter text-mission-text-muted mt-1">Manufacturer cannot be changed after creation</p>
            </div>
            <div>
              <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                Model
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.model}
                  className="w-full px-3 py-2 bg-mission-bg-primary border border-mission-border-light rounded-lg text-mission-text-muted cursor-not-allowed"
                  readOnly
                />
                <SafeIcon icon={FiLock} className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-mission-text-muted" />
              </div>
              <p className="text-xs font-inter text-mission-text-muted mt-1">Model cannot be changed after creation</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                Station *
              </label>
              <select
                value={formData.stationId}
                onChange={(e) => setFormData({ ...formData, stationId: e.target.value })}
                className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent"
                required
              >
                <option value="">Select Station</option>
                {stations.map((station) => (
                  <option key={station.id} value={station.id}>{station.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent"
              >
                {Object.entries(EQUIPMENT_STATUSES).map(([key, status]) => (
                  <option key={key} value={key}>{status.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Show status change note field if changing from in-service to something else */}
          {selectedEquipment && selectedEquipment.status === 'in-service' && formData.status !== 'in-service' && (
            <div>
              <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                Reason for Status Change <span className="text-fire-red">*</span>
              </label>
              <textarea
                value={statusChangeNote}
                onChange={(e) => {
                  setStatusChangeNote(e.target.value);
                  setShowStatusNoteError(false);
                }}
                rows={3}
                className={`w-full px-3 py-2 bg-mission-bg-tertiary border rounded-lg text-white placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent ${showStatusNoteError && !statusChangeNote.trim() ? 'border-red-500' : 'border-mission-border'}`}
                placeholder="Required: Explain why this equipment is being taken out of service"
                required
              />
              {showStatusNoteError && !statusChangeNote.trim() && (
                <p className="text-red-400 text-sm font-inter mt-1">
                  Please provide a reason for changing the equipment status
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
              Notes {formData.status !== 'in-service' && <span className="text-fire-red">*</span>}
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => {
                setFormData({ ...formData, notes: e.target.value });
                setShowStatusNoteError(false);
              }}
              rows={4}
              className={`w-full px-3 py-2 bg-mission-bg-tertiary border rounded-lg text-white placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent ${showStatusNoteError && formData.status !== 'in-service' && !formData.notes.trim() ? 'border-red-500' : 'border-mission-border'}`}
              placeholder={formData.status !== 'in-service' ? "Required: Please provide detailed notes for equipment not in service" : "Additional notes or details"}
              required={formData.status !== 'in-service'}
            />
            {showStatusNoteError && formData.status !== 'in-service' && !formData.notes.trim() && (
              <p className="text-red-400 text-sm font-inter mt-1">
                Notes are required when equipment status is not "In Service"
              </p>
            )}
          </div>

          {formData.status !== 'in-service' && (
            <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <SafeIcon icon={FiAlertTriangle} className="w-4 h-4 text-yellow-400 mt-0.5" />
                <p className="text-yellow-300 text-sm font-inter">
                  Equipment with status "{EQUIPMENT_STATUSES[formData.status]?.label}" requires detailed notes explaining the current condition and reason for the status.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowEditModal(false);
                setShowStatusNoteError(false);
                setStatusChangeNote('');
              }}
              className="px-3 py-1.5 text-xs font-roboto-mono text-mission-text-muted hover:text-white transition-colors"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-fire-red hover:bg-fire-red-dark text-white rounded text-xs font-roboto-mono font-medium transition-colors"
            >
              UPDATE EQUIPMENT
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Equipment;
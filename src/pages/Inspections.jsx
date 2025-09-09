import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useData, INSPECTION_TEMPLATES, EQUIPMENT_CATEGORIES } from '../contexts/DataContext';
import { format, addMonths, addDays, differenceInDays } from 'date-fns';
import SafeIcon from '../common/SafeIcon';
import Modal from '../components/Modal';
import InspectionBadge from '../components/InspectionBadge';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiCalendar, FiCheckSquare, FiClock, FiAlertTriangle, FiTrash2, FiLayers, FiPrinter, FiCheck } = FiIcons;

const Inspections = () => {
  const location = useLocation();
  const { equipment, stations, inspections, categoryInspections, addInspection, addCategoryInspection, updateInspection, updateCategoryInspection, deleteInspection, deleteCategoryInspection, getInspectionStatus } = useData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [inspectionType, setInspectionType] = useState('individual'); // 'individual' or 'category'
  const [formData, setFormData] = useState({
    equipmentId: '',
    category: '',
    stationId: '',
    templateId: '',
    customName: '',
    dueDate: '',
    notes: '',
    externalVendor: false,
    vendorContact: ''
  });

  // Auto-open add modal if navigated from dashboard
  useEffect(() => {
    if (location.state?.openAddModal) {
      setShowAddModal(true);
    }
  }, [location.state]);

  const handleAddInspection = (e) => {
    e.preventDefault();
    const template = INSPECTION_TEMPLATES[formData.templateId];
    
    const inspectionData = {
      name: formData.customName || template?.name || 'Custom Inspection',
      dueDate: formData.dueDate,
      notes: formData.notes,
      externalVendor: formData.externalVendor,
      vendorContact: formData.vendorContact,
      status: 'scheduled',
      templateId: formData.templateId
    };

    if (inspectionType === 'individual') {
      inspectionData.equipmentId = formData.equipmentId;
      addInspection(inspectionData);
    } else {
      inspectionData.category = formData.category;
      inspectionData.stationId = formData.stationId || null; // null means all stations
      addCategoryInspection(inspectionData);
    }

    setFormData({
      equipmentId: '',
      category: '',
      stationId: '',
      templateId: '',
      customName: '',
      dueDate: '',
      notes: '',
      externalVendor: false,
      vendorContact: ''
    });
    setShowAddModal(false);
  };

  const handleCompleteInspection = () => {
    if (!selectedInspection) return;

    const template = INSPECTION_TEMPLATES[selectedInspection.templateId];
    if (template) {
      // Calculate next due date based on template interval
      const nextDueDate = addMonths(new Date(selectedInspection.dueDate), template.interval);
      const updatedInspection = {
        ...selectedInspection,
        dueDate: nextDueDate.toISOString().split('T')[0],
        lastCompleted: new Date().toISOString(),
        status: 'scheduled'
      };

      if (selectedInspection.type === 'category') {
        updateCategoryInspection(selectedInspection.id, updatedInspection);
      } else {
        updateInspection(selectedInspection.id, updatedInspection);
      }
    }

    setShowCompleteModal(false);
    setSelectedInspection(null);
  };

  const printInspectionList = (inspection) => {
    let equipmentList = [];
    if (inspection.type === 'category') {
      // Get all equipment in this category
      equipmentList = equipment.filter(item => {
        const matchesCategory = item.category === inspection.category;
        const matchesStation = !inspection.stationId || item.stationId === inspection.stationId;
        return matchesCategory && matchesStation;
      });
    } else {
      // Get the specific equipment item
      const item = equipment.find(e => e.id === inspection.equipmentId);
      if (item) equipmentList = [item];
    }

    // Create print content
    const printWindow = window.open('', '_blank');
    const stationName = inspection.stationId ? getStationName(inspection.stationId) : 'All Stations';
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Inspection Checklist - ${inspection.name}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: 'Arial', sans-serif; 
            margin: 8px; 
            color: #000; 
            background: #fff; 
            line-height: 1.2; 
            font-size: 9px;
          }
          .header { 
            text-align: center; 
            margin-bottom: 12px; 
            border-bottom: 1px solid #000; 
            padding-bottom: 8px; 
          }
          .logo { font-size: 14px; font-weight: bold; margin-bottom: 4px; }
          .title { font-size: 12px; margin-bottom: 2px; }
          .date { font-size: 8px; }
          .inspection-details { 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 12px; 
            margin-bottom: 12px; 
          }
          .detail-section { 
            border: 1px solid #ccc; 
            padding: 6px; 
            border-radius: 3px; 
          }
          .section-title { 
            font-size: 10px; 
            font-weight: bold; 
            margin-bottom: 6px; 
            color: #333; 
            border-bottom: 1px solid #ddd; 
            padding-bottom: 2px; 
          }
          .detail-item { 
            margin-bottom: 3px; 
            display: flex; 
          }
          .label { 
            font-weight: bold; 
            display: inline-block; 
            width: 60px; 
            color: #555; 
            font-size: 8px;
          }
          .value { 
            flex: 1; 
            color: #000; 
            font-size: 8px;
          }
          .equipment-list { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 12px; 
          }
          .equipment-list th, .equipment-list td { 
            border: 1px solid #ddd; 
            padding: 2px; 
            text-align: left; 
            vertical-align: top; 
            font-size: 7px;
          }
          .equipment-list th { 
            background-color: #f8f9fa; 
            font-weight: bold; 
          }
          .checkbox { 
            width: 12px; 
            height: 12px; 
            border: 1px solid #000; 
            display: inline-block; 
            margin-right: 4px; 
          }
          .signature-section { 
            margin-top: 12px; 
            display: grid; 
            grid-template-columns: 1fr 1fr; 
            gap: 20px; 
          }
          .signature-box { 
            border-top: 1px solid #000; 
            padding-top: 6px; 
            text-align: center; 
            font-size: 7px;
          }
          .notes-section { 
            margin-top: 12px; 
            page-break-inside: avoid; 
          }
          .notes-box { 
            border: 1px solid #ddd; 
            min-height: 40px; 
            padding: 4px; 
            margin-top: 4px; 
          }
          @media print { 
            body { margin: 0; font-size: 8px; } 
            .no-print { display: none; }
            .header { margin-bottom: 8px; }
            .inspection-details { gap: 8px; margin-bottom: 8px; }
            .signature-section { gap: 15px; }
          }
          .footer { 
            margin-top: 12px; 
            text-align: center; 
            font-size: 6px; 
            color: #666; 
            border-top: 1px solid #ddd; 
            padding-top: 4px; 
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🛡️ FIRE GEAR TRACKER</div>
          <div class="title">INSPECTION CHECKLIST</div>
          <div class="date">Generated: ${new Date().toLocaleString()}</div>
        </div>

        <div class="inspection-details">
          <div class="detail-section">
            <div class="section-title">Inspection Information</div>
            <div class="detail-item">
              <span class="label">Name:</span>
              <span class="value">${inspection.name}</span>
            </div>
            <div class="detail-item">
              <span class="label">Type:</span>
              <span class="value">${inspection.type === 'category' ? 'CATEGORY INSPECTION' : 'INDIVIDUAL EQUIPMENT'}</span>
            </div>
            <div class="detail-item">
              <span class="label">Due:</span>
              <span class="value">${format(new Date(inspection.dueDate), 'MMM dd, yyyy')}</span>
            </div>
            ${inspection.type === 'category' ? `
              <div class="detail-item">
                <span class="label">Category:</span>
                <span class="value">${getCategoryName(inspection.category)}</span>
              </div>
            ` : ''}
          </div>
          
          <div class="detail-section">
            <div class="section-title">Inspection Details</div>
            <div class="detail-item">
              <span class="label">Station:</span>
              <span class="value">${stationName}</span>
            </div>
            <div class="detail-item">
              <span class="label">Date:</span>
              <span class="value">___________</span>
            </div>
            <div class="detail-item">
              <span class="label">Inspector:</span>
              <span class="value">___________</span>
            </div>
            <div class="detail-item">
              <span class="label">Items:</span>
              <span class="value">${equipmentList.length}</span>
            </div>
          </div>
        </div>

        <table class="equipment-list">
          <thead>
            <tr>
              <th style="width: 20px;">✓</th>
              <th>EQUIPMENT</th>
              <th>SERIAL</th>
              <th>MFG</th>
              <th>STATUS</th>
              <th>NOTES</th>
            </tr>
          </thead>
          <tbody>
            ${equipmentList.map(item => `
              <tr>
                <td><span class="checkbox"></span></td>
                <td><strong>${item.name}</strong></td>
                <td>${item.serialNumber}</td>
                <td>${item.manufacturer || 'N/A'}</td>
                <td>${item.status.toUpperCase()}</td>
                <td style="width: 80px;"></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="notes-section">
          <div class="section-title">Inspection Notes & Observations</div>
          <div class="notes-box"></div>
        </div>

        <div class="signature-section">
          <div class="signature-box">
            <strong>INSPECTOR SIGNATURE</strong><br>
            Date: __________
          </div>
          <div class="signature-box">
            <strong>SUPERVISOR SIGNATURE</strong><br>
            Date: __________
          </div>
        </div>

        <div class="footer">
          Generated by Fire Gear Tracker • ${new Date().toLocaleString()}
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const getEquipmentName = (equipmentId) => {
    const item = equipment.find(e => e.id === equipmentId);
    return item ? `${item.name} (${item.serialNumber})` : 'Unknown Equipment';
  };

  const getStationName = (stationId) => {
    const station = stations.find(s => s.id === stationId);
    return station ? station.name : 'All Stations';
  };

  const getCategoryName = (categoryId) => {
    return EQUIPMENT_CATEGORIES[categoryId]?.name || 'Unknown Category';
  };

  const canCompleteInspection = (inspection) => {
    const dueDate = new Date(inspection.dueDate);
    const today = new Date();
    const daysUntilDue = differenceInDays(dueDate, today);
    // Show complete button if due date is within 30 days (1 month)
    return daysUntilDue <= 30;
  };

  const getInspectionsWithStatus = () => {
    const individualInspections = inspections.map(inspection => ({
      ...inspection,
      type: 'individual',
      inspectionStatus: getInspectionStatus(inspection.equipmentId)
    }));

    const categoryInspectionsWithStatus = categoryInspections.map(inspection => ({
      ...inspection,
      type: 'category',
      inspectionStatus: {
        status: 'upcoming',
        days: Math.ceil((new Date(inspection.dueDate) - new Date()) / (1000 * 60 * 60 * 24))
      }
    }));

    return [...individualInspections, ...categoryInspectionsWithStatus];
  };

  const filteredInspections = getInspectionsWithStatus().filter(inspection => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'due-week') {
      // Filter for inspections due in 1-7 days
      return inspection.inspectionStatus?.status === 'critical' || inspection.inspectionStatus?.status === 'warning';
    }
    return inspection.inspectionStatus?.status === filterStatus;
  });

  const overdueInspections = filteredInspections
    .filter(inspection => inspection.inspectionStatus?.status === 'past-due');

  const dueThisWeekInspections = filteredInspections
    .filter(inspection => 
      inspection.inspectionStatus?.status === 'critical' ||
      inspection.inspectionStatus?.status === 'warning'
    );

  // Card click handlers
  const handleCardClick = (status) => {
    setFilterStatus(status);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-inter-tight font-bold text-white">Inspections</h1>
          <p className="text-base font-inter text-mission-text-secondary mt-1">
            Manage equipment inspection schedules and compliance
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1 bg-fire-red hover:bg-fire-red-dark text-white px-3 py-1.5 rounded text-xs font-roboto-mono font-medium transition-colors mt-4 sm:mt-0"
        >
          <SafeIcon icon={FiPlus} className="w-3 h-3" />
          <span>SCHEDULE</span>
        </button>
      </div>

      {/* Show message if no equipment exists */}
      {equipment.length === 0 && (
        <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
          <div className="flex items-center">
            <SafeIcon icon={FiAlertTriangle} className="w-5 h-5 text-yellow-400 mr-3" />
            <div>
              <h3 className="text-yellow-400 font-medium">No Equipment Found</h3>
              <p className="text-yellow-300 text-sm">
                You need to add equipment before you can schedule inspections.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => handleCardClick('all')}
          className={`bg-mission-bg-secondary border border-mission-border rounded-lg p-4 hover:border-mission-border-light transition-all duration-200 text-left ${
            filterStatus === 'all' ? 'ring-2 ring-fire-red border-fire-red' : ''
          }`}
        >
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 bg-mission-accent-blue/20 rounded-lg">
              <SafeIcon icon={FiCalendar} className="w-5 h-5 text-mission-accent-blue" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-roboto-mono text-mission-text-muted uppercase">TOTAL SCHEDULED</p>
              <p className="text-xl font-roboto-mono font-bold text-white">
                {inspections.length + categoryInspections.length}
              </p>
            </div>
          </div>
        </button>

        <button
          onClick={() => handleCardClick('past-due')}
          className={`bg-mission-bg-secondary border border-mission-border rounded-lg p-4 hover:border-mission-border-light transition-all duration-200 text-left ${
            filterStatus === 'past-due' ? 'ring-2 ring-fire-red border-fire-red' : ''
          }`}
        >
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 bg-red-500/20 rounded-lg">
              <SafeIcon icon={FiAlertTriangle} className="w-5 h-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-roboto-mono text-mission-text-muted uppercase">OVERDUE</p>
              <p className="text-xl font-roboto-mono font-bold text-white">{overdueInspections.length}</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => handleCardClick('due-week')}
          className={`bg-mission-bg-secondary border border-mission-border rounded-lg p-4 hover:border-mission-border-light transition-all duration-200 text-left ${
            filterStatus === 'due-week' ? 'ring-2 ring-fire-red border-fire-red' : ''
          }`}
        >
          <div className="flex items-center">
            <div className="flex items-center justify-center w-10 h-10 bg-mission-accent-orange/20 rounded-lg">
              <SafeIcon icon={FiClock} className="w-5 h-5 text-mission-accent-orange" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-roboto-mono text-mission-text-muted uppercase">DUE THIS WEEK</p>
              <p className="text-xl font-roboto-mono font-bold text-white">{dueThisWeekInspections.length}</p>
            </div>
          </div>
        </button>
      </div>

      {/* Filter */}
      <div className="bg-mission-bg-secondary border border-mission-border rounded-lg p-3">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-2 py-1 text-xs font-roboto-mono bg-mission-bg-tertiary border border-mission-border rounded text-white focus:outline-none focus:ring-1 focus:ring-fire-red focus:border-transparent"
        >
          <option value="all">ALL INSPECTIONS</option>
          <option value="past-due">PAST DUE</option>
          <option value="due-week">DUE THIS WEEK (1-7 DAYS)</option>
          <option value="attention">ATTENTION (8-14 DAYS)</option>
          <option value="normal">NORMAL (15-30 DAYS)</option>
          <option value="upcoming">UPCOMING (30+ DAYS)</option>
        </select>
      </div>

      {/* Overdue Alert */}
      {overdueInspections.length > 0 && (
        <div className="bg-red-950/20 border border-red-800/30 rounded-lg p-4">
          <div className="flex items-center">
            <SafeIcon icon={FiAlertTriangle} className="w-5 h-5 text-red-400 mr-3" />
            <div>
              <h3 className="text-red-400 font-medium">Overdue Inspections</h3>
              <p className="text-red-300 text-sm">
                {overdueInspections.length} inspection{overdueInspections.length !== 1 ? 's are' : ' is'} overdue and require immediate attention
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Inspections List */}
      <div className="bg-mission-bg-secondary border border-mission-border rounded-lg overflow-hidden">
        {filteredInspections.length === 0 ? (
          <div className="text-center py-12">
            <SafeIcon icon={FiCalendar} className="w-12 h-12 text-mission-text-muted mx-auto mb-4" />
            <p className="text-mission-text-secondary">No inspections scheduled</p>
            <p className="text-mission-text-muted text-sm mb-4">
              {inspections.length + categoryInspections.length === 0
                ? 'Schedule your first inspection to get started'
                : 'Try adjusting your filter'}
            </p>
            {inspections.length + categoryInspections.length === 0 && equipment.length > 0 && (
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center space-x-1 bg-fire-red hover:bg-fire-red-dark text-white px-3 py-1.5 rounded text-xs font-roboto-mono font-medium transition-colors"
              >
                <SafeIcon icon={FiPlus} className="w-3 h-3" />
                <span>SCHEDULE</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-mission-bg-tertiary border-b border-mission-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-inter font-medium text-mission-text-muted uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-inter font-medium text-mission-text-muted uppercase tracking-wider">
                    Equipment/Category
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-inter font-medium text-mission-text-muted uppercase tracking-wider">
                    Inspection
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-inter font-medium text-mission-text-muted uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-inter font-medium text-mission-text-muted uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-inter font-medium text-mission-text-muted uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mission-border">
                {filteredInspections.map((inspection) => (
                  <tr key={inspection.id} className="hover:bg-mission-bg-primary/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <SafeIcon
                          icon={inspection.type === 'category' ? FiLayers : FiCheckSquare}
                          className={`w-4 h-4 ${
                            inspection.type === 'category' ? 'text-mission-accent-purple' : 'text-mission-accent-blue'
                          }`}
                        />
                        <span
                          className={`text-sm font-roboto-mono ${
                            inspection.type === 'category' ? 'text-mission-accent-purple' : 'text-mission-accent-blue'
                          }`}
                        >
                          {inspection.type === 'category' ? 'CATEGORY' : 'INDIVIDUAL'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-inter font-medium text-white">
                        {inspection.type === 'category'
                          ? getCategoryName(inspection.category)
                          : getEquipmentName(inspection.equipmentId)}
                      </div>
                      {inspection.type === 'category' && (
                        <div className="text-xs font-roboto-mono text-mission-text-muted">
                          {inspection.stationId ? getStationName(inspection.stationId) : 'All Stations'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-inter text-white">{inspection.name}</div>
                      {inspection.notes && (
                        <div className="text-xs font-roboto-mono text-mission-text-muted">{inspection.notes}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-roboto-mono text-mission-text-secondary">
                      {format(new Date(inspection.dueDate), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4">
                      {inspection.inspectionStatus ? (
                        <InspectionBadge inspectionStatus={inspection.inspectionStatus} />
                      ) : (
                        <span className="text-mission-text-muted text-sm">Unknown</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => printInspectionList(inspection)}
                          className="p-1 text-mission-text-muted hover:text-mission-accent-blue hover:bg-mission-bg-primary rounded transition-colors"
                          title="Print Inspection List"
                        >
                          <SafeIcon icon={FiPrinter} className="w-3 h-3" />
                        </button>
                        {canCompleteInspection(inspection) && (
                          <button
                            onClick={() => {
                              setSelectedInspection(inspection);
                              setShowCompleteModal(true);
                            }}
                            className="p-1 text-mission-text-muted hover:text-mission-accent-green hover:bg-mission-bg-primary rounded transition-colors"
                            title="Mark as Complete"
                          >
                            <SafeIcon icon={FiCheck} className="w-3 h-3" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this inspection?')) {
                              if (inspection.type === 'category') {
                                deleteCategoryInspection(inspection.id);
                              } else {
                                deleteInspection(inspection.id);
                              }
                            }
                          }}
                          className="p-1 text-mission-text-muted hover:text-red-400 hover:bg-mission-bg-primary rounded transition-colors"
                        >
                          <SafeIcon icon={FiTrash2} className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Inspection Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Schedule Inspection"
        size="lg"
      >
        <form onSubmit={handleAddInspection} className="space-y-4">
          <div>
            <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
              Inspection Type *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setInspectionType('individual')}
                className={`p-3 rounded-lg border transition-colors ${
                  inspectionType === 'individual'
                    ? 'border-fire-red bg-fire-red/10 text-fire-red'
                    : 'border-mission-border bg-mission-bg-tertiary text-mission-text-secondary hover:border-mission-border-light'
                }`}
              >
                <SafeIcon icon={FiCheckSquare} className="w-5 h-5 mx-auto mb-1" />
                <div className="text-sm font-inter font-medium">Individual Equipment</div>
                <div className="text-xs font-roboto-mono text-mission-text-muted">Single item</div>
              </button>
              <button
                type="button"
                onClick={() => setInspectionType('category')}
                className={`p-3 rounded-lg border transition-colors ${
                  inspectionType === 'category'
                    ? 'border-fire-red bg-fire-red/10 text-fire-red'
                    : 'border-mission-border bg-mission-bg-tertiary text-mission-text-secondary hover:border-mission-border-light'
                }`}
              >
                <SafeIcon icon={FiLayers} className="w-5 h-5 mx-auto mb-1" />
                <div className="text-sm font-inter font-medium">Category Rule</div>
                <div className="text-xs font-roboto-mono text-mission-text-muted">All in category</div>
              </button>
            </div>
          </div>

          {inspectionType === 'individual' ? (
            <div>
              <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                Equipment *
              </label>
              <select
                value={formData.equipmentId}
                onChange={(e) => setFormData({ ...formData, equipmentId: e.target.value })}
                className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent"
                required
              >
                <option value="">Select Equipment</option>
                {equipment.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.serialNumber})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                  Equipment Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent"
                  required
                >
                  <option value="">Select Category</option>
                  {Object.entries(EQUIPMENT_CATEGORIES).map(([key, category]) => (
                    <option key={key} value={key}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                  Station (Optional)
                </label>
                <select
                  value={formData.stationId}
                  onChange={(e) => setFormData({ ...formData, stationId: e.target.value })}
                  className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent"
                >
                  <option value="">All Stations</option>
                  {stations.map((station) => (
                    <option key={station.id} value={station.id}>
                      {station.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
              Inspection Template
            </label>
            <select
              value={formData.templateId}
              onChange={(e) => {
                const template = INSPECTION_TEMPLATES[e.target.value];
                setFormData({
                  ...formData,
                  templateId: e.target.value,
                  externalVendor: template?.external || false
                });
              }}
              className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent"
            >
              <option value="">Select Template (or create custom)</option>
              {Object.entries(INSPECTION_TEMPLATES)
                .filter(([key, template]) => {
                  if (inspectionType === 'individual') return true;
                  return template.categories && template.categories.includes(formData.category);
                })
                .map(([key, template]) => (
                  <option key={key} value={key}>
                    {template.name} {template.external && '(External)'}
                  </option>
                ))}
            </select>
          </div>

          {!formData.templateId && (
            <div>
              <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                Custom Inspection Name *
              </label>
              <input
                type="text"
                value={formData.customName}
                onChange={(e) => setFormData({ ...formData, customName: e.target.value })}
                className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-white placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent"
                required={!formData.templateId}
                placeholder="Enter inspection name"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
              Due Date *
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent"
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="externalVendor"
              checked={formData.externalVendor}
              onChange={(e) => setFormData({ ...formData, externalVendor: e.target.checked })}
              className="rounded border-mission-border text-fire-red focus:ring-fire-red focus:ring-offset-mission-bg-secondary"
            />
            <label htmlFor="externalVendor" className="ml-2 text-sm font-inter text-mission-text-secondary">
              Requires external vendor
            </label>
          </div>

          {formData.externalVendor && (
            <div>
              <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
                Vendor Contact
              </label>
              <input
                type="text"
                value={formData.vendorContact}
                onChange={(e) => setFormData({ ...formData, vendorContact: e.target.value })}
                className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-white placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent"
                placeholder="Vendor name or contact info"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-white placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent"
              placeholder="Additional notes or requirements"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="px-3 py-1.5 text-xs font-roboto-mono text-mission-text-muted hover:text-white transition-colors"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-fire-red hover:bg-fire-red-dark text-white rounded text-xs font-roboto-mono font-medium transition-colors"
            >
              SCHEDULE
            </button>
          </div>
        </form>
      </Modal>

      {/* Complete Inspection Modal */}
      <Modal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        title="Complete Inspection"
        size="md"
      >
        {selectedInspection && (
          <div className="space-y-4">
            <div className="bg-mission-bg-tertiary rounded-lg p-4">
              <h3 className="text-base font-inter-tight font-bold text-white mb-2">
                {selectedInspection.name}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-mission-text-muted">Type:</span>
                  <span className="text-white font-roboto-mono">
                    {selectedInspection.type === 'category' ? 'CATEGORY' : 'INDIVIDUAL'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-mission-text-muted">Current Due Date:</span>
                  <span className="text-white font-roboto-mono">
                    {format(new Date(selectedInspection.dueDate), 'MMM dd, yyyy')}
                  </span>
                </div>
                {INSPECTION_TEMPLATES[selectedInspection.templateId] && (
                  <div className="flex justify-between">
                    <span className="text-mission-text-muted">Next Due Date:</span>
                    <span className="text-mission-accent-green font-roboto-mono">
                      {format(
                        addMonths(
                          new Date(selectedInspection.dueDate),
                          INSPECTION_TEMPLATES[selectedInspection.templateId].interval
                        ),
                        'MMM dd, yyyy'
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <SafeIcon icon={FiAlertTriangle} className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <h4 className="text-yellow-400 font-medium text-sm">Important</h4>
                  <p className="text-yellow-300 text-sm">
                    Marking this inspection as complete will automatically schedule the next inspection based on the template interval. Make sure the inspection has actually been performed.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setShowCompleteModal(false)}
                className="px-3 py-1.5 text-xs font-roboto-mono text-mission-text-muted hover:text-white transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={handleCompleteInspection}
                className="px-3 py-1.5 bg-mission-accent-green hover:bg-green-600 text-white rounded text-xs font-roboto-mono font-medium transition-colors"
              >
                MARK COMPLETE
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Inspections;
import React,{useState,useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import {useData} from '../contexts/DataContext';
import SafeIcon from '../common/SafeIcon';
import Modal from '../components/Modal';
import * as FiIcons from 'react-icons/fi';

const {FiPlus,FiMapPin,FiEdit,FiTrash2,FiPhone}=FiIcons;

const Stations=()=> {
  const location=useLocation();
  const {stations,equipment,addStation,updateStation,deleteStation}=useData();
  const [showAddModal,setShowAddModal]=useState(false);
  const [showEditModal,setShowEditModal]=useState(false);
  const [selectedStation,setSelectedStation]=useState(null);
  const [formData,setFormData]=useState({
    name: '',
    address: '',
    phone: ''
  });

  // Auto-open add modal if navigated from dashboard
  useEffect(()=> {
    if (location.state?.openAddModal) {
      setShowAddModal(true);
    }
  },[location.state]);

  const handleAddStation=(e)=> {
    e.preventDefault();
    addStation(formData);
    setFormData({name: '',address: '',phone: ''});
    setShowAddModal(false);
  };

  const handleEditStation=(e)=> {
    e.preventDefault();
    updateStation(selectedStation.id,formData);
    setShowEditModal(false);
    setSelectedStation(null);
  };

  const openEditModal=(station)=> {
    setSelectedStation(station);
    setFormData({
      name: station.name,
      address: station.address || '',
      phone: station.phone || ''
    });
    setShowEditModal(true);
  };

  const getEquipmentCount=(stationId)=> {
    return equipment.filter(item=> item.stationId===stationId).length;
  };

  const handleDeleteStation=(station)=> {
    const equipmentCount=getEquipmentCount(station.id);
    if (equipmentCount > 0) {
      if (!confirm(`This station has ${equipmentCount} equipment items. Deleting it will also remove all associated equipment. Continue?`)) {
        return;
      }
    }
    deleteStation(station.id);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-inter-tight font-bold text-mission-text-primary">Stations</h1>
          <p className="text-base font-inter text-mission-text-secondary mt-1">
            Manage your fire department stations and locations
          </p>
        </div>
        <button
          onClick={()=> setShowAddModal(true)}
          className="flex items-center space-x-1 bg-fire-red hover:bg-fire-red-dark text-white px-3 py-1.5 rounded text-xs font-roboto-mono font-medium transition-colors mt-4 sm:mt-0"
        >
          <SafeIcon icon={FiPlus} className="w-3 h-3" />
          <span>ADD STATION</span>
        </button>
      </div>

      {/* Stations Grid */}
      {stations.length===0 ? (
        <div className="bg-mission-bg-secondary border border-mission-border rounded-lg">
          <div className="text-center py-12">
            <SafeIcon icon={FiMapPin} className="w-12 h-12 text-mission-text-muted mx-auto mb-4" />
            <p className="text-mission-text-secondary font-inter">No stations added yet</p>
            <p className="text-mission-text-muted text-sm font-inter mb-4">Add your first station to get started</p>
            <button
              onClick={()=> setShowAddModal(true)}
              className="inline-flex items-center space-x-1 bg-fire-red hover:bg-fire-red-dark text-white px-3 py-1.5 rounded text-xs font-roboto-mono font-medium transition-colors"
            >
              <SafeIcon icon={FiPlus} className="w-3 h-3" />
              <span>ADD STATION</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stations.map((station)=> (
            <div key={station.id} className="bg-mission-bg-secondary border border-mission-border rounded-lg p-6 hover:border-mission-border-light transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-fire-red rounded-lg mission-glow-red">
                    <SafeIcon icon={FiMapPin} className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-inter-tight font-semibold text-mission-text-primary">
                      {station.name}
                    </h3>
                    <p className="text-sm font-roboto-mono text-mission-text-muted">
                      {getEquipmentCount(station.id)} equipment items
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={()=> openEditModal(station)}
                    className="p-1 text-mission-text-muted hover:text-mission-text-primary hover:bg-mission-bg-primary rounded transition-colors"
                    title="Edit Station"
                  >
                    <SafeIcon icon={FiEdit} className="w-3 h-3" />
                  </button>
                  <button
                    onClick={()=> handleDeleteStation(station)}
                    className="p-1 text-mission-text-muted hover:text-red-400 hover:bg-mission-bg-primary rounded transition-colors"
                    title="Delete Station"
                  >
                    <SafeIcon icon={FiTrash2} className="w-3 h-3" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {station.address && (
                  <div className="flex items-start space-x-2">
                    <SafeIcon icon={FiMapPin} className="w-4 h-4 text-mission-text-muted mt-0.5 flex-shrink-0" />
                    <p className="text-sm font-inter text-mission-text-secondary">{station.address}</p>
                  </div>
                )}
                {station.phone && (
                  <div className="flex items-center space-x-2">
                    <SafeIcon icon={FiPhone} className="w-4 h-4 text-mission-text-muted flex-shrink-0" />
                    <p className="text-sm font-roboto-mono text-mission-text-secondary">{station.phone}</p>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-mission-border">
                <p className="text-xs font-roboto-mono text-mission-text-muted">
                  Added {new Date(station.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Station Modal */}
      <Modal isOpen={showAddModal} onClose={()=> setShowAddModal(false)} title="Add Station">
        <form onSubmit={handleAddStation} className="space-y-4">
          <div>
            <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
              Station Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e)=> setFormData({...formData,name: e.target.value})}
              className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-mission-text-primary placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent font-inter"
              placeholder="e.g., Station 1, Headquarters"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e)=> setFormData({...formData,address: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-mission-text-primary placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent font-inter"
              placeholder="Station address"
            />
          </div>
          
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
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={()=> setShowAddModal(false)}
              className="px-3 py-1.5 text-xs font-roboto-mono text-mission-text-muted hover:text-mission-text-primary transition-colors"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-fire-red hover:bg-fire-red-dark text-white rounded text-xs font-roboto-mono font-medium transition-colors"
            >
              ADD STATION
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Station Modal */}
      <Modal isOpen={showEditModal} onClose={()=> setShowEditModal(false)} title="Edit Station">
        <form onSubmit={handleEditStation} className="space-y-4">
          <div>
            <label className="block text-sm font-inter font-medium text-mission-text-secondary mb-2">
              Station Name *
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
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e)=> setFormData({...formData,address: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 bg-mission-bg-tertiary border border-mission-border rounded-lg text-mission-text-primary placeholder-mission-text-muted focus:outline-none focus:ring-2 focus:ring-fire-red focus:border-transparent font-inter"
            />
          </div>
          
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
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={()=> setShowEditModal(false)}
              className="px-3 py-1.5 text-xs font-roboto-mono text-mission-text-muted hover:text-mission-text-primary transition-colors"
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-fire-red hover:bg-fire-red-dark text-white rounded text-xs font-roboto-mono font-medium transition-colors"
            >
              UPDATE STATION
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Stations;
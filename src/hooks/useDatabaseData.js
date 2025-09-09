import { useState, useEffect } from 'react';
import { useDatabase } from '../contexts/DatabaseContext';
import apiClient from '../lib/api';

export const useDatabaseData = () => {
  const { isConnected } = useDatabase();
  const [stations, setStations] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all data from API
  const fetchData = async () => {
    if (!isConnected) return;

    try {
      setLoading(true);

      const [stationsData, equipmentData, inspectionsData] = await Promise.all([
        apiClient.getStations(),
        apiClient.getEquipment(),
        apiClient.getInspections()
      ]);

      setStations(stationsData || []);
      setEquipment(equipmentData || []);
      setInspections(inspectionsData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Station operations
  const addStation = async (stationData) => {
    try {
      const newStation = await apiClient.createStation(stationData);
      setStations(prev => [newStation, ...prev]);
      return newStation;
    } catch (error) {
      console.error('Error adding station:', error);
      throw error;
    }
  };

  const updateStation = async (id, updates) => {
    try {
      const updatedStation = await apiClient.updateStation(id, updates);
      setStations(prev => prev.map(station => 
        station.id === id ? updatedStation : station
      ));
      return updatedStation;
    } catch (error) {
      console.error('Error updating station:', error);
      throw error;
    }
  };

  const deleteStation = async (id) => {
    try {
      await apiClient.deleteStation(id);
      setStations(prev => prev.filter(station => station.id !== id));
      setEquipment(prev => prev.filter(item => item.station_id !== id));
    } catch (error) {
      console.error('Error deleting station:', error);
      throw error;
    }
  };

  // Equipment operations
  const addEquipment = async (equipmentData) => {
    try {
      const newEquipment = await apiClient.createEquipment(equipmentData);
      setEquipment(prev => [newEquipment, ...prev]);
      return newEquipment;
    } catch (error) {
      console.error('Error adding equipment:', error);
      throw error;
    }
  };

  const updateEquipment = async (id, updates) => {
    try {
      const updatedEquipment = await apiClient.updateEquipment(id, updates);
      setEquipment(prev => prev.map(item => 
        item.id === id ? updatedEquipment : item
      ));
      return updatedEquipment;
    } catch (error) {
      console.error('Error updating equipment:', error);
      throw error;
    }
  };

  const deleteEquipment = async (id) => {
    try {
      await apiClient.deleteEquipment(id);
      setEquipment(prev => prev.filter(item => item.id !== id));
      setInspections(prev => prev.filter(inspection => inspection.equipment_id !== id));
    } catch (error) {
      console.error('Error deleting equipment:', error);
      throw error;
    }
  };

  // Inspection operations
  const addInspection = async (inspectionData) => {
    try {
      const newInspection = await apiClient.createInspection(inspectionData);
      setInspections(prev => [newInspection, ...prev]);
      return newInspection;
    } catch (error) {
      console.error('Error adding inspection:', error);
      throw error;
    }
  };

  const updateInspection = async (id, updates) => {
    try {
      const updatedInspection = await apiClient.updateInspection(id, updates);
      setInspections(prev => prev.map(inspection => 
        inspection.id === id ? updatedInspection : inspection
      ));
      return updatedInspection;
    } catch (error) {
      console.error('Error updating inspection:', error);
      throw error;
    }
  };

  const deleteInspection = async (id) => {
    try {
      await apiClient.deleteInspection(id);
      setInspections(prev => prev.filter(inspection => inspection.id !== id));
    } catch (error) {
      console.error('Error deleting inspection:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchData();
    }
  }, [isConnected]);

  return {
    stations,
    equipment,
    inspections,
    loading,
    addStation,
    updateStation,
    deleteStation,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    addInspection,
    updateInspection,
    deleteInspection,
    refetch: fetchData
  };
};
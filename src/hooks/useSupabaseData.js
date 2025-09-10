import { useState, useEffect } from 'react';
import supabase from '../lib/supabase';
import { useDatabase } from '../contexts/DatabaseContext';

export const useSupabaseData = () => {
  const { isConnected } = useDatabase();
  const [stations, setStations] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all data from Supabase
  const fetchData = async () => {
    if (!isConnected) return;

    try {
      setLoading(true);

      // Fetch stations
      const { data: stationsData, error: stationsError } = await supabase
        .from('stations_fd2024')
        .select('*')
        .order('created_at', { ascending: false });

      if (stationsError && stationsError.code !== '42P01') throw stationsError;

      // Fetch equipment
      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipment_fd2024')
        .select('*')
        .order('created_at', { ascending: false });

      if (equipmentError && equipmentError.code !== '42P01') throw equipmentError;

      // Fetch inspections
      const { data: inspectionsData, error: inspectionsError } = await supabase
        .from('inspections_fd2024')
        .select('*')
        .order('due_date', { ascending: true });

      if (inspectionsError && inspectionsError.code !== '42P01') throw inspectionsError;

      setStations(stationsData || []);
      setEquipment(equipmentData || []);
      setInspections(inspectionsData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add station
  const addStation = async (stationData) => {
    try {
      const { data, error } = await supabase
        .from('stations_fd2024')
        .insert([{
          name: stationData.name,
          address: stationData.address,
          phone: stationData.phone
        }])
        .select()
        .single();

      if (error) throw error;

      setStations(prev => [data, ...prev]);
      return data;
    } catch (error) {
      console.error('Error adding station:', error);
      throw error;
    }
  };

  // Add equipment
  const addEquipment = async (equipmentData) => {
    try {
      // Create initial history entry
      const initialHistory = [{
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        type: 'created',
        action: 'Equipment Created',
        user: 'Current User',
        details: 'Equipment added to inventory',
        status: equipmentData.status,
        notes: equipmentData.notes || ''
      }];

      const { data, error } = await supabase
        .from('equipment_fd2024')
        .insert([{
          name: equipmentData.name,
          serial_number: equipmentData.serialNumber,
          manufacturer: equipmentData.manufacturer,
          model: equipmentData.model,
          category: equipmentData.category,
          subcategory: equipmentData.subcategory,
          station_id: equipmentData.stationId,
          status: equipmentData.status,
          notes: equipmentData.notes,
          history: initialHistory
        }])
        .select()
        .single();

      if (error) throw error;

      // Transform data to match frontend format
      const transformedData = {
        ...data,
        serialNumber: data.serial_number,
        stationId: data.station_id,
        createdAt: data.created_at
      };

      setEquipment(prev => [transformedData, ...prev]);
      return transformedData;
    } catch (error) {
      console.error('Error adding equipment:', error);
      throw error;
    }
  };

  // Update equipment
  const updateEquipment = async (id, updates) => {
    try {
      // Get current equipment to add history entry
      const { data: currentData, error: fetchError } = await supabase
        .from('equipment_fd2024')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      const currentHistory = currentData.history || [];
      
      // Create history entry
      const historyEntry = {
        id: crypto.randomUUID(),
        date: new Date().toISOString(),
        type: 'updated',
        action: updates.status !== currentData.status ? 'Status Changed' : 'Equipment Updated',
        user: 'Current User',
        details: updates.status !== currentData.status 
          ? `Status changed from ${currentData.status} to ${updates.status}`
          : 'Equipment information updated',
        previousStatus: currentData.status,
        newStatus: updates.status,
        notes: updates.notes || ''
      };

      const updatedHistory = [...currentHistory, historyEntry];

      const { data, error } = await supabase
        .from('equipment_fd2024')
        .update({
          name: updates.name,
          serial_number: updates.serialNumber,
          manufacturer: updates.manufacturer,
          model: updates.model,
          category: updates.category,
          subcategory: updates.subcategory,
          station_id: updates.stationId,
          status: updates.status,
          notes: updates.notes,
          history: updatedHistory
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Transform data to match frontend format
      const transformedData = {
        ...data,
        serialNumber: data.serial_number,
        stationId: data.station_id,
        createdAt: data.created_at
      };

      setEquipment(prev => prev.map(item => 
        item.id === id ? transformedData : item
      ));

      return transformedData;
    } catch (error) {
      console.error('Error updating equipment:', error);
      throw error;
    }
  };

  // Delete equipment
  const deleteEquipment = async (id) => {
    try {
      const { error } = await supabase
        .from('equipment_fd2024')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEquipment(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting equipment:', error);
      throw error;
    }
  };

  // Add inspection
  const addInspection = async (inspectionData) => {
    try {
      const { data, error } = await supabase
        .from('inspections_fd2024')
        .insert([{
          name: inspectionData.name,
          equipment_id: inspectionData.equipmentId,
          category: inspectionData.category,
          station_id: inspectionData.stationId,
          template_id: inspectionData.templateId,
          due_date: inspectionData.dueDate,
          notes: inspectionData.notes,
          external_vendor: inspectionData.externalVendor,
          vendor_contact: inspectionData.vendorContact
        }])
        .select()
        .single();

      if (error) throw error;

      // Transform data to match frontend format
      const transformedData = {
        ...data,
        equipmentId: data.equipment_id,
        stationId: data.station_id,
        templateId: data.template_id,
        dueDate: data.due_date,
        lastCompleted: data.last_completed,
        externalVendor: data.external_vendor,
        vendorContact: data.vendor_contact,
        createdAt: data.created_at
      };

      setInspections(prev => [transformedData, ...prev]);
      return transformedData;
    } catch (error) {
      console.error('Error adding inspection:', error);
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
    addEquipment,
    updateEquipment,
    deleteEquipment,
    addInspection,
    refetch: fetchData
  };
};
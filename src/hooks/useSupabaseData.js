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
        .from('stations')
        .select('*')
        .order('created_at', { ascending: false });

      if (stationsError) throw stationsError;

      // Fetch equipment
      const { data: equipmentData, error: equipmentError } = await supabase
        .from('equipment')
        .select('*')
        .order('created_at', { ascending: false });

      if (equipmentError) throw equipmentError;

      // Fetch inspections
      const { data: inspectionsData, error: inspectionsError } = await supabase
        .from('inspections')
        .select('*')
        .order('due_date', { ascending: true });

      if (inspectionsError) throw inspectionsError;

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
        .from('stations')
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
      const { data, error } = await supabase
        .from('equipment')
        .insert([{
          name: equipmentData.name,
          serial_number: equipmentData.serialNumber,
          manufacturer: equipmentData.manufacturer,
          model: equipmentData.model,
          category: equipmentData.category,
          subcategory: equipmentData.subcategory,
          station_id: equipmentData.stationId,
          status: equipmentData.status,
          notes: equipmentData.notes
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
      const { data, error } = await supabase
        .from('equipment')
        .update({
          name: updates.name,
          serial_number: updates.serialNumber,
          manufacturer: updates.manufacturer,
          model: updates.model,
          category: updates.category,
          subcategory: updates.subcategory,
          station_id: updates.stationId,
          status: updates.status,
          notes: updates.notes
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
        .from('equipment')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEquipment(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting equipment:', error);
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
    refetch: fetchData
  };
};
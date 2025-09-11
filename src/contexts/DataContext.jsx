import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { db } from '../lib/database'
import { v4 as uuidv4 } from 'uuid'
import { format, addMonths, differenceInDays } from 'date-fns'
import { toast } from '../lib/toast'

const DataContext = createContext()

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

// Equipment categories and statuses (unchanged)
export const EQUIPMENT_CATEGORIES = {
  'breathing': { name: 'Breathing Equipment', items: ['SCBA Units', 'Face Pieces/Masks', 'Air Cylinders/Tanks'] },
  'ppe': { name: 'Personal Protective Equipment', items: ['Turnout Gear', 'Helmets', 'Boots', 'Gloves'] },
  'rescue': { name: 'Rescue Equipment', items: ['Ladders', 'Ropes/Hardware', 'Extrication Tools'] },
  'detection': { name: 'Detection Equipment', items: ['Gas Detection Meters', 'Thermal Imaging Cameras'] },
  'apparatus': { name: 'Fire Apparatus', items: ['Engines', 'Trucks', 'Ambulances', 'Tankers'] },
  'pumps': { name: 'Pumps and Hydraulics', items: ['Portable Pumps', 'Hydraulic Tools'] },
  'hose': { name: 'Hose and Water Supply Equipment', items: ['Fire Hose', 'Nozzles and Tips'] },
  'communications': { name: 'Communications Equipment', items: ['Two-way Radios', 'Mobile Data Terminals'] },
  'medical': { name: 'Medical/EMS Equipment', items: ['First Aid Supplies', 'Defibrillators'] },
  'ventilation': { name: 'Ventilation Equipment', items: ['Positive Pressure Fans', 'Smoke Ejectors'] },
  'electrical': { name: 'Electrical Equipment', items: ['Generators', 'Scene Lighting'] },
  'other': { name: 'Other/Miscellaneous', items: ['General Supplies', 'Station Equipment'] }
}

export const EQUIPMENT_STATUSES = {
  'in-service': { label: 'In Service', color: 'bg-green-600 text-green-100' },
  'out-of-service': { label: 'Out of Service', color: 'bg-red-600 text-red-100' },
  'out-for-repair': { label: 'Out for Repair', color: 'bg-yellow-600 text-yellow-100' },
  'cannot-locate': { label: 'Cannot Locate', color: 'bg-orange-600 text-orange-100' },
  'in-training': { label: 'In Training', color: 'bg-blue-600 text-blue-100' },
  'other': { label: 'Other', color: 'bg-purple-600 text-purple-100' }
}

export const INSPECTION_TEMPLATES = {
  'scba-annual-flow': { name: 'SCBA Annual Flow Test (NFPA 1852)', interval: 12, type: 'months', categories: ['breathing'] },
  'cylinder-hydro': { name: 'Air Cylinder 5-Year Hydrostatic Test (DOT/NFPA 1852)', interval: 60, type: 'months', categories: ['breathing'] },
  'turnout-advanced': { name: 'Turnout Gear Advanced Inspection (NFPA 1851)', interval: 12, type: 'months', categories: ['ppe'] },
  'ladder-ground-annual': { name: 'Ground Ladder Annual Inspection (NFPA 1932)', interval: 12, type: 'months', categories: ['rescue'] },
  'apparatus-annual': { name: 'Fire Apparatus Annual Pump Test (NFPA 1911)', interval: 12, type: 'months', categories: ['apparatus'] },
  'hose-annual': { name: 'Fire Hose Annual Pressure Test (NFPA 1962)', interval: 12, type: 'months', categories: ['hose'] }
}

export const DataProvider = ({ children }) => {
  const { user, department, loading: authLoading } = useAuth()
  const [data, setData] = useState({
    stations: [],
    equipment: [],
    inspections: [],
    categoryInspections: [],
    vendors: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load data when auth is ready
  useEffect(() => {
    if (authLoading) return
    
    if (user && department?.id) {
      loadData()
    } else {
      setLoading(false)
    }
  }, [authLoading, user, department])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('📊 Loading data from database...')
      
      const [stations, equipment, inspections, vendors] = await Promise.all([
        db.query('stations'),
        db.query('equipment'),
        db.query('inspections'),
        db.query('vendors')
      ])

      // Separate individual and category inspections
      const individualInspections = inspections.filter(i => i.equipmentId)
      const categoryInspections = inspections.filter(i => !i.equipmentId && i.category)

      setData({
        stations,
        equipment,
        inspections: individualInspections,
        categoryInspections,
        vendors
      })

      console.log('✅ Data loaded successfully:', {
        stations: stations.length,
        equipment: equipment.length,
        inspections: inspections.length,
        vendors: vendors.length
      })

    } catch (error) {
      console.error('❌ Error loading data:', error)
      setError(error)
      toast.error('Failed to load data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Simplified CRUD operations with consistent error handling
  const createRecord = async (table, recordData) => {
    try {
      const newRecord = await db.insert(table, { id: uuidv4(), ...recordData })
      
      setData(prev => ({
        ...prev,
        [table]: [newRecord, ...prev[table]]
      }))
      
      toast.success(`${table.slice(0, -1)} added successfully`)
      return newRecord
    } catch (error) {
      console.error(`Error adding ${table}:`, error)
      throw error
    }
  }

  const updateRecord = async (table, id, updates) => {
    try {
      const updatedRecord = await db.update(table, id, updates)
      
      setData(prev => ({
        ...prev,
        [table]: prev[table].map(item => item.id === id ? updatedRecord : item)
      }))
      
      toast.success(`${table.slice(0, -1)} updated successfully`)
      return updatedRecord
    } catch (error) {
      console.error(`Error updating ${table}:`, error)
      throw error
    }
  }

  const deleteRecord = async (table, id) => {
    try {
      await db.delete(table, id)
      
      setData(prev => ({
        ...prev,
        [table]: prev[table].filter(item => item.id !== id)
      }))
      
      toast.success(`${table.slice(0, -1)} deleted successfully`)
      return true
    } catch (error) {
      console.error(`Error deleting ${table}:`, error)
      throw error
    }
  }

  // Station operations
  const addStation = (stationData) => createRecord('stations', stationData)
  const updateStation = (id, updates) => updateRecord('stations', id, updates)
  const deleteStation = async (id) => {
    // Also remove equipment from this station
    setData(prev => ({
      ...prev,
      equipment: prev.equipment.filter(item => item.stationId !== id)
    }))
    return deleteRecord('stations', id)
  }

  // Equipment operations with history tracking
  const addEquipment = async (equipmentData) => {
    try {
      const initialHistory = [{
        id: uuidv4(),
        date: new Date().toISOString(),
        type: 'created',
        action: 'Equipment Created',
        user: 'Current User',
        details: 'Equipment added to inventory',
        status: equipmentData.status,
        notes: equipmentData.notes || ''
      }]

      const newEquipment = await createRecord('equipment', {
        ...equipmentData,
        history: initialHistory
      })

      return newEquipment
    } catch (error) {
      throw error
    }
  }

  const updateEquipment = async (id, updates) => {
    try {
      const currentItem = data.equipment.find(item => item.id === id)
      if (!currentItem) throw new Error('Equipment not found')

      const historyEntry = {
        id: uuidv4(),
        date: new Date().toISOString(),
        type: 'updated',
        action: updates.status && updates.status !== currentItem.status ? 'Status Changed' : 'Equipment Updated',
        user: 'Current User',
        details: updates.status && updates.status !== currentItem.status 
          ? `Status changed from ${EQUIPMENT_STATUSES[currentItem.status]?.label} to ${EQUIPMENT_STATUSES[updates.status]?.label}`
          : 'Equipment information updated',
        notes: updates.notes || ''
      }

      const updatedHistory = [...(currentItem.history || []), historyEntry]
      
      return updateRecord('equipment', id, {
        ...updates,
        history: updatedHistory
      })
    } catch (error) {
      throw error
    }
  }

  const deleteEquipment = async (id) => {
    // Remove related inspections
    setData(prev => ({
      ...prev,
      inspections: prev.inspections.filter(inspection => inspection.equipmentId !== id)
    }))
    return deleteRecord('equipment', id)
  }

  // Inspection operations
  const addInspection = async (inspectionData) => {
    try {
      const newInspection = await createRecord('inspections', inspectionData)
      
      if (inspectionData.equipmentId) {
        setData(prev => ({
          ...prev,
          inspections: [newInspection, ...prev.inspections]
        }))
      } else {
        setData(prev => ({
          ...prev,
          categoryInspections: [newInspection, ...prev.categoryInspections]
        }))
      }
      
      return newInspection
    } catch (error) {
      throw error
    }
  }

  const updateInspection = (id, updates) => updateRecord('inspections', id, updates)
  const deleteInspection = (id) => deleteRecord('inspections', id)

  // Category inspections
  const addCategoryInspection = (inspectionData) => addInspection(inspectionData)
  const updateCategoryInspection = (id, updates) => {
    setData(prev => ({
      ...prev,
      categoryInspections: prev.categoryInspections.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    }))
    return updateRecord('inspections', id, updates)
  }
  const deleteCategoryInspection = (id) => {
    setData(prev => ({
      ...prev,
      categoryInspections: prev.categoryInspections.filter(item => item.id !== id)
    }))
    return deleteRecord('inspections', id)
  }

  // Vendor operations
  const addVendor = (vendorData) => createRecord('vendors', vendorData)
  const updateVendor = (id, updates) => updateRecord('vendors', id, updates)
  const deleteVendor = (id) => deleteRecord('vendors', id)

  // Get inspection status for equipment
  const getInspectionStatus = (equipmentId) => {
    const equipmentItem = data.equipment.find(item => item.id === equipmentId)
    if (!equipmentItem) return null

    const equipmentInspections = data.inspections.filter(i => i.equipmentId === equipmentId)
    const categoryInspectionsForEquipment = data.categoryInspections.filter(i => 
      i.category === equipmentItem.category && 
      (!i.stationId || i.stationId === equipmentItem.stationId)
    )

    const allInspections = [...equipmentInspections, ...categoryInspectionsForEquipment]
    if (allInspections.length === 0) return null

    const nextInspection = allInspections
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0]

    const today = new Date()
    const dueDate = new Date(nextInspection.dueDate)
    const daysUntilDue = differenceInDays(dueDate, today)

    if (daysUntilDue < 0) {
      return { status: 'past-due', days: Math.abs(daysUntilDue) }
    } else if (daysUntilDue <= 3) {
      return { status: 'critical', days: daysUntilDue }
    } else if (daysUntilDue <= 7) {
      return { status: 'warning', days: daysUntilDue }
    } else if (daysUntilDue <= 14) {
      return { status: 'attention', days: daysUntilDue }
    } else if (daysUntilDue <= 30) {
      return { status: 'normal', days: daysUntilDue }
    } else {
      return { status: 'upcoming', days: daysUntilDue }
    }
  }

  const value = {
    ...data,
    loading,
    error,
    refreshData: loadData,
    
    // Station operations
    addStation,
    updateStation,
    deleteStation,
    
    // Equipment operations
    addEquipment,
    updateEquipment,
    deleteEquipment,
    
    // Inspection operations
    addInspection,
    addCategoryInspection,
    updateInspection,
    updateCategoryInspection,
    deleteInspection,
    deleteCategoryInspection,
    getInspectionStatus,
    
    // Vendor operations
    addVendor,
    updateVendor,
    deleteVendor
  }

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  )
}
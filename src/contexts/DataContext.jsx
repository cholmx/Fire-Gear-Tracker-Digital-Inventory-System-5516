import React, { createContext, useContext, useState, useEffect } from 'react'
import { useDatabase } from './DatabaseContext'
import { useAuth } from './AuthContext'
import { v4 as uuidv4 } from 'uuid'
import { format, addMonths, addDays, isBefore, differenceInDays } from 'date-fns'
import { transformDataToSnakeCase, transformDataToCamelCase } from '../lib/database'

const DataContext = createContext()

export const useData = () => {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}

// Equipment categories and inspection templates (unchanged)
export const EQUIPMENT_CATEGORIES = {
  'breathing': {
    name: 'Breathing Equipment',
    items: [
      'SCBA Units',
      'Face Pieces/Masks',
      'Air Cylinders/Tanks',
      'Air Compressors',
      'SCBA Accessories'
    ]
  },
  'ppe': {
    name: 'Personal Protective Equipment',
    items: [
      'Turnout Gear',
      'Helmets',
      'Boots',
      'Gloves',
      'Eye Protection'
    ]
  },
  'rescue': {
    name: 'Rescue Equipment',
    items: [
      'Ladders',
      'Ropes/Hardware',
      'Extrication Tools',
      'Hand Tools',
      'Cutting Tools'
    ]
  },
  'detection': {
    name: 'Detection Equipment',
    items: [
      'Gas Detection Meters',
      'Thermal Imaging Cameras',
      'Smoke Detectors',
      'Multi-Gas Monitors'
    ]
  },
  'apparatus': {
    name: 'Fire Apparatus',
    items: [
      'Engines',
      'Trucks',
      'Ambulances',
      'Tankers/Tenders',
      'Specialty Vehicles'
    ]
  },
  'pumps': {
    name: 'Pumps and Hydraulics',
    items: [
      'Portable Pumps',
      'Hydraulic Tools (Jaws of Life)',
      'Hydraulic Hoses',
      'Power Units'
    ]
  },
  'hose': {
    name: 'Hose and Water Supply Equipment',
    items: [
      'Fire Hose',
      'Nozzles and Tips',
      'Couplings and Adapters',
      'Hose Appliances',
      'Water Tanks'
    ]
  },
  'communications': {
    name: 'Communications Equipment',
    items: [
      'Two-way Radios',
      'Mobile Data Terminals',
      'Base Station Equipment',
      'Emergency Alert Systems'
    ]
  },
  'medical': {
    name: 'Medical/EMS Equipment',
    items: [
      'First Aid Supplies',
      'Defibrillators',
      'Oxygen Equipment',
      'Backboards/Stretchers',
      'Monitoring Devices'
    ]
  },
  'ventilation': {
    name: 'Ventilation Equipment',
    items: [
      'Positive Pressure Fans',
      'Smoke Ejectors',
      'Chain Saws',
      'Roof Cutting Tools'
    ]
  },
  'electrical': {
    name: 'Electrical Equipment',
    items: [
      'Generators',
      'Scene Lighting',
      'Power Distribution',
      'Battery Chargers'
    ]
  },
  'other': {
    name: 'Other/Miscellaneous',
    items: [
      'General Supplies',
      'Station Equipment',
      'Cleaning Supplies',
      'Office Equipment',
      'Training Materials'
    ]
  }
}

export const INSPECTION_TEMPLATES = {
  // BREATHING EQUIPMENT - NFPA 1852
  'scba-annual-flow': {
    name: 'SCBA Annual Flow Test (NFPA 1852)',
    interval: 12,
    type: 'months',
    categories: ['breathing'],
    regulation: 'NFPA 1852',
    description: 'Annual flow test and functional inspection',
    external: false
  },
  'scba-facepiece-fit': {
    name: 'Face Piece Annual Fit Test (OSHA 29 CFR 1910.134)',
    interval: 12,
    type: 'months',
    categories: ['breathing'],
    regulation: 'OSHA 29 CFR 1910.134',
    description: 'Annual fit testing for respirator users',
    external: false
  },
  'cylinder-hydro': {
    name: 'Air Cylinder 5-Year Hydrostatic Test (DOT/NFPA 1852)',
    interval: 60,
    type: 'months',
    categories: ['breathing'],
    regulation: 'DOT/NFPA 1852',
    description: '5-year hydrostatic pressure test',
    external: true
  },
  'compressor-annual': {
    name: 'Air Compressor Annual Inspection (NFPA 1852)',
    interval: 12,
    type: 'months',
    categories: ['breathing'],
    regulation: 'NFPA 1852',
    description: 'Annual compressor inspection and maintenance',
    external: false
  },
  'air-quality-quarterly': {
    name: 'Air Quality Quarterly Test (NFPA 1852)',
    interval: 3,
    type: 'months',
    categories: ['breathing'],
    regulation: 'NFPA 1852',
    description: 'Quarterly breathing air quality testing',
    external: true
  },

  // PERSONAL PROTECTIVE EQUIPMENT - NFPA 1851
  'turnout-advanced': {
    name: 'Turnout Gear Advanced Inspection (NFPA 1851)',
    interval: 12,
    type: 'months',
    categories: ['ppe'],
    regulation: 'NFPA 1851',
    description: 'Annual advanced inspection of structural firefighting garments',
    external: false
  },
  'helmet-annual': {
    name: 'Helmet Annual Inspection (NFPA 1851)',
    interval: 12,
    type: 'months',
    categories: ['ppe'],
    regulation: 'NFPA 1851',
    description: 'Annual helmet inspection for damage and integrity',
    external: false
  },
  'boots-annual': {
    name: 'Fire Boots Annual Inspection (NFPA 1851)',
    interval: 12,
    type: 'months',
    categories: ['ppe'],
    regulation: 'NFPA 1851',
    description: 'Annual inspection of structural firefighting boots',
    external: false
  },
  'gloves-annual': {
    name: 'Fire Gloves Annual Inspection (NFPA 1851)',
    interval: 12,
    type: 'months',
    categories: ['ppe'],
    regulation: 'NFPA 1851',
    description: 'Annual inspection of structural firefighting gloves',
    external: false
  },

  // RESCUE EQUIPMENT
  'ladder-ground-annual': {
    name: 'Ground Ladder Annual Inspection (NFPA 1932)',
    interval: 12,
    type: 'months',
    categories: ['rescue'],
    regulation: 'NFPA 1932',
    description: 'Annual inspection and service test of ground ladders',
    external: false
  },
  'ladder-aerial-annual': {
    name: 'Aerial Ladder Annual Inspection (NFPA 1932)',
    interval: 12,
    type: 'months',
    categories: ['rescue', 'apparatus'],
    regulation: 'NFPA 1932',
    description: 'Annual inspection of aerial ladder devices',
    external: true
  },
  'ladder-aerial-major': {
    name: 'Aerial Ladder 5-Year Major Inspection (NFPA 1932)',
    interval: 60,
    type: 'months',
    categories: ['rescue', 'apparatus'],
    regulation: 'NFPA 1932',
    description: '5-year comprehensive major inspection',
    external: true
  },
  'rope-annual': {
    name: 'Life Safety Rope Annual Inspection (NFPA 1858)',
    interval: 12,
    type: 'months',
    categories: ['rescue'],
    regulation: 'NFPA 1858',
    description: 'Annual inspection of life safety rope and hardware',
    external: false
  },
  'extrication-annual': {
    name: 'Extrication Tools Annual Inspection (NFPA 1936)',
    interval: 12,
    type: 'months',
    categories: ['rescue', 'pumps'],
    regulation: 'NFPA 1936',
    description: 'Annual inspection and testing of extrication equipment',
    external: true
  },

  // FIRE APPARATUS - NFPA 1911
  'apparatus-annual': {
    name: 'Fire Apparatus Annual Pump Test (NFPA 1911)',
    interval: 12,
    type: 'months',
    categories: ['apparatus'],
    regulation: 'NFPA 1911',
    description: 'Annual pump test and apparatus inspection',
    external: true
  },
  'aerial-device-annual': {
    name: 'Aerial Device Annual Inspection (NFPA 1911)',
    interval: 12,
    type: 'months',
    categories: ['apparatus'],
    regulation: 'NFPA 1911',
    description: 'Annual aerial device inspection and testing',
    external: true
  },
  'aerial-device-major': {
    name: 'Aerial Device 5-Year Major Inspection (NFPA 1911)',
    interval: 60,
    type: 'months',
    categories: ['apparatus'],
    regulation: 'NFPA 1911',
    description: '5-year comprehensive aerial device inspection',
    external: true
  },

  // HOSE AND WATER SUPPLY - NFPA 1962/1964/1901
  'hose-annual': {
    name: 'Fire Hose Annual Pressure Test (NFPA 1962)',
    interval: 12,
    type: 'months',
    categories: ['hose'],
    regulation: 'NFPA 1962',
    description: 'Annual pressure test of fire hose',
    external: false
  },
  'nozzle-annual': {
    name: 'Nozzle Annual Inspection (NFPA 1964)',
    interval: 12,
    type: 'months',
    categories: ['hose'],
    regulation: 'NFPA 1964',
    description: 'Annual inspection and flow test of nozzles',
    external: false
  },
  'water-tank-annual': {
    name: 'Water Tank Annual Inspection (NFPA 1901)',
    interval: 12,
    type: 'months',
    categories: ['hose', 'apparatus'],
    regulation: 'NFPA 1901',
    description: 'Annual water tank inspection and testing',
    external: false
  },

  // DETECTION EQUIPMENT
  'gas-meter-monthly': {
    name: 'Gas Meter Monthly Calibration (NFPA 1852)',
    interval: 1,
    type: 'months',
    categories: ['detection'],
    regulation: 'NFPA 1852',
    description: 'Monthly calibration check and bump test',
    external: false
  },
  'gas-meter-annual': {
    name: 'Gas Meter Annual Certification (NFPA 1852)',
    interval: 12,
    type: 'months',
    categories: ['detection'],
    regulation: 'NFPA 1852',
    description: 'Annual factory certification and calibration',
    external: true
  },
  'thermal-imaging-annual': {
    name: 'Thermal Imaging Annual Calibration',
    interval: 12,
    type: 'months',
    categories: ['detection'],
    regulation: 'Manufacturer Specifications',
    description: 'Annual calibration check per manufacturer specs',
    external: true
  },

  // PUMPS AND HYDRAULICS - NFPA 1936
  'portable-pump-annual': {
    name: 'Portable Pump Annual Test (NFPA 1936)',
    interval: 12,
    type: 'months',
    categories: ['pumps'],
    regulation: 'NFPA 1936',
    description: 'Annual performance test of portable pumps',
    external: false
  },
  'hydraulic-tools-annual': {
    name: 'Hydraulic Tools Annual Inspection (NFPA 1936)',
    interval: 12,
    type: 'months',
    categories: ['pumps'],
    regulation: 'NFPA 1936',
    description: 'Annual inspection and testing of hydraulic tools',
    external: true
  },

  // MEDICAL/EMS EQUIPMENT
  'defibrillator-annual': {
    name: 'Defibrillator Annual Inspection (FDA/Manufacturer)',
    interval: 12,
    type: 'months',
    categories: ['medical'],
    regulation: 'FDA/Manufacturer Requirements',
    description: 'Annual inspection and calibration check',
    external: true
  },
  'oxygen-equipment-annual': {
    name: 'Oxygen Equipment Annual Inspection (NFPA 1852)',
    interval: 12,
    type: 'months',
    categories: ['medical'],
    regulation: 'NFPA 1852',
    description: 'Annual inspection of oxygen delivery equipment',
    external: false
  },

  // COMMUNICATIONS EQUIPMENT
  'radio-annual': {
    name: 'Two-way Radio Annual Inspection (FCC)',
    interval: 12,
    type: 'months',
    categories: ['communications'],
    regulation: 'FCC Regulations',
    description: 'Annual radio equipment inspection and testing',
    external: true
  },
  'emergency-systems-annual': {
    name: 'Emergency Alert Systems Annual Test (NFPA 72)',
    interval: 12,
    type: 'months',
    categories: ['communications'],
    regulation: 'NFPA 72',
    description: 'Annual test of emergency communication systems',
    external: false
  },

  // ADDITIONAL COMMON INSPECTIONS
  'generator-monthly': {
    name: 'Generator Monthly Load Test',
    interval: 1,
    type: 'months',
    categories: ['electrical'],
    regulation: 'NFPA 110',
    description: 'Monthly generator load test and inspection',
    external: false
  },
  'ventilation-quarterly': {
    name: 'Ventilation Equipment Quarterly Service',
    interval: 3,
    type: 'months',
    categories: ['ventilation'],
    regulation: 'Manufacturer Requirements',
    description: 'Quarterly service and maintenance check',
    external: false
  }
}

export const EQUIPMENT_STATUSES = {
  'in-service': {
    label: 'In Service',
    color: 'bg-green-600 text-green-100'
  },
  'out-of-service': {
    label: 'Out of Service',
    color: 'bg-red-600 text-red-100'
  },
  'out-for-repair': {
    label: 'Out for Repair',
    color: 'bg-yellow-600 text-yellow-100'
  },
  'cannot-locate': {
    label: 'Cannot Locate',
    color: 'bg-orange-600 text-orange-100'
  },
  'in-training': {
    label: 'In Training',
    color: 'bg-blue-600 text-blue-100'
  },
  'other': {
    label: 'Other',
    color: 'bg-purple-600 text-purple-100'
  }
}

export const DataProvider = ({ children }) => {
  const { query, insert, update, remove, isConnected, isLoading: dbLoading } = useDatabase()
  const { user, department, loading: authLoading } = useAuth()
  
  const [stations, setStations] = useState([])
  const [equipment, setEquipment] = useState([])
  const [inspections, setInspections] = useState([])
  const [categoryInspections, setCategoryInspections] = useState([])
  const [vendors, setVendors] = useState([])
  const [dataLoading, setDataLoading] = useState(true)

  // ✅ FIXED: Wait for both auth and database to be ready
  useEffect(() => {
    // Don't load data until:
    // 1. Auth is complete
    // 2. Database is connected
    // 3. User has department context
    if (authLoading || dbLoading || !isConnected) {
      console.log('⏳ Waiting for prerequisites:', {
        authLoading,
        dbLoading,
        isConnected,
        user: user?.email,
        department: department?.name
      })
      return
    }

    if (user && department?.id) {
      console.log('✅ Prerequisites met, loading data...')
      loadData()
    } else if (user && !department?.id) {
      console.warn('⚠️ User authenticated but no department context')
      setDataLoading(false)
    } else {
      console.log('👤 No user authenticated, skipping data load')
      setDataLoading(false)
    }
  }, [authLoading, dbLoading, isConnected, user, department])

  const loadData = async () => {
    try {
      console.log('📊 Loading all data from database...')
      setDataLoading(true)

      const [stationsData, equipmentData, inspectionsData, vendorsData] = await Promise.all([
        query('stations'),
        query('equipment'),
        query('inspections'),
        query('vendors')
      ])

      console.log('📊 Data loaded:', {
        stations: stationsData.length,
        equipment: equipmentData.length,
        inspections: inspectionsData.length,
        vendors: vendorsData.length
      })

      setStations(stationsData)
      setEquipment(equipmentData)

      // Separate individual and category inspections
      const individualInspections = inspectionsData.filter(i => i.equipmentId)
      const categoryInspections = inspectionsData.filter(i => !i.equipmentId && i.category)

      setInspections(individualInspections)
      setCategoryInspections(categoryInspections)
      setVendors(vendorsData)
    } catch (error) {
      console.error('❌ Error loading data:', error)
    } finally {
      setDataLoading(false)
    }
  }

  // Station management
  const addStation = async (stationData) => {
    try {
      console.log('➕ Adding station:', stationData)
      // The database service will auto-inject department_id and created_at
      const newStation = await insert('stations', {
        id: uuidv4(),
        ...stationData
      })
      console.log('✅ Station added successfully:', newStation)
      setStations(prev => [...prev, newStation])
      return newStation
    } catch (error) {
      console.error('❌ Error adding station:', error)
      throw error
    }
  }

  const updateStation = async (id, updates) => {
    try {
      console.log('✏️ Updating station:', id, updates)
      const updatedStation = await update('stations', id, updates)
      setStations(prev => prev.map(station => 
        station.id === id ? updatedStation : station
      ))
      return updatedStation
    } catch (error) {
      console.error('❌ Error updating station:', error)
      throw error
    }
  }

  const deleteStation = async (id) => {
    try {
      console.log('🗑️ Deleting station:', id)
      await remove('stations', id)
      setStations(prev => prev.filter(station => station.id !== id))
      // Also remove equipment from this station
      setEquipment(prev => prev.filter(item => item.stationId !== id))
    } catch (error) {
      console.error('❌ Error deleting station:', error)
      throw error
    }
  }

  // Equipment management with proper data transformation
  const addEquipment = async (equipmentData) => {
    try {
      console.log('➕ Adding equipment:', equipmentData)

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

      // The database service will auto-inject department_id and created_at
      const newEquipment = await insert('equipment', {
        id: uuidv4(),
        name: equipmentData.name,
        serialNumber: equipmentData.serialNumber,
        manufacturer: equipmentData.manufacturer,
        model: equipmentData.model,
        category: equipmentData.category,
        subcategory: equipmentData.subcategory,
        stationId: equipmentData.stationId,
        status: equipmentData.status,
        notes: equipmentData.notes,
        history: initialHistory
      })

      console.log('✅ Equipment added successfully:', newEquipment)
      setEquipment(prev => [...prev, newEquipment])
      return newEquipment
    } catch (error) {
      console.error('❌ Error adding equipment:', error)
      throw error
    }
  }

  const updateEquipment = async (id, updates) => {
    try {
      console.log('✏️ Updating equipment:', id, updates)

      // Get current equipment to add history entry
      const currentItem = equipment.find(item => item.id === id)
      if (!currentItem) throw new Error('Equipment not found')

      const currentHistory = currentItem.history || []

      // Create history entry
      let actionDescription = 'Equipment Updated'
      let detailsDescription = ''

      if (updates.status && updates.status !== currentItem.status) {
        actionDescription = 'Status Changed'
        detailsDescription = `Status changed from ${EQUIPMENT_STATUSES[currentItem.status]?.label} to ${EQUIPMENT_STATUSES[updates.status]?.label}`
      } else {
        detailsDescription = 'Equipment information updated'
      }

      const historyEntry = {
        id: uuidv4(),
        date: new Date().toISOString(),
        type: 'updated',
        action: actionDescription,
        user: 'Current User',
        details: detailsDescription,
        previousStatus: currentItem.status,
        newStatus: updates.status || currentItem.status,
        notes: updates.notes || ''
      }

      const updatedHistory = [...currentHistory, historyEntry]

      const updatedEquipment = await update('equipment', id, {
        name: updates.name,
        serialNumber: updates.serialNumber,
        manufacturer: updates.manufacturer,
        model: updates.model,
        category: updates.category,
        subcategory: updates.subcategory,
        stationId: updates.stationId,
        status: updates.status,
        notes: updates.notes,
        history: updatedHistory
      })

      setEquipment(prev => prev.map(item => 
        item.id === id ? updatedEquipment : item
      ))
      return updatedEquipment
    } catch (error) {
      console.error('❌ Error updating equipment:', error)
      throw error
    }
  }

  const addEquipmentHistoryEntry = async (equipmentId, historyData) => {
    try {
      const currentItem = equipment.find(item => item.id === equipmentId)
      if (!currentItem) return

      const newHistoryEntry = {
        id: uuidv4(),
        date: new Date().toISOString(),
        user: 'Current User',
        ...historyData
      }

      const updatedHistory = [...(currentItem.history || []), newHistoryEntry]

      await update('equipment', equipmentId, {
        history: updatedHistory
      })

      setEquipment(prev => prev.map(item => {
        if (item.id === equipmentId) {
          return {
            ...item,
            history: updatedHistory
          }
        }
        return item
      }))
    } catch (error) {
      console.error('❌ Error adding equipment history entry:', error)
    }
  }

  const deleteEquipment = async (id) => {
    try {
      console.log('🗑️ Deleting equipment:', id)
      await remove('equipment', id)
      setEquipment(prev => prev.filter(item => item.id !== id))
      setInspections(prev => prev.filter(inspection => inspection.equipmentId !== id))
    } catch (error) {
      console.error('❌ Error deleting equipment:', error)
      throw error
    }
  }

  // Vendor management
  const addVendor = async (vendorData) => {
    try {
      console.log('➕ Adding vendor:', vendorData)
      // The database service will auto-inject department_id and created_at
      const newVendor = await insert('vendors', {
        id: uuidv4(),
        ...vendorData
      })
      console.log('✅ Vendor added successfully:', newVendor)
      setVendors(prev => [...prev, newVendor])
      return newVendor
    } catch (error) {
      console.error('❌ Error adding vendor:', error)
      throw error
    }
  }

  const updateVendor = async (id, updates) => {
    try {
      const updatedVendor = await update('vendors', id, updates)
      setVendors(prev => prev.map(vendor => 
        vendor.id === id ? updatedVendor : vendor
      ))
      return updatedVendor
    } catch (error) {
      console.error('❌ Error updating vendor:', error)
      throw error
    }
  }

  const deleteVendor = async (id) => {
    try {
      await remove('vendors', id)
      setVendors(prev => prev.filter(vendor => vendor.id !== id))
    } catch (error) {
      console.error('❌ Error deleting vendor:', error)
      throw error
    }
  }

  // Inspection management with proper data transformation
  const addInspection = async (inspectionData) => {
    try {
      console.log('➕ Adding inspection:', inspectionData)
      // The database service will auto-inject department_id and created_at
      const newInspection = await insert('inspections', {
        id: uuidv4(),
        name: inspectionData.name,
        equipmentId: inspectionData.equipmentId,
        category: inspectionData.category,
        stationId: inspectionData.stationId,
        vendorId: inspectionData.vendorId,
        templateId: inspectionData.templateId,
        dueDate: inspectionData.dueDate,
        notes: inspectionData.notes,
        externalVendor: inspectionData.externalVendor,
        vendorContact: inspectionData.vendorContact
      })

      if (inspectionData.equipmentId) {
        setInspections(prev => [...prev, newInspection])

        // Add history entry to equipment
        await addEquipmentHistoryEntry(inspectionData.equipmentId, {
          type: 'inspection_scheduled',
          action: 'Inspection Scheduled',
          details: `${inspectionData.name} scheduled for ${format(new Date(inspectionData.dueDate), 'MMM dd, yyyy')}`,
          inspectionId: newInspection.id,
          notes: inspectionData.notes || ''
        })
      } else {
        setCategoryInspections(prev => [...prev, newInspection])
      }

      return newInspection
    } catch (error) {
      console.error('❌ Error adding inspection:', error)
      throw error
    }
  }

  // Category inspection management
  const addCategoryInspection = async (inspectionData) => {
    return await addInspection(inspectionData)
  }

  const updateInspection = async (id, updates) => {
    try {
      const inspection = inspections.find(i => i.id === id)
      
      const updatedInspection = await update('inspections', id, {
        name: updates.name,
        dueDate: updates.dueDate,
        lastCompleted: updates.lastCompleted,
        status: updates.status,
        notes: updates.notes,
        vendorContact: updates.vendorContact
      })

      setInspections(prev => prev.map(inspection => 
        inspection.id === id ? updatedInspection : inspection
      ))

      // If inspection is being completed, add history entry to equipment
      if (updates.lastCompleted && inspection?.equipmentId) {
        await addEquipmentHistoryEntry(inspection.equipmentId, {
          type: 'inspection_completed',
          action: 'Inspection Completed',
          details: `${inspection.name} completed successfully. Next inspection due ${format(new Date(updates.dueDate), 'MMM dd, yyyy')}`,
          inspectionId: id,
          completedDate: updates.lastCompleted,
          nextDueDate: updates.dueDate,
          templateId: inspection.templateId,
          notes: updates.notes || ''
        })
      }

      return updatedInspection
    } catch (error) {
      console.error('❌ Error updating inspection:', error)
      throw error
    }
  }

  const updateCategoryInspection = async (id, updates) => {
    try {
      const inspection = categoryInspections.find(i => i.id === id)
      
      const updatedInspection = await update('inspections', id, {
        name: updates.name,
        dueDate: updates.dueDate,
        lastCompleted: updates.lastCompleted,
        status: updates.status,
        notes: updates.notes,
        vendorContact: updates.vendorContact
      })

      setCategoryInspections(prev => prev.map(inspection => 
        inspection.id === id ? updatedInspection : inspection
      ))

      // If category inspection is being completed, add history entries to all applicable equipment
      if (updates.lastCompleted && inspection) {
        const applicableEquipment = equipment.filter(item => {
          const matchesCategory = item.category === inspection.category
          const matchesStation = !inspection.stationId || item.stationId === inspection.stationId
          return matchesCategory && matchesStation
        })

        for (const item of applicableEquipment) {
          await addEquipmentHistoryEntry(item.id, {
            type: 'inspection_completed',
            action: 'Category Inspection Completed',
            details: `${inspection.name} completed for all ${EQUIPMENT_CATEGORIES[inspection.category]?.name || 'category'} equipment. Next inspection due ${format(new Date(updates.dueDate), 'MMM dd, yyyy')}`,
            inspectionId: id,
            completedDate: updates.lastCompleted,
            nextDueDate: updates.dueDate,
            templateId: inspection.templateId,
            notes: updates.notes || ''
          })
        }
      }

      return updatedInspection
    } catch (error) {
      console.error('❌ Error updating category inspection:', error)
      throw error
    }
  }

  const deleteInspection = async (id) => {
    try {
      const inspection = inspections.find(i => i.id === id)
      await remove('inspections', id)
      setInspections(prev => prev.filter(inspection => inspection.id !== id))

      if (inspection && inspection.equipmentId) {
        await addEquipmentHistoryEntry(inspection.equipmentId, {
          type: 'inspection_cancelled',
          action: 'Inspection Cancelled',
          details: `${inspection.name} inspection was cancelled`,
          inspectionId: id,
          notes: ''
        })
      }
    } catch (error) {
      console.error('❌ Error deleting inspection:', error)
      throw error
    }
  }

  const deleteCategoryInspection = async (id) => {
    try {
      await remove('inspections', id)
      setCategoryInspections(prev => prev.filter(inspection => inspection.id !== id))
    } catch (error) {
      console.error('❌ Error deleting category inspection:', error)
      throw error
    }
  }

  // Get inspection status for equipment
  const getInspectionStatus = (equipmentId) => {
    const equipmentItem = equipment.find(item => item.id === equipmentId)
    if (!equipmentItem) return null

    // Check both individual inspections and category inspections
    const equipmentInspections = inspections.filter(i => i.equipmentId === equipmentId)
    const categoryInspectionsForEquipment = categoryInspections.filter(i =>
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
      return {
        status: 'past-due',
        label: 'Past Due',
        color: 'bg-red-600 text-red-100',
        days: Math.abs(daysUntilDue)
      }
    } else if (daysUntilDue <= 3) {
      return {
        status: 'critical',
        label: `${daysUntilDue} days`,
        color: 'bg-red-600 text-red-100',
        days: daysUntilDue
      }
    } else if (daysUntilDue <= 7) {
      return {
        status: 'warning',
        label: `${daysUntilDue} days`,
        color: 'bg-orange-600 text-orange-100',
        days: daysUntilDue
      }
    } else if (daysUntilDue <= 14) {
      return {
        status: 'attention',
        label: `${daysUntilDue} days`,
        color: 'bg-yellow-600 text-yellow-100',
        days: daysUntilDue
      }
    } else if (daysUntilDue <= 30) {
      return {
        status: 'normal',
        label: `${daysUntilDue} days`,
        color: 'bg-zinc-600 text-zinc-100',
        days: daysUntilDue
      }
    } else {
      return {
        status: 'upcoming',
        label: `${daysUntilDue} days`,
        color: 'bg-green-600 text-green-100',
        days: daysUntilDue
      }
    }
  }

  const value = {
    stations,
    equipment,
    inspections,
    categoryInspections,
    vendors,
    // Include loading state that accounts for all dependencies
    loading: authLoading || dbLoading || dataLoading,
    addStation,
    updateStation,
    deleteStation,
    addEquipment,
    updateEquipment,
    deleteEquipment,
    addInspection,
    addCategoryInspection,
    updateInspection,
    updateCategoryInspection,
    deleteInspection,
    deleteCategoryInspection,
    addEquipmentHistoryEntry,
    getInspectionStatus,
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
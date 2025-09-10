import React,{createContext,useContext,useState,useEffect} from 'react';
import {v4 as uuidv4} from 'uuid';
import {format,addMonths,addDays,isBefore,differenceInDays} from 'date-fns';

const DataContext=createContext();

export const useData=()=> {
const context=useContext(DataContext);
if (!context) {
throw new Error('useData must be used within a DataProvider');
}
return context;
};

// Equipment categories and inspection templates
export const EQUIPMENT_CATEGORIES={
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
};

export const INSPECTION_TEMPLATES={
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
categories: ['rescue','apparatus'],
regulation: 'NFPA 1932',
description: 'Annual inspection of aerial ladder devices',
external: true
},
'ladder-aerial-major': {
name: 'Aerial Ladder 5-Year Major Inspection (NFPA 1932)',
interval: 60,
type: 'months',
categories: ['rescue','apparatus'],
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
categories: ['rescue','pumps'],
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
categories: ['hose','apparatus'],
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
};

export const EQUIPMENT_STATUSES={
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
};

export const DataProvider=({children})=> {
const [stations,setStations]=useState([]);
const [equipment,setEquipment]=useState([]);
const [inspections,setInspections]=useState([]);
const [categoryInspections,setCategoryInspections]=useState([]);
const [vendors,setVendors]=useState([]);

useEffect(()=> {
// Load data from localStorage
const savedStations=localStorage.getItem('fire-gear-stations');
const savedEquipment=localStorage.getItem('fire-gear-equipment');
const savedInspections=localStorage.getItem('fire-gear-inspections');
const savedCategoryInspections=localStorage.getItem('fire-gear-category-inspections');
const savedVendors=localStorage.getItem('fire-gear-vendors');

if (savedStations) setStations(JSON.parse(savedStations));
if (savedEquipment) setEquipment(JSON.parse(savedEquipment));
if (savedInspections) setInspections(JSON.parse(savedInspections));
if (savedCategoryInspections) setCategoryInspections(JSON.parse(savedCategoryInspections));
if (savedVendors) setVendors(JSON.parse(savedVendors));
},[]);

useEffect(()=> {
localStorage.setItem('fire-gear-stations',JSON.stringify(stations));
},[stations]);

useEffect(()=> {
localStorage.setItem('fire-gear-equipment',JSON.stringify(equipment));
},[equipment]);

useEffect(()=> {
localStorage.setItem('fire-gear-inspections',JSON.stringify(inspections));
},[inspections]);

useEffect(()=> {
localStorage.setItem('fire-gear-category-inspections',JSON.stringify(categoryInspections));
},[categoryInspections]);

useEffect(()=> {
localStorage.setItem('fire-gear-vendors',JSON.stringify(vendors));
},[vendors]);

// Station management
const addStation=(stationData)=> {
const newStation={
id: uuidv4(),
...stationData,
createdAt: new Date().toISOString()
};
setStations(prev=> [...prev,newStation]);
return newStation;
};

const updateStation=(id,updates)=> {
setStations(prev=> prev.map(station=> 
station.id===id ? {...station,...updates} : station
));
};

const deleteStation=(id)=> {
setStations(prev=> prev.filter(station=> station.id !==id));
// Also remove equipment from this station
setEquipment(prev=> prev.filter(item=> item.stationId !==id));
};

// Equipment management
const addEquipment=(equipmentData)=> {
const newEquipment={
id: uuidv4(),
...equipmentData,
createdAt: new Date().toISOString(),
history: [{
id: uuidv4(),
date: new Date().toISOString(),
type: 'created',
action: 'Equipment Created',
user: 'Current User',
details: 'Equipment added to inventory',
status: equipmentData.status,
notes: equipmentData.notes || ''
}]
};
setEquipment(prev=> [...prev,newEquipment]);
return newEquipment;
};

const updateEquipment=(id,updates)=> {
setEquipment(prev=> prev.map(item=> {
if (item.id===id) {
const currentItem=item;
// Create a more meaningful description based on what was actually changed
let actionDescription='Equipment Updated';
let detailsDescription='';

// Check for status changes specifically
if (updates.status && updates.status !==currentItem.status) {
actionDescription='Status Changed';
detailsDescription=`Status changed from ${EQUIPMENT_STATUSES[currentItem.status]?.label} to ${EQUIPMENT_STATUSES[updates.status]?.label}`;
} else {
// For other updates,just say equipment information was updated
detailsDescription='Equipment information updated';
}

const historyEntry={
id: uuidv4(),
date: new Date().toISOString(),
type: 'updated',
action: actionDescription,
user: 'Current User',
details: detailsDescription,
previousStatus: currentItem.status,
newStatus: updates.status || currentItem.status,
notes: updates.notes || ''
};

return {
...item,
...updates,
history: [...(item.history || []),historyEntry]
};
}
return item;
}));
};

const addEquipmentHistoryEntry=(equipmentId,historyData)=> {
setEquipment(prev=> prev.map(item=> {
if (item.id===equipmentId) {
const newHistoryEntry={
id: uuidv4(),
date: new Date().toISOString(),
user: 'Current User',
...historyData
};
return {
...item,
history: [...(item.history || []),newHistoryEntry]
};
}
return item;
}));
};

const deleteEquipment=(id)=> {
setEquipment(prev=> prev.filter(item=> item.id !==id));
setInspections(prev=> prev.filter(inspection=> inspection.equipmentId !==id));
};

// Vendor management
const addVendor=(vendorData)=> {
const newVendor={
id: uuidv4(),
...vendorData,
createdAt: new Date().toISOString()
};
setVendors(prev=> [...prev,newVendor]);
return newVendor;
};

const updateVendor=(id,updates)=> {
setVendors(prev=> prev.map(vendor=> 
vendor.id===id ? {...vendor,...updates} : vendor
));
};

const deleteVendor=(id)=> {
setVendors(prev=> prev.filter(vendor=> vendor.id !==id));
};

// Inspection management
const addInspection=(inspectionData)=> {
const newInspection={
id: uuidv4(),
...inspectionData,
createdAt: new Date().toISOString()
};
setInspections(prev=> [...prev,newInspection]);

// Add history entry to equipment
if (inspectionData.equipmentId) {
addEquipmentHistoryEntry(inspectionData.equipmentId,{
type: 'inspection_scheduled',
action: 'Inspection Scheduled',
details: `${inspectionData.name} scheduled for ${format(new Date(inspectionData.dueDate),'MMM dd,yyyy')}`,
inspectionId: newInspection.id,
notes: inspectionData.notes || ''
});
}

return newInspection;
};

// Category inspection management
const addCategoryInspection=(inspectionData)=> {
const newInspection={
id: uuidv4(),
...inspectionData,
createdAt: new Date().toISOString()
};
setCategoryInspections(prev=> [...prev,newInspection]);
return newInspection;
};

const updateInspection=(id,updates)=> {
setInspections(prev=> prev.map(inspection=> {
if (inspection.id===id) {
const updatedInspection={...inspection,...updates};

// If inspection is being completed,add history entry to equipment
if (updates.lastCompleted && inspection.equipmentId) {
const template=INSPECTION_TEMPLATES[inspection.templateId];
addEquipmentHistoryEntry(inspection.equipmentId,{
type: 'inspection_completed',
action: 'Inspection Completed',
details: `${inspection.name} completed successfully. Next inspection due ${format(new Date(updates.dueDate),'MMM dd,yyyy')}`,
inspectionId: id,
completedDate: updates.lastCompleted,
nextDueDate: updates.dueDate,
templateId: inspection.templateId,
notes: updates.notes || ''
});
}

return updatedInspection;
}
return inspection;
}));
};

const updateCategoryInspection=(id,updates)=> {
setCategoryInspections(prev=> prev.map(inspection=> {
if (inspection.id===id) {
const updatedInspection={...inspection,...updates};

// If category inspection is being completed,add history entries to all applicable equipment
if (updates.lastCompleted) {
const applicableEquipment=equipment.filter(item=> {
const matchesCategory=item.category===inspection.category;
const matchesStation=!inspection.stationId || item.stationId===inspection.stationId;
return matchesCategory && matchesStation;
});

applicableEquipment.forEach(item=> {
addEquipmentHistoryEntry(item.id,{
type: 'inspection_completed',
action: 'Category Inspection Completed',
details: `${inspection.name} completed for all ${EQUIPMENT_CATEGORIES[inspection.category]?.name || 'category'} equipment. Next inspection due ${format(new Date(updates.dueDate),'MMM dd,yyyy')}`,
inspectionId: id,
completedDate: updates.lastCompleted,
nextDueDate: updates.dueDate,
templateId: inspection.templateId,
notes: updates.notes || ''
});
});
}

return updatedInspection;
}
return inspection;
}));
};

const deleteInspection=(id)=> {
const inspection=inspections.find(i=> i.id===id);
if (inspection && inspection.equipmentId) {
addEquipmentHistoryEntry(inspection.equipmentId,{
type: 'inspection_cancelled',
action: 'Inspection Cancelled',
details: `${inspection.name} inspection was cancelled`,
inspectionId: id,
notes: ''
});
}
setInspections(prev=> prev.filter(inspection=> inspection.id !==id));
};

const deleteCategoryInspection=(id)=> {
setCategoryInspections(prev=> prev.filter(inspection=> inspection.id !==id));
};

// Get inspection status for equipment
const getInspectionStatus=(equipmentId)=> {
const equipmentItem=equipment.find(item=> item.id===equipmentId);
if (!equipmentItem) return null;

// Check both individual inspections and category inspections
const equipmentInspections=inspections.filter(i=> i.equipmentId===equipmentId);
const categoryInspectionsForEquipment=categoryInspections.filter(i=> 
i.category===equipmentItem.category && 
(!i.stationId || i.stationId===equipmentItem.stationId)
);

const allInspections=[...equipmentInspections,...categoryInspectionsForEquipment];

if (allInspections.length===0) return null;

const nextInspection=allInspections
.sort((a,b)=> new Date(a.dueDate) - new Date(b.dueDate))[0];

const today=new Date();
const dueDate=new Date(nextInspection.dueDate);
const daysUntilDue=differenceInDays(dueDate,today);

if (daysUntilDue < 0) {
return {
status: 'past-due',
label: 'Past Due',
color: 'bg-red-600 text-red-100',
days: Math.abs(daysUntilDue)
};
} else if (daysUntilDue <=3) {
return {
status: 'critical',
label: `${daysUntilDue} days`,
color: 'bg-red-600 text-red-100',
days: daysUntilDue
};
} else if (daysUntilDue <=7) {
return {
status: 'warning',
label: `${daysUntilDue} days`,
color: 'bg-orange-600 text-orange-100',
days: daysUntilDue
};
} else if (daysUntilDue <=14) {
return {
status: 'attention',
label: `${daysUntilDue} days`,
color: 'bg-yellow-600 text-yellow-100',
days: daysUntilDue
};
} else if (daysUntilDue <=30) {
return {
status: 'normal',
label: `${daysUntilDue} days`,
color: 'bg-zinc-600 text-zinc-100',
days: daysUntilDue
};
} else {
return {
status: 'upcoming',
label: `${daysUntilDue} days`,
color: 'bg-green-600 text-green-100',
days: daysUntilDue
};
}
};

const value={
stations,
equipment,
inspections,
categoryInspections,
vendors,
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
};

return (
<DataContext.Provider value={value}>
{children}
</DataContext.Provider>
);
};
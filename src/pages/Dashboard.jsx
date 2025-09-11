import React from 'react';
import {Link} from 'react-router-dom';
import {useAuth} from '../contexts/AuthContext';
import {useData} from '../contexts/DataContext';
import {useDatabase} from '../contexts/DatabaseContext';
import SafeIcon from '../common/SafeIcon';
import InspectionBadge from '../components/InspectionBadge';
import StatusBadge from '../components/StatusBadge';
import {format,differenceInDays} from 'date-fns';
import * as FiIcons from 'react-icons/fi';

const {FiPackage,FiMapPin,FiAlertTriangle,FiCheckSquare,FiPlus,FiArrowRight,FiClock,FiZap,FiTool,FiEye,FiActivity}=FiIcons;

const Dashboard=()=> {
  const {user}=useAuth();
  const {stations,equipment,inspections,categoryInspections,getInspectionStatus}=useData();
  const {isConnected}=useDatabase();

  const getGreeting=()=> {
    const hour=new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getEquipmentStats=()=> {
    const total=equipment.length;
    const inService=equipment.filter(item=> item.status==='in-service').length;
    const outOfService=equipment.filter(item=> item.status==='out-of-service').length;
    const criticalInspections=equipment.filter(item=> {
      const status=getInspectionStatus(item.id);
      return status && (status.status==='past-due' || status.status==='critical');
    }).length;

    return {total,inService,outOfService,criticalInspections};
  };

  // Get critical alerts for the important section
  const getCriticalAlerts=()=> {
    const alerts=[];

    // Get overdue and critical inspections
    const allInspections=[...inspections,...categoryInspections];
    const today=new Date();

    allInspections.forEach(inspection=> {
      const dueDate=new Date(inspection.dueDate);
      const daysUntilDue=differenceInDays(dueDate,today);

      if (daysUntilDue <=7) { // Due within 7 days or overdue
        const equipmentName=inspection.equipmentId
          ? equipment.find(e=> e.id===inspection.equipmentId)?.name || 'Unknown Equipment'
          : `${inspection.category} Category`;

        alerts.push({
          id: `inspection-${inspection.id}`,
          type: 'inspection',
          priority: daysUntilDue < 0 ? 'critical' : daysUntilDue <=3 ? 'high' : 'medium',
          title: daysUntilDue < 0 ? 'Overdue Inspection' : 'Inspection Due Soon',
          description: `${inspection.name} for ${equipmentName}`,
          details: daysUntilDue < 0 ? `${Math.abs(daysUntilDue)} days overdue` : `Due in ${daysUntilDue} day${daysUntilDue !==1 ? 's' : ''}`,
          dueDate: inspection.dueDate,
          notes: inspection.notes,
          link: '/app/inspections',
          equipment: equipmentName
        });
      }
    });

    // Get equipment that's out of service,out for repair,or cannot be located
    equipment.forEach(item=> {
      if (item.status !=='in-service') {
        const statusLabels={
          'out-of-service': 'Out of Service',
          'out-for-repair': 'Out for Repair',
          'cannot-locate': 'Cannot Locate',
          'in-training': 'In Training'
        };

        alerts.push({
          id: `equipment-${item.id}`,
          type: 'equipment',
          priority: item.status==='cannot-locate' || item.status==='out-of-service' ? 'high' : 'medium',
          title: statusLabels[item.status] || 'Equipment Issue',
          description: `${item.name} (${item.serialNumber})`,
          details: `Status: ${statusLabels[item.status]}`,
          notes: item.notes,
          link: '/app/equipment',
          stationName: stations.find(s=> s.id===item.stationId)?.name || 'Unknown Station'
        });
      }
    });

    // Sort by priority and date
    return alerts.sort((a,b)=> {
      const priorityOrder={'critical': 0,'high': 1,'medium': 2};
      if (priorityOrder[a.priority] !==priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      // For inspections,sort by due date
      if (a.type==='inspection' && b.type==='inspection') {
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      return 0;
    }).slice(0,8); // Show top 8 alerts
  };

  const stats=getEquipmentStats();
  const criticalAlerts=getCriticalAlerts();

  const getPriorityColor=(priority)=> {
    switch(priority) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      default: return 'text-mission-text-muted bg-mission-bg-tertiary border-mission-border';
    }
  };

  const getPriorityIcon=(alert)=> {
    if (alert.type==='inspection') {
      return alert.priority==='critical' ? FiAlertTriangle : FiClock;
    } else {
      return FiTool;
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <h1 className="text-2xl font-inter-tight font-bold text-mission-text-primary">
              Dashboard
            </h1>
            <div className="status-dot status-success w-2 h-2 bg-mission-accent-green rounded-full"></div>
          </div>
          <p className="text-base font-inter text-mission-text-secondary">
            {getGreeting()},{user?.name}
          </p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <div className="text-sm font-roboto-mono text-mission-text-muted">
            {new Date().toLocaleString('en-US',{
              hour12: false,
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </div>
        </div>
      </div>

      {/* Critical Alerts */}
      {stats.criticalInspections > 0 && (
        <Link to="/app/inspections">
          <div className="bg-red-950/20 border border-red-800/30 rounded-md p-4 hover:bg-red-950/30 transition-colors mission-glow-red">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="status-dot status-critical w-2 h-2 bg-red-500 rounded-full mission-pulse"></div>
                <div>
                  <h3 className="text-base font-inter-tight font-bold text-red-400">Critical Alert</h3>
                  <p className="text-sm font-inter text-red-300">
                    {stats.criticalInspections} equipment items require immediate attention
                  </p>
                </div>
              </div>
              <SafeIcon icon={FiArrowRight} className="w-5 h-5 text-red-400" />
            </div>
          </div>
        </Link>
      )}

      {/* Dashboard Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Important Alerts Panel */}
        <div className="bg-mission-bg-secondary border border-mission-border rounded-md">
          <div className="px-4 py-3 border-b border-mission-border flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiAlertTriangle} className="w-4 h-4 text-red-400" />
              <h2 className="text-base font-inter-tight font-bold text-mission-text-primary">Important Alerts</h2>
              {criticalAlerts.length > 0 && (
                <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-roboto-mono font-medium">
                  {criticalAlerts.length}
                </span>
              )}
            </div>
            {criticalAlerts.length > 0 && (
              <Link
                to="/app/inspections"
                className="text-xs font-roboto-mono text-mission-accent-blue hover:text-white transition-colors"
              >
                VIEW ALL →
              </Link>
            )}
          </div>
          <div className="p-4">
            {criticalAlerts.length===0 ? (
              <div className="text-center py-6">
                <SafeIcon icon={FiCheckSquare} className="w-10 h-10 text-mission-accent-green mx-auto mb-3" />
                <p className="text-sm font-inter text-mission-accent-green mb-1">All Clear</p>
                <p className="text-sm font-roboto-mono text-mission-text-muted">No critical alerts</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {criticalAlerts.map((alert)=> (
                  <Link
                    key={alert.id}
                    to={alert.link}
                    className="block p-3 bg-mission-bg-tertiary hover:bg-mission-bg-primary rounded-lg transition-colors group"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${getPriorityColor(alert.priority)} border`}>
                        <SafeIcon icon={getPriorityIcon(alert)} className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="text-sm font-inter font-medium text-mission-text-primary">
                                {alert.title}
                              </h4>
                              <span className={`px-2 py-0.5 rounded text-xs font-roboto-mono font-medium border ${getPriorityColor(alert.priority)}`}>
                                {alert.priority.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-sm font-inter text-mission-text-secondary truncate">
                              {alert.description}
                            </p>
                            <p className="text-xs font-roboto-mono text-mission-text-muted mt-1">
                              {alert.details}
                            </p>
                            {alert.stationName && (
                              <p className="text-xs font-roboto-mono text-mission-accent-blue mt-1">
                                Station: {alert.stationName}
                              </p>
                            )}
                            {alert.notes && (
                              <div className="mt-2 p-2 bg-mission-bg-primary rounded border-l-2 border-mission-accent-orange">
                                <p className="text-xs font-inter text-mission-text-muted">
                                  <strong>Notes:</strong> {alert.notes.length > 100 ? `${alert.notes.substring(0,100)}...` : alert.notes}
                                </p>
                              </div>
                            )}
                          </div>
                          <SafeIcon icon={FiEye} className="w-4 h-4 text-mission-text-muted group-hover:text-mission-accent-blue transition-colors ml-2 flex-shrink-0" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Panel */}
        <div className="bg-mission-bg-secondary border border-mission-border rounded-md">
          <div className="px-4 py-3 border-b border-mission-border flex items-center space-x-2">
            <SafeIcon icon={FiActivity} className="w-4 h-4 text-mission-accent-green" />
            <h2 className="text-base font-inter-tight font-bold text-mission-text-primary">Recent Activity</h2>
          </div>
          <div className="p-4">
            {equipment.length===0 ? (
              <div className="text-center py-6">
                <SafeIcon icon={FiPackage} className="w-10 h-10 text-mission-text-muted mx-auto mb-3" />
                <p className="text-sm font-inter text-mission-text-muted mb-1">No equipment data</p>
                <p className="text-xs font-roboto-mono text-mission-text-muted mb-4">Initialize system</p>
                <Link
                  to="/app/equipment"
                  className="inline-flex items-center space-x-2 bg-fire-red hover:bg-fire-red-dark text-white px-3 py-2 rounded text-xs font-inter font-medium transition-colors"
                >
                  <SafeIcon icon={FiPlus} className="w-3 h-3" />
                  <span>Add Equipment</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {equipment
                  .sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt))
                  .slice(0,5)
                  .map((item)=> (
                    <div key={item.id} className="flex items-center space-x-3 p-3 bg-mission-bg-tertiary hover:bg-mission-bg-primary rounded-lg transition-colors">
                      <div className="flex items-center justify-center w-8 h-8 bg-mission-accent-blue/20 rounded-lg">
                        <SafeIcon icon={FiPackage} className="w-4 h-4 text-mission-accent-blue" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-inter font-medium text-mission-text-primary truncate">
                          {item.name}
                        </div>
                        <div className="text-xs font-roboto-mono text-mission-text-muted">
                          {item.serialNumber} • Added {new Date(item.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <StatusBadge status={item.status} />
                    </div>
                  ))}

                {equipment.length > 5 && (
                  <Link
                    to="/app/equipment"
                    className="block text-center text-fire-red hover:text-fire-red-light text-sm font-roboto-mono mt-4 py-2"
                  >
                    View All Equipment ({equipment.length}) →
                  </Link>
                )}

                {/* Quick Actions */}
                <div className="pt-4 border-t border-mission-border space-y-3">
                  <h3 className="text-sm font-inter font-medium text-mission-text-primary mb-3">Quick Actions</h3>
                  <Link
                    to="/app/stations"
                    className="flex items-center space-x-3 p-3 bg-mission-bg-tertiary hover:bg-mission-bg-primary rounded-md transition-colors group"
                  >
                    <div className="flex items-center justify-center w-7 h-7 bg-fire-red/20 rounded-md group-hover:bg-fire-red/30 transition-colors">
                      <SafeIcon icon={FiMapPin} className="w-4 h-4 text-fire-red" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-inter font-medium text-mission-text-primary">Add Station</div>
                      <div className="text-xs font-roboto-mono text-mission-text-muted">Create new location</div>
                    </div>
                  </Link>

                  <Link
                    to="/app/equipment"
                    className="flex items-center space-x-3 p-3 bg-mission-bg-tertiary hover:bg-mission-bg-primary rounded-md transition-colors group"
                  >
                    <div className="flex items-center justify-center w-7 h-7 bg-fire-red/20 rounded-md group-hover:bg-fire-red/30 transition-colors">
                      <SafeIcon icon={FiPackage} className="w-4 h-4 text-fire-red" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-inter font-medium text-mission-text-primary">Add Equipment</div>
                      <div className="text-xs font-roboto-mono text-mission-text-muted">Register new gear</div>
                    </div>
                  </Link>

                  <Link
                    to="/app/inspections"
                    className="flex items-center space-x-3 p-3 bg-mission-bg-tertiary hover:bg-mission-bg-primary rounded-md transition-colors group"
                  >
                    <div className="flex items-center justify-center w-7 h-7 bg-fire-red/20 rounded-md group-hover:bg-fire-red/30 transition-colors">
                      <SafeIcon icon={FiCheckSquare} className="w-4 h-4 text-fire-red" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-inter font-medium text-mission-text-primary">Schedule Inspection</div>
                      <div className="text-xs font-roboto-mono text-mission-text-muted">Plan maintenance</div>
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
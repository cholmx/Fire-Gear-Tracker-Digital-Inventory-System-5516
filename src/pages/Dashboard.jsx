import React from 'react';
import {Link} from 'react-router-dom';
import {useAuth} from '../contexts/AuthContext';
import {useData} from '../contexts/DataContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const {FiPackage,FiMapPin,FiAlertTriangle,FiCheckSquare,FiPlus,FiArrowRight,FiActivity,FiClock,FiTrendingUp,FiZap}=FiIcons;

const Dashboard=()=> {
  const {user}=useAuth();
  const {stations,equipment,getInspectionStatus}=useData();

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

  const stats=getEquipmentStats();

  return (
    <div className="min-h-screen bg-mission-bg-primary">
      <div className="space-y-6 p-6">
        {/* Dashboard Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-inter-tight font-bold text-mission-text-primary">
                DASHBOARD
              </h1>
              <div className="status-dot status-success w-2 h-2 bg-mission-accent-green rounded-full"></div>
            </div>
            <p className="text-base font-inter text-mission-text-secondary">
              {getGreeting()}, {user?.name} • All systems operational
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <div className="text-sm font-roboto-mono text-mission-text-muted">
              {new Date().toLocaleString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
              })}
            </div>
            <Link
              to="/app/equipment"
              className="flex items-center space-x-2 bg-fire-red hover:bg-fire-red-dark text-white px-4 py-2 rounded-md text-sm font-inter font-medium transition-colors mission-glow-red"
            >
              <SafeIcon icon={FiPlus} className="w-4 h-4" />
              <span>ADD EQUIPMENT</span>
            </Link>
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
                    <h3 className="text-base font-inter-tight font-bold text-red-400">CRITICAL ALERT</h3>
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

        {/* Primary Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/app/equipment" className="block group">
            <div className="bg-mission-bg-secondary border border-mission-border rounded-md p-4 hover:border-mission-border-light transition-all duration-200 group-hover:mission-glow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center justify-center w-8 h-8 bg-mission-accent-blue/20 rounded-md">
                  <SafeIcon icon={FiPackage} className="w-4 h-4 text-mission-accent-blue" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-inter-tight font-bold text-mission-text-primary">{stats.total}</div>
                  <div className="text-xs font-roboto-mono text-mission-text-muted">TOTAL</div>
                </div>
              </div>
              <div className="text-sm font-inter font-medium text-mission-text-secondary">Equipment Items</div>
            </div>
          </Link>

          <Link to="/app/equipment" className="block group">
            <div className="bg-mission-bg-secondary border border-mission-border rounded-md p-4 hover:border-mission-border-light transition-all duration-200 group-hover:mission-glow-green">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center justify-center w-8 h-8 bg-mission-accent-green/20 rounded-md">
                  <SafeIcon icon={FiCheckSquare} className="w-4 h-4 text-mission-accent-green" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-inter-tight font-bold text-mission-text-primary">{stats.inService}</div>
                  <div className="text-xs font-roboto-mono text-mission-text-muted">ACTIVE</div>
                </div>
              </div>
              <div className="text-sm font-inter font-medium text-mission-text-secondary">In Service</div>
            </div>
          </Link>

          <Link to="/app/equipment" className="block group">
            <div className="bg-mission-bg-secondary border border-mission-border rounded-md p-4 hover:border-mission-border-light transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center justify-center w-8 h-8 bg-red-500/20 rounded-md">
                  <SafeIcon icon={FiAlertTriangle} className="w-4 h-4 text-red-400" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-inter-tight font-bold text-mission-text-primary">{stats.outOfService}</div>
                  <div className="text-xs font-roboto-mono text-mission-text-muted">OFFLINE</div>
                </div>
              </div>
              <div className="text-sm font-inter font-medium text-mission-text-secondary">Out of Service</div>
            </div>
          </Link>

          <Link to="/app/stations" className="block group">
            <div className="bg-mission-bg-secondary border border-mission-border rounded-md p-4 hover:border-mission-border-light transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center justify-center w-8 h-8 bg-mission-accent-orange/20 rounded-md">
                  <SafeIcon icon={FiMapPin} className="w-4 h-4 text-mission-accent-orange" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-inter-tight font-bold text-mission-text-primary">{stations.length}</div>
                  <div className="text-xs font-roboto-mono text-mission-text-muted">ONLINE</div>
                </div>
              </div>
              <div className="text-sm font-inter font-medium text-mission-text-secondary">Stations</div>
            </div>
          </Link>
        </div>

        {/* Dashboard Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions Panel */}
          <div className="bg-mission-bg-secondary border border-mission-border rounded-md">
            <div className="px-4 py-3 border-b border-mission-border flex items-center space-x-2">
              <SafeIcon icon={FiZap} className="w-4 h-4 text-mission-accent-blue" />
              <h2 className="text-base font-inter-tight font-bold text-mission-text-primary">QUICK ACTIONS</h2>
            </div>
            <div className="p-4 space-y-3">
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

          {/* System Performance */}
          <div className="bg-mission-bg-secondary border border-mission-border rounded-md">
            <div className="px-4 py-3 border-b border-mission-border flex items-center space-x-2">
              <SafeIcon icon={FiActivity} className="w-4 h-4 text-mission-accent-green" />
              <h2 className="text-base font-inter-tight font-bold text-mission-text-primary">SYSTEM STATUS</h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-inter text-mission-text-secondary">Database</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-mission-accent-green rounded-full"></div>
                  <span className="text-sm font-roboto-mono text-mission-accent-green">ONLINE</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-inter text-mission-text-secondary">Sync Status</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-mission-accent-green rounded-full"></div>
                  <span className="text-sm font-roboto-mono text-mission-accent-green">SYNCED</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-inter text-mission-text-secondary">Last Backup</span>
                <span className="text-sm font-roboto-mono text-mission-text-muted">2 MIN AGO</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-inter text-mission-text-secondary">Response Time</span>
                <span className="text-sm font-roboto-mono text-mission-accent-blue">12ms</span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-mission-bg-secondary border border-mission-border rounded-md">
            <div className="px-4 py-3 border-b border-mission-border flex items-center space-x-2">
              <SafeIcon icon={FiClock} className="w-4 h-4 text-mission-accent-orange" />
              <h2 className="text-base font-inter-tight font-bold text-mission-text-primary">RECENT ACTIVITY</h2>
            </div>
            <div className="p-4">
              {equipment.length === 0 ? (
                <div className="text-center py-6">
                  <SafeIcon icon={FiPackage} className="w-10 h-10 text-mission-text-muted mx-auto mb-3" />
                  <p className="text-sm font-inter text-mission-text-muted mb-1">No equipment data</p>
                  <p className="text-sm font-roboto-mono text-mission-text-muted mb-3">Initialize system</p>
                  <Link
                    to="/app/equipment"
                    className="inline-flex items-center space-x-2 bg-fire-red hover:bg-fire-red-dark text-white px-3 py-2 rounded text-sm font-inter font-medium transition-colors"
                  >
                    <SafeIcon icon={FiPlus} className="w-4 h-4" />
                    <span>ADD EQUIPMENT</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {equipment.slice(0, 4).map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-inter font-medium text-mission-text-primary truncate">
                          {item.name}
                        </div>
                        <div className="text-xs font-roboto-mono text-mission-text-muted">
                          {item.serialNumber}
                        </div>
                      </div>
                      <div className="text-xs font-roboto-mono text-mission-text-muted">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  {equipment.length > 4 && (
                    <Link
                      to="/app/equipment"
                      className="block text-center text-fire-red hover:text-fire-red-light text-sm font-roboto-mono mt-3"
                    >
                      VIEW ALL ({equipment.length}) →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
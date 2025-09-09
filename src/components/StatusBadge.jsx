import React from 'react';
import { EQUIPMENT_STATUSES } from '../contexts/DataContext';

const StatusBadge = ({ status, className = '' }) => {
  const statusConfig = EQUIPMENT_STATUSES[status];
  if (!statusConfig) return null;

  // Mission control style colors
  const missionColors = {
    'in-service': 'bg-mission-accent-green/20 text-mission-accent-green border-mission-accent-green/30',
    'out-of-service': 'bg-red-500/20 text-red-400 border-red-500/30',
    'out-for-repair': 'bg-mission-accent-orange/20 text-mission-accent-orange border-mission-accent-orange/30',
    'cannot-locate': 'bg-mission-accent-purple/20 text-mission-accent-purple border-mission-accent-purple/30',
    'in-training': 'bg-mission-accent-blue/20 text-mission-accent-blue border-mission-accent-blue/30',
    'other': 'bg-mission-text-muted/20 text-mission-text-muted border-mission-text-muted/30'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-sm font-roboto-mono font-medium border ${missionColors[status] || missionColors.other} ${className}`}>
      {statusConfig.label.toUpperCase()}
    </span>
  );
};

export default StatusBadge;
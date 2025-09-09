import React from 'react';

const InspectionBadge = ({ inspectionStatus, className = '' }) => {
  if (!inspectionStatus) return null;

  // Mission control style colors
  const missionColors = {
    'past-due': 'bg-red-500/20 text-red-400 border-red-500/30 mission-pulse',
    'critical': 'bg-red-500/20 text-red-400 border-red-500/30',
    'warning': 'bg-mission-accent-orange/20 text-mission-accent-orange border-mission-accent-orange/30',
    'attention': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    'normal': 'bg-mission-text-muted/20 text-mission-text-muted border-mission-text-muted/30',
    'upcoming': 'bg-mission-accent-green/20 text-mission-accent-green border-mission-accent-green/30'
  };

  const displayText = inspectionStatus.status === 'past-due' 
    ? 'OVERDUE' 
    : `${inspectionStatus.days}D`;

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-sm font-roboto-mono font-medium border ${missionColors[inspectionStatus.status] || missionColors.normal} ${className}`}>
      {displayText}
    </span>
  );
};

export default InspectionBadge;
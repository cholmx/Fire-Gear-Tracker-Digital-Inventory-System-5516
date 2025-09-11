import React from 'react';
import * as FiIcons from 'react-icons/fi';
import { FiAlertTriangle, FiShield, FiCheck } from 'react-icons/fi';

// Custom Shield with Checkmark component
const ShieldCheck = ({ className, ...props }) => {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} {...props}>
      <FiShield className="w-full h-full" />
      <FiCheck className="absolute w-1/2 h-1/2" style={{ transform: 'translate(-50%, -50%)', left: '50%', top: '50%' }} />
    </div>
  );
};

const SafeIcon = ({ icon, name, ...props }) => {
  let IconComponent;

  try {
    // Check for custom ShieldCheck icon
    if (icon === 'ShieldCheck' || name === 'ShieldCheck') {
      return <ShieldCheck {...props} />;
    }
    
    IconComponent = icon || (name && FiIcons[`Fi${name}`]);
  } catch (e) {
    IconComponent = null;
  }

  return IconComponent ? React.createElement(IconComponent, props) : <FiAlertTriangle {...props} />;
};

export default SafeIcon;
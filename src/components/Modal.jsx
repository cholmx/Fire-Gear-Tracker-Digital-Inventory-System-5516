import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiX } = FiIcons;

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={onClose}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className={`relative w-full ${sizeClasses[size]} bg-mission-bg-secondary border border-mission-border rounded-md shadow-2xl`}
            >
              <div className="flex items-center justify-between px-4 py-3 border-b border-mission-border">
                <h3 className="text-sm font-inter-tight font-bold text-mission-text-primary uppercase">
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="p-1 rounded-md hover:bg-mission-bg-tertiary transition-colors"
                >
                  <SafeIcon icon={FiX} className="w-4 h-4 text-mission-text-muted" />
                </button>
              </div>
              <div className="p-4 font-inter text-mission-text-primary">
                {children}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface SettingConfig {
  id: string;
  label: string;
  value: number;
  unit?: string;
  type: 'slider' | 'number';
  min: number;
  max: number;
  step: number;
}

export interface ContextMenuProps {
  x: number;
  y: number;
  title: string;
  subtitle?: string;
  settings: SettingConfig[];
  onSettingChange: (id: string, value: number) => void;
  onClose: () => void;
}

export default function ContextMenu({
  x,
  y,
  title,
  subtitle,
  settings,
  onSettingChange,
  onClose,
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [localValues, setLocalValues] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const setting of settings) {
      initial[setting.id] = setting.value;
    }
    return initial;
  });

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleValueChange = (id: string, value: number) => {
    setLocalValues((prev) => ({ ...prev, [id]: value }));
    onSettingChange(id, value);
  };

  const renderSetting = (setting: SettingConfig) => {
    const currentValue = localValues[setting.id];

    if (setting.type === 'slider') {
      return (
        <div key={setting.id}>
          <label
            htmlFor={setting.id}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {setting.label}
            {setting.unit && (
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                ({setting.unit})
              </span>
            )}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              id={setting.id}
              min={setting.min}
              max={setting.max}
              step={setting.step}
              value={currentValue}
              onChange={(e) => handleValueChange(setting.id, Number.parseFloat(e.target.value))}
              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <span className="text-sm font-mono text-gray-700 dark:text-gray-300 min-w-[3rem] text-right">
              {currentValue.toFixed(getDecimalPlaces(setting.step))}
            </span>
          </div>
        </div>
      );
    }

    if (setting.type === 'number') {
      return (
        <div key={setting.id}>
          <label
            htmlFor={setting.id}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {setting.label}
            {setting.unit && (
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                ({setting.unit})
              </span>
            )}
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              id={setting.id}
              min={setting.min}
              max={setting.max}
              step={setting.step}
              value={currentValue}
              onChange={(e) => {
                const value = Number.parseFloat(e.target.value);
                if (!Number.isNaN(value)) {
                  handleValueChange(setting.id, value);
                }
              }}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {setting.unit && (
              <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[3rem]">
                {setting.unit}
              </span>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.15 }}
        className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 min-w-[280px] overflow-hidden"
        style={{
          left: `${x}px`,
          top: `${y}px`,
        }}
      >
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <h3 className="font-semibold text-lg">{title}</h3>
          {subtitle && <p className="text-xs opacity-90">{subtitle}</p>}
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {settings.map((setting) => renderSetting(setting))}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Helper function to determine decimal places based on step
function getDecimalPlaces(step: number): number {
  const stepStr = step.toString();
  if (stepStr.includes('.')) {
    return stepStr.split('.')[1].length;
  }
  return 0;
}

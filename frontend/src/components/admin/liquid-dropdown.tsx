'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LiquidDropdownProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  className?: string;
}

export default function LiquidDropdown({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select option...',
  className = '',
}: LiquidDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [positionTop, setPositionTop] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate dropdown position
  useEffect(() => {
    if (!isOpen || !buttonRef.current) return;

    const button = buttonRef.current;
    const rect = button.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = 240;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Position above if not enough space below
    setPositionTop(spaceBelow < dropdownHeight + 20 && spaceAbove > dropdownHeight);
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption?.label || placeholder;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && <label className="block text-sm font-medium text-white mb-2">{label}</label>}

      {/* Dropdown Button */}
      <motion.button
        ref={buttonRef}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full px-3 py-2 rounded border border-white/10 bg-white/5 text-white font-medium flex items-center justify-between gap-2 transition-all hover:border-white/20 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/20 text-sm"
        type="button"
      >
        <span className="truncate text-left">{displayLabel}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4 text-white/70 flex-shrink-0" />
        </motion.div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute ${
              positionTop ? 'bottom-full mb-1' : 'top-full mt-1'
            } left-0 right-0 rounded border border-white/10 bg-white/5 backdrop-blur-sm p-1 z-50`}
            style={{
              maxHeight: '200px',
              minWidth: '160px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="overflow-y-auto space-y-0" style={{ maxHeight: '180px' }}>
              {options.map((option) => (
                <motion.button
                  key={option.value}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${
                    value === option.value
                      ? 'bg-white/15 text-white font-medium'
                      : 'text-white/80 hover:text-white'
                  }`}
                  type="button"
                >
                  {option.label}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

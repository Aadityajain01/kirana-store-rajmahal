'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
  hint?: string;
}

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  size?: 'xs' | 'sm' | 'md';
  useNative?: boolean;
}

export function CustomDropdown({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  className = '',
  buttonClassName = '',
  size = 'xs',
  useNative = true,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const sizeClasses = {
    xs: 'text-xs py-1 px-2 h-7',
    sm: 'text-xs py-1.5 px-2.5 h-8',
    md: 'text-sm py-2 px-3 h-9',
  };

  if (useNative) {
    return (
      <div className={`relative inline-block text-left w-full ${className}`} ref={containerRef}>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full appearance-none rounded-md border border-slate-300 bg-white font-medium text-slate-800 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-slate-500 transition-colors pr-6 cursor-pointer ${sizeClasses[size]} ${buttonClassName}`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="text-slate-800 py-1 bg-white font-sans">
              {option.label} {option.hint ? `(${option.hint})` : ''}
            </option>
          ))}
        </select>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    );
  }

  return (
    <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full rounded-md border border-slate-300 bg-white font-medium text-slate-800 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-slate-500 transition-colors ${sizeClasses[size]} ${buttonClassName}`}
      >
        <span className="truncate mr-1">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-1 min-w-[120px] max-h-56 overflow-y-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none text-xs">
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`flex items-center justify-between w-full px-2.5 py-1.5 text-left text-xs transition-colors ${
                  isSelected
                    ? 'bg-slate-100 font-bold text-slate-900'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div>
                  <span>{option.label}</span>
                  {option.hint && <span className="text-[10px] text-slate-400 ml-1">({option.hint})</span>}
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-slate-700 ml-1 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

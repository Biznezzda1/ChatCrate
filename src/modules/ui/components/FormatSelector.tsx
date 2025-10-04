// src/modules/ui/components/FormatSelector.tsx
import React from 'react';

interface FormatSelectorProps {
  value: string;
  onChange: (format: string) => void;
}

export const FormatSelector: React.FC<FormatSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
        <span className="text-base">📄</span>
        <span>输出格式</span>
      </label>
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="px-3 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-gray-900 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer hover:border-blue-400 hover:shadow-sm"
      >
        <option value="tana-paste">Tana Paste Format</option>
      </select>
    </div>
  );
};


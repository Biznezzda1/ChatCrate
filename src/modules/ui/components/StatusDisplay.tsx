// src/modules/ui/components/StatusDisplay.tsx
import React from 'react';

interface StatusDisplayProps {
  status: 'idle' | 'loading' | 'success' | 'error';
  message?: string;
  characterCount?: number;
}

export const StatusDisplay: React.FC<StatusDisplayProps> = ({ 
  status, 
  message, 
  characterCount 
}) => {
  const statusConfig = {
    idle: {
      bg: 'bg-gray-50 border-gray-300',
      text: 'text-gray-700',
      icon: '○',
      iconSize: 'text-xl'
    },
    loading: {
      bg: 'bg-blue-50 border-blue-300',
      text: 'text-blue-800',
      icon: '⏳',
      iconSize: 'text-xl animate-pulse'
    },
    success: {
      bg: 'bg-green-50 border-green-300',
      text: 'text-green-800',
      icon: '✓',
      iconSize: 'text-xl'
    },
    error: {
      bg: 'bg-red-50 border-red-300',
      text: 'text-red-800',
      icon: '✗',
      iconSize: 'text-xl'
    }
  };
  
  const config = statusConfig[status];
  
  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border-2 ${config.bg} ${config.text} shadow-sm`}>
      <span className={config.iconSize}>{config.icon}</span>
      <div className="flex-1">
        <p className="font-bold text-sm leading-tight">{message || '等待操作...'}</p>
        {characterCount !== undefined && (
          <p className="text-xs opacity-80 mt-1.5 font-medium">
            ✓ 已复制 {characterCount.toLocaleString()} 个字符
          </p>
        )}
      </div>
    </div>
  );
};


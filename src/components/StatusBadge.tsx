import React from 'react';

interface StatusBadgeProps {
  status: 'success' | 'processing' | 'failed' | 'online' | 'warning' | 'info';
  primaryText: string;
  secondaryText?: string;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  primaryText, 
  secondaryText, 
  className = '' 
}) => {
  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          bgColor: 'bg-green-50',
          dotColor: 'bg-green-400',
          textColor: 'text-green-700'
        };
      case 'processing':
        return {
          bgColor: 'bg-blue-50',
          dotColor: 'bg-blue-400 animate-pulse',
          textColor: 'text-blue-700'
        };
      case 'failed':
        return {
          bgColor: 'bg-red-50',
          dotColor: 'bg-red-400',
          textColor: 'text-red-700'
        };
      case 'online':
        return {
          bgColor: 'bg-green-50',
          dotColor: 'bg-green-400 animate-pulse',
          textColor: 'text-green-700'
        };
      case 'warning':
        return {
          bgColor: 'bg-yellow-50',
          dotColor: 'bg-yellow-400',
          textColor: 'text-yellow-700'
        };
      case 'info':
        return {
          bgColor: 'bg-blue-50',
          dotColor: 'bg-blue-400',
          textColor: 'text-blue-700'
        };
      default:
        return {
          bgColor: 'bg-gray-50',
          dotColor: 'bg-gray-400',
          textColor: 'text-gray-700'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`flex items-center space-x-2 ${config.bgColor} px-3 py-2 rounded-lg ${className}`}>
      <div className={`h-2 w-2 ${config.dotColor} rounded-full`}></div>
      <div className={`${config.textColor}`}>
        <span className="text-sm font-bold">{primaryText}</span>
        {secondaryText && (
          <div className="text-sm font-medium">{secondaryText}</div>
        )}
      </div>
    </div>
  );
};

export default StatusBadge;
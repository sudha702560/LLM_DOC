import React from 'react';
import { X, FileText, CheckCircle, AlertTriangle, Clock, User } from 'lucide-react';

interface NotificationPanelProps {
  onClose: () => void;
}

const notifications = [
  {
    id: 1,
    type: 'success',
    title: 'Document Processed',
    message: 'Health Insurance Policy v2.1.pdf has been successfully processed',
    time: '2 minutes ago',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    id: 2,
    type: 'warning',
    title: 'Storage Warning',
    message: 'You are approaching your storage limit (85% used)',
    time: '1 hour ago',
    icon: AlertTriangle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50'
  },
  {
    id: 3,
    type: 'info',
    title: 'New User Added',
    message: 'Sarah Wilson has been added to your team',
    time: '3 hours ago',
    icon: User,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    id: 4,
    type: 'processing',
    title: 'Document Processing',
    message: 'Claims Processing Workflow.pdf is being analyzed',
    time: '5 hours ago',
    icon: Clock,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  }
];

export default function NotificationPanel({ onClose }: NotificationPanelProps) {
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
      
      {/* Panel */}
      <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors duration-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-lg ${notification.bgColor}`}>
                  <notification.icon className={`h-4 w-4 ${notification.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-gray-200">
          <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200">
            View All Notifications
          </button>
        </div>
      </div>
    </>
  );
}
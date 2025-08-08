import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Clock,
  TrendingUp,
  Users,
  Zap,
  BarChart3
} from 'lucide-react';

const stats = [
  { name: 'Total Documents', value: '2,847', change: '+12%', changeType: 'increase', icon: FileText },
  { name: 'Queries Processed', value: '1,329', change: '+18%', changeType: 'increase', icon: MessageSquare },
  { name: 'Approved Claims', value: '892', change: '+8%', changeType: 'increase', icon: CheckCircle },
  { name: 'Processing Time', value: '2.3s', change: '-15%', changeType: 'decrease', icon: Clock },
];

const recentQueries = [
  {
    id: 1,
    query: '46M, knee surgery, Pune, 3-month policy',
    status: 'approved',
    amount: '₹10,40,625',
    time: '2 minutes ago',
    confidence: 94
  },
  {
    id: 2,
    query: 'Dental coverage for 32F, premium policy',
    status: 'approved',
    amount: '₹2,33,100',
    time: '15 minutes ago',
    confidence: 89
  },
  {
    id: 3,
    query: 'Pre-existing condition, heart surgery',
    status: 'rejected',
    amount: '₹0',
    time: '23 minutes ago',
    confidence: 96
  },
  {
    id: 4,
    query: 'Emergency room visit, Mumbai',
    status: 'processing',
    amount: 'Processing',
    time: '45 minutes ago',
    confidence: null
  }
];

// Real-time data fetching utility
const useRealTimeStats = () => {
  const [stats, setStats] = useState(null);
  
  useEffect(() => {
    const fetchCurrentStats = () => {
      // Simulate real-time data fetching
      const currentTime = new Date();
      const todayStart = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());
      
      // Filter only today's data for accuracy
      const todayQueries = recentQueries.filter(query => {
        const queryTime = new Date();
        queryTime.setMinutes(queryTime.getMinutes() - parseInt(query.time.split(' ')[0]));
        return queryTime >= todayStart;
      });
      
      setStats({
        totalDocuments: 2847,
        queriesProcessed: todayQueries.length,
        approvedClaims: todayQueries.filter(q => q.status === 'approved').length,
        processingTime: '2.3s'
      });
    };
    
    fetchCurrentStats();
    const interval = setInterval(fetchCurrentStats, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  return stats;
};
export default function Dashboard() {
  const realTimeStats = useRealTimeStats();
  
  // Use real-time stats if available, fallback to static data
  const currentStats = realTimeStats || {
    totalDocuments: 2847,
    queriesProcessed: 1329,
    approvedClaims: 892,
    processingTime: '2.3s'
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your document intelligence system.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
            <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-700">System Online</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { name: 'Total Documents', value: currentStats.totalDocuments.toLocaleString('en-IN'), change: '+12%', changeType: 'increase', icon: FileText },
          { name: 'Queries Processed', value: currentStats.queriesProcessed.toLocaleString('en-IN'), change: '+18%', changeType: 'increase', icon: MessageSquare },
          { name: 'Approved Claims', value: currentStats.approvedClaims.toLocaleString('en-IN'), change: '+8%', changeType: 'increase', icon: CheckCircle },
          { name: 'Processing Time', value: currentStats.processingTime, change: '-15%', changeType: 'decrease', icon: Clock },
        ].map((stat) => (
          <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <stat.icon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className={`text-sm font-medium ${
                stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 ml-2">from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Queries */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Queries</h3>
            <p className="text-sm text-gray-600 mt-1">Latest processed insurance claims</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentQueries.map((query) => (
                <div key={query.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-1">{query.query}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>Updated: {query.time}</span>
                      {query.confidence && (
                        <span className="flex items-center space-x-1">
                          <Zap className="h-3 w-3" />
                          <span>{query.confidence}% confidence</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-semibold text-green-600">{query.amount}</span>
                    {query.status === 'approved' && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    {query.status === 'rejected' && (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )}
                    {query.status === 'processing' && (
                      <Clock className="h-5 w-5 text-yellow-500 animate-spin" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Performance */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">System Performance</h3>
            <p className="text-sm text-gray-600 mt-1">Real-time AI model accuracy and processing metrics</p>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Document Processing Accuracy</span>
                  <span className="text-sm font-semibold text-gray-900">96.8%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '96.8%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Query Understanding</span>
                  <span className="text-sm font-semibold text-gray-900">94.2%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '94.2%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Decision Confidence</span>
                  <span className="text-sm font-semibold text-gray-900">91.5%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-teal-500 h-2 rounded-full" style={{ width: '91.5%' }}></div>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-gray-700">Current Response Time</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">{currentStats.processingTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center justify-center space-x-2 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200">
            <FileText className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Upload Documents</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-4 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors duration-200">
            <MessageSquare className="h-5 w-5 text-teal-600" />
            <span className="text-sm font-medium text-teal-700">Process Query</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200">
            <Users className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">Manage Users</span>
          </button>
          <button className="flex items-center justify-center space-x-2 p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors duration-200">
            <BarChart3 className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-700">View Reports</span>
          </button>
        </div>
      </div>
    </div>
  );
}
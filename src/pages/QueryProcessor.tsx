import React, { useState } from 'react';
import { 
  Send, 
  Mic, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  Brain,
  AlertCircle,
  Copy,
  Download
} from 'lucide-react';
import { useQuery } from '../contexts/QueryContext';

export default function QueryProcessor() {
  const { processQuery, isProcessing, lastResult } = useQuery();
  const [query, setQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      await processQuery(query.trim());
      setQuery('');
    }
  };

  const sampleQueries = [
    "46-year-old male, knee surgery in Pune, 3-month-old insurance policy",
    "Dental coverage for 32F, premium policy holder",
    "Emergency room visit in Mumbai, basic coverage",
    "Pre-existing condition, heart surgery approval"
  ];

  const handleSampleQuery = (sampleQuery: string) => {
    setQuery(sampleQuery);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Query Processor</h1>
          <p className="text-gray-600 mt-1">Process natural language queries against your document database</p>
        </div>
        <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
          <Brain className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">AI-Powered Analysis</span>
        </div>
      </div>

      {/* Query Input */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
                Enter your query
              </label>
              <div className="relative">
                <textarea
                  id="query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., 46-year-old male, knee surgery in Pune, 3-month-old insurance policy"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] resize-none"
                  disabled={isProcessing}
                />
                <div className="absolute top-3 right-3 flex items-center space-x-2">
                  <button
                    type="button"
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    <Mic className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {showAdvanced ? 'Hide' : 'Show'} Advanced Options
              </button>
              <button
                type="submit"
                disabled={!query.trim() || isProcessing}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
              >
                {isProcessing ? (
                  <>
                    <Clock className="h-4 w-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Process Query</span>
                  </>
                )}
              </button>
            </div>

            {showAdvanced && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Document Filter</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                      <option>All Documents</option>
                      <option>Policy Documents</option>
                      <option>Contracts</option>
                      <option>Claims History</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confidence Threshold</label>
                    <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                      <option>High (90%+)</option>
                      <option>Medium (70%+)</option>
                      <option>Low (50%+)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Sample Queries */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sample Queries</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sampleQueries.map((sampleQuery, index) => (
              <button
                key={index}
                onClick={() => handleSampleQuery(sampleQuery)}
                className="text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors duration-200"
              >
                "{sampleQuery}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      {lastResult && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Query Result</h3>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <Copy className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Decision Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                {lastResult.decision === 'approved' ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : lastResult.decision === 'rejected' ? (
                  <XCircle className="h-6 w-6 text-red-500" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-yellow-500" />
                )}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 capitalize">
                    Claim {lastResult.decision}
                  </h4>
                  <p className="text-sm text-gray-600">Processing completed in {lastResult.processingTime}</p>
                </div>
              </div>
              
              {lastResult.amount && (
                <div className="bg-white p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Approved Amount:</span>
                    <span className="text-xl font-bold text-green-600">{lastResult.amount}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Query Analysis */}
            <div>
              <h5 className="text-sm font-semibold text-gray-900 mb-3">Query Analysis</h5>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {lastResult.extractedInfo.map((info, index) => (
                  <div key={index} className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-xs font-medium text-blue-700 uppercase tracking-wide">{info.type}</p>
                    <p className="text-sm text-blue-900 font-semibold mt-1">{info.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Justification */}
            <div>
              <h5 className="text-sm font-semibold text-gray-900 mb-3">Decision Justification</h5>
              <div className="space-y-3">
                {lastResult.justification.map((item, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                    <FileText className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{item.text}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Source: {item.source} • Confidence: {item.confidence}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Confidence Score */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h5 className="text-sm font-semibold text-gray-900">Overall Confidence</h5>
                <span className="text-sm font-semibold text-gray-900">{lastResult.confidence}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    lastResult.confidence >= 90 ? 'bg-green-500' :
                    lastResult.confidence >= 70 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${lastResult.confidence}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { Play, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface ProcessingBoxProps {
  content: string;
  onProcess?: (result: string) => void;
}

type ProcessingStatus = 'idle' | 'processing' | 'completed' | 'error';

export default function ProcessingBox({ content, onProcess }: ProcessingBoxProps) {
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [processedContent, setProcessedContent] = useState<string>('');
  const [progress, setProgress] = useState(0);

  const processContent = async () => {
    setStatus('processing');
    setProgress(0);
    
    try {
      // Simulate processing with progress updates
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Generate processed result
      const result = `PROCESSED: ${content.toUpperCase()}`;
      setProcessedContent(result);
      setStatus('completed');
      
      if (onProcess) {
        onProcess(result);
      }
    } catch (error) {
      setStatus('error');
    }
  };

  const reset = () => {
    setStatus('idle');
    setProcessedContent('');
    setProgress(0);
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Play className="h-5 w-5 text-gray-500" />;
    }
  };

  const renderTextBox = (text: string, title: string) => {
    const lines = text.split('\n');
    const maxLength = Math.max(...lines.map(line => line.length), title.length + 4);
    const boxWidth = Math.max(maxLength + 4, 40);
    
    const topBorder = '+' + '-'.repeat(boxWidth - 2) + '+';
    const bottomBorder = '+' + '-'.repeat(boxWidth - 2) + '+';
    const emptyLine = '|' + ' '.repeat(boxWidth - 2) + '|';
    
    const titleLine = '|' + ` ${title} `.padStart((boxWidth - title.length) / 2 + title.length).padEnd(boxWidth - 2) + '|';
    
    return (
      <div className="font-mono text-sm whitespace-pre-line">
        {topBorder}
        {'\n'}
        {emptyLine}
        {'\n'}
        {titleLine}
        {'\n'}
        {emptyLine}
        {'\n'}
        {lines.map((line, index) => {
          const paddedLine = '|' + ` ${line} `.padStart((boxWidth - line.length) / 2 + line.length).padEnd(boxWidth - 2) + '|';
          return paddedLine + (index < lines.length - 1 ? '\n' : '');
        }).join('')}
        {'\n'}
        {emptyLine}
        {'\n'}
        {bottomBorder}
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Text Box Processor</h3>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="text-sm font-medium text-gray-700 capitalize">{status}</span>
        </div>
      </div>

      {/* Original Content */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Original Content:</h4>
        <div className="bg-white p-4 rounded border">
          {renderTextBox(content, 'ORIGINAL')}
        </div>
      </div>

      {/* Processing Controls */}
      <div className="flex items-center space-x-4">
        <button
          onClick={processContent}
          disabled={status === 'processing'}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
        >
          <Play className="h-4 w-4" />
          <span>{status === 'processing' ? 'Processing...' : 'Process Content'}</span>
        </button>
        
        {status !== 'idle' && (
          <button
            onClick={reset}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            Reset
          </button>
        )}
      </div>

      {/* Progress Bar */}
      {status === 'processing' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Processing progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Processed Result */}
      {status === 'completed' && processedContent && (
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="text-sm font-medium text-green-800 mb-3">Processed Result:</h4>
          <div className="bg-white p-4 rounded border">
            {renderTextBox(processedContent, 'PROCESSED')}
          </div>
        </div>
      )}

      {/* Error State */}
      {status === 'error' && (
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <span className="text-sm font-medium text-red-800">Processing failed. Please try again.</span>
          </div>
        </div>
      )}
    </div>
  );
}
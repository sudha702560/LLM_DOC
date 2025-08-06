import React, { useState, useRef } from 'react';
import { Upload, X, AlertCircle, CheckCircle, File } from 'lucide-react';

interface FileUploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  acceptedTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
  className?: string;
}

interface FileWithPreview extends File {
  id: string;
  preview?: string;
  error?: string;
}

const FileUploadZone: React.FC<FileUploadZoneProps> = ({
  onFilesSelected,
  acceptedTypes = ['.pdf', '.doc', '.docx', '.txt', '.jpg', '.jpeg', '.png', '.gif'],
  maxFileSize = 10 * 1024 * 1024, // 10MB
  maxFiles = 10,
  className = ''
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize) {
      return `File size exceeds ${Math.round(maxFileSize / (1024 * 1024))}MB limit`;
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension)) {
      return `File type not supported. Accepted: ${acceptedTypes.join(', ')}`;
    }

    return null;
  };

  const processFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles: FileWithPreview[] = [];
    const invalidFiles: FileWithPreview[] = [];

    fileArray.forEach((file, index) => {
      const error = validateFile(file);
      const fileWithPreview: FileWithPreview = {
        ...file,
        id: `${Date.now()}-${index}`,
        error: error || undefined
      };

      if (error) {
        invalidFiles.push(fileWithPreview);
      } else {
        validFiles.push(fileWithPreview);
      }
    });

    // Check total file count
    const totalFiles = selectedFiles.length + validFiles.length;
    if (totalFiles > maxFiles) {
      const allowedCount = maxFiles - selectedFiles.length;
      validFiles.splice(allowedCount);
    }

    setSelectedFiles(prev => [...prev, ...validFiles, ...invalidFiles]);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (fileId: string) => {
    setSelectedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const handleUpload = () => {
    const validFiles = selectedFiles.filter(file => !file.error);
    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
      setSelectedFiles([]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validFilesCount = selectedFiles.filter(file => !file.error).length;
  const hasErrors = selectedFiles.some(file => file.error);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          dragActive 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileInput}
          accept={acceptedTypes.join(',')}
          multiple
        />
        
        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Drop files here or click to browse
        </h3>
        <p className="text-gray-600 mb-4">
          Upload up to {maxFiles} files, max {Math.round(maxFileSize / (1024 * 1024))}MB each
        </p>
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
        >
          Choose Files
        </button>
        
        <div className="mt-4 text-xs text-gray-500">
          <p><strong>Supported formats:</strong> {acceptedTypes.join(', ')}</p>
        </div>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">
            Selected Files ({selectedFiles.length})
          </h4>
          
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {selectedFiles.map((file) => (
              <div
                key={file.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${
                  file.error 
                    ? 'border-red-200 bg-red-50' 
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <File className={`h-5 w-5 flex-shrink-0 ${
                    file.error ? 'text-red-500' : 'text-gray-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      file.error ? 'text-red-900' : 'text-gray-900'
                    }`}>
                      {file.name}
                    </p>
                    <p className={`text-xs ${
                      file.error ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      {formatFileSize(file.size)}
                    </p>
                    {file.error && (
                      <p className="text-xs text-red-600 mt-1 flex items-center space-x-1">
                        <AlertCircle className="h-3 w-3" />
                        <span>{file.error}</span>
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {!file.error && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  <button
                    onClick={() => removeFile(file.id)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Upload Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              {validFilesCount > 0 && (
                <span className="text-green-600 font-medium">
                  {validFilesCount} file(s) ready to upload
                </span>
              )}
              {hasErrors && (
                <span className="text-red-600 font-medium ml-2">
                  {selectedFiles.filter(f => f.error).length} file(s) have errors
                </span>
              )}
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setSelectedFiles([])}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                Clear All
              </button>
              <button
                onClick={handleUpload}
                disabled={validFilesCount === 0}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                Upload {validFilesCount > 0 ? `(${validFilesCount})` : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadZone;
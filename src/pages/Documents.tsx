import React, { useState } from 'react';
import { 
  Upload, 
  FileText, 
  Eye, 
  Download, 
  Trash2, 
  Filter,
  Search,
  Plus,
  File,
  FileImage,
  Calendar,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Edit3,
  Tag,
  FolderPlus,
  MoreHorizontal,
  Star,
  Share2,
  Copy,
  Archive,
  RefreshCw,
  X
} from 'lucide-react';
import { useDocuments } from '../contexts/DocumentContext';

type ViewMode = 'grid' | 'list';
type SortField = 'name' | 'date' | 'size' | 'type';
type SortOrder = 'asc' | 'desc';

export default function Documents() {
  const { documents, uploadDocument, deleteDocument, updateDocument } = useDocuments();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dragActive, setDragActive] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState<string | null>(null);
  const [newDocumentName, setNewDocumentName] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);

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
      Array.from(e.dataTransfer.files).forEach(file => {
        uploadDocument(file);
      });
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach(file => {
        uploadDocument(file);
      });
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleRename = (docId: string, newName: string) => {
    updateDocument(docId, { name: newName });
    setEditingDocument(null);
    setNewDocumentName('');
  };

  const handleSelectDocument = (docId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDocuments.length === filteredDocuments.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(filteredDocuments.map(doc => doc.id));
    }
  };

  const filteredDocuments = documents
    .filter(doc => {
      const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           doc.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
      const matchesFilter = selectedFilter === 'all' || doc.type === selectedFilter;
      const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
      return matchesSearch && matchesFilter && matchesCategory;
    })
    .sort((a, b) => {
      let aValue, bValue;
      switch (sortField) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'date':
          aValue = new Date(a.uploadedAt).getTime();
          bValue = new Date(b.uploadedAt).getTime();
          break;
        case 'size':
          aValue = a.size;
          bValue = b.size;
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  // Pagination
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDocuments = filteredDocuments.slice(startIndex, startIndex + itemsPerPage);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <File className="h-8 w-8 text-red-500" />;
      case 'doc': return <FileText className="h-8 w-8 text-blue-500" />;
      case 'docx': return <FileText className="h-8 w-8 text-blue-500" />;
      case 'image': return <FileImage className="h-8 w-8 text-green-500" />;
      case 'jpg': return <FileImage className="h-8 w-8 text-green-500" />;
      case 'png': return <FileImage className="h-8 w-8 text-green-500" />;
      default: return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const categories = ['all', 'policy', 'contract', 'medical', 'legal', 'financial'];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
          <p className="text-gray-600 mt-1">Upload and manage policy documents, contracts, and other files</p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setShowUploadModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200"
          >
            <Plus className="h-4 w-4" />
            <span>Upload</span>
          </button>
          <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors duration-200">
            <FolderPlus className="h-4 w-4" />
            <span className="hidden sm:inline">New Folder</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Files</p>
              <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Storage Used</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatFileSize(documents.reduce((acc, doc) => acc + doc.size, 0))}
              </p>
            </div>
            <Archive className="h-8 w-8 text-green-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Processing</p>
              <p className="text-2xl font-bold text-gray-900">
                {documents.filter(doc => doc.status === 'processing').length}
              </p>
            </div>
            <RefreshCw className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Favorites</p>
              <p className="text-2xl font-bold text-gray-900">
                {documents.filter(doc => doc.starred).length}
              </p>
            </div>
            <Star className="h-8 w-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Upload Documents</h3>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
                  dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="file-upload-modal"
                  className="hidden"
                  onChange={handleFileInput}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                  multiple
                />
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Drop files here</h3>
                <p className="text-gray-600 mb-4">or click to browse</p>
                <label
                  htmlFor="file-upload-modal"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg cursor-pointer transition-colors duration-200 inline-block"
                >
                  Choose Files
                </label>
              </div>
              
              <p className="text-xs text-gray-500 mt-4 text-center">
                Support for PDF, DOC, DOCX, TXT, and image files up to 10MB
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents, tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Types</option>
                <option value="pdf">PDF</option>
                <option value="doc">Word</option>
                <option value="docx">Word</option>
                <option value="image">Images</option>
              </select>
            </div>
            
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
            
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Sort and Bulk Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 pt-4 border-t border-gray-200 gap-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Sort by:</span>
              {(['name', 'date', 'size', 'type'] as SortField[]).map(field => (
                <button
                  key={field}
                  onClick={() => handleSort(field)}
                  className={`flex items-center space-x-1 px-2 py-1 rounded text-sm transition-colors duration-200 ${
                    sortField === field ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span className="capitalize">{field}</span>
                  {sortField === field && (
                    sortOrder === 'asc' ? <SortAsc className="h-3 w-3" /> : <SortDesc className="h-3 w-3" />
                  )}
                </button>
              ))}
            </div>
          </div>
          
          {selectedDocuments.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">{selectedDocuments.length} selected</span>
              <button className="text-sm text-blue-600 hover:text-blue-700">Share</button>
              <button className="text-sm text-red-600 hover:text-red-700">Delete</button>
            </div>
          )}
        </div>
      </div>

      {/* Documents */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Documents ({filteredDocuments.length})
            </h3>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedDocuments.length === filteredDocuments.length && filteredDocuments.length > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Select All</span>
            </div>
          </div>
        </div>
        
        <div className="p-4 md:p-6">
          {paginatedDocuments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || selectedFilter !== 'all' || selectedCategory !== 'all' 
                  ? 'No documents match your filters' 
                  : 'No documents found'
                }
              </h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedFilter !== 'all' || selectedCategory !== 'all'
                  ? 'Try adjusting your search criteria or filters'
                  : 'Upload your first document to get started'
                }
              </p>
              {(!searchTerm && selectedFilter === 'all' && selectedCategory === 'all') && (
                <button 
                  onClick={() => setShowUploadModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200"
                >
                  Upload Document
                </button>
              )}
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {paginatedDocuments.map((doc) => (
                    <div 
                      key={doc.id} 
                      className="group border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <input
                          type="checkbox"
                          checked={selectedDocuments.includes(doc.id)}
                          onChange={() => handleSelectDocument(doc.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button 
                            onClick={() => doc.starred ? updateDocument(doc.id, { starred: false }) : updateDocument(doc.id, { starred: true })}
                            className={`p-1 rounded hover:bg-gray-100 ${doc.starred ? 'text-yellow-500' : 'text-gray-400'}`}
                          >
                            <Star className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100">
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center text-center mb-4">
                        {getFileIcon(doc.type)}
                        <div className="mt-3 w-full">
                          {editingDocument === doc.id ? (
                            <input
                              type="text"
                              value={newDocumentName}
                              onChange={(e) => setNewDocumentName(e.target.value)}
                              onBlur={() => handleRename(doc.id, newDocumentName)}
                              onKeyPress={(e) => e.key === 'Enter' && handleRename(doc.id, newDocumentName)}
                              className="w-full text-sm font-medium text-gray-900 border border-blue-500 rounded px-2 py-1"
                              autoFocus
                            />
                          ) : (
                            <h4 
                              className="text-sm font-medium text-gray-900 truncate cursor-pointer hover:text-blue-600"
                              onClick={() => {
                                setEditingDocument(doc.id);
                                setNewDocumentName(doc.name);
                              }}
                            >
                              {doc.name}
                            </h4>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {formatFileSize(doc.size)} • {doc.type.toUpperCase()}
                          </p>
                          <div className="flex items-center justify-center space-x-1 mt-2 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          doc.status === 'processed' ? 'bg-green-100 text-green-700' :
                          doc.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                          doc.status === 'error' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {doc.status === 'processing' ? (
                            <div className="flex items-center space-x-1">
                              <div className="animate-spin h-3 w-3 border border-yellow-600 border-t-transparent rounded-full"></div>
                              <span>Processing</span>
                            </div>
                          ) : (
                            doc.status
                          )}
                        </span>
                        <div className="flex items-center space-x-1">
                          <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-green-600 transition-colors duration-200">
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteDocument(doc.id);
                            }}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      
                      {doc.tags && doc.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {doc.tags.slice(0, 2).map((tag, index) => (
                            <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                              {tag}
                            </span>
                          ))}
                          {doc.tags.length > 2 && (
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                              +{doc.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedDocuments.length === filteredDocuments.length && filteredDocuments.length > 0}
                            onChange={handleSelectAll}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modified</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paginatedDocuments.map((doc) => (
                        <tr key={doc.id} className="hover:bg-gray-50 transition-colors duration-200">
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              checked={selectedDocuments.includes(doc.id)}
                              onChange={() => handleSelectDocument(doc.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center space-x-3">
                              {getFileIcon(doc.type)}
                              <div>
                                <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                                {doc.tags && doc.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {doc.tags.slice(0, 3).map((tag, index) => (
                                      <span key={index} className="px-1 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-sm text-gray-900 uppercase">{doc.type}</td>
                          <td className="px-4 py-4 text-sm text-gray-900">{formatFileSize(doc.size)}</td>
                          <td className="px-4 py-4 text-sm text-gray-900">{new Date(doc.uploadedAt).toLocaleDateString()}</td>
                          <td className="px-4 py-4">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              doc.status === 'processed' ? 'bg-green-100 text-green-700' :
                              doc.status === 'processing' ? 'bg-yellow-100 text-yellow-700' :
                              doc.status === 'error' ? 'bg-red-100 text-red-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {doc.status === 'processing' ? (
                                <div className="flex items-center space-x-1">
                                  <div className="animate-spin h-3 w-3 border border-yellow-600 border-t-transparent rounded-full"></div>
                                  <span>Processing</span>
                                </div>
                              ) : (
                                doc.status
                              )}
                            </span>
                            {doc.errorMessage && (
                              <div className="text-xs text-red-600 mt-1" title={doc.errorMessage}>
                                Click to retry
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center space-x-2">
                              <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-green-600 transition-colors duration-200">
                                <Download className="h-4 w-4" />
                              </button>
                              <button className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200">
                                <Share2 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => deleteDocument(doc.id)}
                                className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredDocuments.length)} of {filteredDocuments.length} documents
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 text-sm border rounded-md ${
                            currentPage === page
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
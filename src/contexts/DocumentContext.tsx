import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useToast } from './ToastContext';

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  status: 'processing' | 'processed' | 'error';
  category?: string;
  tags?: string[];
  starred?: boolean;
  version?: number;
  url?: string;
  processedAt?: string;
  errorMessage?: string;
  processingProgress?: number;
  fileData?: string; // Base64 encoded file data for storage
  checksum?: string; // File integrity check
}

interface DocumentStats {
  totalFiles: number;
  totalSize: number;
  processingFiles: number;
  processedFiles: number;
  errorFiles: number;
  starredFiles: number;
  categoryCounts: Record<string, number>;
  typeCounts: Record<string, number>;
}

interface DocumentContextType {
  documents: Document[];
  stats: DocumentStats;
  uploadDocument: (file: File) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  bulkDeleteDocuments: (ids: string[]) => Promise<void>;
  cleanupRedundantData: () => Promise<void>;
  retryProcessing: (id: string) => Promise<void>;
  validateFile: (file: File) => { isValid: boolean; error?: string };
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
};

interface DocumentProviderProps {
  children: ReactNode;
}

// File validation configuration
const FILE_VALIDATION = {
  maxSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif'
  ],
  allowedExtensions: ['pdf', 'doc', 'docx', 'txt', 'jpg', 'jpeg', 'png', 'gif']
};

// Sample documents with proper data structure
const sampleDocuments: Document[] = [
  {
    id: '1',
    name: 'Health Insurance Policy v2.1.pdf',
    type: 'pdf',
    size: 2456789,
    uploadedAt: '2024-01-15T10:30:00Z',
    status: 'processed',
    category: 'policy',
    tags: ['insurance', 'health', 'policy'],
    starred: true,
    version: 2,
    processedAt: '2024-01-15T10:32:15Z',
    checksum: 'sha256-abc123def456'
  },
  {
    id: '2',
    name: 'Dental Coverage Guidelines.docx',
    type: 'docx',
    size: 1234567,
    uploadedAt: '2024-01-14T15:20:00Z',
    status: 'processed',
    category: 'policy',
    tags: ['dental', 'coverage', 'guidelines'],
    starred: false,
    version: 1,
    processedAt: '2024-01-14T15:22:30Z',
    checksum: 'sha256-def456ghi789'
  },
  {
    id: '3',
    name: 'Pre-existing Conditions List.pdf',
    type: 'pdf',
    size: 987654,
    uploadedAt: '2024-01-13T09:15:00Z',
    status: 'processed',
    category: 'medical',
    tags: ['medical', 'conditions', 'exclusions'],
    starred: false,
    version: 1,
    processedAt: '2024-01-13T09:17:45Z',
    checksum: 'sha256-ghi789jkl012'
  }
];

export const DocumentProvider: React.FC<DocumentProviderProps> = ({ children }) => {
  const [documents, setDocuments] = useState<Document[]>(sampleDocuments);
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  // Calculate comprehensive statistics
  const calculateStats = (docs: Document[]): DocumentStats => {
    const stats: DocumentStats = {
      totalFiles: docs.length,
      totalSize: docs.reduce((acc, doc) => acc + doc.size, 0),
      processingFiles: docs.filter(doc => doc.status === 'processing').length,
      processedFiles: docs.filter(doc => doc.status === 'processed').length,
      errorFiles: docs.filter(doc => doc.status === 'error').length,
      starredFiles: docs.filter(doc => doc.starred).length,
      categoryCounts: {},
      typeCounts: {}
    };

    // Count by category
    docs.forEach(doc => {
      if (doc.category) {
        stats.categoryCounts[doc.category] = (stats.categoryCounts[doc.category] || 0) + 1;
      }
      stats.typeCounts[doc.type] = (stats.typeCounts[doc.type] || 0) + 1;
    });

    return stats;
  };

  const stats = calculateStats(documents);

  // File validation function
  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    // Check file size
    if (file.size > FILE_VALIDATION.maxSize) {
      return {
        isValid: false,
        error: `File size exceeds maximum limit of ${FILE_VALIDATION.maxSize / (1024 * 1024)}MB`
      };
    }

    // Check file type
    if (!FILE_VALIDATION.allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File type '${file.type}' is not supported`
      };
    }

    // Check file extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !FILE_VALIDATION.allowedExtensions.includes(extension)) {
      return {
        isValid: false,
        error: `File extension '.${extension}' is not supported`
      };
    }

    // Check for duplicate names
    const existingDoc = documents.find(doc => doc.name === file.name);
    if (existingDoc) {
      return {
        isValid: false,
        error: `A file with the name '${file.name}' already exists`
      };
    }

    return { isValid: true };
  };

  // Generate file checksum for integrity
  const generateChecksum = async (file: File): Promise<string> => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return `sha256-${hashHex}`;
  };

  // Convert file to base64 for storage
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Upload document with proper storage
  const uploadDocument = async (file: File): Promise<void> => {
    try {
      // Validate file
      const validation = validateFile(file);
      if (!validation.isValid) {
        showError('Upload Failed', validation.error!);
        return;
      }

      // Generate checksum and convert to base64
      const [checksum, fileData] = await Promise.all([
        generateChecksum(file),
        fileToBase64(file)
      ]);

      const newDocument: Document = {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.name.split('.').pop()?.toLowerCase() || 'unknown',
        size: file.size,
        uploadedAt: new Date().toISOString(),
        status: 'processing',
        category: 'policy', // Default category
        tags: [],
        starred: false,
        version: 1,
        fileData,
        checksum
      };

      // Add document to state
      setDocuments(prev => [newDocument, ...prev]);
      
      showSuccess(
        'Upload Started',
        `${file.name} is being uploaded and processed...`
      );

      // Simulate file storage and processing
      await processDocument(newDocument.id);

    } catch (error) {
      console.error('Upload error:', error);
      showError('Upload Failed', 'An error occurred while uploading the file');
    }
  };

  // Process document after upload
  const processDocument = async (docId: string): Promise<void> => {
    try {
      // Simulate processing time
      const processingTime = Math.random() * 3000 + 2000;
      await new Promise(resolve => setTimeout(resolve, processingTime));
      
      // Update document status
      setDocuments(prev => 
        prev.map(doc => 
          doc.id === docId 
            ? { 
                ...doc, 
                status: 'processed' as const,
                processedAt: new Date().toISOString()
              }
            : doc
        )
      );
      
      const document = documents.find(doc => doc.id === docId);
      if (document) {
        showSuccess(
          'Processing Complete',
          `${document.name} has been successfully processed and stored`
        );
      }
      
    } catch (error) {
      console.error('Processing error:', error);
      setDocuments(prev => 
        prev.map(doc => 
          doc.id === docId 
            ? { 
                ...doc, 
                status: 'error' as const,
                errorMessage: 'Processing failed - file may be corrupted'
              }
            : doc
        )
      );
      
      const document = documents.find(doc => doc.id === docId);
      if (document) {
        showError(
          'Processing Failed',
          `${document.name} could not be processed. Please try again.`
        );
      }
    }
  };

  // Delete single document with user confirmation
  const deleteDocument = async (id: string): Promise<void> => {
    try {
      const document = documents.find(doc => doc.id === id);
      if (!document) {
        showError('Delete Failed', 'Document not found');
        return;
      }

      // Remove from state (simulating storage deletion)
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      
      showSuccess(
        'Document Deleted',
        `${document.name} has been permanently removed`
      );
      
    } catch (error) {
      console.error('Delete error:', error);
      showError('Delete Failed', 'An error occurred while deleting the document');
    }
  };

  // Bulk delete documents
  const bulkDeleteDocuments = async (ids: string[]): Promise<void> => {
    try {
      const documentsToDelete = documents.filter(doc => ids.includes(doc.id));
      
      if (documentsToDelete.length === 0) {
        showWarning('No Documents', 'No documents selected for deletion');
        return;
      }

      // Remove from state
      setDocuments(prev => prev.filter(doc => !ids.includes(doc.id)));
      
      showSuccess(
        'Bulk Delete Complete',
        `${documentsToDelete.length} document(s) have been deleted`
      );
      
    } catch (error) {
      console.error('Bulk delete error:', error);
      showError('Bulk Delete Failed', 'An error occurred during bulk deletion');
    }
  };

  // Update document
  const updateDocument = (id: string, updates: Partial<Document>) => {
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === id ? { ...doc, ...updates } : doc
      )
    );
  };

  // Retry processing for failed documents
  const retryProcessing = async (id: string): Promise<void> => {
    const document = documents.find(doc => doc.id === id);
    if (!document) {
      showError('Retry Failed', 'Document not found');
      return;
    }

    // Reset status to processing
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === id 
          ? { 
              ...doc, 
              status: 'processing' as const,
              errorMessage: undefined
            }
          : doc
      )
    );

    showInfo('Retry Started', `Retrying processing for ${document.name}`);
    
    // Restart processing
    await processDocument(id);
  };

  // Clean up redundant data
  const cleanupRedundantData = async (): Promise<void> => {
    try {
      let cleanupCount = 0;
      const updatedDocuments = [...documents];

      // Remove duplicate files (same name and size)
      const duplicates = new Map<string, Document[]>();
      documents.forEach(doc => {
        const key = `${doc.name}-${doc.size}`;
        if (!duplicates.has(key)) {
          duplicates.set(key, []);
        }
        duplicates.get(key)!.push(doc);
      });

      // Keep only the latest version of duplicates
      duplicates.forEach((docs, key) => {
        if (docs.length > 1) {
          // Sort by upload date, keep the latest
          docs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
          const toRemove = docs.slice(1); // Remove all but the first (latest)
          
          toRemove.forEach(doc => {
            const index = updatedDocuments.findIndex(d => d.id === doc.id);
            if (index > -1) {
              updatedDocuments.splice(index, 1);
              cleanupCount++;
            }
          });
        }
      });

      // Remove documents with processing errors older than 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const errorDocsToRemove = updatedDocuments.filter(doc => 
        doc.status === 'error' && 
        new Date(doc.uploadedAt) < sevenDaysAgo
      );

      errorDocsToRemove.forEach(doc => {
        const index = updatedDocuments.findIndex(d => d.id === doc.id);
        if (index > -1) {
          updatedDocuments.splice(index, 1);
          cleanupCount++;
        }
      });

      // Update state
      setDocuments(updatedDocuments);

      if (cleanupCount > 0) {
        showSuccess(
          'Cleanup Complete',
          `Removed ${cleanupCount} redundant document(s) and freed up storage space`
        );
      } else {
        showInfo('Cleanup Complete', 'No redundant data found to clean up');
      }

    } catch (error) {
      console.error('Cleanup error:', error);
      showError('Cleanup Failed', 'An error occurred during data cleanup');
    }
  };

  return (
    <DocumentContext.Provider value={{
      documents,
      stats,
      uploadDocument,
      deleteDocument,
      updateDocument,
      bulkDeleteDocuments,
      cleanupRedundantData,
      retryProcessing,
      validateFile
    }}>
      {children}
    </DocumentContext.Provider>
  );
};
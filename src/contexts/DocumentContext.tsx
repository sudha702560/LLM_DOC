import React, { createContext, useContext, useState, ReactNode } from 'react';

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
}

interface DocumentContextType {
  documents: Document[];
  uploadDocument: (file: File) => void;
  deleteDocument: (id: string) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
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

// Sample documents
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
    version: 2
  },
  {
    id: '2',
    name: 'Dental Coverage Guidelines.docx',
    type: 'doc',
    size: 1234567,
    uploadedAt: '2024-01-14T15:20:00Z',
    status: 'processed',
    category: 'policy',
    tags: ['dental', 'coverage', 'guidelines'],
    starred: false,
    version: 1
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
    version: 1
  },
  {
    id: '4',
    name: 'Geographic Coverage Map.jpg',
    type: 'jpg',
    size: 3456789,
    uploadedAt: '2024-01-12T14:30:00Z',
    status: 'processed',
    category: 'policy',
    tags: ['coverage', 'geographic', 'map'],
    starred: true,
    version: 1
  },
  {
    id: '5',
    name: 'Claims Processing Workflow.pdf',
    type: 'pdf',
    size: 1876543,
    uploadedAt: '2024-01-11T11:45:00Z',
    status: 'processing',
    category: 'legal',
    tags: ['claims', 'workflow', 'process'],
    starred: false,
    version: 1
  },
  {
    id: '6',
    name: 'Financial Report Q4.pdf',
    type: 'pdf',
    size: 2234567,
    uploadedAt: '2024-01-10T08:30:00Z',
    status: 'processed',
    category: 'financial',
    tags: ['financial', 'report', 'quarterly'],
    starred: false,
    version: 1
  },
  {
    id: '7',
    name: 'Contract Template.docx',
    type: 'docx',
    size: 876543,
    uploadedAt: '2024-01-09T16:20:00Z',
    status: 'processed',
    category: 'contract',
    tags: ['contract', 'template', 'legal'],
    starred: true,
    version: 3
  }
];

export const DocumentProvider: React.FC<DocumentProviderProps> = ({ children }) => {
  const [documents, setDocuments] = useState<Document[]>(sampleDocuments);

  const uploadDocument = (file: File) => {
    const newDocument: Document = {
      id: Date.now().toString(),
      name: file.name,
      type: file.name.split('.').pop()?.toLowerCase() || 'unknown',
      size: file.size,
      uploadedAt: new Date().toISOString(),
      status: 'processing',
      category: 'policy', // Default category
      tags: [],
      starred: false,
      version: 1
    };

    setDocuments(prev => [newDocument, ...prev]);

    // Enhanced processing simulation with better status tracking
    const processDocument = async (docId: string) => {
      try {
        // Simulate initial processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update to processing with progress indication
        setDocuments(prev => 
          prev.map(doc => 
            doc.id === docId 
              ? { ...doc, status: 'processing' as const }
              : doc
          )
        );
        
        // Simulate actual processing time (2-5 seconds)
        const processingTime = Math.random() * 3000 + 2000;
        await new Promise(resolve => setTimeout(resolve, processingTime));
        
        // Randomly simulate success or error (90% success rate)
        const success = true;
        
        setDocuments(prev => 
          prev.map(doc => 
            doc.id === docId 
              ? { 
                  ...doc, 
                  status: success ? 'processed' as const : 'error' as const,
                  // Add processing metadata
                  processedAt: success ? new Date().toISOString() : undefined,
                  errorMessage: success ? undefined : 'Processing failed - please try again'
                }
              : doc
          )
        );
        
        // Show notification
        if (success) {
          console.log(`Document ${file.name} processed successfully`);
        } else {
          console.error(`Document ${file.name} processing failed`);
        }
        
      } catch (error) {
        console.error('Processing error:', error);
        setDocuments(prev => 
          prev.map(doc => 
            doc.id === docId 
              ? { ...doc, status: 'error' as const, errorMessage: 'Processing failed' }
              : doc
          )
        );
      }
    };
    
    // Start processing
    processDocument(newDocument.id);
  };

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const updateDocument = (id: string, updates: Partial<Document>) => {
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === id ? { ...doc, ...updates } : doc
      )
    );
  };

  return (
    <DocumentContext.Provider value={{
      documents,
      uploadDocument,
      deleteDocument,
      updateDocument
    }}>
      {children}
    </DocumentContext.Provider>
  );
};
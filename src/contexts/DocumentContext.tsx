import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  status: 'processing' | 'processed' | 'error';
  url?: string;
}

interface DocumentContextType {
  documents: Document[];
  uploadDocument: (file: File) => void;
  deleteDocument: (id: string) => void;
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
    status: 'processed'
  },
  {
    id: '2',
    name: 'Dental Coverage Guidelines.docx',
    type: 'doc',
    size: 1234567,
    uploadedAt: '2024-01-14T15:20:00Z',
    status: 'processed'
  },
  {
    id: '3',
    name: 'Pre-existing Conditions List.pdf',
    type: 'pdf',
    size: 987654,
    uploadedAt: '2024-01-13T09:15:00Z',
    status: 'processed'
  },
  {
    id: '4',
    name: 'Geographic Coverage Map.jpg',
    type: 'image',
    size: 3456789,
    uploadedAt: '2024-01-12T14:30:00Z',
    status: 'processed'
  },
  {
    id: '5',
    name: 'Claims Processing Workflow.pdf',
    type: 'pdf',
    size: 1876543,
    uploadedAt: '2024-01-11T11:45:00Z',
    status: 'processing'
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
      status: 'processing'
    };

    setDocuments(prev => [newDocument, ...prev]);

    // Simulate processing
    setTimeout(() => {
      setDocuments(prev => 
        prev.map(doc => 
          doc.id === newDocument.id 
            ? { ...doc, status: 'processed' as const }
            : doc
        )
      );
    }, 3000);
  };

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  return (
    <DocumentContext.Provider value={{
      documents,
      uploadDocument,
      deleteDocument
    }}>
      {children}
    </DocumentContext.Provider>
  );
};
import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface QueryResult {
  id: string;
  query: string;
  decision: 'approved' | 'rejected' | 'pending';
  amount?: string;
  confidence: number;
  processingTime: string;
  timestamp: string;
  extractedInfo: Array<{
    type: string;
    value: string;
  }>;
  justification: Array<{
    text: string;
    source: string;
    confidence: number;
  }>;
}

interface QueryContextType {
  processQuery: (query: string) => Promise<void>;
  isProcessing: boolean;
  lastResult: QueryResult | null;
  queryHistory: QueryResult[];
}

const QueryContext = createContext<QueryContextType | undefined>(undefined);

export const useQuery = () => {
  const context = useContext(QueryContext);
  if (!context) {
    throw new Error('useQuery must be used within a QueryProvider');
  }
  return context;
};

interface QueryProviderProps {
  children: ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState<QueryResult | null>(null);
  const [queryHistory, setQueryHistory] = useState<QueryResult[]>([]);

  const simulateQueryProcessing = (query: string): QueryResult => {
    // Simulate AI processing with realistic results
    const lowerQuery = query.toLowerCase();
    
    // Extract information from query
    const extractedInfo = [];
    
    // Age extraction
    const ageMatch = query.match(/(\d+)[-\s]?(year|y|yr)/i);
    if (ageMatch) {
      extractedInfo.push({ type: 'Age', value: `${ageMatch[1]} years` });
    }
    
    // Gender extraction
    if (lowerQuery.includes('male') || lowerQuery.includes('m,') || lowerQuery.includes('m ')) {
      extractedInfo.push({ type: 'Gender', value: 'Male' });
    } else if (lowerQuery.includes('female') || lowerQuery.includes('f,') || lowerQuery.includes('f ')) {
      extractedInfo.push({ type: 'Gender', value: 'Female' });
    }
    
    // Procedure extraction
    if (lowerQuery.includes('knee surgery')) {
      extractedInfo.push({ type: 'Procedure', value: 'Knee Surgery' });
    } else if (lowerQuery.includes('dental')) {
      extractedInfo.push({ type: 'Procedure', value: 'Dental Treatment' });
    } else if (lowerQuery.includes('heart surgery')) {
      extractedInfo.push({ type: 'Procedure', value: 'Heart Surgery' });
    } else if (lowerQuery.includes('emergency')) {
      extractedInfo.push({ type: 'Procedure', value: 'Emergency Care' });
    }
    
    // Location extraction
    if (lowerQuery.includes('pune')) {
      extractedInfo.push({ type: 'Location', value: 'Pune, India' });
    } else if (lowerQuery.includes('mumbai')) {
      extractedInfo.push({ type: 'Location', value: 'Mumbai, India' });
    }
    
    // Policy duration
    const policyMatch = query.match(/(\d+)[-\s]?month/i);
    if (policyMatch) {
      extractedInfo.push({ type: 'Policy Age', value: `${policyMatch[1]} months` });
    }

    // Determine decision based on query content
    let decision: 'approved' | 'rejected' | 'pending' = 'approved';
    let amount = '';
    let confidence = 85;
    
    if (lowerQuery.includes('pre-existing') || lowerQuery.includes('heart surgery')) {
      decision = 'rejected';
      confidence = 96;
      amount = '$0';
    } else if (lowerQuery.includes('knee surgery')) {
      decision = 'approved';
      confidence = 94;
      amount = '$12,500';
    } else if (lowerQuery.includes('dental')) {
      decision = 'approved';
      confidence = 89;
      amount = '$2,800';
    } else if (lowerQuery.includes('emergency')) {
      decision = 'approved';
      confidence = 92;
      amount = '$8,750';
    } else {
      confidence = Math.floor(Math.random() * 20) + 75; // 75-95%
      amount = `$${Math.floor(Math.random() * 10000) + 1000}`;
    }

    const justification = [
      {
        text: decision === 'approved' 
          ? "Patient meets eligibility criteria for the requested procedure under the current policy terms."
          : "Pre-existing conditions are excluded from coverage under Section 4.2 of the policy agreement.",
        source: "Policy Document v2.1 - Section 4.2",
        confidence: confidence
      },
      {
        text: decision === 'approved'
          ? "Geographic coverage includes the specified treatment location and approved medical facilities."
          : "Waiting period requirements not met for high-risk procedures.",
        source: "Coverage Guidelines - Geographic Restrictions",
        confidence: confidence - 5
      }
    ];

    return {
      id: Date.now().toString(),
      query,
      decision,
      amount,
      confidence,
      processingTime: `${(Math.random() * 3 + 1).toFixed(1)}s`,
      timestamp: new Date().toISOString(),
      extractedInfo,
      justification
    };
  };

  const processQuery = async (query: string) => {
    setIsProcessing(true);
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
    
    const result = simulateQueryProcessing(query);
    setLastResult(result);
    setQueryHistory(prev => [result, ...prev]);
    setIsProcessing(false);
  };

  return (
    <QueryContext.Provider value={{
      processQuery,
      isProcessing,
      lastResult,
      queryHistory
    }}>
      {children}
    </QueryContext.Provider>
  );
};
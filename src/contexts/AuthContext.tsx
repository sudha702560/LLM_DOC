import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'analyst' | 'viewer';
  avatar?: string;
  lastLogin?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Demo users for authentication
const demoUsers: Record<string, { password: string; user: User }> = {
  'admin@docintel.com': {
    password: 'admin123',
    user: {
      id: '1',
      email: 'admin@docintel.com',
      name: 'John Doe',
      role: 'admin',
      lastLogin: new Date().toISOString()
    }
  },
  'analyst@docintel.com': {
    password: 'analyst123',
    user: {
      id: '2',
      email: 'analyst@docintel.com',
      name: 'Sarah Wilson',
      role: 'analyst',
      lastLogin: new Date().toISOString()
    }
  },
  'viewer@docintel.com': {
    password: 'viewer123',
    user: {
      id: '3',
      email: 'viewer@docintel.com',
      name: 'Mike Johnson',
      role: 'viewer',
      lastLogin: new Date().toISOString()
    }
  }
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Check for stored authentication on mount
  useEffect(() => {
    const checkStoredAuth = () => {
      try {
        const storedUser = localStorage.getItem('docintel_user');
        const rememberMe = localStorage.getItem('docintel_remember');
        
        if (storedUser && rememberMe === 'true') {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error checking stored auth:', error);
        localStorage.removeItem('docintel_user');
        localStorage.removeItem('docintel_remember');
      } finally {
        setIsInitializing(false);
      }
    };

    checkStoredAuth();
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const userRecord = demoUsers[email.toLowerCase()];
      
      if (!userRecord || userRecord.password !== password) {
        throw new Error('Invalid credentials');
      }
      
      const authenticatedUser = {
        ...userRecord.user,
        lastLogin: new Date().toISOString()
      };
      
      setUser(authenticatedUser);
      
      // Store authentication if remember me is checked
      if (rememberMe) {
        localStorage.setItem('docintel_user', JSON.stringify(authenticatedUser));
        localStorage.setItem('docintel_remember', 'true');
      } else {
        localStorage.removeItem('docintel_user');
        localStorage.removeItem('docintel_remember');
      }
      
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('docintel_user');
    localStorage.removeItem('docintel_remember');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      
      // Update stored user if remember me is enabled
      const rememberMe = localStorage.getItem('docintel_remember');
      if (rememberMe === 'true') {
        localStorage.setItem('docintel_user', JSON.stringify(updatedUser));
      }
    }
  };

  // Show loading spinner during initialization
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};
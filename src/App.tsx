import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import QueryProcessor from './pages/QueryProcessor';
import History from './pages/History';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import { QueryProvider } from './contexts/QueryContext';
import { DocumentProvider } from './contexts/DocumentContext';
import { ToastProvider } from './contexts/ToastContext';
import ToastContainer from './components/ToastContainer';
import { useToast } from './contexts/ToastContext';

function AppContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toasts, removeToast } = useToast();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <ProtectedRoute>
            <div className="flex h-screen bg-gray-50">
              <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
              
              <div className="flex-1 flex flex-col overflow-hidden">
                <Header onMenuClick={() => setSidebarOpen(true)} />
                
                <main className="flex-1 overflow-auto">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/documents" element={<Documents />} />
                    <Route path="/query" element={<QueryProcessor />} />
                    <Route path="/history" element={<History />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/settings" element={<Settings />} />
                  </Routes>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } />
      </Routes>
      
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </Router>
  );
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <QueryProvider>
          <DocumentProvider>
            <AppContent />
          </DocumentProvider>
        </QueryProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
        </div>
      </div>
      
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </Router>
  );
}

function App() {
  return (
    <ToastProvider>
      <QueryProvider>
        <DocumentProvider>
          <AppContent />
        </DocumentProvider>
      </QueryProvider>
    </ToastProvider>
  );
}

export default App;
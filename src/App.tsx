import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { QueryProvider } from './contexts/QueryContext';
import { DocumentProvider } from './contexts/DocumentContext';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ToastContainer from './components/ToastContainer';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import QueryProcessor from './pages/QueryProcessor';
import Documents from './pages/Documents';
import Analytics from './pages/Analytics';
import History from './pages/History';
import Settings from './pages/Settings';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <QueryProvider>
          <DocumentProvider>
            <Router>
              <div className="min-h-screen bg-gray-50">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/*" element={
                    <ProtectedRoute>
                      <div className="flex h-screen">
                        <Sidebar />
                        <div className="flex-1 flex flex-col overflow-hidden">
                          <Header />
                          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
                            <Routes>
                              <Route path="/" element={<Navigate to="/dashboard" replace />} />
                              <Route path="/dashboard" element={<Dashboard />} />
                              <Route path="/query" element={<QueryProcessor />} />
                              <Route path="/documents" element={<Documents />} />
                              <Route path="/analytics" element={<Analytics />} />
                              <Route path="/history" element={<History />} />
                              <Route path="/settings" element={<Settings />} />
                            </Routes>
                          </main>
                        </div>
                      </div>
                    </ProtectedRoute>
                  } />
                </Routes>
                <ToastContainer />
              </div>
            </Router>
          </DocumentProvider>
        </QueryProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import DriverDashboard from './components/DriverDashboard'
import OwnerDashboard from './components/OwnerDashboard'
import NotificationCenter from './components/NotificationCenter'
import FirebaseTest from './components/FirebaseTest'
import FirebaseConnectionTest from './components/FirebaseConnectionTest'
import QuickDataSetup from './components/QuickDataSetup'
import DatabaseSetup from './components/DatabaseSetup'
import FirebaseDebug from './components/FirebaseDebug'
import InvoiceGenerator from './components/InvoiceGenerator'
import InvoicePreview from './components/InvoicePreview'
import InvoiceTableTest from './components/InvoiceTableTest'
import FirebaseTableTest from './components/FirebaseTableTest'
import FirebaseAuthenticatedTest from './components/FirebaseAuthenticatedTest'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { LanguageProvider } from './contexts/LanguageContext'
import { NotificationProvider } from './contexts/NotificationContext'

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={user ? <Navigate to={user.role === 'driver' ? '/driver' : '/owner'} /> : <Login />} 
      />
      <Route 
        path="/driver" 
        element={user?.role === 'driver' ? <DriverDashboard /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/owner" 
        element={user?.role === 'owner' ? <OwnerDashboard /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/firebase-test" 
        element={<FirebaseTest />} 
      />
      <Route 
        path="/firebase-connection" 
        element={<FirebaseConnectionTest />} 
      />
      <Route 
        path="/data-setup" 
        element={<QuickDataSetup />} 
      />
      <Route 
        path="/database-setup" 
        element={<DatabaseSetup />} 
      />
      <Route 
        path="/firebase-debug" 
        element={<FirebaseDebug />} 
      />
      <Route 
        path="/invoice-generator" 
        element={<InvoiceGenerator />} 
      />
      <Route 
        path="/invoice-preview" 
        element={<InvoicePreview />} 
      />
      <Route 
        path="/invoice-table-test" 
        element={<InvoiceTableTest />} 
      />
      <Route 
        path="/firebase-table-test" 
        element={<FirebaseTableTest />} 
      />
      <Route 
        path="/firebase-auth-test" 
        element={<FirebaseAuthenticatedTest />} 
      />
      <Route path="/" element={<Navigate to="/login" />} />
    </Routes>
  )
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <NotificationProvider>
          <div className="min-h-screen bg-gray-50">
            <AppRoutes />
            <NotificationCenter />
          </div>
        </NotificationProvider>
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App

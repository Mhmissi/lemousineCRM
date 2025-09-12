import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/Login'
import DriverDashboard from './components/DriverDashboard'
import OwnerDashboard from './components/OwnerDashboard'
import NotificationCenter from './components/NotificationCenter'
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

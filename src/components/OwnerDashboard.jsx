import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { 
  Home, 
  Users, 
  Car, 
  MapPin, 
  BarChart3, 
  Settings,
  Plus, 
  Menu, 
  X,
  LogOut,
  Bell
} from 'lucide-react'
import NotificationBell from './NotificationBell'
import Dashboard from './owner/Dashboard'
import Drivers from './owner/Drivers'
import Vehicles from './owner/Vehicles'
import Trips from './owner/Trips'
import Reports from './owner/Reports'
import SettingsPage from './owner/Settings'

function OwnerDashboard() {
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const tabs = [
    { id: 'dashboard', label: t('dashboard'), icon: Home },
    { id: 'drivers', label: t('drivers'), icon: Users },
    { id: 'vehicles', label: t('vehicles'), icon: Car },
    { id: 'trips', label: t('trips'), icon: MapPin },
    { id: 'reports', label: t('reports'), icon: BarChart3 },
    { id: 'settings', label: t('settings'), icon: Settings },
  ]

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={setActiveTab} />
      case 'drivers':
        return <Drivers />
      case 'vehicles':
        return <Vehicles />
      case 'trips':
        return <Trips />
      case 'reports':
        return <Reports />
      case 'settings':
        return <SettingsPage />
      default:
        return <Dashboard onNavigate={setActiveTab} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-brand-dark border-r border-brand-gold pt-5 pb-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4 mb-8">
            <div className="w-8 h-8 mr-3">
              <img 
                src="/logo.png" 
                alt="Limostar Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-xl font-bold text-white">Limostar</h1>
          </div>

          {/* Navigation */}
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === tab.id
                      ? 'bg-brand-gold text-brand-dark'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className="mr-3 flex-shrink-0 h-5 w-5" />
                  {tab.label}
                </button>
              )
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="flex-shrink-0 flex border-t border-brand-gold p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-brand-gold rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-brand-dark">
                  {user.name.charAt(0)}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-brand-gold">Owner</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="ml-auto p-1 text-gray-400 hover:text-brand-gold"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between bg-brand-dark px-4 py-4 border-b border-brand-gold">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-white hover:text-brand-gold"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-white">Limostar</h1>
          <div className="flex items-center space-x-2">
            <NotificationBell />
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-brand-dark">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                onClick={() => setSidebarOpen(false)}
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            
            {/* Mobile Navigation */}
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              <div className="flex-shrink-0 flex items-center px-4 mb-8">
                <div className="w-8 h-8 mr-3">
                  <img 
                    src="/logo.png" 
                    alt="Limostar Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <h1 className="text-xl font-bold text-white">Limostar</h1>
              </div>
              <nav className="mt-5 px-2 space-y-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id)
                        setSidebarOpen(false)
                      }}
                      className={`w-full group flex items-center px-2 py-2 text-base font-medium rounded-md transition-colors ${
                        activeTab === tab.id
                          ? 'bg-brand-gold text-brand-dark'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <Icon className="mr-4 flex-shrink-0 h-6 w-6" />
                      {tab.label}
                    </button>
                  )
                })}
              </nav>
            </div>

            {/* Mobile User Info */}
            <div className="flex-shrink-0 flex border-t border-brand-gold p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-brand-gold rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-brand-dark">
                    {user.name.charAt(0)}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-base font-medium text-white">{user.name}</p>
                  <p className="text-sm text-brand-gold">Owner</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="ml-auto p-1 text-gray-400 hover:text-brand-gold"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Quick Create Trip Button */}
        <div className="lg:hidden fixed bottom-4 right-4 z-30">
          <button 
            onClick={() => alert('Quick Create Trip - This would open a trip creation form')}
            className="bg-brand-gold hover:bg-yellow-600 text-brand-dark p-4 rounded-full shadow-lg transition-colors"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>

        {/* Content Area */}
        <main className="flex-1">
          {renderContent()}
        </main>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-brand-dark border-t border-brand-gold px-2 py-2">
        <div className="flex justify-around">
          {tabs.slice(0, 5).map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-2 px-1 text-xs font-medium ${
                  activeTab === tab.id
                    ? 'text-brand-gold'
                    : 'text-gray-400'
                }`}
              >
                <Icon className="w-4 h-4 mb-1" />
                {tab.label}
              </button>
            )
          })}
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex flex-col items-center py-2 px-1 text-xs font-medium ${
              activeTab === 'reports'
                ? 'text-brand-gold'
                : 'text-gray-400'
            }`}
          >
            <BarChart3 className="w-4 h-4 mb-1" />
            Reports
          </button>
        </div>
      </div>
    </div>
  )
}

export default OwnerDashboard

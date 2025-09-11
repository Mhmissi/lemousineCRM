import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  Home, 
  Users, 
  Car, 
  MapPin, 
  BarChart3, 
  Plus, 
  Menu, 
  X,
  LogOut,
  Bell
} from 'lucide-react'
import Dashboard from './owner/Dashboard'
import Drivers from './owner/Drivers'
import Vehicles from './owner/Vehicles'
import Trips from './owner/Trips'
import Reports from './owner/Reports'

function OwnerDashboard() {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'drivers', label: 'Drivers', icon: Users },
    { id: 'vehicles', label: 'Vehicles', icon: Car },
    { id: 'trips', label: 'Trips', icon: MapPin },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
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
      default:
        return <Dashboard onNavigate={setActiveTab} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4 mb-8">
            <div className="w-8 h-8 mr-3">
              <img 
                src="/logo.png" 
                alt="Lemousine CRM Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Lemousine CRM</h1>
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
                      ? 'bg-primary-100 text-primary-900'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 flex-shrink-0 h-5 w-5" />
                  {tab.label}
                </button>
              )
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user.name.charAt(0)}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700">{user.name}</p>
                <p className="text-xs text-gray-500">Owner</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="ml-auto p-1 text-gray-400 hover:text-gray-600"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between bg-white px-4 py-4 border-b border-gray-200">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Lemousine CRM</h1>
          <div className="flex items-center space-x-2">
            <button className="p-2 text-gray-600 hover:text-gray-900">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
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
                    alt="Lemousine CRM Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <h1 className="text-xl font-bold text-gray-900">Lemousine CRM</h1>
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
                          ? 'bg-primary-100 text-primary-900'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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
            <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user.name.charAt(0)}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-base font-medium text-gray-700">{user.name}</p>
                  <p className="text-sm text-gray-500">Owner</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="ml-auto p-1 text-gray-400 hover:text-gray-600"
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
            className="bg-primary-600 hover:bg-primary-700 text-white p-4 rounded-full shadow-lg transition-colors"
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
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around">
          {tabs.slice(0, 4).map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center py-2 px-3 text-xs font-medium ${
                  activeTab === tab.id
                    ? 'text-primary-600'
                    : 'text-gray-500'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                {tab.label}
              </button>
            )
          })}
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex flex-col items-center py-2 px-3 text-xs font-medium ${
              activeTab === 'reports'
                ? 'text-primary-600'
                : 'text-gray-500'
            }`}
          >
            <BarChart3 className="w-5 h-5 mb-1" />
            More
          </button>
        </div>
      </div>
    </div>
  )
}

export default OwnerDashboard

import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { Car, Clock, MapPin, LogOut, Bell, Home, DollarSign, User, Settings, Navigation, Phone, Mail, Calendar } from 'lucide-react'
import DriverCalendar from './DriverCalendar'

function DriverDashboard() {
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('trips')
  const [driverStats, setDriverStats] = useState({
    totalTrips: 0,
    completedTrips: 0,
    totalEarnings: 0,
    rating: 4.8,
    thisWeekEarnings: 0
  })

  useEffect(() => {
    // Mock data - in real app, this would fetch from API
    const mockTrips = [
      {
        id: 1,
        vehicle: 'Bus #12 (Company X)',
        date: '2024-01-15',
        time: '10:00 - 13:00',
        pickup: 'City A',
        destination: 'City B',
        status: 'assigned',
        passengerCount: 25,
        client: 'Corporate Group',
        revenue: 1250,
        clientPhone: '+1 (555) 123-4567',
        notes: 'VIP group, ensure punctuality'
      },
      {
        id: 2,
        vehicle: 'Limousine #5 (Premium)',
        date: '2024-01-15',
        time: '14:00 - 16:00',
        pickup: 'Airport Terminal 1',
        destination: 'Downtown Hotel',
        status: 'ontheway',
        passengerCount: 4,
        client: 'VIP Client',
        revenue: 450,
        clientPhone: '+1 (555) 234-5678',
        notes: 'Airport pickup, luggage assistance needed'
      },
      {
        id: 3,
        vehicle: 'Bus #8 (Standard)',
        date: '2024-01-14',
        time: '18:00 - 20:00',
        pickup: 'Central Station',
        destination: 'Resort Hotel',
        status: 'completed',
        passengerCount: 20,
        client: 'Tour Group',
        revenue: 800,
        clientPhone: '+1 (555) 345-6789',
        notes: 'Completed successfully'
      }
    ]
    
    setTimeout(() => {
      setTrips(mockTrips)
      setDriverStats({
        totalTrips: 45,
        completedTrips: 42,
        totalEarnings: 15600,
        rating: 4.8,
        thisWeekEarnings: 2500
      })
      setLoading(false)
    }, 1000)
  }, [])

  const updateTripStatus = (tripId, newStatus) => {
    setTrips(trips.map(trip => 
      trip.id === tripId ? { ...trip, status: newStatus } : trip
    ))
  }

  const getStatusButton = (trip) => {
    const statusConfig = {
      assigned: {
        text: 'Start Trip',
        color: 'bg-yellow-500 hover:bg-yellow-600',
        nextStatus: 'ontheway'
      },
      ontheway: {
        text: 'Complete Trip',
        color: 'bg-green-500 hover:bg-green-600',
        nextStatus: 'completed'
      },
      completed: {
        text: 'Trip Completed',
        color: 'bg-blue-500 cursor-not-allowed',
        nextStatus: null
      }
    }

    const config = statusConfig[trip.status]
    
    return (
      <button
        onClick={() => config.nextStatus && updateTripStatus(trip.id, config.nextStatus)}
        disabled={!config.nextStatus}
        className={`w-full ${config.color} text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 text-lg mobile-text-lg disabled:opacity-75`}
      >
        {config.text}
      </button>
    )
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'assigned':
        return <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
      case 'ontheway':
        return <div className="w-4 h-4 bg-green-500 rounded-full"></div>
      case 'completed':
        return <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your trips...</p>
        </div>
      </div>
    )
  }

  const renderTripsTab = () => (
    <div className="space-y-4">
      {trips.length === 0 ? (
        <div className="text-center py-12">
          <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No trips scheduled</h3>
          <p className="text-gray-600">You don't have any trips assigned at the moment.</p>
        </div>
      ) : (
        trips.map((trip) => (
          <div key={trip.id} className="card">
            {/* Trip Status */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                {getStatusIcon(trip.status)}
                <span className="text-sm font-medium text-gray-700 capitalize">
                  {trip.status.replace('ontheway', 'On the Way')}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                {trip.passengerCount} passengers
              </span>
            </div>

            {/* Vehicle Info */}
            <div className="flex items-center space-x-3 mb-4">
              <Car className="w-5 h-5 text-gray-600" />
              <span className="text-lg font-medium text-gray-900">{trip.vehicle}</span>
            </div>

            {/* Date & Time */}
            <div className="flex items-center space-x-3 mb-4">
              <Clock className="w-5 h-5 text-gray-600" />
              <div>
                <span className="text-lg font-medium text-gray-900">{trip.date}</span>
                <span className="text-lg text-gray-900 ml-2">{trip.time}</span>
              </div>
            </div>

            {/* Route */}
            <div className="flex items-start space-x-3 mb-4">
              <MapPin className="w-5 h-5 text-gray-600 mt-1" />
              <div className="flex-1">
                <div className="text-lg font-medium text-gray-900">{trip.pickup}</div>
                <div className="text-sm text-gray-500 my-1">↓</div>
                <div className="text-lg font-medium text-gray-900">{trip.destination}</div>
              </div>
            </div>

            {/* Client Info */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Client</span>
                <span className="text-sm font-bold text-green-600">${trip.revenue}</span>
              </div>
              <div className="text-sm text-gray-900">{trip.client}</div>
              {trip.clientPhone && (
                <div className="flex items-center space-x-2 mt-1">
                  <Phone className="w-3 h-3 text-gray-500" />
                  <span className="text-xs text-gray-600">{trip.clientPhone}</span>
                </div>
              )}
              {trip.notes && (
                <div className="text-xs text-gray-600 mt-2 italic">{trip.notes}</div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button className="flex-1 btn-secondary text-sm flex items-center justify-center">
                <Navigation className="w-4 h-4 mr-2" />
                Navigate
              </button>
              {getStatusButton(trip)}
            </div>
          </div>
        ))
      )}
    </div>
  )

  const renderEarningsTab = () => (
    <div className="space-y-6">
      {/* Earnings Overview */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card text-center">
          <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">${driverStats.thisWeekEarnings}</div>
          <div className="text-sm text-gray-600">{t('thisWeek')}</div>
        </div>
        <div className="card text-center">
          <DollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
          <div className="text-2xl font-bold text-gray-900">${driverStats.totalEarnings}</div>
          <div className="text-sm text-gray-600">{t('totalEarnings')}</div>
        </div>
      </div>

      {/* Trip Statistics */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('tripStatistics')}</h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">{t('totalTrips')}</span>
            <span className="font-medium">{driverStats.totalTrips}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t('completed')}</span>
            <span className="font-medium text-green-600">{driverStats.completedTrips}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t('successRate')}</span>
            <span className="font-medium text-green-600">
              {Math.round((driverStats.completedTrips / driverStats.totalTrips) * 100)}%
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{t('rating')}</span>
            <span className="font-medium text-yellow-600">⭐ {driverStats.rating}</span>
          </div>
        </div>
      </div>

      {/* Recent Earnings */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('recentTrips')}</h3>
        <div className="space-y-3">
          {trips.filter(trip => trip.status === 'completed').slice(0, 5).map((trip) => (
            <div key={trip.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
              <div>
                <div className="font-medium text-gray-900">{trip.client}</div>
                <div className="text-sm text-gray-600">{trip.date} • {trip.time}</div>
              </div>
              <div className="text-green-600 font-medium">+${trip.revenue}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Profile Info */}
      <div className="card">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-white">
              {user.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
            <p className="text-gray-600">Professional Driver</p>
            <div className="flex items-center space-x-1 mt-1">
              <span className="text-yellow-500">⭐</span>
              <span className="text-sm font-medium">{driverStats.rating}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <span className="text-gray-900">{user.email}</span>
          </div>
          <div className="flex items-center space-x-3">
            <Phone className="w-5 h-5 text-gray-400" />
            <span className="text-gray-900">+1 (555) 123-4567</span>
          </div>
          <div className="flex items-center space-x-3">
            <MapPin className="w-5 h-5 text-gray-400" />
            <span className="text-gray-900">Current Location: Downtown</span>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{driverStats.totalTrips}</div>
            <div className="text-sm text-gray-600">{t('totalTrips')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{driverStats.completedTrips}</div>
            <div className="text-sm text-gray-600">{t('completed')}</div>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
        <div className="space-y-3">
          <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <span>Notifications</span>
            <Bell className="w-5 h-5 text-gray-400" />
          </button>
          <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
            <span>Privacy</span>
            <Settings className="w-5 h-5 text-gray-400" />
          </button>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-between p-3 hover:bg-red-50 rounded-lg text-red-600"
          >
            <span>Sign Out</span>
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8">
              <img 
                src="/logo.png" 
                alt="Limostar Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
             <h1 className="text-xl font-semibold text-gray-900">
               {activeTab === 'trips' ? t('myTrips') :
                activeTab === 'calendar' ? t('schedule') :
                activeTab === 'earnings' ? t('earnings') : t('profile')}
             </h1>
             <p className="text-sm text-gray-600">{t('welcomeBack')}, {user.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-600 hover:text-gray-900">
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6 pb-20">
        {activeTab === 'trips' && renderTripsTab()}
        {activeTab === 'calendar' && <DriverCalendar />}
        {activeTab === 'earnings' && renderEarningsTab()}
        {activeTab === 'profile' && renderProfileTab()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="max-w-md mx-auto flex">
          <button
            onClick={() => setActiveTab('trips')}
            className={`flex-1 flex flex-col items-center py-3 px-2 ${
              activeTab === 'trips' ? 'text-primary-600' : 'text-gray-400'
            }`}
          >
            <Home className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">{t('myTrips')}</span>
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex-1 flex flex-col items-center py-3 px-2 ${
              activeTab === 'calendar' ? 'text-primary-600' : 'text-gray-400'
            }`}
          >
            <Calendar className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">{t('schedule')}</span>
          </button>
          <button
            onClick={() => setActiveTab('earnings')}
            className={`flex-1 flex flex-col items-center py-3 px-2 ${
              activeTab === 'earnings' ? 'text-primary-600' : 'text-gray-400'
            }`}
          >
            <DollarSign className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">{t('earnings')}</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 flex flex-col items-center py-3 px-2 ${
              activeTab === 'profile' ? 'text-primary-600' : 'text-gray-400'
            }`}
          >
            <User className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">{t('profile')}</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

export default DriverDashboard

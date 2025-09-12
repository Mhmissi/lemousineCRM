import { useState, useEffect } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { Car, Users, MapPin, TrendingUp, Plus, Clock, CheckCircle } from 'lucide-react'

function Dashboard({ onNavigate }) {
  const { t } = useLanguage()
  const [stats, setStats] = useState({
    totalTrips: 0,
    activeTrips: 0,
    completedTrips: 0,
    totalRevenue: 0
  })

  const [recentTrips, setRecentTrips] = useState([])

  useEffect(() => {
    // Mock data - in real app, this would fetch from API
    const mockStats = {
      totalTrips: 156,
      activeTrips: 8,
      completedTrips: 148,
      totalRevenue: 45250
    }

    const mockRecentTrips = [
      {
        id: 1,
        driver: 'John Driver',
        vehicle: 'Bus #12',
        route: 'City A → City B',
        status: 'completed',
        time: '2 hours ago'
      },
      {
        id: 2,
        driver: 'Mike Wilson',
        vehicle: 'Limousine #5',
        route: 'Airport → Hotel',
        status: 'active',
        time: '30 minutes ago'
      },
      {
        id: 3,
        driver: 'Sarah Johnson',
        vehicle: 'Bus #8',
        route: 'Station → Resort',
        status: 'assigned',
        time: '1 hour ago'
      }
    ]

    setTimeout(() => {
      setStats(mockStats)
      setRecentTrips(mockRecentTrips)
    }, 500)
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100'
      case 'active':
        return 'text-blue-600 bg-blue-100'
      case 'assigned':
        return 'text-yellow-600 bg-yellow-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('dashboard')}</h1>
            <p className="text-gray-600">{t('overviewOfLimousineService')}</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button 
              onClick={() => onNavigate && onNavigate('trips')}
              className="btn-primary flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t('createTrip')}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <MapPin className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('totalTrips')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTrips}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('completed')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.completedTrips}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('active')}</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeTrips}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('revenue')}</p>
              <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Trips */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">{t('recentTrips')}</h3>
            <button 
              onClick={() => onNavigate && onNavigate('trips')}
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              {t('viewAll')}
            </button>
          </div>
          <div className="space-y-4">
            {recentTrips.map((trip) => (
              <div key={trip.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <Car className="w-4 h-4 text-gray-500" />
                    <span className="font-medium text-gray-900">{trip.vehicle}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                      {trip.status === 'completed' ? t('completedStatus') : 
                       trip.status === 'active' ? t('activeStatus') : 
                       trip.status === 'assigned' ? t('assignedStatus') : trip.status}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-gray-600">
                    <p>{trip.driver}</p>
                    <p>{trip.route}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {trip.time.includes('hours') ? trip.time.replace('hours ago', t('hoursAgo')) :
                     trip.time.includes('minutes') ? trip.time.replace('minutes ago', t('minutesAgo')) :
                     trip.time.includes('hour ago') ? trip.time.replace('hour ago', t('hourAgo')) : trip.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('quickActions')}</h3>
          <div className="space-y-3">
            <button 
              onClick={() => onNavigate && onNavigate('trips')}
              className="w-full flex items-center justify-between p-4 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Plus className="w-5 h-5 text-primary-600" />
                <span className="font-medium text-gray-900">{t('createNewTrip')}</span>
              </div>
              <span className="text-primary-600">→</span>
            </button>
            
            <button 
              onClick={() => onNavigate && onNavigate('drivers')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">{t('manageDrivers')}</span>
              </div>
              <span className="text-gray-600">→</span>
            </button>
            
            <button 
              onClick={() => onNavigate && onNavigate('vehicles')}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Car className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">{t('vehicleStatus')}</span>
              </div>
              <span className="text-gray-600">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

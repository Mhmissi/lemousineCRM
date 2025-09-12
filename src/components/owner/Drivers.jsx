import { useState, useEffect } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { Users, Plus, Phone, Mail, MapPin, Clock, CheckCircle, XCircle } from 'lucide-react'

function Drivers() {
  const { t } = useLanguage()
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data - in real app, this would fetch from API
    const mockDrivers = [
      {
        id: 1,
        name: 'John Driver',
        email: 'john@lemousine.com',
        phone: '+1 (555) 123-4567',
        status: 'active',
        totalTrips: 45,
        rating: 4.8,
        currentLocation: 'Downtown',
        lastActive: '2 minutes ago'
      },
      {
        id: 2,
        name: 'Mike Wilson',
        email: 'mike@lemousine.com',
        phone: '+1 (555) 234-5678',
        status: 'active',
        totalTrips: 32,
        rating: 4.9,
        currentLocation: 'Airport',
        lastActive: '15 minutes ago'
      },
      {
        id: 3,
        name: 'Sarah Johnson',
        email: 'sarah@lemousine.com',
        phone: '+1 (555) 345-6789',
        status: 'offline',
        totalTrips: 28,
        rating: 4.7,
        currentLocation: 'Station',
        lastActive: '2 hours ago'
      }
    ]

    setTimeout(() => {
      setDrivers(mockDrivers)
      setLoading(false)
    }, 500)
  }, [])

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100'
      case 'offline':
        return 'text-gray-600 bg-gray-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'offline':
        return <XCircle className="w-4 h-4 text-gray-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('drivers')}</h1>
            <p className="text-gray-600">{t('manageDriverTeam')}</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button 
              onClick={() => alert('Add Driver functionality would open a driver registration form')}
              className="btn-primary flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t('addDriver')}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Users className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('totalDrivers')}</p>
              <p className="text-2xl font-bold text-gray-900">{drivers.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('active')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {drivers.filter(d => d.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-gray-100 rounded-lg">
              <XCircle className="w-6 h-6 text-gray-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('offline')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {drivers.filter(d => d.status === 'offline').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Drivers List */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('driver')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('contact')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('performance')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('location')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {drivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {driver.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{driver.name}</div>
                        <div className="text-sm text-gray-500">{t('lastActive')}: {driver.lastActive}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-900">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        {driver.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-900">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        {driver.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(driver.status)}
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(driver.status)}`}>
                        {driver.status === 'active' ? t('activeStatus') : 
                         driver.status === 'offline' ? t('offlineStatus') : driver.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{driver.totalTrips} {t('trips')}</div>
                    <div className="text-sm text-gray-500">{t('rating')}: {driver.rating}/5</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      {driver.currentLocation}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Drivers

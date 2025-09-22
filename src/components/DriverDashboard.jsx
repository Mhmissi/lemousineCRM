import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useLanguage } from '../contexts/LanguageContext'
import { useNotifications } from '../contexts/NotificationContext'
import { firestoreService } from '../services/firestoreService'
import { Car, Clock, MapPin, LogOut, Bell, Home, DollarSign, User, Settings, Navigation, Phone, Mail, Calendar, Search, Plus, Edit, Trash2, Grid3X3, Printer } from 'lucide-react'
import DriverCalendar from './DriverCalendar'
import NotificationBell from './NotificationBell'
import LanguageSwitcher from './LanguageSwitcher'

function DriverDashboard() {
  const { user, logout } = useAuth()
  const { t } = useLanguage()
  const { addNotification } = useNotifications()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('trips')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [driverStats, setDriverStats] = useState({
    totalTrips: 0,
    completedTrips: 0,
    totalEarnings: 0,
    rating: 4.8,
    thisWeekEarnings: 0
  })

  // Navigation tabs for driver interface
  const tabs = [
    { id: 'trips', label: t('myTrips'), icon: Home },
    { id: 'calendar', label: t('schedule'), icon: Calendar },
    { id: 'earnings', label: t('earnings'), icon: DollarSign },
    { id: 'profile', label: t('profile'), icon: User }
  ]

  useEffect(() => {
    // Load trips from Firebase for this driver
    const loadDriverTrips = async () => {
      try {
        setLoading(true)
        const allTrips = await firestoreService.getTrips()
        // Filter trips for current driver (assuming user.id is the driver ID)
        const driverTrips = allTrips.filter(trip => trip.driverId === user?.id)
        setTrips(driverTrips)
        
        // Calculate driver stats
        const completedTrips = driverTrips.filter(trip => trip.status === 'completed')
        const totalEarnings = completedTrips.reduce((sum, trip) => sum + (trip.revenue || 0), 0)
        
        setDriverStats({
          totalTrips: driverTrips.length,
          completedTrips: completedTrips.length,
          totalEarnings: totalEarnings,
          rating: 4.8, // This could be calculated from trip ratings
          thisWeekEarnings: totalEarnings * 0.3 // Simplified calculation
        })
      } catch (error) {
        console.error('Error loading driver trips:', error)
        setTrips([])
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      loadDriverTrips()
    }
  }, [user])

  // Filter trips based on search term
  const filteredTrips = trips.filter(trip =>
    trip.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.pickup.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trip.vehicle.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculate pagination
  const totalPages = Math.ceil(filteredTrips.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTrips = filteredTrips.slice(startIndex, endIndex)

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const updateTripStatus = (tripId, newStatus) => {
    const trip = trips.find(t => t.id === tripId)
    setTrips(trips.map(trip => 
      trip.id === tripId ? { ...trip, status: newStatus } : trip
    ))
    
    // Add notification for status change
    if (trip) {
      addNotification({
        type: 'trip',
        title: t('tripStatusChanged'),
        message: `${trip.client} - ${trip.pickup} to ${trip.destination}`,
        priority: 'medium',
        data: {
          tripId: trip.id,
          status: newStatus,
          client: trip.client
        }
      })
    }
  }

  const getStatusButton = (trip) => {
    const statusConfig = {
      assigned: {
        text: t('startTrip'),
        color: 'bg-yellow-500 hover:bg-yellow-600',
        nextStatus: 'ontheway'
      },
      ontheway: {
        text: t('completeTrip'),
        color: 'bg-green-500 hover:bg-green-600',
        nextStatus: 'completed'
      },
      completed: {
        text: t('tripCompleted'),
        color: 'bg-gray-500 cursor-not-allowed',
        nextStatus: null
      }
    }

    const config = statusConfig[trip.status]
    
    return (
      <button
        onClick={() => config.nextStatus && updateTripStatus(trip.id, config.nextStatus)}
        disabled={!config.nextStatus}
        className={`px-3 py-1 text-white rounded hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 text-xs font-medium ${
          trip.status === 'assigned' ? 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500' :
          trip.status === 'ontheway' ? 'bg-green-500 hover:bg-green-600 focus:ring-green-500' :
          'bg-gray-500 cursor-not-allowed focus:ring-gray-500'
        } disabled:opacity-75`}
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
          <p className="text-gray-600">{t('loading')}</p>
        </div>
      </div>
    )
  }

  const renderTripsTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-3">
          <Car className="w-6 h-6 lg:w-8 lg:h-8" style={{ color: '#DAA520' }} />
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t('myTrips')}</h1>
        </div>
        <div className="text-sm" style={{ color: '#DAA520' }}>
          <span className="hidden sm:inline">Home / {t('myTrips')}</span>
          <span className="sm:hidden">Home / {t('myTrips')}</span>
        </div>
      </div>

      {/* Trips Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Table Header */}
        <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-2">
              <Grid3X3 className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">{t('myTrips')}</h2>
            </div>
            
            <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-3 lg:space-y-0 lg:space-x-4 w-full lg:w-auto">
              {/* Search */}
              <div className="flex items-center space-x-2 w-full lg:w-auto">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">{t('search')}:</label>
                <div className="relative flex-1 lg:flex-none">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder={t('search') + '...'}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent w-full lg:w-64"
                  />
                </div>
              </div>

              {/* Display Count */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">{t('display')}/Page:</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button className="p-2 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500">
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button className="p-2 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500">
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button className="p-2 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500">
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button className="px-3 py-2 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center space-x-1">
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('print')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('number')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('time')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('vehicle')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('departure')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">{t('destination')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">{t('passengers')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('client')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('status')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentTrips.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-12 text-center text-gray-500">
                    {t('noTripsFound')}
                  </td>
                </tr>
              ) : (
                currentTrips.map((trip, index) => (
                  <tr key={trip.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {trip.id}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{trip.date}</div>
                        <div className="text-gray-500">{trip.time}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {trip.vehicle}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      <div className="max-w-xs truncate" title={trip.pickup}>
                        {trip.pickup}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 hidden md:table-cell">
                      <div className="max-w-xs truncate" title={trip.destination}>
                        {trip.destination}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                      {trip.passengerCount}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{trip.client}</div>
                        {trip.clientPhone && (
                          <div className="text-gray-500 text-xs">{trip.clientPhone}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        trip.status === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
                        trip.status === 'ontheway' ? 'bg-green-100 text-green-800' :
                        trip.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
{trip.status === 'ontheway' ? t('onTheWay') : trip.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-xs">
                          <Navigation className="w-3 h-3 inline mr-1" />
                          {t('navigate')}
                        </button>
                        {getStatusButton(trip)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-3 lg:space-y-0">
            <div className="text-sm text-gray-700">
              {t('display')} {startIndex + 1} à {Math.min(endIndex, filteredTrips.length)} de {filteredTrips.length} {t('records')}
            </div>
            
            {/* Pagination */}
            <div className="flex items-center space-x-1 overflow-x-auto">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="px-2 lg:px-3 py-1 text-xs lg:text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {t('first')}
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-2 lg:px-3 py-1 text-xs lg:text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {t('previous')}
              </button>
              
              {/* Page Numbers */}
              {Array.from({ length: Math.min(3, totalPages) }, (_, i) => {
                let pageNum
                if (totalPages <= 3) {
                  pageNum = i + 1
                } else if (currentPage <= 2) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 1) {
                  pageNum = totalPages - 2 + i
                } else {
                  pageNum = currentPage - 1 + i
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-2 lg:px-3 py-1 text-xs lg:text-sm border rounded whitespace-nowrap ${
                      currentPage === pageNum
                        ? 'bg-[#DAA520] text-white border-[#DAA520]'
                        : 'border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-2 lg:px-3 py-1 text-xs lg:text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {t('next')}
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="px-2 lg:px-3 py-1 text-xs lg:text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {t('last')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderEarningsTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-3">
          <DollarSign className="w-6 h-6 lg:w-8 lg:h-8" style={{ color: '#DAA520' }} />
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t('earnings')}</h1>
        </div>
        <div className="text-sm" style={{ color: '#DAA520' }}>
          <span className="hidden sm:inline">Home / {t('earnings')}</span>
          <span className="sm:hidden">Home / {t('earnings')}</span>
        </div>
      </div>

      {/* Earnings Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 text-center">
          <DollarSign className="w-6 h-6 lg:w-8 lg:h-8 mx-auto mb-2 lg:mb-3" style={{ color: '#DAA520' }} />
          <div className="text-lg lg:text-2xl font-bold text-gray-900">${driverStats.thisWeekEarnings}</div>
          <div className="text-xs lg:text-sm text-gray-600">{t('thisWeek')}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 text-center">
          <DollarSign className="w-6 h-6 lg:w-8 lg:h-8 mx-auto mb-2 lg:mb-3" style={{ color: '#DAA520' }} />
          <div className="text-lg lg:text-2xl font-bold text-gray-900">${driverStats.totalEarnings}</div>
          <div className="text-xs lg:text-sm text-gray-600">{t('totalEarnings')}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 text-center">
          <Car className="w-6 h-6 lg:w-8 lg:h-8 mx-auto mb-2 lg:mb-3" style={{ color: '#DAA520' }} />
          <div className="text-lg lg:text-2xl font-bold text-gray-900">{driverStats.totalTrips}</div>
          <div className="text-xs lg:text-sm text-gray-600">{t('totalTrips')}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 text-center">
          <User className="w-6 h-6 lg:w-8 lg:h-8 mx-auto mb-2 lg:mb-3" style={{ color: '#DAA520' }} />
          <div className="text-lg lg:text-2xl font-bold text-gray-900">⭐ {driverStats.rating}</div>
          <div className="text-xs lg:text-sm text-gray-600">{t('rating')}</div>
        </div>
      </div>

      {/* Trip Statistics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{t('tripStatistics')}</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t('totalTrips')}</span>
                <span className="font-semibold text-gray-900">{driverStats.totalTrips}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t('completed')}</span>
                <span className="font-semibold text-green-600">{driverStats.completedTrips}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t('successRate')}</span>
                <span className="font-semibold text-green-600">
                  {Math.round((driverStats.completedTrips / driverStats.totalTrips) * 100)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">{t('rating')}</span>
                <span className="font-semibold text-yellow-600">⭐ {driverStats.rating}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Earnings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{t('recentTrips')}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('client')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('date')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('time')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('revenue')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trips.filter(trip => trip.status === 'completed').slice(0, 10).map((trip, index) => (
                <tr key={trip.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {trip.client}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {trip.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {trip.time}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                    +${trip.revenue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

  const renderProfileTab = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-3">
          <User className="w-6 h-6 lg:w-8 lg:h-8" style={{ color: '#DAA520' }} />
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t('profile')}</h1>
        </div>
        <div className="text-sm" style={{ color: '#DAA520' }}>
          <span className="hidden sm:inline">Home / {t('profile')}</span>
          <span className="sm:hidden">Home / {t('profile')}</span>
        </div>
      </div>

      {/* Profile Info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{t('profile')}</h3>
        </div>
        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#DAA520] rounded-full flex items-center justify-center">
              <span className="text-xl sm:text-2xl font-bold text-white">
                {user.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">{user.name}</h2>
              <p className="text-gray-600 mb-2">Professional Driver</p>
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <span className="text-yellow-500">⭐</span>
                <span className="text-lg font-medium">{driverStats.rating}</span>
                <span className="text-gray-500">({driverStats.totalTrips} {t('totalTrips')})</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">{t('email')}</div>
                  <div className="text-gray-900">{user.email}</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">{t('phone')}</div>
                  <div className="text-gray-900">+1 (555) 123-4567</div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">{t('location')}</div>
                  <div className="text-gray-900">Current Location: Downtown</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Car className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">{t('vehicle')}</div>
                  <div className="text-gray-900">Bus #12 (Company X)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{t('performance')}</h3>
        </div>
        <div className="p-4 lg:p-6">
          <div className="grid grid-cols-3 gap-4 lg:gap-6">
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold" style={{ color: '#DAA520' }}>{driverStats.totalTrips}</div>
              <div className="text-xs lg:text-sm text-gray-600">{t('totalTrips')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-green-600">{driverStats.completedTrips}</div>
              <div className="text-xs lg:text-sm text-gray-600">{t('completed')}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl lg:text-3xl font-bold text-green-600">
                {Math.round((driverStats.completedTrips / driverStats.totalTrips) * 100)}%
              </div>
              <div className="text-xs lg:text-sm text-gray-600">{t('successRate')}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{t('settings')}</h3>
        </div>
        <div className="p-4 lg:p-6">
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3 lg:p-4 hover:bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-gray-400" />
                <span className="font-medium">{t('notifications')}</span>
              </div>
              <span className="text-gray-400">→</span>
            </button>
            <button className="w-full flex items-center justify-between p-3 lg:p-4 hover:bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-3">
                <Settings className="w-5 h-5 text-gray-400" />
                <span className="font-medium">{t('privacy')}</span>
              </div>
              <span className="text-gray-400">→</span>
            </button>
            <button 
              onClick={logout}
              className="w-full flex items-center justify-between p-3 lg:p-4 hover:bg-red-50 rounded-lg border border-red-200 text-red-600"
            >
              <div className="flex items-center space-x-3">
                <LogOut className="w-5 h-5" />
                <span className="font-medium">{t('logout')}</span>
              </div>
              <span className="text-red-400">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )

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
                  <Icon className="mr-3 h-5 w-5" />
                  {tab.label}
                </button>
              )
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="flex-shrink-0 px-4 py-4 border-t border-brand-gold">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-brand-gold rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-brand-dark">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-gray-300">Driver</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center px-2 py-2 text-sm text-gray-300 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
            >
              <LogOut className="mr-3 h-4 w-4" />
              {t('logout')}
            </button>
          </div>

          {/* Language Switcher */}
          <div className="flex-shrink-0 px-4 py-2">
            <LanguageSwitcher />
          </div>

          {/* Branding */}
          <div className="flex-shrink-0 px-4 py-2">
            <div className="text-xs text-gray-400 text-center">
              CRM powered by Rankiwisy
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 lg:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900 truncate">
                  {activeTab === 'trips' ? t('myTrips') :
                   activeTab === 'calendar' ? t('schedule') :
                   activeTab === 'earnings' ? t('earnings') : t('profile')}
                </h1>
                <p className="text-sm text-gray-600 truncate">{t('welcomeBack')}, {user.name}</p>
              </div>
              <div className="flex items-center space-x-2 lg:space-x-4 flex-shrink-0">
                <NotificationBell />
                <div className="hidden sm:flex items-center space-x-2">
                  <div className="w-8 h-8 bg-brand-gold rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-brand-dark">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user.name}</span>
                </div>
                <div className="sm:hidden">
                  <div className="w-8 h-8 bg-brand-gold rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-brand-dark">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-6 pb-20 lg:pb-6">
          {activeTab === 'trips' && renderTripsTab()}
          {activeTab === 'calendar' && <DriverCalendar />}
          {activeTab === 'earnings' && renderEarningsTab()}
          {activeTab === 'profile' && renderProfileTab()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-brand-dark border-t border-brand-gold px-2 py-2">
        <div className="flex justify-around">
          {tabs.slice(0, 4).map((tab) => {
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
        </div>
        <div className="text-center text-xs text-gray-500 mt-1">
          CRM powered by Rankiwisy
        </div>
      </div>
    </div>
  )
}

export default DriverDashboard

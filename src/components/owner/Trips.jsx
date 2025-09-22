import { useState, useEffect } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { MapPin, Plus, Clock, Car, Users, Filter, Search } from 'lucide-react'
import AddTripForm from './AddTripForm'
import { firestoreService } from '../../services/firestoreService'

function Trips() {
  const { t } = useLanguage()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    // Load trips from Firestore
    const loadTrips = async () => {
      try {
        setLoading(true)
        const tripsData = await firestoreService.getTrips()
        setTrips(tripsData)
      } catch (error) {
        console.error('Error loading trips:', error)
        // Fallback to empty array if Firestore fails
        setTrips([])
      } finally {
        setLoading(false)
      }
    }

    loadTrips()
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

  const handleTripAdded = async (newTrip) => {
    try {
      // Add trip to Firestore
      const tripData = {
        ...newTrip,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      const docRef = await firestoreService.addTrip(tripData)
      const addedTrip = { id: docRef.id, ...tripData }
      
      // Update local state
      setTrips(prevTrips => [addedTrip, ...prevTrips])
    } catch (error) {
      console.error('Error adding trip:', error)
      alert('Failed to add trip. Please try again.')
    }
  }

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = trip.pickup.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.driver.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trip.client.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || trip.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4].map((i) => (
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
    <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 min-h-screen pb-20 lg:pb-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('trips')}</h1>
            <p className="text-gray-600">{t('manageAllServiceTrips')}</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button 
              onClick={() => setShowAddForm(true)}
              className="btn-primary flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t('createTrip')}
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <MapPin className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('totalTrips')}</p>
              <p className="text-2xl font-bold text-gray-900">{trips.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {trips.filter(t => t.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Car className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('assigned')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {trips.filter(t => t.status === 'assigned').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('todaysRevenue')}</p>
              <p className="text-2xl font-bold text-gray-900">
                ${trips.reduce((sum, t) => sum + t.revenue, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('searchTrips')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">{t('allStatus')}</option>
                <option value="assigned">{t('assigned')}</option>
                <option value="active">{t('active')}</option>
                <option value="completed">{t('completed')}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Trips List */}
      <div className="space-y-4">
        {filteredTrips.map((trip) => (
          <div key={trip.id} className="card">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              {/* Trip Info */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Car className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{trip.vehicle}</h3>
                      <p className="text-sm text-gray-600">{t('driver')}: {trip.driver}</p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(trip.status)}`}>
                    {trip.status === 'completed' ? t('completedStatus') : 
                     trip.status === 'active' ? t('activeStatus') : 
                     trip.status === 'assigned' ? t('assignedStatus') : trip.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">{t('route')}</p>
                      <p className="font-medium text-gray-900">{trip.pickup} → {trip.destination}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">{t('dateTime')}</p>
                      <p className="font-medium text-gray-900">{trip.date} • {trip.time}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">{t('passengers')}</p>
                      <p className="font-medium text-gray-900">{trip.passengers}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600">{t('client')}</p>
                    <p className="font-medium text-gray-900">{trip.client}</p>
                  </div>
                </div>
              </div>

              {/* Revenue and Actions */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-4">
                <div className="text-center lg:text-right mb-4 lg:mb-0">
                  <p className="text-2xl font-bold text-green-600">${trip.revenue}</p>
                  <p className="text-sm text-gray-600">{t('revenue')}</p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => alert(`Viewing details for trip ${trip.id}`)}
                    className="btn-secondary text-sm"
                  >
                    {t('viewDetails')}
                  </button>
                  <button 
                    onClick={() => alert(`Tracking trip ${trip.id} - ${trip.vehicle}`)}
                    className="btn-primary text-sm"
                  >
                    {t('trackTrip')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTrips.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noTripsFound')}</h3>
          <p className="text-gray-600">{t('tryAdjustingSearch')}</p>
        </div>
      )}

      {/* Add Trip Form Modal */}
      {showAddForm && (
        <AddTripForm
          onClose={() => setShowAddForm(false)}
          onTripAdded={handleTripAdded}
        />
      )}
    </div>
  )
}

export default Trips

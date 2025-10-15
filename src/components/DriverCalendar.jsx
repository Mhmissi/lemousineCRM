import { useState, useEffect } from 'react'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../contexts/AuthContext'
import { Calendar, Clock, MapPin, Users, Phone, Navigation, CheckCircle, Play, X, RotateCcw, Plus } from 'lucide-react'
import { firestoreService } from '../services/firestoreService'

function DriverCalendar() {
  const { t } = useLanguage()
  const { user } = useAuth()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('week') // 'week' or 'month'
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTrips = async () => {
      if (!user?.id) return
      
      try {
        setLoading(true)
        console.log('📅 Loading trips for calendar for driver:', user.id)
        
        const allTrips = await firestoreService.getTrips()
        console.log('📅 All trips loaded:', allTrips.length)
        
        // Filter trips for current driver using the same logic as DriverDashboard
        const driverTrips = allTrips.filter(trip => {
          const matchesFirebaseId = trip.driverFirebaseAuthId === user.id
          const matchesEmail = trip.driverEmail === user.email
          const matchesDriverId = trip.driverId === user.id
          const matchesName = trip.driverName && user.name && 
            trip.driverName.toLowerCase().includes(user.name.toLowerCase())
          
          return matchesFirebaseId || matchesEmail || matchesDriverId || matchesName
        })
        
        console.log('📅 Filtered trips for driver:', driverTrips.length)
        
        // Transform trips data to match the calendar format
        const formattedTrips = driverTrips.map(trip => {
          const [startTime, endTime] = trip.time?.split(' - ') || ['09:00', '11:00']
          return {
            id: trip.id,
            date: trip.date,
            time: startTime || '09:00',
            endTime: endTime || '11:00',
            pickup: trip.pickup,
            destination: trip.destination,
            client: trip.client,
            clientPhone: '+32 2 123 4567', // Default phone, you can add this to trips later
            passengers: trip.passengers,
            status: trip.status,
            vehicle: trip.vehicleName,
            specialInstructions: trip.notes || '',
            estimatedDuration: '2 hours' // Default duration
          }
        })
        
        setTrips(formattedTrips)
        console.log('📅 Formatted trips for calendar:', formattedTrips.length)
      } catch (error) {
        console.error('❌ Error loading trips for calendar:', error)
        setTrips([])
      } finally {
        setLoading(false)
      }
    }

    loadTrips()
  }, [user?.id])

  const getDaysInWeek = (date) => {
    const start = new Date(date)
    const day = start.getDay()
    const diff = start.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
    start.setDate(diff)
    
    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(start)
      day.setDate(start.getDate() + i)
      days.push(day)
    }
    return days
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const getTripsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    return trips.filter(trip => trip.date === dateStr)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'assigned':
        return 'bg-yellow-100 text-yellow-800'
      case 'active':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'assigned':
        return t('assignedStatus')
      case 'active':
        return t('activeStatus')
      case 'completed':
        return t('completedStatus')
      case 'cancelled':
        return t('cancelled')
      default:
        return status
    }
  }

  const formatTime = (time) => {
    return time.slice(0, 5) // Remove seconds if present
  }

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + (direction * 7))
    setCurrentDate(newDate)
  }

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(newDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDate(today)
  }

  const getMonthName = (date) => {
    const months = [
      t('january'), t('february'), t('march'), t('april'), t('may'), t('june'),
      t('july'), t('august'), t('september'), t('october'), t('november'), t('december')
    ]
    return months[date.getMonth()]
  }

  const getDayName = (date) => {
    const days = [
      t('sunday'), t('monday'), t('tuesday'), t('wednesday'), 
      t('thursday'), t('friday'), t('saturday')
    ]
    return days[date.getDay()]
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('schedule')}</h1>
            <p className="text-gray-600">{t('upcomingTrips')}</p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-2">
            <button
              onClick={() => setViewMode(viewMode === 'week' ? 'month' : 'week')}
              className="btn-secondary flex items-center"
            >
              <Calendar className="w-4 h-4 mr-2" />
              {viewMode === 'week' ? t('month') : t('week')}
            </button>
            <button
              onClick={goToToday}
              className="btn-primary flex items-center"
            >
              <Clock className="w-4 h-4 mr-2" />
              {t('today')}
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="card mb-6">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => viewMode === 'week' ? navigateWeek(-1) : navigateMonth(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Navigation className="w-5 h-5 text-gray-600 rotate-90" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900">
              {viewMode === 'week' 
                ? `${getMonthName(currentDate)} ${currentDate.getFullYear()}`
                : `${getMonthName(currentDate)} ${currentDate.getFullYear()}`
              }
            </h2>
            <button
              onClick={() => viewMode === 'week' ? navigateWeek(1) : navigateMonth(1)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Navigation className="w-5 h-5 text-gray-600 -rotate-90" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="card">
        {viewMode === 'week' ? (
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Week Header */}
              <div className="grid grid-cols-7 border-b border-gray-200">
                {getDaysInWeek(currentDate).map((day, index) => (
                  <div key={index} className="p-4 text-center border-r border-gray-200 last:border-r-0">
                    <div className="text-sm font-medium text-gray-600">{getDayName(day)}</div>
                    <div className={`text-lg font-semibold mt-1 ${
                      day.toDateString() === new Date().toDateString() 
                        ? 'text-primary-600 bg-primary-100 rounded-full w-8 h-8 flex items-center justify-center mx-auto'
                        : 'text-gray-900'
                    }`}>
                      {day.getDate()}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Week Content */}
              <div className="grid grid-cols-7 min-h-96">
                {getDaysInWeek(currentDate).map((day, index) => {
                  const dayTrips = getTripsForDate(day)
                  return (
                    <div key={index} className="p-2 border-r border-gray-200 last:border-r-0 min-h-96">
                      <div className="space-y-2">
                        {dayTrips.map((trip) => (
                          <div
                            key={trip.id}
                            className={`p-3 rounded-lg border-l-4 ${
                              trip.status === 'assigned' ? 'border-yellow-400 bg-yellow-50' :
                              trip.status === 'active' ? 'border-blue-400 bg-blue-50' :
                              trip.status === 'completed' ? 'border-green-400 bg-green-50' :
                              'border-gray-400 bg-gray-50'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-gray-900">
                                {formatTime(trip.time)}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                                {getStatusText(trip.status)}
                              </span>
                            </div>
                            <div className="text-sm text-gray-700">
                              <div className="font-medium">{trip.client}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {trip.pickup} → {trip.destination}
                              </div>
                              <div className="flex items-center mt-2 space-x-2">
                                <Users className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500">{trip.passengers} {t('passengers')}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                        {dayTrips.length === 0 && (
                          <div className="text-center text-gray-400 text-sm py-8">
                            {t('noTripsToday')}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Month Header */}
              <div className="grid grid-cols-7 border-b border-gray-200">
                {[t('sunday'), t('monday'), t('tuesday'), t('wednesday'), t('thursday'), t('friday'), t('saturday')].map((day, index) => (
                  <div key={index} className="p-4 text-center border-r border-gray-200 last:border-r-0">
                    <div className="text-sm font-medium text-gray-600">{day}</div>
                  </div>
                ))}
              </div>
              
              {/* Month Content */}
              <div className="grid grid-cols-7">
                {getDaysInMonth(currentDate).map((day, index) => {
                  if (!day) {
                    return <div key={index} className="p-4 border-r border-gray-200 last:border-r-0 min-h-24"></div>
                  }
                  
                  const dayTrips = getTripsForDate(day)
                  return (
                    <div key={index} className="p-2 border-r border-gray-200 last:border-r-0 min-h-24">
                      <div className={`text-sm font-medium mb-1 ${
                        day.toDateString() === new Date().toDateString() 
                          ? 'text-primary-600 bg-primary-100 rounded-full w-6 h-6 flex items-center justify-center'
                          : 'text-gray-900'
                      }`}>
                        {day.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayTrips.slice(0, 2).map((trip) => (
                          <div
                            key={trip.id}
                            className={`p-1 rounded text-xs ${
                              trip.status === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
                              trip.status === 'active' ? 'bg-blue-100 text-blue-800' :
                              trip.status === 'completed' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <div className="font-medium">{formatTime(trip.time)}</div>
                            <div className="truncate">{trip.client}</div>
                          </div>
                        ))}
                        {dayTrips.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{dayTrips.length - 2} {t('trips')}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Trip Details Modal */}
      {selectedDate && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {t('tripDetails')} - {selectedDate.toLocaleDateString()}
          </h3>
          <div className="space-y-4">
            {getTripsForDate(selectedDate).map((trip) => (
              <div key={trip.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <span className="text-lg font-semibold text-gray-900">
                        {formatTime(trip.time)} - {formatTime(trip.endTime)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                        {getStatusText(trip.status)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">{t('startLocation')}</div>
                          <div className="font-medium text-gray-900">{trip.pickup}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">{t('endLocation')}</div>
                          <div className="font-medium text-gray-900">{trip.destination}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">{t('passengers')}</div>
                          <div className="font-medium text-gray-900">{trip.passengers}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="text-sm text-gray-600">{t('clientContact')}</div>
                          <div className="font-medium text-gray-900">{trip.clientPhone}</div>
                        </div>
                      </div>
                    </div>
                    
                    {trip.specialInstructions && (
                      <div className="mb-4">
                        <div className="text-sm text-gray-600 mb-1">{t('specialInstructions')}</div>
                        <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                          {trip.specialInstructions}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col space-y-2 ml-4">
                    <button className="btn-primary text-sm flex items-center">
                      <Navigation className="w-4 h-4 mr-2" />
                      {t('viewOnMap')}
                    </button>
                    {trip.status === 'assigned' && (
                      <button className="btn-secondary text-sm flex items-center">
                        <Play className="w-4 h-4 mr-2" />
                        {t('markAsStarted')}
                      </button>
                    )}
                    {trip.status === 'active' && (
                      <button className="btn-primary text-sm flex items-center">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {t('markAsCompleted')}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {getTripsForDate(selectedDate).length === 0 && (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noTripsToday')}</h3>
                <p className="text-gray-600">Enjoy your day off!</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default DriverCalendar

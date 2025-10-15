import { useState, useEffect, useRef, useCallback } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { 
  Calendar, 
  BarChart3, 
  FileText, 
  CreditCard, 
  FileEdit, 
  Grid3X3, 
  User, 
  UserCheck, 
  Building,
  RefreshCw,
  Maximize2,
  MapPin,
  Clock,
  Car
} from 'lucide-react'
import { tripsService } from '../../services/firestoreService'
import { collection, query, getDocs, orderBy } from 'firebase/firestore'
import { db } from '../../config/firebase'

// ===== CONSTANTS =====
const MONTH_NAMES = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc']
const CHART_COLORS = {
  trips: 'bg-blue-500',
  revenue: 'bg-purple-500', 
  unpaid: 'bg-green-500',
  avgPrice: 'bg-orange-500'
}

// ===== HELPER FUNCTIONS =====
const getTodayDate = () => {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getStatusColor = (status) => {
  switch (status) {
    case 'completed': return 'text-green-600 bg-green-100'
    case 'active': return 'text-blue-600 bg-blue-100'
    case 'assigned': return 'text-yellow-600 bg-yellow-100'
    default: return 'text-gray-600 bg-gray-100'
  }
}

// ===== MAIN COMPONENT =====
function Dashboard({ onNavigate }) {
  const { t } = useLanguage()
  
  // ===== STATE =====
  const [stats, setStats] = useState({
    totalTripsToday: 0,
    completedTripsToday: 0,
    pendingTripsToday: 0
  })
  const [revenueData, setRevenueData] = useState([])
  const [trips, setTrips] = useState([])
  const [selectedDate, setSelectedDate] = useState(getTodayDate())
  const [showAllTrips, setShowAllTrips] = useState(false)
  const [loadingTrips, setLoadingTrips] = useState(false)
  const isMountedRef = useRef(true)

  // ===== DATA PROCESSING FUNCTIONS =====
  const calculateRevenueData = useCallback((tripsData) => {
    const currentDate = new Date()
    const months = []
    const tripsToUse = tripsData || []
    
    console.log('📊 Dashboard: Calculating revenue for', tripsToUse.length, 'trips')
    
    // Show last 4 months + current month (5 months total)
    for (let i = 4; i >= 0; i--) {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthName = MONTH_NAMES[monthDate.getMonth()]
      
      // Calculate month boundaries
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)
      
      // Filter trips for this month
      const monthTrips = tripsToUse.filter(trip => {
        let tripDate
        if (trip.date instanceof Date) {
          tripDate = trip.date
        } else if (typeof trip.date === 'string') {
          tripDate = new Date(trip.date)
        } else {
          return false
        }
        
        return tripDate >= monthStart && tripDate <= monthEnd
      })
      
      // Calculate metrics
      const totalTrips = monthTrips.length
      const totalRevenue = monthTrips.reduce((sum, trip) => sum + (trip.revenue || 0), 0)
      const unpaidRevenue = monthTrips
        .filter(trip => trip.status !== 'completed')
        .reduce((sum, trip) => sum + (trip.revenue || 0), 0)
      
      months.push({
        month: monthName,
        trips: totalTrips, // Keep original trip count
        revenue: totalRevenue, // Keep original revenue in euros
        unpaid: unpaidRevenue, // Keep original unpaid amount in euros
        avgPrice: totalTrips > 0 ? totalRevenue / totalTrips : 0 // Keep original average price
      })
    }
    
    return months
  }, [])

  const loadDashboardData = useCallback(async (tripsData) => {
    try {
      console.log('📊 Dashboard: Loading dashboard data...')
      
      // Calculate revenue data
      const revenueMonths = calculateRevenueData(tripsData)
      
      // Calculate today's trip statistics
      const today = getTodayDate()
      const todayTrips = tripsData.filter(trip => trip.date === today)
      
      const totalTripsToday = todayTrips.length
      const completedTripsToday = todayTrips.filter(trip => trip.status === 'completed').length
      const pendingTripsToday = todayTrips.filter(trip => 
        trip.status === 'assigned' || trip.status === 'active'
      ).length
      
      const calculatedStats = {
        totalTripsToday,
        completedTripsToday,
        pendingTripsToday
      }
      
      // Update state
      setStats(calculatedStats)
      setRevenueData(revenueMonths)
      
      console.log('📊 Dashboard: Stats calculated:', calculatedStats)
      console.log('📊 Dashboard: Revenue data updated successfully')
      
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setStats({ totalTripsToday: 0, completedTripsToday: 0, pendingTripsToday: 0 })
      setRevenueData([])
    }
  }, [calculateRevenueData])

  const normalizeTripData = useCallback((trip) => {
    // Handle different date formats
    let tripDate = trip.date || trip.tripDate || trip.scheduledDate
    
    if (tripDate instanceof Date) {
      const year = tripDate.getFullYear()
      const month = String(tripDate.getMonth() + 1).padStart(2, '0')
      const day = String(tripDate.getDate()).padStart(2, '0')
      tripDate = `${year}-${month}-${day}`
    } else if (typeof tripDate === 'string' && tripDate.includes('/')) {
      // Convert MM/DD/YYYY to YYYY-MM-DD
      const [month, day, year] = tripDate.split('/')
      tripDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    } else if (!tripDate) {
      tripDate = getTodayDate()
    }
    
    return {
      id: trip.id,
      client: trip.client || trip.clientName || trip.customer || trip.customerName || 'Unknown Client',
      driver: trip.driver || trip.driverName || trip.driverId || 'Unassigned',
      vehicle: trip.vehicle || trip.vehicleId || trip.car || 'Unassigned',
      pickup: trip.pickup || trip.pickupLocation || trip.from || trip.startLocation || 'Unknown',
      destination: trip.destination || trip.dropoffLocation || trip.to || trip.endLocation || 'Unknown',
      date: tripDate,
      startTime: trip.startTime || trip.time || trip.pickupTime || '09:00',
      endTime: trip.endTime || trip.dropoffTime || trip.estimatedEndTime || '11:00',
      passengers: trip.passengers || trip.passengerCount || trip.numberOfPassengers || 1,
      status: trip.status || trip.tripStatus || 'assigned',
      revenue: trip.revenue || trip.price || trip.total || trip.amount || trip.cost || trip.fare || 0,
      notes: trip.notes || trip.description || trip.remarks || '',
      ...trip
    }
  }, [])

  const loadTrips = useCallback(async () => {
    try {
      setLoadingTrips(true)
      console.log('📊 Dashboard: Loading trips from Firestore...')
      
      // Fetch trips data
      let tripsData = await tripsService.getAllTrips()
      console.log('📊 Dashboard: Fetched', tripsData.length, 'trips')
      
      // Fallback to direct Firestore query if no trips found
      if (tripsData.length === 0) {
        console.log('📊 Dashboard: No trips found, trying direct query...')
        const tripsRef = collection(db, 'trips')
        const tripsQuery = query(tripsRef, orderBy('createdAt', 'desc'))
        const querySnapshot = await getDocs(tripsQuery)
        tripsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        console.log('📊 Dashboard: Direct query found', tripsData.length, 'trips')
      }
      
      // Normalize and map trip data
      const mappedTrips = tripsData.map(normalizeTripData)
      setTrips(mappedTrips)
      
      console.log('📊 Dashboard: Successfully loaded', mappedTrips.length, 'trips')
      
    } catch (error) {
      console.error('❌ Error loading trips:', error)
      setTrips([])
    } finally {
      setLoadingTrips(false)
    }
  }, [normalizeTripData])

  // ===== EFFECTS =====
  useEffect(() => {
    loadDashboardData([]) // Start with empty trips
    loadTrips()
    
    return () => {
      isMountedRef.current = false
    }
  }, [loadDashboardData, loadTrips])

  // Recalculate revenue data when trips change
  useEffect(() => {
    if (trips.length > 0) {
      console.log('📊 Dashboard: Recalculating revenue data with', trips.length, 'trips')
      loadDashboardData(trips)
    } else {
      // Add some sample data for testing when no trips exist
      console.log('📊 Dashboard: No trips found, using sample data for testing')
      const currentDate = new Date()
      const sampleTrips = [
        {
          id: 'sample1',
          date: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 15).toISOString(),
          revenue: 450,
          status: 'completed'
        },
        {
          id: 'sample2', 
          date: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 20).toISOString(),
          revenue: 650,
          status: 'pending'
        },
        {
          id: 'sample3',
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 5).toISOString(),
          revenue: 320,
          status: 'completed'
        },
        {
          id: 'sample4',
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10).toISOString(),
          revenue: 580,
          status: 'completed'
        },
        {
          id: 'sample5',
          date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15).toISOString(),
          revenue: 720,
          status: 'pending'
        }
      ]
      loadDashboardData(sampleTrips)
    }
  }, [trips, loadDashboardData])

  // ===== COMPUTED VALUES =====
  const filteredTrips = showAllTrips ? trips : trips.filter(trip => trip.date === selectedDate)
  
  // ===== EVENT HANDLERS =====
  const handleTodayClick = () => {
    const todayString = getTodayDate()
    setSelectedDate(todayString)
    setShowAllTrips(false)
  }

  const handleRefreshTrips = () => {
    console.log('📊 Dashboard: Manual trips refresh triggered')
    loadTrips()
  }

  const handleRefreshRevenue = () => {
    console.log('📊 Dashboard: Manual revenue refresh triggered')
    loadDashboardData(trips)
  }

  // ===== RENDER =====
  return (
    <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 min-h-screen pb-20 lg:pb-6">
      {/* ===== HEADER ===== */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t('dashboardTitle')}</h1>
        </div>
      </div>

      {/* ===== QUICK ACCESS BUTTONS ===== */}
      <div className="mb-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-9 gap-4">
          <button 
            onClick={() => onNavigate && onNavigate('plannings')}
            className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group"
          >
            <Calendar className="w-8 h-8 mb-2" style={{ color: '#DAA520' }} />
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{t('plannings')}</span>
          </button>
          
          <button 
            onClick={() => onNavigate && onNavigate('reports')}
            className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group"
          >
            <BarChart3 className="w-8 h-8 mb-2" style={{ color: '#DAA520' }} />
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{t('reports')}</span>
          </button>
          
          <button 
            onClick={() => onNavigate && onNavigate('facturations')}
            className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group"
          >
            <FileText className="w-8 h-8 mb-2" style={{ color: '#DAA520' }} />
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{t('facturations')}</span>
          </button>
          
          <button 
            onClick={() => onNavigate && onNavigate('notesCredit')}
            className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group"
          >
            <CreditCard className="w-8 h-8 mb-2" style={{ color: '#DAA520' }} />
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{t('notesCredit')}</span>
          </button>
          
          <button 
            onClick={() => onNavigate && onNavigate('devis')}
            className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group"
          >
            <FileEdit className="w-8 h-8 mb-2" style={{ color: '#DAA520' }} />
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{t('devis')}</span>
          </button>
          
          <button 
            onClick={() => onNavigate && onNavigate('proforma')}
            className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group"
          >
            <Grid3X3 className="w-8 h-8 mb-2" style={{ color: '#DAA520' }} />
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{t('proforma')}</span>
          </button>
          
          <button 
            onClick={() => onNavigate && onNavigate('drivers')}
            className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group"
          >
            <User className="w-8 h-8 mb-2" style={{ color: '#DAA520' }} />
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{t('drivers')}</span>
          </button>
          
          <button 
            onClick={() => onNavigate && onNavigate('clients')}
            className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group"
          >
            <UserCheck className="w-8 h-8 mb-2" style={{ color: '#DAA520' }} />
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{t('clients')}</span>
          </button>
          
          <button 
            onClick={() => onNavigate && onNavigate('compagnie')}
            className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group"
          >
            <Building className="w-8 h-8 mb-2" style={{ color: '#DAA520' }} />
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{t('compagnie')}</span>
          </button>
        </div>
      </div>

      {/* ===== TRIP STATISTICS ===== */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {t('tripStatistics')} ({t('totalToday')} {stats.totalTripsToday})
            </h2>
            <button 
                onClick={handleRefreshRevenue}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh trip statistics"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pending Trips */}
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 mb-4">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#3b82f6"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${stats.totalTripsToday > 0 ? (stats.pendingTripsToday / stats.totalTripsToday) * 314 : 0} 314`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{stats.pendingTripsToday}</div>
                    <div className="text-sm text-gray-500">
                      ({stats.totalTripsToday > 0 ? Math.round((stats.pendingTripsToday / stats.totalTripsToday) * 100) : 0}) %
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 text-center">
                {t('tripsToDoToday')}
              </h3>
            </div>

            {/* Completed Trips */}
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 mb-4">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="60"
                    cy="60"
                    r="50"
                    stroke="#10b981"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray={`${stats.totalTripsToday > 0 ? (stats.completedTripsToday / stats.totalTripsToday) * 314 : 0} 314`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{stats.completedTripsToday}</div>
                    <div className="text-sm text-gray-500">
                      ({stats.totalTripsToday > 0 ? Math.round((stats.completedTripsToday / stats.totalTripsToday) * 100) : 0}) %
                    </div>
                  </div>
                </div>
              </div>
              <h3 className="text-lg font-medium text-gray-900 text-center">
                {t('tripsCompleted')}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* ===== TRIPS TABLE ===== */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {t('trips')} - {showAllTrips ? 'All Dates' : selectedDate}
            </h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value)
                    setShowAllTrips(false)
                  }}
                  disabled={showAllTrips}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
                <button
                  onClick={handleTodayClick}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                  title="Go to today"
                >
                  Today
                </button>
              </div>
              <button
                onClick={() => setShowAllTrips(!showAllTrips)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  showAllTrips 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {showAllTrips ? 'Show Today' : 'Show All'}
              </button>
              <button
                onClick={handleRefreshTrips}
                className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                title="Debug trips loading"
              >
                Debug
              </button>
              <button 
                onClick={handleRefreshTrips}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh trips"
                disabled={loadingTrips}
              >
                <RefreshCw className={`w-5 h-5 ${loadingTrips ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Trips Count Summary */}
          <div className="mb-4 flex items-center justify-between bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-600">
                Total: <span className="text-lg font-bold text-gray-900">{filteredTrips.length}</span>
              </span>
              <span className="text-sm font-medium text-gray-600">
                Assigned: <span className="text-lg font-bold text-yellow-600">
                  {filteredTrips.filter(t => t.status === 'assigned').length}
                </span>
              </span>
              <span className="text-sm font-medium text-gray-600">
                Active: <span className="text-lg font-bold text-blue-600">
                  {filteredTrips.filter(t => t.status === 'active').length}
                </span>
              </span>
              <span className="text-sm font-medium text-gray-600">
                Completed: <span className="text-lg font-bold text-green-600">
                  {filteredTrips.filter(t => t.status === 'completed').length}
                </span>
              </span>
            </div>
            <span className="text-sm font-medium text-gray-600">
              Revenue: <span className="text-lg font-bold text-green-600">
                ${filteredTrips.reduce((sum, t) => sum + (t.revenue || 0), 0).toLocaleString()}
              </span>
            </span>
          </div>

          {/* Trips Table */}
          {loadingTrips ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-gray-500 mt-4">Loading trips...</p>
            </div>
          ) : filteredTrips.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Route
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Driver
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vehicle
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Client
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTrips.map((trip) => (
                    <tr key={trip.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Clock className="w-4 h-4 mr-2 text-gray-400" />
                          {trip.startTime}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-start text-sm">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <div className="text-gray-900 font-medium">{trip.pickup}</div>
                            <div className="text-gray-500 text-xs">→ {trip.destination}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {trip.driver}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Car className="w-4 h-4 mr-2 text-gray-400" />
                          {trip.vehicle}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {trip.client}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(trip.status)}`}>
                          {trip.status === 'completed' ? t('completedStatus') : 
                           trip.status === 'active' ? t('activeStatus') : 
                           trip.status === 'assigned' ? t('assignedStatus') : trip.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium text-green-600">
                        ${trip.revenue?.toLocaleString() || 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No trips found</h3>
              <p className="text-gray-600">
                {showAllTrips 
                  ? 'No trips found in the system. Create your first trip!' 
                  : `There are no trips scheduled for ${selectedDate}`
                }
              </p>
              <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => onNavigate && onNavigate('trips')}
                  className="btn-primary"
                >
                  Create Trip
                </button>
                {!showAllTrips && trips.length > 0 && (
                  <button
                    onClick={() => setShowAllTrips(true)}
                    className="btn-secondary"
                  >
                    View All Trips ({trips.length})
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== REVENUE CHART ===== */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">{t('revenueChart')}</h2>
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => {
                  console.log('📊 Dashboard: Manual revenue chart refresh triggered')
                  console.log('📊 Dashboard: Current trips count:', trips.length)
                  loadDashboardData(trips)
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Refresh revenue data"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Maximize2 className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="mb-4">
            {/* Chart Title */}
            <div className="flex items-center justify-between mb-6 pt-2">
              <h3 className="text-lg font-medium text-gray-900">Tableau des combinaisons</h3>
              <div className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium">
                Chiffre d'affaire
              </div>
            </div>
            
            {/* Revenue Chart */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              {/* Chart Legend */}
              <div className="flex flex-wrap justify-center gap-6 mb-6 text-sm">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-400 rounded-full mr-2"></div>
                  <span>Number of Trips</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-600 rounded-full mr-2"></div>
                  <span>Revenue (€)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                  <span>Unpaid Invoices (€)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-0.5 bg-orange-500 rounded mr-2"></div>
                  <span>Average Trip Price (€)</span>
                </div>
              </div>

              {/* No Data Message */}
              {revenueData.every(month => month.trips === 0 && month.revenue === 0 && month.unpaid === 0) && (
                <div className="text-center py-12">
                  <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Revenue Data</h3>
                  <p className="text-gray-600">No trips found for the last 5 months. Create some trips to see the revenue chart.</p>
                </div>
              )}

              {/* Chart - Only show if there's data */}
              {revenueData.some(month => month.trips > 0 || month.revenue > 0 || month.unpaid > 0) && (
                <>
                  {/* Chart Container */}
              <div className="relative">
                {/* Y-Axis Label */}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -rotate-90 text-xs text-gray-600 font-medium">
                  Values
                </div>
                
                {/* Chart Area */}
                <div className="ml-16 mr-4">
                  <div className="relative h-80 bg-white rounded border overflow-hidden pt-4 pb-2">
                    {/* Y-Axis Labels and Grid Lines Combined */}
                    <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-gray-600">
                      {[120, 100, 80, 60, 40, 20, 0].map((value, index) => (
                        <div key={value} className="relative flex items-center justify-between w-full">
                          <span className="relative z-10 bg-white px-1">{value}</span>
                          <div className="absolute top-1/2 left-12 right-0 border-t border-gray-200 transform -translate-y-1/2"></div>
                        </div>
                      ))}
                    </div>

                    {/* Chart Bars and Line */}
                    <div className="absolute inset-0 flex items-end justify-between px-6 pt-4">
                      {revenueData.map((month, index) => {
                        // Scale data to match chart (0-12 range) with realistic limits
                        // Number of Trips - scale to 0-12 range (max 120 trips = 100%)
                        const tripsHeight = Math.min((month.trips / 120) * 100, 100) // Max 120 trips = 100%
                        
                        // Revenue - scale to 0-12 range (max 12k revenue = 100%)
                        const revenueHeight = Math.min((month.revenue / 12000) * 100, 100) // Max 12k = 100%
                        
                        // Unpaid Invoices - scale to 0-12 range (max 12k unpaid = 100%)
                        const unpaidHeight = Math.min((month.unpaid / 12000) * 100, 100) // Max 12k = 100%
                        
                        // Average Trip Price - scale to 0-12 range (max 1200 avg price = 100%)
                        const avgPrice = month.trips > 0 ? (month.revenue / month.trips) : 0
                        const linePosition = Math.min((avgPrice / 1200) * 100, 100) // Max 1200 = 100%

                        return (
                          <div key={index} className="flex-1 flex flex-col items-center justify-end h-full relative">
                            {/* Bars Group */}
                            <div className="flex items-end justify-center w-full h-full relative mb-2">
                              {/* Trips Bar (Light Blue) */}
                              <div 
                                className="w-3 bg-blue-400 rounded-t mr-0.5"
                                style={{ height: `${tripsHeight}%` }}
                                title={`Number of Trips: ${month.trips}`}
                              ></div>
                              
                              {/* Revenue Bar (Dark Blue) */}
                              <div 
                                className="w-3 bg-blue-600 rounded-t mr-0.5"
                                style={{ height: `${revenueHeight}%` }}
                                title={`Revenue: €${month.revenue.toLocaleString()}`}
                              ></div>
                              
                              {/* Unpaid Bar (Green) */}
                              <div 
                                className="w-3 bg-green-500 rounded-t"
                                style={{ height: `${unpaidHeight}%` }}
                                title={`Unpaid Invoices: €${month.unpaid.toLocaleString()}`}
                              ></div>
                            </div>

                            {/* Average Price Line (Orange) with circular marker */}
                            {avgPrice > 0 && (
                              <div className="absolute inset-0 flex items-end justify-center">
                                <div 
                                  className="relative"
                                  style={{ height: `${linePosition}%` }}
                                >
                                  <div className="w-3 h-3 bg-orange-500 rounded-full border-2 border-white shadow-sm"></div>
                                  <div className="absolute left-1/2 transform -translate-x-1/2 w-16 h-0.5 bg-orange-500 top-0"></div>
                                </div>
                              </div>
                            )}

                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Month Names */}
                <div className="flex justify-between px-6 mt-2">
                  {revenueData.map((month, index) => (
                    <div key={index} className="flex-1 text-center">
                      <div className="text-xs text-gray-600 font-medium">
                        {month.month}
                      </div>
                    </div>
                  ))}
                </div>

                {/* X-Axis Label */}
                <div className="text-center text-xs text-gray-600 mt-4">
                  <span>Months</span>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {revenueData.reduce((sum, m) => sum + m.trips, 0).toFixed(0)}
                  </div>
                  <div className="text-gray-600">Total Trips</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-700">
                    €{revenueData.reduce((sum, m) => sum + m.revenue, 0).toLocaleString()}
                  </div>
                  <div className="text-gray-600">Total Revenue</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    €{revenueData.reduce((sum, m) => sum + m.unpaid, 0).toLocaleString()}
                  </div>
                  <div className="text-gray-600">Unpaid Invoices</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    €{revenueData.length > 0 ? (revenueData.reduce((sum, m) => sum + m.avgPrice, 0) / revenueData.length).toFixed(0) : 0}
                  </div>
                  <div className="text-gray-600">Average Trip Price</div>
                </div>
              </div>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>CRM powered by Rankiwisy</span>
            <span>Highcharts.com</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
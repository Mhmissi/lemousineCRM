import { useState, useEffect } from 'react'
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
  Clock,
  CheckCircle,
  MapPin,
  Users,
  Euro
} from 'lucide-react'

function Dashboard({ onNavigate }) {
  const { t } = useLanguage()
  const [stats, setStats] = useState({
    totalTripsToday: 0,
    completedTripsToday: 0,
    pendingTripsToday: 0
  })

  const [todayTrips, setTodayTrips] = useState([])
  const [revenueData, setRevenueData] = useState([])

  useEffect(() => {
    // Mock data - in real app, this would fetch from API
    const mockStats = {
      totalTripsToday: 0,
      completedTripsToday: 0,
      pendingTripsToday: 0
    }

    const mockTodayTrips = []

    const mockRevenueData = [
      { month: 'Mai', trips: 0, revenue: 0, unpaid: 0, avgPrice: 0 },
      { month: 'Juin', trips: 0, revenue: 0, unpaid: 0, avgPrice: 0 },
      { month: 'Juillet', trips: 0, revenue: 0, unpaid: 0, avgPrice: 0 },
      { month: 'Août', trips: 0, revenue: 0, unpaid: 0, avgPrice: 0 },
      { month: 'Septembre', trips: 0, revenue: 0, unpaid: 0, avgPrice: 0 }
    ]

    setTimeout(() => {
      setStats(mockStats)
      setTodayTrips(mockTodayTrips)
      setRevenueData(mockRevenueData)
    }, 500)
  }, [])

  return (
    <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 min-h-screen pb-20 lg:pb-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t('dashboardTitle')}</h1>
      </div>

      {/* Quick Access Buttons */}
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
            <Users className="w-8 h-8 mb-2" style={{ color: '#DAA520' }} />
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{t('clients')}</span>
          </button>
          
          <button 
            onClick={() => onNavigate && onNavigate('profils')}
            className="flex flex-col items-center p-4 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group"
          >
            <UserCheck className="w-8 h-8 mb-2" style={{ color: '#DAA520' }} />
            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{t('profils')}</span>
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

      {/* Trip Statistics Section */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              {t('tripStatistics')} ({t('totalToday')} {stats.totalTripsToday})
            </h2>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
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
                    strokeDasharray={`${(stats.pendingTripsToday / Math.max(stats.totalTripsToday, 1)) * 314} 314`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">0.00</div>
                    <div className="text-sm text-gray-500">(0) %</div>
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
                    strokeDasharray={`${(stats.completedTripsToday / Math.max(stats.totalTripsToday, 1)) * 314} 314`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">0.00</div>
                    <div className="text-sm text-gray-500">(0) %</div>
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

      {/* Today's Trips Section */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {t('todaysTrips')} ({t('total')}: {stats.totalTripsToday})
            </h2>
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <RefreshCw className="w-5 h-5" />
            </button>
            </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('time')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('driver')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('departure')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('destination')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('passengers')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('client')}</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('payment')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {todayTrips.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      {t('noTripsToday')}
                    </td>
                  </tr>
                ) : (
                  todayTrips.map((trip) => (
                    <tr key={trip.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trip.time}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trip.driver}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trip.departure}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trip.destination}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trip.passengers}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trip.client}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trip.payment}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Revenue Chart Section */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">{t('revenueChart')}</h2>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <RefreshCw className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Maximize2 className="w-5 h-5" />
            </button>
          </div>
                  </div>
          
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Tableau des combinaisons</h3>
            
            {/* Chart Placeholder */}
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <div className="flex items-center justify-center mb-4">
                <BarChart3 className="w-12 h-12 text-gray-400" />
                  </div>
              <p className="text-gray-500 mb-2">Graphique des revenus</p>
              <div className="text-xs text-gray-400">
                <p>Courses *100 (Barres bleues)</p>
                <p>{t('revenueAmount')} *1000 € (Barres violettes)</p>
                <p>Factures impayées (Barres vertes)</p>
                <p>Prix moyen d'une course * 10 (Ligne orange)</p>
                </div>
              <div className="mt-4 text-xs text-gray-400">
                <p>Mois: Mai, Juin, Juillet, Août, Septembre</p>
                </div>
          </div>
        </div>

          <div className="text-right text-xs text-gray-400">
            CRM powered by Rankiwisy
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

import { useState, useEffect } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { BarChart3, TrendingUp, Calendar, Download, Filter } from 'lucide-react'

function Reports() {
  const { t } = useLanguage()
  const [reports, setReports] = useState({
    revenue: {
      today: 2450,
      thisWeek: 15420,
      thisMonth: 45250,
      lastMonth: 38900
    },
    trips: {
      completed: 148,
      active: 8,
      cancelled: 2
    },
    topDrivers: [
      { name: 'John Driver', trips: 45, revenue: 12500 },
      { name: 'Mike Wilson', trips: 32, revenue: 8900 },
      { name: 'Sarah Johnson', trips: 28, revenue: 7800 }
    ],
    vehicleUtilization: [
      { vehicle: 'Bus #12', utilization: 85, revenue: 15000 },
      { vehicle: 'Limousine #5', utilization: 92, revenue: 12000 },
      { vehicle: 'Bus #8', utilization: 78, revenue: 9500 }
    ]
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data loading
    setTimeout(() => {
      setLoading(false)
    }, 500)
  }, [])

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
            <h1 className="text-2xl font-bold text-gray-900">{t('reports')}</h1>
            <p className="text-gray-600">{t('analyticsPerformanceInsights')}</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-2">
            <button 
              onClick={() => alert('Filter functionality would open filter options')}
              className="btn-secondary flex items-center"
            >
              <Filter className="w-4 h-4 mr-2" />
              {t('filter')}
            </button>
            <button 
              onClick={() => alert('Exporting reports...')}
              className="btn-primary flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              {t('export')}
            </button>
          </div>
        </div>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('todaysRevenue')}</p>
              <p className="text-2xl font-bold text-gray-900">${reports.revenue.today.toLocaleString()}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <span className="text-green-600">+12.5%</span>
              <span className="text-gray-600 ml-2">{t('vsYesterday')}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('thisWeek')}</p>
              <p className="text-2xl font-bold text-gray-900">${reports.revenue.thisWeek.toLocaleString()}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <span className="text-green-600">+8.2%</span>
              <span className="text-gray-600 ml-2">{t('vsLastWeek')}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('thisMonth')}</p>
              <p className="text-2xl font-bold text-gray-900">${reports.revenue.thisMonth.toLocaleString()}</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-center text-sm">
              <span className="text-green-600">+16.3%</span>
              <span className="text-gray-600 ml-2">{t('vsLastMonth')}</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('lastMonth')}</p>
              <p className="text-2xl font-bold text-gray-900">${reports.revenue.lastMonth.toLocaleString()}</p>
            </div>
            <div className="p-2 bg-gray-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Trip Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('tripStatistics')}</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="font-medium text-gray-900">{t('completedTrips')}</span>
              </div>
              <span className="text-xl font-bold text-green-600">{reports.trips.completed}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="font-medium text-gray-900">{t('activeTrips')}</span>
              </div>
              <span className="text-xl font-bold text-blue-600">{reports.trips.active}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="font-medium text-gray-900">{t('cancelledTrips')}</span>
              </div>
              <span className="text-xl font-bold text-red-600">{reports.trips.cancelled}</span>
            </div>
          </div>
        </div>

        {/* Top Drivers */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('topPerformingDrivers')}</h3>
          <div className="space-y-4">
            {reports.topDrivers.map((driver, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-white">
                      {driver.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{driver.name}</p>
                    <p className="text-sm text-gray-600">{driver.trips} {t('trips')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${driver.revenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">{t('revenue')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vehicle Utilization */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('vehicleUtilizationRevenue')}</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('vehicle')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('utilization')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('revenue')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('performance')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.vehicleUtilization.map((vehicle, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                        <BarChart3 className="w-4 h-4 text-primary-600" />
                      </div>
                      <span className="font-medium text-gray-900">{vehicle.vehicle}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-3">
                        <div 
                          className="bg-primary-600 h-2 rounded-full" 
                          style={{ width: `${vehicle.utilization}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{vehicle.utilization}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">${vehicle.revenue.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      vehicle.utilization >= 90 ? 'bg-green-100 text-green-800' :
                      vehicle.utilization >= 75 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {vehicle.utilization >= 90 ? t('excellent') :
                       vehicle.utilization >= 75 ? t('good') : t('needsAttention')}
                    </span>
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

export default Reports

import { useState, useEffect } from 'react'
import { firestoreService } from '../services/firestoreService'
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Database, Users, Car, MapPin, Building, FileText, FileEdit } from 'lucide-react'

function FirebaseDataChecker() {
  const [loading, setLoading] = useState(false)
  const [dataStatus, setDataStatus] = useState({})
  const [connectionStatus, setConnectionStatus] = useState('checking')
  const [lastChecked, setLastChecked] = useState(null)

  const checkFirebaseData = async () => {
    setLoading(true)
    setConnectionStatus('checking')
    
    try {
      console.log('🔍 Checking Firebase data...')
      
      // Test Firebase connection and get all data
      const [drivers, vehicles, trips, clients, companies, brands, invoices, creditNotes] = await Promise.all([
        firestoreService.getDrivers(),
        firestoreService.getVehicles(),
        firestoreService.getTrips(),
        firestoreService.getClients(),
        firestoreService.getCompanies(),
        firestoreService.getBrands(),
        firestoreService.getInvoices(),
        firestoreService.getCreditNotes()
      ])

      console.log('📊 Firebase data retrieved:', {
        drivers: drivers.length,
        vehicles: vehicles.length,
        trips: trips.length,
        clients: clients.length,
        companies: companies.length,
        brands: brands.length,
        invoices: invoices.length,
        creditNotes: creditNotes.length
      })

      setDataStatus({
        drivers: {
          count: drivers.length,
          data: drivers.slice(0, 3), // Show first 3 items
          status: drivers.length > 0 ? 'success' : 'warning'
        },
        vehicles: {
          count: vehicles.length,
          data: vehicles.slice(0, 3),
          status: vehicles.length > 0 ? 'success' : 'warning'
        },
        trips: {
          count: trips.length,
          data: trips.slice(0, 3),
          status: trips.length > 0 ? 'success' : 'warning'
        },
        clients: {
          count: clients.length,
          data: clients.slice(0, 3),
          status: clients.length > 0 ? 'success' : 'warning'
        },
        companies: {
          count: companies.length,
          data: companies.slice(0, 3),
          status: companies.length > 0 ? 'success' : 'warning'
        },
        brands: {
          count: brands.length,
          data: brands.slice(0, 3),
          status: brands.length > 0 ? 'success' : 'warning'
        },
        invoices: {
          count: invoices.length,
          data: invoices.slice(0, 3),
          status: invoices.length > 0 ? 'success' : 'warning'
        },
        creditNotes: {
          count: creditNotes.length,
          data: creditNotes.slice(0, 3),
          status: creditNotes.length > 0 ? 'success' : 'warning'
        }
      })

      setConnectionStatus('connected')
      setLastChecked(new Date().toLocaleTimeString())
      
    } catch (error) {
      console.error('❌ Firebase connection error:', error)
      setConnectionStatus('error')
      setDataStatus({})
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkFirebaseData()
  }, [])

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getCollectionIcon = (collection) => {
    switch (collection) {
      case 'drivers':
        return <Users className="w-5 h-5" />
      case 'vehicles':
        return <Car className="w-5 h-5" />
      case 'trips':
        return <MapPin className="w-5 h-5" />
      case 'clients':
        return <Users className="w-5 h-5" />
      case 'companies':
        return <Building className="w-5 h-5" />
      case 'brands':
        return <FileText className="w-5 h-5" />
      case 'invoices':
        return <FileText className="w-5 h-5" />
      case 'creditNotes':
        return <FileEdit className="w-5 h-5" />
      default:
        return <Database className="w-5 h-5" />
    }
  }

  const totalCollections = Object.keys(dataStatus).length
  const collectionsWithData = Object.values(dataStatus).filter(item => item.count > 0).length
  const emptyCollections = totalCollections - collectionsWithData

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Database className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Firebase Data Status</h1>
              <p className="text-gray-600">Real-time check of your Firestore database</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                connectionStatus === 'connected' ? 'bg-green-100 text-green-800' :
                connectionStatus === 'error' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {connectionStatus === 'connected' ? <CheckCircle className="w-4 h-4 mr-1" /> :
                 connectionStatus === 'error' ? <XCircle className="w-4 h-4 mr-1" /> :
                 <RefreshCw className="w-4 h-4 mr-1 animate-spin" />}
                {connectionStatus === 'connected' ? 'Connected' :
                 connectionStatus === 'error' ? 'Connection Error' :
                 'Checking...'}
              </div>
              {lastChecked && (
                <p className="text-xs text-gray-500 mt-1">Last checked: {lastChecked}</p>
              )}
            </div>
            
            <button
              onClick={checkFirebaseData}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Collections</p>
                <p className="text-2xl font-bold text-blue-900">{totalCollections}</p>
              </div>
              <Database className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">With Data</p>
                <p className="text-2xl font-bold text-green-900">{collectionsWithData}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-600">Empty</p>
                <p className="text-2xl font-bold text-yellow-900">{emptyCollections}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Object.values(dataStatus).reduce((sum, item) => sum + item.count, 0)}
                </p>
              </div>
              <FileText className="w-8 h-8 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Collection Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(dataStatus).map(([collection, info]) => (
            <div key={collection} className={`rounded-lg border p-4 ${getStatusColor(info.status)}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getCollectionIcon(collection)}
                  <h3 className="font-semibold text-gray-900 capitalize">{collection}</h3>
                </div>
                {getStatusIcon(info.status)}
              </div>
              
              <div className="mb-3">
                <div className="text-2xl font-bold text-gray-900">{info.count}</div>
                <div className="text-sm text-gray-600">records</div>
              </div>
              
              {info.count > 0 && info.data && info.data.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-medium text-gray-600 uppercase tracking-wide">Sample Data:</div>
                  {info.data.map((item, index) => (
                    <div key={index} className="text-sm text-gray-700 bg-white bg-opacity-50 p-2 rounded">
                      <div className="font-medium">
                        {item.name || item.company || item.pickup || item.make || item.title || `Record ${index + 1}`}
                      </div>
                      {item.email && <div className="text-xs text-gray-500">{item.email}</div>}
                      {item.status && <div className="text-xs text-gray-500">Status: {item.status}</div>}
                    </div>
                  ))}
                </div>
              )}
              
              {info.count === 0 && (
                <div className="text-sm text-gray-600 bg-white bg-opacity-50 p-3 rounded">
                  No data found. This collection is empty.
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Recommendations */}
        {emptyCollections > 0 && (
          <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-800">Recommendations</h3>
                <p className="text-yellow-700 mt-1">
                  {emptyCollections} collection(s) are empty. Consider:
                </p>
                <ul className="list-disc list-inside text-yellow-700 mt-2 space-y-1">
                  <li>Running the sample data population script</li>
                  <li>Adding data through the application forms</li>
                  <li>Checking if data was properly saved</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {connectionStatus === 'error' && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800">Connection Error</h3>
                <p className="text-red-700 mt-1">
                  Unable to connect to Firebase. Please check:
                </p>
                <ul className="list-disc list-inside text-red-700 mt-2 space-y-1">
                  <li>Firebase configuration is correct</li>
                  <li>Internet connection is working</li>
                  <li>Firebase project is active</li>
                  <li>Firestore rules allow read access</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FirebaseDataChecker

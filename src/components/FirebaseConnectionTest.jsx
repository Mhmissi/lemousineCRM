import { useState, useEffect } from 'react'
import { firestoreService } from '../services/firestoreService'
import { CheckCircle, XCircle, AlertCircle, Loader, Database, Users, Car, MapPin, Building, FileText, CreditCard } from 'lucide-react'

function FirebaseConnectionTest() {
  const [connectionStatus, setConnectionStatus] = useState('checking')
  const [collectionsStatus, setCollectionsStatus] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const collections = [
    { 
      name: 'trips', 
      label: 'Trips', 
      icon: MapPin, 
      description: 'Trip management and scheduling',
      service: 'trips'
    },
    { 
      name: 'drivers', 
      label: 'Drivers', 
      icon: Users, 
      description: 'Driver information and management',
      service: 'drivers'
    },
    { 
      name: 'vehicles', 
      label: 'Vehicles', 
      icon: Car, 
      description: 'Fleet management and vehicle tracking',
      service: 'vehicles'
    },
    { 
      name: 'clients', 
      label: 'Clients', 
      icon: Users, 
      description: 'Client information and relationships',
      service: 'clients'
    },
    { 
      name: 'companies', 
      label: 'Companies', 
      icon: Building, 
      description: 'Company profiles and information',
      service: 'companies'
    },
    { 
      name: 'brands', 
      label: 'Brands', 
      icon: Building, 
      description: 'Brand management and status',
      service: 'brands'
    },
    { 
      name: 'users', 
      label: 'Users', 
      icon: Users, 
      description: 'User accounts and authentication',
      service: 'users'
    },
    { 
      name: 'invoices', 
      label: 'Invoices', 
      icon: FileText, 
      description: 'Invoice generation and management',
      service: 'invoices'
    }
  ]

  useEffect(() => {
    testFirebaseConnection()
  }, [])

  const testFirebaseConnection = async () => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('Testing Firebase connection...')
      
      // Test basic connection
      const testConnection = await testBasicConnection()
      if (!testConnection.success) {
        throw new Error(testConnection.error)
      }
      
      setConnectionStatus('connected')
      
      // Test each collection
      const results = {}
      for (const collection of collections) {
        console.log(`Testing ${collection.name} collection...`)
        const result = await testCollection(collection)
        results[collection.name] = result
        setCollectionsStatus({ ...results })
      }
      
      console.log('All tests completed')
      
    } catch (err) {
      console.error('Firebase connection test failed:', err)
      setError(err.message)
      setConnectionStatus('error')
    } finally {
      setLoading(false)
    }
  }

  const testBasicConnection = async () => {
    try {
      // Try to access Firestore
      const testRef = firestoreService.db || firestoreService
      if (!testRef) {
        return { success: false, error: 'Firestore not initialized' }
      }
      
      // Try a simple read operation
      const trips = await firestoreService.getTrips()
      return { success: true, message: 'Connection successful' }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  const testCollection = async (collection) => {
    try {
      const startTime = Date.now()
      
      // Test read operation
      const data = await firestoreService[`get${collection.service.charAt(0).toUpperCase() + collection.service.slice(1)}s`]()
      
      const endTime = Date.now()
      const responseTime = endTime - startTime
      
      return {
        name: collection.name,
        label: collection.label,
        icon: collection.icon,
        description: collection.description,
        status: 'success',
        recordCount: data.length,
        responseTime: responseTime,
        lastRecord: data.length > 0 ? data[0] : null,
        message: `✅ ${data.length} records found (${responseTime}ms)`
      }
    } catch (error) {
      console.error(`Error testing ${collection.name}:`, error)
      return {
        name: collection.name,
        label: collection.label,
        icon: collection.icon,
        description: collection.description,
        status: 'error',
        recordCount: 0,
        responseTime: 0,
        lastRecord: null,
        message: `❌ Error: ${error.message}`
      }
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'checking':
        return <Loader className="w-5 h-5 text-blue-500 animate-spin" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'checking':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getConnectionStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'checking':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const totalRecords = Object.values(collectionsStatus).reduce((sum, collection) => sum + (collection.recordCount || 0), 0)
  const successfulCollections = Object.values(collectionsStatus).filter(c => c.status === 'success').length
  const failedCollections = Object.values(collectionsStatus).filter(c => c.status === 'error').length

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Database className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Firebase Collections Status</h1>
              <p className="text-gray-600">Real-time status of all Firebase collections and tables</p>
            </div>
          </div>
          
          <button
            onClick={testFirebaseConnection}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Testing...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Refresh Status</span>
              </>
            )}
          </button>
        </div>

        {/* Connection Status */}
        <div className={`mb-8 p-6 rounded-lg border ${getConnectionStatusColor(connectionStatus)}`}>
          <div className="flex items-center space-x-3">
            {getStatusIcon(connectionStatus)}
            <div>
              <h3 className="text-xl font-semibold">
                {connectionStatus === 'connected' && 'Firebase Connected Successfully ✅'}
                {connectionStatus === 'error' && 'Firebase Connection Error ❌'}
                {connectionStatus === 'checking' && 'Checking Firebase Connection...'}
              </h3>
              <p className="text-sm opacity-75">
                {connectionStatus === 'connected' && 'All Firebase services are operational'}
                {connectionStatus === 'error' && error}
                {connectionStatus === 'checking' && 'Testing connection to Firebase Firestore...'}
              </p>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        {Object.keys(collectionsStatus).length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="text-3xl font-bold text-blue-600">{collections.length}</div>
              <div className="text-sm text-gray-600">Total Collections</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="text-3xl font-bold text-green-600">{successfulCollections}</div>
              <div className="text-sm text-gray-600">Working</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="text-3xl font-bold text-red-600">{failedCollections}</div>
              <div className="text-sm text-gray-600">Issues</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
              <div className="text-3xl font-bold text-purple-600">{totalRecords}</div>
              <div className="text-sm text-gray-600">Total Records</div>
            </div>
          </div>
        )}

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => {
            const status = collectionsStatus[collection.name]
            const IconComponent = collection.icon
            
            return (
              <div key={collection.name} className={`p-6 rounded-lg border ${getStatusColor(status?.status || 'pending')}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <IconComponent className="w-6 h-6 text-gray-600" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{collection.label}</h3>
                      <p className="text-sm text-gray-600">{collection.description}</p>
                    </div>
                  </div>
                  {status && getStatusIcon(status.status)}
                </div>

                {status ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Records:</span>
                      <span className="font-semibold text-gray-900">{status.recordCount}</span>
                    </div>
                    
                    {status.responseTime > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Response Time:</span>
                        <span className="font-semibold text-gray-900">{status.responseTime}ms</span>
                      </div>
                    )}
                    
                    <div className="text-sm">
                      {status.message}
                    </div>

                    {status.lastRecord && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-gray-500 mb-1">Latest Record:</div>
                        <div className="text-sm font-mono text-gray-700 truncate">
                          {JSON.stringify(status.lastRecord).substring(0, 100)}...
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    {loading ? 'Testing...' : 'Not tested yet'}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Detailed Status Table */}
        {Object.keys(collectionsStatus).length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Detailed Collection Status</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Collection</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Records</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {collections.map((collection) => {
                    const status = collectionsStatus[collection.name]
                    return (
                      <tr key={collection.name}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <collection.icon className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{collection.label}</div>
                              <div className="text-sm text-gray-500">{collection.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {status ? (
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              status.status === 'success' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {status.status === 'success' ? 'Working' : 'Error'}
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {status ? status.recordCount : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {status && status.responseTime > 0 ? `${status.responseTime}ms` : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {status ? status.message : 'Not tested'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FirebaseConnectionTest
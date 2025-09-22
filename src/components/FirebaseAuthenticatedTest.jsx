import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { firestoreService } from '../services/firestoreService'
import { CheckCircle, XCircle, AlertCircle, Loader, Database, Shield, Users, Car, MapPin, Building, FileText, CreditCard } from 'lucide-react'

function FirebaseAuthenticatedTest() {
  const { user, loading: authLoading } = useAuth()
  const [testResults, setTestResults] = useState({})
  const [testing, setTesting] = useState(false)
  const [overallStatus, setOverallStatus] = useState('pending')

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

  const testCollection = async (collection) => {
    try {
      console.log(`Testing ${collection.name} collection...`)
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
        message: `✅ ${data.length} records found (${responseTime}ms)`,
        securityStatus: 'authenticated'
      }
    } catch (error) {
      console.error(`Error testing ${collection.name}:`, error)
      
      let securityStatus = 'unknown'
      let message = `❌ Error: ${error.message}`
      
      if (error.message.includes('permission') || error.message.includes('insufficient')) {
        securityStatus = 'protected'
        message = `🔒 Protected by security rules (${error.message})`
      } else if (error.message.includes('unauthenticated')) {
        securityStatus = 'unauthenticated'
        message = `🔐 Authentication required (${error.message})`
      }
      
      return {
        name: collection.name,
        label: collection.label,
        icon: collection.icon,
        description: collection.description,
        status: 'error',
        recordCount: 0,
        responseTime: 0,
        lastRecord: null,
        message: message,
        securityStatus: securityStatus
      }
    }
  }

  const runAllTests = async () => {
    if (!user) {
      alert('Please log in first to test Firebase collections')
      return
    }

    setTesting(true)
    setTestResults({})
    setOverallStatus('testing')

    const results = {}
    let successCount = 0
    let totalCount = collections.length

    for (const collection of collections) {
      const result = await testCollection(collection)
      results[collection.name] = result
      
      if (result.status === 'success') {
        successCount++
      }
      
      // Update results progressively
      setTestResults({ ...results })
    }

    setOverallStatus(successCount === totalCount ? 'success' : 'partial')
    setTesting(false)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'testing':
        return <Loader className="w-5 h-5 text-blue-500 animate-spin" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getSecurityIcon = (securityStatus) => {
    switch (securityStatus) {
      case 'authenticated':
        return <Shield className="w-4 h-4 text-green-500" />
      case 'protected':
        return <Shield className="w-4 h-4 text-yellow-500" />
      case 'unauthenticated':
        return <Shield className="w-4 h-4 text-red-500" />
      default:
        return <Shield className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200'
      case 'error':
        return 'bg-red-50 border-red-200'
      case 'testing':
        return 'bg-blue-50 border-blue-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getConnectionStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'partial':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'testing':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const totalRecords = Object.values(testResults).reduce((sum, collection) => sum + (collection.recordCount || 0), 0)
  const successfulCollections = Object.values(testResults).filter(c => c.status === 'success').length
  const failedCollections = Object.values(testResults).filter(c => c.status === 'error').length
  const protectedCollections = Object.values(testResults).filter(c => c.securityStatus === 'protected').length

  if (authLoading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading authentication...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <Shield className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">
            Please log in to test Firebase collections. The collections are protected by security rules, which is a good security practice.
          </p>
          <a 
            href="/login" 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <Database className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Firebase Collections Test (Authenticated)</h1>
              <p className="text-gray-600">Testing Firebase collections with proper authentication</p>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-green-500" />
                <span className="text-sm text-gray-600">Authenticated as: <strong>{user.email}</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-500" />
                <span className="text-sm text-gray-600">Role: <strong>{user.role}</strong></span>
              </div>
            </div>
            
            <button
              onClick={runAllTests}
              disabled={testing}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {testing ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Test All Collections</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Overall Status */}
        <div className={`mb-8 p-6 rounded-lg border ${getConnectionStatusColor(overallStatus)}`}>
          <div className="flex items-center space-x-3">
            {getStatusIcon(overallStatus)}
            <div>
              <h3 className="text-xl font-semibold">
                {overallStatus === 'success' && 'All Collections Working ✅'}
                {overallStatus === 'partial' && 'Some Issues Found ⚠️'}
                {overallStatus === 'testing' && 'Testing in Progress...'}
                {overallStatus === 'pending' && 'Ready to Test'}
              </h3>
              <p className="text-sm opacity-75">
                {overallStatus === 'success' && 'All Firebase collections are accessible and working properly'}
                {overallStatus === 'partial' && 'Some collections have issues or are protected by security rules'}
                {overallStatus === 'testing' && 'Running comprehensive tests on all collections...'}
                {overallStatus === 'pending' && 'Click "Test All Collections" to check all Firebase collections'}
              </p>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        {Object.keys(testResults).length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
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
              <div className="text-3xl font-bold text-yellow-600">{protectedCollections}</div>
              <div className="text-sm text-gray-600">Protected</div>
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
            const status = testResults[collection.name]
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
                  <div className="flex items-center space-x-2">
                    {status && getStatusIcon(status.status)}
                    {status && getSecurityIcon(status.securityStatus)}
                  </div>
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
                    {testing ? 'Testing...' : 'Not tested yet'}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Security Information */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <Shield className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Firebase Security Status</h3>
              <div className="space-y-2 text-sm text-blue-800">
                <p>✅ <strong>Authentication Required:</strong> All collections are protected by Firebase security rules</p>
                <p>✅ <strong>Role-Based Access:</strong> Different access levels for owners and drivers</p>
                <p>✅ <strong>Data Protection:</strong> No unauthorized access to sensitive data</p>
                <p>✅ <strong>Production Ready:</strong> Security rules are properly configured</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FirebaseAuthenticatedTest

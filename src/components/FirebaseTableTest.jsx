import { useState, useEffect } from 'react'
import { firestoreService } from '../services/firestoreService'
import { CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react'

function FirebaseTableTest() {
  const [testResults, setTestResults] = useState({})
  const [loading, setLoading] = useState(false)
  const [overallStatus, setOverallStatus] = useState('pending')

  const collections = [
    { name: 'TRIPS', service: 'trips', label: 'Trips' },
    { name: 'DRIVERS', service: 'drivers', label: 'Drivers' },
    { name: 'VEHICLES', service: 'vehicles', label: 'Vehicles' },
    { name: 'CLIENTS', service: 'clients', label: 'Clients' },
    { name: 'COMPANIES', service: 'companies', label: 'Companies' },
    { name: 'BRANDS', service: 'brands', label: 'Brands' },
    { name: 'USERS', service: 'users', label: 'Users' },
    { name: 'INVOICES', service: 'invoices', label: 'Invoices' }
  ]

  const testCollection = async (collection) => {
    try {
      console.log(`Testing ${collection.name} collection...`)
      
      // Test READ operation
      const data = await firestoreService[`get${collection.service.charAt(0).toUpperCase() + collection.service.slice(1)}s`]()
      
      // Test CREATE operation (if service supports it)
      let createResult = null
      try {
        const testData = getTestData(collection.name)
        if (testData) {
          const docRef = await firestoreService[`add${collection.service.charAt(0).toUpperCase() + collection.service.slice(1)}`](testData)
          createResult = { success: true, id: docRef }
          
          // Test UPDATE operation
          try {
            await firestoreService[`update${collection.service.charAt(0).toUpperCase() + collection.service.slice(1)}`](docRef, { 
              ...testData, 
              updatedAt: new Date(),
              testField: 'Updated successfully'
            })
            
            // Test DELETE operation
            await firestoreService[`delete${collection.service.charAt(0).toUpperCase() + collection.service.slice(1)}`](docRef)
          } catch (updateError) {
            console.error(`Update/Delete error for ${collection.name}:`, updateError)
          }
        }
      } catch (createError) {
        console.error(`Create error for ${collection.name}:`, createError)
        createResult = { success: false, error: createError.message }
      }

      return {
        name: collection.name,
        label: collection.label,
        read: { success: true, count: data.length },
        create: createResult,
        status: 'success',
        message: `✅ ${collection.label} collection working properly (${data.length} records)`
      }
    } catch (error) {
      console.error(`Error testing ${collection.name}:`, error)
      return {
        name: collection.name,
        label: collection.label,
        read: { success: false, error: error.message },
        create: null,
        status: 'error',
        message: `❌ ${collection.label} collection error: ${error.message}`
      }
    }
  }

  const getTestData = (collectionName) => {
    const baseData = {
      createdAt: new Date(),
      updatedAt: new Date(),
      testRecord: true
    }

    switch (collectionName) {
      case 'TRIPS':
        return {
          ...baseData,
          driverId: 'test-driver',
          driverName: 'Test Driver',
          vehicleId: 'test-vehicle',
          vehicleName: 'Test Vehicle',
          pickup: 'Test Pickup',
          destination: 'Test Destination',
          date: new Date().toISOString().split('T')[0],
          time: '10:00 - 12:00',
          passengers: 2,
          client: 'Test Client',
          revenue: 100,
          status: 'assigned',
          notes: 'Test trip record'
        }
      case 'DRIVERS':
        return {
          ...baseData,
          name: 'Test Driver',
          email: 'test@driver.com',
          phone: '+32 123 456 789',
          status: 'active',
          licenseNumber: 'TEST123'
        }
      case 'VEHICLES':
        return {
          ...baseData,
          name: 'Test Vehicle',
          type: 'sedan',
          capacity: 4,
          status: 'available',
          licensePlate: 'TEST-123',
          fuelLevel: 80,
          mileage: 10000
        }
      case 'CLIENTS':
        return {
          ...baseData,
          company: 'Test Company',
          address: 'Test Address',
          postalCode: '1000',
          city: 'Test City',
          country: 'Belgium',
          phone: '+32 2 123 4567',
          email: 'test@company.com',
          status: 'active'
        }
      case 'COMPANIES':
        return {
          ...baseData,
          name: 'Test Company',
          address: 'Test Address',
          postalCode: '1000',
          city: 'Test City',
          country: 'Belgium',
          tel: '+32 2 123 4567',
          email: 'test@company.com'
        }
      case 'BRANDS':
        return {
          ...baseData,
          name: 'Test Brand',
          status: 'Activée'
        }
      case 'USERS':
        return {
          ...baseData,
          email: 'test@user.com',
          name: 'Test User',
          role: 'user'
        }
      case 'INVOICES':
        return {
          ...baseData,
          invoiceNumber: 'TEST-001',
          date: new Date().toISOString().split('T')[0],
          clientName: 'Test Client',
          totalExclVat: 100,
          vat: 21,
          totalInclVat: 121,
          status: 'draft'
        }
      default:
        return null
    }
  }

  const runAllTests = async () => {
    setLoading(true)
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
    setLoading(false)
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'testing':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Firebase Collections Test</h1>
              <p className="text-gray-600 mt-2">Testing all Firebase collections and CRUD operations</p>
            </div>
            <button
              onClick={runAllTests}
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
                  <span>Run All Tests</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Overall Status */}
        <div className={`mb-6 p-4 rounded-lg border ${getStatusColor(overallStatus)}`}>
          <div className="flex items-center space-x-3">
            {getStatusIcon(overallStatus)}
            <div>
              <h3 className="font-semibold">
                {overallStatus === 'success' && 'All Collections Working ✅'}
                {overallStatus === 'partial' && 'Some Issues Found ⚠️'}
                {overallStatus === 'testing' && 'Testing in Progress...'}
                {overallStatus === 'pending' && 'Ready to Test'}
              </h3>
              <p className="text-sm opacity-75">
                {overallStatus === 'success' && 'All Firebase collections are working properly'}
                {overallStatus === 'partial' && 'Some collections have issues that need attention'}
                {overallStatus === 'testing' && 'Running comprehensive tests on all collections'}
                {overallStatus === 'pending' && 'Click "Run All Tests" to check all collections'}
              </p>
            </div>
          </div>
        </div>

        {/* Test Results */}
        <div className="space-y-4">
          {collections.map((collection) => {
            const result = testResults[collection.name]
            return (
              <div key={collection.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {result ? getStatusIcon(result.status) : <AlertCircle className="w-5 h-5 text-gray-500" />}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{collection.label}</h3>
                      <p className="text-sm text-gray-600">Collection: {collection.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    {result && (
                      <div className="text-sm">
                        <div className="font-medium">
                          {result.read.success ? (
                            <span className="text-green-600">✅ {result.read.count} records</span>
                          ) : (
                            <span className="text-red-600">❌ Read failed</span>
                          )}
                        </div>
                        {result.create && (
                          <div className="text-xs text-gray-500">
                            {result.create.success ? 'CRUD operations ✅' : 'CRUD failed ❌'}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {result && (
                  <div className="space-y-2">
                    <p className="text-sm">{result.message}</p>
                    
                    {/* Detailed Results */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900 mb-2">Read Operation</h4>
                        {result.read.success ? (
                          <div className="text-green-600 text-sm">
                            ✅ Success - {result.read.count} records found
                          </div>
                        ) : (
                          <div className="text-red-600 text-sm">
                            ❌ Failed - {result.read.error}
                          </div>
                        )}
                      </div>
                      
                      {result.create && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <h4 className="font-medium text-gray-900 mb-2">CRUD Operations</h4>
                          {result.create.success ? (
                            <div className="text-green-600 text-sm">
                              ✅ Create, Update, Delete successful
                            </div>
                          ) : (
                            <div className="text-red-600 text-sm">
                              ❌ Failed - {result.create.error}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Summary */}
        {Object.keys(testResults).length > 0 && (
          <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {Object.values(testResults).filter(r => r.status === 'success').length}
                </div>
                <div className="text-sm text-green-800">Successful</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {Object.values(testResults).filter(r => r.status === 'error').length}
                </div>
                <div className="text-sm text-red-800">Failed</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {Object.values(testResults).reduce((sum, r) => sum + (r.read.count || 0), 0)}
                </div>
                <div className="text-sm text-blue-800">Total Records</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FirebaseTableTest

import { useState } from 'react'
import { firestoreService } from '../services/firestoreService'
import { Database, Plus, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'

function QuickDataSetup() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  const sampleData = {
    drivers: [
      {
        name: 'John Driver',
        email: 'john@limousine.com',
        phone: '+32 2 123 4567',
        status: 'active',
        licenseNumber: 'DL123456',
        hireDate: new Date('2023-01-15'),
        rating: 4.8,
        totalTrips: 156
      },
      {
        name: 'Mike Wilson',
        email: 'mike@limousine.com',
        phone: '+32 2 234 5678',
        status: 'active',
        licenseNumber: 'DL234567',
        hireDate: new Date('2023-02-20'),
        rating: 4.6,
        totalTrips: 142
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah@limousine.com',
        phone: '+32 2 345 6789',
        status: 'active',
        licenseNumber: 'DL345678',
        hireDate: new Date('2023-03-10'),
        rating: 4.7,
        totalTrips: 128
      }
    ],
    vehicles: [
      {
        name: 'Bus #12',
        type: 'Luxury Bus',
        capacity: 25,
        status: 'active',
        currentLocation: 'Downtown',
        fuelLevel: 85,
        mileage: 125000,
        lastService: '2024-01-10',
        nextService: '2024-02-10',
        licensePlate: 'BUS-001',
        year: 2020,
        color: 'White'
      },
      {
        name: 'Limousine #5',
        type: 'Stretch Limo',
        capacity: 8,
        status: 'active',
        currentLocation: 'Airport',
        fuelLevel: 92,
        mileage: 89000,
        lastService: '2024-01-05',
        nextService: '2024-02-05',
        licensePlate: 'LIMO-005',
        year: 2021,
        color: 'Black'
      },
      {
        name: 'Mercedes S-Class',
        type: 'Executive Sedan',
        capacity: 4,
        status: 'active',
        currentLocation: 'Hotel District',
        fuelLevel: 78,
        mileage: 95000,
        lastService: '2024-01-12',
        nextService: '2024-02-12',
        licensePlate: 'MERC-001',
        year: 2022,
        color: 'Silver'
      }
    ],
    clients: [
      {
        company: 'Le Botanique',
        address: 'Rue Royale 236',
        postalCode: '1210',
        city: 'Bruxelles',
        country: 'Belgium',
        phone: '+32 2 123 4567',
        fax: '+32 2 123 4568',
        email: 'contact@botanique.be',
        status: 'Activé',
        contactPerson: 'Marie Dubois',
        vatNumber: 'BE0123456789'
      },
      {
        company: 'ABC Corporation',
        address: '123 Business Street',
        postalCode: '1000',
        city: 'Brussels',
        country: 'Belgium',
        phone: '+32 2 567 8901',
        fax: '+32 2 567 8902',
        email: 'contact@abccorp.com',
        status: 'Activé',
        contactPerson: 'John Smith',
        vatNumber: 'BE9988776655'
      }
    ],
    companies: [
      {
        logo: 'LIMOSTAR',
        name: 'LIMOSTAR',
        address: '65, Avenue Louise',
        postalCode: '1050',
        city: 'Brussels',
        country: 'Belgium',
        tel: '+32 2 512 01 01',
        fax: '+32 2 512 01 02',
        mobile: '+32 478 123 456',
        email: 'info@limostar.be',
        website: 'www.limostar.be',
        vatNumber: 'BE0123456789',
        bankAccount: 'BE68 5390 0754 7034'
      }
    ],
    trips: [
      {
        driver: 'John Driver',
        driverName: 'John Driver',
        vehicle: 'Bus #12',
        pickup: 'Brussels Airport',
        destination: 'Downtown Brussels',
        date: new Date().toISOString().split('T')[0], // Today's date
        startTime: '10:00',
        time: '10:00',
        passengers: 25,
        client: 'Le Botanique',
        clientName: 'Le Botanique',
        revenue: 1250,
        price: 1250,
        status: 'assigned',
        notes: 'Corporate group transfer'
      },
      {
        driver: 'Mike Wilson',
        driverName: 'Mike Wilson',
        vehicle: 'Limousine #5',
        pickup: 'Hotel Plaza',
        destination: 'Brussels Airport',
        date: new Date().toISOString().split('T')[0], // Today's date
        startTime: '14:00',
        time: '14:00',
        passengers: 4,
        client: 'ABC Corporation',
        clientName: 'ABC Corporation',
        revenue: 450,
        price: 450,
        status: 'completed',
        notes: 'VIP airport transfer'
      },
      {
        driver: 'Sarah Johnson',
        driverName: 'Sarah Johnson',
        vehicle: 'Mercedes S-Class',
        pickup: 'Central Station',
        destination: 'Convention Center',
        date: new Date().toISOString().split('T')[0], // Today's date
        startTime: '16:00',
        time: '16:00',
        passengers: 4,
        client: 'ABC Corporation',
        clientName: 'ABC Corporation',
        revenue: 300,
        price: 300,
        status: 'assigned',
        notes: 'Executive transfer'
      },
      {
        driver: 'John Driver',
        driverName: 'John Driver',
        vehicle: 'Bus #12',
        pickup: 'Business District',
        destination: 'Airport',
        date: new Date().toISOString().split('T')[0], // Today's date
        startTime: '18:00',
        time: '18:00',
        passengers: 15,
        client: 'Tech Solutions BV',
        clientName: 'Tech Solutions BV',
        revenue: 750,
        price: 750,
        status: 'active',
        notes: 'Corporate group transfer - in progress'
      }
    ]
  }

  const populateSampleData = async () => {
    setLoading(true)
    setStatus('Starting data population...')
    setError('')

    try {
      let createdCount = 0

      // Create drivers
      setStatus('Creating drivers...')
      for (const driver of sampleData.drivers) {
        await firestoreService.addDriver(driver)
        createdCount++
      }

      // Create vehicles
      setStatus('Creating vehicles...')
      for (const vehicle of sampleData.vehicles) {
        await firestoreService.addVehicle(vehicle)
        createdCount++
      }

      // Create clients
      setStatus('Creating clients...')
      for (const client of sampleData.clients) {
        await firestoreService.addClient(client)
        createdCount++
      }

      // Create companies
      setStatus('Creating companies...')
      for (const company of sampleData.companies) {
        await firestoreService.addCompany(company)
        createdCount++
      }

      // Create trips with today's date in YYYY-MM-DD format (Firebase format)
      setStatus('Creating trips...')
      const todayYYYYMMDD = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
      console.log('📅 Creating trips for today\'s date:', todayYYYYMMDD)
      
      for (const trip of sampleData.trips) {
        // Update trip date to today's date in YYYY-MM-DD format
        const tripWithTodayDate = {
          ...trip,
          date: todayYYYYMMDD
        }
        console.log('🚗 Creating trip:', tripWithTodayDate.client, 'for date:', tripWithTodayDate.date)
        await firestoreService.addTrip(tripWithTodayDate)
        createdCount++
      }

      setStatus(`✅ Successfully created ${createdCount} records!`)
      
    } catch (error) {
      console.error('Error populating data:', error)
      setError(`❌ Failed to populate data: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const checkDataStatus = async () => {
    setLoading(true)
    setStatus('Checking data status...')
    setError('')

    try {
      const [drivers, vehicles, trips, clients, companies] = await Promise.all([
        firestoreService.getDrivers(),
        firestoreService.getVehicles(),
        firestoreService.getTrips(),
        firestoreService.getClients(),
        firestoreService.getCompanies()
      ])

      const totalRecords = drivers.length + vehicles.length + trips.length + clients.length + companies.length
      
      setStatus(`📊 Current data: ${drivers.length} drivers, ${vehicles.length} vehicles, ${trips.length} trips, ${clients.length} clients, ${companies.length} companies (${totalRecords} total records)`)
      
    } catch (error) {
      console.error('Error checking data:', error)
      setError(`❌ Failed to check data: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <Database className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Quick Data Setup</h1>
            <p className="text-gray-600">Populate your Firebase database with sample data</p>
          </div>
        </div>

        {/* Status Messages */}
        {(status || error) && (
          <div className={`p-4 rounded-lg mb-6 ${
            status.includes('✅') ? 'bg-green-50 border border-green-200' : 
            error.includes('❌') ? 'bg-red-50 border border-red-200' :
            'bg-yellow-50 border border-yellow-200'
          }`}>
            <p className={`font-medium ${
              status.includes('✅') ? 'text-green-800' :
              error.includes('❌') ? 'text-red-800' :
              'text-yellow-800'
            }`}>
              {status || error}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={checkDataStatus}
            disabled={loading}
            className="flex items-center justify-center space-x-2 p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            <span>Check Current Data</span>
          </button>

          <button
            onClick={populateSampleData}
            disabled={loading}
            className="flex items-center justify-center space-x-2 p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-5 h-5" />
            <span>Add Sample Data</span>
          </button>
        </div>

        {/* Sample Data Preview */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sample Data Preview</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="font-medium">Drivers</span>
              </div>
              <div className="text-sm text-gray-600">{sampleData.drivers.length} drivers</div>
            </div>
            
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="font-medium">Vehicles</span>
              </div>
              <div className="text-sm text-gray-600">{sampleData.vehicles.length} vehicles</div>
            </div>
            
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="font-medium">Clients</span>
              </div>
              <div className="text-sm text-gray-600">{sampleData.clients.length} clients</div>
            </div>
            
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="font-medium">Companies</span>
              </div>
              <div className="text-sm text-gray-600">{sampleData.companies.length} companies</div>
            </div>

            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="font-medium">Trips (Today)</span>
              </div>
              <div className="text-sm text-gray-600">{sampleData.trips.length} trips</div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-800">Instructions</h3>
              <p className="text-blue-700 mt-1">
                Use this tool to quickly populate your Firebase database with sample data. 
                This will help you test the application functionality and see how data flows through the system.
              </p>
              <ul className="list-disc list-inside text-blue-700 mt-2 space-y-1">
                <li>Click "Check Current Data" to see what's already in your database</li>
                <li>Click "Add Sample Data" to populate with test data</li>
                <li>Navigate to other sections to see the data in action</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QuickDataSetup
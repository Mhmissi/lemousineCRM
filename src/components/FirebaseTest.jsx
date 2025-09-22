import { useState, useEffect } from 'react';
import { firestoreService } from '../services/firestoreService';
import { populateFirestore } from '../scripts/populateSampleData';

function FirebaseTest() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [data, setData] = useState({
    trips: [],
    drivers: [],
    vehicles: [],
    clients: [],
    companies: [],
    brands: []
  });

  const testConnection = async () => {
    setLoading(true);
    setStatus('Testing Firestore connection...');

    try {
      // Test reading from each collection
      const [trips, drivers, vehicles, clients, companies, brands] = await Promise.all([
        firestoreService.getTrips(),
        firestoreService.getDrivers(),
        firestoreService.getVehicles(),
        firestoreService.getClients(),
        firestoreService.getCompanies(),
        firestoreService.getBrands()
      ]);

      setData({
        trips,
        drivers,
        vehicles,
        clients,
        companies,
        brands
      });

      setStatus(`✅ Connection successful! Found ${trips.length} trips, ${drivers.length} drivers, ${vehicles.length} vehicles, ${clients.length} clients, ${companies.length} companies, ${brands.length} brands`);
    } catch (error) {
      console.error('Firestore connection error:', error);
      setStatus(`❌ Connection failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const populateData = async () => {
    setLoading(true);
    setStatus('Populating database with sample data...');

    try {
      await populateFirestore();
      setStatus('✅ Database populated successfully!');
      // Refresh data after populating
      setTimeout(testConnection, 1000);
    } catch (error) {
      console.error('Population error:', error);
      setStatus(`❌ Population failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createSampleTrip = async () => {
    setLoading(true);
    setStatus('Creating sample trip...');

    try {
      const tripData = {
        pickup: 'Test Pickup Location',
        destination: 'Test Destination',
        date: '2024-01-20',
        startTime: '10:00',
        endTime: '12:00',
        status: 'assigned',
        passengers: 4,
        revenue: 300,
        client: 'Test Client',
        clientPhone: '+32 123 456 789',
        notes: 'Test trip created from Firebase test component'
      };

      const tripId = await tripsService.createTrip(tripData);
      setStatus(`✅ Sample trip created with ID: ${tripId}`);
      
      // Refresh trips data
      const trips = await tripsService.getAllTrips();
      setData(prev => ({ ...prev, trips }));
    } catch (error) {
      console.error('Create trip error:', error);
      setStatus(`❌ Create trip failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Firebase Firestore Test</h1>
        
        <div className="space-y-4">
          {/* Status */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Status:</h3>
            <p className="text-sm text-gray-600">{status}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <button
              onClick={testConnection}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Testing...' : 'Test Connection'}
            </button>

            <button
              onClick={populateData}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Populating...' : 'Populate Sample Data'}
            </button>

            <button
              onClick={createSampleTrip}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Sample Trip'}
            </button>
          </div>

          {/* Data Summary */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{data.trips.length}</div>
              <div className="text-sm text-blue-700">Trips</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{data.drivers.length}</div>
              <div className="text-sm text-green-700">Drivers</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-yellow-600">{data.vehicles.length}</div>
              <div className="text-sm text-yellow-700">Vehicles</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-600">{data.clients.length}</div>
              <div className="text-sm text-red-700">Clients</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">{data.companies.length}</div>
              <div className="text-sm text-purple-700">Companies</div>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-indigo-600">{data.brands.length}</div>
              <div className="text-sm text-indigo-700">Brands</div>
            </div>
          </div>

          {/* Sample Data Display */}
          {data.trips.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sample Trips:</h3>
              <div className="space-y-2">
                {data.trips.slice(0, 3).map((trip) => (
                  <div key={trip.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900">
                          {trip.pickup} → {trip.destination}
                        </p>
                        <p className="text-sm text-gray-600">
                          {trip.date} | {trip.startTime} - {trip.endTime} | {trip.passengers} passengers
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        trip.status === 'completed' ? 'bg-green-100 text-green-800' :
                        trip.status === 'ontheway' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {trip.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.drivers.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sample Drivers:</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.drivers.slice(0, 4).map((driver) => (
                  <div key={driver.id} className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium text-gray-900">{driver.name}</p>
                    <p className="text-sm text-gray-600">{driver.email}</p>
                    <p className="text-sm text-gray-600">Phone: {driver.phone}</p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
                      driver.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {driver.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FirebaseTest;

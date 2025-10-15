import { useState } from 'react';
import { firestoreService } from '../services/firestoreService';

function FirebaseDebug() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [data, setData] = useState({});

  const testDriverCreation = async () => {
    setLoading(true);
    setStatus('Testing driver creation...');
    setError('');

    try {
      const driverData = {
        name: 'Test Driver',
        email: 'test@limousine.com',
        phone: '+32 2 999 9999',
        active: true,
        status: 'active'
      };

      const driverId = await firestoreService.addDriver(driverData);
      setStatus(`✅ Driver created successfully with ID: ${driverId}`);
      
      // Get the created driver to verify
      const drivers = await firestoreService.getDrivers();
      setData(prev => ({ ...prev, drivers }));
      
    } catch (error) {
      console.error('Driver creation error:', error);
      setError(`❌ Driver creation failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testVehicleCreation = async () => {
    setLoading(true);
    setStatus('Testing vehicle creation...');
    setError('');

    try {
      const vehicleData = {
        name: 'Test Vehicle',
        type: 'Test Car',
        capacity: 4,
        status: 'active',
        currentLocation: 'Test Location',
        fuelLevel: 80,
        mileage: 50000,
        lastService: '2024-01-01',
        nextService: '2024-02-01'
      };

      const vehicleId = await firestoreService.addVehicle(vehicleData);
      setStatus(`✅ Vehicle created successfully with ID: ${vehicleId}`);
      
      // Get the created vehicle to verify
      const vehicles = await firestoreService.getVehicles();
      setData(prev => ({ ...prev, vehicles }));
      
    } catch (error) {
      console.error('Vehicle creation error:', error);
      setError(`❌ Vehicle creation failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testTripCreation = async () => {
    setLoading(true);
    setStatus('Testing trip creation...');
    setError('');

    try {
      // Get existing drivers and vehicles
      const [drivers, vehicles] = await Promise.all([
        firestoreService.getDrivers(),
        firestoreService.getVehicles()
      ]);

      if (drivers.length === 0) {
        throw new Error('No drivers available. Create a driver first.');
      }
      if (vehicles.length === 0) {
        throw new Error('No vehicles available. Create a vehicle first.');
      }

      const tripData = {
        pickup: 'Test Pickup Location',
        destination: 'Test Destination',
        date: '2024-01-20',
        time: '10:00 - 12:00',
        status: 'assigned',
        passengers: 4,
        revenue: 300,
        client: 'Test Client',
        notes: 'Test trip',
        driverId: drivers[0].id,
        vehicleId: vehicles[0].id
      };

      const tripId = await firestoreService.addTrip(tripData);
      setStatus(`✅ Trip created successfully with ID: ${tripId}`);
      
      // Get the created trip to verify
      const trips = await firestoreService.getTrips();
      setData(prev => ({ ...prev, trips }));
      
    } catch (error) {
      console.error('Trip creation error:', error);
      setError(`❌ Trip creation failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadAllData = async () => {
    setLoading(true);
    setStatus('Loading all data...');
    setError('');

    try {
      const [drivers, vehicles, trips, clients, companies, brands] = await Promise.all([
        firestoreService.getDrivers(),
        firestoreService.getVehicles(),
        firestoreService.getTrips(),
        firestoreService.getClients(),
        firestoreService.getCompanies(),
        firestoreService.getBrands()
      ]);

      setData({ drivers, vehicles, trips, clients, companies, brands });
      setStatus('✅ All data loaded successfully!');
      
    } catch (error) {
      console.error('Load data error:', error);
      setError(`❌ Failed to load data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearAllData = async () => {
    setLoading(true);
    setStatus('Clearing all data...');
    setError('');

    try {
      const [trips, drivers, vehicles, clients, companies, brands] = await Promise.all([
        firestoreService.getTrips(),
        firestoreService.getDrivers(),
        firestoreService.getVehicles(),
        firestoreService.getClients(),
        firestoreService.getCompanies(),
        firestoreService.getBrands()
      ]);

      const deletePromises = [
        ...trips.map(trip => firestoreService.deleteTrip(trip.id)),
        ...drivers.map(driver => firestoreService.deleteDriver(driver.id)),
        ...vehicles.map(vehicle => firestoreService.deleteVehicle(vehicle.id)),
        ...clients.map(client => firestoreService.deleteClient(client.id)),
        ...companies.map(company => firestoreService.deleteCompany(company.id)),
        ...brands.map(brand => firestoreService.deleteBrand(brand.id))
      ];

      await Promise.all(deletePromises);
      setData({});
      setStatus('✅ All data cleared successfully!');
      
    } catch (error) {
      console.error('Clear data error:', error);
      setError(`❌ Failed to clear data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">🔧 Firebase Debug Tool</h1>
        
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

        {/* Test Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <button
            onClick={testDriverCreation}
            disabled={loading}
            className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🚗 Test Driver Creation
          </button>

          <button
            onClick={testVehicleCreation}
            disabled={loading}
            className="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🚙 Test Vehicle Creation
          </button>

          <button
            onClick={testTripCreation}
            disabled={loading}
            className="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🚌 Test Trip Creation
          </button>

          <button
            onClick={loadAllData}
            disabled={loading}
            className="p-4 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            📊 Load All Data
          </button>

          <button
            onClick={clearAllData}
            disabled={loading}
            className="p-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🗑️ Clear All Data
          </button>
        </div>

        {/* Data Display */}
        {Object.keys(data).length > 0 && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Data:</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(data).map(([key, items]) => (
                <div key={key} className="bg-white p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{items.length}</div>
                  <div className="text-sm text-gray-600 capitalize">{key}</div>
                </div>
              ))}
            </div>
            
            {/* Show sample data */}
            {data.drivers && data.drivers.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Sample Driver:</h4>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                  {JSON.stringify(data.drivers[0], null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default FirebaseDebug;










import { useState } from 'react';
import { firestoreService } from '../services/firestoreService';
import { populateFirestore } from '../scripts/populateSampleData';

function QuickDataSetup() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const populateDatabase = async () => {
    setLoading(true);
    setStatus('Populating database with sample data...');
    setError('');

    try {
      await populateFirestore();
      setStatus('✅ Database populated successfully!');
    } catch (error) {
      console.error('Population error:', error);
      setError(`❌ Population failed: ${error.message}`);
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  const clearDatabase = async () => {
    setLoading(true);
    setStatus('Clearing database...');
    setError('');

    try {
      // Get all collections and delete documents
      const [trips, drivers, vehicles, clients, companies, brands] = await Promise.all([
        firestoreService.getTrips(),
        firestoreService.getDrivers(),
        firestoreService.getVehicles(),
        firestoreService.getClients(),
        firestoreService.getCompanies(),
        firestoreService.getBrands()
      ]);

      // Delete all documents
      const deletePromises = [
        ...trips.map(trip => firestoreService.deleteTrip(trip.id)),
        ...drivers.map(driver => firestoreService.deleteDriver(driver.id)),
        ...vehicles.map(vehicle => firestoreService.deleteVehicle(vehicle.id)),
        ...clients.map(client => firestoreService.deleteClient(client.id)),
        ...companies.map(company => firestoreService.deleteCompany(company.id)),
        ...brands.map(brand => firestoreService.deleteBrand(brand.id))
      ];

      await Promise.all(deletePromises);
      setStatus('✅ Database cleared successfully!');
    } catch (error) {
      console.error('Clear error:', error);
      setError(`❌ Clear failed: ${error.message}`);
      setStatus('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">🔥 Quick Data Setup</h1>
        
        <div className="space-y-4">
          {/* Status */}
          {(status || error) && (
            <div className={`p-4 rounded-lg ${
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
          <div className="flex flex-wrap gap-4">
            <button
              onClick={populateDatabase}
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Populating...' : '🚀 Populate Sample Data'}
            </button>

            <button
              onClick={clearDatabase}
              disabled={loading}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Clearing...' : '🗑️ Clear All Data'}
            </button>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 rounded-lg p-4 mt-6">
            <h3 className="font-semibold text-blue-800 mb-2">📋 Instructions:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
              <li><strong>First:</strong> Make sure you're logged in (authentication required)</li>
              <li><strong>Then:</strong> Click "Populate Sample Data" to add test data</li>
              <li><strong>Finally:</strong> Navigate to other pages to see the data</li>
            </ol>
          </div>

          {/* Current Data Status */}
          <div className="bg-gray-50 rounded-lg p-4 mt-4">
            <h3 className="font-semibold text-gray-800 mb-2">📊 Current Status:</h3>
            <p className="text-sm text-gray-600">
              This tool will help you quickly set up sample data in your Firestore database. 
              The data includes drivers, vehicles, clients, companies, brands, and trips.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuickDataSetup;


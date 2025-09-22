import { useState } from 'react';
import { firestoreService } from '../services/firestoreService';

function DatabaseSetup() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [completedSteps, setCompletedSteps] = useState([]);

  const steps = [
    { id: 'drivers', name: 'Drivers', description: 'Add driver profiles' },
    { id: 'vehicles', name: 'Vehicles', description: 'Add vehicle fleet' },
    { id: 'clients', name: 'Clients', description: 'Add client companies' },
    { id: 'companies', name: 'Companies', description: 'Add business companies' },
    { id: 'brands', name: 'Brands', description: 'Add service brands' },
    { id: 'trips', name: 'Trips', description: 'Add sample trips' }
  ];

  const sampleData = {
    drivers: [
      { name: 'John Driver', email: 'john@limousine.com', phone: '+32 2 123 4567', active: true, status: 'active' },
      { name: 'Mike Wilson', email: 'mike@limousine.com', phone: '+32 2 234 5678', active: true, status: 'active' },
      { name: 'Sarah Johnson', email: 'sarah@limousine.com', phone: '+32 2 345 6789', active: true, status: 'active' },
      { name: 'Ahmed Hassan', email: 'ahmed@limousine.com', phone: '+32 2 456 7890', active: true, status: 'active' },
      { name: 'Marie Dubois', email: 'marie@limousine.com', phone: '+32 2 567 8901', active: false, status: 'inactive' },
      { name: 'Carlos Rodriguez', email: 'carlos@limousine.com', phone: '+32 2 678 9012', active: true, status: 'active' },
      { name: 'Anna Kowalski', email: 'anna@limousine.com', phone: '+32 2 789 0123', active: true, status: 'active' },
      { name: 'Jean-Pierre Martin', email: 'jeanpierre@limousine.com', phone: '+32 2 890 1234', active: true, status: 'active' }
    ],
    vehicles: [
      { name: 'Bus #12', type: 'Luxury Bus', capacity: 25, status: 'active', currentLocation: 'Downtown', fuelLevel: 85, mileage: 125000, lastService: '2024-01-10', nextService: '2024-02-10' },
      { name: 'Limousine #5', type: 'Stretch Limo', capacity: 8, status: 'active', currentLocation: 'Airport', fuelLevel: 92, mileage: 89000, lastService: '2024-01-05', nextService: '2024-02-05' },
      { name: 'Bus #8', type: 'Standard Bus', capacity: 20, status: 'maintenance', currentLocation: 'Service Center', fuelLevel: 45, mileage: 180000, lastService: '2024-01-15', nextService: '2024-01-25' },
      { name: 'Mercedes S-Class', type: 'Executive Sedan', capacity: 4, status: 'active', currentLocation: 'Hotel District', fuelLevel: 78, mileage: 95000, lastService: '2024-01-12', nextService: '2024-02-12' },
      { name: 'BMW 7 Series', type: 'Luxury Sedan', capacity: 4, status: 'active', currentLocation: 'Business Center', fuelLevel: 91, mileage: 67000, lastService: '2024-01-08', nextService: '2024-02-08' },
      { name: 'Audi A8', type: 'Premium Sedan', capacity: 4, status: 'active', currentLocation: 'Airport', fuelLevel: 83, mileage: 78000, lastService: '2024-01-14', nextService: '2024-02-14' }
    ],
    clients: [
      { company: 'Le Botanique', address: 'Rue Royale 236', postalCode: '1210', city: 'Bruxelles', country: 'Belgium', phone: '+32 2 123 4567', fax: '+32 2 123 4568', email: 'contact@lebotanique.be', status: 'Activé' },
      { company: 'ABC Corporation', address: '123 Business Street', postalCode: '1000', city: 'Brussels', country: 'Belgium', phone: '+32 2 234 5678', fax: '+32 2 234 5679', email: 'contact@abccorp.com', status: 'Activé' },
      { company: 'XYZ Limited', address: '456 Corporate Avenue', postalCode: '2000', city: 'Antwerp', country: 'Belgium', phone: '+32 3 345 6789', fax: '+32 3 345 6790', email: 'info@xyzlimited.be', status: 'Activé' },
      { company: 'Global Services Inc.', address: '789 International Blvd', postalCode: '3000', city: 'Leuven', country: 'Belgium', phone: '+32 16 456 7890', fax: '+32 16 456 7891', email: 'services@globalinc.com', status: 'Activé' },
      { company: 'Tech Solutions BV', address: '321 Innovation Drive', postalCode: '4000', city: 'Liège', country: 'Belgium', phone: '+32 4 567 8901', fax: '+32 4 567 8902', email: 'tech@techsolutions.be', status: 'Activé' },
      { company: 'Luxury Transport Ltd', address: '654 Premium Street', postalCode: '5000', city: 'Namur', country: 'Belgium', phone: '+32 81 678 9012', fax: '+32 81 678 9013', email: 'luxury@transport.be', status: 'Activé' },
      { company: 'Executive Cars SA', address: '987 Executive Plaza', postalCode: '6000', city: 'Charleroi', country: 'Belgium', phone: '+32 71 789 0123', fax: '+32 71 789 0124', email: 'executive@cars.be', status: 'Activé' },
      { company: 'VIP Limousine Services', address: '147 VIP Lane', postalCode: '7000', city: 'Mons', country: 'Belgium', phone: '+32 65 890 1234', fax: '+32 65 890 1235', email: 'vip@limousine.be', status: 'Activé' }
    ],
    companies: [
      { name: 'Limostar Premium', address: 'Avenue Louise 123', postalCode: '1000', city: 'Brussels', country: 'Belgium', phone: '+32 2 123 4567', email: 'info@limostar.be', website: 'www.limostar.be', vatNumber: 'BE0123456789', status: 'active' },
      { name: 'Elite Transport Group', address: 'Rue de la Paix 456', postalCode: '2000', city: 'Antwerp', country: 'Belgium', phone: '+32 3 234 5678', email: 'contact@elitetransport.be', website: 'www.elitetransport.be', vatNumber: 'BE0987654321', status: 'active' }
    ],
    brands: [
      { name: 'Limostar', description: 'Premium limousine service brand', logo: '/logo.png', status: 'active' },
      { name: 'Elite', description: 'Executive transportation brand', logo: '/elite-logo.png', status: 'active' },
      { name: 'VIP Express', description: 'Fast luxury service brand', logo: '/vip-logo.png', status: 'active' }
    ]
  };

  const populateStep = async (stepId) => {
    setLoading(true);
    setStatus(`Adding ${steps.find(s => s.id === stepId).name}...`);
    setError('');

    try {
      const data = sampleData[stepId];
      const serviceMethod = firestoreService[`add${stepId.charAt(0).toUpperCase() + stepId.slice(1, -1)}`];
      
      for (const item of data) {
        await serviceMethod({
          ...item,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      setCompletedSteps(prev => [...prev, stepId]);
      setStatus(`✅ ${steps.find(s => s.id === stepId).name} added successfully!`);
      
      // Auto-advance to next step
      setTimeout(() => {
        const nextStepIndex = steps.findIndex(s => s.id === stepId) + 1;
        if (nextStepIndex < steps.length) {
          setCurrentStep(nextStepIndex);
        }
      }, 1500);

    } catch (error) {
      console.error(`Error adding ${stepId}:`, error);
      setError(`❌ Failed to add ${steps.find(s => s.id === stepId).name}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const populateAll = async () => {
    setLoading(true);
    setStatus('Populating all sections...');
    setError('');

    try {
      for (const step of steps) {
        if (!completedSteps.includes(step.id)) {
          setStatus(`Adding ${step.name}...`);
          const data = sampleData[step.id];
          const serviceMethod = firestoreService[`add${step.id.charAt(0).toUpperCase() + step.id.slice(1, -1)}`];
          
          for (const item of data) {
            await serviceMethod({
              ...item,
              createdAt: new Date(),
              updatedAt: new Date()
            });
          }
          
          setCompletedSteps(prev => [...prev, step.id]);
        }
      }

      // Add trips after other data is ready
      const driverRefs = await firestoreService.getDrivers();
      const vehicleRefs = await firestoreService.getVehicles();
      
      // Validate we have drivers and vehicles
      if (driverRefs.length === 0 || vehicleRefs.length === 0) {
        throw new Error('Cannot create trips: No drivers or vehicles available');
      }
      
      const trips = [
        {
          pickup: 'Brussels Airport',
          destination: 'Downtown Brussels',
          date: '2024-01-20',
          time: '10:00 - 12:00',
          status: 'completed',
          passengers: 25,
          revenue: 1250,
          client: 'ABC Corporation',
          notes: 'Corporate group transfer',
          driverId: driverRefs[0]?.id,
          vehicleId: vehicleRefs[0]?.id
        },
        {
          pickup: 'Hotel Plaza',
          destination: 'Brussels Airport',
          date: '2024-01-20',
          time: '14:00 - 15:30',
          status: 'active',
          passengers: 4,
          revenue: 450,
          client: 'VIP Limousine Services',
          notes: 'VIP airport transfer',
          driverId: driverRefs[1]?.id || driverRefs[0]?.id,
          vehicleId: vehicleRefs[1]?.id || vehicleRefs[0]?.id
        }
      ];

      setStatus('Adding trips...');
      for (const trip of trips) {
        // Validate trip data before adding
        if (!trip.driverId || !trip.vehicleId) {
          console.error('Skipping trip with missing driverId or vehicleId:', trip);
          continue;
        }
        
        await firestoreService.addTrip({
          ...trip,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      setStatus('✅ All sections populated successfully!');
    } catch (error) {
      console.error('Error populating all:', error);
      setError(`❌ Population failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = async () => {
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
      setCompletedSteps([]);
      setStatus('✅ All data cleared successfully!');
    } catch (error) {
      console.error('Clear error:', error);
      setError(`❌ Clear failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">🗄️ Database Setup - Page by Page</h1>
        
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-700">Setup Progress</span>
            <span className="text-sm text-gray-500">{completedSteps.length} / {steps.length} completed</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
            ></div>
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

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                completedSteps.includes(step.id) 
                  ? 'border-green-500 bg-green-50' 
                  : currentStep === index
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-gray-50'
              }`}
              onClick={() => setCurrentStep(index)}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-gray-900">{step.name}</h3>
                {completedSteps.includes(step.id) ? (
                  <span className="text-green-600 text-xl">✅</span>
                ) : (
                  <span className="text-gray-400 text-xl">⭕</span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">{step.description}</p>
              <div className="text-xs text-gray-500">
                {sampleData[step.id]?.length || 0} items
              </div>
            </div>
          ))}
        </div>

        {/* Current Step Actions */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Current Step: {steps[currentStep]?.name}
          </h3>
          <p className="text-gray-600 mb-4">
            {steps[currentStep]?.description} - {sampleData[steps[currentStep]?.id]?.length || 0} items to add
          </p>
          
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => populateStep(steps[currentStep]?.id)}
              disabled={loading || completedSteps.includes(steps[currentStep]?.id)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Adding...' : `Add ${steps[currentStep]?.name}`}
            </button>
            
            {currentStep > 0 && (
              <button
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={loading}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                Previous
              </button>
            )}
            
            {currentStep < steps.length - 1 && (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={loading}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
              >
                Next
              </button>
            )}
          </div>
        </div>

        {/* Global Actions */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={populateAll}
            disabled={loading || completedSteps.length === steps.length}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Populating All...' : '🚀 Populate All Sections'}
          </button>

          <button
            onClick={clearAll}
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
            <li><strong>Step 1:</strong> Create user accounts in Firebase Console (Authentication)</li>
            <li><strong>Step 2:</strong> Login to the application with created accounts</li>
            <li><strong>Step 3:</strong> Use this tool to populate each section systematically</li>
            <li><strong>Step 4:</strong> Navigate to each page to verify the data</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default DatabaseSetup;

// Script to populate Firestore with comprehensive sample data
import { firestoreService } from '../services/firestoreService.js'

const sampleData = {
  drivers: [
    { name: 'John Driver', email: 'john@limousine.com', phone: '+32 2 123 4567', active: true },
    { name: 'Mike Wilson', email: 'mike@limousine.com', phone: '+32 2 234 5678', active: true },
    { name: 'Sarah Johnson', email: 'sarah@limousine.com', phone: '+32 2 345 6789', active: true },
    { name: 'Ahmed Hassan', email: 'ahmed@limousine.com', phone: '+32 2 456 7890', active: true },
    { name: 'Marie Dubois', email: 'marie@limousine.com', phone: '+32 2 567 8901', active: false },
    { name: 'Carlos Rodriguez', email: 'carlos@limousine.com', phone: '+32 2 678 9012', active: true },
    { name: 'Anna Kowalski', email: 'anna@limousine.com', phone: '+32 2 789 0123', active: true },
    { name: 'Jean-Pierre Martin', email: 'jeanpierre@limousine.com', phone: '+32 2 890 1234', active: true }
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
  ],

  trips: [
    {
      driverId: 'driver1',
      driverName: 'John Driver',
      vehicleId: 'vehicle1',
      vehicleName: 'Bus #12',
      pickup: 'Brussels Airport',
      destination: 'Downtown Brussels',
      date: '2024-01-20',
      time: '10:00 - 12:00',
      status: 'completed',
      passengers: 25,
      revenue: 1250,
      client: 'ABC Corporation',
      notes: 'Corporate group transfer'
    },
    {
      driverId: 'driver2',
      driverName: 'Mike Wilson',
      vehicleId: 'vehicle2',
      vehicleName: 'Limousine #5',
      pickup: 'Hotel Plaza',
      destination: 'Brussels Airport',
      date: '2024-01-20',
      time: '14:00 - 15:30',
      status: 'active',
      passengers: 4,
      revenue: 450,
      client: 'VIP Limousine Services',
      notes: 'VIP airport transfer'
    },
    {
      driverId: 'driver3',
      driverName: 'Sarah Johnson',
      vehicleId: 'vehicle1',
      vehicleName: 'Bus #12',
      pickup: 'Central Station',
      destination: 'Convention Center',
      date: '2024-01-21',
      time: '09:00 - 11:00',
      status: 'assigned',
      passengers: 30,
      revenue: 1500,
      client: 'Global Services Inc.',
      notes: 'Conference transportation'
    },
    {
      driverId: 'driver1',
      driverName: 'John Driver',
      vehicleId: 'vehicle4',
      vehicleName: 'Mercedes S-Class',
      pickup: 'Business District',
      destination: 'Airport',
      date: '2024-01-21',
      time: '16:00 - 17:30',
      status: 'assigned',
      passengers: 2,
      revenue: 300,
      client: 'Tech Solutions BV',
      notes: 'Executive transfer'
    }
  ]
}

async function populateFirestore() {
  console.log('🚀 Starting Firestore population...')
  
  try {
    // Add drivers
    console.log('📝 Adding drivers...')
    const driverRefs = []
    for (const driver of sampleData.drivers) {
      const docRef = await firestoreService.addDriver({
        ...driver,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      driverRefs.push(docRef.id)
      console.log(`✅ Added driver: ${driver.name}`)
    }

    // Add vehicles
    console.log('🚗 Adding vehicles...')
    const vehicleRefs = []
    for (const vehicle of sampleData.vehicles) {
      const docRef = await firestoreService.addVehicle({
        ...vehicle,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      vehicleRefs.push(docRef.id)
      console.log(`✅ Added vehicle: ${vehicle.name}`)
    }

    // Add clients
    console.log('👥 Adding clients...')
    for (const client of sampleData.clients) {
      await firestoreService.addClient({
        ...client,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      console.log(`✅ Added client: ${client.company}`)
    }

    // Add companies
    console.log('🏢 Adding companies...')
    for (const company of sampleData.companies) {
      await firestoreService.addCompany({
        ...company,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      console.log(`✅ Added company: ${company.name}`)
    }

    // Add brands
    console.log('🏷️ Adding brands...')
    for (const brand of sampleData.brands) {
      await firestoreService.addBrand({
        ...brand,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      console.log(`✅ Added brand: ${brand.name}`)
    }

    // Add trips (using the driver and vehicle references)
    console.log('🚌 Adding trips...')
    
    // Ensure we have drivers and vehicles before creating trips
    if (driverRefs.length === 0) {
      throw new Error('No drivers were created. Cannot create trips without drivers.')
    }
    if (vehicleRefs.length === 0) {
      throw new Error('No vehicles were created. Cannot create trips without vehicles.')
    }
    
    for (let i = 0; i < sampleData.trips.length; i++) {
      const trip = sampleData.trips[i]
      const driverId = driverRefs[i % driverRefs.length]
      const vehicleId = vehicleRefs[i % vehicleRefs.length]
      
      // Validate that we have valid IDs
      if (!driverId || !vehicleId) {
        console.error(`❌ Skipping trip ${i + 1}: driverId=${driverId}, vehicleId=${vehicleId}`)
        continue
      }
      
      const tripData = {
        ...trip,
        driverId: driverId,
        vehicleId: vehicleId,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      console.log(`🔄 Creating trip with driverId: ${driverId}, vehicleId: ${vehicleId}`)
      await firestoreService.addTrip(tripData)
      console.log(`✅ Added trip: ${trip.pickup} → ${trip.destination}`)
    }

    console.log('🎉 Firestore population completed successfully!')
    console.log('📊 Summary:')
    console.log(`   - ${sampleData.drivers.length} drivers added`)
    console.log(`   - ${sampleData.vehicles.length} vehicles added`)
    console.log(`   - ${sampleData.clients.length} clients added`)
    console.log(`   - ${sampleData.companies.length} companies added`)
    console.log(`   - ${sampleData.brands.length} brands added`)
    console.log(`   - ${sampleData.trips.length} trips added`)

  } catch (error) {
    console.error('❌ Error populating Firestore:', error)
    throw error
  }
}

// Export for use in other files
export { populateFirestore, sampleData }

// If running directly (browser-compatible check)
if (import.meta.url.endsWith('populateSampleData.js')) {
  populateFirestore()
    .then(() => {
      console.log('✅ Population script completed!')
    })
    .catch((error) => {
      console.error('❌ Population script failed:', error)
    })
}


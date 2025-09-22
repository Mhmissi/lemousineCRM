// Script to populate Firestore with sample data
// Run this script after setting up Firebase to populate your database

import { 
  collection, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Sample data to populate the database
const sampleData = {
  users: [
    {
      email: 'owner@lemousine.com',
      name: 'Jane Owner',
      role: 'owner',
      phone: '+32 2 512 01 01',
      isActive: true
    },
    {
      email: 'driver@lemousine.com',
      name: 'John Driver',
      role: 'driver',
      phone: '+32 2 512 01 02',
      isActive: true
    }
  ],

  drivers: [
    {
      name: 'ABDEL BMW 7',
      email: 'abdel@limousine.com',
      phone: '+32 2 123 4567',
      status: 'active',
      licenseNumber: 'DL123456',
      hireDate: new Date('2023-01-15'),
      rating: 4.8,
      totalTrips: 156
    },
    {
      name: 'BESIM',
      email: 'besim@limousine.com',
      phone: '+32 2 234 5678',
      status: 'active',
      licenseNumber: 'DL234567',
      hireDate: new Date('2023-02-20'),
      rating: 4.6,
      totalTrips: 142
    },
    {
      name: 'Bils',
      email: 'bils@limousine.com',
      phone: '+32 2 345 6789',
      status: 'active',
      licenseNumber: 'DL345678',
      hireDate: new Date('2023-03-10'),
      rating: 4.7,
      totalTrips: 128
    },
    {
      name: 'BLS TANGER',
      email: 'bls@limousine.com',
      phone: '+32 2 456 7890',
      status: 'active',
      licenseNumber: 'DL456789',
      hireDate: new Date('2023-04-05'),
      rating: 4.9,
      totalTrips: 189
    },
    {
      name: 'Breugelmans',
      email: 'breugelmans@limousine.com',
      phone: '+32 2 567 8901',
      status: 'active',
      licenseNumber: 'DL567890',
      hireDate: new Date('2023-05-12'),
      rating: 4.5,
      totalTrips: 134
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
      lastService: new Date('2024-01-10'),
      nextService: new Date('2024-02-10'),
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
      lastService: new Date('2024-01-05'),
      nextService: new Date('2024-02-05'),
      licensePlate: 'LIMO-005',
      year: 2021,
      color: 'Black'
    },
    {
      name: 'Bus #8',
      type: 'Standard Bus',
      capacity: 20,
      status: 'maintenance',
      currentLocation: 'Service Center',
      fuelLevel: 45,
      mileage: 180000,
      lastService: new Date('2024-01-15'),
      nextService: new Date('2024-01-25'),
      licensePlate: 'BUS-008',
      year: 2019,
      color: 'Blue'
    },
    {
      name: 'Limousine #3',
      type: 'Executive Limo',
      capacity: 6,
      status: 'active',
      currentLocation: 'Business District',
      fuelLevel: 78,
      mileage: 95000,
      lastService: new Date('2024-01-08'),
      nextService: new Date('2024-02-08'),
      licensePlate: 'LIMO-003',
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
      company: 'Candex Solutions Belgium BV',
      address: 'Patersstraat 100',
      postalCode: '2300',
      city: 'Turnhout',
      country: 'Belgium',
      phone: '+32 14 234 5678',
      fax: '+32 14 234 5679',
      email: 'info@candex.be',
      status: 'Activé',
      contactPerson: 'Jan Van Der Berg',
      vatNumber: 'BE0987654321'
    },
    {
      company: 'Dlc srl',
      address: 'Clos Lamartine 5',
      postalCode: '1420',
      city: 'Braine-l\'Alleud',
      country: 'Belgium',
      phone: '+32 2 345 6789',
      fax: '+32 2 345 6790',
      email: 'contact@dlc.be',
      status: 'Activé',
      contactPerson: 'Pierre Martin',
      vatNumber: 'BE1122334455'
    },
    {
      company: 'LATHAM & WATKINS LLP',
      address: 'Place Sainte Gudule 14',
      postalCode: '1000',
      city: 'Bruxelles',
      country: 'Belgium',
      phone: '+32 2 456 7890',
      fax: '+32 2 456 7891',
      email: 'brussels@lw.com',
      status: 'Activé',
      contactPerson: 'Sarah Johnson',
      vatNumber: 'BE5566778899'
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
    },
    {
      logo: 'Location Bus',
      name: 'Location Bus',
      address: 'Av Herrmann Debroux 54',
      postalCode: '1160',
      city: 'Brussels',
      country: 'Belgium',
      tel: '+32 2 342 07 34',
      fax: '+32 2 342 07 35',
      mobile: '+32 478 234 567',
      email: 'info@location-bus.be',
      website: 'www.location-bus.be',
      vatNumber: 'BE0987654321',
      bankAccount: 'BE68 5390 0754 7035'
    },
    {
      logo: 'Rent a Bus',
      name: 'RENT A BUS',
      address: 'Avenue Louise 65',
      postalCode: '1050',
      city: 'Bruxelles',
      country: 'Belgium',
      tel: '+32 2 512 01 01',
      fax: '+32 2 512 01 03',
      mobile: '+32 478 345 678',
      email: 'info@rentabus.be',
      website: 'www.rentabus.be',
      vatNumber: 'BE1122334455',
      bankAccount: 'BE68 5390 0754 7036'
    }
  ],

  brands: [
    {
      logo: 'Autocar.Brussels',
      name: 'AUTOCAR BRUSSELS',
      status: 'Activée',
      description: 'Premium autocar service for Brussels area'
    },
    {
      logo: 'BelFood Trading',
      name: 'BelFood Trading',
      status: 'Désactivée',
      description: 'Food trading brand partnership'
    },
    {
      logo: 'Location Autocar',
      name: 'LOCATION AUTOCAR',
      status: 'Activée',
      description: 'Vehicle rental and location services'
    },
    {
      logo: 'Luxury Transport',
      name: 'LUXURY TRANSPORT',
      status: 'Activée',
      description: 'High-end transportation services'
    }
  ],

  trips: [
    {
      driverId: 'driver1', // Will be replaced with actual driver ID
      vehicleId: 'vehicle1', // Will be replaced with actual vehicle ID
      clientId: 'client1', // Will be replaced with actual client ID
      pickup: 'Downtown Hotel',
      destination: 'Airport Terminal 1',
      date: '2024-01-15',
      startTime: '10:00',
      endTime: '12:00',
      status: 'completed',
      passengers: 4,
      revenue: 450,
      client: 'John Smith',
      clientPhone: '+1 (555) 123-4567',
      notes: 'VIP client - provide water bottles',
      distance: 25,
      duration: 120
    },
    {
      driverId: 'driver2',
      vehicleId: 'vehicle2',
      clientId: 'client2',
      pickup: 'Business District',
      destination: 'Convention Center',
      date: '2024-01-15',
      startTime: '14:00',
      endTime: '16:30',
      status: 'ontheway',
      passengers: 8,
      revenue: 800,
      client: 'Corporate Group',
      clientPhone: '+1 (555) 234-5678',
      notes: 'Multiple stops - check itinerary',
      distance: 35,
      duration: 150
    },
    {
      driverId: 'driver3',
      vehicleId: 'vehicle3',
      clientId: 'client3',
      pickup: 'Central Station',
      destination: 'Resort Hotel',
      date: '2024-01-16',
      startTime: '18:00',
      endTime: '20:00',
      status: 'assigned',
      passengers: 20,
      revenue: 1200,
      client: 'Tour Group',
      clientPhone: '+1 (555) 345-6789',
      notes: 'Group transportation - ensure all passengers',
      distance: 45,
      duration: 120
    }
  ]
};

// Function to populate the database
export const populateDatabase = async () => {
  try {
    console.log('Starting to populate Firestore database...');

    // Populate Users
    console.log('Adding users...');
    const userIds = {};
    for (const user of sampleData.users) {
      const docRef = await addDoc(collection(db, 'users'), {
        ...user,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      userIds[user.email] = docRef.id;
      console.log(`Added user: ${user.name} (${docRef.id})`);
    }

    // Populate Drivers
    console.log('Adding drivers...');
    const driverIds = {};
    for (let i = 0; i < sampleData.drivers.length; i++) {
      const driver = sampleData.drivers[i];
      const docRef = await addDoc(collection(db, 'drivers'), {
        ...driver,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      driverIds[`driver${i + 1}`] = docRef.id;
      console.log(`Added driver: ${driver.name} (${docRef.id})`);
    }

    // Populate Vehicles
    console.log('Adding vehicles...');
    const vehicleIds = {};
    for (let i = 0; i < sampleData.vehicles.length; i++) {
      const vehicle = sampleData.vehicles[i];
      const docRef = await addDoc(collection(db, 'vehicles'), {
        ...vehicle,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      vehicleIds[`vehicle${i + 1}`] = docRef.id;
      console.log(`Added vehicle: ${vehicle.name} (${docRef.id})`);
    }

    // Populate Clients
    console.log('Adding clients...');
    const clientIds = {};
    for (let i = 0; i < sampleData.clients.length; i++) {
      const client = sampleData.clients[i];
      const docRef = await addDoc(collection(db, 'clients'), {
        ...client,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      clientIds[`client${i + 1}`] = docRef.id;
      console.log(`Added client: ${client.company} (${docRef.id})`);
    }

    // Populate Companies
    console.log('Adding companies...');
    for (const company of sampleData.companies) {
      const docRef = await addDoc(collection(db, 'companies'), {
        ...company,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log(`Added company: ${company.name} (${docRef.id})`);
    }

    // Populate Brands
    console.log('Adding brands...');
    for (const brand of sampleData.brands) {
      const docRef = await addDoc(collection(db, 'brands'), {
        ...brand,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log(`Added brand: ${brand.name} (${docRef.id})`);
    }

    // Populate Trips (with actual IDs)
    console.log('Adding trips...');
    for (const trip of sampleData.trips) {
      const tripWithIds = {
        ...trip,
        driverId: driverIds[trip.driverId] || trip.driverId,
        vehicleId: vehicleIds[trip.vehicleId] || trip.vehicleId,
        clientId: clientIds[trip.clientId] || trip.clientId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(collection(db, 'trips'), tripWithIds);
      console.log(`Added trip: ${trip.pickup} to ${trip.destination} (${docRef.id})`);
    }

    console.log('✅ Database population completed successfully!');
    console.log('📊 Summary:');
    console.log(`- Users: ${sampleData.users.length}`);
    console.log(`- Drivers: ${sampleData.drivers.length}`);
    console.log(`- Vehicles: ${sampleData.vehicles.length}`);
    console.log(`- Clients: ${sampleData.clients.length}`);
    console.log(`- Companies: ${sampleData.companies.length}`);
    console.log(`- Brands: ${sampleData.brands.length}`);
    console.log(`- Trips: ${sampleData.trips.length}`);

  } catch (error) {
    console.error('❌ Error populating database:', error);
    throw error;
  }
};

// Function to clear all data (use with caution!)
export const clearDatabase = async () => {
  console.log('⚠️  WARNING: This will delete all data from Firestore!');
  console.log('This function is not implemented for safety reasons.');
  console.log('If you need to clear data, do it manually from Firebase Console.');
};

// Export the sample data for reference
export { sampleData };


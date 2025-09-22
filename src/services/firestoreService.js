import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Collection names
const COLLECTIONS = {
  USERS: 'users',
  TRIPS: 'trips',
  DRIVERS: 'drivers',
  VEHICLES: 'vehicles',
  CLIENTS: 'clients',
  COMPANIES: 'companies',
  BRANDS: 'brands',
  PROFILES: 'profiles',
  INVOICES: 'invoices'
};

// ===== TRIPS SERVICE =====
export const tripsService = {
  // Get all trips
  getAllTrips: async () => {
    try {
      const tripsRef = collection(db, COLLECTIONS.TRIPS);
      const q = query(tripsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting trips:', error);
      throw error;
    }
  },

  // Get trip by ID
  getTripById: async (tripId) => {
    try {
      const tripRef = doc(db, COLLECTIONS.TRIPS, tripId);
      const tripSnap = await getDoc(tripRef);
      if (tripSnap.exists()) {
        return { id: tripSnap.id, ...tripSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting trip:', error);
      throw error;
    }
  },

  // Create new trip
  createTrip: async (tripData) => {
    try {
      const tripsRef = collection(db, COLLECTIONS.TRIPS);
      
      // Prepare the data, using serverTimestamp if not provided
      const tripDataToAdd = {
        ...tripData,
        createdAt: tripData.createdAt || serverTimestamp(),
        updatedAt: tripData.updatedAt || serverTimestamp()
      };
      
      // Remove any undefined values
      Object.keys(tripDataToAdd).forEach(key => {
        if (tripDataToAdd[key] === undefined) {
          delete tripDataToAdd[key];
        }
      });
      
      const docRef = await addDoc(tripsRef, tripDataToAdd);
      return docRef.id;
    } catch (error) {
      console.error('Error creating trip:', error);
      throw error;
    }
  },

  // Update trip
  updateTrip: async (tripId, updateData) => {
    try {
      const tripRef = doc(db, COLLECTIONS.TRIPS, tripId);
      await updateDoc(tripRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating trip:', error);
      throw error;
    }
  },

  // Delete trip
  deleteTrip: async (tripId) => {
    try {
      const tripRef = doc(db, COLLECTIONS.TRIPS, tripId);
      await deleteDoc(tripRef);
    } catch (error) {
      console.error('Error deleting trip:', error);
      throw error;
    }
  },

  // Get trips by status
  getTripsByStatus: async (status) => {
    try {
      const tripsRef = collection(db, COLLECTIONS.TRIPS);
      const q = query(tripsRef, where('status', '==', status), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting trips by status:', error);
      throw error;
    }
  },

  // Get trips by driver
  getTripsByDriver: async (driverId) => {
    try {
      const tripsRef = collection(db, COLLECTIONS.TRIPS);
      const q = query(tripsRef, where('driverId', '==', driverId), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting trips by driver:', error);
      throw error;
    }
  },

  // Listen to trips changes (real-time)
  subscribeToTrips: (callback) => {
    const tripsRef = collection(db, COLLECTIONS.TRIPS);
    const q = query(tripsRef, orderBy('createdAt', 'desc'));
    return onSnapshot(q, (querySnapshot) => {
      const trips = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(trips);
    });
  }
};

// ===== DRIVERS SERVICE =====
export const driversService = {
  // Get all drivers
  getAllDrivers: async () => {
    try {
      const driversRef = collection(db, COLLECTIONS.DRIVERS);
      const q = query(driversRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting drivers:', error);
      throw error;
    }
  },

  // Get driver by ID
  getDriverById: async (driverId) => {
    try {
      const driverRef = doc(db, COLLECTIONS.DRIVERS, driverId);
      const driverSnap = await getDoc(driverRef);
      if (driverSnap.exists()) {
        return { id: driverSnap.id, ...driverSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting driver:', error);
      throw error;
    }
  },

  // Create new driver
  createDriver: async (driverData) => {
    try {
      const driversRef = collection(db, COLLECTIONS.DRIVERS);
      
      // Prepare the data, using serverTimestamp if not provided
      const driverDataToAdd = {
        ...driverData,
        createdAt: driverData.createdAt || serverTimestamp(),
        updatedAt: driverData.updatedAt || serverTimestamp()
      };
      
      // Remove any undefined values
      Object.keys(driverDataToAdd).forEach(key => {
        if (driverDataToAdd[key] === undefined) {
          delete driverDataToAdd[key];
        }
      });
      
      const docRef = await addDoc(driversRef, driverDataToAdd);
      return docRef.id;
    } catch (error) {
      console.error('Error creating driver:', error);
      throw error;
    }
  },

  // Update driver
  updateDriver: async (driverId, updateData) => {
    try {
      const driverRef = doc(db, COLLECTIONS.DRIVERS, driverId);
      await updateDoc(driverRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating driver:', error);
      throw error;
    }
  },

  // Delete driver
  deleteDriver: async (driverId) => {
    try {
      const driverRef = doc(db, COLLECTIONS.DRIVERS, driverId);
      await deleteDoc(driverRef);
    } catch (error) {
      console.error('Error deleting driver:', error);
      throw error;
    }
  },

  // Get active drivers
  getActiveDrivers: async () => {
    try {
      const driversRef = collection(db, COLLECTIONS.DRIVERS);
      const q = query(driversRef, where('status', '==', 'active'), orderBy('name'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting active drivers:', error);
      throw error;
    }
  }
};

// ===== VEHICLES SERVICE =====
export const vehiclesService = {
  // Get all vehicles
  getAllVehicles: async () => {
    try {
      const vehiclesRef = collection(db, COLLECTIONS.VEHICLES);
      const q = query(vehiclesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting vehicles:', error);
      throw error;
    }
  },

  // Get vehicle by ID
  getVehicleById: async (vehicleId) => {
    try {
      const vehicleRef = doc(db, COLLECTIONS.VEHICLES, vehicleId);
      const vehicleSnap = await getDoc(vehicleRef);
      if (vehicleSnap.exists()) {
        return { id: vehicleSnap.id, ...vehicleSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting vehicle:', error);
      throw error;
    }
  },

  // Create new vehicle
  createVehicle: async (vehicleData) => {
    try {
      const vehiclesRef = collection(db, COLLECTIONS.VEHICLES);
      const docRef = await addDoc(vehiclesRef, {
        ...vehicleData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating vehicle:', error);
      throw error;
    }
  },

  // Update vehicle
  updateVehicle: async (vehicleId, updateData) => {
    try {
      const vehicleRef = doc(db, COLLECTIONS.VEHICLES, vehicleId);
      await updateDoc(vehicleRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating vehicle:', error);
      throw error;
    }
  },

  // Delete vehicle
  deleteVehicle: async (vehicleId) => {
    try {
      const vehicleRef = doc(db, COLLECTIONS.VEHICLES, vehicleId);
      await deleteDoc(vehicleRef);
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      throw error;
    }
  },

  // Get active vehicles
  getActiveVehicles: async () => {
    try {
      const vehiclesRef = collection(db, COLLECTIONS.VEHICLES);
      const q = query(vehiclesRef, where('status', '==', 'active'), orderBy('name'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting active vehicles:', error);
      throw error;
    }
  }
};

// ===== CLIENTS SERVICE =====
export const clientsService = {
  // Get all clients
  getAllClients: async () => {
    try {
      const clientsRef = collection(db, COLLECTIONS.CLIENTS);
      const q = query(clientsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting clients:', error);
      throw error;
    }
  },

  // Get client by ID
  getClientById: async (clientId) => {
    try {
      const clientRef = doc(db, COLLECTIONS.CLIENTS, clientId);
      const clientSnap = await getDoc(clientRef);
      if (clientSnap.exists()) {
        return { id: clientSnap.id, ...clientSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting client:', error);
      throw error;
    }
  },

  // Create new client
  createClient: async (clientData) => {
    try {
      const clientsRef = collection(db, COLLECTIONS.CLIENTS);
      const docRef = await addDoc(clientsRef, {
        ...clientData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating client:', error);
      throw error;
    }
  },

  // Update client
  updateClient: async (clientId, updateData) => {
    try {
      const clientRef = doc(db, COLLECTIONS.CLIENTS, clientId);
      await updateDoc(clientRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating client:', error);
      throw error;
    }
  },

  // Delete client
  deleteClient: async (clientId) => {
    try {
      const clientRef = doc(db, COLLECTIONS.CLIENTS, clientId);
      await deleteDoc(clientRef);
    } catch (error) {
      console.error('Error deleting client:', error);
      throw error;
    }
  }
};

// ===== COMPANIES SERVICE =====
export const companiesService = {
  // Get all companies
  getAllCompanies: async () => {
    try {
      const companiesRef = collection(db, COLLECTIONS.COMPANIES);
      const q = query(companiesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting companies:', error);
      throw error;
    }
  },

  // Get company by ID
  getCompanyById: async (companyId) => {
    try {
      const companyRef = doc(db, COLLECTIONS.COMPANIES, companyId);
      const companySnap = await getDoc(companyRef);
      if (companySnap.exists()) {
        return { id: companySnap.id, ...companySnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting company:', error);
      throw error;
    }
  },

  // Create new company
  createCompany: async (companyData) => {
    try {
      const companiesRef = collection(db, COLLECTIONS.COMPANIES);
      const docRef = await addDoc(companiesRef, {
        ...companyData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  },

  // Update company
  updateCompany: async (companyId, updateData) => {
    try {
      const companyRef = doc(db, COLLECTIONS.COMPANIES, companyId);
      await updateDoc(companyRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating company:', error);
      throw error;
    }
  },

  // Delete company
  deleteCompany: async (companyId) => {
    try {
      const companyRef = doc(db, COLLECTIONS.COMPANIES, companyId);
      await deleteDoc(companyRef);
    } catch (error) {
      console.error('Error deleting company:', error);
      throw error;
    }
  }
};

// ===== BRANDS SERVICE =====
export const brandsService = {
  // Get all brands
  getAllBrands: async () => {
    try {
      const brandsRef = collection(db, COLLECTIONS.BRANDS);
      const q = query(brandsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting brands:', error);
      throw error;
    }
  },

  // Get brand by ID
  getBrandById: async (brandId) => {
    try {
      const brandRef = doc(db, COLLECTIONS.BRANDS, brandId);
      const brandSnap = await getDoc(brandRef);
      if (brandSnap.exists()) {
        return { id: brandSnap.id, ...brandSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting brand:', error);
      throw error;
    }
  },

  // Create new brand
  createBrand: async (brandData) => {
    try {
      const brandsRef = collection(db, COLLECTIONS.BRANDS);
      const docRef = await addDoc(brandsRef, {
        ...brandData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating brand:', error);
      throw error;
    }
  },

  // Update brand
  updateBrand: async (brandId, updateData) => {
    try {
      const brandRef = doc(db, COLLECTIONS.BRANDS, brandId);
      await updateDoc(brandRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating brand:', error);
      throw error;
    }
  },

  // Delete brand
  deleteBrand: async (brandId) => {
    try {
      const brandRef = doc(db, COLLECTIONS.BRANDS, brandId);
      await deleteDoc(brandRef);
    } catch (error) {
      console.error('Error deleting brand:', error);
      throw error;
    }
  }
};

// ===== USERS SERVICE =====
export const usersService = {
  // Get all users
  getAllUsers: async () => {
    try {
      const usersRef = collection(db, COLLECTIONS.USERS);
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  },

  // Get user by ID
  getUserById: async (userId) => {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  },

  // Create new user
  createUser: async (userData) => {
    try {
      const usersRef = collection(db, COLLECTIONS.USERS);
      const docRef = await addDoc(usersRef, {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Update user
  updateUser: async (userId, updateData) => {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userId);
      await updateDoc(userRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }
};

// ===== INVOICES SERVICE =====
export const invoicesService = {
  // Get all invoices
  getAllInvoices: async () => {
    try {
      const invoicesRef = collection(db, COLLECTIONS.INVOICES);
      const q = query(invoicesRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting invoices:', error);
      throw error;
    }
  },

  // Get invoice by ID
  getInvoiceById: async (invoiceId) => {
    try {
      const invoiceRef = doc(db, COLLECTIONS.INVOICES, invoiceId);
      const invoiceSnap = await getDoc(invoiceRef);
      if (invoiceSnap.exists()) {
        return { id: invoiceSnap.id, ...invoiceSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting invoice:', error);
      throw error;
    }
  },

  // Create new invoice
  createInvoice: async (invoiceData) => {
    try {
      const invoicesRef = collection(db, COLLECTIONS.INVOICES);
      
      // Prepare the data, using serverTimestamp if not provided
      const invoiceDataToAdd = {
        ...invoiceData,
        createdAt: invoiceData.createdAt || serverTimestamp(),
        updatedAt: invoiceData.updatedAt || serverTimestamp()
      };
      
      // Remove any undefined values
      Object.keys(invoiceDataToAdd).forEach(key => {
        if (invoiceDataToAdd[key] === undefined) {
          delete invoiceDataToAdd[key];
        }
      });
      
      const docRef = await addDoc(invoicesRef, invoiceDataToAdd);
      return docRef.id;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  },

  // Update invoice
  updateInvoice: async (invoiceId, updateData) => {
    try {
      const invoiceRef = doc(db, COLLECTIONS.INVOICES, invoiceId);
      await updateDoc(invoiceRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating invoice:', error);
      throw error;
    }
  },

  // Delete invoice
  deleteInvoice: async (invoiceId) => {
    try {
      const invoiceRef = doc(db, COLLECTIONS.INVOICES, invoiceId);
      await deleteDoc(invoiceRef);
    } catch (error) {
      console.error('Error deleting invoice:', error);
      throw error;
    }
  }
};

// Unified firestore service export
export const firestoreService = {
  // Trips
  getTrips: tripsService.getAllTrips,
  getTrip: tripsService.getTrip,
  addTrip: tripsService.createTrip,
  updateTrip: tripsService.updateTrip,
  deleteTrip: tripsService.deleteTrip,
  
  // Drivers
  getDrivers: driversService.getAllDrivers,
  getDriver: driversService.getDriver,
  addDriver: driversService.createDriver,
  updateDriver: driversService.updateDriver,
  deleteDriver: driversService.deleteDriver,
  
  // Vehicles
  getVehicles: vehiclesService.getAllVehicles,
  getVehicle: vehiclesService.getVehicle,
  addVehicle: vehiclesService.createVehicle,
  updateVehicle: vehiclesService.updateVehicle,
  deleteVehicle: vehiclesService.deleteVehicle,
  
  // Clients
  getClients: clientsService.getAllClients,
  getClient: clientsService.getClient,
  addClient: clientsService.createClient,
  updateClient: clientsService.updateClient,
  deleteClient: clientsService.deleteClient,
  
  // Companies
  getCompanies: companiesService.getAllCompanies,
  getCompany: companiesService.getCompany,
  addCompany: companiesService.createCompany,
  updateCompany: companiesService.updateCompany,
  deleteCompany: companiesService.deleteCompany,
  
  // Brands
  getBrands: brandsService.getAllBrands,
  getBrand: brandsService.getBrand,
  addBrand: brandsService.createBrand,
  updateBrand: brandsService.updateBrand,
  deleteBrand: brandsService.deleteBrand,
  
  // Users
  getUsers: usersService.getAllUsers,
  getUser: usersService.getUser,
  addUser: usersService.createUser,
  updateUser: usersService.updateUser,
  
  // Invoices
  getInvoices: invoicesService.getAllInvoices,
  getInvoice: invoicesService.getInvoiceById,
  addInvoice: invoicesService.createInvoice,
  updateInvoice: invoicesService.updateInvoice,
  deleteInvoice: invoicesService.deleteInvoice
};

export default firestoreService;

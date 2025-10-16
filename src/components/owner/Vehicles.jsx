import { useState, useEffect, useRef, useCallback } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { Car, Plus, MapPin, Users, Fuel, Settings, CheckCircle, XCircle } from 'lucide-react'
import { firestoreService } from '../../services/firestoreService'

function Vehicles() {
  const { t } = useLanguage()
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const isMountedRef = useRef(true)

  // Load vehicles from Firestore with proper cleanup
  const loadVehicles = useCallback(async () => {
    try {
      setLoading(true)
      const vehiclesData = await firestoreService.getVehicles()
      
      // Map vehicle data to ensure consistent field names
      const mappedVehicles = vehiclesData.map(vehicle => ({
        id: vehicle.id,
        make: vehicle.make || vehicle.brand || vehicle.manufacturer || 'Unknown',
        model: vehicle.model || vehicle.modelName || 'Unknown Model',
        year: vehicle.year || vehicle.modelYear || new Date().getFullYear(),
        licensePlate: vehicle.licensePlate || vehicle.plateNumber || vehicle.registration || '',
        status: vehicle.status || vehicle.vehicleStatus || vehicle.active ? 'active' : 'inactive',
        capacity: vehicle.capacity || vehicle.seats || vehicle.passengerCapacity || 4,
        fuelLevel: vehicle.fuelLevel || vehicle.fuel || vehicle.gasLevel || 100,
        mileage: vehicle.mileage || vehicle.odometer || vehicle.kilometers || 0,
        color: vehicle.color || vehicle.vehicleColor || 'Unknown',
        type: vehicle.type || vehicle.vehicleType || vehicle.category || 'sedan',
        ...vehicle // Include any other fields
      }))
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setVehicles(mappedVehicles)
      }
    } catch (error) {

      // Only update state if component is still mounted
      if (isMountedRef.current) {
        // Fallback to empty array if Firestore fails
        setVehicles([])
      }
    } finally {
      // Only update loading state if component is still mounted
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    loadVehicles()
    
    // Cleanup function
    return () => {
      isMountedRef.current = false
    }
  }, [loadVehicles])

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100'
      case 'maintenance':
        return 'text-yellow-600 bg-yellow-100'
      case 'out_of_service':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'maintenance':
        return <Settings className="w-4 h-4 text-yellow-600" />
      case 'out_of_service':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Car className="w-4 h-4 text-gray-600" />
    }
  }

  const getFuelColor = (level) => {
    if (level > 75) return 'text-green-600'
    if (level > 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 min-h-screen pb-20 lg:pb-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#FFF8DC' }}>
              <Car className="w-5 h-5 lg:w-6 lg:h-6" style={{ color: '#DAA520' }} />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t('vehicles')}</h1>
              <p className="text-sm lg:text-base text-gray-600">{t('manageVehicleFleet')}</p>
            </div>
          </div>
        </div>
        
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-xs lg:text-sm text-gray-500">
          <span>Home</span>
          <span>/</span>
          <span className="text-gray-900 font-medium">{t('vehicles')}</span>
        </nav>
      </div>

      {/* Add Vehicle Button */}
      <div className="mb-8">
        <button 
          onClick={() => alert('Add Vehicle functionality would open a vehicle registration form')}
          className="flex items-center space-x-2 px-4 py-3 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl text-sm lg:text-base"
          style={{ backgroundColor: '#DAA520' }}
        >
          <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
          <span className="hidden sm:inline">{t('addVehicle')}</span>
          <span className="sm:hidden">Ajouter</span>
        </button>
      </div>

      {/* Stats */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Car className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('totalVehicles')}</p>
              <p className="text-2xl font-bold text-gray-900">{vehicles.length}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {vehicles.filter(v => v.status === 'active').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Settings className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('maintenance')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {vehicles.filter(v => v.status === 'maintenance').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">{t('totalCapacity')}</p>
              <p className="text-2xl font-bold text-gray-900">
                {vehicles.reduce((sum, v) => sum + v.capacity, 0)}
              </p>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="mb-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className="card">
            {/* Vehicle Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Car className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{vehicle.name}</h3>
                  <p className="text-sm text-gray-600">{vehicle.type}</p>
                </div>
              </div>
              <div className="flex items-center">
                {getStatusIcon(vehicle.status)}
                <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(vehicle.status)}`}>
                  {vehicle.status === 'active' ? t('activeStatus') : 
                   vehicle.status === 'maintenance' ? t('maintenance') : 
                   vehicle.status === 'out_of_service' ? t('outOfService') : vehicle.status}
                </span>
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  {t('capacity')}
                </div>
                <span className="text-sm font-medium text-gray-900">{vehicle.capacity} {t('passengers')}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  {t('location')}
                </div>
                <span className="text-sm font-medium text-gray-900">{vehicle.currentLocation}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-600">
                  <Fuel className={`w-4 h-4 mr-2 ${getFuelColor(vehicle.fuelLevel)}`} />
                  {t('fuel')}
                </div>
                <span className={`text-sm font-medium ${getFuelColor(vehicle.fuelLevel)}`}>
                  {vehicle.fuelLevel}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{t('mileage')}</span>
                <span className="text-sm font-medium text-gray-900">{vehicle.mileage.toLocaleString()} {t('mi')}</span>
              </div>
            </div>

            {/* Service Info */}
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">{t('lastService')}</p>
                  <p className="font-medium text-gray-900">{vehicle.lastService}</p>
                </div>
                <div>
                  <p className="text-gray-600">{t('nextService')}</p>
                  <p className="font-medium text-gray-900">{vehicle.nextService}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex space-x-2">
              <button 
                onClick={() => alert(`Viewing details for ${vehicle.name}`)}
                className="flex-1 btn-secondary text-sm"
              >
                {t('viewDetails')}
              </button>
              <button 
                onClick={() => alert(`Tracking location of ${vehicle.name} - ${vehicle.currentLocation}`)}
                className="flex-1 btn-primary text-sm"
              >
                {t('trackLocation')}
              </button>
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  )
}

export default Vehicles

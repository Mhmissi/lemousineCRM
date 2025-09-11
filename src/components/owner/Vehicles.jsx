import { useState, useEffect } from 'react'
import { Car, Plus, MapPin, Users, Fuel, Settings, CheckCircle, XCircle } from 'lucide-react'

function Vehicles() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data - in real app, this would fetch from API
    const mockVehicles = [
      {
        id: 1,
        name: 'Bus #12',
        type: 'Luxury Bus',
        capacity: 25,
        status: 'active',
        currentLocation: 'Downtown',
        fuelLevel: 85,
        mileage: 125000,
        lastService: '2024-01-10',
        nextService: '2024-02-10'
      },
      {
        id: 2,
        name: 'Limousine #5',
        type: 'Stretch Limo',
        capacity: 8,
        status: 'active',
        currentLocation: 'Airport',
        fuelLevel: 92,
        mileage: 89000,
        lastService: '2024-01-05',
        nextService: '2024-02-05'
      },
      {
        id: 3,
        name: 'Bus #8',
        type: 'Standard Bus',
        capacity: 20,
        status: 'maintenance',
        currentLocation: 'Service Center',
        fuelLevel: 45,
        mileage: 180000,
        lastService: '2024-01-15',
        nextService: '2024-01-25'
      }
    ]

    setTimeout(() => {
      setVehicles(mockVehicles)
      setLoading(false)
    }, 500)
  }, [])

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
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vehicles</h1>
            <p className="text-gray-600">Manage your vehicle fleet</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button 
              onClick={() => alert('Add Vehicle functionality would open a vehicle registration form')}
              className="btn-primary flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Vehicle
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Car className="w-6 h-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Vehicles</p>
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
              <p className="text-sm font-medium text-gray-600">Maintenance</p>
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
              <p className="text-sm font-medium text-gray-600">Total Capacity</p>
              <p className="text-2xl font-bold text-gray-900">
                {vehicles.reduce((sum, v) => sum + v.capacity, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicles Grid */}
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
                  {vehicle.status}
                </span>
              </div>
            </div>

            {/* Vehicle Details */}
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-600">
                  <Users className="w-4 h-4 mr-2" />
                  Capacity
                </div>
                <span className="text-sm font-medium text-gray-900">{vehicle.capacity} passengers</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  Location
                </div>
                <span className="text-sm font-medium text-gray-900">{vehicle.currentLocation}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-600">
                  <Fuel className={`w-4 h-4 mr-2 ${getFuelColor(vehicle.fuelLevel)}`} />
                  Fuel
                </div>
                <span className={`text-sm font-medium ${getFuelColor(vehicle.fuelLevel)}`}>
                  {vehicle.fuelLevel}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Mileage</span>
                <span className="text-sm font-medium text-gray-900">{vehicle.mileage.toLocaleString()} mi</span>
              </div>
            </div>

            {/* Service Info */}
            <div className="border-t border-gray-200 pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Last Service</p>
                  <p className="font-medium text-gray-900">{vehicle.lastService}</p>
                </div>
                <div>
                  <p className="text-gray-600">Next Service</p>
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
                View Details
              </button>
              <button 
                onClick={() => alert(`Tracking location of ${vehicle.name} - ${vehicle.currentLocation}`)}
                className="flex-1 btn-primary text-sm"
              >
                Track Location
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Vehicles

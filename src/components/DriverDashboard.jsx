import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Car, Clock, MapPin, LogOut, Bell } from 'lucide-react'

function DriverDashboard() {
  const { user, logout } = useAuth()
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data - in real app, this would fetch from API
    const mockTrips = [
      {
        id: 1,
        vehicle: 'Bus #12 (Company X)',
        date: '2024-01-15',
        time: '10:00 - 13:00',
        pickup: 'City A',
        destination: 'City B',
        status: 'assigned',
        passengerCount: 25
      },
      {
        id: 2,
        vehicle: 'Limousine #5 (Premium)',
        date: '2024-01-15',
        time: '14:00 - 16:00',
        pickup: 'Airport Terminal 1',
        destination: 'Downtown Hotel',
        status: 'ontheway',
        passengerCount: 4
      }
    ]
    
    setTimeout(() => {
      setTrips(mockTrips)
      setLoading(false)
    }, 1000)
  }, [])

  const updateTripStatus = (tripId, newStatus) => {
    setTrips(trips.map(trip => 
      trip.id === tripId ? { ...trip, status: newStatus } : trip
    ))
  }

  const getStatusButton = (trip) => {
    const statusConfig = {
      assigned: {
        text: 'Start Trip',
        color: 'bg-yellow-500 hover:bg-yellow-600',
        nextStatus: 'ontheway'
      },
      ontheway: {
        text: 'Complete Trip',
        color: 'bg-green-500 hover:bg-green-600',
        nextStatus: 'completed'
      },
      completed: {
        text: 'Trip Completed',
        color: 'bg-blue-500 cursor-not-allowed',
        nextStatus: null
      }
    }

    const config = statusConfig[trip.status]
    
    return (
      <button
        onClick={() => config.nextStatus && updateTripStatus(trip.id, config.nextStatus)}
        disabled={!config.nextStatus}
        className={`w-full ${config.color} text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200 text-lg mobile-text-lg disabled:opacity-75`}
      >
        {config.text}
      </button>
    )
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'assigned':
        return <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
      case 'ontheway':
        return <div className="w-4 h-4 bg-green-500 rounded-full"></div>
      case 'completed':
        return <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your trips...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">My Trips</h1>
            <p className="text-sm text-gray-600">Welcome back, {user.name}</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="p-2 text-gray-600 hover:text-gray-900">
              <Bell className="w-5 h-5" />
            </button>
            <button 
              onClick={logout}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6">
        {trips.length === 0 ? (
          <div className="text-center py-12">
            <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No trips scheduled</h3>
            <p className="text-gray-600">You don't have any trips assigned at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {trips.map((trip) => (
              <div key={trip.id} className="card">
                {/* Trip Status */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(trip.status)}
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {trip.status.replace('ontheway', 'On the Way')}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {trip.passengerCount} passengers
                  </span>
                </div>

                {/* Vehicle Info */}
                <div className="flex items-center space-x-3 mb-4">
                  <Car className="w-5 h-5 text-gray-600" />
                  <span className="text-lg font-medium text-gray-900">{trip.vehicle}</span>
                </div>

                {/* Date & Time */}
                <div className="flex items-center space-x-3 mb-4">
                  <Clock className="w-5 h-5 text-gray-600" />
                  <div>
                    <span className="text-lg font-medium text-gray-900">{trip.date}</span>
                    <span className="text-lg text-gray-900 ml-2">{trip.time}</span>
                  </div>
                </div>

                {/* Route */}
                <div className="flex items-start space-x-3 mb-6">
                  <MapPin className="w-5 h-5 text-gray-600 mt-1" />
                  <div className="flex-1">
                    <div className="text-lg font-medium text-gray-900">{trip.pickup}</div>
                    <div className="text-sm text-gray-500 my-1">↓</div>
                    <div className="text-lg font-medium text-gray-900">{trip.destination}</div>
                  </div>
                </div>

                {/* Status Update Button */}
                {getStatusButton(trip)}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default DriverDashboard

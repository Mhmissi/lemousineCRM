import { useState, useEffect, useRef, useCallback } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { useNotifications } from '../../contexts/NotificationContext'
import { X, MapPin, Clock, Car, Users, DollarSign, User, Calendar } from 'lucide-react'
import { firestoreService } from '../../services/firestoreService'
import { NOTIFICATION_TYPES, NOTIFICATION_PRIORITIES } from '../../constants/notificationTypes'

function AddTripForm({ onClose, onTripAdded }) {
  const { t } = useLanguage()
  const { addNotification } = useNotifications()
  const [formData, setFormData] = useState({
    driver: '',
    vehicle: '',
    pickup: '',
    destination: '',
    date: '',
    startTime: '',
    endTime: '',
    passengers: '',
    client: '',
    revenue: '',
    notes: ''
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [drivers, setDrivers] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loadingData, setLoadingData] = useState(true)
  const isMountedRef = useRef(true)

  // Load drivers and vehicles data with proper cleanup
  const loadData = useCallback(async () => {
    try {
      setLoadingData(true)
      const [driversData, profilesData, vehiclesData] = await Promise.all([
        firestoreService.getDrivers(),
        firestoreService.getProfiles(),
        firestoreService.getVehicles()
      ])
      
      console.log('📋 Loading drivers for trip assignment...')
      console.log('   - Drivers collection:', driversData.length)
      console.log('   - Profiles collection:', profilesData.length)
      
      // Get real drivers from drivers collection (with Firebase Auth)
      const realDriversFromDriversCollection = driversData
        .filter(driver => driver.firebaseAuthId)
        .map(driver => ({
          id: driver.id,
          name: driver.name || driver.fullName || driver.displayName || 'Unknown Driver',
          email: driver.email || driver.emailAddress || '',
          firebaseAuthId: driver.firebaseAuthId,
          source: 'drivers',
          ...driver
        }))
      
      // Get real drivers from profiles collection (classe === 'driver' with Firebase Auth)
      const realDriversFromProfiles = profilesData
        .filter(profile => profile.classe === 'driver' && profile.firebaseAuthId)
        .map(profile => ({
          id: profile.id,
          name: profile.name || profile.displayName || profile.fullName || 'Unknown Driver',
          email: profile.email || profile.username || '',
          firebaseAuthId: profile.firebaseAuthId,
          source: 'profiles',
          ...profile
        }))
      
      // Combine and deduplicate based on email AND Firebase Auth ID
      const allRealDrivers = [...realDriversFromDriversCollection, ...realDriversFromProfiles]
      const uniqueDrivers = allRealDrivers.reduce((acc, driver) => {
        const existingDriver = acc.find(d => 
          d.email === driver.email || 
          d.firebaseAuthId === driver.firebaseAuthId
        )
        if (!existingDriver) {
          acc.push(driver)
        } else if (driver.source === 'drivers' && existingDriver.source === 'profiles') {
          // Prefer drivers collection over profiles collection
          const index = acc.findIndex(d => d.email === driver.email || d.firebaseAuthId === driver.firebaseAuthId)
          acc[index] = driver
        }
        return acc
      }, [])
      
      console.log('✅ Real drivers with Firebase Auth:', uniqueDrivers.length)
      console.log('   - From drivers collection:', realDriversFromDriversCollection.length)
      console.log('   - From profiles collection:', realDriversFromProfiles.length)
      console.log('   - Unique drivers:', uniqueDrivers.map(d => `${d.name} (${d.email})`))
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setDrivers(uniqueDrivers) // Only show real drivers
        setVehicles(vehiclesData)
      }
    } catch (error) {
      console.error('Error loading form data:', error)
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        // Fallback to empty arrays
        setDrivers([])
        setVehicles([])
      }
    } finally {
      // Only update loading state if component is still mounted
      if (isMountedRef.current) {
        setLoadingData(false)
      }
    }
  }, [])

  useEffect(() => {
    loadData()
    
    // Cleanup function
    return () => {
      isMountedRef.current = false
    }
  }, [loadData])

  // Set default date to today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setFormData(prev => ({ ...prev, date: today }))
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.driver) newErrors.driver = t('driverRequired')
    if (!formData.vehicle) newErrors.vehicle = t('vehicleRequired')
    if (!formData.pickup.trim()) newErrors.pickup = t('pickupRequired')
    if (!formData.destination.trim()) newErrors.destination = t('destinationRequired')
    if (!formData.date) newErrors.date = t('dateRequired')
    if (!formData.startTime) newErrors.startTime = t('startTimeRequired')
    if (!formData.endTime) newErrors.endTime = t('endTimeRequired')
    if (!formData.passengers || formData.passengers < 1) newErrors.passengers = t('passengersRequired')
    if (!formData.client.trim()) newErrors.client = t('clientRequired')
    if (!formData.revenue || formData.revenue < 0) newErrors.revenue = t('revenueRequired')

    // Validate time range
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      newErrors.endTime = t('endTimeAfterStart')
    }

    // Validate passenger count against vehicle capacity
    const selectedVehicle = vehicles.find(v => v.id === formData.vehicle)
    if (selectedVehicle && formData.passengers > selectedVehicle.capacity) {
      newErrors.passengers = `${t('cannotExceedCapacity')} (${selectedVehicle.capacity})`
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const selectedDriver = drivers.find(d => d.id === formData.driver)
      const selectedVehicle = vehicles.find(v => v.id === formData.vehicle)

      console.log('🚗 ===== CREATING TRIP =====')
      console.log('📋 Selected Driver:', selectedDriver)
      console.log('🔑 Driver Firebase Auth ID:', selectedDriver?.firebaseAuthId)
      console.log('📧 Driver Email:', selectedDriver?.email)
      console.log('👤 Driver Name:', selectedDriver?.name)

      const newTrip = {
        driverId: formData.driver, // Firestore driver document ID
        driverFirebaseAuthId: selectedDriver?.firebaseAuthId || '', // Firebase Auth UID for matching in driver dashboard
        driverName: selectedDriver?.name || '',
        driverEmail: selectedDriver?.email || '',
        vehicleId: formData.vehicle,
        vehicleName: selectedVehicle?.name || '',
        pickup: formData.pickup,
        destination: formData.destination,
        date: formData.date,
        time: `${formData.startTime} - ${formData.endTime}`,
        startTime: formData.startTime, // Add individual time fields
        endTime: formData.endTime,
        status: 'assigned',
        passengers: parseInt(formData.passengers),
        revenue: parseFloat(formData.revenue),
        client: formData.client,
        notes: formData.notes,
        createdAt: new Date(), // Add timestamp fields
        updatedAt: new Date()
      }

      // Call the callback to add the trip
      if (onTripAdded) {
        console.log('💾 Saving trip to Firestore...')
        console.log('💾 Trip data:', {
          driverFirebaseAuthId: newTrip.driverFirebaseAuthId,
          client: newTrip.client,
          date: newTrip.date,
          status: newTrip.status
        })
        
        const result = await onTripAdded(newTrip)
        
        console.log('✅ Trip saved successfully!')
        console.log('🆔 Trip ID:', result?.tripId)
        console.log('🔑 Driver Firebase Auth ID in trip:', newTrip.driverFirebaseAuthId)
        console.log('📧 Driver Email:', newTrip.driverEmail)
        
        // Show success message
        alert(`Trip created successfully for ${selectedDriver?.name}! The driver will see it in their notifications.`)
      }

      // Add notification for owner/manager
      addNotification({
        type: NOTIFICATION_TYPES.TRIP_ASSIGNED,
        title: 'Trip Created Successfully',
        message: `Trip assigned to ${selectedDriver?.name || 'Unknown Driver'} for ${formData.client}`,
        priority: NOTIFICATION_PRIORITIES.MEDIUM,
        data: {
          tripId: newTrip.id || 'pending',
          driverName: selectedDriver?.name || '',
          client: formData.client
        }
      })

      // Reset form
      setFormData({
        driver: '',
        vehicle: '',
        pickup: '',
        destination: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '',
        endTime: '',
        passengers: '',
        client: '',
        revenue: '',
        notes: ''
      })

      // Close the form
      onClose()
    } catch (error) {
      console.error('Error creating trip:', error)
      setErrors({ submit: 'Failed to create trip. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const selectedVehicle = vehicles.find(v => v.id === parseInt(formData.vehicle))

  if (loadingData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <span className="ml-4 text-gray-600">Loading drivers and vehicles...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Create New Trip</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Driver and Vehicle Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Driver *
              </label>
              <select
                name="driver"
                value={formData.driver}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.driver ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a driver</option>
                {drivers.map(driver => (
                  <option key={driver.id} value={driver.id}>
                    {driver.name} ({driver.status})
                  </option>
                ))}
              </select>
              {errors.driver && <p className="text-red-500 text-sm mt-1">{errors.driver}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Car className="w-4 h-4 inline mr-2" />
                Vehicle *
              </label>
              <select
                name="vehicle"
                value={formData.vehicle}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                  errors.vehicle ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a vehicle</option>
                {vehicles.map(vehicle => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.name} - {vehicle.type} ({vehicle.capacity} seats) - {vehicle.status}
                  </option>
                ))}
              </select>
              {errors.vehicle && <p className="text-red-500 text-sm mt-1">{errors.vehicle}</p>}
              {selectedVehicle && (
                <p className="text-sm text-gray-600 mt-1">
                  Capacity: {selectedVehicle.capacity} passengers
                </p>
              )}
            </div>
          </div>

          {/* Route Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Route Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pickup Location *
                </label>
                <input
                  type="text"
                  name="pickup"
                  value={formData.pickup}
                  onChange={handleInputChange}
                  placeholder="e.g., Airport Terminal 1"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.pickup ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.pickup && <p className="text-red-500 text-sm mt-1">{errors.pickup}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destination *
                </label>
                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleInputChange}
                  placeholder="e.g., Downtown Hotel"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.destination ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.destination && <p className="text-red-500 text-sm mt-1">{errors.destination}</p>}
              </div>
            </div>
          </div>

          {/* Date and Time */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Clock className="w-5 h-5 mr-2" />
              Schedule
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-2" />
                  Date *
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time *
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.startTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.startTime && <p className="text-red-500 text-sm mt-1">{errors.startTime}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Time *
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.endTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.endTime && <p className="text-red-500 text-sm mt-1">{errors.endTime}</p>}
              </div>
            </div>
          </div>

          {/* Trip Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Trip Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Passengers *
                </label>
                <input
                  type="number"
                  name="passengers"
                  value={formData.passengers}
                  onChange={handleInputChange}
                  min="1"
                  max={selectedVehicle?.capacity || 50}
                  placeholder="1"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.passengers ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.passengers && <p className="text-red-500 text-sm mt-1">{errors.passengers}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Name *
                </label>
                <input
                  type="text"
                  name="client"
                  value={formData.client}
                  onChange={handleInputChange}
                  placeholder="e.g., Corporate Group"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.client ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.client && <p className="text-red-500 text-sm mt-1">{errors.client}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-2" />
                  Revenue *
                </label>
                <input
                  type="number"
                  name="revenue"
                  value={formData.revenue}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                    errors.revenue ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.revenue && <p className="text-red-500 text-sm mt-1">{errors.revenue}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                placeholder="Any special instructions or notes for this trip..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Error Messages */}
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                'Create Trip'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddTripForm

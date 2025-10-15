// Notification service that derives notifications from trips and other collections
// Instead of storing notifications separately, we generate them from existing data

import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore'
import { db } from '../config/firebase'
import { NOTIFICATION_TYPES, NOTIFICATION_PRIORITIES } from '../constants/notificationTypes'

/**
 * Generate notifications from trips for a specific driver
 */
export const generateNotificationsFromTrips = async (driverFirebaseAuthId) => {
  try {
    console.log('📥 Generating notifications from trips for driver:', driverFirebaseAuthId)
    
    const notifications = []
    
    // Get trips assigned to this driver
    // IMPORTANT: Query without orderBy to avoid composite index requirement
    const tripsRef = collection(db, 'trips')
    const tripsQuery = query(
      tripsRef,
      where('driverFirebaseAuthId', '==', driverFirebaseAuthId)
    )
    
    console.log('🔍 Executing Firestore query...')
    const tripsSnapshot = await getDocs(tripsQuery)
    console.log('📋 Found trips for driver:', tripsSnapshot.docs.length)
    
    if (tripsSnapshot.docs.length === 0) {
      console.log('⚠️ No trips found for this driver. Check:')
      console.log('   - Driver Firebase Auth ID:', driverFirebaseAuthId)
      console.log('   - Are trips saved with this driverFirebaseAuthId?')
    }
    
    tripsSnapshot.docs.forEach(doc => {
      const trip = { id: doc.id, ...doc.data() }
      console.log('🔍 Processing trip:', trip.id, 'for client:', trip.client, 'status:', trip.status)
      
      // Generate notification for this trip
      const notification = createNotificationFromTrip(trip, driverFirebaseAuthId)
      if (notification) {
        console.log('✅ Created notification:', notification.title)
        notifications.push(notification)
      }
    })
    
    // Sort by timestamp in JavaScript (newest first)
    notifications.sort((a, b) => {
      const timeA = a.timestamp || new Date(0)
      const timeB = b.timestamp || new Date(0)
      return timeB - timeA
    })
    
    console.log('✅ Generated notifications:', notifications.length)
    return notifications
    
  } catch (error) {
    console.error('❌ Error generating notifications from trips:', error)
    console.error('❌ Error details:', error.message)
    console.error('❌ Error code:', error.code)
    return []
  }
}

/**
 * Create a notification object from a trip
 */
const createNotificationFromTrip = (trip, driverFirebaseAuthId) => {
  try {
    // Only create notifications for trips assigned to this driver
    if (trip.driverFirebaseAuthId !== driverFirebaseAuthId) {
      console.log(`⏭️ Skipping trip ${trip.id} - different driver`)
      return null
    }
    
    // Handle trip date - try multiple date fields
    let tripDate
    if (trip.createdAt?.toDate) {
      tripDate = trip.createdAt.toDate()
    } else if (trip.createdAt) {
      tripDate = new Date(trip.createdAt)
    } else if (trip.updatedAt?.toDate) {
      tripDate = trip.updatedAt.toDate()
    } else {
      // If no timestamp, treat as new (created now)
      tripDate = new Date()
    }
    
    const now = new Date()
    const daysSinceCreation = Math.floor((now - tripDate) / (1000 * 60 * 60 * 24))
    
    console.log(`📅 Trip ${trip.id} created ${daysSinceCreation} days ago`)
    
    // Show notifications for trips created in the last 30 days (generous for testing)
    if (daysSinceCreation > 30) {
      console.log(`⏭️ Skipping trip ${trip.id} - too old (${daysSinceCreation} days)`)
      return null
    }
    
    // Determine if this is a "new" unread notification
    // Consider unread if: trip is less than 48 hours old and status is 'assigned' (more generous)
    const hoursSinceCreation = (now - tripDate) / (1000 * 60 * 60)
    const isUnread = hoursSinceCreation < 48 && trip.status === 'assigned'
    
    console.log(`📊 Trip ${trip.id}: ${hoursSinceCreation.toFixed(1)}h old, status: ${trip.status}, unread: ${isUnread}`)
    
    // Generate notification based on trip status
    let title, message, type, priority
    
    switch (trip.status) {
      case 'assigned':
        title = '🚗 New Trip Assigned!'
        message = `You have a new trip for ${trip.client} on ${trip.date}`
        type = NOTIFICATION_TYPES.TRIP_ASSIGNED
        priority = NOTIFICATION_PRIORITIES.HIGH
        break
        
      case 'ontheway':
        title = '🚗 Trip In Progress'
        message = `Trip for ${trip.client} is in progress`
        type = NOTIFICATION_TYPES.TRIP_STATUS_CHANGED
        priority = NOTIFICATION_PRIORITIES.MEDIUM
        break
        
      case 'completed':
        title = '✅ Trip Completed'
        message = `You completed the trip for ${trip.client}`
        type = NOTIFICATION_TYPES.TRIP_COMPLETED
        priority = NOTIFICATION_PRIORITIES.MEDIUM
        break
        
      case 'cancelled':
        title = '❌ Trip Cancelled'
        message = `Trip for ${trip.client} was cancelled`
        type = NOTIFICATION_TYPES.TRIP_CANCELLED
        priority = NOTIFICATION_PRIORITIES.HIGH
        break
        
      default:
        title = 'Trip Update'
        message = `Trip for ${trip.client}`
        type = NOTIFICATION_TYPES.TRIP_STATUS_CHANGED
        priority = NOTIFICATION_PRIORITIES.MEDIUM
    }
    
    const tripTime = trip.startTime && trip.endTime 
      ? `${trip.startTime} - ${trip.endTime}`
      : trip.time || trip.startTime || 'Time TBD'
    
    return {
      id: `trip-${trip.id}`, // Use trip ID as notification ID
      userId: driverFirebaseAuthId,
      type,
      title,
      message,
      priority,
      read: !isUnread, // Mark as read if older than 24h or not assigned
      timestamp: tripDate,
      createdAt: tripDate,
      data: {
        tripId: trip.id,
        client: trip.client || 'Unknown',
        pickup: trip.pickup || '',
        destination: trip.destination || '',
        date: trip.date || '',
        time: tripTime,
        startTime: trip.startTime || '',
        endTime: trip.endTime || '',
        vehicle: trip.vehicleName || trip.vehicle || '',
        passengers: trip.passengers || 0,
        revenue: trip.revenue || 0,
        status: trip.status
      }
    }
  } catch (error) {
    console.error('❌ Error creating notification from trip:', error)
    return null
  }
}

/**
 * Mark a trip-based notification as read by storing in localStorage
 */
export const markTripNotificationAsRead = (notificationId) => {
  try {
    const readNotifications = JSON.parse(localStorage.getItem('read_trip_notifications') || '[]')
    if (!readNotifications.includes(notificationId)) {
      readNotifications.push(notificationId)
      localStorage.setItem('read_trip_notifications', JSON.stringify(readNotifications))
    }
  } catch (error) {
    console.error('Error marking trip notification as read:', error)
  }
}

/**
 * Check if a trip notification has been marked as read
 */
export const isTripNotificationRead = (notificationId) => {
  try {
    const readNotifications = JSON.parse(localStorage.getItem('read_trip_notifications') || '[]')
    return readNotifications.includes(notificationId)
  } catch (error) {
    console.error('Error checking if trip notification is read:', error)
    return false
  }
}

/**
 * Apply read status from localStorage to generated notifications
 */
export const applyReadStatus = (notifications) => {
  return notifications.map(notification => ({
    ...notification,
    read: notification.read || isTripNotificationRead(notification.id)
  }))
}

export default {
  generateNotificationsFromTrips,
  markTripNotificationAsRead,
  isTripNotificationRead,
  applyReadStatus
}


import { createContext, useContext, useState, useEffect } from 'react'
import { firestoreService } from '../services/firestoreService'
import { useAuth } from './AuthContext'
import { NOTIFICATION_ICONS, NOTIFICATION_COLORS } from '../constants/notificationTypes'
import notificationService from '../services/notificationService'

const NotificationContext = createContext()

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false)

  // Load notifications from trips when user logs in
  useEffect(() => {
    const loadNotifications = async () => {
      if (!user?.id) {
        console.log('No user logged in, skipping notification load')
        return
      }

      try {
        console.log('📥 Loading notifications from trips for user:', user.id)
        
        // Get dismissed notifications from localStorage
        const dismissedNotifications = JSON.parse(localStorage.getItem(`dismissed_notifications_${user.id}`) || '[]')
        console.log('🗑️ Dismissed notifications:', dismissedNotifications.length)
        
        // Get trips assigned to this driver
        const trips = await firestoreService.getTrips()
        console.log('📋 All trips loaded:', trips.length)
        
        // Filter trips for this driver
        const driverTrips = trips.filter(trip => {
          // Match by Firebase Auth ID, email, or name
          const matchesFirebaseId = trip.driverFirebaseAuthId === user.id
          const matchesEmail = trip.driverEmail === user.email
          const matchesName = trip.driverName && user.name && 
            trip.driverName.toLowerCase().includes(user.name.toLowerCase())
          
          // Exclude dismissed notifications
          const notificationId = `trip-${trip.id}`
          const isDismissed = dismissedNotifications.includes(notificationId)
          
          return (matchesFirebaseId || matchesEmail || matchesName) && !isDismissed
        })
        
        console.log('🚗 Trips for this driver (not dismissed):', driverTrips.length)
        
        // Convert trips to notifications
        const notifications = driverTrips.map(trip => ({
          id: `trip-${trip.id}`,
          userId: user.id,
          type: 'trip',
          title: `🚗 Trip for ${trip.client}`,
          message: `${trip.pickup} → ${trip.destination} on ${trip.date}`,
          priority: 'high',
          read: false, // You can add logic to mark as read based on trip status
          timestamp: trip.createdAt || new Date(),
          data: {
            tripId: trip.id,
            client: trip.client,
            pickup: trip.pickup,
            destination: trip.destination,
            date: trip.date,
            time: trip.time || trip.startTime,
            status: trip.status
          }
        }))
        
        // Sort by timestamp (newest first)
        notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        
        setNotifications(notifications)
        setUnreadCount(notifications.filter(n => !n.read).length)
        
        console.log('✅ Notifications loaded from trips:', notifications.length)
        console.log('🔔 Unread notifications:', notifications.filter(n => !n.read).length)
      } catch (error) {
        console.error('❌ Error loading notifications from trips:', error)
        setNotifications([])
        setUnreadCount(0)
      }
    }

    // Load notifications only once when user changes
    loadNotifications()
  }, [user?.id])

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('limostar_notifications', JSON.stringify(notifications))
  }, [notifications])

  const refreshNotifications = async () => {
    if (!user?.id) return
    
    try {
      console.log('🔄 Refreshing notifications from trips for user:', user.id)
      
      // Get dismissed notifications from localStorage
      const dismissedNotifications = JSON.parse(localStorage.getItem(`dismissed_notifications_${user.id}`) || '[]')
      
      // Get trips assigned to this driver
      const trips = await firestoreService.getTrips()
      
      // Filter trips for this driver and exclude dismissed notifications
      const driverTrips = trips.filter(trip => {
        const matchesFirebaseId = trip.driverFirebaseAuthId === user.id
        const matchesEmail = trip.driverEmail === user.email
        const matchesName = trip.driverName && user.name && 
          trip.driverName.toLowerCase().includes(user.name.toLowerCase())
        
        // Exclude dismissed notifications
        const notificationId = `trip-${trip.id}`
        const isDismissed = dismissedNotifications.includes(notificationId)
        
        return (matchesFirebaseId || matchesEmail || matchesName) && !isDismissed
      })
      
      // Convert trips to notifications
      const notifications = driverTrips.map(trip => ({
        id: `trip-${trip.id}`,
        userId: user.id,
        type: 'trip',
        title: `🚗 Trip for ${trip.client}`,
        message: `${trip.pickup} → ${trip.destination} on ${trip.date}`,
        priority: 'high',
        read: false,
        timestamp: trip.createdAt || new Date(),
        data: {
          tripId: trip.id,
          client: trip.client,
          pickup: trip.pickup,
          destination: trip.destination,
          date: trip.date,
          time: trip.time || trip.startTime,
          status: trip.status
        }
      }))
      
      // Sort by timestamp (newest first)
      notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      
      setNotifications(notifications)
      setUnreadCount(notifications.filter(n => !n.read).length)
      
      console.log('🔄 Notifications refreshed from trips:', notifications.length)
    } catch (error) {
      console.error('❌ Error refreshing notifications:', error)
    }
  }

  const addNotification = async (notification) => {
    try {
      // Create in Firestore first to get proper ID
      const docRef = await firestoreService.addNotification({
        ...notification,
        userId: user.id
      })
      
      // Then add to local state with Firestore ID
      const newNotification = {
        id: docRef.id, // Use Firestore document ID
        timestamp: new Date(),
        read: false,
        priority: 'medium',
        ...notification
      }
      
      setNotifications(prev => [newNotification, ...prev])
      setUnreadCount(prev => prev + 1)
      
      // Show browser notification if permission is granted
      if (Notification.permission === 'granted') {
        new Notification(newNotification.title, {
          body: newNotification.message,
          icon: '/logo.png',
          badge: '/logo.png'
        })
      }
      
      console.log('✅ Notification created successfully:', newNotification.id)
    } catch (error) {
      console.error('❌ Failed to create notification:', error)
      
      // Fallback: create local notification only
      const fallbackNotification = {
        id: `local_${Date.now()}`,
        timestamp: new Date(),
        read: false,
        priority: 'medium',
        ...notification
      }
      
      setNotifications(prev => [fallbackNotification, ...prev])
      setUnreadCount(prev => prev + 1)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      // Mark trip-based notifications as read in localStorage
      if (notificationId.startsWith('trip-')) {
        notificationService.markTripNotificationAsRead(notificationId)
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
      // Still update local state even if marking fails
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true }
            : notification
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  const markAllAsRead = () => {
    // Mark all trip-based notifications as read
    notifications.forEach(notification => {
      if (notification.id.startsWith('trip-')) {
        notificationService.markTripNotificationAsRead(notification.id)
      }
    })
    
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
    setUnreadCount(0)
  }

  const removeNotification = (notificationId) => {
    console.log('🗑️ Dismissing notification forever:', notificationId)
    
    // Save to dismissed notifications in localStorage
    const dismissedNotifications = JSON.parse(localStorage.getItem(`dismissed_notifications_${user.id}`) || '[]')
    if (!dismissedNotifications.includes(notificationId)) {
      dismissedNotifications.push(notificationId)
      localStorage.setItem(`dismissed_notifications_${user.id}`, JSON.stringify(dismissedNotifications))
      console.log('✅ Notification dismissed and saved to localStorage')
    }
    
    // Remove from current view
    const notification = notifications.find(n => n.id === notificationId)
    setNotifications(prev => prev.filter(n => n.id !== notificationId))
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  const clearAllNotifications = () => {
    setNotifications([])
    setUnreadCount(0)
  }

  const toggleNotificationCenter = () => {
    setIsNotificationCenterOpen(prev => !prev)
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  }

  const formatTimeAgo = (timestamp) => {
    const now = new Date()
    const diff = now - timestamp
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return 'justNow'
    if (minutes < 60) return `${minutes} minutesAgo`
    if (hours < 24) return `${hours} hoursAgo`
    return `${days} daysAgo`
  }

  const getNotificationIcon = (type) => {
    return NOTIFICATION_ICONS[type] || NOTIFICATION_ICONS.default
  }

  const getPriorityColor = (priority) => {
    return NOTIFICATION_COLORS[priority] || NOTIFICATION_COLORS.default
  }

  const value = {
    notifications,
    unreadCount,
    isNotificationCenterOpen,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    toggleNotificationCenter,
    requestNotificationPermission,
    formatTimeAgo,
    getNotificationIcon,
    getPriorityColor,
    refreshNotifications // Add manual refresh function
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

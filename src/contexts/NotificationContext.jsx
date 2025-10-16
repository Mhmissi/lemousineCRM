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

        return
      }

      try {
        // Use notification service to generate notifications from trips
        const generatedNotifications = await notificationService.generateNotificationsFromTrips(user.id)
        
        // Get dismissed notifications from localStorage
        const dismissedNotifications = JSON.parse(localStorage.getItem(`dismissed_notifications_${user.id}`) || '[]')
        
        // Filter out dismissed notifications
        const activeNotifications = generatedNotifications.filter(
          notification => !dismissedNotifications.includes(notification.id)
        )
        
        // Apply read status from localStorage
        const notificationsWithReadStatus = notificationService.applyReadStatus(activeNotifications)
        
        setNotifications(notificationsWithReadStatus)
        setUnreadCount(notificationsWithReadStatus.filter(n => !n.read).length)
      } catch (error) {
        console.error('Error loading notifications:', error)
      }
    }

    loadNotifications()
  }, [user])

  // Mark notification as read
  const markAsRead = (notificationId) => {
    notificationService.markTripNotificationAsRead(notificationId)
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  // Mark all notifications as read
  const markAllAsRead = () => {
    notifications.forEach(notification => {
      if (!notification.read) {
        notificationService.markTripNotificationAsRead(notification.id)
      }
    })
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    )
    setUnreadCount(0)
  }

  // Dismiss notification
  const dismissNotification = (notificationId) => {
    try {
      const userId = user?.id
      if (!userId) return

      const dismissedNotifications = JSON.parse(
        localStorage.getItem(`dismissed_notifications_${userId}`) || '[]'
      )
      if (!dismissedNotifications.includes(notificationId)) {
        dismissedNotifications.push(notificationId)
        localStorage.setItem(
          `dismissed_notifications_${userId}`,
          JSON.stringify(dismissedNotifications)
        )
      }

      setNotifications(prev =>
        prev.filter(notification => notification.id !== notificationId)
      )
      setUnreadCount(prev => {
        const notification = notifications.find(n => n.id === notificationId)
        return notification && !notification.read ? Math.max(0, prev - 1) : prev
      })
    } catch (error) {
      console.error('Error dismissing notification:', error)
    }
  }

  const value = {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    dismissNotification,
    isNotificationCenterOpen,
    setIsNotificationCenterOpen,
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

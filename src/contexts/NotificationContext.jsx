import { createContext, useContext, useState, useEffect } from 'react'

const NotificationContext = createContext()

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false)

  // Load notifications from localStorage on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem('limostar_notifications')
    if (savedNotifications) {
      const parsedNotifications = JSON.parse(savedNotifications)
      setNotifications(parsedNotifications)
      setUnreadCount(parsedNotifications.filter(n => !n.read).length)
    } else {
      // Initialize with some sample notifications
      const initialNotifications = [
        {
          id: 1,
          type: 'trip',
          title: 'New trip assigned',
          message: 'You have been assigned a new trip from Downtown Hotel to Airport Terminal 1',
          timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
          read: false,
          priority: 'high',
          data: {
            tripId: 1,
            client: 'John Smith',
            pickup: 'Downtown Hotel',
            destination: 'Airport Terminal 1'
          }
        },
        {
          id: 2,
          type: 'system',
          title: 'System update',
          message: 'The Limostar CRM has been updated with new features',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          read: false,
          priority: 'medium',
          data: {}
        },
        {
          id: 3,
          type: 'maintenance',
          title: 'Maintenance reminder',
          message: 'Vehicle Limousine #5 is due for maintenance in 3 days',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          read: true,
          priority: 'low',
          data: {
            vehicleId: 5,
            vehicleName: 'Limousine #5'
          }
        }
      ]
      setNotifications(initialNotifications)
      setUnreadCount(initialNotifications.filter(n => !n.read).length)
      localStorage.setItem('limostar_notifications', JSON.stringify(initialNotifications))
    }
  }, [])

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('limostar_notifications', JSON.stringify(notifications))
  }, [notifications])

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
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
  }

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    )
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    )
    setUnreadCount(0)
  }

  const removeNotification = (notificationId) => {
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
    switch (type) {
      case 'trip':
        return '🚗'
      case 'system':
        return '⚙️'
      case 'maintenance':
        return '🔧'
      case 'payment':
        return '💰'
      case 'alert':
        return '⚠️'
      default:
        return '📢'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-red-500 bg-red-50'
      case 'medium':
        return 'border-yellow-500 bg-yellow-50'
      case 'low':
        return 'border-blue-500 bg-blue-50'
      default:
        return 'border-gray-500 bg-gray-50'
    }
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
    getPriorityColor
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}

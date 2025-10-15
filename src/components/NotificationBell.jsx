import { useState, useEffect } from 'react'
import { useNotifications } from '../contexts/NotificationContext'
import { Bell, RefreshCw } from 'lucide-react'

function NotificationBell() {
  const { unreadCount, toggleNotificationCenter, requestNotificationPermission, refreshNotifications } = useNotifications()
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    // Check if notification permission is already granted
    if ('Notification' in window && Notification.permission === 'granted') {
      setPermissionGranted(true)
    }
  }, [])

  const handleClick = async () => {
    // Request permission if not already granted
    if (!permissionGranted && 'Notification' in window) {
      const granted = await requestNotificationPermission()
      setPermissionGranted(granted)
    }
    
    // Toggle notification center
    toggleNotificationCenter()
  }

  const handleRefresh = async (e) => {
    e.stopPropagation()
    setIsRefreshing(true)
    try {
      await refreshNotifications()
      console.log('🔄 Notifications refreshed manually')
    } catch (error) {
      console.error('❌ Error refreshing notifications:', error)
    } finally {
      setTimeout(() => setIsRefreshing(false), 500)
    }
  }

  return (
    <div className="flex items-center space-x-1">
      <button
        onClick={handleRefresh}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        title="Refresh notifications"
      >
        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      </button>
      <button
        onClick={handleClick}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        title="View notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
    </div>
  )
}

export default NotificationBell

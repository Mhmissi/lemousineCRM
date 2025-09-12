import { useState, useEffect } from 'react'
import { useNotifications } from '../contexts/NotificationContext'
import { Bell } from 'lucide-react'

function NotificationBell() {
  const { unreadCount, toggleNotificationCenter, requestNotificationPermission } = useNotifications()
  const [permissionGranted, setPermissionGranted] = useState(false)

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

  return (
    <button
      onClick={handleClick}
      className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
    >
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  )
}

export default NotificationBell

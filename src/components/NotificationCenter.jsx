import { useState } from 'react'
import { useNotifications } from '../contexts/NotificationContext'
import { useLanguage } from '../contexts/LanguageContext'
import { Bell, X, Check, Trash2, Settings, Filter, MapPin, Calendar, Clock, Users, Car, DollarSign } from 'lucide-react'

function NotificationCenter() {
  const { t } = useLanguage()
  const {
    notifications,
    unreadCount,
    isNotificationCenterOpen,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    toggleNotificationCenter,
    formatTimeAgo,
    getNotificationIcon,
    getPriorityColor
  } = useNotifications()

  const [filter, setFilter] = useState('all') // 'all', 'unread', 'trip', 'system', 'maintenance'

  if (!isNotificationCenterOpen) return null

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read
    if (filter === 'trip') return notification.type === 'trip'
    if (filter === 'system') return notification.type === 'system'
    if (filter === 'maintenance') return notification.type === 'maintenance'
    return true
  })

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
  }

  const handleRemoveNotification = (e, notificationId) => {
    e.stopPropagation()
    removeNotification(notificationId)
  }

  // Render trip details if notification contains trip data
  const renderTripDetails = (notification) => {
    if (!notification.data) return null
    
    const { data } = notification
    
    // Check if this is a trip-related notification with details
    if (notification.type === 'trip' && (data.pickup || data.destination || data.client)) {
      return (
        <div className="mt-3 space-y-2 text-xs bg-white bg-opacity-50 p-3 rounded border border-gray-200">
          {data.client && (
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span className="font-semibold text-gray-700">Client:</span>
              <span className="text-gray-900">{data.client}</span>
            </div>
          )}
          
          {data.pickup && (
            <div className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-gray-700">Pickup:</span>
                <span className="text-gray-900 ml-1">{data.pickup}</span>
              </div>
            </div>
          )}
          
          {data.destination && (
            <div className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-gray-700">Destination:</span>
                <span className="text-gray-900 ml-1">{data.destination}</span>
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-4 pt-2 border-t border-gray-200">
            {data.date && (
              <div className="flex items-center space-x-1.5">
                <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="text-gray-900">{data.date}</span>
              </div>
            )}
            
            {(data.startTime || data.time) && (
              <div className="flex items-center space-x-1.5">
                <Clock className="w-4 h-4 text-purple-600 flex-shrink-0" />
                <span className="text-gray-900">{data.startTime || data.time}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {data.vehicle && (
              <div className="flex items-center space-x-1.5">
                <Car className="w-4 h-4 text-gray-600 flex-shrink-0" />
                <span className="text-gray-900">{data.vehicle}</span>
              </div>
            )}
            
            {data.passengers && (
              <div className="flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-orange-600 flex-shrink-0" />
                <span className="text-gray-900">{data.passengers} passengers</span>
              </div>
            )}
            
            {data.revenue && (
              <div className="flex items-center space-x-1.5">
                <DollarSign className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span className="text-gray-900 font-semibold">${data.revenue}</span>
              </div>
            )}
          </div>
        </div>
      )
    }
    
    return null
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={toggleNotificationCenter}
      />
      
      {/* Notification Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <div className="flex items-center space-x-3">
              <Bell className="w-6 h-6 text-gray-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{t('notificationCenter')}</h2>
                {unreadCount > 0 && (
                  <p className="text-sm text-gray-600">
                    {unreadCount} {t('unread')} {t('notifications')}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={toggleNotificationCenter}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={markAllAsRead}
                className="flex items-center space-x-2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
              >
                <Check className="w-4 h-4" />
                <span>{t('markAllAsRead')}</span>
              </button>
              <button
                onClick={clearAllNotifications}
                className="flex items-center space-x-2 px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
                <span>{t('clearAll')}</span>
              </button>
            </div>
            
            {/* Filter Dropdown */}
            <div className="relative">
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-3 py-1 pr-8 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">{t('notifications')}</option>
                <option value="unread">{t('unread')}</option>
                <option value="trip">{t('tripNotifications')}</option>
                <option value="system">{t('systemNotifications')}</option>
                <option value="maintenance">{t('maintenanceNotifications')}</option>
              </select>
              <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-6">
                <Bell className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">{t('noNotifications')}</h3>
                <p className="text-gray-600">
                  {filter === 'unread' 
                    ? 'All notifications have been read'
                    : 'No notifications match your current filter'
                  }
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      {/* Icon */}
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-lg ${getPriorityColor(notification.priority)}`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            
                            {/* Trip Details */}
                            {renderTripDetails(notification)}
                            
                            <div className="flex items-center space-x-2 mt-2">
                              <span className="text-xs text-gray-500">
                                {formatTimeAgo(notification.timestamp)}
                              </span>
                              {!notification.read && (
                                <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                              )}
                            </div>
                          </div>
                          
                          {/* Remove Button */}
                          <button
                            onClick={(e) => handleRemoveNotification(e, notification.id)}
                            className="flex-shrink-0 p-1 hover:bg-gray-200 rounded-lg ml-2"
                          >
                            <X className="w-4 h-4 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-3">
            <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
              <Settings className="w-4 h-4" />
              <span>{t('notificationSettings')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationCenter

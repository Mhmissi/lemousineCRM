// Notification Types Constants
export const NOTIFICATION_TYPES = {
  TRIP_ASSIGNED: 'trip',
  TRIP_STATUS_CHANGED: 'trip',
  TRIP_COMPLETED: 'trip',
  TRIP_CANCELLED: 'trip',
  SYSTEM_ALERT: 'system',
  MAINTENANCE_REMINDER: 'maintenance',
  PAYMENT_RECEIVED: 'payment',
  GENERAL_ALERT: 'alert'
}

// Notification Priority Levels
export const NOTIFICATION_PRIORITIES = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
}

// Notification Icons
export const NOTIFICATION_ICONS = {
  trip: '🚗',
  system: '⚙️',
  maintenance: '🔧',
  payment: '💰',
  alert: '⚠️',
  default: '📢'
}

// Notification Priority Colors
export const NOTIFICATION_COLORS = {
  high: 'border-red-500 bg-red-50',
  medium: 'border-yellow-500 bg-yellow-50',
  low: 'border-blue-500 bg-blue-50',
  default: 'border-gray-500 bg-gray-50'
}


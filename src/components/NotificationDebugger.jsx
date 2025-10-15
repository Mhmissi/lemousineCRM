import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNotifications } from '../contexts/NotificationContext'
import { firestoreService } from '../services/firestoreService'
import { NOTIFICATION_TYPES, NOTIFICATION_PRIORITIES } from '../constants/notificationTypes'
import { collection, query, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'

function NotificationDebugger() {
  const { user } = useAuth()
  const { refreshNotifications } = useNotifications()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [creatingTest, setCreatingTest] = useState(false)
  const [debugInfo, setDebugInfo] = useState('')

  const loadNotifications = async () => {
    if (!user?.id) {
      setLoading(false)
      return
    }
    
    try {
      setLoading(true)
      setError('')
      
      console.log('🔍 Debug: Loading notifications for user:', user.id)
      console.log('🔍 Debug: User email:', user.email)
      console.log('🔍 Debug: User name:', user.name)
      
      // Use the context refresh function
      await refreshNotifications()
      
      // Also get notifications directly for debugging
      const userNotifications = await firestoreService.getNotifications(user.id)
      console.log('🔍 Debug: Raw notifications from Firestore:', userNotifications)
      
      setNotifications(userNotifications)
    } catch (err) {
      console.error('🔍 Debug: Error loading notifications:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Load notifications when component mounts or user changes
  useEffect(() => {
    loadNotifications()
  }, [user?.id])

  const createTestNotification = async () => {
    if (!user?.id) return
    
    try {
      setCreatingTest(true)
      setError('')
      
      console.log('🧪 Creating test notification for user:', user.id)
      console.log('🧪 User details:', { id: user.id, email: user.email, name: user.name })
      
      const notificationData = {
        userId: user.id,
        type: NOTIFICATION_TYPES.TRIP_ASSIGNED,
        title: 'Test Notification',
        message: `This is a test notification for ${user.name}`,
        priority: NOTIFICATION_PRIORITIES.HIGH,
        data: {
          test: true,
          timestamp: new Date().toISOString()
        }
      }
      
      console.log('🧪 Notification data to create:', notificationData)
      
      const testNotification = await firestoreService.addNotification(notificationData)
      
      console.log('🧪 Test notification created successfully:', testNotification.id)
      console.log('🧪 Document reference:', testNotification)
      
      // Wait a moment for Firestore to process
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Refresh notifications in context
      await refreshNotifications()
      
      // Also reload for debug display
      await loadNotifications()
      
    } catch (err) {
      console.error('🧪 Error creating test notification:', err)
      setError(`Failed to create notification: ${err.message}`)
    } finally {
      setCreatingTest(false)
    }
  }

  const checkAllNotifications = async () => {
    try {
      setLoading(true)
      setError('')
      
      console.log('🔍 Checking all notifications in database...')
      
      // Get all notifications (without filtering by userId)
      const notificationsRef = collection(db, 'notifications')
      const q = query(notificationsRef)
      const querySnapshot = await getDocs(q)
      
      const allNotifications = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      console.log('🔍 All notifications in database:', allNotifications)
      console.log('🔍 Current user.id:', user?.id)
      console.log('🔍 Notifications for current user:', allNotifications.filter(n => n.userId === user?.id))
      
      // Show detailed comparison
      const notificationInfo = allNotifications.map(n => {
        const matchesCurrentUser = n.userId === user?.id
        return `- ${n.title}\n  User ID in notification: ${n.userId}\n  Current user ID: ${user?.id}\n  Match: ${matchesCurrentUser ? '✅ YES' : '❌ NO'}\n  Type: ${n.type}\n  Created: ${n.createdAt ? new Date(n.createdAt.seconds * 1000).toLocaleString() : 'N/A'}`
      }).join('\n\n')
      
      alert(`Found ${allNotifications.length} total notifications in database:\n\n${notificationInfo}`)
      
    } catch (err) {
      console.error('🔍 Error checking all notifications:', err)
      setError(`Failed to check notifications: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const checkDriversAndNotifications = async () => {
    try {
      setLoading(true)
      setError('')
      setDebugInfo('')
      
      console.log('🔍 Running comprehensive notification check...')
      
      // Get all drivers
      const driversRef = collection(db, 'drivers')
      const driversSnapshot = await getDocs(driversRef)
      const drivers = driversSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      // Get all profiles
      const profilesRef = collection(db, 'profiles')
      const profilesSnapshot = await getDocs(profilesRef)
      const profiles = profilesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      // Get all notifications
      const notificationsRef = collection(db, 'notifications')
      const notificationsSnapshot = await getDocs(notificationsRef)
      const allNotifications = notificationsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      // Get all trips
      const tripsRef = collection(db, 'trips')
      const tripsSnapshot = await getDocs(tripsRef)
      const trips = tripsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      // Build debug report
      let report = '=== COMPREHENSIVE NOTIFICATION DEBUG REPORT ===\n\n'
      
      report += `📱 CURRENT LOGGED-IN USER:\n`
      report += `  ID: ${user?.id}\n`
      report += `  Email: ${user?.email}\n`
      report += `  Name: ${user?.name}\n`
      report += `  Role: ${user?.role}\n\n`
      
      report += `👥 DRIVERS IN SYSTEM (${drivers.length}):\n`
      drivers.forEach(d => {
        report += `  - ${d.name || d.fullName || 'Unknown'}\n`
        report += `    Email: ${d.email || 'N/A'}\n`
        report += `    Firebase Auth ID: ${d.firebaseAuthId || 'N/A'}\n`
        report += `    Matches current user: ${d.firebaseAuthId === user?.id ? '✅ YES' : '❌ NO'}\n\n`
      })
      
      report += `\n📋 PROFILES WITH DRIVER ROLE (${profiles.filter(p => p.classe === 'driver').length}):\n`
      profiles.filter(p => p.classe === 'driver').forEach(p => {
        report += `  - ${p.name || p.displayName || 'Unknown'}\n`
        report += `    Email: ${p.email || p.username || 'N/A'}\n`
        report += `    Firebase Auth ID: ${p.firebaseAuthId || 'N/A'}\n`
        report += `    Matches current user: ${p.firebaseAuthId === user?.id ? '✅ YES' : '❌ NO'}\n\n`
      })
      
      report += `\n🚗 TRIPS ASSIGNED TO CURRENT USER (${trips.filter(t => t.driverFirebaseAuthId === user?.id).length} / ${trips.length} total):\n`
      const myTrips = trips.filter(t => t.driverFirebaseAuthId === user?.id)
      myTrips.forEach(t => {
        report += `  - ${t.client || 'Unknown'}: ${t.pickup} → ${t.destination}\n`
        report += `    Date: ${t.date} ${t.time || ''}\n`
        report += `    Driver Firebase Auth ID: ${t.driverFirebaseAuthId}\n`
        report += `    Trip ID: ${t.id}\n\n`
      })
      
      report += `\n🔔 NOTIFICATIONS IN SYSTEM (${allNotifications.length}):\n`
      allNotifications.forEach(n => {
        const matchesCurrentUser = n.userId === user?.id
        report += `  ${matchesCurrentUser ? '✅' : '❌'} ${n.title}\n`
        report += `    User ID: ${n.userId}\n`
        report += `    Current User ID: ${user?.id}\n`
        report += `    Match: ${matchesCurrentUser ? 'YES' : 'NO'}\n`
        report += `    Type: ${n.type}\n`
        report += `    Read: ${n.read ? 'Yes' : 'No'}\n`
        report += `    Created: ${n.createdAt ? new Date(n.createdAt.seconds * 1000).toLocaleString() : 'N/A'}\n\n`
      })
      
      report += `\n📊 SUMMARY:\n`
      report += `  - Total drivers with Firebase Auth: ${drivers.filter(d => d.firebaseAuthId).length}\n`
      report += `  - Total trips for current user: ${myTrips.length}\n`
      report += `  - Total notifications in system: ${allNotifications.length}\n`
      report += `  - Notifications for current user: ${allNotifications.filter(n => n.userId === user?.id).length}\n`
      report += `  - Unread notifications for current user: ${allNotifications.filter(n => n.userId === user?.id && !n.read).length}\n`
      
      console.log(report)
      setDebugInfo(report)
      
      // Also show in alert
      alert('Debug report generated! Check the component display and browser console for full details.')
      
    } catch (err) {
      console.error('🔍 Error in comprehensive check:', err)
      setError(`Failed to run comprehensive check: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="p-4 bg-yellow-50 rounded-lg m-4">Loading notification debug info...</div>

  if (!user?.id) {
    return (
      <div className="p-4 bg-red-50 rounded-lg m-4">
        <h3 className="text-lg font-bold mb-2">🔍 Notification Debug Info</h3>
        <p className="text-red-600">No user logged in. Please log in to view notifications.</p>
      </div>
    )
  }

  return (
    <div className="p-4 bg-blue-50 rounded-lg m-4">
      <h3 className="text-lg font-bold mb-4">🔍 Notification Debug Info</h3>
      
      <div className="mb-4">
        <h4 className="font-semibold">Current User:</h4>
        <div className="text-sm bg-white p-2 rounded">
          <div><strong>ID:</strong> {user?.id}</div>
          <div><strong>Email:</strong> {user?.email}</div>
          <div><strong>Name:</strong> {user?.name}</div>
          <div><strong>Role:</strong> {user?.role}</div>
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="font-semibold">Notifications Found ({notifications.length}):</h4>
        {error && <div className="text-red-600 text-sm mb-2">Error: {error}</div>}
        <div className="text-sm space-y-2 max-h-40 overflow-y-auto">
          {notifications.map(notification => (
            <div key={notification.id} className="bg-white p-2 rounded text-xs">
              <div><strong>ID:</strong> {notification.id}</div>
              <div><strong>User ID:</strong> {notification.userId}</div>
              <div><strong>Type:</strong> {notification.type}</div>
              <div><strong>Title:</strong> {notification.title}</div>
              <div><strong>Message:</strong> {notification.message}</div>
              <div><strong>Read:</strong> {notification.read ? 'Yes' : 'No'}</div>
              <div><strong>Created:</strong> {notification.createdAt?.toString()}</div>
            </div>
          ))}
          {notifications.length === 0 && (
            <div className="bg-white p-2 rounded text-xs text-gray-500">
              No notifications found for this user
            </div>
          )}
        </div>
      </div>
      
      <div className="mb-4">
        <h4 className="font-semibold">Actions:</h4>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={createTestNotification}
            disabled={creatingTest}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50"
          >
            {creatingTest ? 'Creating...' : 'Create Test Notification'}
          </button>
          <button
            onClick={loadNotifications}
            disabled={loading}
            className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Reload Notifications'}
          </button>
          <button
            onClick={checkAllNotifications}
            disabled={loading}
            className="px-3 py-1 bg-purple-500 text-white rounded text-sm hover:bg-purple-600 disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Check All Notifications'}
          </button>
          <button
            onClick={checkDriversAndNotifications}
            disabled={loading}
            className="px-3 py-1 bg-orange-500 text-white rounded text-sm hover:bg-orange-600 disabled:opacity-50"
          >
            {loading ? 'Checking...' : '🔍 Comprehensive Check'}
          </button>
        </div>
      </div>
      
      {debugInfo && (
        <div className="mb-4">
          <h4 className="font-semibold mb-2">Comprehensive Debug Report:</h4>
          <pre className="text-xs bg-white p-3 rounded max-h-96 overflow-y-auto whitespace-pre-wrap font-mono border border-gray-300">
            {debugInfo}
          </pre>
        </div>
      )}
      
      <div className="text-xs text-gray-600">
        <strong>Debug Info:</strong> Check browser console for detailed logs
      </div>
    </div>
  )
}

export default NotificationDebugger

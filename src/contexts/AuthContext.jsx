import { createContext, useContext, useState, useEffect } from 'react'
import { auth, db } from '../config/firebase'
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth'
import { collection, query, where, getDocs } from 'firebase/firestore'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Function to fetch user role from Firestore
  const fetchUserRole = async (firebaseUser) => {
    try {
      console.log('🔍 Fetching user role for:', firebaseUser.email, 'UID:', firebaseUser.uid)
      
      // Check in drivers collection first
      const driversQuery = query(
        collection(db, 'drivers'),
        where('firebaseAuthId', '==', firebaseUser.uid)
      )
      const driversSnapshot = await getDocs(driversQuery)
      
      if (!driversSnapshot.empty) {
        const driverData = driversSnapshot.docs[0].data()
        console.log('✅ Found user in drivers collection:', driverData)
        return 'driver'
      }
      
      // Check in profiles collection
      const profilesQuery = query(
        collection(db, 'profiles'),
        where('firebaseAuthId', '==', firebaseUser.uid)
      )
      const profilesSnapshot = await getDocs(profilesQuery)
      
      if (!profilesSnapshot.empty) {
        const profileData = profilesSnapshot.docs[0].data()
        console.log('✅ Found user in profiles collection:', profileData)
        // Normalize the classe field: if it's admin/owner/manager, return 'owner', otherwise 'driver'
        const classe = profileData.classe || 'driver'
        if (classe === 'admin' || classe === 'owner' || classe === 'manager') {
          console.log('👑 User is owner/admin/manager, setting role to: owner')
          return 'owner'
        }
        return 'driver'
      }
      
      // Default: if email contains 'owner' or 'admin', treat as owner
      if (firebaseUser.email.includes('owner') || firebaseUser.email.includes('admin')) {
        console.log('⚠️ No Firestore record found, using email-based detection: owner')
        return 'owner'
      }
      
      // Default to driver if nothing else matches
      console.log('⚠️ No Firestore record found, defaulting to: driver')
      return 'driver'
      
    } catch (error) {
      console.error('❌ Error fetching user role:', error)
      // Fallback to email-based detection
      if (firebaseUser.email.includes('owner') || firebaseUser.email.includes('admin')) {
        return 'owner'
      }
      return 'driver'
    }
  }

  useEffect(() => {
    // Listen for Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch the user's role from Firestore
        const role = await fetchUserRole(firebaseUser)
        
        // Map Firebase user to our app user format
        const appUser = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          role: role
        }
        
        console.log('👤 User authenticated:', appUser)
        setUser(appUser)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user
      
      // Fetch the user's role from Firestore
      const role = await fetchUserRole(firebaseUser)
      
      const appUser = {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
        role: role
      }
      
      console.log('✅ Login successful:', appUser)
      return { success: true, user: appUser }
    } catch (error) {
      console.error('❌ Login error:', error)
      
      // If user doesn't exist, provide helpful error message
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        return { success: false, error: 'Invalid email or password. Please create an account first.' }
      }
      
      return { success: false, error: error.message }
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const value = {
    user,
    login,
    logout,
    loading
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

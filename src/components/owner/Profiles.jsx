import React, { useState, useEffect, useRef, useCallback } from 'react'
import { User, Search, Plus, Edit, Trash2, Grid3X3, Printer, Lock } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import { firestoreService } from '../../services/firestoreService'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { auth } from '../../config/firebase'
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'
import jsPDF from 'jspdf'

const Profiles = () => {
  const { t } = useLanguage()
  const [profiles, setProfiles] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [displayCount, setDisplayCount] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showModifyModal, setShowModifyModal] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const isMountedRef = useRef(true)

  // Mock profile data based on the image
  const mockProfiles = [
    { id: 1, name: 'kadour', username: 'kadour', password: 'kadour2019', classe: 'user', dateCreation: '2019-12-17' },
    { id: 2, name: 'LIMOSTAR', username: 'limostar', password: '196619776543', classe: 'admin', dateCreation: '2017-12-03' },
    { id: 3, name: 'Manager', username: 'manager', password: 'manager2024', classe: 'manager', dateCreation: '2024-01-15' },
    { id: 4, name: 'Driver', username: 'driver', password: 'driver2024', classe: 'driver', dateCreation: '2024-01-20' },
    { id: 5, name: 'Reception', username: 'reception', password: 'reception2024', classe: 'reception', dateCreation: '2024-02-01' },
    { id: 6, name: 'Accountant', username: 'accountant', password: 'accountant2024', classe: 'accountant', dateCreation: '2024-02-05' },
    { id: 7, name: 'Supervisor', username: 'supervisor', password: 'supervisor2024', classe: 'supervisor', dateCreation: '2024-02-10' },
    { id: 8, name: 'Operator', username: 'operator', password: 'operator2024', classe: 'operator', dateCreation: '2024-02-15' },
    { id: 9, name: 'Technician', username: 'technician', password: 'technician2024', classe: 'technician', dateCreation: '2024-02-20' },
    { id: 10, name: 'Assistant', username: 'assistant', password: 'assistant2024', classe: 'assistant', dateCreation: '2024-02-25' }
  ]

  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    classe: 'driver'
  })

  const [errors, setErrors] = useState({})

  // Helper function to convert Firebase timestamp to readable date
  const formatFirebaseDate = (dateField) => {
    if (!dateField) return new Date().toISOString().split('T')[0]
    
    // If it's a Firebase timestamp object
    if (dateField && typeof dateField === 'object' && dateField.seconds) {
      return new Date(dateField.seconds * 1000).toISOString().split('T')[0]
    }
    
    // If it's already a Date object
    if (dateField instanceof Date) {
      return dateField.toISOString().split('T')[0]
    }
    
    // If it's a string, try to parse it
    if (typeof dateField === 'string') {
      return new Date(dateField).toISOString().split('T')[0]
    }
    
    return new Date().toISOString().split('T')[0]
  }

  // Helper function to safely render any field that might be a Firebase object
  const safeRenderField = (field) => {
    if (field === null || field === undefined) return ''
    
    // If it's a Firebase timestamp object
    if (typeof field === 'object' && field.seconds) {
      return formatFirebaseDate(field)
    }
    
    // If it's a Date object
    if (field instanceof Date) {
      return field.toISOString().split('T')[0]
    }
    
    // If it's an object (but not a timestamp), convert to string
    if (typeof field === 'object') {
      return JSON.stringify(field)
    }
    
    // For strings, numbers, booleans, return as-is
    return String(field)
  }

  // Load profiles from Firebase Authentication and Firestore
  const loadProfiles = useCallback(async () => {
    
    try {
      setLoading(true)
      setError('')
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout after 10 seconds')), 10000)
      })
      
      let allProfiles = []
      
      // 1. Get real Firebase Authentication users (drivers only)
      try {
        
        // Note: We can't directly list Firebase Auth users from client side
        // Instead, we'll get drivers from Firestore that have firebaseAuthId (real authenticated drivers)
        // This will be handled in the drivers section below
        allProfiles = []
        
      } catch (authError) {
      }
      
      // 2. Get Firestore profiles collection (profiles with Firebase Auth accounts)
      try {
        const firestoreProfiles = await Promise.race([
          firestoreService.getProfiles(),
          timeoutPromise
        ])
        
        // Add Firestore profiles that have Firebase Auth accounts
        if (Array.isArray(firestoreProfiles)) {
          const mappedFirestoreProfiles = firestoreProfiles
            .filter(profile => profile.firebaseAuthId) // Only include profiles with Firebase Auth
            .map(profile => {
              try {
                return {
                  id: profile.id || `profile-${Math.random()}`,
                  name: profile.name || profile.displayName || profile.fullName || 'Unknown User',
                  username: profile.username || profile.userName || profile.login || '',
                  password: profile.password || profile.pass || '********',
                  classe: profile.classe || profile.class || profile.role || profile.type || 'user',
                  dateCreation: formatFirebaseDate(profile.dateCreation || profile.createdAt || profile.created),
                  source: 'profile',
                  email: profile.email || profile.username || '',
                  firebaseAuthId: profile.firebaseAuthId,
                  profileId: profile.id,
                  ...profile
                }
              } catch (mapError) {
                return null
              }
            }).filter(Boolean) // Remove any null entries
          
          allProfiles = [...allProfiles, ...mappedFirestoreProfiles]
        }
        
      } catch (firestoreError) {
        
        // Fallback: Try direct Firebase query
        try {
          const profilesQuery = query(collection(db, 'profiles'), orderBy('createdAt', 'desc'))
          const profilesSnapshot = await getDocs(profilesQuery)
          const directProfiles = profilesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
          
          if (directProfiles.length > 0) {
            const mappedDirectProfiles = directProfiles
              .filter(profile => profile.firebaseAuthId) // Only include profiles with Firebase Auth
              .map(profile => {
                try {
                  return {
                    id: profile.id || `profile-${Math.random()}`,
                    name: profile.name || profile.displayName || profile.fullName || 'Unknown User',
                    username: profile.username || profile.userName || profile.login || '',
                    password: profile.password || profile.pass || '********',
                    classe: profile.classe || profile.class || profile.role || profile.type || 'user',
                    dateCreation: formatFirebaseDate(profile.dateCreation || profile.createdAt || profile.created),
                    source: 'profile',
                    email: profile.email || profile.username || '',
                    firebaseAuthId: profile.firebaseAuthId,
                    profileId: profile.id,
                    ...profile
                  }
                } catch (mapError) {
                  return null
                }
              }).filter(Boolean)
            
            allProfiles = [...allProfiles, ...mappedDirectProfiles]
          }
        } catch (directError) {
        }
      }
      
      // 3. Get drivers from Firestore (they have Firebase Auth accounts)
      try {
        const driversData = await Promise.race([
          firestoreService.getDrivers(),
          timeoutPromise
        ])
        
        // Convert drivers to profiles (only those with Firebase Auth accounts)
        if (Array.isArray(driversData)) {
          const driverProfiles = driversData
            .filter(driver => driver.firebaseAuthId) // Only include drivers with Firebase Auth accounts
            .map(driver => {
              try {
                return {
                  id: driver.id || `driver-${Math.random()}`,
                  name: driver.name || driver.fullName || driver.displayName || 'Unknown Driver',
                  username: driver.email || driver.emailAddress || '',
                  password: '********', // Drivers don't have passwords in drivers collection
                  classe: 'driver', // All drivers have driver role
                  dateCreation: formatFirebaseDate(driver.createdAt || driver.dateCreation),
                  source: 'driver',
                  email: driver.email || driver.emailAddress || '',
                  phone: driver.phone || driver.phoneNumber || driver.mobile || '',
                  status: driver.active ? 'active' : 'inactive',
                  license: driver.license || driver.driverLicense || driver.licenseNumber || '',
                  experience: driver.experience || driver.yearsExperience || 0,
                  rating: driver.rating || driver.averageRating || 0,
                  firebaseAuthId: driver.firebaseAuthId, // Link to Firebase Auth
                  driverId: driver.id, // Keep reference to original driver record
                  ...driver
                }
              } catch (mapError) {
                return null
              }
            }).filter(Boolean) // Remove any null entries
          
          allProfiles = [...allProfiles, ...driverProfiles]
        }
        
      } catch (driversError) {
        
        // Fallback: Try direct Firebase query
        try {
          const driversQuery = query(collection(db, 'drivers'), orderBy('createdAt', 'desc'))
          const driversSnapshot = await getDocs(driversQuery)
          const directDrivers = driversSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
          
          if (directDrivers.length > 0) {
            const mappedDirectDrivers = directDrivers
              .filter(driver => driver.firebaseAuthId) // Only include drivers with Firebase Auth accounts
              .map(driver => {
                try {
                  return {
                    id: driver.id || `driver-${Math.random()}`,
                    name: driver.name || driver.fullName || driver.displayName || 'Unknown Driver',
                    username: driver.email || driver.emailAddress || '',
                    password: '********',
                    classe: 'driver',
                    dateCreation: formatFirebaseDate(driver.createdAt || driver.dateCreation),
                    source: 'driver',
                    email: driver.email || driver.emailAddress || '',
                    phone: driver.phone || driver.phoneNumber || driver.mobile || '',
                    status: driver.active ? 'active' : 'inactive',
                    license: driver.license || driver.driverLicense || driver.licenseNumber || '',
                    experience: driver.experience || driver.yearsExperience || 0,
                    rating: driver.rating || driver.averageRating || 0,
                    firebaseAuthId: driver.firebaseAuthId,
                    driverId: driver.id,
                    ...driver
                  }
                } catch (mapError) {
                  return null
                }
              }).filter(Boolean)
            
            allProfiles = [...allProfiles, ...mappedDirectDrivers]
          }
        } catch (directError) {
        }
      }
      
      // Filter to only show profiles with Firebase Auth accounts (both drivers and profiles)
      const mergedProfiles = allProfiles.filter(profile => {
        try {
          if (!profile || !profile.source) {
            return false
          }
          
          // Keep both drivers and profiles with Firebase Auth accounts
          return (profile.source === 'driver' || profile.source === 'profile') && profile.firebaseAuthId
        } catch (filterError) {
          return false
        }
      })
      
      // Remove duplicates based on email/username (since we only have drivers now)
      const uniqueProfiles = mergedProfiles.filter((profile, index, self) => {
        try {
          if (!profile || !profile.username) {
            return true
          }

          const existingProfile = self.find(p => 
            p && p !== profile && p.username && profile.username &&
            (p.username === profile.username || (p.email && profile.email && p.email === profile.email))
          )
          
          return !existingProfile // Keep only unique profiles
        } catch (dedupError) {
          return true
        }
      })
      
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setProfiles(uniqueProfiles)
        setError('')
      } else {
      }
    } catch (error) {
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setError(`Failed to load profiles: ${error.message}`)
        setProfiles([])
      }
    } finally {
      // Only update loading state if component is still mounted
      if (isMountedRef.current) {
        setLoading(false)
      } else {
      }
    }
  }, [])

  useEffect(() => {
    isMountedRef.current = true
    loadProfiles()
    
    // Cleanup function
    return () => {
      isMountedRef.current = false
    }
  }, []) // Remove loadProfiles dependency to prevent infinite loop

  // Filter profiles based on search term
  const filteredProfiles = profiles.filter(profile =>
    profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    profile.classe.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculate pagination
  const totalPages = Math.ceil(filteredProfiles.length / displayCount)
  const startIndex = (currentPage - 1) * displayCount
  const endIndex = startIndex + displayCount
  const currentProfiles = filteredProfiles.slice(startIndex, endIndex)

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1) // Reset to first page when searching
  }

  const handleDisplayCountChange = (e) => {
    setDisplayCount(parseInt(e.target.value))
    setCurrentPage(1) // Reset to first page when changing display count
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleAddProfile = () => {
    setShowAddModal(true)
  }

  const handleModifyProfile = (profile) => {
    setSelectedProfile(profile)
    setFormData({
      name: profile.name,
      username: profile.username,
      password: profile.password,
      classe: profile.classe
    })
    setShowModifyModal(true)
  }

  const handleDeleteProfile = async (profileId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce profil ?')) {
      try {
        setLoading(true)
        
        // Delete the profile record
        const profile = profiles.find(p => p.id === profileId)
        if (profile && profile.source === 'driver' && profile.driverId) {
          await firestoreService.deleteDriver(profile.driverId)
        } else if (profile && profile.source === 'profile' && profile.profileId) {
          await firestoreService.deleteProfile(profile.profileId)
        } else {
          throw new Error('Profile ID not found')
        }
        
        // Reload profiles from Firebase
        await loadProfiles()
        
      } catch (error) {
        setError(`Failed to delete profile: ${error.message}`)
      } finally {
        setLoading(false)
      }
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis'
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Le nom d\'utilisateur est requis'
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Le mot de passe est requis'
    }

    if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)

    if (showAddModal) {
      // Create Firebase Authentication account first
      const userCredential = await createUserWithEmailAndPassword(auth, formData.username, formData.password)
      const firebaseUser = userCredential.user
      
      
      // Send email verification
      try {
        await sendEmailVerification(firebaseUser)
      } catch (emailError) {
      }
      
      // Add profile to Firestore with Firebase Auth link
      const profileData = {
        name: formData.name,
        username: formData.username,
        password: '********', // Don't store actual password
        classe: formData.classe,
        dateCreation: new Date().toISOString().split('T')[0],
        firebaseAuthId: firebaseUser.uid, // Link to Firebase Auth
        email: formData.username // Store email for reference
      }
      
      
      const profileId = await firestoreService.addProfile(profileData)
      
      // Show success message
      alert(`Profile created successfully!\nFirebase Auth ID: ${firebaseUser.uid}\nEmail verification sent to ${formData.username}`)
        
    } else if (showModifyModal) {
      // Modify existing profile
        const profileData = {
          name: formData.name,
          username: formData.username,
          password: formData.password,
          classe: formData.classe
        }
        
        
        // Update the profile record in Firestore
        if (selectedProfile.source === 'driver') {
          // Update driver record
          const driverData = {
            name: profileData.name,
            email: profileData.username, // username field contains email for drivers
            phone: selectedProfile.phone || '',
            active: profileData.classe === 'driver', // Keep as active driver
            updatedAt: new Date()
          }
          
          await firestoreService.updateDriver(selectedProfile.driverId, driverData)
        } else {
          // Update profile record
          const updateData = {
            name: profileData.name,
            username: profileData.username,
            classe: profileData.classe,
            updatedAt: new Date()
          }
          
          await firestoreService.updateProfile(selectedProfile.profileId, updateData)
        }
      }

      // Reload profiles from Firebase
      await loadProfiles()

    // Reset form and close modal
    setFormData({
      name: '',
      username: '',
      password: '',
        classe: 'driver'
    })
    setErrors({})
    setShowAddModal(false)
    setShowModifyModal(false)
    setSelectedProfile(null)
      
    } catch (error) {
      setError(`Failed to save profile: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setShowModifyModal(false)
    setSelectedProfile(null)
    setErrors({})
    setFormData({
      name: '',
      username: '',
      password: '',
        classe: 'driver'
    })
  }

  const handlePrint = () => {
    if (profiles.length === 0) {
      alert('No profiles to print')
      return
    }

    try {
      // Create new PDF document
      const pdf = new jsPDF()
      
      // Set up PDF styling
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 20
      const contentWidth = pageWidth - (margin * 2)
      
      let yPosition = margin
      
      // Add title
      pdf.setFontSize(20)
      pdf.setFont('helvetica', 'bold')
      pdf.text('User Profiles Report', margin, yPosition)
      yPosition += 15
      
      // Add date
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, yPosition)
      yPosition += 20
      
      // Add table headers
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      const headers = ['Name', 'Username', 'Class', 'Creation Date']
      const colWidths = [40, 40, 30, 40]
      let xPosition = margin
      
      // Draw header row
      headers.forEach((header, index) => {
        pdf.text(header, xPosition, yPosition)
        xPosition += colWidths[index]
      })
      
      yPosition += 10
      
      // Draw line under headers
      pdf.setLineWidth(0.5)
      pdf.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 5
      
      // Add profiles data
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'normal')
      
      filteredProfiles.forEach((profile, index) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 40) {
          pdf.addPage()
          yPosition = margin
        }
        
        xPosition = margin
        
        // Add row data
        const rowData = [
          profile.name || '',
          profile.username || '',
          profile.classe || '',
          safeRenderField(profile.dateCreation)
        ]
        
        rowData.forEach((data, colIndex) => {
          // Truncate long text
          let displayText = data
          if (colIndex === 0 && data.length > 20) { // Name column
            displayText = data.substring(0, 17) + '...'
          } else if (colIndex === 1 && data.length > 20) { // Username column
            displayText = data.substring(0, 17) + '...'
          }
          
          pdf.text(displayText, xPosition, yPosition)
          xPosition += colWidths[colIndex]
        })
        
        yPosition += 8
        
        // Add separator line every 5 rows
        if ((index + 1) % 5 === 0 && index < filteredProfiles.length - 1) {
          pdf.setLineWidth(0.2)
          pdf.line(margin, yPosition, pageWidth - margin, yPosition)
          yPosition += 5
        }
      })
      
      // Add summary at the end
      yPosition += 15
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.text(`Total Profiles: ${filteredProfiles.length}`, margin, yPosition)
      
      // Save the PDF
      const fileName = `profiles-report-${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)
      
    } catch (error) {
      alert('Error generating PDF. Please try again.')
    }
  }

  const getClasseColor = (classe) => {
    switch (classe) {
      case 'admin':
        return 'bg-red-100 text-red-800'
      case 'manager':
        return 'bg-blue-100 text-blue-800'
      case 'user':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <>
    <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 min-h-screen pb-20 lg:pb-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#FFF8DC' }}>
              <User className="w-5 h-5 lg:w-6 lg:h-6" style={{ color: '#DAA520' }} />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">User Profiles Management</h1>
              <p className="text-sm lg:text-base text-gray-600">Admin/Owner and Driver profiles with Firebase Authentication</p>
            </div>
          </div>
        </div>
        
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-xs lg:text-sm text-gray-500">
          <span>Home</span>
          <span>/</span>
          <span className="text-gray-900 font-medium">{t('profilesTitle')}</span>
        </nav>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-red-800">
              <strong>Error:</strong> {error}
            </div>
            <button
              onClick={loadProfiles}
              className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Add Profile Button */}
      <div className="mb-8">
        <button
          onClick={handleAddProfile}
          className="flex items-center space-x-2 px-4 py-3 text-white rounded-lg shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200"
          style={{ backgroundColor: '#DAA520' }}
        >
          <Lock className="w-5 h-5" />
          <span className="hidden sm:inline">{t('addProfile')}</span>
          <span className="sm:hidden">Ajouter</span>
        </button>
      </div>

      {/* Profiles Table */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Table Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-2">
                <Grid3X3 className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">{t('profilesTable')}</h2>
              </div>
              
              <button
                onClick={handlePrint}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">{t('print')}</span>
              </button>
            </div>
          </div>

          {/* Search and Display Controls */}
          <div className="p-6 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
              {/* Search */}
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder={t('search') + '...'}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent w-full sm:w-64"
                  />
                </div>
              </div>

              {/* Display Count */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">{t('display')}:</label>
                <select
                  value={displayCount}
                  onChange={handleDisplayCountChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          </div>
        </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DAA520]"></div>
                <span className="ml-4 text-gray-600">Loading profiles...</span>
              </div>
            ) : filteredProfiles.length === 0 ? (
              <div className="text-center py-12">
                <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No profiles found</h3>
                <p className="text-gray-600 mb-4">
                  {profiles.length === 0 
                    ? "Get started by creating your first profile."
                    : "No profiles match your search criteria."
                  }
                </p>
                {profiles.length === 0 && (
                  <button
                    onClick={handleAddProfile}
                    className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl text-sm lg:text-base mx-auto"
                    style={{ backgroundColor: '#DAA520' }}
                  >
                    <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
                    <span>Create Profile</span>
                  </button>
                )}
              </div>
            ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('name')}</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">{t('username')}</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">{t('password')}</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('class')}</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">{t('creationDate')}</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">Source</th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentProfiles.map((profile) => (
                  <tr key={profile.id} className="hover:bg-gray-50">
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                      {profile.name}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900 hidden sm:table-cell">
                      {profile.username}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 font-mono hidden md:table-cell">
                      {profile.password}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getClasseColor(profile.classe)}`}>
                        {profile.classe}
                      </span>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                      {safeRenderField(profile.dateCreation)}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 hidden xl:table-cell">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        profile.classe === 'admin' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {profile.classe === 'admin' ? 'Admin/Owner' : 'Driver'}
                      </span>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-1 lg:space-x-2">
                        <button
                          onClick={() => handleModifyProfile(profile)}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Edit driver profile"
                        >
                          <Edit className="w-3 h-3 lg:w-4 lg:h-4" />
                        </button>
                          <button
                            onClick={() => handleDeleteProfile(profile.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                          title="Delete driver profile"
                          >
                            <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
                          </button>
                        <span className="text-gray-400 text-xs" title="Real driver with Firebase Authentication">
                          Firebase Auth
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>

          {/* Table Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
              <div className="text-sm text-gray-700">
                {t('display')} {startIndex + 1} à {Math.min(endIndex, filteredProfiles.length)} de {filteredProfiles.length} {t('records')}
              </div>
              
              {/* Pagination */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="hidden sm:inline">{t('first')}</span>
                  <span className="sm:hidden">««</span>
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="hidden sm:inline">{t('previous')}</span>
                  <span className="sm:hidden">‹</span>
                </button>
                
                {/* Page Numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 text-sm border rounded ${
                        currentPage === pageNum
                          ? 'bg-[#DAA520] text-white border-[#DAA520]'
                          : 'border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="hidden sm:inline">{t('next')}</span>
                  <span className="sm:hidden">›</span>
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="hidden sm:inline">{t('last')}</span>
                  <span className="sm:hidden">»»</span>
                </button>
              </div>
          </div>
        </div>
      </div>
    </div>

    {/* Add Profile Modal */}
    {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Lock className="w-6 h-6" style={{ color: '#DAA520' }} />
                <h2 className="text-2xl font-bold text-gray-900">{t('addProfile')}</h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#DAA520]"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Two Profile Types:</strong>
                  <br/>• <strong>Admin/Owner</strong>: Full access to Owner Dashboard (manage everything)
                  <br/>• <strong>Driver</strong>: Access to Driver Dashboard (view trips, update status)
                  <br/>A Firebase Authentication account will be created automatically.
                </p>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
{t('name')} *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={t('profileName')}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
{t('username')} *
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent ${
                      errors.username ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={t('username')}
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
{t('password')} *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={t('password')}
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
{t('class')}
                  </label>
                  <select
                    value={formData.classe}
                    onChange={(e) => handleInputChange('classe', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                  >
                    <option value="admin">Admin/Owner - Access to Owner Dashboard</option>
                    <option value="driver">Driver - Access to Driver Dashboard</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
{t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:ring-offset-2"
                  style={{ backgroundColor: '#DAA520' }}
                >
{t('add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modify Profile Modal */}
      {showModifyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Edit className="w-6 h-6 text-green-600" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
                  <p className="text-sm text-green-600 mt-1">
                    Editing {selectedProfile?.source === 'driver' ? 'driver' : 'profile'} with Firebase Authentication account
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#DAA520]"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This profile has a Firebase Authentication account. 
                  <br/>• <strong>Admin/Owner</strong>: Access to Owner Dashboard
                  <br/>• <strong>Driver</strong>: Access to Driver Dashboard
                  <br/>Changes will be saved to Firestore and can be managed through the Firebase Console.
                </p>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
{t('name')} *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={t('profileName')}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
{t('username')} *
                  </label>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent ${
                      errors.username ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={t('username')}
                  />
                  {errors.username && (
                    <p className="mt-1 text-sm text-red-600">{errors.username}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
{t('password')} *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={t('password')}
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
{t('class')}
                  </label>
                  <select
                    value={formData.classe}
                    onChange={(e) => handleInputChange('classe', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                  >
                    <option value="admin">Admin/Owner - Access to Owner Dashboard</option>
                    <option value="driver">Driver - Access to Driver Dashboard</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
{t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
{t('modify')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default Profiles

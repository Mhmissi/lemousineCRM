import React, { useState, useEffect, useRef, useCallback } from 'react'
import { User, Search, Plus, Edit, Trash2, Grid3X3, Printer } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import { firestoreService } from '../../services/firestoreService'
import { auth } from '../../config/firebase'
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth'

const Drivers = () => {
  const { t } = useLanguage()
  const [drivers, setDrivers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [displayCount, setDisplayCount] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showModifyModal, setShowModifyModal] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const isMountedRef = useRef(true)


  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    status: 'active'
  })

  const [errors, setErrors] = useState({})

  const loadDrivers = useCallback(async () => {
    
    try {
      setLoading(true)
      setError('')
      
      // Fetch from both collections in parallel
      const [driversData, profilesData] = await Promise.all([
        firestoreService.getDrivers(),
        firestoreService.getProfiles()
      ])
      
      
      // ONLY get drivers that have Firebase Auth IDs (real authenticated drivers)
      const realDriversFromDriversCollection = driversData
        .filter(driver => driver.firebaseAuthId) // Must have Firebase Auth
        .map(driver => ({
          id: driver.id,
          name: driver.name || driver.fullName || driver.displayName || 'Unknown Driver',
          email: driver.email || driver.emailAddress || '',
          phone: driver.phone || driver.phoneNumber || driver.mobile || '',
          status: driver.status || driver.driverStatus || (driver.active ? 'active' : 'inactive'),
          license: driver.license || driver.driverLicense || driver.licenseNumber || '',
          experience: driver.experience || driver.yearsExperience || 0,
          rating: driver.rating || driver.averageRating || 0,
          source: 'drivers',
          firebaseAuthId: driver.firebaseAuthId,
          ...driver
        }))
      
      // ONLY get profiles that are drivers AND have Firebase Auth IDs
      const realDriversFromProfiles = profilesData
        .filter(profile => profile.classe === 'driver' && profile.firebaseAuthId)
        .map(profile => ({
          id: profile.id,
          name: profile.name || profile.displayName || profile.fullName || 'Unknown Driver',
          email: profile.email || profile.username || '',
          phone: profile.phone || profile.phoneNumber || '',
          status: 'active',
          license: '',
          experience: 0,
          rating: 0,
          source: 'profiles',
          firebaseAuthId: profile.firebaseAuthId,
          ...profile
        }))
      
      
      // Combine and remove duplicates based on email
      const allRealDrivers = [...realDriversFromDriversCollection, ...realDriversFromProfiles]
      
      // Deduplicate: prioritize drivers collection over profiles
      const uniqueDrivers = allRealDrivers.reduce((acc, driver) => {
        const existingDriver = acc.find(d => d.email === driver.email)
        if (!existingDriver) {
          acc.push(driver)
        } else if (driver.source === 'drivers' && existingDriver.source === 'profiles') {
          // Replace profile with driver record if both exist
          const index = acc.findIndex(d => d.email === driver.email)
          acc[index] = driver
        }
        return acc
      }, [])
      
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setDrivers(uniqueDrivers)
        setError('')
      }
    } catch (error) {
      if (isMountedRef.current) {
        setError(`Failed to load drivers: ${error.message}`)
        setDrivers([])
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    isMountedRef.current = true
    loadDrivers()
    
    // Cleanup function
    return () => {
      isMountedRef.current = false
    }
  }, [loadDrivers])

  // Filter drivers based on search term
  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculate pagination
  const totalPages = Math.ceil(filteredDrivers.length / displayCount)
  const startIndex = (currentPage - 1) * displayCount
  const endIndex = startIndex + displayCount
  const currentDrivers = filteredDrivers.slice(startIndex, endIndex)

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

  const handleAddDriver = () => {
    setShowAddModal(true)
  }

  const handleModifyDriver = (driver) => {
    setSelectedDriver(driver)
    setFormData({
      name: driver.name,
      email: driver.email,
      phone: driver.phone || '',
      status: driver.active ? 'active' : 'inactive'
    })
    setShowModifyModal(true)
  }

  const handleDeleteDriver = (driverId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce chauffeur ?')) {
      setDrivers(prev => prev.filter(driver => driver.id !== driverId))
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
      newErrors.name = 'Le nom du chauffeur est requis'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'L\'email n\'est pas valide'
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Le mot de passe est requis'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Le téléphone est requis'
    }

    if (!formData.status || formData.status === 'Driver status') {
      newErrors.status = 'Veuillez sélectionner un statut'
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
        // Create Firebase Authentication user first
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
        const firebaseUser = userCredential.user
        
        
        // Send email verification
        try {
          await sendEmailVerification(firebaseUser)
        } catch (emailError) {
          // Don't fail the whole process if email verification fails
        }
        
        // Add driver to Firestore
        const newDriver = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          active: formData.status === 'active',
          firebaseAuthId: firebaseUser.uid, // Link to Firebase Auth user
          createdAt: new Date(),
          updatedAt: new Date()
        }
        
        
        const docRef = await firestoreService.addDriver(newDriver)
        const addedDriver = { id: docRef.id, ...newDriver }
        
        
        // Show success message
        alert(`Driver created successfully! Firebase Auth ID: ${firebaseUser.uid}\nEmail verification sent to ${formData.email}`)
        
        // Reload drivers instead of just adding to state
        await loadDrivers()
      } else if (showModifyModal) {
        // Update existing driver in Firestore
        const updatedDriver = {
          ...selectedDriver,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          active: formData.status === 'active',
          updatedAt: new Date()
        }
        
        await firestoreService.updateDriver(selectedDriver.id, updatedDriver)
        
        setDrivers(prev => prev.map(driver => 
          driver.id === selectedDriver.id ? updatedDriver : driver
        ))
      }

      // Reset form and close modal
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        status: 'active'
      })
      setErrors({})
      setShowAddModal(false)
      setShowModifyModal(false)
      setSelectedDriver(null)
    } catch (error) {
      
      // Handle specific Firebase Auth errors
      let errorMessage = error.message
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Un chauffeur avec cet email existe déjà'
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Le mot de passe est trop faible'
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'L\'adresse email n\'est pas valide'
      }
      
      setError(`Failed to save driver: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setShowModifyModal(false)
    setSelectedDriver(null)
    setErrors({})
    setFormData({
      name: '',
      email: '',
      phone: '',
      status: 'Driver status'
    })
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 min-h-screen pb-20 lg:pb-6">
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="text-sm text-red-800">
              <strong>Error:</strong> {error}
            </div>
            <button
              onClick={() => setError('')}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#FFF8DC' }}>
              <User className="w-5 h-5 lg:w-6 lg:h-6" style={{ color: '#DAA520' }} />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t('driversTitle')}</h1>
              <p className="text-sm lg:text-base text-gray-600">Gestion des chauffeurs</p>
            </div>
          </div>
        </div>
        
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-xs lg:text-sm text-gray-500">
          <span>Home</span>
          <span>/</span>
          <span className="text-gray-900 font-medium">{t('driversTitle')}</span>
        </nav>
      </div>

      {/* Add Driver Button */}
      <div className="mb-8">
        <button
          onClick={handleAddDriver}
          className="flex items-center space-x-2 px-4 py-3 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl text-sm lg:text-base"
          style={{ backgroundColor: '#DAA520' }}
        >
          <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
          <span className="hidden sm:inline">{t('addDriver')}</span>
          <span className="sm:hidden">Ajouter</span>
        </button>
      </div>

      {/* Drivers Table */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Table Header */}
        <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-2">
              <Grid3X3 className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">{t('driversTable')}</h2>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full lg:w-auto">
              {/* Search */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">{t('search')}:</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder={t('search') + '...'}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent w-full sm:w-64"
                  />
          </div>
        </div>

              {/* Display Count */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">{t('display')}/Page:</label>
                <select
                  value={displayCount}
                  onChange={handleDisplayCountChange}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
        </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button className="p-2 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500">
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button className="p-2 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500">
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button className="p-2 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500">
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button className="p-2 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500">
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={handlePrint}
                  className="px-3 py-2 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center space-x-1"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('print')}</span>
                </button>
            </div>
          </div>
        </div>
      </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('number')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('driver')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('email')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('active')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentDrivers.map((driver, index) => (
                <tr key={driver.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {startIndex + index + 1}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {driver.name}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {driver.email || 'Mail:'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <select
                      value={driver.active ? 'Oui' : 'Non'}
                      onChange={(e) => {
                        const newActive = e.target.value === 'Oui'
                        setDrivers(prev => prev.map(d => 
                          d.id === driver.id ? { ...d, active: newActive } : d
                        ))
                      }}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#DAA520]"
                    >
                      <option value="Oui">{t('yes')}</option>
                      <option value="Non">{t('no')}</option>
                    </select>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleModifyDriver(driver)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      >
{t('modify')}
                      </button>
                      <button
                        onClick={() => handleDeleteDriver(driver.id)}
                        className="p-1 bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
            <div className="text-sm text-gray-700">
              {t('display')} {startIndex + 1} à {Math.min(endIndex, filteredDrivers.length)} de {filteredDrivers.length} {t('records')}
            </div>
            
            {/* Pagination */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
{t('first')}
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
{t('previous')}
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
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
{t('next')}
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
{t('last')}
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Add Driver Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <User className="w-6 h-6" style={{ color: '#DAA520' }} />
                <h2 className="text-2xl font-bold text-gray-900">{t('driversTitle')}</h2>
              </div>
              <div className="text-sm" style={{ color: '#DAA520' }}>
                Home / {t('driversTitle')} / {t('addDriver')}
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="bg-gray-100 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('addDriver')}</h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Nom */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
{t('name')}
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder={t('name') + ':'}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  {/* Mail */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
{t('email')}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder={t('email') + ':'}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mot de passe *
                    </label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Mot de passe (minimum 6 caractères)"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent ${
                        errors.password ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>

                  {/* Téléphone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
{t('phone')}
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder={t('phone') + ':'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                    />
                  </div>

                  {/* Driver Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
{t('driverStatus')}
                    </label>
                    <div className="relative">
                      <select
                        value={formData.status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent appearance-none ${
                          errors.status ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="Driver status">{t('driverStatus')}</option>
                        <option value="active">{t('active')}</option>
                        <option value="inactive">{t('inactive')}</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    {errors.status && (
                      <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-4 pt-4">
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
          </div>
        </div>
      )}

      {/* Modify Driver Modal */}
      {showModifyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Edit className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-900">{t('driversTitle')}</h2>
              </div>
              <div className="text-sm" style={{ color: '#DAA520' }}>
                Home / {t('driversTitle')} / {t('modifyDriver')}
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="bg-gray-100 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('modifyDriver')}</h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Nom */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
{t('name')}
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder={t('name') + ':'}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  {/* Mail */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
{t('email')}
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder={t('email') + ':'}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  {/* Téléphone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
{t('phone')}
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder={t('phone') + ':'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                    />
                  </div>

                  {/* Driver Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
{t('driverStatus')}
                    </label>
                    <div className="relative">
                      <select
                        value={formData.status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent appearance-none ${
                          errors.status ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="Driver status">{t('driverStatus')}</option>
                        <option value="active">{t('active')}</option>
                        <option value="inactive">{t('inactive')}</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    {errors.status && (
                      <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-4 pt-4">
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
        </div>
      </div>
      )}
    </div>
  )
}

export default Drivers

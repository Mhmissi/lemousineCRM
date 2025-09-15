import React, { useState, useEffect } from 'react'
import { User, Search, Plus, Edit, Trash2, Grid3X3, Printer } from 'lucide-react'

const Drivers = () => {
  const [drivers, setDrivers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [displayCount, setDisplayCount] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showModifyModal, setShowModifyModal] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [loading, setLoading] = useState(false)

  // Mock driver data based on the image
    const mockDrivers = [
    { id: 1, numero: 1, name: 'ABDEL BMW 7', email: '', active: true },
    { id: 2, numero: 10, name: 'BESIM', email: '', active: true },
    { id: 3, numero: 11, name: 'Bils', email: '', active: true },
    { id: 4, numero: 12, name: 'BLS TANGER', email: '', active: true },
    { id: 5, numero: 13, name: 'Breugelmans', email: '', active: true },
    { id: 6, numero: 14, name: 'CHAUFFEUR CAB BRUSSELS SPRL', email: '', active: true },
    { id: 7, numero: 15, name: 'EMBACH E+VAN', email: '', active: true },
    { id: 8, numero: 16, name: 'FOUAD VIANO V6', email: '', active: true },
    { id: 9, numero: 17, name: 'Fred S', email: '', active: true },
    { id: 10, numero: 18, name: 'Garchi SCRL', email: '', active: true },
    { id: 11, numero: 19, name: 'Hassan Limousine', email: 'hassan@limousine.com', active: true },
    { id: 12, numero: 20, name: 'Ibrahim Transport', email: 'ibrahim@transport.com', active: true },
    { id: 13, numero: 21, name: 'Jean-Pierre', email: 'jeanpierre@luxury.com', active: true },
    { id: 14, numero: 22, name: 'Karim VIP', email: 'karim@vip.com', active: true },
    { id: 15, numero: 23, name: 'Luxury Driver', email: 'luxury@driver.com', active: true },
    { id: 16, numero: 24, name: 'Mohamed Elite', email: 'mohamed@elite.com', active: true },
    { id: 17, numero: 25, name: 'Nabil Premium', email: 'nabil@premium.com', active: true },
    { id: 18, numero: 26, name: 'Omar Classic', email: 'omar@classic.com', active: true },
    { id: 19, numero: 27, name: 'Pierre Executive', email: 'pierre@executive.com', active: true },
    { id: 20, numero: 28, name: 'Quality Transport', email: 'quality@transport.com', active: true },
    { id: 21, numero: 29, name: 'Rachid VIP', email: 'rachid@vip.com', active: true },
    { id: 22, numero: 30, name: 'Samir Luxury', email: 'samir@luxury.com', active: true },
    { id: 23, numero: 31, name: 'Tariq Premium', email: 'tariq@premium.com', active: true },
    { id: 24, numero: 32, name: 'Umar Executive', email: 'umar@executive.com', active: true },
    { id: 25, numero: 33, name: 'Vincent Classic', email: 'vincent@classic.com', active: true },
    { id: 26, numero: 34, name: 'Walid VIP', email: 'walid@vip.com', active: true },
    { id: 27, numero: 35, name: 'Xavier Luxury', email: 'xavier@luxury.com', active: true },
    { id: 28, numero: 36, name: 'Youssef Premium', email: 'youssef@premium.com', active: true },
    { id: 29, numero: 37, name: 'Zakaria Executive', email: 'zakaria@executive.com', active: true },
    { id: 30, numero: 38, name: 'Ahmed Classic', email: 'ahmed@classic.com', active: true },
    { id: 31, numero: 39, name: 'Brahim VIP', email: 'brahim@vip.com', active: true },
    { id: 32, numero: 40, name: 'Chakib Luxury', email: 'chakib@luxury.com', active: true },
    { id: 33, numero: 41, name: 'Driss Premium', email: 'driss@premium.com', active: true },
    { id: 34, numero: 42, name: 'El Hassan Executive', email: 'elhassan@executive.com', active: true },
    { id: 35, numero: 43, name: 'Fouad Classic', email: 'fouad@classic.com', active: true },
    { id: 36, numero: 44, name: 'Ghali VIP', email: 'ghali@vip.com', active: true },
    { id: 37, numero: 45, name: 'Hicham Luxury', email: 'hicham@luxury.com', active: true },
    { id: 38, numero: 46, name: 'Ilyas Premium', email: 'ilyas@premium.com', active: true },
    { id: 39, numero: 47, name: 'Jamal Executive', email: 'jamal@executive.com', active: true },
    { id: 40, numero: 48, name: 'Khalid Classic', email: 'khalid@classic.com', active: true },
    { id: 41, numero: 49, name: 'Larbi VIP', email: 'larbi@vip.com', active: true },
    { id: 42, numero: 50, name: 'Mansour Luxury', email: 'mansour@luxury.com', active: true },
    { id: 43, numero: 51, name: 'Noureddine Premium', email: 'noureddine@premium.com', active: true },
    { id: 44, numero: 52, name: 'Othman Executive', email: 'othman@executive.com', active: true },
    { id: 45, numero: 53, name: 'Pascal Classic', email: 'pascal@classic.com', active: true },
    { id: 46, numero: 54, name: 'Qassim VIP', email: 'qassim@vip.com', active: true },
    { id: 47, numero: 55, name: 'Rachid Luxury', email: 'rachid@luxury.com', active: true },
    { id: 48, numero: 56, name: 'Said Premium', email: 'said@premium.com', active: true },
    { id: 49, numero: 57, name: 'Tahar Executive', email: 'tahar@executive.com', active: true },
    { id: 50, numero: 58, name: 'Umar Classic', email: 'umar@classic.com', active: true },
    { id: 51, numero: 59, name: 'Vladimir VIP', email: 'vladimir@vip.com', active: true },
    { id: 52, numero: 60, name: 'Wassim Luxury', email: 'wassim@luxury.com', active: true },
    { id: 53, numero: 61, name: 'Yacine Premium', email: 'yacine@premium.com', active: true },
    { id: 54, numero: 62, name: 'Zakaria Executive', email: 'zakaria@executive.com', active: true },
    { id: 55, numero: 63, name: 'Abdel Classic', email: 'abdel@classic.com', active: true },
    { id: 56, numero: 64, name: 'Brahim VIP', email: 'brahim@vip.com', active: true },
    { id: 57, numero: 65, name: 'Chakib Luxury', email: 'chakib@luxury.com', active: true },
    { id: 58, numero: 66, name: 'Driss Premium', email: 'driss@premium.com', active: true },
    { id: 59, numero: 67, name: 'El Hassan Executive', email: 'elhassan@executive.com', active: true },
    { id: 60, numero: 68, name: 'Fouad Classic', email: 'fouad@classic.com', active: true },
    { id: 61, numero: 69, name: 'Ghali VIP', email: 'ghali@vip.com', active: true }
  ]

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    status: 'Driver status'
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
      setDrivers(mockDrivers)
  }, [])

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
      status: driver.active ? 'Activé' : 'Désactivé'
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

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'L\'email n\'est pas valide'
    }

    if (!formData.status || formData.status === 'Driver status') {
      newErrors.status = 'Veuillez sélectionner un statut'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    if (showAddModal) {
      // Add new driver
      const newDriver = {
        id: Math.max(...drivers.map(d => d.id)) + 1,
        numero: Math.max(...drivers.map(d => d.numero)) + 1,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        active: formData.status === 'Activé'
      }
      setDrivers(prev => [newDriver, ...prev])
    } else if (showModifyModal) {
      // Modify existing driver
      setDrivers(prev => prev.map(driver => 
        driver.id === selectedDriver.id 
          ? { 
              ...driver, 
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              active: formData.status === 'Activé'
            }
          : driver
      ))
    }

    // Reset form and close modal
    setFormData({
      name: '',
      email: '',
      phone: '',
      status: 'Driver status'
    })
    setErrors({})
    setShowAddModal(false)
    setShowModifyModal(false)
    setSelectedDriver(null)
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
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-3">
          <User className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600" />
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Chauffeurs</h1>
          </div>
        <div className="text-sm text-blue-600">
          <span className="hidden sm:inline">Home / Chauffeurs</span>
          <span className="sm:hidden">Home / Chauffeurs</span>
        </div>
      </div>

      {/* Add Driver Button */}
      <div className="mb-6">
        <button
          onClick={handleAddDriver}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Ajouter un chauffeur</span>
        </button>
            </div>

      {/* Drivers Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Table Header */}
        <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-2">
              <Grid3X3 className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Table Chauffeurs</h2>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full lg:w-auto">
              {/* Search */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Recherche:</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder="Rechercher ici..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                  />
          </div>
        </div>

              {/* Display Count */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Affichage/Page:</label>
                <select
                  value={displayCount}
                  onChange={handleDisplayCountChange}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <span className="hidden sm:inline">Print</span>
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Numero</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Driver</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mail</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activé</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentDrivers.map((driver) => (
                <tr key={driver.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {driver.numero}
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
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Oui">Oui</option>
                      <option value="Non">Non</option>
                    </select>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleModifyDriver(driver)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      >
                        Modifier
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
              Affichage {startIndex + 1} à {Math.min(endIndex, filteredDrivers.length)} de {filteredDrivers.length} enregistrement(s)
            </div>
            
            {/* Pagination */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Première
              </button>
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédente
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
                        ? 'bg-blue-600 text-white border-blue-600'
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
                Suivante
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Dernière
              </button>
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
                <User className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Chauffeurs</h2>
              </div>
              <div className="text-sm text-blue-600">
                Home / Chauffeurs / Ajouter Chauffeurs
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="bg-gray-100 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Add Chauffeur</h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Nom */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Nom:"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                      Mail
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Mail:"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Téléphone:"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Driver Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Driver status
                    </label>
                    <div className="relative">
                      <select
                        value={formData.status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none ${
                          errors.status ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="Driver status">Driver status</option>
                        <option value="Activé">Activé</option>
                        <option value="Désactivé">Désactivé</option>
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
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      Ajouter
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
                <h2 className="text-2xl font-bold text-gray-900">Chauffeurs</h2>
              </div>
              <div className="text-sm text-blue-600">
                Home / Chauffeurs / Modifier Chauffeur
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="bg-gray-100 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Modifier Chauffeur</h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Nom */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="Nom:"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                      Mail
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Mail:"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="Téléphone:"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Driver Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Driver status
                    </label>
                    <div className="relative">
                      <select
                        value={formData.status}
                        onChange={(e) => handleInputChange('status', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none ${
                          errors.status ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="Driver status">Driver status</option>
                        <option value="Activé">Activé</option>
                        <option value="Désactivé">Désactivé</option>
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
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    >
                      Modifier
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
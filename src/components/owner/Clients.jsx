import React, { useState, useEffect } from 'react'
import { UserCheck, Search, Plus, Edit, Trash2, Grid3X3, Printer } from 'lucide-react'
import { useLanguage } from '../../contexts/LanguageContext'
import { firestoreService } from '../../services/firestoreService'

const Clients = () => {
  const { t } = useLanguage()
  const [clients, setClients] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [displayCount, setDisplayCount] = useState(100)
  const [currentPage, setCurrentPage] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showModifyModal, setShowModifyModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [loading, setLoading] = useState(false)


  const [formData, setFormData] = useState({
    company: '',
    address: '',
    postalCode: '',
    city: '',
    country: '',
    phone: '',
    fax: '',
    email: '',
    status: 'Activé'
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    const loadClients = async () => {
      try {
        setLoading(true)
        const clientsData = await firestoreService.getClients()
        setClients(clientsData)
      } catch (error) {
        console.error('Error loading clients:', error)
        // Fallback to empty array if Firestore fails
        setClients([])
      } finally {
        setLoading(false)
      }
    }

    loadClients()
  }, [])

  // Filter clients based on search term
  const filteredClients = clients.filter(client =>
    client.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculate pagination
  const totalPages = Math.ceil(filteredClients.length / displayCount)
  const startIndex = (currentPage - 1) * displayCount
  const endIndex = startIndex + displayCount
  const currentClients = filteredClients.slice(startIndex, endIndex)

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

  const handleAddClient = () => {
    setShowAddModal(true)
  }

  const handleModifyClient = (client) => {
    setSelectedClient(client)
    setFormData({
      company: client.company,
      address: client.address,
      postalCode: client.postalCode,
      city: client.city,
      country: client.country,
      phone: client.phone,
      fax: client.fax,
      email: client.email,
      status: client.status
    })
    setShowModifyModal(true)
  }

  const handleDeleteClient = (clientId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      setClients(prev => prev.filter(client => client.id !== clientId))
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

    if (!formData.company.trim()) {
      newErrors.company = 'Le nom de la société est requis'
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'L\'email n\'est pas valide'
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
        // Add new client to Firestore
        const newClient = {
          company: formData.company,
          address: formData.address,
          postalCode: formData.postalCode,
          city: formData.city,
          country: formData.country,
          phone: formData.phone,
          fax: formData.fax,
          email: formData.email,
          status: formData.status,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        
        const docRef = await firestoreService.addClient(newClient)
        const addedClient = { id: docRef.id, ...newClient }
        
        setClients(prev => [addedClient, ...prev])
      } else if (showModifyModal) {
        // Update existing client in Firestore
        const updatedClient = {
          ...selectedClient,
          ...formData,
          updatedAt: new Date()
        }
        
        await firestoreService.updateClient(selectedClient.id, updatedClient)
        
        setClients(prev => prev.map(client => 
          client.id === selectedClient.id ? updatedClient : client
        ))
      }

      // Reset form and close modal
      setFormData({
        company: '',
        address: '',
        postalCode: '',
        city: '',
        country: '',
        phone: '',
        fax: '',
        email: '',
        status: 'Activé'
      })
      setErrors({})
      setShowAddModal(false)
      setShowModifyModal(false)
      setSelectedClient(null)
    } catch (error) {
      console.error('Error saving client:', error)
      alert('Failed to save client. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setShowModifyModal(false)
    setSelectedClient(null)
    setErrors({})
    setFormData({
      company: '',
      address: '',
      postalCode: '',
      city: '',
      country: '',
      phone: '',
      fax: '',
      email: '',
      status: 'Activé'
    })
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 min-h-screen pb-20 lg:pb-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#FFF8DC' }}>
              <UserCheck className="w-5 h-5 lg:w-6 lg:h-6" style={{ color: '#DAA520' }} />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t('clientsTitle')}</h1>
              <p className="text-sm lg:text-base text-gray-600">Gestion des clients</p>
            </div>
          </div>
        </div>
        
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-xs lg:text-sm text-gray-500">
          <span>Home</span>
          <span>/</span>
          <span className="text-gray-900 font-medium">{t('clientsTitle')}</span>
        </nav>
      </div>

      {/* Add Client Button */}
      <div className="mb-8">
        <button
          onClick={handleAddClient}
          className="flex items-center space-x-2 px-4 py-3 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl text-sm lg:text-base"
          style={{ backgroundColor: '#DAA520' }}
        >
          <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
          <span className="hidden sm:inline">{t('addClient')}</span>
          <span className="sm:hidden">Ajouter</span>
        </button>
      </div>

      {/* Clients Table */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Table Header */}
        <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-2">
              <Grid3X3 className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">{t('clientsTable')}</h2>
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
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">{t('display')} {t('records')}:</label>
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('company')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('address')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('postalCode')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('city')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('country')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('phone')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('fax')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('email')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('status')}</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentClients.map((client, index) => (
                <tr key={client.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {startIndex + index + 1}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {client.company}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    {client.address}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {client.postalCode}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    {client.city}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {client.country}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {client.phone}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {client.fax}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {client.email}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <select
                      value={client.status}
                      onChange={(e) => {
                        const newStatus = e.target.value
                        setClients(prev => prev.map(c => 
                          c.id === client.id ? { ...c, status: newStatus } : c
                        ))
                      }}
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#DAA520]"
                    >
                      <option value="Activé">{t('active')}</option>
                      <option value="Désactivé">{t('inactive')}</option>
                    </select>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleModifyClient(client)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      >
{t('modify')}
                      </button>
                      <button
                        onClick={() => handleDeleteClient(client.id)}
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
              {t('display')} {startIndex + 1} à {Math.min(endIndex, filteredClients.length)} de {filteredClients.length} {t('records')}
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

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <UserCheck className="w-6 h-6" style={{ color: '#DAA520' }} />
                <h2 className="text-2xl font-bold text-gray-900">{t('addClient')}</h2>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
{t('company')} *
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent ${
                      errors.company ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={t('companyName')}
                  />
                  {errors.company && (
                    <p className="mt-1 text-sm text-red-600">{errors.company}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
{t('address')}
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                    placeholder={t('fullAddress')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
{t('postalCode')}
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                    placeholder={t('postalCode')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
{t('city')}
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                    placeholder={t('city')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
{t('country')}
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                    placeholder={t('country')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
{t('phone')}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                    placeholder="+32 123 456 789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
{t('fax')}
                  </label>
                  <input
                    type="tel"
                    value={formData.fax}
                    onChange={(e) => handleInputChange('fax', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                    placeholder="+32 123 456 790"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
{t('email')}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="email@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
{t('status')}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                  >
                    <option value="Activé">{t('active')}</option>
                    <option value="Désactivé">{t('inactive')}</option>
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

      {/* Modify Client Modal */}
      {showModifyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Edit className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-900">{t('modifyClient')}</h2>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
{t('company')} *
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent ${
                      errors.company ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder={t('companyName')}
                  />
                  {errors.company && (
                    <p className="mt-1 text-sm text-red-600">{errors.company}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
{t('address')}
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                    placeholder={t('fullAddress')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
{t('postalCode')}
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                    placeholder={t('postalCode')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
{t('city')}
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                    placeholder={t('city')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
{t('country')}
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                    placeholder={t('country')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
{t('phone')}
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                    placeholder="+32 123 456 789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
{t('fax')}
                  </label>
                  <input
                    type="tel"
                    value={formData.fax}
                    onChange={(e) => handleInputChange('fax', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                    placeholder="+32 123 456 790"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
{t('email')}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="email@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
{t('status')}
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                  >
                    <option value="Activé">{t('active')}</option>
                    <option value="Désactivé">{t('inactive')}</option>
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
    </div>
  )
}

export default Clients

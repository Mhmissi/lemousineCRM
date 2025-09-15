import React, { useState, useEffect } from 'react'
import { UserCheck, Search, Plus, Edit, Trash2, Grid3X3, Printer } from 'lucide-react'

const Clients = () => {
  const [clients, setClients] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [displayCount, setDisplayCount] = useState(100)
  const [currentPage, setCurrentPage] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showModifyModal, setShowModifyModal] = useState(false)
  const [selectedClient, setSelectedClient] = useState(null)
  const [loading, setLoading] = useState(false)

  // Mock client data based on the image
  const mockClients = [
    { id: 1, numero: 1588, company: 'Le Botanique', address: 'Rue Royale 236', postalCode: '1210', city: 'Bruxelles', country: '', phone: '', fax: '', email: '', status: 'Activé' },
    { id: 2, numero: 1587, company: 'Candex Solutions Belgium BV', address: 'Patersstraat 100', postalCode: '2300', city: 'Turnhout', country: '', phone: '', fax: '', email: '', status: 'Activé' },
    { id: 3, numero: 1586, company: 'Dlc srl', address: 'Clos Lamartine 5', postalCode: '1420', city: 'Braine | Alleud', country: '', phone: '', fax: '', email: '', status: 'Activé' },
    { id: 4, numero: 1585, company: 'Reiseakademiet AS', address: 'Box 17', postalCode: '1629', city: 'FREDRIKSTAD - NORGE', country: '', phone: '', fax: '', email: '', status: 'Activé' },
    { id: 5, numero: 1584, company: 'The Key as', address: 'Fred Olsensgt 5', postalCode: '0152', city: 'Oslo - Norway', country: '', phone: '', fax: '', email: '', status: 'Activé' },
    { id: 6, numero: 1583, company: 'Charmed by Spain S.L.', address: 'aseo de las Delicias N° 30, Piso 5°, Oficina 2ª', postalCode: '28045', city: 'Madrid, España - VAT: B87197620', country: '', phone: '', fax: '', email: '', status: 'Activé' },
    { id: 7, numero: 1582, company: 'LATHAM & WATKINS LLP', address: 'Place Sainte Gudule 14', postalCode: '1000', city: 'Bruxelles', country: '', phone: '', fax: '', email: '', status: 'Activé' },
    { id: 8, numero: 1581, company: 'Muttrah Water Services & Works LLC', address: 'Al Qurum', postalCode: '879', city: 'Muscat, Oman', country: '', phone: '', fax: '', email: '', status: 'Activé' },
    { id: 9, numero: 1580, company: 'Mme : Manzanza', address: 'Avenue du Capricorne 12', postalCode: '1200', city: 'Woluwe Saint lambert', country: '', phone: '', fax: '', email: '', status: 'Activé' },
    { id: 10, numero: 1579, company: 'Paroisse du Divin Enfant Jésus', address: 'Av. Houba de Strooper 757, 204 HRCB', postalCode: '1020', city: 'Bruxelles', country: '', phone: '', fax: '', email: '', status: 'Activé' },
    { id: 11, numero: 1578, company: 'Brigham Young University', address: '', postalCode: 'Provo', city: 'Utah 84602 - USA', country: '', phone: '', fax: '', email: '', status: 'Activé' },
    { id: 12, numero: 1577, company: 'ABC Corporation', address: '123 Business Street', postalCode: '1000', city: 'Brussels', country: 'Belgium', phone: '+32 2 123 4567', fax: '+32 2 123 4568', email: 'contact@abccorp.com', status: 'Activé' },
    { id: 13, numero: 1576, company: 'XYZ Limited', address: '456 Corporate Avenue', postalCode: '2000', city: 'Antwerp', country: 'Belgium', phone: '+32 3 987 6543', fax: '+32 3 987 6544', email: 'info@xyzlimited.be', status: 'Activé' },
    { id: 14, numero: 1575, company: 'Global Services Inc.', address: '789 International Blvd', postalCode: '3000', city: 'Leuven', country: 'Belgium', phone: '+32 16 555 1234', fax: '+32 16 555 1235', email: 'services@globalinc.com', status: 'Activé' },
    { id: 15, numero: 1574, company: 'Tech Solutions BV', address: '321 Innovation Drive', postalCode: '4000', city: 'Liège', country: 'Belgium', phone: '+32 4 777 8888', fax: '+32 4 777 8889', email: 'tech@techsolutions.be', status: 'Activé' },
    { id: 16, numero: 1573, company: 'Luxury Transport Ltd', address: '654 Premium Street', postalCode: '5000', city: 'Namur', country: 'Belgium', phone: '+32 81 999 0000', fax: '+32 81 999 0001', email: 'luxury@transport.be', status: 'Activé' },
    { id: 17, numero: 1572, company: 'Executive Cars SA', address: '987 Executive Plaza', postalCode: '6000', city: 'Charleroi', country: 'Belgium', phone: '+32 71 111 2222', fax: '+32 71 111 2223', email: 'executive@cars.be', status: 'Activé' },
    { id: 18, numero: 1571, company: 'VIP Limousine Services', address: '147 VIP Lane', postalCode: '7000', city: 'Mons', country: 'Belgium', phone: '+32 65 333 4444', fax: '+32 65 333 4445', email: 'vip@limousine.be', status: 'Activé' },
    { id: 19, numero: 1570, company: 'Premium Transport Group', address: '258 Premium Road', postalCode: '8000', city: 'Bruges', country: 'Belgium', phone: '+32 50 555 6666', fax: '+32 50 555 6667', email: 'premium@transport.be', status: 'Activé' },
    { id: 20, numero: 1569, company: 'Elite Car Services', address: '369 Elite Boulevard', postalCode: '9000', city: 'Ghent', country: 'Belgium', phone: '+32 9 777 8888', fax: '+32 9 777 8889', email: 'elite@carservices.be', status: 'Activé' }
  ]

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
    setClients(mockClients)
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

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    if (showAddModal) {
      // Add new client
      const newClient = {
        id: Math.max(...clients.map(c => c.id)) + 1,
        numero: Math.max(...clients.map(c => c.numero)) + 1,
        company: formData.company,
        address: formData.address,
        postalCode: formData.postalCode,
        city: formData.city,
        country: formData.country,
        phone: formData.phone,
        fax: formData.fax,
        email: formData.email,
        status: formData.status
      }
      setClients(prev => [newClient, ...prev])
    } else if (showModifyModal) {
      // Modify existing client
      setClients(prev => prev.map(client => 
        client.id === selectedClient.id 
          ? { ...client, ...formData }
          : client
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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-3">
          <UserCheck className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600" />
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Clients</h1>
        </div>
        <div className="text-sm text-blue-600">
          <span className="hidden sm:inline">Home / Clients</span>
          <span className="sm:hidden">Home / Clients</span>
        </div>
      </div>

      {/* Add Client Button */}
      <div className="mb-6">
        <button
          onClick={handleAddClient}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Ajouter un Client</span>
        </button>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Table Header */}
        <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-2">
              <Grid3X3 className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Table Client</h2>
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
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Affichage enregistrement(s):</label>
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N°</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adresse</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CP</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ville</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pays</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tél</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fax</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentClients.map((client, index) => (
                <tr key={client.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {client.numero}
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
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Activé">Activé</option>
                      <option value="Désactivé">Désactivé</option>
                    </select>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleModifyClient(client)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      >
                        Modifier
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
              Affichage {startIndex + 1} à {Math.min(endIndex, filteredClients.length)} de {filteredClients.length} enregistrement(s)
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

      {/* Add Client Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <UserCheck className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Ajouter un client</h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    Société *
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.company ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nom de la société"
                  />
                  {errors.company && (
                    <p className="mt-1 text-sm text-red-600">{errors.company}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Adresse complète"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code postal
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Code postal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ville"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pays
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Pays"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+32 123 456 789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fax
                  </label>
                  <input
                    type="tel"
                    value={formData.fax}
                    onChange={(e) => handleInputChange('fax', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+32 123 456 790"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                    Statut
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Activé">Activé</option>
                    <option value="Désactivé">Désactivé</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
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
      )}

      {/* Modify Client Modal */}
      {showModifyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Edit className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-900">Modifier le client</h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    Société *
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.company ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Nom de la société"
                  />
                  {errors.company && (
                    <p className="mt-1 text-sm text-red-600">{errors.company}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Adresse complète"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code postal
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Code postal"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ville"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pays
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Pays"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+32 123 456 789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fax
                  </label>
                  <input
                    type="tel"
                    value={formData.fax}
                    onChange={(e) => handleInputChange('fax', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+32 123 456 790"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
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
                    Statut
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Activé">Activé</option>
                    <option value="Désactivé">Désactivé</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
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
      )}
    </div>
  )
}

export default Clients

import React, { useState, useEffect } from 'react'
import { Building, Search, Plus, Edit, Trash2, Grid3X3, Printer } from 'lucide-react'

const Company = () => {
  const [companies, setCompanies] = useState([])
  const [brands, setBrands] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [brandSearchTerm, setBrandSearchTerm] = useState('')
  const [displayCount, setDisplayCount] = useState(10)
  const [brandDisplayCount, setBrandDisplayCount] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [brandCurrentPage, setBrandCurrentPage] = useState(1)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showModifyModal, setShowModifyModal] = useState(false)
  const [showBrandAddModal, setShowBrandAddModal] = useState(false)
  const [showBrandModifyModal, setShowBrandModifyModal] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState(null)
  const [selectedBrand, setSelectedBrand] = useState(null)

  // Mock company data based on the image
  const mockCompanies = [
    {
      id: 1,
      logo: 'LIMOSTAR',
      name: 'LIMOSTAR',
      address: '65, Avenue Louise',
      postalCode: '1050',
      city: 'Brussels',
      country: 'Belgium',
      tel: '+3225120101',
      fax: '',
      mobile: '',
      email: 'info@limostar.be',
      website: 'www.limostar.be'
    },
    {
      id: 2,
      logo: 'Location Bus',
      name: 'Location Bus',
      address: 'Av Herrmann Debroux 54',
      postalCode: '1160',
      city: 'Brussels',
      country: 'BE',
      tel: '+3223420734',
      fax: '',
      mobile: '',
      email: 'info@location-bus.be',
      website: 'www.@location-bus.be'
    },
    {
      id: 3,
      logo: 'Rent a Bus',
      name: 'RENT A BUS',
      address: 'Avenue Louise 65,',
      postalCode: '1050',
      city: 'Bruxelles',
      country: 'BE',
      tel: '+32 2 512 01 01',
      fax: '',
      mobile: '',
      email: 'info@rentabus.be',
      website: 'www.rentabus.be'
    },
    {
      id: 4,
      logo: 'Autocar.Brussels',
      name: 'AUTOCAR BRUSSELS',
      address: 'Rue des Colonies 11',
      postalCode: '1000',
      city: 'Brussels',
      country: 'BE',
      tel: '+32 2 342 08 76',
      fax: '',
      mobile: '',
      email: 'info@autocar.brussels',
      website: 'www.autocar.brussels'
    },
    {
      id: 5,
      logo: 'Location Autocar',
      name: 'Location Autocar',
      address: 'Bd Industriel 9,',
      postalCode: '1070',
      city: 'Bruxelles',
      country: 'BE',
      tel: '+32 2 580 03 25',
      fax: '',
      mobile: '',
      email: 'info@locationautocar.be',
      website: 'www.locationautocar.be'
    },
    {
      id: 6,
      logo: 'AUTOCAR BRUXELLES',
      name: 'AUTOCAR BRUXELLES',
      address: 'Rue du Poinçon, 43',
      postalCode: '1000',
      city: 'Bruxelles',
      country: 'Belgique',
      tel: '+3224460187',
      fax: '',
      mobile: '',
      email: 'info@autocar-bruxelles.be',
      website: 'www.autocar-bruxelels.be'
    }
  ]

  // Mock brand data based on the image
  const mockBrands = [
    {
      id: 1,
      logo: 'Autocar.Brussels',
      name: 'AUTOCAR BRUSSELS',
      status: 'Activée'
    },
    {
      id: 2,
      logo: 'BelFood Trading',
      name: 'BelFood Trading',
      status: 'Désactivée'
    },
    {
      id: 3,
      logo: 'Location Autocar',
      name: 'LOCATION AUTOCAR',
      status: 'Activée'
    }
  ]

  const [formData, setFormData] = useState({
    logo: '',
    name: '',
    address: '',
    postalCode: '',
    city: '',
    country: '',
    tel: '',
    fax: '',
    mobile: '',
    email: '',
    website: ''
  })

  const [brandFormData, setBrandFormData] = useState({
    logo: '',
    name: '',
    status: 'Activée'
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    setCompanies(mockCompanies)
    setBrands(mockBrands)
  }, [])

  // Filter companies based on search term
  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Filter brands based on search term
  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(brandSearchTerm.toLowerCase()) ||
    brand.status.toLowerCase().includes(brandSearchTerm.toLowerCase())
  )

  // Calculate pagination for companies
  const totalPages = Math.ceil(filteredCompanies.length / displayCount)
  const startIndex = (currentPage - 1) * displayCount
  const endIndex = startIndex + displayCount
  const currentCompanies = filteredCompanies.slice(startIndex, endIndex)

  // Calculate pagination for brands
  const brandTotalPages = Math.ceil(filteredBrands.length / brandDisplayCount)
  const brandStartIndex = (brandCurrentPage - 1) * brandDisplayCount
  const brandEndIndex = brandStartIndex + brandDisplayCount
  const currentBrands = filteredBrands.slice(brandStartIndex, brandEndIndex)

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleBrandSearch = (e) => {
    setBrandSearchTerm(e.target.value)
    setBrandCurrentPage(1)
  }

  const handleDisplayCountChange = (e) => {
    setDisplayCount(parseInt(e.target.value))
    setCurrentPage(1)
  }

  const handleBrandDisplayCountChange = (e) => {
    setBrandDisplayCount(parseInt(e.target.value))
    setBrandCurrentPage(1)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleBrandPageChange = (page) => {
    setBrandCurrentPage(page)
  }

  const handleAddCompany = () => {
    setShowAddModal(true)
  }

  const handleModifyCompany = (company) => {
    setSelectedCompany(company)
    setFormData({
      logo: company.logo,
      name: company.name,
      address: company.address,
      postalCode: company.postalCode,
      city: company.city,
      country: company.country,
      tel: company.tel,
      fax: company.fax,
      mobile: company.mobile,
      email: company.email,
      website: company.website
    })
    setShowModifyModal(true)
  }

  const handleDeleteCompany = (companyId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette compagnie ?')) {
      setCompanies(prev => prev.filter(company => company.id !== companyId))
    }
  }

  const handleAddBrand = () => {
    setShowBrandAddModal(true)
  }

  const handleModifyBrand = (brand) => {
    setSelectedBrand(brand)
    setBrandFormData({
      logo: brand.logo,
      name: brand.name,
      status: brand.status
    })
    setShowBrandModifyModal(true)
  }

  const handleDeleteBrand = (brandId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette marque ?')) {
      setBrands(prev => prev.filter(brand => brand.id !== brandId))
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }))
    }
  }

  const handleBrandInputChange = (field, value) => {
    setBrandFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom de la compagnie est requis'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateBrandForm = () => {
    const newErrors = {}
    if (!brandFormData.name.trim()) {
      newErrors.name = 'Le nom de la marque est requis'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    if (showAddModal) {
      const newCompany = {
        id: Math.max(...companies.map(c => c.id)) + 1,
        ...formData
      }
      setCompanies(prev => [newCompany, ...prev])
    } else if (showModifyModal) {
      setCompanies(prev => prev.map(company => 
        company.id === selectedCompany.id ? { ...company, ...formData } : company
      ))
    }

    setFormData({
      logo: '',
      name: '',
      address: '',
      postalCode: '',
      city: '',
      country: '',
      tel: '',
      fax: '',
      mobile: '',
      email: '',
      website: ''
    })
    setErrors({})
    setShowAddModal(false)
    setShowModifyModal(false)
    setSelectedCompany(null)
  }

  const handleBrandSubmit = (e) => {
    e.preventDefault()
    if (!validateBrandForm()) return

    if (showBrandAddModal) {
      const newBrand = {
        id: Math.max(...brands.map(b => b.id)) + 1,
        ...brandFormData
      }
      setBrands(prev => [newBrand, ...prev])
    } else if (showBrandModifyModal) {
      setBrands(prev => prev.map(brand => 
        brand.id === selectedBrand.id ? { ...brand, ...brandFormData } : brand
      ))
    }

    setBrandFormData({
      logo: '',
      name: '',
      status: 'Activée'
    })
    setErrors({})
    setShowBrandAddModal(false)
    setShowBrandModifyModal(false)
    setSelectedBrand(null)
  }

  const handleCloseModal = () => {
    setShowAddModal(false)
    setShowModifyModal(false)
    setShowBrandAddModal(false)
    setShowBrandModifyModal(false)
    setSelectedCompany(null)
    setSelectedBrand(null)
    setErrors({})
    setFormData({
      logo: '',
      name: '',
      address: '',
      postalCode: '',
      city: '',
      country: '',
      tel: '',
      fax: '',
      mobile: '',
      email: '',
      website: ''
    })
    setBrandFormData({
      logo: '',
      name: '',
      status: 'Activée'
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
          <Building className="w-6 h-6 lg:w-8 lg:h-8 text-blue-600" />
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Compagnie</h1>
        </div>
        <div className="text-sm text-blue-600">
          <span className="hidden sm:inline">Home / Compagnie</span>
          <span className="sm:hidden">Home / Compagnie</span>
        </div>
      </div>

      {/* Companies Table */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Table Header */}
          <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-2">
                <Grid3X3 className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Compagnie</h2>
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
                  <button
                    onClick={handlePrint}
                    className="px-3 py-2 bg-gray-200 text-gray-600 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center space-x-1"
                  >
                    <Printer className="w-4 h-4" />
                    <span className="hidden sm:inline">Print</span>
                  </button>
                  <button
                    onClick={handleAddCompany}
                    className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">+</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Companies Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom company</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adresse</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code postal</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ville</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pays</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tel</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fax</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site web</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      {company.logo}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {company.name}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {company.address}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {company.postalCode}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {company.city}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {company.country}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {company.tel}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {company.fax}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {company.mobile}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {company.email}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {company.website}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleModifyCompany(company)}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      >
                        Modifier
                      </button>
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
                Affichage {startIndex + 1} à {Math.min(endIndex, filteredCompanies.length)} de {filteredCompanies.length} enregistrement(s)
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
      </div>

      {/* Brands Table */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Table Header */}
          <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
              <div className="flex items-center space-x-2">
                <Grid3X3 className="w-5 h-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">Tableaux des marques</h2>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full lg:w-auto">
                {/* Search */}
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Recherche:</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={brandSearchTerm}
                      onChange={handleBrandSearch}
                      placeholder="Rechercher ici..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
                    />
                  </div>
                </div>

                {/* Display Count */}
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Affichage/Page:</label>
                  <select
                    value={brandDisplayCount}
                    onChange={handleBrandDisplayCountChange}
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
                  <button
                    onClick={handleAddBrand}
                    className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">+</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Brands Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom (FR)</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ACTION</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentBrands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      {brand.logo}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {brand.name}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <select
                        value={brand.status}
                        onChange={(e) => {
                          const newStatus = e.target.value
                          setBrands(prev => prev.map(b => 
                            b.id === brand.id ? { ...b, status: newStatus } : b
                          ))
                        }}
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Activée">Activée</option>
                        <option value="Désactivée">Désactivée</option>
                      </select>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleModifyBrand(brand)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDeleteBrand(brand.id)}
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
                Affichage {brandStartIndex + 1} à {Math.min(brandEndIndex, filteredBrands.length)} de {filteredBrands.length} enregistrement(s)
              </div>
              
              {/* Pagination */}
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => handleBrandPageChange(1)}
                  disabled={brandCurrentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Première
                </button>
                <button
                  onClick={() => handleBrandPageChange(brandCurrentPage - 1)}
                  disabled={brandCurrentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Précédente
                </button>
                
                {/* Page Numbers */}
                {Array.from({ length: Math.min(5, brandTotalPages) }, (_, i) => {
                  let pageNum
                  if (brandTotalPages <= 5) {
                    pageNum = i + 1
                  } else if (brandCurrentPage <= 3) {
                    pageNum = i + 1
                  } else if (brandCurrentPage >= brandTotalPages - 2) {
                    pageNum = brandTotalPages - 4 + i
                  } else {
                    pageNum = brandCurrentPage - 2 + i
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handleBrandPageChange(pageNum)}
                      className={`px-3 py-1 text-sm border rounded ${
                        brandCurrentPage === pageNum
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
                
                <button
                  onClick={() => handleBrandPageChange(brandCurrentPage + 1)}
                  disabled={brandCurrentPage === brandTotalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Suivante
                </button>
                <button
                  onClick={() => handleBrandPageChange(brandTotalPages)}
                  disabled={brandCurrentPage === brandTotalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Dernière
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-500">
        Powered by CAPTIV SOLUTIONS
      </div>
    </div>
  )
}

export default Company

import React, { useState, useEffect } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { Building, Search, Plus, Edit, Trash2, Grid3X3, Printer, X } from 'lucide-react'
import { firestoreService } from '../../services/firestoreService'

const Company = () => {
  const { t } = useLanguage()
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
    const loadData = async () => {
      try {
        const [companiesData, brandsData] = await Promise.all([
          firestoreService.getCompanies(),
          firestoreService.getBrands()
        ])
        setCompanies(companiesData)
        setBrands(brandsData)
      } catch (error) {

        setCompanies([])
        setBrands([])
      }
    }

    loadData()
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      if (showAddModal) {
        const newCompany = {
          ...formData,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        
        const docRef = await firestoreService.addCompany(newCompany)
        const addedCompany = { id: docRef.id, ...newCompany }
        
        setCompanies(prev => [addedCompany, ...prev])
      } else if (showModifyModal) {
        const updatedCompany = {
          ...selectedCompany,
          ...formData,
          updatedAt: new Date()
        }
        
        await firestoreService.updateCompany(selectedCompany.id, updatedCompany)
        
        setCompanies(prev => prev.map(company => 
          company.id === selectedCompany.id ? updatedCompany : company
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
    } catch (error) {

      alert('Failed to save company. Please try again.')
    }
  }

  const handleBrandSubmit = async (e) => {
    e.preventDefault()
    if (!validateBrandForm()) return

    try {
      if (showBrandAddModal) {
        const newBrand = {
          ...brandFormData,
          createdAt: new Date(),
          updatedAt: new Date()
        }
        
        const docRef = await firestoreService.addBrand(newBrand)
        const addedBrand = { id: docRef.id, ...newBrand }
        
        setBrands(prev => [addedBrand, ...prev])
      } else if (showBrandModifyModal) {
        const updatedBrand = {
          ...selectedBrand,
          ...brandFormData,
          updatedAt: new Date()
        }
        
        await firestoreService.updateBrand(selectedBrand.id, updatedBrand)
        
        setBrands(prev => prev.map(brand => 
          brand.id === selectedBrand.id ? updatedBrand : brand
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
    } catch (error) {

      alert('Failed to save brand. Please try again.')
    }
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
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#FFF8DC' }}>
              <Building className="w-5 h-5 lg:w-6 lg:h-6" style={{ color: '#DAA520' }} />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t('compagnie')}</h1>
              <p className="text-sm lg:text-base text-gray-600">Gestion des compagnies</p>
            </div>
          </div>
        </div>
        
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-xs lg:text-sm text-gray-500">
          <span>Home</span>
          <span>/</span>
          <span className="text-gray-900 font-medium">{t('compagnie')}</span>
        </nav>
      </div>

      {/* Companies Table */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Table Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 space-y-4 lg:space-y-0">
              <h3 className="text-lg font-semibold text-gray-900">Compagnie</h3>
              <div className="flex items-center space-x-2 lg:space-x-3">
                <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">Print</span>
                  <span className="sm:hidden">Print</span>
                </button>
                <button 
                  onClick={handleAddCompany}
                  className="flex items-center space-x-2 px-4 py-3 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl text-sm lg:text-base"
                  style={{ backgroundColor: '#DAA520' }}
                >
                  <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span className="hidden sm:inline">Ajouter</span>
                  <span className="sm:hidden">+</span>
                </button>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2 flex-1">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('search') + '...'}
                  value={searchTerm}
                  onChange={handleSearch}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-[#DAA520] text-sm"
                />
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-700 whitespace-nowrap">Affichage/Page:</label>
                <select
                  value={displayCount}
                  onChange={handleDisplayCountChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-[#DAA520] text-sm"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          </div>

          {/* Companies Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logo</th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom company</th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Adresse</th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Code postal</th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Ville</th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Pays</th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Tel</th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Email</th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50">
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      {company.logo}
                    </td>
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {company.name}
                    </td>
                    <td className="px-3 lg:px-6 py-4 text-sm text-gray-500 hidden sm:table-cell">
                      <div className="max-w-xs truncate" title={company.address}>
                        {company.address}
                      </div>
                    </td>
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                      {company.postalCode}
                    </td>
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden md:table-cell">
                      {company.city}
                    </td>
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                      {company.country}
                    </td>
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                      {company.tel}
                    </td>
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                      {company.email}
                    </td>
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-1 lg:space-x-2">
                        <button 
                          onClick={() => handleModifyCompany(company)}
                          className="text-green-600 hover:text-green-900 p-1"
                        >
                          <Edit className="w-3 h-3 lg:w-4 lg:h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteCompany(company.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                        >
                          <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                Affichage {startIndex + 1} à {Math.min(endIndex, filteredCompanies.length)} de {filteredCompanies.length} enregistrement(s)
              </div>
              <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                <button
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="px-2 py-2 text-xs sm:text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="hidden sm:inline">Première</span>
                  <span className="sm:hidden">«</span>
                </button>
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-2 py-2 text-xs sm:text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="hidden sm:inline">Précédente</span>
                  <span className="sm:hidden">‹</span>
                </button>
                <span className="px-2 py-2 text-xs sm:text-sm text-gray-700 bg-gray-100 rounded">
                  {currentPage}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-2 py-2 text-xs sm:text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="hidden sm:inline">Suivante</span>
                  <span className="sm:hidden">›</span>
                </button>
                <button
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-2 py-2 text-xs sm:text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="hidden sm:inline">Dernière</span>
                  <span className="sm:hidden">»</span>
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
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 space-y-4 lg:space-y-0">
              <h3 className="text-lg font-semibold text-gray-900">Tableaux des marques</h3>
              <div className="flex items-center space-x-2 lg:space-x-3">
                <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">Print</span>
                  <span className="sm:hidden">Print</span>
                </button>
                <button 
                  onClick={handleAddBrand}
                  className="flex items-center space-x-2 px-4 py-3 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl text-sm lg:text-base"
                  style={{ backgroundColor: '#DAA520' }}
                >
                  <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span className="hidden sm:inline">Ajouter</span>
                  <span className="sm:hidden">+</span>
                </button>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2 flex-1">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('search') + '...'}
                  value={brandSearchTerm}
                  onChange={handleBrandSearch}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-[#DAA520] text-sm"
                />
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-700 whitespace-nowrap">Affichage/Page:</label>
                <select
                  value={brandDisplayCount}
                  onChange={handleBrandDisplayCountChange}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-[#DAA520] text-sm"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          </div>

          {/* Brands Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logo</th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom (FR)</th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentBrands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-gray-50">
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                      {brand.logo}
                    </td>
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {brand.name}
                    </td>
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                      <select
                        value={brand.status}
                        onChange={(e) => {
                          const newStatus = e.target.value
                          setBrands(prev => prev.map(b => 
                            b.id === brand.id ? { ...b, status: newStatus } : b
                          ))
                        }}
                        className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#DAA520]"
                      >
                        <option value="Activée">{t('enabled')}</option>
                        <option value="Désactivée">Désactivée</option>
                      </select>
                    </td>
                    <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-1 lg:space-x-2">
                        <button 
                          onClick={() => handleModifyBrand(brand)}
                          className="text-green-600 hover:text-green-900 p-1"
                        >
                          <Edit className="w-3 h-3 lg:w-4 lg:h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteBrand(brand.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                        >
                          <Trash2 className="w-3 h-3 lg:w-4 lg:h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                Affichage {brandStartIndex + 1} à {Math.min(brandEndIndex, filteredBrands.length)} de {filteredBrands.length} enregistrement(s)
              </div>
              <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                <button
                  onClick={() => handleBrandPageChange(1)}
                  disabled={brandCurrentPage === 1}
                  className="px-2 py-2 text-xs sm:text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="hidden sm:inline">Première</span>
                  <span className="sm:hidden">«</span>
                </button>
                <button
                  onClick={() => handleBrandPageChange(brandCurrentPage - 1)}
                  disabled={brandCurrentPage === 1}
                  className="px-2 py-2 text-xs sm:text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="hidden sm:inline">Précédente</span>
                  <span className="sm:hidden">‹</span>
                </button>
                <span className="px-2 py-2 text-xs sm:text-sm text-gray-700 bg-gray-100 rounded">
                  {brandCurrentPage}
                </span>
                <button
                  onClick={() => handleBrandPageChange(brandCurrentPage + 1)}
                  disabled={brandCurrentPage === brandTotalPages}
                  className="px-2 py-2 text-xs sm:text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="hidden sm:inline">Suivante</span>
                  <span className="sm:hidden">›</span>
                </button>
                <button
                  onClick={() => handleBrandPageChange(brandTotalPages)}
                  disabled={brandCurrentPage === brandTotalPages}
                  className="px-2 py-2 text-xs sm:text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="hidden sm:inline">Dernière</span>
                  <span className="sm:hidden">»</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Company Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Building className="w-5 h-5 text-gray-600" />
                <h3 className="text-xl font-semibold text-gray-900">Nouvelle compagnie</h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom de la compagnie *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-[#DAA520] ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-[#DAA520]"
                />
              </div>

              {/* Postal Code and City */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Code postal</label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-[#DAA520]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-[#DAA520]"
                  />
                </div>
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pays</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-[#DAA520]"
                />
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                  <input
                    type="text"
                    value={formData.tel}
                    onChange={(e) => handleInputChange('tel', e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-[#DAA520]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-[#DAA520]"
                  />
                </div>
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Site web</label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-[#DAA520]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors w-full sm:w-auto order-2 sm:order-1"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 text-white font-medium rounded-lg transition-colors w-full sm:w-auto order-1 sm:order-2"
                  style={{ backgroundColor: '#DAA520' }}
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modify Company Modal */}
      {showModifyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Building className="w-5 h-5 text-gray-600" />
                <h3 className="text-xl font-semibold text-gray-900">Modifier la compagnie</h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Company Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo de la compagnie</label>
                <input
                  type="text"
                  value={formData.logo}
                  onChange={(e) => handleInputChange('logo', e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-[#DAA520]"
                  placeholder="Entrez le logo de la compagnie"
                />
              </div>

              {/* Company Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom de la compagnie *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-[#DAA520]"
                  placeholder="Entrez le nom de la compagnie"
                  required
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-[#DAA520]"
                  placeholder="Entrez l'adresse"
                />
              </div>

              {/* Postal Code and City */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Code postal</label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-[#DAA520]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-[#DAA520]"
                  />
                </div>
              </div>

              {/* Country */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pays</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-[#DAA520]"
                />
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                  <input
                    type="text"
                    value={formData.tel}
                    onChange={(e) => handleInputChange('tel', e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-[#DAA520]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-[#DAA520]"
                  />
                </div>
              </div>

              {/* Website */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Site web</label>
                <input
                  type="text"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-[#DAA520]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors w-full sm:w-auto order-2 sm:order-1"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 text-white font-medium rounded-lg transition-colors w-full sm:w-auto order-1 sm:order-2"
                  style={{ backgroundColor: '#DAA520' }}
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Brand Modal */}
      {showBrandAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Building className="w-5 h-5 text-gray-600" />
                <h3 className="text-xl font-semibold text-gray-900">Nouvelle marque</h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleBrandSubmit} className="p-6 space-y-6">
              {/* Brand Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom de la marque *</label>
                <input
                  type="text"
                  value={brandFormData.name}
                  onChange={(e) => handleBrandInputChange('name', e.target.value)}
                  className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-[#DAA520] ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
                <select
                  value={brandFormData.status}
                  onChange={(e) => handleBrandInputChange('status', e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-[#DAA520]"
                >
                  <option value="Activée">{t('enabled')}</option>
                  <option value="Désactivée">Désactivée</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors w-full sm:w-auto order-2 sm:order-1"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 text-white font-medium rounded-lg transition-colors w-full sm:w-auto order-1 sm:order-2"
                  style={{ backgroundColor: '#DAA520' }}
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modify Brand Modal */}
      {showBrandModifyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Building className="w-5 h-5 text-gray-600" />
                <h3 className="text-xl font-semibold text-gray-900">Modifier la marque</h3>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleBrandSubmit} className="p-6 space-y-6">
              {/* Brand Logo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Logo de la marque</label>
                <input
                  type="text"
                  value={brandFormData.logo}
                  onChange={(e) => setBrandFormData(prev => ({ ...prev, logo: e.target.value }))}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-[#DAA520]"
                  placeholder="Entrez le logo de la marque"
                />
              </div>

              {/* Brand Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom de la marque *</label>
                <input
                  type="text"
                  value={brandFormData.name}
                  onChange={(e) => setBrandFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-[#DAA520]"
                  placeholder="Entrez le nom de la marque"
                  required
                />
              </div>

              {/* Brand Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statut de la marque</label>
                <select
                  value={brandFormData.status}
                  onChange={(e) => setBrandFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-[#DAA520]"
                >
                  <option value="Activée">Activée</option>
                  <option value="Désactivée">Désactivée</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors w-full sm:w-auto order-2 sm:order-1"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 text-white font-medium rounded-lg transition-colors w-full sm:w-auto order-1 sm:order-2"
                  style={{ backgroundColor: '#DAA520' }}
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Company
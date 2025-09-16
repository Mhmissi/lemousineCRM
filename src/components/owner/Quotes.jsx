import { useState, useEffect } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { FileEdit, Plus, Search, Eye, Edit, FileDown, Copy, Filter, Printer, Calendar, User, DollarSign, Receipt } from 'lucide-react'
import jsPDF from 'jspdf'

const Quotes = () => {
  const { t } = useLanguage()
  const [filterStatus, setFilterStatus] = useState('all')
  const [groupByClient, setGroupByClient] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [displayCount, setDisplayCount] = useState(100)
  const [quotes, setQuotes] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    clientType: 'existing',
    clientName: '',
    clientAddress: '',
    postalCode: '',
    city: '',
    clientVAT: '',
    company: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'virement',
    dueDate: '',
    deposit: 0,
    remark: ''
  })
  const [errors, setErrors] = useState({})

  // Mock data for dropdowns
  const filterOptions = [
    { value: 'all', label: '--Toutes--' },
    { value: 'validated', label: 'Valider' },
    { value: 'not-validated', label: 'Non validé' }
  ]

  const clientOptions = [
    { value: 'all', label: '--Choisissez votre client--' },
    { value: 'travessia', label: 'Travessia Virtual Lda' },
    { value: 'bcs-travel', label: 'BCS Travel B.V.' },
    { value: 'eventeam', label: 'Eventeam Group' },
    { value: 'client-d', label: 'Client D' },
    { value: 'client-e', label: 'Client E' }
  ]

  const displayOptions = [
    { value: 10, label: '10' },
    { value: 25, label: '25' },
    { value: 50, label: '50' },
    { value: 100, label: '100' }
  ]

  const companies = [
    { value: '', label: '--Compagnie--' },
    { value: 'limostar', label: 'LIMOSTAR' },
    { value: 'autocar-bruxelles', label: 'Autocar Bruxelles' },
    { value: 'location-autocar', label: 'Location Autocar' },
    { value: 'luxury-transport', label: 'Luxury Transport' }
  ]

  const paymentMethods = [
    { value: '', label: '--Payment--' },
    { value: 'virement', label: 'Virement' },
    { value: 'especes', label: 'Espèces' },
    { value: 'carte', label: 'Carte de crédit' },
    { value: 'cheque', label: 'Chèque' }
  ]

  const existingClients = [
    { value: 'existing', label: '--Nouveau Client--' },
    { value: 'travessia', label: 'Travessia Virtual Lda' },
    { value: 'bcs-travel', label: 'BCS Travel B.V.' },
    { value: 'eventeam', label: 'Eventeam Group' },
    { value: 'client-d', label: 'Client D' },
    { value: 'client-e', label: 'Client E' }
  ]

  // Mock quotes data based on the image
  const mockQuotes = [
    {
      id: 1,
      number: '2025015',
      date: '16-05-2025',
      dueDate: '2025-05-16',
      client: 'Travessia Virtual Lda',
      payment: 'Virement',
      remark: 'www.autocar-bruxelles.be by Limostar',
      totalExclVAT: 5400.00,
      vat: 324.00,
      totalInclVAT: 5724.00,
      deposit: 0.00,
      status: 'validated'
    },
    {
      id: 2,
      number: '2025014',
      date: '16-05-2025',
      dueDate: '2025-05-16',
      client: 'Travessia Virtual Lda',
      payment: 'Virement',
      remark: 'www.autocar-bruxelles.be by Limostar',
      totalExclVAT: 0.00,
      vat: 0.00,
      totalInclVAT: 0.00,
      deposit: 0.00,
      status: 'not-validated'
    },
    {
      id: 3,
      number: '2025013',
      date: '16-05-2025',
      dueDate: '2025-05-16',
      client: 'BCS Travel B.V.',
      payment: 'Virement',
      remark: 'www.locationautocar.be by Limostar',
      totalExclVAT: 1200.00,
      vat: 72.00,
      totalInclVAT: 1272.00,
      deposit: 0.00,
      status: 'validated'
    },
    {
      id: 4,
      number: '2025012',
      date: '15-05-2025',
      dueDate: '2025-05-29',
      client: 'Eventeam Group',
      payment: 'Virement',
      remark: 'Cette offre reste valable 14 jours.',
      totalExclVAT: 2500.00,
      vat: 150.00,
      totalInclVAT: 2650.00,
      deposit: 0.00,
      status: 'not-validated'
    },
    {
      id: 5,
      number: '2025011',
      date: '14-05-2025',
      dueDate: '2025-05-28',
      client: 'Client D',
      payment: 'Virement',
      remark: 'Service VIP transport',
      totalExclVAT: 800.00,
      vat: 48.00,
      totalInclVAT: 848.00,
      deposit: 0.00,
      status: 'validated'
    },
    {
      id: 6,
      number: '2025010',
      date: '13-05-2025',
      dueDate: '2025-05-27',
      client: 'Client E',
      payment: 'Virement',
      remark: 'Transfert aéroport',
      totalExclVAT: 1500.00,
      vat: 90.00,
      totalInclVAT: 1590.00,
      deposit: 0.00,
      status: 'not-validated'
    }
  ]

  useEffect(() => {
    setQuotes(mockQuotes)
  }, [])

  const handleShowQuotes = () => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  const handleCreateQuote = () => {
    setShowCreateModal(true)
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

    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Le nom du client est requis'
    }

    if (!formData.clientAddress.trim()) {
      newErrors.clientAddress = 'L\'adresse du client est requise'
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Le code postal est requis'
    }

    if (!formData.city.trim()) {
      newErrors.city = 'La ville est requise'
    }

    if (!formData.company) {
      newErrors.company = 'La compagnie est requise'
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'La date d\'échéance est requise'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    // Generate quote number
    const currentYear = new Date().getFullYear()
    const nextNumber = Math.max(...quotes.map(q => {
      const year = parseInt(q.number.substring(0, 4))
      if (year === currentYear) {
        return parseInt(q.number.substring(4))
      }
      return 0
    })) + 1
    const quoteNumber = `${currentYear}${String(nextNumber).padStart(4, '0')}`

    // Create new quote
    const newQuote = {
      id: Math.max(...quotes.map(q => q.id)) + 1,
      number: quoteNumber,
      date: formData.date,
      dueDate: formData.dueDate,
      client: formData.clientName,
      payment: paymentMethods.find(pm => pm.value === formData.paymentMethod)?.label || 'Virement',
      remark: formData.remark,
      totalExclVAT: 0, // Will be calculated when items are added
      vat: 0,
      totalInclVAT: 0,
      deposit: formData.deposit || 0,
      status: 'not-validated'
    }

    // Add to quotes list
    setQuotes(prev => [newQuote, ...prev])
    
    // Reset form
    setFormData({
      clientType: 'existing',
      clientName: '',
      clientAddress: '',
      postalCode: '',
      city: '',
      clientVAT: '',
      company: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'virement',
      dueDate: '',
      deposit: 0,
      remark: ''
    })
    setErrors({})
    setShowCreateModal(false)
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
    setErrors({})
  }

  const handleAddCompany = () => {
    console.log('Add company functionality')
    // Implement add company functionality
  }

  const handleModifyQuote = (quoteId) => {
    console.log('Modify quote:', quoteId)
    // Implement modify functionality
  }

  const handleViewQuote = (quoteId) => {
    console.log('View quote:', quoteId)
    // Implement view functionality
  }

  const handleGeneratePDF = async (quoteId) => {
    const quote = quotes.find(q => q.id === quoteId)
    if (!quote) return

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height
    let yPosition = 30

    // Professional color scheme
    const primaryColor = [218, 165, 32] // Goldenrod
    const secondaryColor = [52, 73, 94] // Dark gray
    const accentColor = [230, 126, 34] // Orange

    // Header with professional styling
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.rect(0, 0, pageWidth, 50, 'F')
    
    try {
      // Add the actual logo
      const logoResponse = await fetch('/logo.png')
      const logoBlob = await logoResponse.blob()
      const logoBase64 = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result)
        reader.readAsDataURL(logoBlob)
      })
      
      // Add logo to PDF (30x30 pixels)
      doc.addImage(logoBase64, 'PNG', 15, 10, 30, 30)
    } catch (error) {
      console.log('Logo not found, using text fallback')
      // Fallback to text if logo not found
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(16)
      doc.setFont('helvetica', 'bold')
      doc.text('LIMOSTAR', 20, 25)
    }
    
    // Company name
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(20)
    doc.setFont('helvetica', 'bold')
    doc.text('LIMOSTAR', 55, 22)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Just luxury cars', 55, 28)
    
    // Quote title
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
    doc.text(`DEVIS ${quote.number}`, pageWidth - 60, 22)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Date: ${quote.date}`, pageWidth - 60, 28)
    doc.text(`Échéance: ${quote.dueDate}`, pageWidth - 60, 34)
    
    yPosition = 70

    // Client information
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
    doc.text('Devis pour:', 20, yPosition)
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(quote.client, 20, yPosition + 8)
    doc.text('Méthode de paiement: ' + quote.payment, 20, yPosition + 16)
    
    yPosition += 35

    // Quote details
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Détails du devis:', 20, yPosition)
    yPosition += 15

    // Table header
    doc.setFillColor(240, 248, 255)
    doc.rect(20, yPosition, pageWidth - 40, 12, 'F')
    
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Description', 25, yPosition + 8)
    doc.text('Total HTVA', pageWidth - 80, yPosition + 8)
    doc.text('TVA', pageWidth - 50, yPosition + 8)
    doc.text('Total TVAC', pageWidth - 25, yPosition + 8)
    yPosition += 15

    // Quote line
    doc.setFont('helvetica', 'normal')
    doc.text('Service de transport limousine', 25, yPosition + 8)
    doc.text(`${quote.totalExclVAT.toFixed(2)}€`, pageWidth - 80, yPosition + 8)
    doc.text(`${quote.vat.toFixed(2)}€`, pageWidth - 50, yPosition + 8)
    doc.text(`${quote.totalInclVAT.toFixed(2)}€`, pageWidth - 25, yPosition + 8)
    yPosition += 20

    // Totals
    doc.setFont('helvetica', 'bold')
    doc.text(`Total HTVA: ${quote.totalExclVAT.toFixed(2)}€`, pageWidth - 80, yPosition)
    doc.text(`TVA: ${quote.vat.toFixed(2)}€`, pageWidth - 50, yPosition)
    doc.text(`Total TVAC: ${quote.totalInclVAT.toFixed(2)}€`, pageWidth - 25, yPosition)
    
    if (quote.deposit > 0) {
      yPosition += 10
      doc.text(`Acompte: ${quote.deposit.toFixed(2)}€`, pageWidth - 80, yPosition)
      doc.text(`Solde: ${(quote.totalInclVAT - quote.deposit).toFixed(2)}€`, pageWidth - 25, yPosition)
    }

    // Remark
    if (quote.remark) {
      yPosition += 20
      doc.setFont('helvetica', 'bold')
      doc.text('Remarque:', 20, yPosition)
      doc.setFont('helvetica', 'normal')
      doc.text(quote.remark, 20, yPosition + 8)
    }

    // Footer
    const footerY = pageHeight - 20
    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
    doc.rect(0, footerY, pageWidth, 20, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text('LIMOSTAR - Professional Limousine Services', 20, footerY + 6)
    doc.text('Email: info@limostar.com | Tel: +33 1 23 45 67 89', 20, footerY + 12)
    
    const currentDate = new Date().toLocaleDateString('fr-FR')
    doc.text(`Généré le ${currentDate}`, pageWidth - 50, footerY + 6)

    // Save the PDF
    const fileName = `devis-${quote.number}-${quote.date}.pdf`
    doc.save(fileName)
  }

  const handleCopyQuote = (quoteId) => {
    console.log('Copy quote:', quoteId)
    // Implement copy functionality
  }

  const handlePrint = () => {
    window.print()
  }

  const getFilteredQuotes = () => {
    let filtered = quotes

    if (filterStatus !== 'all') {
      filtered = filtered.filter(quote => quote.status === filterStatus)
    }

    if (groupByClient !== 'all') {
      filtered = filtered.filter(quote => 
        quote.client.toLowerCase().replace(/\s+/g, '-') === groupByClient
      )
    }

    if (searchTerm) {
      filtered = filtered.filter(quote =>
        quote.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.remark.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered.slice(0, displayCount)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'validated': return 'bg-green-100 text-green-800'
      case 'not-validated': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'validated': return 'Validé'
      case 'not-validated': return 'Non validé'
      default: return status
    }
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 min-h-screen pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-3">
          <FileEdit className="w-6 h-6 lg:w-8 lg:h-8" style={{ color: '#DAA520' }} />
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            <span className="hidden sm:inline">{t('quotesTitle')}</span>
            <span className="sm:hidden">{t('quotesTitle')}</span>
          </h1>
        </div>
        <div className="text-sm text-gray-500">
          <span className="hidden sm:inline">Home / {t('quotesTitle')}</span>
          <span className="sm:hidden">Home / {t('quotesTitle')}</span>
        </div>
      </div>

      {/* Quotes Management Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 mb-6">
        <div className="flex items-center space-x-2 mb-6">
          <Receipt className="w-5 h-5" style={{ color: '#DAA520' }} />
          <h2 className="text-xl font-semibold text-gray-900">
            <span className="hidden sm:inline">{t('quotesTitle')}</span>
            <span className="sm:hidden">{t('quotesTitle')}</span>
          </h2>
        </div>

        {/* Filter Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('filter')}
              </label>
              <div className="flex space-x-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                >
                  {filterOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="relative">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t('search') + '...'}
                    className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('groupByClient')}
              </label>
              <select
                value={groupByClient}
                onChange={(e) => setGroupByClient(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
              >
                {clientOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <button
            onClick={handleCreateQuote}
            className="flex items-center space-x-2 px-6 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ backgroundColor: '#DAA520' }}
          >
            <Plus className="w-4 h-4" />
            <span>{t('createQuote')}</span>
          </button>
        </div>
      </div>

      {/* Quotes Table Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Table Header */}
        <div className="bg-gray-100 px-4 lg:px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900">
              <span className="hidden sm:inline">{t('quotesTable')}</span>
              <span className="sm:hidden">{t('quotesTitle')}</span>
            </h2>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">{t('display')} {t('records')}:</label>
                <select
                  value={displayCount}
                  onChange={(e) => setDisplayCount(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                >
                  {displayOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Pagination buttons */}
                <button className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#DAA520]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#DAA520]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#DAA520]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#DAA520]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                </button>
                
                {/* Print button */}
                <button
                  onClick={handlePrint}
                  className="flex items-center space-x-1 px-3 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('print')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quotes Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('number')}
                </th>
                <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('date')}
                </th>
                <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('dueDate')}
                </th>
                <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('client')}
                </th>
                <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('payment')}
                </th>
                <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('remark')}
                </th>
                <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('totalExclVat')}
                </th>
                <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('vat')}
                </th>
                <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('totalInclVat')}
                </th>
                <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('deposit')}
                </th>
                <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getFilteredQuotes().map((quote) => (
                <tr key={quote.id} className="hover:bg-gray-50">
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {quote.number}
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {quote.date}
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {quote.dueDate}
                  </td>
                  <td className="px-3 lg:px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-xs truncate" title={quote.client}>
                      {quote.client}
                    </div>
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {quote.payment}
                  </td>
                  <td className="px-3 lg:px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-md truncate" title={quote.remark}>
                      {quote.remark}
                    </div>
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {quote.totalExclVAT.toFixed(2)}€
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {quote.vat.toFixed(2)}€
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {quote.totalInclVAT.toFixed(2)}€
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {quote.deposit.toFixed(2)}€
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleModifyQuote(quote.id)}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Modifier
                      </button>
                      <button
                        onClick={() => handleGeneratePDF(quote.id)}
                        className="p-1 text-red-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <FileDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCopyQuote(quote.id)}
                        className="p-1 focus:outline-none focus:ring-2 focus:ring-[#DAA520]"
                        style={{ color: '#DAA520' }}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="px-4 lg:px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-gray-600">
            <div>
              Affichage de {getFilteredQuotes().length} devis sur {quotes.length} total
            </div>
            <div className="mt-2 sm:mt-0">
              Total des devis: {getFilteredQuotes().reduce((sum, q) => sum + q.totalInclVAT, 0).toFixed(2)}€
            </div>
          </div>
        </div>
      </div>

      {/* Create Quote Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <FileEdit className="w-6 h-6" style={{ color: '#DAA520' }} />
                <h2 className="text-2xl font-bold text-gray-900">Nouveau devis</h2>
              </div>
              <div className="text-sm text-gray-500">
                <span className="hidden sm:inline">Home / Devis / Ajouter Devis</span>
                <span className="sm:hidden">Home / Devis / Ajouter</span>
              </div>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Section - Client Information */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations Client</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Client
                    </label>
                    <select
                      value={formData.clientType}
                      onChange={(e) => handleInputChange('clientType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                    >
                      {existingClients.map(client => (
                        <option key={client.value} value={client.value}>
                          {client.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom Client
                    </label>
                    <input
                      type="text"
                      value={formData.clientName}
                      onChange={(e) => handleInputChange('clientName', e.target.value)}
                      placeholder="Client:"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent ${
                        errors.clientName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.clientName && (
                      <p className="mt-1 text-sm text-red-600">{errors.clientName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse de Client
                    </label>
                    <input
                      type="text"
                      value={formData.clientAddress}
                      onChange={(e) => handleInputChange('clientAddress', e.target.value)}
                      placeholder="Adresse de Client:"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent ${
                        errors.clientAddress ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.clientAddress && (
                      <p className="mt-1 text-sm text-red-600">{errors.clientAddress}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Code Postal
                    </label>
                    <input
                      type="text"
                      value={formData.postalCode}
                      onChange={(e) => handleInputChange('postalCode', e.target.value)}
                      placeholder="Code Postal:"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent ${
                        errors.postalCode ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.postalCode && (
                      <p className="mt-1 text-sm text-red-600">{errors.postalCode}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ville
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Ville:"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent ${
                        errors.city ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-600">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      TVA
                    </label>
                    <input
                      type="text"
                      value={formData.clientVAT}
                      onChange={(e) => handleInputChange('clientVAT', e.target.value)}
                      placeholder="TVA Client"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4 pt-4">
                    <button
                      type="submit"
                      className="px-6 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                      style={{ backgroundColor: '#DAA520' }}
                    >
                      Enregistrer
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="flex items-center space-x-2 px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      <span>Retour</span>
                    </button>
                  </div>
                </div>

                {/* Right Section - Quote Details */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Détails du Devis</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Compagnie
                    </label>
                    <div className="flex space-x-2">
                      <select
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                        className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent ${
                          errors.company ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        {companies.map(company => (
                          <option key={company.value} value={company.value}>
                            {company.label}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleAddCompany}
                        className="flex items-center space-x-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>+ Ajouter</span>
                      </button>
                    </div>
                    {errors.company && (
                      <p className="mt-1 text-sm text-red-600">{errors.company}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date:
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Paiement
                    </label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                    >
                      {paymentMethods.map(method => (
                        <option key={method.value} value={method.value}>
                          {method.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date d'échéance:
                    </label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => handleInputChange('dueDate', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent ${
                        errors.dueDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.dueDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Acompte:
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.deposit}
                      onChange={(e) => handleInputChange('deposit', parseFloat(e.target.value) || 0)}
                      placeholder="Accompte"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Remarque
                    </label>
                    <textarea
                      value={formData.remark}
                      onChange={(e) => handleInputChange('remark', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent resize-vertical"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Quotes

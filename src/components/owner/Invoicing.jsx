import { useState, useEffect } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { FileText, Filter, Plus, Search, Eye, Edit, CheckCircle, FileDown, Calendar, User, DollarSign, Receipt } from 'lucide-react'
import jsPDF from 'jspdf'

const Invoicing = () => {
  const { t } = useLanguage()
  const [filterStatus, setFilterStatus] = useState('all')
  const [groupByClient, setGroupByClient] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [displayCount, setDisplayCount] = useState(50)
  const [invoices, setInvoices] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    clientType: 'existing',
    clientName: '',
    clientAddress: '',
    postalCode: '',
    city: '',
    clientVAT: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'virement',
    dueDate: '',
    deposit: 0,
    remark: '',
    vatType: 'htva',
    designations: [
      {
        id: 1,
        description: '',
        vatRate: '21',
        price: 0
      }
    ]
  })
  const [errors, setErrors] = useState({})

  // Mock data for dropdowns
  const filterOptions = [
    { value: 'all', label: '--Toutes--' },
    { value: 'paid', label: 'Payées' },
    { value: 'pending', label: 'En attente' },
    { value: 'overdue', label: 'En retard' },
    { value: 'draft', label: 'Brouillons' }
  ]

  const clientOptions = [
    { value: 'all', label: '--Choisissez votre client--' },
    { value: 'candex', label: 'Candex Solutions Belgium BV' },
    { value: 'tourama', label: 'TOURAMA VOYAGES INTERNATIONAL S.A.' },
    { value: 'cooltours', label: 'Cooltours GmbH' },
    { value: 'chevalier', label: 'CHEVALIER FREDERIC LTD' },
    { value: 'client-e', label: 'Client E' },
    { value: 'client-f', label: 'Client F' }
  ]

  const displayOptions = [
    { value: 10, label: '10' },
    { value: 25, label: '25' },
    { value: 50, label: '50' },
    { value: 100, label: '100' }
  ]

  const paymentMethods = [
    { value: 'virement', label: 'Virement' },
    { value: 'especes', label: 'Espèces' },
    { value: 'carte', label: 'Carte de crédit' },
    { value: 'cheque', label: 'Chèque' }
  ]

  const vatRates = [
    { value: '0', label: '0%' },
    { value: '6', label: '6%' },
    { value: '12', label: '12%' },
    { value: '21', label: '21%' }
  ]

  const existingClients = [
    { value: 'candex', label: 'Candex Solutions Belgium BV' },
    { value: 'tourama', label: 'TOURAMA VOYAGES INTERNATIONAL S.A.' },
    { value: 'cooltours', label: 'Cooltours GmbH' },
    { value: 'chevalier', label: 'CHEVALIER FREDERIC LTD' }
  ]

  // Mock invoice data
  const mockInvoices = [
    {
      id: 1,
      number: 'FC 3356',
      date: '2025-09-10',
      dueDate: '2025-10-08',
      client: 'Candex Solutions Belgium BV',
      payment: 'Virement',
      remark: '',
      totalExclVAT: 450.00,
      vat: 27.00,
      totalInclVAT: 477.00,
      deposit: 0,
      status: 'paid'
    },
    {
      id: 2,
      number: 'FC 3355',
      date: '2025-09-10',
      dueDate: '2025-09-17',
      client: 'TOURAMA VOYAGES INTERNATIONAL S.A.',
      payment: 'Virement',
      remark: '',
      totalExclVAT: 1650.00,
      vat: 99.00,
      totalInclVAT: 1749.00,
      deposit: 0,
      status: 'paid'
    },
    {
      id: 3,
      number: 'FC 3354',
      date: '2025-09-08',
      dueDate: '2025-09-08',
      client: 'Cooltours GmbH',
      payment: 'Virement',
      remark: 'www.rentabus.be by Limostar',
      totalExclVAT: 2600.00,
      vat: 156.00,
      totalInclVAT: 2756.00,
      deposit: 2756,
      status: 'pending'
    },
    {
      id: 4,
      number: 'FC 3353',
      date: '2025-09-08',
      dueDate: '2025-09-12',
      client: 'CHEVALIER FREDERIC LTD',
      payment: 'Virement',
      remark: '',
      totalExclVAT: 450.00,
      vat: 27.00,
      totalInclVAT: 477.00,
      deposit: 0,
      status: 'paid'
    },
    {
      id: 5,
      number: 'FC 3352',
      date: '2025-09-05',
      dueDate: '2025-09-15',
      client: 'Client E',
      payment: 'Espèces',
      remark: 'Service VIP',
      totalExclVAT: 800.00,
      vat: 48.00,
      totalInclVAT: 848.00,
      deposit: 200,
      status: 'overdue'
    },
    {
      id: 6,
      number: 'FC 3351',
      date: '2025-09-03',
      dueDate: '2025-09-20',
      client: 'Client F',
      payment: 'Carte de crédit',
      remark: 'Transfert aéroport',
      totalExclVAT: 1200.00,
      vat: 72.00,
      totalInclVAT: 1272.00,
      deposit: 0,
      status: 'draft'
    }
  ]

  useEffect(() => {
    setInvoices(mockInvoices)
  }, [])

  const handleShowMonth = () => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  const handleCreateInvoice = () => {
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

  const handleDesignationChange = (index, field, value) => {
    const newDesignations = [...formData.designations]
    newDesignations[index] = {
      ...newDesignations[index],
      [field]: value
    }
    setFormData(prev => ({
      ...prev,
      designations: newDesignations
    }))
  }

  const addDesignation = () => {
    const newId = Math.max(...formData.designations.map(d => d.id)) + 1
    setFormData(prev => ({
      ...prev,
      designations: [
        ...prev.designations,
        {
          id: newId,
          description: '',
          vatRate: '21',
          price: 0
        }
      ]
    }))
  }

  const removeDesignation = (index) => {
    if (formData.designations.length > 1) {
      const newDesignations = formData.designations.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        designations: newDesignations
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

    if (!formData.dueDate) {
      newErrors.dueDate = 'La date d\'échéance est requise'
    }

    // Validate designations
    formData.designations.forEach((designation, index) => {
      if (!designation.description.trim()) {
        newErrors[`designation_${index}_description`] = 'La description est requise'
      }
      if (!designation.price || designation.price <= 0) {
        newErrors[`designation_${index}_price`] = 'Le prix doit être supérieur à 0'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    // Calculate totals
    const totalExclVAT = formData.designations.reduce((sum, designation) => {
      return sum + (designation.price || 0)
    }, 0)

    const totalVAT = formData.designations.reduce((sum, designation) => {
      const vatAmount = (designation.price || 0) * (parseFloat(designation.vatRate) / 100)
      return sum + vatAmount
    }, 0)

    const totalInclVAT = totalExclVAT + totalVAT

    // Generate invoice number
    const nextInvoiceNumber = `FC ${String(Math.max(...invoices.map(inv => parseInt(inv.number.split(' ')[1]))) + 1).padStart(4, '0')}`

    // Create new invoice
    const newInvoice = {
      id: Math.max(...invoices.map(inv => inv.id)) + 1,
      number: nextInvoiceNumber,
      date: formData.date,
      dueDate: formData.dueDate,
      client: formData.clientName,
      payment: paymentMethods.find(pm => pm.value === formData.paymentMethod)?.label || 'Virement',
      remark: formData.remark,
      totalExclVAT: totalExclVAT,
      vat: totalVAT,
      totalInclVAT: totalInclVAT,
      deposit: formData.deposit || 0,
      status: 'draft'
    }

    // Add to invoices list
    setInvoices(prev => [newInvoice, ...prev])
    
    // Reset form
    setFormData({
      clientType: 'existing',
      clientName: '',
      clientAddress: '',
      postalCode: '',
      city: '',
      clientVAT: '',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'virement',
      dueDate: '',
      deposit: 0,
      remark: '',
      vatType: 'htva',
      designations: [
        {
          id: 1,
          description: '',
          vatRate: '21',
          price: 0
        }
      ]
    })
    setErrors({})
    setShowCreateModal(false)
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
    setErrors({})
  }

  const handleModifyInvoice = (invoiceId) => {
    console.log('Modify invoice:', invoiceId)
    // Implement modify functionality
  }

  const handleViewInvoice = (invoiceId) => {
    console.log('View invoice:', invoiceId)
    // Implement view functionality
  }

  const handleGeneratePDF = async (invoiceId) => {
    const invoice = invoices.find(inv => inv.id === invoiceId)
    if (!invoice) return

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
    
    // Invoice title
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
    doc.text(`FACTURE ${invoice.number}`, pageWidth - 60, 22)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Date: ${invoice.date}`, pageWidth - 60, 28)
    doc.text(`Échéance: ${invoice.dueDate}`, pageWidth - 60, 34)
    
    yPosition = 70

    // Client information
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
    doc.text('Facturé à:', 20, yPosition)
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(invoice.client, 20, yPosition + 8)
    doc.text('Méthode de paiement: ' + invoice.payment, 20, yPosition + 16)
    
    yPosition += 35

    // Invoice details
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Détails de la facture:', 20, yPosition)
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

    // Invoice line
    doc.setFont('helvetica', 'normal')
    doc.text('Service de transport limousine', 25, yPosition + 8)
    doc.text(`${invoice.totalExclVAT.toFixed(2)}€`, pageWidth - 80, yPosition + 8)
    doc.text(`${invoice.vat.toFixed(2)}€`, pageWidth - 50, yPosition + 8)
    doc.text(`${invoice.totalInclVAT.toFixed(2)}€`, pageWidth - 25, yPosition + 8)
    yPosition += 20

    // Totals
    doc.setFont('helvetica', 'bold')
    doc.text(`Total HTVA: ${invoice.totalExclVAT.toFixed(2)}€`, pageWidth - 80, yPosition)
    doc.text(`TVA: ${invoice.vat.toFixed(2)}€`, pageWidth - 50, yPosition)
    doc.text(`Total TVAC: ${invoice.totalInclVAT.toFixed(2)}€`, pageWidth - 25, yPosition)
    
    if (invoice.deposit > 0) {
      yPosition += 10
      doc.text(`Acompte: ${invoice.deposit.toFixed(2)}€`, pageWidth - 80, yPosition)
      doc.text(`Solde: ${(invoice.totalInclVAT - invoice.deposit).toFixed(2)}€`, pageWidth - 25, yPosition)
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
    const fileName = `facture-${invoice.number}-${invoice.date}.pdf`
    doc.save(fileName)
  }

  const handleCheckInvoice = (invoiceId) => {
    console.log('Check invoice:', invoiceId)
    // Implement check/approve functionality
  }

  const getFilteredInvoices = () => {
    let filtered = invoices

    if (filterStatus !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === filterStatus)
    }

    if (groupByClient !== 'all') {
      filtered = filtered.filter(invoice => 
        invoice.client.toLowerCase().replace(/\s+/g, '-') === groupByClient
      )
    }

    if (searchTerm) {
      filtered = filtered.filter(invoice =>
        invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.client.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return filtered.slice(0, displayCount)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'paid': return 'Payée'
      case 'pending': return 'En attente'
      case 'overdue': return 'En retard'
      case 'draft': return 'Brouillon'
      default: return status
    }
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 min-h-screen pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-3">
          <FileText className="w-6 h-6 lg:w-8 lg:h-8" style={{ color: '#DAA520' }} />
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
            <span className="hidden sm:inline">{t('invoicingTitle')}</span>
            <span className="sm:hidden">{t('invoicingTitle')}</span>
          </h1>
        </div>
        <div className="text-sm text-gray-500">
          <span className="hidden sm:inline">Home / {t('invoicingTitle')}</span>
          <span className="sm:hidden">Home / {t('invoicingTitle')}</span>
        </div>
      </div>

      {/* Invoice Management Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 mb-6">
        <div className="flex items-center space-x-2 mb-6">
          <Receipt className="w-5 h-5" style={{ color: '#DAA520' }} />
          <h2 className="text-xl font-semibold text-gray-900">
            <span className="hidden sm:inline">{t('invoicingTitle')}</span>
            <span className="sm:hidden">{t('invoicingTitle')}</span>
          </h2>
        </div>

        {/* Filter Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('filter')}
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
              >
                {filterOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
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

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleShowMonth}
            disabled={loading}
            className="flex items-center justify-center space-x-2 px-6 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#DAA520' }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{t('loading')}</span>
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4" />
                <span>{t('showMonth')}</span>
              </>
            )}
          </button>
          <button
            onClick={handleCreateInvoice}
            className="flex items-center justify-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            <Plus className="w-4 h-4" />
            <span>{t('createInvoice')}</span>
          </button>
        </div>
      </div>

      {/* Invoice Table Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5" style={{ color: '#DAA520' }} />
            <h2 className="text-xl font-semibold text-gray-900">
              <span className="hidden sm:inline">{t('invoiceTable')}</span>
              <span className="sm:hidden">{t('invoicingTitle')}</span>
            </h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">{t('search')}:</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('search') + '...'}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">{t('display')}</label>
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
              <span className="text-sm text-gray-700">{t('records')}</span>
            </div>
          </div>
        </div>

        {/* Invoice Table */}
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
              {getFilteredInvoices().map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {invoice.number}
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.date}
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.dueDate}
                  </td>
                  <td className="px-3 lg:px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-xs truncate" title={invoice.client}>
                      {invoice.client}
                    </div>
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.payment}
                  </td>
                  <td className="px-3 lg:px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-xs truncate" title={invoice.remark}>
                      {invoice.remark || '-'}
                    </div>
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.totalExclVAT.toFixed(2)}€
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.vat.toFixed(2)}€
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {invoice.totalInclVAT.toFixed(2)}€
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.deposit.toFixed(2)}€
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleModifyInvoice(invoice.id)}
                        className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        Modifier
                      </button>
                      <button
                        onClick={() => handleViewInvoice(invoice.id)}
                        className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#DAA520]"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleGeneratePDF(invoice.id)}
                        className="p-1 text-red-400 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <FileDown className="w-4 h-4" />
                      </button>
                      {invoice.status === 'paid' && (
                        <button
                          onClick={() => handleCheckInvoice(invoice.id)}
                          className="p-1 text-green-400 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-gray-600">
            <div>
              Affichage de {getFilteredInvoices().length} facture(s) sur {invoices.length} total
            </div>
            <div className="mt-2 sm:mt-0">
              Total des factures: {getFilteredInvoices().reduce((sum, inv) => sum + inv.totalInclVAT, 0).toFixed(2)}€
            </div>
          </div>
        </div>
      </div>

      {/* Create Invoice Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <FileText className="w-6 h-6" style={{ color: '#DAA520' }} />
                <h2 className="text-2xl font-bold text-gray-900">Nouvelle Facture</h2>
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

            {/* Modal Content */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Client Information Column */}
                <div className="space-y-4">
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
                      <option value="existing">--Nouveau Client--</option>
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
                </div>

                {/* Invoice Details Column */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Détails Facture</h3>
                  
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
                      <option value="">--Payment--</option>
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
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      TVAC ou HTVA?
                    </label>
                    <select
                      value={formData.vatType}
                      onChange={(e) => handleInputChange('vatType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                    >
                      <option value="htva">HTVA</option>
                      <option value="tvac">TVAC</option>
                    </select>
                  </div>
                </div>

                {/* Designations Column */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Désignations</h3>
                  
                  {formData.designations.map((designation, index) => (
                    <div key={designation.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-gray-900">Désignation {index + 1}:</h4>
                        {formData.designations.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeDesignation(index)}
                            className="text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            value={designation.description}
                            onChange={(e) => handleDesignationChange(index, 'description', e.target.value)}
                            placeholder={`Désignation ${index + 1}:`}
                            rows={2}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent ${
                              errors[`designation_${index}_description`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {errors[`designation_${index}_description`] && (
                            <p className="mt-1 text-sm text-red-600">{errors[`designation_${index}_description`]}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            TVA
                          </label>
                          <select
                            value={designation.vatRate}
                            onChange={(e) => handleDesignationChange(index, 'vatRate', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                          >
                            <option value="">--TVA--</option>
                            {vatRates.map(rate => (
                              <option key={rate.value} value={rate.value}>
                                {rate.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Prix de désignation {index + 1}:
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            value={designation.price}
                            onChange={(e) => handleDesignationChange(index, 'price', parseFloat(e.target.value) || 0)}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent ${
                              errors[`designation_${index}_price`] ? 'border-red-500' : 'border-gray-300'
                            }`}
                          />
                          {errors[`designation_${index}_price`] && (
                            <p className="mt-1 text-sm text-red-600">{errors[`designation_${index}_price`]}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <button
                    type="button"
                    onClick={addDesignation}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Ajouter</span>
                  </button>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex items-center space-x-2 px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Retour</span>
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
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

export default Invoicing

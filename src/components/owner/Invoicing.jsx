import { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { FileText, Filter, Plus, Search, Eye, Edit, CheckCircle, FileDown, Calendar, User, DollarSign, Receipt } from 'lucide-react'
import { firestoreService } from '../../services/firestoreService'
import { downloadInvoice, createInvoiceFromTrip, generateInvoiceNumber } from '../../utils/invoiceGenerator'

const Invoicing = () => {
  const { t } = useLanguage()
  const [filterStatus, setFilterStatus] = useState('all')
  const [groupByClient, setGroupByClient] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [displayCount, setDisplayCount] = useState(50)
  const [showPaidOnly, setShowPaidOnly] = useState(false)
  const [showUnpaidOnly, setShowUnpaidOnly] = useState(false)
  const [invoices, setInvoices] = useState([])
  const [trips, setTrips] = useState([])
  const [clients, setClients] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [loading, setLoading] = useState(true)
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

  // Reusable function to map invoice data from Firebase
  const mapInvoiceData = useCallback((invoicesData) => {
    return invoicesData.map(invoice => {
      // Extract monetary values with better fallback logic
      const totals = invoice.totals || {}
      const services = invoice.services || []
      
      // Calculate totals from services if available
      let calculatedSubtotal = 0
      let calculatedVat = 0
      let calculatedTotal = 0
      
      if (services.length > 0) {
        calculatedSubtotal = services.reduce((sum, service) => sum + (service.priceExclVat || service.price || 0), 0)
        calculatedVat = services.reduce((sum, service) => sum + (service.vatAmount || service.vat || 0), 0)
        calculatedTotal = services.reduce((sum, service) => sum + (service.priceInclVat || service.total || 0), 0)
      }
      
      return {
        id: invoice.id,
        number: invoice.invoiceNumber || invoice.number || `FC-${invoice.id}`,
        date: invoice.date || invoice.invoiceDate || new Date().toISOString().split('T')[0],
        dueDate: invoice.dueDate || invoice.paymentDueDate || invoice.date || new Date().toISOString().split('T')[0],
        client: invoice.clientName || invoice.client || invoice.clientCompany || 'Unknown Client',
        payment: invoice.paymentMethod || invoice.payment || 'Virement',
        remark: invoice.remark || invoice.notes || invoice.description || '',
        totalExclVAT: totals.priceExclVat || totals.subtotal || invoice.totalExclVAT || invoice.subtotal || invoice.totalExclVat || calculatedSubtotal || 0,
        vat: totals.vatAmount || totals.vat || invoice.vat || invoice.vatAmount || invoice.totalVat || calculatedVat || 0,
        totalInclVAT: totals.priceInclVat || totals.total || invoice.totalInclVAT || invoice.total || invoice.totalInclVat || calculatedTotal || 0,
        deposit: totals.deposit || invoice.deposit || invoice.paidAmount || 0,
        status: invoice.status || 'pending'
      }
    })
  }, [])

  // Mock invoice data - moved here to be available for fallback
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

  // Load data from Firestore - simplified approach
  const loadData = useCallback(async () => {
    try {
      setLoading(true)

      // Load invoices from Firebase
      const invoicesData = await firestoreService.getInvoices()

      // Always set the invoices - either from Firebase or mock data
      if (invoicesData && invoicesData.length > 0) {

        // Map Firebase data to expected format
        const mappedInvoices = mapInvoiceData(invoicesData)

        setInvoices(mappedInvoices)
      } else {

        setInvoices(mockInvoices)
      }
      
      // Load other data
      const [tripsData, clientsData] = await Promise.all([
        firestoreService.getTrips().catch(() => []),
        firestoreService.getClients().catch(() => [])
      ])
      
      setTrips(tripsData || [])
      setClients(clientsData || [])
      
    } catch (error) {

      setInvoices(mockInvoices)
      setTrips([])
      setClients([])
    } finally {
      setLoading(false)

    }
  }, [])

  // Load data on component mount
  useEffect(() => {
    loadData()
  }, [loadData])

  useEffect(() => {

  }, [invoices, loading])

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

  const handleShowMonth = () => {

    loadData()
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)

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
      const invoiceNumber = generateInvoiceNumber()

      // Create invoice data for PDF
      const invoiceData = {
        invoiceNumber: invoiceNumber,
        date: formData.date,
        dueDate: formData.dueDate,
        clientCode: formData.clientType === 'existing' ? formData.clientName : 'CL0001',
        clientName: formData.clientName,
        clientAddress: formData.clientAddress,
        clientPostalCode: formData.postalCode,
        clientCity: formData.city,
        paymentMethod: formData.paymentMethod,
        services: formData.designations.map(designation => ({
          description: designation.description,
          priceExclVat: designation.price || 0,
          vatRate: parseFloat(designation.vatRate),
          vatAmount: (designation.price || 0) * (parseFloat(designation.vatRate) / 100),
          priceInclVat: (designation.price || 0) + ((designation.price || 0) * (parseFloat(designation.vatRate) / 100))
        })),
        totals: {
          priceExclVat: totalExclVAT,
          vatAmount: totalVAT,
          priceInclVat: totalInclVAT,
          deposit: formData.deposit || 0
        }
      }

      // Save to Firestore with error handling
      try {
        const invoiceId = await firestoreService.addInvoice({
          invoiceNumber: invoiceNumber,
          date: formData.date,
          dueDate: formData.dueDate,
          clientName: formData.clientName,
          clientAddress: formData.clientAddress,
          clientPostalCode: formData.postalCode,
          clientCity: formData.city,
          paymentMethod: formData.paymentMethod,
          remark: formData.remark,
          services: invoiceData.services,
          totals: invoiceData.totals,
          status: 'draft'
        })

      } catch (firebaseError) {

        // Continue with PDF generation even if Firebase save fails
      }

      // Generate and download PDF
      downloadInvoice(invoiceData)

      // Refresh invoices list with error handling
      try {

        const updatedInvoices = await firestoreService.getInvoices()
        
        // Apply the same mapping logic as in loadData
        const mappedInvoices = mapInvoiceData(updatedInvoices)
        
        setInvoices(mappedInvoices)

      } catch (refreshError) {

        // Keep existing invoices if refresh fails
      }
      
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
      
    } catch (error) {

      setErrors({ general: 'Failed to create invoice. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
    setErrors({})
  }

  const handleModifyInvoice = (invoiceId) => {
    const invoice = invoices.find(inv => inv.id === invoiceId)
    if (!invoice) return
    
    // Set form data with existing invoice data
    setFormData({
      clientType: 'existing',
      clientName: invoice.client,
      clientAddress: invoice.address || '',
      postalCode: invoice.postalCode || '',
      city: invoice.city || '',
      clientVAT: invoice.vat || '',
      date: invoice.date,
      paymentMethod: invoice.paymentMethod || 'virement',
      dueDate: invoice.dueDate || '',
      deposit: invoice.deposit || 0,
      remark: invoice.remark || '',
      vatType: invoice.vatType || 'htva',
      designations: invoice.designations || [
        {
          id: 1,
          description: '',
          vatRate: '21',
          price: 0
        }
      ]
    })
    
    // Open the create modal for editing
    setShowCreateModal(true)
  }

  const handleViewInvoice = (invoiceId) => {
    const invoice = invoices.find(inv => inv.id === invoiceId)
    if (!invoice) return
    
    // Create a new window/tab to display the invoice
    const newWindow = window.open('', '_blank')
    newWindow.document.write(`
      <html>
        <head>
          <title>Invoice ${invoice.number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .invoice-info { margin-bottom: 20px; }
            .invoice-details { border: 1px solid #ccc; padding: 15px; margin-bottom: 20px; }
            .designations { margin-bottom: 20px; }
            .designations table { width: 100%; border-collapse: collapse; }
            .designations th, .designations td { border: 1px solid #ccc; padding: 8px; text-align: left; }
            .designations th { background-color: #f5f5f5; }
            .totals { margin-top: 20px; }
            .footer { margin-top: 30px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Invoice ${invoice.number}</h1>
            <p>Date: ${invoice.date}</p>
          </div>
          <div class="invoice-info">
            <h3>Client Information</h3>
            <p><strong>Client:</strong> ${invoice.client}</p>
            <p><strong>Address:</strong> ${invoice.address || 'N/A'}</p>
            <p><strong>City:</strong> ${invoice.city || 'N/A'}</p>
            <p><strong>VAT:</strong> ${invoice.vat || 'N/A'}</p>
          </div>
          <div class="invoice-details">
            <h3>Invoice Details</h3>
            <p><strong>Payment Method:</strong> ${invoice.paymentMethod || 'N/A'}</p>
            <p><strong>Due Date:</strong> ${invoice.dueDate || 'N/A'}</p>
            <p><strong>Deposit:</strong> €${invoice.deposit || 0}</p>
            <p><strong>Status:</strong> ${invoice.status}</p>
            <p><strong>Remark:</strong> ${invoice.remark || 'N/A'}</p>
          </div>
          <div class="designations">
            <h3>Designations</h3>
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>VAT Rate</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.designations ? invoice.designations.map(designation => `
                  <tr>
                    <td>${designation.description || 'N/A'}</td>
                    <td>${designation.vatRate || 'N/A'}%</td>
                    <td>€${designation.price || 0}</td>
                  </tr>
                `).join('') : '<tr><td colspan="3">No designations</td></tr>'}
              </tbody>
            </table>
          </div>
          <div class="totals">
            <h3>Totals</h3>
            <p><strong>Total Excl. VAT:</strong> €${invoice.totalExclVat || 0}</p>
            <p><strong>Total Incl. VAT:</strong> €${invoice.totalInclVat || 0}</p>
          </div>
          <div class="footer">
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
        </body>
      </html>
    `)
    newWindow.document.close()
  }

  const handleGeneratePDF = async (invoiceId) => {
    try {
      const invoice = invoices.find(inv => inv.id === invoiceId)
      if (!invoice) {
        alert('Invoice not found!')
        return
      }

      // Convert the existing invoice data to our new format with proper validation
      const invoiceData = {
        invoiceNumber: invoice.number || 'FC-0000',
        date: invoice.date || new Date().toISOString().split('T')[0],
        dueDate: invoice.dueDate || new Date().toISOString().split('T')[0],
        clientCode: 'CL1595', // Default client code
        clientName: invoice.client || 'Client non spécifié',
        clientAddress: [invoice.client || 'Adresse non spécifiée'], // Convert to array format for our generator
        paymentMethod: invoice.payment || 'Virement',
        services: [
          {
            description: 'Service de transport limousine',
            priceExclVat: parseFloat(invoice.totalExclVAT) || 0,
            vatRate: 21, // Default VAT rate
            vatAmount: parseFloat(invoice.vat) || 0,
            priceInclVat: parseFloat(invoice.totalInclVAT) || 0
          }
        ],
        totals: {
          priceExclVat: parseFloat(invoice.totalExclVAT) || 0,
          vatAmount: parseFloat(invoice.vat) || 0,
          priceInclVat: parseFloat(invoice.totalInclVAT) || 0,
          deposit: parseFloat(invoice.deposit) || 0
        },
        remark: invoice.remark || 'www.locationautocar.be by Limostar',
        page: '1'
      }

      // Use our new invoice generator with error handling
      try {
        downloadInvoice(invoiceData)
      } catch (pdfError) {

        alert('Error generating PDF. Please try again.')
      }
      
    } catch (error) {

      alert('Error generating PDF. Please try again.')
    }
  }

  const handleCheckInvoice = (invoiceId) => {

    // Implement check/approve functionality
  }

  const handleToggleInvoicePaymentStatus = async (invoiceId) => {
    try {
      const invoice = invoices.find(inv => inv.id === invoiceId)
      if (!invoice) return

      const newStatus = invoice.status === 'paid' ? 'pending' : 'paid'
      
      // Update in Firebase
      await firestoreService.updateInvoice(invoiceId, { status: newStatus })
      
      // Update local state
      setInvoices(prevInvoices =>
        prevInvoices.map(inv =>
          inv.id === invoiceId ? { ...inv, status: newStatus } : inv
        )
      )

    } catch (error) {

    }
  }

  const getFilteredInvoices = () => {

    let filtered = invoices

    if (filterStatus !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === filterStatus)
    }

    // Apply paid/unpaid filters
    if (showPaidOnly && !showUnpaidOnly) {
      filtered = filtered.filter(invoice => invoice.status === 'paid')
    } else if (showUnpaidOnly && !showPaidOnly) {
      filtered = filtered.filter(invoice => invoice.status !== 'paid')
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

    const result = filtered.slice(0, displayCount)

    return result
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
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#FFF8DC' }}>
              <FileText className="w-5 h-5 lg:w-6 lg:h-6" style={{ color: '#DAA520' }} />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t('invoicingTitle')}</h1>
              <p className="text-sm lg:text-base text-gray-600">Gestion des factures</p>
            </div>
          </div>
        </div>
        
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-xs lg:text-sm text-gray-500">
          <span>Home</span>
          <span>/</span>
          <span className="text-gray-900 font-medium">{t('invoicingTitle')}</span>
        </nav>
      </div>

      {/* Invoice Management Section */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
            {/* Payment Status Checkboxes */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut de Paiement
              </label>
              <div className="flex flex-col space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPaidOnly}
                    onChange={(e) => {
                      setShowPaidOnly(e.target.checked)
                      if (e.target.checked) setShowUnpaidOnly(false)
                    }}
                    className="w-4 h-4 text-[#DAA520] border-gray-300 rounded focus:ring-[#DAA520]"
                  />
                  <span className="text-sm text-gray-700">Acquittées (Payées)</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showUnpaidOnly}
                    onChange={(e) => {
                      setShowUnpaidOnly(e.target.checked)
                      if (e.target.checked) setShowPaidOnly(false)
                    }}
                    className="w-4 h-4 text-[#DAA520] border-gray-300 rounded focus:ring-[#DAA520]"
                  />
                  <span className="text-sm text-gray-700">Non Payées</span>
                </label>
              </div>
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
      </div>

      {/* Invoice Table Section */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Table Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 space-y-4 lg:space-y-0">
              <h3 className="text-lg font-semibold text-gray-900">{t('invoiceTable')}</h3>
              <div className="flex items-center space-x-2 lg:space-x-3">
                <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  <FileDown className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                  <span className="sm:hidden">Export</span>
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
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-[#DAA520] text-sm"
                />
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-700 whitespace-nowrap">Affichage/Page:</label>
                <select
                  value={displayCount}
                  onChange={(e) => setDisplayCount(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-[#DAA520] text-sm"
                >
                  {displayOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

        {/* Invoice Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 lg:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payée
                </th>
                <th className="px-2 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('number')}
                </th>
                <th className="px-2 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('date')}
                </th>
                <th className="px-2 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  {t('dueDate')}
                </th>
                <th className="px-2 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('client')}
                </th>
                <th className="px-2 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  {t('payment')}
                </th>
                <th className="px-2 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  {t('remark')}
                </th>
                <th className="px-2 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  {t('totalExclVat')}
                </th>
                <th className="px-2 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  {t('vat')}
                </th>
                <th className="px-2 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('totalInclVat')}
                </th>
                <th className="px-2 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  {t('deposit')}
                </th>
                <th className="px-2 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {getFilteredInvoices().map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-center">
                    <input
                      type="checkbox"
                      checked={invoice.status === 'paid'}
                      onChange={() => handleToggleInvoicePaymentStatus(invoice.id)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500 cursor-pointer"
                      title={invoice.status === 'paid' ? 'Marquer comme non payée' : 'Marquer comme payée'}
                    />
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {invoice.number}
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.date}
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden sm:table-cell">
                    {invoice.dueDate}
                  </td>
                  <td className="px-3 lg:px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-xs truncate" title={invoice.client}>
                      {invoice.client}
                    </div>
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                    {invoice.payment}
                  </td>
                  <td className="px-3 lg:px-6 py-4 text-sm text-gray-900 hidden lg:table-cell">
                    <div className="max-w-xs truncate" title={invoice.remark}>
                      {invoice.remark || '-'}
                    </div>
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden sm:table-cell">
                    {invoice.totalExclVAT?.toFixed(2) || '0.00'}€
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                    {invoice.vat?.toFixed(2) || '0.00'}€
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {invoice.totalInclVAT?.toFixed(2) || '0.00'}€
                  </td>
                  <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden lg:table-cell">
                    {invoice.deposit?.toFixed(2) || '0.00'}€
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
              Total des factures: {getFilteredInvoices().reduce((sum, inv) => sum + (inv.totalInclVAT || 0), 0).toFixed(2)}€
            </div>
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
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 mt-4"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Ajouter</span>
                  </button>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 w-full sm:w-auto order-2 sm:order-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span>Retour</span>
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 w-full sm:w-auto order-1 sm:order-2"
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

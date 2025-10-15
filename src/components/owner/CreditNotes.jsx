import { useState, useEffect, useRef, useCallback } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { FileEdit, Plus, Search, Eye, Edit, FileDown, Mail, Printer, Filter } from 'lucide-react'
import { firestoreService } from '../../services/firestoreService'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '../../config/firebase'
import jsPDF from 'jspdf'

const CreditNotes = () => {
  const { t } = useLanguage()
  const [searchTerm, setSearchTerm] = useState('')
  const [displayCount, setDisplayCount] = useState(10)
  const [creditNotes, setCreditNotes] = useState([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const isMountedRef = useRef(true)
  const [formData, setFormData] = useState({
    client: '',
    date: new Date().toISOString().split('T')[0],
    remark: '',
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
  const displayOptions = [
    { value: 10, label: '10' },
    { value: 25, label: '25' },
    { value: 50, label: '50' },
    { value: 100, label: '100' }
  ]

  const clients = [
    { value: '', label: '-- Client --' },
    { value: 'a&m', label: 'A&M sprl' },
    { value: 'latvia', label: 'Permanent Representation of the Republic of Latvia to the European Union' },
    { value: 'belgian-handling', label: 'Belgian Handling Services' },
    { value: 'bicschool', label: 'Bicschool' },
    { value: 'eco-conseil', label: 'Institut Eco-Conseil ASBL' },
    { value: 'godiva', label: 'GODIVA BELGIUM SPRL' },
    { value: 'itm', label: 'ITM Belgium' },
    { value: 'vesta', label: 'Vesta Senior - Résidence' }
  ]

  const vatRates = [
    { value: '', label: '--TVA--' },
    { value: '0', label: '0%' },
    { value: '6', label: '6%' },
    { value: '12', label: '12%' },
    { value: '21', label: '21%' }
  ]

  // Mock credit notes data based on the image
  const mockCreditNotes = [
    {
      id: 1,
      number: '2014001',
      date: '2014-09-15',
      client: 'A&M sprl',
      remark: 'Annulation du transfert retour Charleroi - Bruxelles',
      totalPrice: 295.00,
      status: 'active'
    },
    {
      id: 2,
      number: '2014002',
      date: '2014-12-04',
      client: 'Permanent Representation of the Republic of Latvia to the European Union',
      remark: 'Cancellation of the invoice number FC0951',
      totalPrice: 0.00,
      status: 'active'
    },
    {
      id: 3,
      number: '2014003',
      date: '2014-12-08',
      client: 'Belgian Handling Services',
      remark: 'Annulation de la Facture N° : FC0935 changement de TVA et de domination sociale',
      totalPrice: 3444.00,
      status: 'active'
    },
    {
      id: 4,
      number: '2015001',
      date: '2015-03-31',
      client: 'Bicschool',
      remark: 'Annulation de la Facture N° : FC1005',
      totalPrice: 0.00,
      status: 'active'
    },
    {
      id: 5,
      number: '2015002',
      date: '2015-04-20',
      client: 'Bicschool',
      remark: 'Annulation Facture N°: FC1010',
      totalPrice: 377.36,
      status: 'active'
    },
    {
      id: 6,
      number: '2015003',
      date: '2015-06-03',
      client: 'Institut Eco-Conseil ASBL',
      remark: 'Annulation de la facture FC1060',
      totalPrice: 450.00,
      status: 'active'
    },
    {
      id: 7,
      number: '2016001',
      date: '2016-04-14',
      client: 'GODIVA BELGIUM SPRL',
      remark: 'Annulation de la facture FC1236',
      totalPrice: 0.00,
      status: 'active'
    },
    {
      id: 8,
      number: '2016002',
      date: '2016-09-21',
      client: 'ITM Belgium',
      remark: 'ANNULATION DE LA FACTURE N°: FC1334',
      totalPrice: 1353.73,
      status: 'active'
    },
    {
      id: 9,
      number: '2016003',
      date: '2016-09-21',
      client: 'ITM Belgium',
      remark: 'ANNULATION DE LA FACTURE N°: FC1334',
      totalPrice: 0.00,
      status: 'active'
    },
    {
      id: 10,
      number: '2017001',
      date: '2017-04-26',
      client: 'Vesta Senior - Résidence',
      remark: 'NC - FC1490 LA TVA A REVERSER A L\'ETAT DANS LA MESURE OU ELLE été',
      totalPrice: 450.00,
      status: 'active'
    },
    {
      id: 11,
      number: '2017002',
      date: '2017-05-15',
      client: 'Client Example',
      remark: 'Annulation de la facture FC1500',
      totalPrice: 250.00,
      status: 'active'
    },
    {
      id: 12,
      number: '2017003',
      date: '2017-06-20',
      client: 'Another Client',
      remark: 'Correction de prix sur facture FC1505',
      totalPrice: 150.00,
      status: 'active'
    }
  ]

  // Load credit notes from Firebase with proper cleanup
  const loadCreditNotes = useCallback(async () => {
    console.log('🚀 loadCreditNotes called, isMounted:', isMountedRef.current)
    
    try {
      setLoading(true)
      setError('')
      console.log('🔄 Loading credit notes from Firebase...')
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout after 10 seconds')), 10000)
      )
      
      // Try service first, then fallback to direct Firebase call
      let creditNotesData
      try {
        console.log('📞 Calling firestoreService.getCreditNotes()...')
        creditNotesData = await Promise.race([
          firestoreService.getCreditNotes(),
          timeoutPromise
        ])
        console.log('📋 Raw credit notes data from Firebase (via service):', creditNotesData)
        console.log('📋 Data type:', typeof creditNotesData, 'Array?', Array.isArray(creditNotesData))
      } catch (serviceError) {
        console.log('⚠️ Service failed, trying direct Firebase call:', serviceError.message)
        console.log('⚠️ Service error details:', serviceError)
        
        // Fallback: Direct Firebase call
        console.log('🔄 Attempting direct Firebase query...')
        const creditNotesRef = collection(db, 'creditNotes')
        const q = query(creditNotesRef, orderBy('createdAt', 'desc'))
        const querySnapshot = await getDocs(q)
        creditNotesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }))
        console.log('📋 Raw credit notes data from Firebase (direct):', creditNotesData)
        console.log('📋 Direct data type:', typeof creditNotesData, 'Array?', Array.isArray(creditNotesData))
      }
      
      // Ensure we have an array
      if (!Array.isArray(creditNotesData)) {
        console.warn('⚠️ creditNotesData is not an array:', creditNotesData)
        creditNotesData = []
      }
      
      // Map credit note data to ensure consistent field names
      const mappedCreditNotes = creditNotesData.map(creditNote => ({
        id: creditNote.id,
        number: creditNote.number || creditNote.creditNoteNumber || '',
        date: creditNote.date || creditNote.creditNoteDate || new Date().toISOString().split('T')[0],
        client: creditNote.client || creditNote.clientName || creditNote.customer || 'Unknown Client',
        remark: creditNote.remark || creditNote.description || creditNote.notes || '',
        totalPrice: creditNote.totalPrice || creditNote.amount || creditNote.total || 0,
        status: creditNote.status || creditNote.creditNoteStatus || 'active',
        ...creditNote // Include any other fields
      }))
      
      console.log('📝 Mapped credit notes:', mappedCreditNotes)
      console.log('📝 Mapped data length:', mappedCreditNotes.length)
      
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        console.log('✅ Component still mounted, updating state...')
        setCreditNotes(mappedCreditNotes)
        setError('')
        console.log('✅ Credit notes state updated with', mappedCreditNotes.length, 'items')
      } else {
        console.log('⚠️ Component unmounted, skipping state update')
      }
    } catch (error) {
      console.error('❌ Error loading credit notes:', error)
      console.error('❌ Error stack:', error.stack)
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        if (error.message.includes('timeout')) {
          setError('Connection timeout. Please check your internet connection and try again.')
        } else {
          setError(`Failed to load credit notes: ${error.message}`)
        }
        setCreditNotes([])
        console.log('❌ Error state set, credit notes cleared')
      }
    } finally {
      // Only update loading state if component is still mounted
      if (isMountedRef.current) {
        setLoading(false)
        console.log('🏁 Loading completed, loading set to false')
      } else {
        console.log('⚠️ Component unmounted, skipping loading state update')
      }
    }
  }, [])

  useEffect(() => {
    isMountedRef.current = true
    loadCreditNotes()
    
    // Cleanup function
    return () => {
      isMountedRef.current = false
    }
  }, []) // Remove loadCreditNotes dependency to prevent infinite loop

  const handleCreateCreditNote = () => {
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

    if (!formData.client) {
      newErrors.client = 'Le client est requis'
    }

    if (!formData.date) {
      newErrors.date = 'La date est requise'
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

    setLoading(true)

    try {
      // Calculate total price
      const totalPrice = formData.designations.reduce((sum, designation) => {
        return sum + (designation.price || 0)
      }, 0)

      // Generate credit note number
      const currentYear = new Date().getFullYear()
      const nextNumber = Math.max(...creditNotes.map(cn => {
        const year = parseInt(cn.number.substring(0, 4))
        if (year === currentYear) {
          return parseInt(cn.number.substring(4))
        }
        return 0
      })) + 1
      const creditNoteNumber = `${currentYear}${String(nextNumber).padStart(3, '0')}`

      // Create new credit note data for Firebase
      const creditNoteData = {
        number: creditNoteNumber,
        date: formData.date,
        client: clients.find(c => c.value === formData.client)?.label || formData.client,
        remark: formData.remark,
        totalPrice: totalPrice,
        status: 'active',
        designations: formData.designations
      }

      // Save to Firebase
      const docRef = await firestoreService.addCreditNote(creditNoteData)
      console.log('Credit note created with ID:', docRef)

      // Reload credit notes from Firebase
      await loadCreditNotes()
      
      // Reset form
      setFormData({
        client: '',
        date: new Date().toISOString().split('T')[0],
        remark: '',
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
      console.error('Error creating credit note:', error)
      setErrors({ submit: 'Failed to create credit note. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleCloseModal = () => {
    setShowCreateModal(false)
    setErrors({})
  }

  const handleModifyCreditNote = (creditNoteId) => {
    const creditNote = creditNotes.find(cn => cn.id === creditNoteId)
    if (!creditNote) return
    
    // Set form data with existing credit note data
    setFormData({
      client: creditNote.client || '',
      date: creditNote.date || new Date().toISOString().split('T')[0],
      remark: creditNote.remark || '',
      designations: creditNote.designations || [
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

  const handleViewCreditNote = (creditNoteId) => {
    const creditNote = creditNotes.find(cn => cn.id === creditNoteId)
    if (!creditNote) return
    
    // Create a new window/tab to display the credit note
    const newWindow = window.open('', '_blank')
    newWindow.document.write(`
      <html>
        <head>
          <title>Credit Note ${creditNote.number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .creditnote-info { margin-bottom: 20px; }
            .creditnote-details { border: 1px solid #ccc; padding: 15px; margin-bottom: 20px; }
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
            <h1>Credit Note ${creditNote.number}</h1>
            <p>Date: ${creditNote.date}</p>
          </div>
          <div class="creditnote-info">
            <h3>Client Information</h3>
            <p><strong>Client:</strong> ${creditNote.client}</p>
            <p><strong>Address:</strong> ${creditNote.address || 'N/A'}</p>
            <p><strong>City:</strong> ${creditNote.city || 'N/A'}</p>
            <p><strong>VAT:</strong> ${creditNote.vat || 'N/A'}</p>
          </div>
          <div class="creditnote-details">
            <h3>Credit Note Details</h3>
            <p><strong>Company:</strong> ${creditNote.company || 'N/A'}</p>
            <p><strong>Payment Method:</strong> ${creditNote.paymentMethod || 'N/A'}</p>
            <p><strong>Due Date:</strong> ${creditNote.dueDate || 'N/A'}</p>
            <p><strong>Deposit:</strong> €${creditNote.deposit || 0}</p>
            <p><strong>Status:</strong> ${creditNote.status}</p>
            <p><strong>Remark:</strong> ${creditNote.remark || 'N/A'}</p>
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
                ${creditNote.designations ? creditNote.designations.map(designation => `
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
            <p><strong>Total Excl. VAT:</strong> €${creditNote.totalExclVat || 0}</p>
            <p><strong>Total Incl. VAT:</strong> €${creditNote.totalInclVat || 0}</p>
          </div>
          <div class="footer">
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
        </body>
      </html>
    `)
    newWindow.document.close()
  }

  const handleGeneratePDF = async (creditNoteId) => {
    const creditNote = creditNotes.find(cn => cn.id === creditNoteId)
    if (!creditNote) return

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
    
    // Credit Note title
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
    doc.text(`NOTE DE CRÉDIT ${creditNote.number}`, pageWidth - 80, 22)
    
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Date: ${creditNote.date}`, pageWidth - 80, 28)
    
    yPosition = 70

    // Client information
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
    doc.text('Client:', 20, yPosition)
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(creditNote.client, 20, yPosition + 8)
    
    yPosition += 25

    // Credit Note details
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('Détails de la note de crédit:', 20, yPosition)
    yPosition += 15

    // Table header
    doc.setFillColor(240, 248, 255)
    doc.rect(20, yPosition, pageWidth - 40, 12, 'F')
    
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Description', 25, yPosition + 8)
    doc.text('Montant', pageWidth - 30, yPosition + 8)
    yPosition += 15

    // Credit Note line
    doc.setFont('helvetica', 'normal')
    doc.text(creditNote.remark, 25, yPosition + 8)
    doc.text(`${creditNote.totalPrice.toFixed(2)}€`, pageWidth - 30, yPosition + 8)
    yPosition += 20

    // Total
    doc.setFont('helvetica', 'bold')
    doc.text(`Total: ${creditNote.totalPrice.toFixed(2)}€`, pageWidth - 30, yPosition)

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
    const fileName = `note-credit-${creditNote.number}-${creditNote.date}.pdf`
    doc.save(fileName)
  }

  const handleSendCreditNote = (creditNoteId) => {
    const creditNote = creditNotes.find(cn => cn.id === creditNoteId)
    if (!creditNote) return
    
    // Create email content
    const emailSubject = `Credit Note ${creditNote.number}`
    const emailBody = `
Dear ${creditNote.client},

Please find attached your credit note ${creditNote.number} dated ${creditNote.date}.

Credit Note Details:
- Amount: €${creditNote.totalInclVat || 0}
- Due Date: ${creditNote.dueDate || 'N/A'}
- Payment Method: ${creditNote.paymentMethod || 'N/A'}

If you have any questions, please don't hesitate to contact us.

Best regards,
Your Limousine Service Team
    `.trim()
    
    // Create mailto link
    const mailtoLink = `mailto:${creditNote.email || ''}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`
    
    // Open email client
    window.open(mailtoLink)
    
    // Show success message
    alert('Email client opened with credit note details!')
  }

  const handlePrint = () => {
    if (creditNotes.length === 0) {
      alert('No credit notes to print')
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
      pdf.text('Credit Notes Report', margin, yPosition)
      yPosition += 15
      
      // Add date
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, yPosition)
      yPosition += 20
      
      // Add table headers
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      const headers = ['Number', 'Date', 'Client', 'Remark', 'Total Price']
      const colWidths = [25, 30, 50, 40, 25]
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
      
      // Add credit notes data
      pdf.setFontSize(9)
      pdf.setFont('helvetica', 'normal')
      
      getFilteredCreditNotes().forEach((creditNote, index) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 40) {
          pdf.addPage()
          yPosition = margin
        }
        
        xPosition = margin
        
        // Add row data
        const rowData = [
          creditNote.number || '',
          creditNote.date || '',
          creditNote.client || '',
          creditNote.remark || '',
          `€${creditNote.totalPrice || 0}`
        ]
        
        rowData.forEach((data, colIndex) => {
          // Truncate long text
          let displayText = data
          if (colIndex === 2 && data.length > 25) { // Client column
            displayText = data.substring(0, 22) + '...'
          } else if (colIndex === 3 && data.length > 20) { // Remark column
            displayText = data.substring(0, 17) + '...'
          }
          
          pdf.text(displayText, xPosition, yPosition)
          xPosition += colWidths[colIndex]
        })
        
        yPosition += 8
        
        // Add separator line every 5 rows
        if ((index + 1) % 5 === 0 && index < getFilteredCreditNotes().length - 1) {
          pdf.setLineWidth(0.2)
          pdf.line(margin, yPosition, pageWidth - margin, yPosition)
          yPosition += 5
        }
      })
      
      // Add summary at the end
      yPosition += 15
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.text(`Total Credit Notes: ${getFilteredCreditNotes().length}`, margin, yPosition)
      yPosition += 8
      pdf.text(`Total Amount: €${getTotalCreditNotes().toFixed(2)}`, margin, yPosition)
      
      // Save the PDF
      const fileName = `credit-notes-report-${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)
      
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Please try again.')
    }
  }

  const getFilteredCreditNotes = () => {
    console.log('🔍 Filtering credit notes. Total:', creditNotes.length, 'Search term:', searchTerm, 'Display count:', displayCount)
    console.log('🔍 Credit notes array:', creditNotes)
    let filtered = creditNotes

    if (searchTerm) {
      filtered = filtered.filter(creditNote =>
        creditNote.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        creditNote.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        creditNote.remark.toLowerCase().includes(searchTerm.toLowerCase())
      )
      console.log('🔍 After search filter:', filtered.length, 'items')
    }

    const result = filtered.slice(0, displayCount)
    console.log('🔍 Final filtered result:', result.length, 'items')
    console.log('🔍 Final result array:', result)
    return result
  }

  const getTotalCreditNotes = () => {
    return getFilteredCreditNotes().reduce((sum, cn) => sum + cn.totalPrice, 0)
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 min-h-screen pb-20 lg:pb-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#FFF8DC' }}>
              <FileEdit className="w-5 h-5 lg:w-6 lg:h-6" style={{ color: '#DAA520' }} />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t('creditNotesTitle')}</h1>
              <p className="text-sm lg:text-base text-gray-600">Gestion des notes de crédit</p>
            </div>
          </div>
        </div>
        
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-xs lg:text-sm text-gray-500">
          <span>Home</span>
          <span>/</span>
          <span className="text-gray-900 font-medium">{t('creditNotesTitle')}</span>
        </nav>
      </div>

      {/* Create Credit Note Button */}
      <div className="mb-8">
        <button
          onClick={handleCreateCreditNote}
          className="flex items-center space-x-2 px-4 py-3 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl text-sm lg:text-base"
          style={{ backgroundColor: '#DAA520' }}
        >
          <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
          <span className="hidden sm:inline">{t('addCreditNote')}</span>
          <span className="sm:hidden">Ajouter</span>
        </button>
      </div>

      {/* Credit Notes Table Section */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Table Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 space-y-4 lg:space-y-0">
              <h3 className="text-lg font-semibold text-gray-900">{t('creditNotesTable')}</h3>
              <div className="flex items-center space-x-2 lg:space-x-3">
                <button 
                  onClick={handlePrint}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
                  title="Print all credit notes"
                >
                  <Printer className="w-4 h-4" />
                  <span className="hidden sm:inline">Print</span>
                  <span className="sm:hidden">Print</span>
                </button>
              </div>
            </div>
          </div>

          {/* Search and Display Controls */}
          <div className="p-6 border-b border-gray-200">
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

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="text-red-800">
                <strong>Error:</strong> {error}
              </div>
              <button
                onClick={loadCreditNotes}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Credit Notes Table */}
        <div className="overflow-x-auto">
          {/* Debug Info */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="text-sm text-blue-800">
                <strong>Debug Info:</strong> Loading: {loading ? 'Yes' : 'No'} | 
                Credit Notes: {creditNotes.length} | 
                Filtered: {getFilteredCreditNotes().length} | 
                Search: "{searchTerm}" | 
                Display Count: {displayCount} |
                Mounted: {isMountedRef.current ? 'Yes' : 'No'}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={async () => {
                    console.log('🧪 Testing direct Firebase connection...')
                    try {
                      const creditNotesRef = collection(db, 'creditNotes')
                      const q = query(creditNotesRef, orderBy('createdAt', 'desc'))
                      const querySnapshot = await getDocs(q)
                      const directData = querySnapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                      }))
                      console.log('🧪 Direct Firebase test result:', directData)
                      alert(`Direct Firebase test: Found ${directData.length} credit notes`)
                    } catch (error) {
                      console.error('🧪 Direct Firebase test failed:', error)
                      alert(`Direct Firebase test failed: ${error.message}`)
                    }
                  }}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Test Firebase
                </button>
                <button
                  onClick={loadCreditNotes}
                  disabled={loading}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Refresh'}
                </button>
                <button
                  onClick={() => {
                    console.log('🔍 Current state debug:')
                    console.log('  - loading:', loading)
                    console.log('  - creditNotes:', creditNotes)
                    console.log('  - creditNotes.length:', creditNotes.length)
                    console.log('  - isMounted:', isMountedRef.current)
                    console.log('  - getFilteredCreditNotes():', getFilteredCreditNotes())
                  }}
                  className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                >
                  Debug State
                </button>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#DAA520]"></div>
              <span className="ml-4 text-gray-600">Loading credit notes...</span>
            </div>
          ) : getFilteredCreditNotes().length === 0 ? (
            <div className="text-center py-12">
              <FileEdit className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No credit notes found</h3>
              <p className="text-gray-600 mb-4">
                {creditNotes.length === 0 
                  ? "Get started by creating your first credit note."
                  : "No credit notes match your search criteria."
                }
              </p>
              {creditNotes.length === 0 && (
                <button
                  onClick={handleCreateCreditNote}
                  className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl text-sm lg:text-base mx-auto"
                  style={{ backgroundColor: '#DAA520' }}
                >
                  <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
                  <span>{t('addCreditNote')}</span>
                </button>
              )}
            </div>
          ) : (
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('number')}
                  </th>
                  <th className="px-2 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('date')}
                  </th>
                  <th className="px-2 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('client')}
                  </th>
                  <th className="px-2 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    {t('remark')}
                  </th>
                  <th className="px-2 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('totalPrice')}
                  </th>
                  <th className="px-2 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {getFilteredCreditNotes().map((creditNote) => (
                <tr key={creditNote.id} className="hover:bg-gray-50">
                  <td className="px-2 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {creditNote.number}
                  </td>
                  <td className="px-2 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {creditNote.date}
                  </td>
                  <td className="px-2 lg:px-6 py-4 text-sm text-gray-900">
                    <div className="max-w-xs truncate" title={creditNote.client}>
                      {creditNote.client}
                    </div>
                  </td>
                  <td className="px-2 lg:px-6 py-4 text-sm text-gray-900 hidden md:table-cell">
                    <div className="max-w-md truncate" title={creditNote.remark}>
                      {creditNote.remark}
                    </div>
                  </td>
                  <td className="px-2 lg:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {creditNote.totalPrice.toFixed(2)}€
                  </td>
                  <td className="px-2 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-1 lg:space-x-2">
                      <button 
                        onClick={() => handleModifyCreditNote(creditNote.id)}
                        className="text-green-600 hover:text-green-900 p-1"
                        title="Modifier"
                      >
                        <Edit className="w-3 h-3 lg:w-4 lg:h-4" />
                      </button>
                      <button 
                        onClick={() => handleGeneratePDF(creditNote.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Générer PDF"
                      >
                        <FileDown className="w-3 h-3 lg:w-4 lg:h-4" />
                      </button>
                      <button 
                        onClick={() => handleSendCreditNote(creditNote.id)}
                        className="text-gray-600 hover:text-gray-900 p-1"
                        title="Envoyer par email"
                      >
                        <Mail className="w-3 h-3 lg:w-4 lg:h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

          {/* Summary */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm text-gray-600">
              <div>
                Affichage de {getFilteredCreditNotes().length} note(s) de crédit sur {creditNotes.length} total
              </div>
              <div className="mt-2 sm:mt-0">
                Total des notes de crédit: {getTotalCreditNotes().toFixed(2)}€
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Credit Note Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <FileEdit className="w-6 h-6" style={{ color: '#DAA520' }} />
                <h2 className="text-2xl font-bold text-gray-900">Ajouter une note de crédit</h2>
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
              <div className="space-y-6">
                {/* Client Selection */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Clients
                    </label>
                    <select
                      value={formData.client}
                      onChange={(e) => handleInputChange('client', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent ${
                        errors.client ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      {clients.map(client => (
                        <option key={client.value} value={client.value}>
                          {client.label}
                        </option>
                      ))}
                    </select>
                    {errors.client && (
                      <p className="mt-1 text-sm text-red-600">{errors.client}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent ${
                        errors.date ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.date && (
                      <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                    )}
                  </div>
                </div>

                {/* Remark */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remarque
                  </label>
                  <textarea
                    value={formData.remark}
                    onChange={(e) => handleInputChange('remark', e.target.value)}
                    placeholder="Remarque:"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent resize-vertical"
                  />
                </div>

                {/* Designations */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Désignations
                  </label>
                  
                  {formData.designations.map((designation, index) => (
                    <div key={designation.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
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
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="md:col-span-2 lg:col-span-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            value={designation.description}
                            onChange={(e) => handleDesignationChange(index, 'description', e.target.value)}
                            placeholder={`Désignation ${index + 1}:`}
                            rows={2}
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent resize-vertical ${
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
              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Annuler
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

export default CreditNotes

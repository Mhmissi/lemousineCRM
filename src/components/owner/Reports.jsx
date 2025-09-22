import { useState, useEffect } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { Calendar, Users, User, FileText, Download, Filter, BarChart3, TrendingUp, DollarSign, Clock } from 'lucide-react'
import jsPDF from 'jspdf'

const Reports = () => {
  const { t } = useLanguage()
  const [selectedPeriod, setSelectedPeriod] = useState('october-2024')
  const [selectedDriver, setSelectedDriver] = useState('all')
  const [selectedClient, setSelectedClient] = useState('all')
  const [reportData, setReportData] = useState([])
  const [loading, setLoading] = useState(false)

  // Mock data for dropdowns
  const periods = [
    { value: 'october-2024', label: 'Octobre-2024' },
    { value: 'september-2024', label: 'Septembre-2024' },
    { value: 'august-2024', label: 'Août-2024' },
    { value: 'july-2024', label: 'Juillet-2024' },
  ]

  const drivers = [
    { value: 'all', label: '--All--' },
    { value: 'seddik', label: 'Seddik' },
    { value: 'jean-dupont', label: 'Jean Dupont' },
    { value: 'marie-martin', label: 'Marie Martin' },
    { value: 'pierre-durand', label: 'Pierre Durand' },
  ]

  const clients = [
    { value: 'all', label: '--All--' },
    { value: 'client-a', label: 'Client A' },
    { value: 'client-b', label: 'Client B' },
    { value: 'client-c', label: 'Client C' },
    { value: 'client-d', label: 'Client D' },
  ]

  // Mock report data
  const mockReportData = [
    {
      id: 1,
      date: '2024-10-15',
      driver: 'Seddik',
      client: 'Client A',
      trip: 'Airport Transfer',
      duration: '2h',
      distance: '45 km',
      price: 120,
      status: 'completed'
    },
    {
      id: 2,
      date: '2024-10-14',
      driver: 'Jean Dupont',
      client: 'Client B',
      trip: 'City Tour',
      duration: '4h',
      distance: '80 km',
      price: 200,
      status: 'completed'
    },
    {
      id: 3,
      date: '2024-10-13',
      driver: 'Marie Martin',
      client: 'Client C',
      trip: 'Corporate Meeting',
      duration: '1h',
      distance: '25 km',
      price: 80,
      status: 'completed'
    },
    {
      id: 4,
      date: '2024-10-12',
      driver: 'Pierre Durand',
      client: 'Client D',
      trip: 'VIP Event',
      duration: '6h',
      distance: '120 km',
      price: 350,
      status: 'completed'
    },
    {
      id: 5,
      date: '2024-10-11',
      driver: 'Seddik',
      client: 'Client A',
      trip: 'Wedding Service',
      duration: '8h',
      distance: '150 km',
      price: 500,
      status: 'completed'
    }
  ]

  useEffect(() => {
    setReportData(mockReportData)
  }, [])

  const handleShowReports = () => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      let filtered = mockReportData
      
      if (selectedDriver !== 'all') {
        filtered = filtered.filter(report => 
          report.driver.toLowerCase().replace(' ', '-') === selectedDriver
        )
      }
      
      if (selectedClient !== 'all') {
        filtered = filtered.filter(report => 
          report.client.toLowerCase().replace(' ', '-') === selectedClient
        )
      }
      
      setReportData(filtered)
      setLoading(false)
    }, 1000)
  }

  const generatePDF = async () => {
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
    
    // Title
    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    const title = `${t('reportTitle')} - ${periods.find(p => p.value === selectedPeriod)?.label || t('period')}`
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
    doc.text(title, 20, 70)
    
    yPosition = 85

    // Filter information box
    doc.setFillColor(240, 248, 255)
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.rect(15, yPosition, pageWidth - 30, 25, 'FD')
    
    doc.setFontSize(10)
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
    doc.setFont('helvetica', 'bold')
    doc.text('Filtres appliqués:', 20, yPosition + 8)
    
    doc.setFont('helvetica', 'normal')
    let filterText = `${t('period')}: ${periods.find(p => p.value === selectedPeriod)?.label || t('all')}`
    if (selectedDriver !== 'all') {
      filterText += ` | ${t('driver')}: ${drivers.find(d => d.value === selectedDriver)?.label || t('allDrivers')}`
    }
    if (selectedClient !== 'all') {
      filterText += ` | ${t('client')}: ${clients.find(c => c.value === selectedClient)?.label || t('allClients')}`
    }
    
    doc.text(filterText, 20, yPosition + 16)
    yPosition += 40

    // Summary statistics
    const totalTrips = reportData.length
    const totalRevenue = reportData.reduce((sum, report) => sum + report.price, 0)
    const totalDistance = reportData.reduce((sum, report) => sum + parseInt(report.distance), 0)
    const totalDuration = reportData.reduce((sum, report) => sum + parseInt(report.duration), 0)

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
    doc.text('Résumé des Statistiques', 20, yPosition)
    yPosition += 10

    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`${t('totalTrips')}: ${totalTrips}`, 20, yPosition)
    doc.text(`${t('totalRevenue')}: ${totalRevenue}€`, 20, yPosition + 8)
    doc.text(`${t('totalDistance')}: ${totalDistance} km`, 20, yPosition + 16)
    doc.text(`${t('totalDuration')}: ${totalDuration}h`, 20, yPosition + 24)
    yPosition += 40

    // Report details
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('Détails des Trajets', 20, yPosition)
    yPosition += 15

    reportData.forEach((report, index) => {
      if (yPosition > pageHeight - 60) {
        doc.addPage()
        yPosition = 30
      }

      // Course header
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
      doc.rect(15, yPosition, pageWidth - 30, 12, 'F')
      
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text(`Trajet n°${report.id} - ${report.date}`, 20, yPosition + 8)
      yPosition += 15

      // Course details
      const details = [
        [t('driver') + ':', report.driver],
        [t('client') + ':', report.client],
        ['Trajet:', report.trip],
        [t('duration') + ':', report.duration],
        [t('distance') + ':', report.distance],
        ['Prix:', `${report.price}€`],
        [t('status') + ':', report.status]
      ]

      details.forEach(([label, value], detailIndex) => {
        if (yPosition > pageHeight - 30) {
          doc.addPage()
          yPosition = 30
        }

        const isEven = detailIndex % 2 === 0
        doc.setFillColor(isEven ? 248 : 255)
        doc.rect(15, yPosition, pageWidth - 30, 8, 'F')
        
        doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
        doc.setFont('helvetica', 'bold')
        doc.text(label, 20, yPosition + 6)
        
        doc.setFont('helvetica', 'normal')
        doc.text(value, 60, yPosition + 6)
        yPosition += 8
      })

      yPosition += 5
    })

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
    doc.text(`${t('generatedOn')} ${currentDate}`, pageWidth - 50, footerY + 6)
    doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageWidth - 30, footerY + 12)

    // Save the PDF
    const fileName = `rapport-trajets-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(fileName)
  }

  const getTotalRevenue = () => {
    return reportData.reduce((sum, report) => sum + report.price, 0)
  }

  const getTotalTrips = () => {
    return reportData.length
  }

  const getTotalDistance = () => {
    return reportData.reduce((sum, report) => sum + parseInt(report.distance), 0)
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 min-h-screen pb-20 lg:pb-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#FFF8DC' }}>
              <BarChart3 className="w-5 h-5 lg:w-6 lg:h-6" style={{ color: '#DAA520' }} />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t('reportsTitle')}</h1>
              <p className="text-sm lg:text-base text-gray-600">Rapports et statistiques</p>
            </div>
          </div>
        </div>
        
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-xs lg:text-sm text-gray-500">
          <span>Home</span>
          <span>/</span>
          <span className="text-gray-900 font-medium">{t('reportsTitle')}</span>
        </nav>
      </div>

      {/* Report Management Section */}
      <div className="mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-2 mb-6">
          <FileText className="w-5 h-5" style={{ color: '#DAA520' }} />
          <h2 className="text-xl font-semibold text-gray-900">
            <span className="hidden sm:inline">{t('reportsTitle')}</span>
            <span className="sm:hidden">{t('reportsTitle')}</span>
          </h2>
        </div>

        {/* Filter Options */}
        <div className="space-y-4">
          {/* First Row - Period and Driver */}
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('period')}
                </label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                >
                  {periods.map(period => (
                    <option key={period.value} value={period.value}>
                      {period.label}
                    </option>
                  ))}
                </select>
            </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('driver')}
                </label>
                <select
                  value={selectedDriver}
                  onChange={(e) => setSelectedDriver(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                >
                  {drivers.map(driver => (
                    <option key={driver.value} value={driver.value}>
                      {driver.label}
                    </option>
                  ))}
                </select>
            </div>
              <div className="flex items-end">
                <button
                  onClick={handleShowReports}
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  style={{ backgroundColor: '#DAA520' }}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{t('loading')}</span>
                    </>
                  ) : (
                    <>
                      <Filter className="w-4 h-4" />
                      <span>{t('show')}</span>
                    </>
                  )}
                </button>
            </div>
          </div>
        </div>

          {/* Second Row - Period and Client */}
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('period')}
                </label>
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                >
                  {periods.map(period => (
                    <option key={period.value} value={period.value}>
                      {period.label}
                    </option>
                  ))}
                </select>
            </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('client')}
                </label>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#DAA520] focus:border-transparent"
                >
                  {clients.map(client => (
                    <option key={client.value} value={client.value}>
                      {client.label}
                    </option>
                  ))}
                </select>
            </div>
              <div className="flex items-end">
                <button
                  onClick={handleShowReports}
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  style={{ backgroundColor: '#DAA520' }}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{t('loading')}</span>
                    </>
                  ) : (
                    <>
                      <Filter className="w-4 h-4" />
                      <span>{t('show')}</span>
                    </>
                  )}
                </button>
            </div>
          </div>
        </div>
      </div>

        {/* PDF Export Button */}
        <div className="flex justify-end mt-6">
          <button
            onClick={generatePDF}
            className="flex flex-col items-center space-y-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            <Download className="w-6 h-6" />
            <span className="text-sm font-medium">{t('export')}</span>
          </button>
          </div>
        </div>

      {/* Report Results */}
      {reportData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6">
          {/* Summary Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-lg border" style={{ backgroundColor: '#FFF8DC', borderColor: '#DAA520' }}>
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" style={{ color: '#DAA520' }} />
                <span className="text-sm font-medium" style={{ color: '#DAA520' }}>{t('totalTrips')}</span>
              </div>
              <p className="text-2xl font-bold mt-2" style={{ color: '#DAA520' }}>{getTotalTrips()}</p>
                  </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">{t('totalRevenue')}</span>
                  </div>
              <p className="text-2xl font-bold text-green-900 mt-2">{getTotalRevenue()}€</p>
                </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">{t('totalDistance')}</span>
                </div>
              <p className="text-2xl font-bold text-purple-900 mt-2">{getTotalDistance()} km</p>
              </div>
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">{t('totalDuration')}</span>
              </div>
              <p className="text-2xl font-bold text-orange-900 mt-2">
                {reportData.reduce((sum, report) => sum + parseInt(report.duration), 0)}h
              </p>
            </div>
          </div>
        </div>
      )}

          {/* Report Table Section */}
          <div className="mb-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Report Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('date')}
                      </th>
                      <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('driver')}
                      </th>
                      <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('client')}
                      </th>
                      <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('trip')}
                      </th>
                      <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('duration')}
                      </th>
                      <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('distance')}
                      </th>
                      <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('price')}
                      </th>
                      <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('status')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.date}
                        </td>
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.driver}
                        </td>
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.client}
                        </td>
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.trip}
                        </td>
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.duration}
                        </td>
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.distance}
                        </td>
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {report.price}€
                        </td>
                        <td className="px-3 lg:px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            {report.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
    </div>
  )
}

export default Reports

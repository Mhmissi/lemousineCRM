import { useState, useEffect } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import jsPDF from 'jspdf'
import { 
  Calendar, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MapPin, 
  Users,
  MoreVertical,
  Filter,
  Search,
  Menu,
  X,
  ChevronDown,
  Euro,
  FileText,
  Mail,
  Edit,
  Check,
  Trash2,
  Printer,
  Grid3X3,
  List
} from 'lucide-react'

function Plannings() {
  const { t } = useLanguage()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState('month') // month, week, day
  const [weekStart, setWeekStart] = useState(new Date())
  const [schedules, setSchedules] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showListView, setShowListView] = useState(false)
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0])
  const [filterDriver, setFilterDriver] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [formData, setFormData] = useState({
    company: 'LIMOSTAR',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().slice(0, 5),
    departureAddress: '',
    destination: '',
    client: 'A&M sprl',
    driver: 'Seddik',
    car: 'Van',
    passengers: 1,
    passengerNames: '',
    price: '',
    vatIncluded: false,
    paymentMethod: 'Invoice',
    comments: ''
  })
  const [errors, setErrors] = useState({})

  // Mock data for dropdowns
  const companies = ['LIMOSTAR', 'PREMIUM CARS', 'LUXURY TRANSPORT']
  const clients = ['A&M sprl', 'CORPORATE CLIENT', 'WEDDING PARTY', 'AIRPORT SERVICE']
  const drivers = ['Seddik', 'Jean Dupont', 'Marie Martin', 'Pierre Durand']
  const cars = ['Van', 'Limousine', 'Bus', 'Sedan', 'SUV']
  const paymentMethods = ['Invoice', 'Cash', 'Credit Card']

  // Day names
  const dayNames = [t('monday').substring(0,2), t('tuesday').substring(0,2), t('wednesday').substring(0,2), t('thursday').substring(0,2), t('friday').substring(0,2), t('saturday').substring(0,2), t('sunday').substring(0,2)]
  const monthNames = [
    t('january'), t('february'), t('march'), t('april'), t('may'), t('june'),
    t('july'), t('august'), t('september'), t('october'), t('november'), t('december')
  ]

  // Mock schedules data
  useEffect(() => {
    const mockSchedules = [
      {
        id: 1,
        title: 'Service VIP - Aéroport',
        date: new Date(2025, 8, 13), // September 13, 2025
        time: '09:00',
        duration: '2h',
        location: 'Aéroport Charles de Gaulle',
        passengers: 4,
        driver: 'Jean Dupont',
        status: 'confirmed',
        color: 'blue'
      },
      {
        id: 2,
        title: 'Mariage - Château',
        date: new Date(2025, 8, 15),
        time: '14:00',
        duration: '4h',
        location: 'Château de Versailles',
        passengers: 8,
        driver: 'Marie Martin',
        status: 'pending',
        color: 'green'
      },
      {
        id: 3,
        title: 'Événement d\'entreprise',
        date: new Date(2025, 9, 2),
        time: '18:00',
        duration: '3h',
        location: 'Centre des Congrès',
        passengers: 12,
        driver: 'Pierre Durand',
        status: 'confirmed',
        color: 'purple'
      }
    ]
    setSchedules(mockSchedules)
  }, [])

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const getWeekDays = (startDate) => {
    const days = []
    const start = new Date(startDate)
    // Adjust to Monday (start of week)
    const dayOfWeek = start.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    start.setDate(start.getDate() + mondayOffset)
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(start)
      day.setDate(start.getDate() + i)
      days.push(day)
    }
    return days
  }

  const getDayHours = () => {
    const hours = []
    for (let i = 6; i < 22; i++) {
      hours.push(i)
    }
    return hours
  }

  const getSchedulesForDate = (date) => {
    return schedules.filter(schedule => 
      schedule.date.toDateString() === date.toDateString()
    )
  }

  const isToday = (date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date) => {
    return date.toDateString() === selectedDate.toDateString()
  }

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + direction)
      return newDate
    })
  }

  const navigateWeek = (direction) => {
    setWeekStart(prev => {
      const newDate = new Date(prev)
      newDate.setDate(prev.getDate() + (direction * 7))
      return newDate
    })
  }

  const navigateDay = (direction) => {
    setSelectedDate(prev => {
      const newDate = new Date(prev)
      newDate.setDate(prev.getDate() + direction)
      return newDate
    })
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDate(today)
    setWeekStart(today)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getScheduleColor = (color) => {
    switch (color) {
      case 'blue':
        return 'bg-[#DAA520]'
      case 'green':
        return 'bg-green-500'
      case 'purple':
        return 'bg-purple-500'
      case 'orange':
        return 'bg-orange-500'
      default:
        return 'bg-gray-500'
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
    
    if (!formData.departureAddress.trim()) {
      newErrors.departureAddress = 'Adresse de départ requise'
    }
    if (!formData.destination.trim()) {
      newErrors.destination = t('destinationRequired')
    }
    if (!formData.price.trim()) {
      newErrors.price = 'Prix requis'
    }
    if (formData.passengers < 1) {
      newErrors.passengers = t('passengersRequired')
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      // Create new schedule
      const newSchedule = {
        id: Date.now(),
        title: `${formData.departureAddress} → ${formData.destination}`,
        date: new Date(formData.date),
        time: formData.time,
        duration: '2h', // Default duration
        location: formData.departureAddress,
        passengers: formData.passengers,
        driver: formData.driver,
        status: 'pending',
        color: 'blue',
        price: formData.price,
        client: formData.client,
        car: formData.car,
        comments: formData.comments
      }
      
      setSchedules(prev => [...prev, newSchedule])
      setShowAddModal(false)
      
      // Reset form
      setFormData({
        company: 'LIMOSTAR',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        departureAddress: '',
        destination: '',
        client: 'A&M sprl',
        driver: 'Seddik',
        car: 'Van',
        passengers: 1,
        passengerNames: '',
        price: '',
        vatIncluded: false,
        paymentMethod: 'Invoice',
        comments: ''
      })
    }
  }

  const handleDayClick = (date) => {
    setSelectedDate(date)
    setFilterDate(date.toISOString().split('T')[0])
    setShowListView(true)
  }

  const getFilteredSchedules = () => {
    let filtered = schedules.filter(schedule => {
      const scheduleDate = schedule.date.toISOString().split('T')[0]
      const matchesDate = scheduleDate === filterDate
      const matchesDriver = filterDriver === 'all' || schedule.driver === filterDriver
      const matchesSearch = searchTerm === '' || 
        schedule.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.driver.toLowerCase().includes(searchTerm.toLowerCase())
      
      return matchesDate && matchesDriver && matchesSearch
    })
    
    return filtered
  }

  const getPaginatedSchedules = () => {
    const filtered = getFilteredSchedules()
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filtered.slice(startIndex, endIndex)
  }

  const totalPages = Math.ceil(getFilteredSchedules().length / itemsPerPage)

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
    const title = `Planning du ${filterDate}`
    const titleWidth = doc.getTextWidth(title)
    doc.text(title, (pageWidth - titleWidth) / 2, 22)
    
    // Reset text color
    doc.setTextColor(0, 0, 0)
    
    // Driver filter info box
    yPosition = 60
    doc.setFillColor(240, 248, 255)
    doc.rect(20, yPosition - 5, 60, 15, 'F')
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2])
    doc.rect(20, yPosition - 5, 60, 15, 'S')
    
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    const driverText = filterDriver === 'all' ? 'Driver: All' : `Driver: ${filterDriver}`
    doc.text(driverText, 25, yPosition + 2)
    
    yPosition += 25

    // Get filtered schedules for the selected date
    const schedulesForPDF = getFilteredSchedules()
    
    if (schedulesForPDF.length === 0) {
      // No schedules message
      doc.setFillColor(248, 249, 250)
      doc.rect(20, yPosition - 5, pageWidth - 40, 20, 'F')
      doc.setDrawColor(220, 220, 220)
      doc.rect(20, yPosition - 5, pageWidth - 40, 20, 'S')
      
      doc.setFontSize(14)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(100, 100, 100)
      doc.text('Aucune course programmée pour cette date', 30, yPosition + 5)
    } else {
      // Generate course details with professional styling
      schedulesForPDF.forEach((schedule, index) => {
        // Check if we need a new page
        if (yPosition > pageHeight - 100) {
          doc.addPage()
          yPosition = 30
        }

        // Course header with professional styling
        doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
        doc.rect(20, yPosition - 5, pageWidth - 40, 12, 'F')
        
        doc.setTextColor(255, 255, 255)
        doc.setFontSize(14)
        doc.setFont('helvetica', 'bold')
        doc.text(`Course n:${index + 1} : ${schedule.time}h`, 25, yPosition + 2)
        
        yPosition += 15

        // Course details with table-like styling
        const details = [
          ['Time:', schedule.time],
          ['Driver:', schedule.driver],
          ['Pick up Location:', schedule.location],
          ['Pax:', schedule.passengers.toString()],
          ['Paxname:', schedule.passengerNames || ''],
          [t('destination') + ':', schedule.destination || 'N/A'],
          ['Type of vehicles:', schedule.car],
          ['Client:', schedule.client],
          ['Payment:', schedule.paymentMethod || 'Invoice'],
          ['Particulars:', schedule.comments || '']
        ]

        doc.setTextColor(0, 0, 0)
        doc.setFontSize(10)
        doc.setFont('helvetica', 'normal')
        
        details.forEach(([label, value], detailIndex) => {
          if (yPosition > pageHeight - 30) {
            doc.addPage()
            yPosition = 30
          }
          
          // Alternating row colors
          if (detailIndex % 2 === 0) {
            doc.setFillColor(248, 249, 250)
            doc.rect(20, yPosition - 2, pageWidth - 40, 8, 'F')
          }
          
          // Label in bold
          doc.setFont('helvetica', 'bold')
          doc.text(label, 25, yPosition + 2)
          
          // Value
          doc.setFont('helvetica', 'normal')
          const labelWidth = doc.getTextWidth(label)
          doc.text(value, 25 + labelWidth + 5, yPosition + 2)
          
          yPosition += 8
        })
        
        yPosition += 10
      })
    }

    // Professional footer
    const footerY = pageHeight - 50
    doc.setFillColor(secondaryColor[0], secondaryColor[1], secondaryColor[2])
    doc.rect(0, footerY - 10, pageWidth, 50, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    
    // Contact information
    doc.text('LIMOSTAR - Professional Limousine Services', 20, footerY)
    doc.text('Adresse: 65, Avenue Louise 1050 Brussels Belgium', 20, footerY + 8)
    doc.text('TEL: +3225120101 | E-mail: info@limostar.be', 20, footerY + 16)
    doc.text('Site Web: www.limostar.be', 20, footerY + 24)
    
    // Page number
    doc.text('Page 1/1', pageWidth - 30, footerY + 24)
    
    // Generated date
    const now = new Date()
    const generatedDate = now.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
    doc.text(`Généré le: ${generatedDate}`, pageWidth - 80, footerY)

    // Download the PDF
    doc.save(`LIMOSTAR-Planning-${filterDate}.pdf`)
  }

  const renderWeekView = () => {
    const weekDays = getWeekDays(weekStart)
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Week Header */}
        <div className="px-6 py-4" style={{ background: 'linear-gradient(to right, #DAA520, #B8860B)' }}>
          <h3 className="text-lg font-semibold text-white">
            {t('weekOf')} {weekDays[0].toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} au {weekDays[6].toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </h3>
        </div>
        
        {/* Day Names Header */}
        <div className="grid grid-cols-7 bg-gray-50 border-b">
          {dayNames.map((day, index) => (
            <div key={index} className="p-3 text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>
        
        {/* Week Grid */}
        <div className="grid grid-cols-7">
          {weekDays.map((day, index) => {
            const daySchedules = getSchedulesForDate(day)
            const isCurrentDay = isToday(day)
            const isSelectedDay = isSelected(day)
            
            return (
              <div
                key={index}
                className={`min-h-32 border-r border-b border-gray-100 p-3 cursor-pointer transition-all duration-200 ${
                  isCurrentDay ? 'border-[#DAA520]' : ''
                } ${isSelectedDay ? 'border-[#DAA520]' : ''}`}
                style={{
                  backgroundColor: isCurrentDay ? '#FFF8DC' : isSelectedDay ? '#F5DEB3' : 'transparent'
                }}
                onClick={() => handleDayClick(day)}
              >
                <div className={`text-sm font-medium mb-2 ${
                  isCurrentDay ? 'text-[#DAA520]' : 'text-gray-900'
                }`}>
                  {day.getDate()}
                </div>
                
                {/* Schedule indicators */}
                <div className="space-y-1">
                  {daySchedules.map((schedule, idx) => (
                    <div
                      key={idx}
                      className={`text-xs px-2 py-1 rounded-full text-white truncate ${getScheduleColor(schedule.color)}`}
                      title={schedule.title}
                    >
                      {schedule.time} {schedule.title}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderDayView = () => {
    const hours = getDayHours()
    const daySchedules = getSchedulesForDate(selectedDate)
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Day Header */}
        <div className="px-6 py-4" style={{ background: 'linear-gradient(to right, #DAA520, #B8860B)' }}>
          <h3 className="text-lg font-semibold text-white">
            {selectedDate.toLocaleDateString('fr-FR', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </h3>
        </div>
        
        {/* Time Grid */}
        <div className="max-h-96 overflow-y-auto">
          {hours.map((hour) => {
            const hourSchedules = daySchedules.filter(schedule => {
              const scheduleHour = parseInt(schedule.time.split(':')[0])
              return scheduleHour === hour
            })
            
            return (
              <div key={hour} className="flex border-b border-gray-100">
                <div className="w-20 p-3 text-sm font-medium text-gray-600 bg-gray-50 border-r border-gray-200">
                  {hour.toString().padStart(2, '0')}:00
                </div>
                <div className="flex-1 p-3 min-h-16">
                  {hourSchedules.map((schedule, idx) => (
                    <div
                      key={idx}
                      className={`text-sm px-3 py-2 rounded-lg text-white mb-2 ${getScheduleColor(schedule.color)}`}
                    >
                      <div className="font-medium">{schedule.title}</div>
                      <div className="text-xs opacity-90">{schedule.time} - {schedule.location}</div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const renderCalendar = (monthOffset = 0) => {
    const displayDate = new Date(currentDate)
    displayDate.setMonth(currentDate.getMonth() + monthOffset)
    const days = getDaysInMonth(displayDate)
    
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Month Header */}
        <div className="px-6 py-4" style={{ background: 'linear-gradient(to right, #DAA520, #B8860B)' }}>
          <h3 className="text-lg font-semibold text-white">
            {monthNames[displayDate.getMonth()]} {displayDate.getFullYear()}
          </h3>
        </div>
        
        {/* Day Names Header */}
        <div className="grid grid-cols-7 bg-gray-50 border-b">
          {dayNames.map((day, index) => (
            <div key={index} className="p-3 text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            if (!day) {
              return <div key={index} className="h-24 border-r border-b border-gray-100"></div>
            }
            
            const daySchedules = getSchedulesForDate(day)
            const isCurrentDay = isToday(day)
            const isSelectedDay = isSelected(day)
            
            return (
              <div
                key={index}
                className={`h-20 sm:h-24 border-r border-b border-gray-100 p-1 sm:p-2 cursor-pointer transition-all duration-200 ${
                  isCurrentDay ? 'border-[#DAA520]' : ''
                } ${isSelectedDay ? 'border-[#DAA520]' : ''}`}
                style={{
                  backgroundColor: isCurrentDay ? '#FFF8DC' : isSelectedDay ? '#F5DEB3' : 'transparent'
                }}
                onClick={() => handleDayClick(day)}
              >
                <div className={`text-sm font-medium mb-1 ${
                  isCurrentDay ? 'text-[#DAA520]' : 'text-gray-900'
                }`}>
                  {day.getDate()}
                </div>
                
                {/* Schedule indicators */}
                <div className="space-y-1">
                  {daySchedules.slice(0, 2).map((schedule, idx) => (
                    <div
                      key={idx}
                      className={`text-xs px-2 py-1 rounded-full text-white truncate ${getScheduleColor(schedule.color)}`}
                      title={schedule.title}
                    >
                      {schedule.time} {schedule.title}
                    </div>
                  ))}
                  {daySchedules.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{daySchedules.length - 2} autres
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 sm:p-4 lg:p-6 bg-gray-50 min-h-screen pb-20 lg:pb-6">
      {/* Header */}
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg" style={{ backgroundColor: '#FFF8DC' }}>
              <Calendar className="w-5 h-5 lg:w-6 lg:h-6" style={{ color: '#DAA520' }} />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{t('planningsTitle')}</h1>
              <p className="text-sm lg:text-base text-gray-600">Gestion des plannings</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
            <div className="flex space-x-2">
              <button className="flex items-center justify-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm">
                <Search className="w-4 h-4" />
                <span className="hidden sm:inline">{t('search')}</span>
              </button>
              <button className="flex items-center justify-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm">
                <Filter className="w-4 h-4" />
                <span className="hidden sm:inline">{t('filter')}</span>
              </button>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center space-x-2 px-4 py-3 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl text-sm lg:text-base"
              style={{ backgroundColor: '#DAA520' }}
            >
              <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
              <span className="hidden sm:inline">{t('addPlanning')}</span>
              <span className="sm:hidden">{t('add')}</span>
            </button>
          </div>
        </div>
        
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-xs lg:text-sm text-gray-500">
          <span>Home</span>
          <span>/</span>
          <span className="text-gray-900 font-medium">{t('planningsTitle')}</span>
        </nav>
      </div>

      {/* Calendar Navigation */}
      <div className="mb-4 lg:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-4 sm:space-y-0">
          <div className="flex items-center justify-between sm:justify-start space-x-2 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  if (viewMode === 'month') navigateMonth(-1)
                  else if (viewMode === 'week') navigateWeek(-1)
                  else if (viewMode === 'day') navigateDay(-1)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4 lg:w-5 lg:h-5" />
              </button>
              <button
                onClick={() => {
                  if (viewMode === 'month') navigateMonth(1)
                  else if (viewMode === 'week') navigateWeek(1)
                  else if (viewMode === 'day') navigateDay(1)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5" />
              </button>
            </div>
            <button
              onClick={goToToday}
              className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors text-sm"
            >
              {t('today')}
            </button>
          </div>
          
          <div className="flex items-center justify-center space-x-1 sm:space-x-2">
            <button 
              onClick={() => setViewMode('month')}
              className={`px-2 py-2 sm:px-3 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                viewMode === 'month' 
                  ? 'text-[#DAA520] bg-[#FFF8DC]' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('month')}
            </button>
            <button 
              onClick={() => setViewMode('week')}
              className={`px-2 py-2 sm:px-3 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                viewMode === 'week' 
                  ? 'text-[#DAA520] bg-[#FFF8DC]' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('week')}
            </button>
            <button 
              onClick={() => setViewMode('day')}
              className={`px-2 py-2 sm:px-3 text-xs sm:text-sm font-medium rounded-lg transition-colors ${
                viewMode === 'day' 
                  ? 'text-[#DAA520] bg-[#FFF8DC]' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t('day')}
            </button>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      {!showListView && (
        <>
          {/* Calendar Grid */}
          <div className="mb-6 lg:mb-8">
            {viewMode === 'month' && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                {renderCalendar(0)}
                {renderCalendar(1)}
                {renderCalendar(2)}
              </div>
            )}
            {viewMode === 'week' && (
              <div className="grid grid-cols-1 gap-4 lg:gap-6">
                {renderWeekView()}
              </div>
            )}
            {viewMode === 'day' && (
              <div className="grid grid-cols-1 gap-4 lg:gap-6">
                {renderDayView()}
              </div>
            )}
          </div>

          {/* List View Toggle */}
          <div className="flex justify-end mb-4">
            <button 
              onClick={() => setShowListView(true)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <List className="w-4 h-4" />
              <span>Vue liste</span>
            </button>
          </div>

          {/* Selected Date Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6 pb-6 lg:pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Détails du {selectedDate.toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            
            {getSchedulesForDate(selectedDate).length > 0 ? (
              <div className="space-y-4">
                {getSchedulesForDate(selectedDate).map((schedule) => (
                  <div key={schedule.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${getScheduleColor(schedule.color)}`}></div>
                      <div>
                        <h4 className="font-medium text-gray-900">{schedule.title}</h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{schedule.time} ({schedule.duration})</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MapPin className="w-4 h-4" />
                            <span>{schedule.location}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{schedule.passengers} passagers</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(schedule.status)}`}>
                        {schedule.status === 'confirmed' ? 'Confirmé' : 
                         schedule.status === 'pending' ? 'En attente' : 'Annulé'}
                      </span>
                      <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucun planning pour cette date</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* List View - Full Page */}
      {showListView && (
        <div className="space-y-4 lg:space-y-6 pb-6 lg:pb-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#FFF8DC' }}>
                <List className="w-5 h-5 lg:w-6 lg:h-6" style={{ color: '#DAA520' }} />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Planning</h1>
                <p className="text-sm lg:text-base text-gray-600">Gestion des plannings</p>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3">
              <button 
                onClick={() => setShowListView(false)}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
              >
                <Grid3X3 className="w-4 h-4" />
                <span className="hidden sm:inline">Vue calendrier</span>
                <span className="sm:hidden">Calendrier</span>
              </button>
            </div>
          </div>

          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Home</span>
            <span>/</span>
            <span className="text-gray-900 font-medium">Planning</span>
          </nav>

          {/* Filter Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 space-y-4 lg:space-y-0">
              <h3 className="text-lg font-semibold text-gray-900">Gestion des plannings</h3>
              <div className="flex items-center space-x-2 lg:space-x-3">
                <button 
                  onClick={generatePDF}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
                >
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">Version PDF</span>
                  <span className="sm:hidden">PDF</span>
                </button>
                <button className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm">
                  <Mail className="w-4 h-4" />
                  <span className="hidden sm:inline">{t('mail')}</span>
                  <span className="sm:hidden">{t('mail')}</span>
                </button>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Date:</label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-[#DAA520] text-sm"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <label className="text-sm font-medium text-gray-700 whitespace-nowrap">{t('driver')}:</label>
                <select
                  value={filterDriver}
                  onChange={(e) => setFilterDriver(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-[#DAA520] text-sm"
                >
                  <option value="all">--Toute la liste--</option>
                  {drivers.map(driver => (
                    <option key={driver} value={driver}>{driver}</option>
                  ))}
                </select>
              </div>
              
              <button className="px-4 py-2 text-white rounded-lg font-medium transition-colors text-sm" style={{ backgroundColor: '#DAA520' }}>
                {t('search')}
              </button>
            </div>
          </div>

          {/* Add Trip Button */}
          <div className="flex justify-end">
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-6 py-3 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
              style={{ backgroundColor: '#DAA520' }}
            >
              <Plus className="w-5 h-5" />
              <span>Ajouter une course</span>
            </button>
          </div>

          {/* Table Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 lg:p-6 border-b border-gray-200">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Course(s)</h3>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <Printer className="w-4 h-4" />
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
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-[#DAA520] text-sm"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N°</th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('time')}</th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">{t('driver')}</th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('departure')}</th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">{t('destination')}</th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">{t('passengers')}</th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">{t('client')}</th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">{t('payment')}</th>
                    <th className="px-3 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {getPaginatedSchedules().map((schedule, index) => (
                    <tr key={schedule.id} className="hover:bg-gray-50">
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(currentPage - 1) * itemsPerPage + index + 1}
                      </td>
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {schedule.time}
                      </td>
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden sm:table-cell">
                        {schedule.driver}
                      </td>
                      <td className="px-3 lg:px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs truncate" title={schedule.location}>
                          {schedule.location}
                        </div>
                      </td>
                      <td className="px-3 lg:px-6 py-4 text-sm text-gray-900 hidden md:table-cell">
                        <div className="max-w-xs truncate" title={schedule.destination || 'N/A'}>
                          {schedule.destination || 'N/A'}
                        </div>
                      </td>
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden lg:table-cell">
                        {schedule.passengers}
                      </td>
                      <td className="px-3 lg:px-6 py-4 text-sm text-gray-900 hidden lg:table-cell">
                        <div className="max-w-xs truncate" title={schedule.client}>
                          {schedule.client}
                        </div>
                      </td>
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                        {schedule.paymentMethod || 'Invoice'}
                      </td>
                      <td className="px-3 lg:px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-1 lg:space-x-2">
                          <button className="text-green-600 hover:text-green-900 p-1">
                            <Edit className="w-3 h-3 lg:w-4 lg:h-4" />
                          </button>
                          <button className="p-1" style={{ color: '#DAA520' }}>
                            <Check className="w-3 h-3 lg:w-4 lg:h-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-900 p-1">
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
            <div className="px-4 lg:px-6 py-4 pb-6 lg:pb-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                <div className="text-xs sm:text-sm text-gray-700 text-center sm:text-left">
                  Affichage {((currentPage - 1) * itemsPerPage) + 1} à {Math.min(currentPage * itemsPerPage, getFilteredSchedules().length)} de {getFilteredSchedules().length} enregistrement(s)
                </div>
                <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-2 py-2 text-xs sm:text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="hidden sm:inline">Première</span>
                    <span className="sm:hidden">«</span>
                  </button>
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
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
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-2 py-2 text-xs sm:text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="hidden sm:inline">Suivante</span>
                    <span className="sm:hidden">›</span>
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
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
      )}

      {/* Add Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Menu className="w-5 h-5 text-gray-600" />
                <h3 className="text-xl font-semibold text-gray-900">Nouvelle course</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Company */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Compagnie</label>
                <div className="relative">
                  <select
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-[#DAA520] appearance-none bg-white"
                  >
                    {companies.map(company => (
                      <option key={company} value={company}>{company}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange('date', e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-[#DAA520]"
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Heure</label>
                  <div className="relative">
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => handleInputChange('time', e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-[#DAA520]"
                    />
                    <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Addresses */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Adresse de départ</label>
                <input
                  type="text"
                  placeholder="Enter a location"
                  value={formData.departureAddress}
                  onChange={(e) => handleInputChange('departureAddress', e.target.value)}
                  className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-[#DAA520] ${
                    errors.departureAddress ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.departureAddress && (
                  <p className="mt-1 text-sm text-red-600">{errors.departureAddress}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
                <input
                  type="text"
                  placeholder="Enter a location"
                  value={formData.destination}
                  onChange={(e) => handleInputChange('destination', e.target.value)}
                  className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-[#DAA520] ${
                    errors.destination ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.destination && (
                  <p className="mt-1 text-sm text-red-600">{errors.destination}</p>
                )}
              </div>

              {/* Client, Driver, Car */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Client</label>
                  <div className="relative">
                    <select
                      value={formData.client}
                      onChange={(e) => handleInputChange('client', e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-[#DAA520] appearance-none bg-white"
                    >
                      {clients.map(client => (
                        <option key={client} value={client}>{client}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Chauffeur</label>
                  <div className="relative">
                    <select
                      value={formData.driver}
                      onChange={(e) => handleInputChange('driver', e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-[#DAA520] appearance-none bg-white"
                    >
                      {drivers.map(driver => (
                        <option key={driver} value={driver}>{driver}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Voiture</label>
                  <div className="relative">
                    <select
                      value={formData.car}
                      onChange={(e) => handleInputChange('car', e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-[#DAA520] appearance-none bg-white"
                    >
                      {cars.map(car => (
                        <option key={car} value={car}>{car}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Passengers */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nombre de passagers</label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={formData.passengers}
                    onChange={(e) => handleInputChange('passengers', parseInt(e.target.value) || 1)}
                    className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-[#DAA520] ${
                      errors.passengers ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex flex-col">
                    <button
                      type="button"
                      onClick={() => handleInputChange('passengers', formData.passengers + 1)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => handleInputChange('passengers', Math.max(1, formData.passengers - 1))}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ▼
                    </button>
                  </div>
                </div>
                {errors.passengers && (
                  <p className="mt-1 text-sm text-red-600">{errors.passengers}</p>
                )}
              </div>

              {/* Passenger Names */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom des passagers</label>
                <textarea
                  placeholder="Tapez ici les noms des passagers..."
                  value={formData.passengerNames}
                  onChange={(e) => handleInputChange('passengerNames', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-[#DAA520] resize-none"
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Prix de la course</label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 relative">
                    <input
                      type="number"
                      placeholder="Prix"
                      value={formData.price}
                      onChange={(e) => handleInputChange('price', e.target.value)}
                      className={`w-full px-3 py-3 border rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-[#DAA520] ${
                        errors.price ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">€</span>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.vatIncluded}
                        onChange={(e) => handleInputChange('vatIncluded', e.target.checked)}
                        className="w-4 h-4 border-gray-300 rounded focus:ring-[#DAA520]"
                        style={{ color: '#DAA520' }}
                      />
                      <span className="text-sm text-gray-700">TVA compris</span>
                    </label>
                  </div>
                </div>
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                )}
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mode de paiement</label>
                <div className="relative">
                  <select
                    value={formData.paymentMethod}
                    onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-[#DAA520] appearance-none bg-white"
                  >
                    {paymentMethods.map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Comments */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Commentaires</label>
                <textarea
                  placeholder="Commentaires additionnels..."
                  value={formData.comments}
                  onChange={(e) => handleInputChange('comments', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#DAA520] focus:border-[#DAA520] resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 text-white font-medium rounded-lg transition-colors"
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

export default Plannings

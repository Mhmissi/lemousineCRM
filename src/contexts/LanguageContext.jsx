import { createContext, useContext, useState, useEffect } from 'react'

const LanguageContext = createContext()

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    drivers: 'Drivers',
    vehicles: 'Vehicles',
    trips: 'Trips',
    reports: 'Reports',
    settings: 'Settings',
    
    // Common
    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    add: 'Add',
    create: 'Create',
    update: 'Update',
    search: 'Search',
    filter: 'Filter',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    
    // Settings
    profileInformation: 'Profile Information',
    languageRegional: 'Language & Regional',
    fullName: 'Full Name',
    emailAddress: 'Email Address',
    changePassword: 'Change Password',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm New Password',
    language: 'Language',
    timezone: 'Timezone',
    applicationInformation: 'Application Information',
    appVersion: 'App Version',
    lastUpdated: 'Last Updated',
    build: 'Build',
    environment: 'Environment',
    
    // Trip Form
    createNewTrip: 'Create New Trip',
    driver: 'Driver',
    vehicle: 'Vehicle',
    pickupLocation: 'Pickup Location',
    destination: 'Destination',
    date: 'Date',
    startTime: 'Start Time',
    endTime: 'End Time',
    numberOfPassengers: 'Number of Passengers',
    clientName: 'Client Name',
    revenue: 'Revenue',
    additionalNotes: 'Additional Notes',
    selectDriver: 'Select a driver',
    selectVehicle: 'Select a vehicle',
    createTrip: 'Create Trip',
    
    // Driver Dashboard
    myTrips: 'My Trips',
    earnings: 'Earnings',
    profile: 'Profile',
    welcomeBack: 'Welcome back',
    noTripsScheduled: 'No trips scheduled',
    noTripsMessage: "You don't have any trips assigned at the moment.",
    startTrip: 'Start Trip',
    completeTrip: 'Complete Trip',
    tripCompleted: 'Trip Completed',
    navigate: 'Navigate',
    thisWeek: 'This Week',
    totalEarnings: 'Total Earnings',
    tripStatistics: 'Trip Statistics',
    totalTrips: 'Total Trips',
    completed: 'Completed',
    successRate: 'Success Rate',
    rating: 'Rating',
    recentTrips: 'Recent Trips',
    professionalDriver: 'Professional Driver',
    performance: 'Performance',
    notifications: 'Notifications',
    privacy: 'Privacy',
    signOut: 'Sign Out'
  },
  
  fr: {
    // Navigation
    dashboard: 'Tableau de bord',
    drivers: 'Chauffeurs',
    vehicles: 'Véhicules',
    trips: 'Trajets',
    reports: 'Rapports',
    settings: 'Paramètres',
    
    // Common
    save: 'Enregistrer',
    cancel: 'Annuler',
    edit: 'Modifier',
    delete: 'Supprimer',
    add: 'Ajouter',
    create: 'Créer',
    update: 'Mettre à jour',
    search: 'Rechercher',
    filter: 'Filtrer',
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    
    // Settings
    profileInformation: 'Informations du profil',
    languageRegional: 'Langue et région',
    fullName: 'Nom complet',
    emailAddress: 'Adresse e-mail',
    changePassword: 'Changer le mot de passe',
    currentPassword: 'Mot de passe actuel',
    newPassword: 'Nouveau mot de passe',
    confirmPassword: 'Confirmer le nouveau mot de passe',
    language: 'Langue',
    timezone: 'Fuseau horaire',
    applicationInformation: 'Informations sur l\'application',
    appVersion: 'Version de l\'app',
    lastUpdated: 'Dernière mise à jour',
    build: 'Build',
    environment: 'Environnement',
    
    // Trip Form
    createNewTrip: 'Créer un nouveau trajet',
    driver: 'Chauffeur',
    vehicle: 'Véhicule',
    pickupLocation: 'Lieu de prise en charge',
    destination: 'Destination',
    date: 'Date',
    startTime: 'Heure de début',
    endTime: 'Heure de fin',
    numberOfPassengers: 'Nombre de passagers',
    clientName: 'Nom du client',
    revenue: 'Revenus',
    additionalNotes: 'Notes supplémentaires',
    selectDriver: 'Sélectionner un chauffeur',
    selectVehicle: 'Sélectionner un véhicule',
    createTrip: 'Créer le trajet',
    
    // Driver Dashboard
    myTrips: 'Mes trajets',
    earnings: 'Gains',
    profile: 'Profil',
    welcomeBack: 'Bon retour',
    noTripsScheduled: 'Aucun trajet programmé',
    noTripsMessage: "Vous n'avez aucun trajet assigné pour le moment.",
    startTrip: 'Commencer le trajet',
    completeTrip: 'Terminer le trajet',
    tripCompleted: 'Trajet terminé',
    navigate: 'Naviguer',
    thisWeek: 'Cette semaine',
    totalEarnings: 'Gains totaux',
    tripStatistics: 'Statistiques des trajets',
    totalTrips: 'Total des trajets',
    completed: 'Terminés',
    successRate: 'Taux de réussite',
    rating: 'Note',
    recentTrips: 'Trajets récents',
    professionalDriver: 'Chauffeur professionnel',
    performance: 'Performance',
    notifications: 'Notifications',
    privacy: 'Confidentialité',
    signOut: 'Se déconnecter'
  },
  
  es: {
    // Navigation
    dashboard: 'Panel de control',
    drivers: 'Conductores',
    vehicles: 'Vehículos',
    trips: 'Viajes',
    reports: 'Informes',
    settings: 'Configuración',
    
    // Common
    save: 'Guardar',
    cancel: 'Cancelar',
    edit: 'Editar',
    delete: 'Eliminar',
    add: 'Agregar',
    create: 'Crear',
    update: 'Actualizar',
    search: 'Buscar',
    filter: 'Filtrar',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    
    // Settings
    profileInformation: 'Información del perfil',
    languageRegional: 'Idioma y región',
    fullName: 'Nombre completo',
    emailAddress: 'Dirección de correo',
    changePassword: 'Cambiar contraseña',
    currentPassword: 'Contraseña actual',
    newPassword: 'Nueva contraseña',
    confirmPassword: 'Confirmar nueva contraseña',
    language: 'Idioma',
    timezone: 'Zona horaria',
    applicationInformation: 'Información de la aplicación',
    appVersion: 'Versión de la app',
    lastUpdated: 'Última actualización',
    build: 'Build',
    environment: 'Entorno',
    
    // Trip Form
    createNewTrip: 'Crear nuevo viaje',
    driver: 'Conductor',
    vehicle: 'Vehículo',
    pickupLocation: 'Lugar de recogida',
    destination: 'Destino',
    date: 'Fecha',
    startTime: 'Hora de inicio',
    endTime: 'Hora de fin',
    numberOfPassengers: 'Número de pasajeros',
    clientName: 'Nombre del cliente',
    revenue: 'Ingresos',
    additionalNotes: 'Notas adicionales',
    selectDriver: 'Seleccionar conductor',
    selectVehicle: 'Seleccionar vehículo',
    createTrip: 'Crear viaje',
    
    // Driver Dashboard
    myTrips: 'Mis viajes',
    earnings: 'Ganancias',
    profile: 'Perfil',
    welcomeBack: 'Bienvenido de vuelta',
    noTripsScheduled: 'No hay viajes programados',
    noTripsMessage: 'No tienes ningún viaje asignado en este momento.',
    startTrip: 'Iniciar viaje',
    completeTrip: 'Completar viaje',
    tripCompleted: 'Viaje completado',
    navigate: 'Navegar',
    thisWeek: 'Esta semana',
    totalEarnings: 'Ganancias totales',
    tripStatistics: 'Estadísticas de viajes',
    totalTrips: 'Total de viajes',
    completed: 'Completados',
    successRate: 'Tasa de éxito',
    rating: 'Calificación',
    recentTrips: 'Viajes recientes',
    professionalDriver: 'Conductor profesional',
    performance: 'Rendimiento',
    notifications: 'Notificaciones',
    privacy: 'Privacidad',
    signOut: 'Cerrar sesión'
  }
}

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load language from localStorage or default to 'en'
    const savedLanguage = localStorage.getItem('limostar-language') || 'en'
    setLanguage(savedLanguage)
    setIsLoading(false)
  }, [])

  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage)
    localStorage.setItem('limostar-language', newLanguage)
  }

  const t = (key) => {
    return translations[language]?.[key] || translations['en'][key] || key
  }

  const value = {
    language,
    changeLanguage,
    t,
    isLoading
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

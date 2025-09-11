# Lemousine CRM

A modern, responsive web application for professional limousine service management, designed with mobile-first principles and optimized for both drivers and service owners.

## 🚀 Features

### For Drivers
- **Super minimal interface** - One page after login: My Trips
- **Trip cards** with vehicle info, date & time, and route details
- **One-touch status updates** - Assigned → On the Way → Completed
- **Mobile-friendly** - Large buttons, clean fonts, works on any phone browser
- **Progressive Web App** - Can be installed on phones like a native app

### For Owners
- **Responsive dashboard** - Works seamlessly on both PC & mobile
- **Simple navigation** - Dashboard, Drivers, Vehicles, Trips, Reports
- **Mobile adaptation** - Sidebar becomes bottom navigation on small screens
- **Quick trip creation** - Always visible "+ Create Trip" button
- **Real-time updates** - Live trip status tracking

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **PWA**: Vite PWA Plugin
- **Build Tool**: Vite

## 📱 Mobile Responsiveness

- **Tailwind CSS** utility classes for responsive design
- **Breakpoint system**: `sm:`, `md:`, `lg:` for different screen sizes
- **Mobile-first approach** - Designed for phones first, enhanced for desktop
- **Touch-friendly** - Large buttons and intuitive navigation
- **Progressive Web App** - Installable on mobile devices

## 🚀 Quick Start

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd lemousine-crm
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Navigate to `http://localhost:3000`
   - The app will automatically open in your default browser

### Demo Credentials

**Driver Account:**
- Email: `driver@lemousine.com`
- Password: `password`

**Owner Account:**
- Email: `owner@lemousine.com`
- Password: `password`

## 📁 Project Structure

```
src/
├── components/
│   ├── Login.jsx              # Authentication component
│   ├── DriverDashboard.jsx    # Minimal driver interface
│   ├── OwnerDashboard.jsx     # Main owner dashboard
│   └── owner/
│       ├── Dashboard.jsx      # Overview and stats
│       ├── Drivers.jsx        # Driver management
│       ├── Vehicles.jsx       # Fleet management
│       ├── Trips.jsx          # Trip management
│       └── Reports.jsx        # Analytics and reports
├── contexts/
│   └── AuthContext.jsx        # Authentication state management
├── App.jsx                    # Main app component
├── main.jsx                   # Entry point
└── index.css                  # Global styles
```

## 🎯 User Flows

### Driver Experience
1. Driver logs in with credentials
2. Sees today's trips in simple cards
3. Each card shows: Vehicle, Time, Route (Pickup → Destination)
4. One big button for status updates
5. Real-time status changes reflected immediately

### Owner Experience
1. Owner logs in to responsive dashboard
2. Navigation adapts to screen size (sidebar on desktop, bottom nav on mobile)
3. Quick access to all management functions
4. Real-time updates on driver activities
5. Comprehensive reporting and analytics

## 🔧 Build & Deploy

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📱 Progressive Web App Features

- **Installable** - Can be added to home screen
- **Offline capable** - Works without internet connection
- **Push notifications** - Ready for driver notifications
- **App-like experience** - Full screen, no browser UI

## 🎨 Design Principles

- **Mobile-first** - Designed for phones, enhanced for desktop
- **Minimal complexity** - Simple, intuitive interfaces
- **Touch-friendly** - Large buttons, easy navigation
- **Clean typography** - Readable fonts, proper spacing
- **Consistent colors** - Professional color scheme
- **Fast loading** - Optimized performance

## 🔮 Future Enhancements

- Real-time GPS tracking
- Push notifications for drivers
- Advanced reporting and analytics
- Multi-language support
- Integration with payment systems
- Customer portal
- Mobile app versions

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**Built with ❤️ for professional limousine services**

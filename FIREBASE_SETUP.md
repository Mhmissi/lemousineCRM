# 🔥 Firebase Setup Instructions for Limousine CRM

## 📋 **Manual Setup Steps**

### **Step 1: Create Firebase Project**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or "Create a project"
3. Project name: `limousine-crm` (or your preferred name)
4. Enable Google Analytics: ✅ Yes (recommended)
5. Click "Create project"

### **Step 2: Enable Authentication**

1. In Firebase Console, go to **"Authentication"** in left sidebar
2. Click **"Get started"**
3. Go to **"Sign-in method"** tab
4. Enable **Email/Password** authentication:
   - Click "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

### **Step 3: Create Firestore Database**

1. Go to **"Firestore Database"** in left sidebar
2. Click **"Create database"**
3. Choose **"Start in test mode"** (for development)
4. Select a location (choose closest to your users)
5. Click "Done"

### **Step 4: Get Firebase Configuration**

1. Go to **Project Settings** (gear icon ⚙️)
2. Scroll down to **"Your apps"** section
3. Click the web icon `</>`
4. App nickname: `limousine-crm-web`
5. Click "Register app"

6. **Copy the Firebase Config Object** and replace the placeholder in:
   ```
   src/config/firebase.js
   ```

### **Step 5: Set Up Firestore Security Rules**

1. Go to **Firestore Database → Rules** tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Trips - authenticated users can read/write
    match /trips/{tripId} {
      allow read, write: if request.auth != null;
    }
    
    // Drivers - authenticated users can read/write
    match /drivers/{driverId} {
      allow read, write: if request.auth != null;
    }
    
    // Vehicles - authenticated users can read/write
    match /vehicles/{vehicleId} {
      allow read, write: if request.auth != null;
    }
    
    // Clients - authenticated users can read/write
    match /clients/{clientId} {
      allow read, write: if request.auth != null;
    }
    
    // Companies - authenticated users can read/write
    match /companies/{companyId} {
      allow read, write: if request.auth != null;
    }
    
    // Brands - authenticated users can read/write
    match /brands/{brandId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

3. Click **"Publish"**

## 🚀 **Testing the Setup**

### **Step 1: Update Firebase Config**

1. Open `src/config/firebase.js`
2. Replace the placeholder values with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id",
  measurementId: "your-actual-measurement-id"
};
```

### **Step 2: Test the Connection**

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to: `http://localhost:5173/firebase-test`

3. Click **"Test Connection"** to verify Firestore connection

4. Click **"Populate Sample Data"** to add initial data to your database

### **Step 3: Verify in Firebase Console**

1. Go to **Firestore Database → Data** tab
2. You should see these collections:
   - `users`
   - `drivers`
   - `vehicles`
   - `clients`
   - `companies`
   - `brands`
   - `trips`

## 📊 **Database Structure**

### **Collections Overview:**

- **`users`** - User accounts (owners, drivers)
- **`trips`** - Trip records with driver, vehicle, client references
- **`drivers`** - Driver information and status
- **`vehicles`** - Vehicle fleet management
- **`clients`** - Client/customer information
- **`companies`** - Company/business information
- **`brands`** - Brand/partnership information

### **Sample Data Structure:**

Each document includes:
- `createdAt` - Server timestamp
- `updatedAt` - Server timestamp
- Collection-specific fields

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **"Firebase: Error (auth/network-request-failed)"**
   - Check your internet connection
   - Verify Firebase project is active

2. **"Missing or insufficient permissions"**
   - Check Firestore security rules
   - Ensure user is authenticated

3. **"Firebase config not found"**
   - Verify `src/config/firebase.js` has correct config
   - Check for typos in project ID

### **Debug Steps:**

1. Check browser console for errors
2. Verify Firebase project is in correct region
3. Ensure all required services are enabled
4. Check Firestore rules are published

## 📱 **Next Steps**

After successful setup:

1. ✅ Firebase project created
2. ✅ Authentication enabled
3. ✅ Firestore database created
4. ✅ Security rules configured
5. ✅ Sample data populated
6. ✅ Connection tested

**Ready for the next phase: Authentication integration!** 🎉

---

## 📞 **Support**

If you encounter issues:
1. Check Firebase Console for error logs
2. Verify all manual steps were completed
3. Ensure Firebase project is active
4. Check network connectivity

**The Firebase test component will help diagnose any connection issues.**


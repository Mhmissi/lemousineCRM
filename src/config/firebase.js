// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDRAOZeoAgIJKDIzfAtHnilLsOWTKQiNsE",
  authDomain: "limostar-90a63.firebaseapp.com",
  projectId: "limostar-90a63",
  storageBucket: "limostar-90a63.firebasestorage.app",
  messagingSenderId: "307177935112",
  appId: "1:307177935112:web:4d11ed862d40955ba11cbd",
  measurementId: "G-8N6X0VXQYW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Analytics (optional)
export const analytics = getAnalytics(app);

export default app;
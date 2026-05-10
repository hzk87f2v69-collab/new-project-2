import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  getIdToken
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

// TODO: Replace this with your actual Firebase configuration
// from the Firebase Console -> Project Settings -> General -> Web Apps
const firebaseConfig = {
  apiKey: "AIzaSyDWeZHTOVHS4uQbDd_cwHdg-sFWDlcoY6w",
  authDomain: "ace-fit-1818.firebaseapp.com",
  projectId: "ace-fit-1818",
  storageBucket: "ace-fit-1818.firebasestorage.app",
  messagingSenderId: "546728984253",
  appId: "1:546728984253:web:63cd7cfc050dfee9d541d4",
  measurementId: "G-3KRGHPQH1S"
};

// Initialize Firebase only if the user has provided a config
let app, auth;

if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  console.log("Firebase initialized successfully.");
} else {
  console.warn("Firebase config is missing. Please update firebase-auth-init.js with your project details.");
}

// Expose to the global scope so legacy scripts can use it
window.firebaseAuthModule = {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  getIdToken,
  isConfigured: firebaseConfig.apiKey !== "YOUR_API_KEY"
};

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCukjVntOH3WCbTwnq6fu4LAK3WU31Xd-I",
  authDomain: "sportwave1-4f1eb.firebaseapp.com",
  projectId: "sportwave1-4f1eb",
  storageBucket: "sportwave1-4f1eb.firebasestorage.app",
  messagingSenderId: "500938435618",
  appId: "1:500938435618:web:87203f17f582eccdd96e7b",
  measurementId: "G-1M5KK0N0ZS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only on client side
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Initialize Auth
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider, analytics };
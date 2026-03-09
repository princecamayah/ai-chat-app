// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
// https://firebase.google.com/docs/web/setup#available-libraries
import { getFunctions, connectFunctionsEmulator } from "firebase/functions";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "cs310-ai-chat-app.firebaseapp.com",
  projectId: "cs310-ai-chat-app",
  storageBucket: "cs310-ai-chat-app.firebasestorage.app",
  messagingSenderId: "96187522474",
  appId: "1:96187522474:web:9f7d890f65b72e7c1b5fd3"
};

// initialise firebase
const app = initializeApp(firebaseConfig);

// initialise cloud functions and set the region to london
// (must match the region we deployed to: europe-west2)
export const functions = getFunctions(app, "europe-west2");

// initialise and export auth and database services
// allows the rest of the app to use them
export const auth = getAuth(app);
export const db = getFirestore(app);

// if we are developing locally, connect to the emulator
if (window.location.hostname === 'localhost') {
  console.log("🔌 Connecting to Firebase Functions Emulator");
  connectFunctionsEmulator(functions, '127.0.0.1', 5001);
}
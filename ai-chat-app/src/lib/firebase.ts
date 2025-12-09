// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getFunctions } from "firebase/functions";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCkgHJsbx6tLnN2clNiZ0JVOCdMn1kPjWo",
  authDomain: "cs310-ai-chat-app.firebaseapp.com",
  projectId: "cs310-ai-chat-app",
  storageBucket: "cs310-ai-chat-app.firebasestorage.app",
  messagingSenderId: "96187522474",
  appId: "1:96187522474:web:9f7d890f65b72e7c1b5fd3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Functions and set the region to London
// (Must match the region we deployed to: europe-west2)
export const functions = getFunctions(app, "europe-west2");
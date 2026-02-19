// firebase-config.js
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, addDoc, onSnapshot, query, where } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// YOUR FIREBASE CONFIGURATION (Replace with your actual keys from Firebase Console)
const firebaseConfig = {
   apiKey: "AIzaSyBfaqlGQkHeH3Fim1r2oz1Gwc6YX9Ghc-k",
  authDomain: "dash-a64ea.firebaseapp.com",
  projectId: "dash-a64ea",
  storageBucket: "dash-a64ea.firebasestorage.app",
  messagingSenderId: "181904799777",
  appId: "1:181904799777:web:3314530846808011610b60",
  measurementId: "G-7MQC3Z8YVS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

export { auth, db, provider, signInWithPopup, onAuthStateChanged, signOut, doc, getDoc, setDoc, updateDoc, collection, addDoc, onSnapshot, query, where, createUserWithEmailAndPassword, signInWithEmailAndPassword };

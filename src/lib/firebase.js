// Firebase Configuration
// Uses the existing caltrack-e2cb3 Firebase project with modern local cache persistence

import { initializeApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager
} from 'firebase/firestore';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY            || "AIzaSyDXleZ-vH2C3bW3qbEf6DHcTM6awhZSo3s",
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || "caltrack-e2cb3.firebaseapp.com",
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || "caltrack-e2cb3",
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || "caltrack-e2cb3.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER   || "720130740593",
  appId:             import.meta.env.VITE_FIREBASE_APP_ID             || "1:720130740593:web:224eda48cdfdd0b552e6d0",
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID     || "G-GYCXZN2PX9"
};

const app = initializeApp(firebaseConfig);

// Initialize Firestore with modern multi-tab persistent offline cache
const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

const auth = getAuth(app);
const storage = getStorage(app);

// Set auth persistence to LOCAL (survives browser close)
setPersistence(auth, browserLocalPersistence).catch(console.warn);

export { app, db, auth, storage, firebaseConfig };

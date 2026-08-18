import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCrqkZ-6_QKyk0E0pfue2HNWaGVpc2bkiI',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'elegant-moment-284814.firebaseapp.com',
  databaseURL:
    import.meta.env.VITE_FIREBASE_DATABASE_URL ||
    'https://elegant-moment-284814-default-rtdb.firebaseio.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'elegant-moment-284814',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'elegant-moment-284814.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '405241070322',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:405241070322:web:9a205b0578782ca847866b',
};

const firebaseApp = initializeApp(firebaseConfig);

export const auth = getAuth(firebaseApp);
export const database = getDatabase(firebaseApp);

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Debug: Vérifier que les variables d'environnement sont chargées
console.log('🔍 Variables d\'environnement Firebase:');
console.log('API Key:', import.meta.env.VITE_FIREBASE_API_KEY ? '✅ Chargée' : '❌ Manquante');
console.log('Auth Domain:', import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? '✅ Chargée' : '❌ Manquante');
console.log('Project ID:', import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✅ Chargée' : '❌ Manquante');

// Configuration Firebase avec fallback
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCwGBTeIZDPGJqYe4mtP-Sh4OIlSWMHQXQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "monbunq-e26ba.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "monbunq-e26ba",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "monbunq-e26ba.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "830779729809",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:830779729809:web:40f00e2f5c8e4182fc9c30",
};

// Debug: Afficher la configuration (sans la clé API pour la sécurité)
console.log('🔧 Configuration Firebase:', {
  ...firebaseConfig,
  apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'MANQUANTE'
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;

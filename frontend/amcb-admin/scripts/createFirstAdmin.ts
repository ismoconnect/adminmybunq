import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp, collection, addDoc, getDoc, getDocs, query, where, orderBy, updateDoc, deleteDoc } from 'firebase/firestore';

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCwGBTeIZDPGJqYe4mtP-Sh4OIlSWMHQXQ",
  authDomain: "monbunq-e26ba.firebaseapp.com",
  projectId: "monbunq-e26ba",
  storageBucket: "monbunq-e26ba.firebasestorage.app",
  messagingSenderId: "830779729809",
  appId: "1:830779729809:web:40f00e2f5c8e4182fc9c30"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Interface Admin
interface Admin {
  id?: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: {
    users: boolean;
    accounts: boolean;
    transactions: boolean;
    kyc: boolean;
    reports: boolean;
    settings: boolean;
    support: boolean;
  };
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
  lastLoginAt?: any;
  createdBy?: string;
}

/**
 * Script pour créer le premier administrateur
 */
async function createFirstAdmin() {
  try {
    console.log('🚀 Début de la création du premier administrateur...');

    // Informations de l'administrateur
    const adminEmail = 'admin@monbunq.com';
    const adminPassword = 'AdminMonBunq2024!';
    
    const adminData: Omit<Admin, 'id' | 'createdAt' | 'updatedAt'> = {
      email: adminEmail,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'super_admin',
      permissions: {
        users: true,
        accounts: true,
        transactions: true,
        kyc: true,
        reports: true,
        settings: true,
        support: true,
      },
      isActive: true,
      createdBy: 'system'
    };

    console.log('📧 Création du compte utilisateur Firebase...');
    
    // Créer le compte utilisateur Firebase
    const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
    const user = userCredential.user;
    
    console.log('✅ Compte utilisateur créé:', user.uid);

    // Créer le document admin dans Firestore
    console.log('👤 Création du document admin dans Firestore...');
    
    const adminDocRef = doc(db, 'admins', user.uid);
    await setDoc(adminDocRef, {
      ...adminData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log('✅ Document admin créé dans Firestore');

    // Vérifier la création
    console.log('🔍 Vérification de la création...');
    const adminDoc = await getDoc(doc(db, 'admins', user.uid));
    
    if (adminDoc.exists()) {
      const createdAdmin = { id: adminDoc.id, ...adminDoc.data() } as Admin;
      console.log('🎉 Premier administrateur créé avec succès !');
      console.log('📋 Détails de l\'administrateur:');
      console.log('   - Email:', createdAdmin.email);
      console.log('   - Nom:', createdAdmin.firstName, createdAdmin.lastName);
      console.log('   - Rôle:', createdAdmin.role);
      console.log('   - Permissions:', createdAdmin.permissions);
      console.log('   - Actif:', createdAdmin.isActive);
      console.log('   - ID:', user.uid);
      
      console.log('\n🔐 Informations de connexion:');
      console.log('   - Email:', adminEmail);
      console.log('   - Mot de passe:', adminPassword);
      console.log('\n⚠️  IMPORTANT: Changez le mot de passe après la première connexion !');
      
    } else {
      throw new Error('Impossible de récupérer l\'administrateur créé');
    }

  } catch (error: any) {
    console.error('❌ Erreur lors de la création de l\'administrateur:', error);
    
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️  Le compte admin existe déjà. Tentative de connexion...');
      
      try {
        // Essayer de se connecter avec le compte existant
        const signInResult = await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
        console.log('✅ Connexion réussie avec le compte existant');
        
        // Vérifier si le document admin existe
        const existingAdminDoc = await getDoc(doc(db, 'admins', signInResult.user.uid));
        if (existingAdminDoc.exists()) {
          const existingAdmin = { id: existingAdminDoc.id, ...existingAdminDoc.data() } as Admin;
          console.log('✅ Document admin trouvé:', existingAdmin.email);
        } else {
          console.log('⚠️  Document admin manquant, création en cours...');
          // Créer le document admin manquant
          const adminDocRef = doc(db, 'admins', signInResult.user.uid);
          await setDoc(adminDocRef, {
            email: adminEmail,
            firstName: 'Super',
            lastName: 'Admin',
            role: 'super_admin',
            permissions: {
              users: true,
              accounts: true,
              transactions: true,
              kyc: true,
              reports: true,
              settings: true,
              support: true,
            },
            isActive: true,
            createdBy: 'system',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          console.log('✅ Document admin créé');
        }
      } catch (signInError) {
        console.error('❌ Erreur de connexion:', signInError);
      }
    }
  }
}

/**
 * Script pour créer un administrateur personnalisé
 */
async function createCustomAdmin(email: string, password: string, firstName: string, lastName: string, role: Admin['role'] = 'admin') {
  try {
    console.log(`🚀 Création d'un administrateur personnalisé: ${email}`);

    const adminData: Omit<Admin, 'id' | 'createdAt' | 'updatedAt'> = {
      email,
      firstName,
      lastName,
      role,
      permissions: {
        users: role === 'super_admin',
        accounts: role === 'super_admin' || role === 'admin',
        transactions: role === 'super_admin' || role === 'admin',
        kyc: role === 'super_admin' || role === 'admin',
        reports: true,
        settings: role === 'super_admin',
        support: true,
      },
      isActive: true,
      createdBy: 'admin'
    };

    // Créer le compte utilisateur
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    console.log('✅ Compte utilisateur créé:', user.uid);

    // Créer le document admin
    const adminDocRef = doc(db, 'admins', user.uid);
    await setDoc(adminDocRef, {
      ...adminData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    console.log('🎉 Administrateur personnalisé créé avec succès !');
    console.log('📋 Détails:', { email, firstName, lastName, role, uid: user.uid });

  } catch (error: any) {
    console.error('❌ Erreur lors de la création de l\'administrateur personnalisé:', error);
  }
}

// Exécuter le script directement
createFirstAdmin()
  .then(() => {
    console.log('\n✨ Script terminé avec succès !');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script échoué:', error);
    process.exit(1);
  });

export { createFirstAdmin, createCustomAdmin };

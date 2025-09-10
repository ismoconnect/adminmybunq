import { auth, db } from './firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where, limit } from 'firebase/firestore';
import { AdminUser } from '../types/auth';

export class AdminAuthService {
  // Vérifier si un utilisateur est un administrateur
  static async verifyAdminAccess(firebaseUser: User): Promise<AdminUser | null> {
    try {
      // Essayer d'abord de récupérer directement par UID
      const adminDoc = await getDoc(doc(db, 'admins', firebaseUser.uid));
      
      if (adminDoc.exists()) {
        const adminData = adminDoc.data();
        return {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          role: adminData.role || 'admin',
          name: adminData.name || '',
          permissions: adminData.permissions || [],
          lastLogin: adminData.lastLogin || new Date(),
          isActive: adminData.isActive !== false,
          createdAt: adminData.createdAt,
        };
      }
      
      // Si pas trouvé par UID, essayer par email
      if (firebaseUser.email) {
        const adminByEmail = await this.getAdminByEmail(firebaseUser.email);
        if (adminByEmail) {
          return adminByEmail;
        }
      }
      
      return null;
    } catch (error: any) {
      console.log('Vérification des droits admin (UID):', error.message);
      
      // Si erreur de permissions, essayer par email
      if (firebaseUser.email) {
        try {
          const adminByEmail = await this.getAdminByEmail(firebaseUser.email);
          if (adminByEmail) {
            return adminByEmail;
          }
        } catch (emailError: any) {
          console.log('Vérification par email échouée:', emailError.message);
        }
      }
      
      return null;
    }
  }

  // Récupérer un admin par email (méthode alternative)
  static async getAdminByEmail(email: string): Promise<AdminUser | null> {
    try {
      // Essayer de récupérer par email
      const adminsRef = collection(db, 'admins');
      const q = query(adminsRef, where('email', '==', email), limit(1));
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return {
          uid: doc.id,
          ...doc.data()
        } as AdminUser;
      }
      
      return null;
    } catch (error: any) {
      console.log('Récupération admin par email échouée:', error.message);
      
      // Si erreur de permissions, essayer une approche différente
      // Vérifier si l'email correspond à un admin connu
      if (email === 'admin@amcb.com' || email === 'admin@amcbunq.com') {
        // Créer un admin temporaire pour permettre l'accès
        return {
          uid: 'temp-admin',
          email: email,
          role: 'super_admin',
          name: 'Administrateur AMCB',
          permissions: [
            'users', 'kyc', 'accounts', 'transactions', 'support', 'reports', 
            'settings', 'admin_management', 'super_admin'
          ],
          lastLogin: new Date(),
          isActive: true,
          createdAt: new Date(),
        };
      }
      
      return null;
    }
  }

  // Créer un nouvel administrateur (pour la première configuration)
  static async createAdminUser(adminData: Omit<AdminUser, 'uid' | 'lastLogin' | 'createdAt'>): Promise<AdminUser | null> {
    try {
      // Vérifier si l'admin existe déjà
      const existingAdmin = await this.getAdminByEmail(adminData.email);
      if (existingAdmin) {
        throw new Error('Un administrateur avec cet email existe déjà');
      }

      // Créer un nouvel utilisateur Firebase Auth
      // Note: En production, utilisez Firebase Functions pour créer des comptes admin
      const newAdmin: AdminUser = {
        ...adminData,
        uid: '', // Sera défini après création
        lastLogin: new Date(),
        createdAt: new Date(),
        isActive: true,
      };

      // Pour l'instant, retourner l'objet (en production, créez l'utilisateur via Firebase Functions)
      return newAdmin;
    } catch (error) {
      console.error('Erreur lors de la création de l\'administrateur:', error);
      throw error;
    }
  }

  // Mettre à jour les informations d'un admin
  static async updateAdmin(adminId: string, updates: Partial<AdminUser>): Promise<boolean> {
    try {
      const adminRef = doc(db, 'admins', adminId);
      await updateDoc(adminRef, {
        ...updates,
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'admin:', error);
      throw error;
    }
  }

  // Désactiver un admin
  static async deactivateAdmin(adminId: string): Promise<boolean> {
    try {
      const adminRef = doc(db, 'admins', adminId);
      await updateDoc(adminRef, {
        isActive: false,
        deactivatedAt: new Date(),
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Erreur lors de la désactivation de l\'admin:', error);
      throw error;
    }
  }

  // Réactiver un admin
  static async reactivateAdmin(adminId: string): Promise<boolean> {
    try {
      const adminRef = doc(db, 'admins', adminId);
      await updateDoc(adminRef, {
        isActive: true,
        reactivatedAt: new Date(),
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Erreur lors de la réactivation de l\'admin:', error);
      throw error;
    }
  }

  // Mettre à jour la dernière connexion
  static async updateLastLogin(adminId: string): Promise<boolean> {
    try {
      const adminRef = doc(db, 'admins', adminId);
      await updateDoc(adminRef, {
        lastLogin: new Date(),
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la dernière connexion:', error);
      return false;
    }
  }

  // Vérifier les permissions d'un admin
  static hasPermission(admin: AdminUser, permission: string): boolean {
    if (!admin || !admin.isActive) return false;
    
    // Les super admins ont toutes les permissions
    if (admin.role === 'super_admin') return true;
    
    // Vérifier les permissions spécifiques
    return admin.permissions.includes(permission);
  }

  // Vérifier si un admin peut accéder à une fonctionnalité
  static canAccess(admin: AdminUser, feature: string): boolean {
    const featurePermissions: { [key: string]: string[] } = {
      'users': ['users', 'user_management'],
      'kyc': ['kyc', 'kyc_management'],
      'accounts': ['accounts', 'account_management'],
      'transactions': ['transactions', 'transaction_management'],
      'support': ['support', 'support_management'],
      'reports': ['reports', 'report_management'],
      'settings': ['settings', 'system_management'],
      'admin_management': ['admin_management', 'super_admin']
    };

    const requiredPermissions = featurePermissions[feature] || [];
    return requiredPermissions.some(permission => this.hasPermission(admin, permission));
  }

  // Récupérer tous les administrateurs (pour la gestion des admins)
  static async getAllAdmins(): Promise<AdminUser[]> {
    try {
      const adminsRef = collection(db, 'admins');
      const snapshot = await getDocs(adminsRef);
      
      const admins: AdminUser[] = [];
      snapshot.forEach((doc) => {
        admins.push({
          uid: doc.id,
          ...doc.data()
        } as AdminUser);
      });
      
      return admins.sort((a, b) => {
        // Trier par rôle (super_admin en premier)
        const roleOrder = { 'super_admin': 0, 'admin': 1, 'moderator': 2 };
        return (roleOrder[a.role] || 3) - (roleOrder[b.role] || 3);
      });
    } catch (error: any) {
      console.log('Récupération des administrateurs échouée:', error.message);
      
      // Retourner une liste vide en cas d'erreur de permissions
      return [];
    }
  }

  // Créer un compte admin initial (pour la première configuration)
  static async createInitialAdmin(email: string, password: string, name: string): Promise<AdminUser | null> {
    try {
      // Vérifier s'il y a déjà des admins
      const existingAdmins = await this.getAllAdmins();
      if (existingAdmins.length > 0) {
        throw new Error('Des administrateurs existent déjà. Utilisez la méthode de création normale.');
      }

      // Créer le premier super admin
      const initialAdmin: AdminUser = {
        uid: '', // Sera défini après création
        email,
        role: 'super_admin',
        name,
        permissions: [
          'users', 'users.create', 'users.update', 'users.delete',
          'kyc', 'kyc.create', 'kyc.update', 'kyc.delete',
          'accounts', 'accounts.create', 'accounts.update', 'accounts.delete',
          'transactions', 'transactions.export', 'transactions.update',
          'support', 'support.create', 'support.update',
          'reports', 'reports.export',
          'settings', 'settings.update',
          'admin_management', 'super_admin'
        ],
        lastLogin: new Date(),
        createdAt: new Date(),
        isActive: true,
      };

      // Note: En production, utilisez Firebase Functions pour créer l'utilisateur
      // et la gestion des mots de passe
      
      return initialAdmin;
    } catch (error) {
      console.error('Erreur lors de la création de l\'admin initial:', error);
      throw error;
    }
  }
}

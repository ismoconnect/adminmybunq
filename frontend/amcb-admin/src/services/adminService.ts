import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export interface Admin {
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

export class AdminService {
  private static readonly COLLECTION_NAME = 'admins';

  /**
   * Créer un nouvel administrateur
   */
  static async createAdmin(adminData: Omit<Admin, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const adminRef = await addDoc(collection(db, this.COLLECTION_NAME), {
        ...adminData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      console.log('Admin créé avec succès:', adminRef.id);
      return adminRef.id;
    } catch (error) {
      console.error('Erreur lors de la création de l\'admin:', error);
      throw error;
    }
  }

  /**
   * Récupérer un administrateur par ID
   */
  static async getAdminById(adminId: string): Promise<Admin | null> {
    try {
      const adminDoc = await getDoc(doc(db, this.COLLECTION_NAME, adminId));
      
      if (adminDoc.exists()) {
        return {
          id: adminDoc.id,
          ...adminDoc.data()
        } as Admin;
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'admin:', error);
      throw error;
    }
  }

  /**
   * Récupérer un administrateur par email
   */
  static async getAdminByEmail(email: string): Promise<Admin | null> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('email', '==', email)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data()
        } as Admin;
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'admin par email:', error);
      throw error;
    }
  }

  /**
   * Récupérer tous les administrateurs
   */
  static async getAllAdmins(): Promise<Admin[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Admin[];
    } catch (error) {
      console.error('Erreur lors de la récupération des admins:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour un administrateur
   */
  static async updateAdmin(adminId: string, updateData: Partial<Admin>): Promise<void> {
    try {
      const adminRef = doc(db, this.COLLECTION_NAME, adminId);
      
      await updateDoc(adminRef, {
        ...updateData,
        updatedAt: serverTimestamp(),
      });
      
      console.log('Admin mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'admin:', error);
      throw error;
    }
  }

  /**
   * Désactiver un administrateur
   */
  static async deactivateAdmin(adminId: string): Promise<void> {
    try {
      await this.updateAdmin(adminId, { isActive: false });
      console.log('Admin désactivé avec succès');
    } catch (error) {
      console.error('Erreur lors de la désactivation de l\'admin:', error);
      throw error;
    }
  }

  /**
   * Supprimer un administrateur
   */
  static async deleteAdmin(adminId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.COLLECTION_NAME, adminId));
      console.log('Admin supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'admin:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour la dernière connexion
   */
  static async updateLastLogin(adminId: string): Promise<void> {
    try {
      await this.updateAdmin(adminId, { lastLoginAt: serverTimestamp() });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la dernière connexion:', error);
      throw error;
    }
  }

  /**
   * Vérifier si un utilisateur est administrateur
   */
  static async isAdmin(email: string): Promise<boolean> {
    try {
      const admin = await this.getAdminByEmail(email);
      return admin !== null && admin.isActive;
    } catch (error) {
      console.error('Erreur lors de la vérification du statut admin:', error);
      return false;
    }
  }

  /**
   * Vérifier les permissions d'un administrateur
   */
  static async checkPermission(email: string, permission: keyof Admin['permissions']): Promise<boolean> {
    try {
      const admin = await this.getAdminByEmail(email);
      return admin !== null && admin.isActive && admin.permissions[permission];
    } catch (error) {
      console.error('Erreur lors de la vérification des permissions:', error);
      return false;
    }
  }
}

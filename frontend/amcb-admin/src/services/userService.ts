import { collection, doc, getDocs, getDoc, query, where, orderBy, limit, startAfter, QueryDocumentSnapshot, DocumentData, Query } from 'firebase/firestore';
import { db } from './firebase';
import { User, UsersResponse, FilterOptions, PaginationParams } from '../types';

export class UserService {
  static async getUsers(
    filters: FilterOptions = {},
    pagination: PaginationParams = { page: 1, limit: 20 }
  ): Promise<UsersResponse> {
    try {
      let q: Query<DocumentData> = collection(db, 'users');
      
      // Appliquer les filtres
      if (filters.search) {
        q = query(q, where('email', '>=', filters.search), where('email', '<=', filters.search + '\uf8ff'));
      }
      
      if (filters.status && filters.status !== 'all') {
        q = query(q, where('status', '==', filters.status));
      }
      
      // Pagination
      q = query(q, orderBy('createdAt', 'desc'), limit(pagination.limit));
      
      if (pagination.page > 1) {
        // TODO: Implémenter la pagination avec startAfter
      }
      
      const querySnapshot = await getDocs(q);
      const users: User[] = [];
      
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        users.push({
          id: doc.id,
          uid: userData.uid || doc.id,
          email: userData.email || '',
          displayName: userData.displayName || '',
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          phone: userData.phone || userData.phoneNumber || '',
          country: userData.country || '',
          city: userData.city || '',
          address: userData.address || '',
          postalCode: userData.postalCode || '',
          dateOfBirth: userData.dateOfBirth || '',
          kycStatus: userData.kycStatus || 'pending',
          kycDocuments: userData.kycDocuments || [],
          status: userData.status || 'pending',
          createdAt: userData.createdAt?.toDate() || new Date(),
          lastLogin: userData.lastLogin?.toDate(),
          isEmailVerified: userData.isEmailVerified || false,
          isPhoneVerified: userData.isPhoneVerified || false,
          accounts: userData.accounts || [],
          transactions: userData.transactions || [],
        });
      });
      
      return {
        users,
        total: users.length, // TODO: Implémenter le vrai total
        hasMore: false // TODO: Implémenter la vraie logique
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
      throw new Error('Impossible de récupérer les utilisateurs');
    }
  }

  static async getUserById(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (!userDoc.exists()) {
        return null;
      }
      
      const userData = userDoc.data();
      return {
        id: userDoc.id,
        uid: userData.uid || userDoc.id,
        email: userData.email || '',
        displayName: userData.displayName || '',
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        phone: userData.phone || userData.phoneNumber || '',
        country: userData.country || '',
        city: userData.city || '',
        address: userData.address || '',
        postalCode: userData.postalCode || '',
        dateOfBirth: userData.dateOfBirth || '',
        kycStatus: userData.kycStatus || 'pending',
        kycDocuments: userData.kycDocuments || [],
        status: userData.status || 'pending',
        createdAt: userData.createdAt?.toDate() || new Date(),
        lastLogin: userData.lastLogin?.toDate(),
        isEmailVerified: userData.isEmailVerified || false,
        isPhoneVerified: userData.isPhoneVerified || false,
        accounts: userData.accounts || [],
        transactions: userData.transactions || [],
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      throw new Error('Impossible de récupérer l\'utilisateur');
    }
  }

  static async searchUsers(
    searchTerm: string,
    filters: FilterOptions = {},
    pagination: PaginationParams = { page: 1, limit: 20 }
  ): Promise<UsersResponse> {
    try {
      let q: Query<DocumentData> = collection(db, 'users');
      
      // Recherche par email, nom ou prénom
      if (searchTerm) {
        q = query(q, where('email', '>=', searchTerm), where('email', '<=', searchTerm + '\uf8ff'));
      }
      
      // Appliquer les autres filtres
      if (filters.status && filters.status !== 'all') {
        q = query(q, where('status', '==', filters.status));
      }
      
      if (filters.kycStatus && filters.kycStatus !== 'all') {
        q = query(q, where('kycStatus', '==', filters.kycStatus));
      }
      
      // Pagination
      q = query(q, orderBy('createdAt', 'desc'), limit(pagination.limit));
      
      const querySnapshot = await getDocs(q);
      const users: User[] = [];
      
      querySnapshot.forEach((doc) => {
        const userData = doc.data();
        users.push({
          id: doc.id,
          uid: userData.uid || doc.id,
          email: userData.email || '',
          displayName: userData.displayName || '',
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          phone: userData.phone || userData.phoneNumber || '',
          country: userData.country || '',
          city: userData.city || '',
          address: userData.address || '',
          postalCode: userData.postalCode || '',
          dateOfBirth: userData.dateOfBirth || '',
          kycStatus: userData.kycStatus || 'pending',
          kycDocuments: userData.kycDocuments || [],
          status: userData.status || 'pending',
          createdAt: userData.createdAt?.toDate() || new Date(),
          lastLogin: userData.lastLogin?.toDate(),
          isEmailVerified: userData.isEmailVerified || false,
          isPhoneVerified: userData.isPhoneVerified || false,
          accounts: userData.accounts || [],
          transactions: userData.transactions || [],
        });
      });
      
      return {
        users,
        total: users.length, // TODO: Implémenter le vrai total
        hasMore: false // TODO: Implémenter la vraie logique
      };
    } catch (error) {
      console.error('Erreur lors de la recherche d\'utilisateurs:', error);
      throw new Error('Impossible de rechercher les utilisateurs');
    }
  }

  // Méthode pour les statistiques utilisateur
  static async getUserStats() {
    try {
      const users = await this.getUsers();
      const totalUsers = users.users.length;
      let verifiedUsers = 0;
      let pendingKYC = 0;
      let activeUsers = 0;
      
      users.users.forEach((user) => {
        if (user.kycStatus === 'verified') {
          verifiedUsers++;
        } else if (user.kycStatus === 'pending') {
          pendingKYC++;
        }
        
        if (user.status === 'active') {
          activeUsers++;
        }
      });
      
      return {
        totalUsers,
        verifiedUsers,
        pendingKYC,
        activeUsers,
        verificationRate: totalUsers > 0 ? (verifiedUsers / totalUsers) * 100 : 0
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }
}

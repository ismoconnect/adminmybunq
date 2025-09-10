import { collection, getDocs, doc, getDoc, updateDoc, addDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';
import { BankAccount } from '../types';

export class AccountService {
  // Récupérer tous les comptes bancaires
  static async getAccounts(page: number = 1, pageSize: number = 20, filters?: any) {
    try {
      const accountsRef = collection(db, 'accounts');
      let q = query(accountsRef, orderBy('createdAt', 'desc'), limit(pageSize));
      
      // Appliquer les filtres
      if (filters?.type) {
        q = query(q, where('type', '==', filters.type));
      }
      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters?.userId) {
        q = query(q, where('userId', '==', filters.userId));
      }
      
      const snapshot = await getDocs(q);
      const accounts: BankAccount[] = [];
      
      snapshot.forEach((doc) => {
        accounts.push({
          id: doc.id,
          ...doc.data()
        } as BankAccount);
      });
      
      return {
        accounts,
        total: accounts.length,
        hasMore: accounts.length === pageSize
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des comptes:', error);
      throw error;
    }
  }

  // Récupérer un compte par ID
  static async getAccountById(accountId: string) {
    try {
      const accountDoc = await getDoc(doc(db, 'accounts', accountId));
      if (accountDoc.exists()) {
        return {
          id: accountDoc.id,
          ...accountDoc.data()
        } as BankAccount;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération du compte:', error);
      throw error;
    }
  }

  // Créer un nouveau compte
  static async createAccount(accountData: Omit<BankAccount, 'id'>) {
    try {
      const accountsRef = collection(db, 'accounts');
      const newAccount = await addDoc(accountsRef, {
        ...accountData,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active'
      });
      
      return {
        id: newAccount.id,
        ...accountData,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: 'active'
      } as BankAccount;
    } catch (error) {
      console.error('Erreur lors de la création du compte:', error);
      throw error;
    }
  }

  // Mettre à jour un compte
  static async updateAccount(accountId: string, updates: Partial<BankAccount>) {
    try {
      const accountRef = doc(db, 'accounts', accountId);
      await updateDoc(accountRef, {
        ...updates,
        updatedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du compte:', error);
      throw error;
    }
  }

  // Bloquer/Débloquer un compte
  static async toggleAccountStatus(accountId: string, newStatus: 'active' | 'blocked' | 'suspended') {
    try {
      const accountRef = doc(db, 'accounts', accountId);
      await updateDoc(accountRef, {
        status: newStatus,
        updatedAt: new Date(),
        statusChangedAt: new Date()
      });
      return true;
    } catch (error) {
      console.error('Erreur lors du changement de statut du compte:', error);
      throw error;
    }
  }

  // Récupérer les comptes d'un utilisateur
  static async getUserAccounts(userId: string) {
    try {
      const accountsRef = collection(db, 'accounts');
      const q = query(accountsRef, where('userId', '==', userId), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const accounts: BankAccount[] = [];
      snapshot.forEach((doc) => {
        accounts.push({
          id: doc.id,
          ...doc.data()
        } as BankAccount);
      });
      
      return accounts;
    } catch (error) {
      console.error('Erreur lors de la récupération des comptes utilisateur:', error);
      throw error;
    }
  }

  // Récupérer les statistiques des comptes
  static async getAccountStats() {
    try {
      const accountsRef = collection(db, 'accounts');
      const snapshot = await getDocs(accountsRef);
      
      let totalAccounts = 0;
      let activeAccounts = 0;
      let blockedAccounts = 0;
      let suspendedAccounts = 0;
      let totalBalance = 0;
      
      const accountTypes: { [key: string]: number } = {};
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        totalAccounts++;
        
        // Compter par statut
        switch (data.status) {
          case 'active':
            activeAccounts++;
            break;
          case 'blocked':
            blockedAccounts++;
            break;
          case 'suspended':
            suspendedAccounts++;
            break;
        }
        
        // Compter par type
        if (data.type) {
          accountTypes[data.type] = (accountTypes[data.type] || 0) + 1;
        }
        
        // Calculer le solde total
        if (data.balance && typeof data.balance === 'number') {
          totalBalance += data.balance;
        }
      });
      
      return {
        totalAccounts,
        activeAccounts,
        blockedAccounts,
        suspendedAccounts,
        totalBalance,
        accountTypes,
        averageBalance: totalAccounts > 0 ? totalBalance / totalAccounts : 0
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques des comptes:', error);
      throw error;
    }
  }

  // Rechercher des comptes
  static async searchAccounts(searchTerm: string) {
    try {
      const accountsRef = collection(db, 'accounts');
      const snapshot = await getDocs(accountsRef);
      const accounts: BankAccount[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (
          data.accountNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          data.iban?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          data.userId?.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          accounts.push({
            id: doc.id,
            ...data
          } as BankAccount);
        }
      });
      
      return accounts;
    } catch (error) {
      console.error('Erreur lors de la recherche de comptes:', error);
      throw error;
    }
  }
}

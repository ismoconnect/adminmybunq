import { collection, getDocs, doc, getDoc, updateDoc, query, where, orderBy, limit, startAfter } from 'firebase/firestore';
import { db } from './firebase';
import { Transaction } from '../types';

export class TransactionService {
  // Récupérer toutes les transactions
  static async getTransactions(page: number = 1, pageSize: number = 20, filters?: any) {
    try {
      const transactionsRef = collection(db, 'transactions');
      let q = query(transactionsRef, orderBy('createdAt', 'desc'), limit(pageSize));
      
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
      if (filters?.accountId) {
        q = query(q, where('accountId', '==', filters.accountId));
      }
      if (filters?.dateFrom) {
        q = query(q, where('createdAt', '>=', filters.dateFrom));
      }
      if (filters?.dateTo) {
        q = query(q, where('createdAt', '<=', filters.dateTo));
      }
      
      const snapshot = await getDocs(q);
      const transactions: Transaction[] = [];
      
      snapshot.forEach((doc) => {
        transactions.push({
          id: doc.id,
          ...doc.data()
        } as Transaction);
      });
      
      return {
        transactions,
        total: transactions.length,
        hasMore: transactions.length === pageSize
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions:', error);
      throw error;
    }
  }

  // Récupérer une transaction par ID
  static async getTransactionById(transactionId: string) {
    try {
      const transactionDoc = await getDoc(doc(db, 'transactions', transactionId));
      if (transactionDoc.exists()) {
        return {
          id: transactionDoc.id,
          ...transactionDoc.data()
        } as Transaction;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de la transaction:', error);
      throw error;
    }
  }

  // Mettre à jour le statut d'une transaction
  static async updateTransactionStatus(transactionId: string, newStatus: string, adminNotes?: string) {
    try {
      const transactionRef = doc(db, 'transactions', transactionId);
      await updateDoc(transactionRef, {
        status: newStatus,
        adminNotes: adminNotes || '',
        updatedAt: new Date(),
        reviewedBy: 'admin', // TODO: Récupérer l'ID de l'admin connecté
      });
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut de la transaction:', error);
      throw error;
    }
  }

  // Récupérer les transactions d'un utilisateur
  static async getUserTransactions(userId: string, limitCount: number = 50) {
    try {
      const transactionsRef = collection(db, 'transactions');
      const q = query(
        transactionsRef, 
        where('userId', '==', userId), 
        orderBy('createdAt', 'desc'), 
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      
      const transactions: Transaction[] = [];
      snapshot.forEach((doc) => {
        transactions.push({
          id: doc.id,
          ...doc.data()
        } as Transaction);
      });
      
      return transactions;
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions utilisateur:', error);
      throw error;
    }
  }

  // Récupérer les transactions d'un compte
  static async getAccountTransactions(accountId: string, limitCount: number = 50) {
    try {
      const transactionsRef = collection(db, 'transactions');
      const q = query(
        transactionsRef, 
        where('accountId', '==', accountId), 
        orderBy('createdAt', 'desc'), 
        limit(limitCount)
      );
      const snapshot = await getDocs(q);
      
      const transactions: Transaction[] = [];
      snapshot.forEach((doc) => {
        transactions.push({
          id: doc.id,
          ...doc.data()
        } as Transaction);
      });
      
      return transactions;
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions du compte:', error);
      throw error;
    }
  }

  // Récupérer les statistiques des transactions
  static async getTransactionStats(filters?: any) {
    try {
      const transactionsRef = collection(db, 'transactions');
      let q = query(transactionsRef);
      
      // Appliquer les filtres de date si fournis
      if (filters?.dateFrom) {
        q = query(q, where('createdAt', '>=', filters.dateFrom));
      }
      if (filters?.dateTo) {
        q = query(q, where('createdAt', '<=', filters.dateTo));
      }
      
      const snapshot = await getDocs(q);
      
      let totalTransactions = 0;
      let totalAmount = 0;
      let pendingTransactions = 0;
      let completedTransactions = 0;
      let failedTransactions = 0;
      
      const transactionTypes: { [key: string]: { count: number; amount: number } } = {};
      const dailyStats: { [key: string]: { count: number; amount: number } } = {};
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        totalTransactions++;
        
        const amount = data.amount || 0;
        totalAmount += amount;
        
        // Compter par statut
        switch (data.status) {
          case 'pending':
            pendingTransactions++;
            break;
          case 'completed':
            completedTransactions++;
            break;
          case 'failed':
            failedTransactions++;
            break;
        }
        
        // Compter par type
        if (data.type) {
          if (!transactionTypes[data.type]) {
            transactionTypes[data.type] = { count: 0, amount: 0 };
          }
          transactionTypes[data.type].count++;
          transactionTypes[data.type].amount += amount;
        }
        
        // Compter par jour
        if (data.createdAt) {
          const date = new Date(data.createdAt.toDate ? data.createdAt.toDate() : data.createdAt);
          const dateKey = date.toISOString().split('T')[0];
          
          if (!dailyStats[dateKey]) {
            dailyStats[dateKey] = { count: 0, amount: 0 };
          }
          dailyStats[dateKey].count++;
          dailyStats[dateKey].amount += amount;
        }
      });
      
      return {
        totalTransactions,
        totalAmount,
        pendingTransactions,
        completedTransactions,
        failedTransactions,
        transactionTypes,
        dailyStats,
        averageAmount: totalTransactions > 0 ? totalAmount / totalTransactions : 0,
        successRate: totalTransactions > 0 ? (completedTransactions / totalTransactions) * 100 : 0
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques des transactions:', error);
      throw error;
    }
  }

  // Rechercher des transactions
  static async searchTransactions(searchTerm: string) {
    try {
      const transactionsRef = collection(db, 'transactions');
      const snapshot = await getDocs(transactionsRef);
      const transactions: Transaction[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (
          data.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          data.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          data.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          data.accountId?.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          transactions.push({
            id: doc.id,
            ...data
          } as Transaction);
        }
      });
      
      return transactions;
    } catch (error) {
      console.error('Erreur lors de la recherche de transactions:', error);
      throw error;
    }
  }

  // Récupérer les transactions récentes pour le dashboard
  static async getRecentTransactions(limitCount: number = 10) {
    try {
      const transactionsRef = collection(db, 'transactions');
      const q = query(transactionsRef, orderBy('createdAt', 'desc'), limit(limitCount));
      const snapshot = await getDocs(q);
      
      const transactions: Transaction[] = [];
      snapshot.forEach((doc) => {
        transactions.push({
          id: doc.id,
          ...doc.data()
        } as Transaction);
      });
      
      return transactions;
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions récentes:', error);
      throw error;
    }
  }
}

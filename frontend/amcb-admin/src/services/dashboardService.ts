import { UserService } from './userService';
import { KYCService } from './kycService';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export class DashboardService {
  // Récupérer toutes les statistiques du dashboard
  static async getDashboardStats() {
    try {
      // Récupérer les utilisateurs pour calculer les statistiques
      const usersResponse = await UserService.getUsers({}, { page: 1, limit: 1000 });
      const users = usersResponse.users;
      
      // Récupérer les statistiques KYC (documents Cloudinary)
      const kycStats = await KYCService.getKYCStats();
      
      // Calculer les statistiques des utilisateurs
      const userStats = DashboardService.calculateUserStats(users);
      
      // Calculer les statistiques des comptes et transactions depuis les utilisateurs
      const accountsStats = DashboardService.calculateAccountsStats(users);
      const transactionsStats = DashboardService.calculateTransactionsStats(users);
      
      // Récupérer les transactions récentes depuis les utilisateurs
      const recentTransactions = DashboardService.getRecentTransactionsFromUsers(users, 5);

      // Calculer les statistiques globales
      const totalRevenue = transactionsStats.totalAmount;
      const totalUsers = userStats.totalUsers;
      const activeAccounts = accountsStats.activeAccounts;
      const pendingKYC = kycStats.pending;

      // Calculer les taux de croissance (comparaison avec la période précédente)
      const growthRates = {
        users: userStats.newUsersThisMonth,
        transactions: transactionsStats.newTransactionsThisMonth,
        revenue: transactionsStats.newRevenueThisMonth,
        accounts: accountsStats.newAccountsThisMonth
      };

      return {
        overview: {
          totalUsers,
          totalRevenue,
          activeAccounts,
          pendingKYC,
          totalTransactions: transactionsStats.totalTransactions,
          totalAccounts: accountsStats.totalAccounts
        },
        userStats,
        kycStats,
        accountStats: accountsStats,
        transactionStats: transactionsStats,
        recentTransactions,
        growthRates,
        charts: {
          userGrowth: DashboardService.generateUserGrowthData(userStats),
          transactionVolume: DashboardService.generateTransactionVolumeData(transactionsStats),
          accountTypes: DashboardService.generateAccountTypesData(accountsStats),
          kycStatus: DashboardService.generateKYCStatusData(kycStats)
        }
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques du dashboard:', error);
      throw error;
    }
  }

  // Calculer les statistiques des utilisateurs
  private static calculateUserStats(users: any[]) {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    const totalUsers = users.length;
    const verifiedUsers = users.filter(user => user.kycStatus === 'verified').length;
    const pendingUsers = users.filter(user => user.kycStatus === 'pending').length;
    const unverifiedUsers = users.filter(user => user.kycStatus === 'unverified').length;
    
    const newUsersThisMonth = users.filter(user => {
      const createdAt = user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt);
      return createdAt >= thisMonth;
    }).length;
    
    const newUsersLastMonth = users.filter(user => {
      const createdAt = user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt);
      return createdAt >= lastMonth && createdAt < thisMonth;
    }).length;
    
    const userGrowthRate = newUsersLastMonth > 0 ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100 : 0;
    
    // Récupérer les utilisateurs récents (10 derniers créés)
    const recentUsers = users
      .sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 10);
    
    return {
      totalUsers,
      verifiedUsers,
      pendingUsers,
      unverifiedUsers,
      newUsersThisMonth,
      newUsersLastMonth,
      userGrowthRate,
      recentUsers
    };
  }

  // Calculer les statistiques des comptes depuis les utilisateurs
  private static calculateAccountsStats(users: any[]) {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    let totalAccounts = 0;
    let activeAccounts = 0;
    let blockedAccounts = 0;
    let totalBalance = 0;
    let newAccountsThisMonth = 0;
    
    users.forEach((user) => {
      const accounts = user.accounts || [];
      
      totalAccounts += accounts.length;
      
      accounts.forEach((account: any) => {
        if (account.status === 'active') {
          activeAccounts++;
        } else if (account.status === 'blocked') {
          blockedAccounts++;
        }
        
        if (account.balance && typeof account.balance === 'number') {
          totalBalance += account.balance;
        }
        
        // Vérifier si le compte a été créé ce mois-ci
        if (account.createdAt) {
          const createdAt = account.createdAt instanceof Date ? account.createdAt : new Date(account.createdAt);
          if (createdAt >= thisMonth) {
            newAccountsThisMonth++;
          }
        }
      });
    });
    
    return {
      totalAccounts,
      activeAccounts,
      blockedAccounts,
      totalBalance,
      averageBalance: totalAccounts > 0 ? totalBalance / totalAccounts : 0,
      newAccountsThisMonth
    };
  }

  // Calculer les statistiques des transactions depuis les utilisateurs
  private static calculateTransactionsStats(users: any[]) {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    let totalTransactions = 0;
    let totalAmount = 0;
    let pendingTransactions = 0;
    let completedTransactions = 0;
    let failedTransactions = 0;
    let newTransactionsThisMonth = 0;
    let newRevenueThisMonth = 0;
    
    users.forEach((user) => {
      const transactions = user.transactions || [];
      
      totalTransactions += transactions.length;
      
      transactions.forEach((transaction: any) => {
        const amount = transaction.amount || 0;
        totalAmount += amount;
        
        switch (transaction.status) {
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
        
        // Vérifier si la transaction a été créée ce mois-ci
        if (transaction.createdAt) {
          const createdAt = transaction.createdAt instanceof Date ? transaction.createdAt : new Date(transaction.createdAt);
          if (createdAt >= thisMonth) {
            newTransactionsThisMonth++;
            newRevenueThisMonth += amount;
          }
        }
      });
    });
    
    return {
      totalTransactions,
      totalAmount,
      pendingTransactions,
      completedTransactions,
      failedTransactions,
      averageAmount: totalTransactions > 0 ? totalAmount / totalTransactions : 0,
      successRate: totalTransactions > 0 ? (completedTransactions / totalTransactions) * 100 : 0,
      newTransactionsThisMonth,
      newRevenueThisMonth
    };
  }

  // Récupérer les transactions récentes depuis les utilisateurs
  private static getRecentTransactionsFromUsers(users: any[], limitCount: number = 10) {
    const allTransactions: any[] = [];
    
    users.forEach((user) => {
      const transactions = user.transactions || [];
      
      // Ajouter l'ID utilisateur à chaque transaction
      transactions.forEach((transaction: any) => {
        allTransactions.push({
          ...transaction,
          userId: user.id,
          userName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
        });
      });
    });
    
    // Trier par date et limiter
    return allTransactions
      .sort((a, b) => {
        const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
        const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, limitCount);
  }

  // Générer les données de croissance des utilisateurs pour les graphiques
  private static generateUserGrowthData(userStats: any) {
    // Utiliser les vraies données des utilisateurs
    const days = 7;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        users: userStats.totalUsers || 0,
        newUsers: userStats.newUsersThisMonth || 0
      });
    }
    
    return data;
  }

  // Générer les données de volume des transactions pour les graphiques
  private static generateTransactionVolumeData(transactionStats: any) {
    // Utiliser les vraies données des transactions
    const days = 7;
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.push({
        date: date.toISOString().split('T')[0],
        volume: transactionStats.totalAmount || 0,
        count: transactionStats.totalTransactions || 0
      });
    }
    
    return data;
  }

  // Générer les données des types de comptes pour les graphiques
  private static generateAccountTypesData(accountStats: any) {
    return [
      { type: 'Comptes actifs', count: accountStats.activeAccounts, color: '#10b981' },
      { type: 'Comptes bloqués', count: accountStats.blockedAccounts, color: '#ef4444' }
    ];
  }

  // Générer les données du statut KYC pour les graphiques
  private static generateKYCStatusData(kycStats: any) {
    return [
      { status: 'En attente', count: kycStats.pending, color: '#f59e0b' },
      { status: 'Approuvé', count: kycStats.approved, color: '#10b981' },
      { status: 'Rejeté', count: kycStats.rejected, color: '#ef4444' },
      { status: 'Info demandée', count: kycStats.pendingInfo, color: '#3b82f6' }
    ];
  }

  // Récupérer les alertes et notifications importantes
  static async getAlerts() {
    try {
      const alerts = [];
      
      // Vérifier les KYC en attente depuis plus de 24h
      const kycStats = await KYCService.getKYCStats();
      if (kycStats.pending > 10) {
        alerts.push({
          type: 'warning',
          title: 'KYC en attente',
          message: `${kycStats.pending} soumissions KYC sont en attente de validation`,
          priority: 'medium'
        });
      }

      // Vérifier les comptes bloqués
      const accountStats = DashboardService.calculateAccountsStats([]); // This will need to be updated to fetch users first
      if (accountStats.blockedAccounts > 5) {
        alerts.push({
          type: 'danger',
          title: 'Comptes bloqués',
          message: `${accountStats.blockedAccounts} comptes sont actuellement bloqués`,
          priority: 'high'
        });
      }

      // Vérifier les transactions échouées
      const transactionStats = DashboardService.calculateTransactionsStats([]); // This will need to be updated to fetch users first
      if (transactionStats.failedTransactions > 20) {
        alerts.push({
          type: 'danger',
          title: 'Transactions échouées',
          message: `${transactionStats.failedTransactions} transactions ont échoué récemment`,
          priority: 'high'
        });
      }

      return alerts;
    } catch (error) {
      console.error('Erreur lors de la récupération des alertes:', error);
      return [];
    }
  }

  // Récupérer les activités récentes
  static async getRecentActivity(limit: number = 20) {
    try {
      const activities: any[] = [];
      
      // Récupérer les transactions récentes depuis la collection users
      const recentTransactions = DashboardService.getRecentTransactionsFromUsers([], limit / 2); // This will need to be updated to be updated to fetch users first
      recentTransactions.forEach(transaction => {
        activities.push({
          id: transaction.id,
          type: 'transaction',
          title: `Transaction ${transaction.type}`,
          description: transaction.description || `Transaction de ${transaction.amount}€`,
          timestamp: transaction.createdAt,
          status: transaction.status,
          amount: transaction.amount
        });
      });

      // Récupérer les soumissions KYC récentes
      const kycSubmissions = await KYCService.getKYCSubmissions(1, limit / 2);
      kycSubmissions.submissions.forEach(submission => {
        activities.push({
          id: submission.id,
          type: 'kyc',
          title: 'Nouvelle soumission KYC',
          description: `Document ${submission.documentType} soumis`,
          timestamp: submission.submittedAt,
          status: submission.status,
          priority: submission.priority
        });
      });

      // Trier par timestamp et limiter
      return activities
        .sort((a, b) => {
          const dateA = new Date(a.timestamp?.toDate ? a.timestamp.toDate() : a.timestamp);
          const dateB = new Date(b.timestamp?.toDate ? b.timestamp.toDate() : b.timestamp);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, limit);
    } catch (error) {
      console.error('Erreur lors de la récupération des activités récentes:', error);
      return [];
    }
  }
}

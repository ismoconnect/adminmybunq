import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardService } from '../services/dashboardService';
import { 
  Users, 
  CreditCard, 
  TrendingUp, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  DollarSign,
  Shield,
  Clock,
  UserCheck,
  UserX
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: DashboardService.getDashboardStats,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tableau de bord</h1>
            <p className="text-gray-600 mt-1">Vue d'overview de votre plateforme bancaire</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 animate-pulse">
              <div className="flex items-center">
                <div className="p-3 bg-gray-200 rounded-lg w-10 h-10 sm:w-12 sm:h-12"></div>
                <div className="ml-3 sm:ml-4 flex-1">
                  <div className="h-4 bg-gray-200 rounded w-20 sm:w-24 mb-2"></div>
                  <div className="h-6 sm:h-8 bg-gray-200 rounded w-14 sm:w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Erreur de chargement</h3>
              <p className="text-sm text-red-700 mt-1">
                Impossible de charger les données du tableau de bord. Veuillez réessayer.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  const formatDate = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGrowthIcon = (value: number) => {
    if (value > 0) {
      return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    } else if (value < 0) {
      return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  const getGrowthColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600 mt-1">Vue d'overview de votre plateforme bancaire</p>
        </div>
        <div className="text-sm text-gray-500 flex items-center space-x-2">
          <Clock className="h-4 w-4" />
          <span>Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR')}</span>
        </div>
      </div>

      {/* Cartes de statistiques principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Utilisateurs totaux */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Utilisateurs totaux</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {formatNumber(stats?.overview?.totalUsers || 0)}
                </p>
              </div>
            </div>
            {stats?.growthRates?.users !== undefined && (
              <div className={`flex items-center text-xs sm:text-sm ${getGrowthColor(stats.growthRates.users)}`}>
                {getGrowthIcon(stats.growthRates.users)}
                <span className="ml-1">
                  {stats.growthRates.users > 0 ? '+' : ''}{stats.growthRates.users}%
                </span>
              </div>
            )}
          </div>
          <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500">
            +{stats?.userStats?.newUsersThisMonth || 0} ce mois
          </div>
        </div>

        {/* Utilisateurs non vérifiés */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-red-100 rounded-lg">
                <UserX className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Utilisateurs non vérifiés</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {formatNumber(stats?.userStats?.unverifiedUsers || 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500">
            {stats?.userStats?.unverifiedUsers || 0} utilisateurs en attente
          </div>
        </div>

        {/* Utilisateurs vérifiés */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                <UserCheck className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Utilisateurs vérifiés</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {formatNumber(stats?.userStats?.verifiedUsers || 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500">
            {stats?.userStats?.verifiedUsers || 0} utilisateurs validés
          </div>
        </div>

        {/* Utilisateurs en attente */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 sm:p-3 bg-yellow-100 rounded-lg">
                <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">Utilisateurs en attente</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {formatNumber(stats?.userStats?.pendingUsers || 0)}
                </p>
              </div>
            </div>
          </div>
          <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-500">
            {stats?.userStats?.pendingUsers || 0} utilisateurs en attente de validation
          </div>
        </div>
      </div>

      {/* Section des graphiques et tendances */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Graphique des utilisateurs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Croissance des utilisateurs</h3>
          <div className="space-y-3">
            {stats?.charts?.userGrowth?.slice(-7).map((day: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-gray-600">{day.date}</span>
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <span className="text-xs sm:text-sm font-medium">{day.users} utilisateurs</span>
                  <div className="w-16 sm:w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(day.users / (stats?.overview?.totalUsers || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Graphique des transactions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Volume des transactions</h3>
          <div className="space-y-3">
            {stats?.charts?.transactionVolume?.slice(-7).map((day: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-xs sm:text-sm text-gray-600">{day.date}</span>
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <span className="text-xs sm:text-sm font-medium">{formatCurrency(day.volume)}</span>
                  <div className="w-16 sm:w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${(day.volume / (stats?.overview?.totalRevenue || 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 transition-all text-left group">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-medium text-gray-900">Ajouter un utilisateur</h4>
                <p className="text-xs sm:text-sm text-gray-500">Créer un nouveau compte utilisateur</p>
              </div>
            </div>
          </button>
          
          <button className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-yellow-300 transition-all text-left group">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-medium text-gray-900">Vérifier KYC</h4>
                <p className="text-xs sm:text-sm text-gray-500">Examiner les soumissions KYC en attente</p>
              </div>
            </div>
          </button>
          
          <button className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-green-300 transition-all text-left group">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-medium text-gray-900">Générer un rapport</h4>
                <p className="text-xs sm:text-sm text-gray-500">Accéder aux rapports financiers et d'utilisateurs</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Nouveaux utilisateurs */}
      {stats?.userStats && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Nouveaux utilisateurs</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut KYC
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date de création
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.userStats.recentUsers?.slice(0, 10).map((user: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {user.firstName?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email || 'Utilisateur inconnu'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email || 'N/A'}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.kycStatus === 'verified' ? 'bg-green-100 text-green-800' :
                        user.kycStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {user.kycStatus === 'verified' ? 'Vérifié' :
                         user.kycStatus === 'pending' ? 'En attente' : 'Non vérifié'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.createdAt ? formatDate(user.createdAt) : 'Date inconnue'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;


import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, Plus, CreditCard, Eye, Edit, Trash2, Lock, Unlock, Euro, TrendingUp, TrendingDown } from 'lucide-react';
import { AccountService } from '../services/accountService';
import { BankAccount } from '../types';
import { PermissionGuard } from '../components/PermissionGuard';

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (accountData: Partial<BankAccount>) => void;
}

const CreateAccountModal: React.FC<CreateAccountModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    userId: '',
    accountType: 'current' as 'current' | 'savings' | 'credit',
    currency: 'EUR',
    initialBalance: 0,
    accountName: '',
    accountNumber: '',
    status: 'active' as 'active' | 'suspended' | 'closed' | 'pending'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-11/12 max-w-2xl overflow-hidden">
        <div className="bg-primary-600 text-white p-6">
          <h2 className="text-2xl font-bold">Créer un nouveau compte</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">ID Utilisateur</label>
              <input
                type="text"
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Type de compte</label>
              <select
                value={formData.accountType}
                onChange={(e) => setFormData({ ...formData, accountType: e.target.value as 'current' | 'savings' | 'credit' })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="current">Compte courant</option>
                <option value="savings">Compte épargne</option>
                <option value="credit">Compte de crédit</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Devise</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CHF">CHF</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Solde initial</label>
              <input
                type="number"
                step="0.01"
                value={formData.initialBalance}
                onChange={(e) => setFormData({ ...formData, initialBalance: parseFloat(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Nom du compte</label>
              <input
                type="text"
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Numéro de compte</label>
              <input
                type="text"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                placeholder="**** **** **** ****"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Créer le compte
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Accounts: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const { data: accounts, isLoading, error } = useQuery({
    queryKey: ['accounts', searchTerm, typeFilter, statusFilter],
    queryFn: () => AccountService.getAccounts(1, 20, { 
      search: searchTerm, 
      type: typeFilter === 'all' ? undefined : typeFilter,
      status: statusFilter === 'all' ? undefined : statusFilter
    })
  });

  const handleCreateAccount = (accountData: Partial<BankAccount>) => {
    // Ici vous appelleriez AccountService.createAccount(accountData)
    console.log('Création du compte:', accountData);
  };

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case 'checking': return <CreditCard className="h-5 w-5 text-blue-600" />;
      case 'savings': return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'credit': return <TrendingDown className="h-5 w-5 text-red-600" />;
      case 'business': return <CreditCard className="h-5 w-5 text-purple-600" />;
      default: return <CreditCard className="h-5 w-5 text-gray-600" />;
    }
  };

  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case 'checking': return 'Compte courant';
      case 'savings': return 'Compte épargne';
      case 'credit': return 'Compte de crédit';
      case 'business': return 'Compte professionnel';
      default: return type;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-xl mb-4">Erreur lors du chargement des comptes</div>
        <div className="text-gray-600">{error.message}</div>
      </div>
    );
  }

  const totalBalance = accounts?.accounts?.reduce((sum: number, account: any) => sum + account.balance, 0) || 0;
  const activeAccounts = accounts?.accounts?.filter((account: any) => account.status === 'active').length || 0;
  const totalAccounts = accounts?.accounts?.length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des comptes</h1>
          <p className="text-gray-600">Gérez tous les comptes bancaires de la plateforme</p>
        </div>
        <div className="flex items-center space-x-3">
          <PermissionGuard permission="accounts.create">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Nouveau compte</span>
            </button>
          </PermissionGuard>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Euro className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Solde total</p>
              <p className="text-2xl font-semibold text-gray-900">
                {totalBalance.toLocaleString('fr-FR')} €
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Comptes actifs</p>
              <p className="text-2xl font-semibold text-gray-900">{activeAccounts}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total comptes</p>
              <p className="text-2xl font-semibold text-gray-900">{totalAccounts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Rechercher par nom, numéro ou utilisateur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <div className="flex space-x-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Tous les types</option>
              <option value="checking">Compte courant</option>
              <option value="savings">Compte épargne</option>
              <option value="credit">Compte de crédit</option>
              <option value="business">Compte professionnel</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="inactive">Inactif</option>
              <option value="suspended">Suspendu</option>
              <option value="closed">Fermé</option>
            </select>
            <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filtres</span>
            </button>
          </div>
        </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Compte
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Solde
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière activité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {accounts?.accounts?.map((account: any) => (
                <tr key={account.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{account.name}</div>
                      <div className="text-sm text-gray-500">{account.accountNumber}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getAccountTypeIcon(account.name)}
                      <span className="ml-2 text-sm text-gray-900">
                        {getAccountTypeLabel(account.name)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="font-semibold">
                      {account.balance.toLocaleString('fr-FR')} {account.currency}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      account.status === 'active' ? 'bg-green-100 text-green-800' :
                      account.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                      account.status === 'suspended' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {account.status === 'active' && <Unlock className="h-3 w-3 mr-1" />}
                      {account.status === 'suspended' && <Lock className="h-3 w-3 mr-1" />}
                      {account.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {account.lastActivity ? new Date(account.lastActivity).toLocaleDateString('fr-FR') : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-primary-600 hover:text-primary-900 bg-primary-50 hover:bg-primary-100 px-3 py-1 rounded-md transition-colors">
                        <Eye className="h-4 w-4 inline mr-1" />
                        Voir
                      </button>
                      <button className="text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 px-3 py-1 rounded-md transition-colors">
                        <Edit className="h-4 w-4 inline mr-1" />
                        Modifier
                      </button>
                      {account.status === 'active' ? (
                        <button className="text-yellow-600 hover:text-yellow-900 bg-yellow-50 hover:bg-yellow-100 px-3 py-1 rounded-md transition-colors">
                          <Lock className="h-4 w-4 inline mr-1" />
                          Suspendre
                        </button>
                      ) : (
                        <button className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md transition-colors">
                          <Unlock className="h-4 w-4 inline mr-1" />
                          Activer
                        </button>
                      )}
                      <button className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors">
                        <Trash2 className="h-4 w-4 inline mr-1" />
                        Fermer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Account Modal */}
      <CreateAccountModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateAccount}
      />
    </div>
  );
};

export default Accounts;

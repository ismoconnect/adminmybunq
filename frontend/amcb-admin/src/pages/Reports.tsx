import React, { useState } from 'react';

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', name: 'Vue d\'ensemble', count: 0 },
    { id: 'users', name: 'Utilisateurs', count: 0 },
    { id: 'financial', name: 'Financier', count: 0 },
    { id: 'kyc', name: 'KYC', count: 0 },
  ];

  const renderOverviewTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Utilisateurs totaux</h3>
          <p className="text-3xl font-bold text-blue-600">11</p>
          <p className="text-sm text-gray-500 mt-1">+2 ce mois</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">KYC en attente</h3>
          <p className="text-3xl font-bold text-yellow-600">27</p>
          <p className="text-sm text-gray-500 mt-1">-5 cette semaine</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Comptes actifs</h3>
          <p className="text-3xl font-bold text-green-600">0</p>
          <p className="text-sm text-gray-500 mt-1">En attente de vérification</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Volume mensuel</h3>
          <p className="text-3xl font-bold text-purple-600">0€</p>
          <p className="text-sm text-gray-500 mt-1">Aucune transaction</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Graphiques et tendances</h3>
        <div className="text-center py-12">
          <div className="text-gray-500">
            <p>Les graphiques et tendances apparaîtront ici</p>
            <p className="text-sm mt-2">Intégration avec Recharts en cours</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsersTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Rapports utilisateurs</h3>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Exporter PDF
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <div className="text-gray-500">
            <p>Rapports détaillés des utilisateurs</p>
            <p className="text-sm mt-2">Statistiques d'inscription, activité, etc.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderFinancialTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Rapports financiers</h3>
        <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
          Exporter Excel
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <div className="text-gray-500">
            <p>Rapports financiers détaillés</p>
            <p className="text-sm mt-2">Transactions, revenus, frais, etc.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderKYCTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Rapports KYC</h3>
        <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
          Générer rapport
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <div className="text-gray-500">
            <p>Statistiques et rapports KYC</p>
            <p className="text-sm mt-2">Taux de complétion, délais, etc.</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Rapports & Analytics</h1>
        <p className="text-gray-600 mt-1">
          Analysez les performances et générez des rapports détaillés
        </p>
      </div>

      {/* Onglets */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
              <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'overview' && renderOverviewTab()}
      {activeTab === 'users' && renderUsersTab()}
      {activeTab === 'financial' && renderFinancialTab()}
      {activeTab === 'kyc' && renderKYCTab()}
    </div>
  );
};

export default Reports;

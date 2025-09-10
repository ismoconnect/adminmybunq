import React, { useState } from 'react';

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', name: 'Général', count: 0 },
    { id: 'security', name: 'Sécurité', count: 0 },
    { id: 'notifications', name: 'Notifications', count: 0 },
    { id: 'integrations', name: 'Intégrations', count: 0 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Configuration</h1>
        <p className="text-gray-600 mt-1">
          Gérez les paramètres de votre plateforme bancaire
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
      {activeTab === 'general' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Paramètres généraux</h3>
          <p className="text-gray-500">Configuration de la plateforme en cours...</p>
        </div>
      )}
      
      {activeTab === 'security' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Paramètres de sécurité</h3>
          <p className="text-gray-500">Configuration de la sécurité en cours...</p>
        </div>
      )}
      
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Paramètres de notifications</h3>
          <p className="text-gray-500">Configuration des notifications en cours...</p>
        </div>
      )}
      
      {activeTab === 'integrations' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Intégrations tierces</h3>
          <p className="text-gray-500">Configuration des intégrations en cours...</p>
        </div>
      )}
    </div>
  );
};

export default Settings;

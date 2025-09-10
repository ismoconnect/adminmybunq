import React, { useState } from 'react';
import ChatList from '../components/ChatList';
import ChatInterface from '../components/ChatInterface';
import ChatStats from '../components/ChatStats';
import CreateChatModal from '../components/CreateChatModal';
import { Chat } from '../types';



const Support: React.FC = () => {
  const [activeTab, setActiveTab] = useState('chats');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const tabs = [
    { id: 'chats', name: 'Chats', count: 0 },
  ];

  const handleChatSelect = (chat: Chat) => {
    setSelectedChat(chat);
  };

  const handleChatCreated = (chatId: string) => {
    // Le chat sera automatiquement affiché dans la liste grâce aux mises à jour en temps réel
    console.log('Nouveau chat créé:', chatId);
  };



  const renderChatsTab = () => (
    <div className="space-y-6">
      {/* Statistiques */}
      <ChatStats />
      
      {/* Interface de chat */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="h-[600px] flex flex-col lg:flex-row">
          {/* Liste des chats */}
          <div className="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <button 
                onClick={() => setShowCreateModal(true)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Créer un nouveau chat
              </button>
            </div>
            <ChatList 
              onChatSelect={handleChatSelect}
              selectedChatId={selectedChat?.id}
            />
          </div>
          
          {/* Interface de chat */}
          <div className="w-full lg:w-2/3">
            <ChatInterface chat={selectedChat} />
          </div>
        </div>
      </div>
    </div>
  );



  return (
    <div className="p-4 lg:p-6 space-y-4 lg:space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Gestion des Chats</h1>
        <p className="text-gray-600 mt-1 text-sm lg:text-base">
          Gérez les conversations avec vos utilisateurs en temps réel
        </p>
      </div>

      {/* Onglets */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-4 lg:space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
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
      {activeTab === 'chats' && renderChatsTab()}

      {/* Modal de création de chat */}
      <CreateChatModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onChatCreated={handleChatCreated}
      />
    </div>
  );
};

export default Support;

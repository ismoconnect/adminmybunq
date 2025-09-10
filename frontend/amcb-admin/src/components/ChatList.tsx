import React, { useState, useEffect } from 'react';
import { Chat } from '../types';
import { ChatService } from '../services/chatService';

interface ChatListProps {
  onChatSelect: (chat: Chat) => void;
  selectedChatId?: string;
}

const ChatList: React.FC<ChatListProps> = ({ onChatSelect, selectedChatId }) => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'waiting' | 'closed' | 'resolved'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    try {
      const unsubscribe = ChatService.subscribeToChats((updatedChats) => {
        setChats(updatedChats);
        setLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Erreur lors de l\'écoute des chats:', error);
      setLoading(false);
    }
  }, []);

  const filteredChats = chats.filter(chat => {
    const matchesFilter = filter === 'all' || chat.status === filter;
    const matchesSearch = searchTerm === '' || 
      chat.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const getStatusColor = (status: Chat['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'waiting': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'resolved': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: Chat['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${diffInMinutes}m`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Filtres et recherche */}
      <div className="p-3 lg:p-4 border-b border-gray-200">
        <div className="mb-3">
          <input
            type="text"
            placeholder="Rechercher un chat..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
        </div>
        
        <div className="flex flex-wrap gap-1 lg:gap-2">
          {(['all', 'active', 'waiting', 'closed', 'resolved'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-2 lg:px-3 py-1 text-xs lg:text-sm rounded-md ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'Tous' : 
               status === 'active' ? 'Actifs' :
               status === 'waiting' ? 'En attente' :
               status === 'closed' ? 'Fermés' : 'Résolus'}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des chats */}
      <div className="flex-1 overflow-y-auto">
        {filteredChats.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchTerm ? 'Aucun chat trouvé' : 'Aucun chat disponible'}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => onChatSelect(chat)}
                className={`p-3 lg:p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedChatId === chat.id ? 'bg-blue-50 border-r-2 border-blue-600' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {chat.userName}
                      </h3>
                      {chat.unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                          {chat.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 truncate">{chat.subject}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span className="text-xs text-gray-500">
                      {formatTime(chat.lastMessageTimestamp || chat.updatedAt)}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(chat.status)}`}>
                        {chat.status === 'active' ? 'Actif' :
                         chat.status === 'waiting' ? 'En attente' :
                         chat.status === 'closed' ? 'Fermé' : 'Résolu'}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(chat.priority)}`}>
                        {chat.priority === 'urgent' ? 'Urgent' :
                         chat.priority === 'high' ? 'Élevée' :
                         chat.priority === 'medium' ? 'Moyenne' : 'Faible'}
                      </span>
                    </div>
                  </div>
                </div>
                
                {chat.lastMessage && (
                  <div className="text-xs text-gray-500 truncate">
                    💬 {typeof chat.lastMessage === 'string' ? chat.lastMessage : 'Message...'}
                  </div>
                )}
                
                {chat.assignedTo && (
                  <div className="text-xs text-gray-400 mt-1">
                    Assigné à: {chat.assignedToName}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;

import React, { useState, useEffect } from 'react';
import { ChatService } from '../services/chatService';

interface ChatStats {
  total: number;
  active: number;
  waiting: number;
  closed: number;
  resolved: number;
  urgent: number;
  high: number;
  unassigned: number;
}

const ChatStats: React.FC = () => {
  const [stats, setStats] = useState<ChatStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const chatStats = await ChatService.getChatStats();
        setStats(chatStats);
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
    
    // Recharger les stats toutes les 30 secondes
    const interval = setInterval(loadStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center text-gray-500 py-4">
        Impossible de charger les statistiques
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 lg:gap-4 mb-6">
      {/* Total des chats */}
      <div className="bg-white p-3 lg:p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg">
            <svg className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div className="ml-3 lg:ml-4">
            <p className="text-xs lg:text-sm font-medium text-gray-600">Total</p>
            <p className="text-lg lg:text-2xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>
      </div>

      {/* Chats actifs */}
      <div className="bg-white p-3 lg:p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center">
          <div className="p-2 bg-green-100 rounded-lg">
            <svg className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3 lg:ml-4">
            <p className="text-xs lg:text-sm font-medium text-gray-600">Actifs</p>
            <p className="text-lg lg:text-2xl font-bold text-gray-900">{stats.active}</p>
          </div>
        </div>
      </div>

      {/* Chats en attente */}
      <div className="bg-white p-3 lg:p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <svg className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3 lg:ml-4">
            <p className="text-xs lg:text-sm font-medium text-gray-600">En attente</p>
            <p className="text-lg lg:text-2xl font-bold text-gray-900">{stats.waiting}</p>
          </div>
        </div>
      </div>

      {/* Chats urgents */}
      <div className="bg-white p-3 lg:p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center">
          <div className="p-2 bg-red-100 rounded-lg">
            <svg className="w-5 h-5 lg:w-6 lg:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="ml-3 lg:ml-4">
            <p className="text-xs lg:text-sm font-medium text-gray-600">Urgents</p>
            <p className="text-lg lg:text-2xl font-bold text-gray-900">{stats.urgent}</p>
          </div>
        </div>
      </div>

      {/* Chats non assignés */}
      <div className="bg-white p-3 lg:p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center">
          <div className="p-2 bg-gray-100 rounded-lg">
            <svg className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="ml-3 lg:ml-4">
            <p className="text-xs lg:text-sm font-medium text-gray-600">Non assignés</p>
            <p className="text-lg lg:text-2xl font-bold text-gray-900">{stats.unassigned}</p>
          </div>
        </div>
      </div>

      {/* Chats fermés */}
      <div className="bg-white p-3 lg:p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center">
          <div className="p-2 bg-gray-100 rounded-lg">
            <svg className="w-5 h-5 lg:w-6 lg:h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div className="ml-3 lg:ml-4">
            <p className="text-xs lg:text-sm font-medium text-gray-600">Fermés</p>
            <p className="text-lg lg:text-2xl font-bold text-gray-900">{stats.closed}</p>
          </div>
        </div>
      </div>

      {/* Chats résolus */}
      <div className="bg-white p-3 lg:p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center">
          <div className="p-2 bg-blue-100 rounded-lg">
            <svg className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className="ml-3 lg:ml-4">
            <p className="text-xs lg:text-sm font-medium text-gray-600">Résolus</p>
            <p className="text-lg lg:text-2xl font-bold text-gray-900">{stats.resolved}</p>
          </div>
        </div>
      </div>

      {/* Chats haute priorité */}
      <div className="bg-white p-3 lg:p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center">
          <div className="p-2 bg-orange-100 rounded-lg">
            <svg className="w-5 h-5 lg:w-6 lg:h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="ml-3 lg:ml-4">
            <p className="text-xs lg:text-sm font-medium text-gray-600">Haute priorité</p>
            <p className="text-lg lg:text-2xl font-bold text-gray-900">{stats.high}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatStats;

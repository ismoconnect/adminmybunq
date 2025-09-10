import React, { useState, useEffect, useRef } from 'react';
import { Chat, ChatMessage } from '../types';
import { ChatService } from '../services/chatService';
import { auth } from '../services/firebase';
import ChatParticipants from './ChatParticipants';

interface ChatInterfaceProps {
  chat: Chat | null;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ chat }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chat) {
      setLoading(true);
      const unsubscribe = ChatService.subscribeToChatMessages(chat.id, (updatedMessages) => {
        setMessages(updatedMessages);
        setLoading(false);
      });

      // Marquer les messages comme lus
      if (auth.currentUser) {
        ChatService.markMessagesAsRead(chat.id, auth.currentUser.uid).catch(error => {
          console.warn('Impossible de marquer les messages comme lus:', error);
        });
      }

      return () => unsubscribe();
    }
  }, [chat]);

  useEffect(() => {
    if (chat) {
      setNotes(chat.notes || '');
    }
  }, [chat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!chat || !newMessage.trim() || !auth.currentUser) return;

    setSending(true);
    try {
      await ChatService.sendMessage({
        chatId: chat.id,
        senderId: auth.currentUser.uid,
        senderType: 'admin',
        senderName: auth.currentUser.displayName || 'Admin',
        content: newMessage.trim(),
        read: false
      });
      setNewMessage('');
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleStatusChange = async (newStatus: Chat['status']) => {
    if (!chat) return;
    
    try {
      await ChatService.updateChatStatus(chat.id, newStatus, auth.currentUser?.uid);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  const handlePriorityChange = async (newPriority: Chat['priority']) => {
    if (!chat) return;
    
    try {
      await ChatService.updateChatPriority(chat.id, newPriority);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la priorité:', error);
    }
  };

  const handleAssignToMe = async () => {
    if (!chat || !auth.currentUser) return;
    
    try {
      await ChatService.assignChat(chat.id, auth.currentUser.uid, auth.currentUser.displayName || 'Admin');
    } catch (error) {
      console.error('Erreur lors de l\'assignation:', error);
    }
  };

  const handleSaveNotes = async () => {
    if (!chat) return;
    
    try {
      await ChatService.updateChatNotes(chat.id, notes);
      setShowNotes(false);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des notes:', error);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!chat) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <p>Sélectionnez un chat pour commencer</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* En-tête du chat */}
      <div className="p-3 lg:p-4 border-b border-gray-200 bg-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-2 space-y-2 lg:space-y-0">
          <div>
            <h2 className="text-base lg:text-lg font-semibold text-gray-900">{chat.userName}</h2>
            <p className="text-xs lg:text-sm text-gray-600">{chat.userEmail}</p>
          </div>
          <div className="flex flex-wrap items-center gap-1 lg:gap-2">
            <span className={`px-2 py-1 text-xs rounded-full ${
              chat.status === 'active' ? 'bg-green-100 text-green-800' :
              chat.status === 'waiting' ? 'bg-yellow-100 text-yellow-800' :
              chat.status === 'closed' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {chat.status === 'active' ? 'Actif' :
               chat.status === 'waiting' ? 'En attente' :
               chat.status === 'closed' ? 'Fermé' : 'Résolu'}
            </span>
            <span className={`px-2 py-1 text-xs rounded-full ${
              chat.priority === 'urgent' ? 'bg-red-100 text-red-800' :
              chat.priority === 'high' ? 'bg-orange-100 text-orange-800' :
              chat.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
            }`}>
              {chat.priority === 'urgent' ? 'Urgent' :
               chat.priority === 'high' ? 'Élevée' :
               chat.priority === 'medium' ? 'Moyenne' : 'Faible'}
            </span>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-2 lg:space-y-0">
          <p className="text-sm text-gray-700">{chat.subject}</p>
          <div className="flex flex-wrap items-center gap-2">
            <ChatParticipants chat={chat} />
            {!chat.assignedTo && (
              <button
                onClick={handleAssignToMe}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                M'assigner
              </button>
            )}
            {chat.assignedTo && (
              <span className="text-xs text-gray-600">
                Assigné à: {chat.assignedToName}
              </span>
            )}
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="px-3 py-1 text-xs bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Notes
            </button>
          </div>
        </div>

        {/* Contrôles rapides */}
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <select
            value={chat.status}
            onChange={(e) => handleStatusChange(e.target.value as Chat['status'])}
            className="px-2 py-1 text-xs border border-gray-300 rounded-md"
          >
            <option value="active">Actif</option>
            <option value="waiting">En attente</option>
            <option value="closed">Fermé</option>
            <option value="resolved">Résolu</option>
          </select>
          
          <select
            value={chat.priority}
            onChange={(e) => handlePriorityChange(e.target.value as Chat['priority'])}
            className="px-2 py-1 text-xs border border-gray-300 rounded-md"
          >
            <option value="low">Faible</option>
            <option value="medium">Moyenne</option>
            <option value="high">Élevée</option>
            <option value="urgent">Urgente</option>
          </select>
        </div>

        {/* Notes */}
        {showNotes && (
          <div className="mt-3 p-3 bg-gray-50 rounded-md">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes internes..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={() => setShowNotes(false)}
                className="px-3 py-1 text-xs bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveNotes}
                className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 lg:p-4 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>Aucun message pour le moment</p>
            <p className="text-sm">Commencez la conversation</p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderType === 'admin' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.senderType === 'admin'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                                         <span className="text-xs font-medium">
                       {message.senderType === 'admin' ? '🛡️ Admin' : '👤 ' + (message.senderName || 'Utilisateur')}
                     </span>
                    <span className="text-xs opacity-75">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                                     <p className="text-sm whitespace-pre-wrap">
                     {typeof (message.content || message.text) === 'string' 
                       ? (message.content || message.text) 
                       : 'Message...'}
                   </p>
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {message.attachments.map((attachment, index) => (
                        <div key={index} className="text-xs opacity-75">
                          📎 {attachment.fileName}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Zone de saisie */}
      <div className="p-3 lg:p-4 border-t border-gray-200 bg-white">
        <div className="flex space-x-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Tapez votre message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
            rows={2}
            disabled={sending}
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className="px-3 lg:px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              'Envoyer'
            )}
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Appuyez sur Entrée pour envoyer, Shift+Entrée pour une nouvelle ligne
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;

import React, { useState } from 'react';
import { ChatService } from '../services/chatService';
import { Chat } from '../types';

interface CreateChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChatCreated: (chatId: string) => void;
}

const CreateChatModal: React.FC<CreateChatModalProps> = ({ isOpen, onClose, onChatCreated }) => {
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    subject: '',
    category: 'general' as Chat['category'],
    priority: 'medium' as Chat['priority'],
    initialMessage: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.userName || !formData.userEmail || !formData.subject) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setLoading(true);
    try {
      // Créer le chat
      const chatId = await ChatService.createChat({
        userId: 'test-user-' + Date.now(), // ID temporaire pour les tests
        userName: formData.userName,
        userEmail: formData.userEmail,
        status: 'waiting',
        priority: formData.priority,
        subject: formData.subject,
        category: formData.category,
        unreadCount: 0
      });

      // Si un message initial est fourni, l'envoyer
      if (formData.initialMessage.trim()) {
        await ChatService.sendMessage({
          chatId,
          senderId: 'test-user-' + Date.now(),
          senderType: 'user',
          senderName: formData.userName,
          content: formData.initialMessage.trim(),
          read: false
        });
      }

      onChatCreated(chatId);
      onClose();
      
      // Réinitialiser le formulaire
      setFormData({
        userName: '',
        userEmail: '',
        subject: '',
        category: 'general',
        priority: 'medium',
        initialMessage: ''
      });
    } catch (error) {
      console.error('Erreur lors de la création du chat:', error);
      alert('Erreur lors de la création du chat');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Créer un nouveau chat</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de l'utilisateur *
            </label>
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email de l'utilisateur *
            </label>
            <input
              type="email"
              name="userEmail"
              value={formData.userEmail}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sujet *
            </label>
            <input
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="general">Général</option>
                <option value="technical">Technique</option>
                <option value="billing">Facturation</option>
                <option value="kyc">KYC</option>
                <option value="transaction">Transaction</option>
                <option value="other">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priorité
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Faible</option>
                <option value="medium">Moyenne</option>
                <option value="high">Élevée</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message initial (optionnel)
            </label>
            <textarea
              name="initialMessage"
              value={formData.initialMessage}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Premier message de l'utilisateur..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Création...' : 'Créer le chat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateChatModal;

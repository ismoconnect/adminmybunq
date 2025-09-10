import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { Chat, ChatMessage } from '../types';

// Collection references
const CHATS_COLLECTION = 'chats';

export class ChatService {
  // Récupérer tous les chats (optimisé)
  static async getAllChats(): Promise<Chat[]> {
    try {
      const q = query(
        collection(db, CHATS_COLLECTION),
        orderBy('updatedAt', 'desc'),
        limit(50) // Limiter pour les performances
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId || '',
          userName: data.userName || 'Utilisateur',
          userEmail: data.userEmail || '',
          status: data.status || 'active',
          priority: data.priority || 'medium',
          subject: data.title || data.subject || '', // Utiliser 'title' de votre structure
          category: data.topic || data.category || 'general', // Utiliser 'topic' de votre structure
          participants: data.participants || [],
          lastMessage: typeof data.lastMessage === 'string' ? data.lastMessage : '',
          lastMessageTimestamp: data.lastMessageTimestamp?.toDate(),
          unreadCount: data.unreadCount || 0,
          assignedTo: data.assignedTo,
          assignedToName: data.assignedToName,
          notes: data.notes,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          closedAt: data.closedAt?.toDate(),
          closedBy: data.closedBy,
          tags: data.tags || []
        } as Chat;
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des chats:', error);
      throw error;
    }
  }

  // Récupérer les chats par statut
  static async getChatsByStatus(status: Chat['status']): Promise<Chat[]> {
    try {
      const q = query(
        collection(db, CHATS_COLLECTION),
        where('status', '==', status),
        orderBy('updatedAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId || '',
          userName: data.userName || 'Utilisateur',
          userEmail: data.userEmail || '',
          status: data.status || 'active',
          priority: data.priority || 'medium',
          subject: data.title || data.subject || '',
          category: data.topic || data.category || 'general',
          participants: data.participants || [],
          lastMessage: typeof data.lastMessage === 'string' ? data.lastMessage : '',
          lastMessageTimestamp: data.lastMessageTimestamp?.toDate(),
          unreadCount: data.unreadCount || 0,
          assignedTo: data.assignedTo,
          assignedToName: data.assignedToName,
          notes: data.notes,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          closedAt: data.closedAt?.toDate(),
          closedBy: data.closedBy,
          tags: data.tags || []
        } as Chat;
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des chats par statut:', error);
      throw error;
    }
  }

  // Récupérer un chat par ID
  static async getChatById(chatId: string): Promise<Chat | null> {
    try {
      const docRef = doc(db, CHATS_COLLECTION, chatId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          userId: data.userId || '',
          userName: data.userName || 'Utilisateur',
          userEmail: data.userEmail || '',
          status: data.status || 'active',
          priority: data.priority || 'medium',
          subject: data.title || data.subject || '',
          category: data.topic || data.category || 'general',
          participants: data.participants || [],
          lastMessage: typeof data.lastMessage === 'string' ? data.lastMessage : '',
          lastMessageTimestamp: data.lastMessageTimestamp?.toDate(),
          unreadCount: data.unreadCount || 0,
          assignedTo: data.assignedTo,
          assignedToName: data.assignedToName,
          notes: data.notes,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          closedAt: data.closedAt?.toDate(),
          closedBy: data.closedBy,
          tags: data.tags || []
        } as Chat;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération du chat:', error);
      throw error;
    }
  }

  // Récupérer les messages d'un chat (sous-collection optimisé)
  static async getChatMessages(chatId: string): Promise<ChatMessage[]> {
    try {
      const messagesRef = collection(db, CHATS_COLLECTION, chatId, 'messages');
      const q = query(
        messagesRef, 
        orderBy('timestamp', 'asc'),
        limit(100) // Limiter pour les performances
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          chatId: chatId,
          senderId: data.senderId || '',
          senderType: data.senderId === 'admin' || data.senderId === 'support' ? 'admin' : 'user',
          senderName: data.senderId === 'admin' || data.senderId === 'support' ? 'Admin' : 'Utilisateur',
          content: data.text || data.content || '',
          text: data.text || data.content || '',
          timestamp: data.timestamp?.toDate() || new Date(),
          read: data.status === 'read',
          status: data.status || 'sent',
          type: data.type || 'text',
          readAt: data.readAt?.toDate(),
          attachments: data.attachments || []
        } as ChatMessage;
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
      throw error;
    }
  }

  // Créer un nouveau chat (compatible avec la structure client)
  static async createChat(chatData: Omit<Chat, 'id' | 'createdAt' | 'updatedAt' | 'unreadCount'>): Promise<string> {
    try {
      const chatRef = await addDoc(collection(db, CHATS_COLLECTION), {
        ...chatData,
        participants: chatData.participants || [chatData.userId, 'support'],
        unreadCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return chatRef.id;
    } catch (error) {
      console.error('Erreur lors de la création du chat:', error);
      throw error;
    }
  }

  // Envoyer un message (compatible avec la structure client)
  static async sendMessage(messageData: Omit<ChatMessage, 'id' | 'timestamp'> & { chatId: string }): Promise<string> {
    try {
      const messagesRef = collection(db, CHATS_COLLECTION, messageData.chatId, 'messages');
      const messageRef = await addDoc(messagesRef, {
        text: messageData.content, // Compatible avec la structure client
        senderId: messageData.senderId,
        timestamp: serverTimestamp(),
        status: 'sent',
        type: 'text'
      });

      // Mettre à jour le chat avec le dernier message
      const chatRef = doc(db, CHATS_COLLECTION, messageData.chatId);
      await updateDoc(chatRef, {
        lastMessage: messageData.content, // Garder comme string simple
        lastMessageTimestamp: serverTimestamp(), // Ajouter le timestamp du dernier message
        updatedAt: serverTimestamp(),
        unreadCount: messageData.senderType === 'user' ? 1 : 0
      });

      return messageRef.id;
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      throw error;
    }
  }

  // Marquer les messages comme lus
  static async markMessagesAsRead(chatId: string, adminId: string): Promise<void> {
    try {
      const messagesRef = collection(db, CHATS_COLLECTION, chatId, 'messages');
      // Utiliser un seul filtre pour éviter l'erreur Firestore
      const q = query(
        messagesRef,
        where('senderId', '!=', 'admin')
      );
      const querySnapshot = await getDocs(q);
      
      const batch = querySnapshot.docs
        .filter(doc => doc.data().status !== 'read') // Filtrer côté client
        .map(doc => 
          updateDoc(doc.ref, {
            status: 'read'
          })
        );

      if (batch.length > 0) {
        await Promise.all(batch);
      }

      // Mettre à jour le compteur de messages non lus dans le chat
      const chatRef = doc(db, CHATS_COLLECTION, chatId);
      await updateDoc(chatRef, {
        unreadCount: 0,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erreur lors du marquage des messages comme lus:', error);
      // Ne pas throw l'erreur pour éviter de casser l'interface
    }
  }

  // Assigner un chat à un admin
  static async assignChat(chatId: string, adminId: string, adminName: string): Promise<void> {
    try {
      const chatRef = doc(db, CHATS_COLLECTION, chatId);
      await updateDoc(chatRef, {
        assignedTo: adminId,
        assignedToName: adminName,
        participants: [adminId, 'support'], // Ajouter l'admin aux participants
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erreur lors de l\'assignation du chat:', error);
      throw error;
    }
  }

  // Changer le statut d'un chat
  static async updateChatStatus(chatId: string, status: Chat['status'], adminId?: string): Promise<void> {
    try {
      const chatRef = doc(db, CHATS_COLLECTION, chatId);
      const updateData: any = {
        status,
        updatedAt: serverTimestamp()
      };

      if (status === 'closed' || status === 'resolved') {
        updateData.closedAt = serverTimestamp();
        updateData.closedBy = adminId;
      }

      await updateDoc(chatRef, updateData);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut du chat:', error);
      throw error;
    }
  }

  // Mettre à jour la priorité d'un chat
  static async updateChatPriority(chatId: string, priority: Chat['priority']): Promise<void> {
    try {
      const chatRef = doc(db, CHATS_COLLECTION, chatId);
      await updateDoc(chatRef, {
        priority,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la priorité du chat:', error);
      throw error;
    }
  }

  // Ajouter des notes au chat
  static async updateChatNotes(chatId: string, notes: string): Promise<void> {
    try {
      const chatRef = doc(db, CHATS_COLLECTION, chatId);
      await updateDoc(chatRef, {
        notes,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour des notes du chat:', error);
      throw error;
    }
  }

  // Écouter les changements en temps réel
  static subscribeToChats(callback: (chats: Chat[]) => void) {
    const q = query(
      collection(db, CHATS_COLLECTION),
      orderBy('updatedAt', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const chats = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          userId: data.userId || '',
          userName: data.userName || 'Utilisateur',
          userEmail: data.userEmail || '',
          status: data.status || 'active',
          priority: data.priority || 'medium',
          subject: data.title || data.subject || '',
          category: data.topic || data.category || 'general',
          participants: data.participants || [],
          lastMessage: typeof data.lastMessage === 'string' ? data.lastMessage : '',
          lastMessageTimestamp: data.lastMessageTimestamp?.toDate(),
          unreadCount: data.unreadCount || 0,
          assignedTo: data.assignedTo,
          assignedToName: data.assignedToName,
          notes: data.notes,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          closedAt: data.closedAt?.toDate(),
          closedBy: data.closedBy,
          tags: data.tags || []
        } as Chat;
      });
      
      callback(chats);
    });
  }

  static subscribeToChatMessages(chatId: string, callback: (messages: ChatMessage[]) => void) {
    if (!chatId) {
      console.warn('chatId is undefined, cannot subscribe to messages');
      return () => {}; // Return empty unsubscribe function
    }
    
    const messagesRef = collection(db, CHATS_COLLECTION, chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'));
    
    return onSnapshot(q, (querySnapshot) => {
      const messages = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          content: typeof data.text === 'string' ? data.text : 'Message...',
          senderId: data.senderId || 'unknown',
          senderType: data.senderId === 'admin' || data.senderId === 'support' ? 'admin' : 'user',
          senderName: data.senderId === 'admin' || data.senderId === 'support' ? 'Admin' : 'Utilisateur',
          timestamp: data.timestamp?.toDate() || new Date(),
          read: data.status === 'read',
          readAt: data.readAt?.toDate()
        } as ChatMessage;
      });
      
      callback(messages);
    });
  }

  // Statistiques des chats
  static async getChatStats() {
    try {
      const allChats = await this.getAllChats();
      
      return {
        total: allChats.length,
        active: allChats.filter(chat => chat.status === 'active').length,
        waiting: allChats.filter(chat => chat.status === 'waiting').length,
        closed: allChats.filter(chat => chat.status === 'closed').length,
        resolved: allChats.filter(chat => chat.status === 'resolved').length,
        urgent: allChats.filter(chat => chat.priority === 'urgent').length,
        high: allChats.filter(chat => chat.priority === 'high').length,
        unassigned: allChats.filter(chat => !chat.assignedTo).length
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }

  // Récupérer les messages par utilisateur
  static async getMessagesByUser(userId: string) {
    try {
      const chatsQuery = query(
        collection(db, CHATS_COLLECTION),
        where('participants', 'array-contains', userId)
      );
      
      const chatsSnapshot = await getDocs(chatsQuery);
      const userMessages = [];
      
      for (const chatDoc of chatsSnapshot.docs) {
        const messages = await this.getChatMessages(chatDoc.id);
        userMessages.push({
          chatId: chatDoc.id,
          chatData: chatDoc.data(),
          messages: messages
        });
      }
      
      return userMessages;
    } catch (error) {
      console.error('Erreur récupération messages utilisateur:', error);
      return [];
    }
  }

  // Récupérer les informations utilisateur depuis la collection users
  static async getUserInfo(userId: string) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          id: userDoc.id,
          userName: data.displayName || data.firstName + ' ' + data.lastName || 'Utilisateur',
          userEmail: data.email || '',
          // Autres informations utilisateur si nécessaire
        };
      }
      return null;
    } catch (error) {
      console.error('Erreur récupération info utilisateur:', error);
      return null;
    }
  }
}

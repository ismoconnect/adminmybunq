# Fonctionnalité de Chat de Support - AMCB Admin

## Vue d'ensemble

La fonctionnalité de chat de support permet aux administrateurs de gérer les conversations en temps réel avec les utilisateurs de la plateforme AMCB. Cette fonctionnalité est intégrée dans la page Support de l'interface d'administration.

## Fonctionnalités principales

### 1. Interface de Chat
- **Liste des chats** : Affichage de tous les chats avec filtrage par statut
- **Interface de conversation** : Chat en temps réel avec historique des messages
- **Statistiques** : Métriques en temps réel des chats (total, actifs, en attente, etc.)

### 2. Gestion des Chats
- **Statuts** : Actif, En attente, Fermé, Résolu
- **Priorités** : Faible, Moyenne, Élevée, Urgente
- **Catégories** : Général, Technique, Facturation, KYC, Transaction, Autre
- **Assignation** : Possibilité d'assigner un chat à un administrateur spécifique

### 3. Fonctionnalités Avancées
- **Notes internes** : Notes privées pour les administrateurs
- **Marquage des messages** : Marquage automatique des messages comme lus
- **Recherche** : Recherche dans les chats par nom, email ou sujet
- **Filtres** : Filtrage par statut, priorité, assignation

## Structure des Données

### Collection `chats`
```typescript
{
  id: string,
  userId: string,
  userName: string,
  userEmail: string,
  status: 'active' | 'waiting' | 'closed' | 'resolved',
  priority: 'low' | 'medium' | 'high' | 'urgent',
  subject: string,
  category: 'general' | 'technical' | 'billing' | 'kyc' | 'transaction' | 'other',
  assignedTo?: string,
  assignedToName?: string,
  lastMessage?: ChatMessage,
  unreadCount: number,
  createdAt: Date,
  updatedAt: Date,
  closedAt?: Date,
  closedBy?: string,
  tags?: string[],
  notes?: string
}
```

### Sous-collection `messages` dans `chats`
```typescript
{
  id: string,
  senderId: string,
  senderType: 'user' | 'admin',
  senderName: string,
  content: string,
  timestamp: Date,
  read: boolean,
  readAt?: Date,
  attachments?: {
    type: 'image' | 'file' | 'document',
    url: string,
    fileName: string,
    fileSize?: number
  }[]
}
```

## Composants

### 1. ChatList
- Affiche la liste des chats avec filtres et recherche
- Mise à jour en temps réel
- Indicateurs visuels pour les statuts et priorités
- Compteur de messages non lus

### 2. ChatInterface
- Interface de conversation en temps réel
- Envoi et réception de messages
- Gestion des statuts et priorités
- Notes internes
- Assignation de chats

### 3. ChatStats
- Statistiques en temps réel
- Métriques par statut et priorité
- Mise à jour automatique toutes les 30 secondes

### 4. CreateChatModal
- Création de chats de test
- Formulaire complet avec validation
- Support des messages initiaux

## Services

### ChatService
Classe principale pour gérer toutes les opérations liées aux chats :

- `getAllChats()` : Récupérer tous les chats
- `getChatsByStatus()` : Filtrer par statut
- `getChatById()` : Récupérer un chat spécifique
- `getChatMessages()` : Récupérer les messages d'un chat
- `createChat()` : Créer un nouveau chat
- `sendMessage()` : Envoyer un message
- `markMessagesAsRead()` : Marquer les messages comme lus
- `assignChat()` : Assigner un chat à un admin
- `updateChatStatus()` : Changer le statut d'un chat
- `updateChatPriority()` : Changer la priorité d'un chat
- `updateChatNotes()` : Mettre à jour les notes
- `subscribeToChats()` : Écouter les changements en temps réel
- `subscribeToChatMessages()` : Écouter les nouveaux messages
- `getChatStats()` : Récupérer les statistiques

## Utilisation

### 1. Accès à la fonctionnalité
- Naviguer vers la page "Support" dans l'interface d'administration
- L'onglet "Chats" est sélectionné par défaut

### 2. Création d'un chat de test
- Cliquer sur "Créer un chat de test"
- Remplir le formulaire avec les informations de l'utilisateur
- Optionnellement ajouter un message initial
- Le chat apparaîtra automatiquement dans la liste

### 3. Gestion d'un chat
- Sélectionner un chat dans la liste
- L'interface de conversation s'affiche à droite
- Envoyer des messages en utilisant la zone de saisie
- Modifier le statut et la priorité via les menus déroulants
- Ajouter des notes internes via le bouton "Notes"

### 4. Filtrage et recherche
- Utiliser la barre de recherche pour trouver des chats
- Utiliser les filtres par statut (Tous, Actifs, En attente, etc.)
- Les statistiques en haut de page donnent une vue d'ensemble

## Sécurité

### Règles Firestore
Les collections `chats` et `chatMessages` sont protégées par des règles Firestore qui :
- Exigent une authentification pour toutes les opérations
- Permettent l'accès aux administrateurs authentifiés
- Empêchent l'accès non autorisé aux données

### Validation des données
- Validation côté client pour les formulaires
- Validation côté serveur via les règles Firestore
- Gestion des erreurs avec messages utilisateur appropriés

## Performance

### Optimisations
- Mise à jour en temps réel via les listeners Firestore
- Pagination automatique des messages
- Cache local des données
- Mise à jour optimiste de l'interface

### Monitoring
- Gestion des erreurs de connexion
- Retry automatique en cas d'échec
- Indicateurs de chargement
- Logs détaillés pour le débogage

## Développement

### Ajout de nouvelles fonctionnalités
1. Étendre les types dans `src/types/index.ts`
2. Ajouter les méthodes dans `ChatService`
3. Créer ou modifier les composants React
4. Mettre à jour les règles Firestore si nécessaire
5. Tester avec des données réelles

### Tests
- Créer des chats de test via l'interface
- Tester les différentes fonctionnalités (assignation, statuts, etc.)
- Vérifier la synchronisation en temps réel
- Tester la gestion des erreurs

## Support

Pour toute question ou problème lié à la fonctionnalité de chat :
1. Vérifier les logs de la console du navigateur
2. Contrôler les règles Firestore
3. Vérifier la connexion à Firebase
4. Consulter la documentation Firestore

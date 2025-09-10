# Structure des données Firestore - AMCB Admin

## Vue d'ensemble
Ce document décrit la structure des collections Firestore utilisées par l'application AMCB Admin pour gérer les utilisateurs et leurs données financières.

## Collections principales

### 1. Collection `users`
**Description** : Informations de base des utilisateurs de la plateforme

**Structure** :
```typescript
{
  id: string,
  firstName: string,
  lastName: string,
  email: string,
  phone?: string,
  country?: string,
  city?: string,
  kycStatus: 'unverified' | 'pending' | 'verified' | 'rejected',
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 2. Collection `accounts`
**Description** : Comptes bancaires des utilisateurs

**Structure** :
```typescript
{
  id: string,
  userId: string, // Référence vers l'utilisateur
  accountNumber: string,
  bankName: string,
  balance: number,
  currency: string,
  accountType: 'checking' | 'savings' | 'business',
  status: 'active' | 'inactive' | 'suspended',
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 3. Collection `transactions`
**Description** : Historique des transactions bancaires

**Structure** :
```typescript
{
  id: string,
  userId: string, // Référence vers l'utilisateur
  accountId: string, // Référence vers le compte
  type: 'deposit' | 'withdrawal' | 'transfer' | 'payment',
  amount: number,
  currency: string,
  description: string,
  status: 'pending' | 'completed' | 'failed' | 'cancelled',
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 4. Collection `ribs`
**Description** : Informations RIB des utilisateurs

**Structure** :
```typescript
{
  id: string, // Même ID que l'utilisateur
  userId: string,
  iban: string,
  bic: string,
  bankName: string,
  accountHolder: string,
  accountNumber: string,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 5. Collection `billing`
**Description** : Factures et documents de facturation

**Structure** :
```typescript
{
  id: string,
  userId: string, // Référence vers l'utilisateur
  invoiceNumber: string,
  description: string,
  amount: number,
  currency: string,
  status: 'pending' | 'paid' | 'overdue' | 'cancelled',
  dueDate: Timestamp,
  paidAt?: Timestamp,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 6. Collection `cards`
**Description** : Cartes bancaires des utilisateurs

**Structure** :
```typescript
{
  id: string,
  userId: string, // Référence vers l'utilisateur
  cardType: 'visa' | 'mastercard' | 'amex',
  lastFourDigits: string,
  bankName: string,
  expiryMonth: number,
  expiryYear: number,
  status: 'active' | 'inactive' | 'blocked' | 'expired',
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 7. Collection `budgets`
**Description** : Informations de budget des utilisateurs

**Structure** :
```typescript
{
  id: string, // Même ID que l'utilisateur
  userId: string,
  monthlyBudget: number,
  monthlySpending: number,
  mainCategory: string,
  categories: {
    [categoryName: string]: {
      budget: number,
      spent: number
    }
  },
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 8. Collection `notifications`
**Description** : Notifications système pour les utilisateurs

**Structure** :
```typescript
{
  id: string,
  userId: string, // Référence vers l'utilisateur
  title: string,
  message: string,
  type: 'info' | 'warning' | 'error' | 'success',
  read: boolean,
  readAt?: Timestamp,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### 9. Collection `chats`
**Description** : Chats de support entre utilisateurs et administrateurs

**Structure** :
```typescript
{
  id: string,
  userId: string, // Référence vers l'utilisateur
  userName: string,
  userEmail: string,
  status: 'active' | 'waiting' | 'closed' | 'resolved',
  priority: 'low' | 'medium' | 'high' | 'urgent',
  subject: string,
  category: 'general' | 'technical' | 'billing' | 'kyc' | 'transaction' | 'other',
  assignedTo?: string, // Admin ID
  assignedToName?: string,
  lastMessage?: ChatMessage,
  unreadCount: number,
  createdAt: Timestamp,
  updatedAt: Timestamp,
  closedAt?: Timestamp,
  closedBy?: string,
  tags?: string[],
  notes?: string // Notes internes pour les admins
}
```

### 10. Sous-collection `messages` dans `chats`
**Description** : Messages individuels dans les chats de support (sous-collection de chaque document chat)

**Structure** :
```typescript
{
  id: string,
  senderId: string,
  senderType: 'user' | 'admin',
  senderName: string,
  content: string,
  timestamp: Timestamp,
  read: boolean,
  readAt?: Timestamp,
  attachments?: {
    type: 'image' | 'file' | 'document',
    url: string,
    fileName: string,
    fileSize?: number
  }[]
}
```

## Règles de sécurité

### Accès administrateur
- Les super admins ont accès à toutes les collections
- Vérification via `request.auth.token.role == 'super_admin'`

### Accès utilisateur
- Les utilisateurs peuvent accéder à leurs propres données
- Vérification via `resource.data.userId == request.auth.uid`

### Collections spéciales
- `ribs` et `budgets` : L'ID du document correspond à l'ID de l'utilisateur
- `dashboard` : Accès réservé aux super admins

## Index recommandés

### Index composites
```javascript
// Collection accounts
{
  userId: Ascending,
  createdAt: Descending
}

// Collection transactions
{
  userId: Ascending,
  createdAt: Descending
}

// Collection billing
{
  userId: Ascending,
  createdAt: Descending
}

// Collection notifications
{
  userId: Ascending,
  createdAt: Descending
}

// Collection chats
{
  status: Ascending,
  updatedAt: Descending
}

// Sous-collection messages dans chats
{
  timestamp: Ascending
}

## Utilisation dans l'application

### Chargement des données
- Les données sont chargées à la demande lors du changement d'onglet
- Utilisation de `useEffect` pour déclencher le chargement
- Gestion des états de chargement et d'erreur

### Mise à jour des données
- Réinitialisation des données lors du changement d'utilisateur
- Cache local des données chargées pour éviter les re-requêtes

### Sécurité
- Vérification des permissions côté client et serveur
- Validation des données avant envoi
- Gestion des erreurs d'authentification

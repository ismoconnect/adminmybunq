# Configuration Firestore - AMCB Admin

## Problèmes identifiés et solutions

### 1. Erreurs de permissions
**Problème** : "Missing or insufficient permissions"
**Cause** : Les règles Firestore étaient trop restrictives
**Solution** : Règles simplifiées qui permettent l'accès à tous les utilisateurs authentifiés

### 2. Erreurs d'index
**Problème** : "The query requires an index"
**Cause** : Les requêtes avec `where` + `orderBy` nécessitent des index composites
**Solution** : Création des index requis

## Étapes de configuration

### Étape 1 : Déployer les nouvelles règles Firestore

```bash
# Dans le répertoire du projet
firebase deploy --only firestore:rules
```

### Étape 2 : Créer les index Firestore

#### Option A : Via la console Firebase (Recommandée)

1. Aller sur [Firebase Console](https://console.firebase.google.com)
2. Sélectionner votre projet
3. Aller dans Firestore Database > Indexes
4. Cliquer sur "Créer un index"
5. Créer les index suivants :

**Index 1 : Collection `accounts`**
- Collection ID : `accounts`
- Champs : 
  - `userId` (Ascending)
  - `createdAt` (Descending)

**Index 2 : Collection `transactions`**
- Collection ID : `transactions`
- Champs :
  - `userId` (Ascending)
  - `createdAt` (Descending)

**Index 3 : Collection `billing`**
- Collection ID : `billing`
- Champs :
  - `userId` (Ascending)
  - `createdAt` (Descending)

**Index 4 : Collection `cards`**
- Collection ID : `cards`
- Champs :
  - `userId` (Ascending)
  - `createdAt` (Descending)

**Index 5 : Collection `notifications`**
- Collection ID : `notifications`
- Champs :
  - `userId` (Ascending)
  - `createdAt` (Descending)

#### Option B : Via Firebase CLI

```bash
# Installer Firebase CLI si ce n'est pas déjà fait
npm install -g firebase-tools

# Se connecter à Firebase
firebase login

# Initialiser le projet (si pas déjà fait)
firebase init firestore

# Déployer les index
firebase deploy --only firestore:indexes
```

### Étape 3 : Vérifier la configuration

1. **Règles Firestore** : Vérifier que les règles sont déployées
2. **Index** : Attendre que les index soient créés (peut prendre quelques minutes)
3. **Test** : Tester l'application pour vérifier que les erreurs ont disparu

## Structure des collections

### Collections existantes
- `users` : Utilisateurs de la plateforme
- `dashboard` : Statistiques du dashboard

### Nouvelles collections à créer
- `accounts` : Comptes bancaires
- `transactions` : Historique des transactions
- `ribs` : Informations RIB
- `billing` : Facturation
- `cards` : Cartes bancaires
- `budgets` : Budgets utilisateurs
- `notifications` : Notifications système

## Données de test

### Exemple de compte bancaire
```json
{
  "userId": "user123",
  "accountNumber": "FR7630001007941234567890185",
  "bankName": "BNP Paribas",
  "balance": 2500.50,
  "currency": "EUR",
  "accountType": "checking",
  "status": "active",
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-01-15T10:00:00Z"
}
```

### Exemple de transaction
```json
{
  "userId": "user123",
  "accountId": "account456",
  "type": "deposit",
  "amount": 500.00,
  "currency": "EUR",
  "description": "Virement salaire",
  "status": "completed",
  "createdAt": "2024-01-15T09:00:00Z",
  "updatedAt": "2024-01-15T09:00:00Z"
}
```

### Exemple de notification
```json
{
  "userId": "user123",
  "title": "Compte vérifié",
  "message": "Votre compte a été vérifié avec succès",
  "type": "success",
  "read": false,
  "createdAt": "2024-01-15T08:00:00Z",
  "updatedAt": "2024-01-15T08:00:00Z"
}
```

## Dépannage

### Erreurs persistantes
1. **Vérifier les règles** : S'assurer que les règles Firestore sont déployées
2. **Vérifier les index** : Attendre que les index soient complètement créés
3. **Vérifier l'authentification** : S'assurer que l'utilisateur est connecté

### Logs utiles
- Vérifier la console du navigateur pour les erreurs détaillées
- Vérifier les logs Firebase dans la console
- Utiliser Firebase Emulator pour tester en local

## Sécurité future

Une fois que l'application fonctionne, vous pourrez :
1. **Raffiner les règles** : Ajouter des restrictions par rôle
2. **Ajouter des validations** : Vérifier les données avant écriture
3. **Implémenter l'audit** : Logger les accès et modifications

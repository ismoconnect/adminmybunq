# 🏦 AMCB Admin Platform

Plateforme d'administration complète pour la banque AMCB, développée en React avec TypeScript et Firebase.

## 🚀 **Fonctionnalités principales**

### **👮‍♂️ Authentification & Sécurité**
- **Système de connexion admin** avec email/mot de passe
- **Gestion des rôles** : super_admin, admin, moderator
- **Permissions granulaires** par fonctionnalité
- **Sessions sécurisées** avec déconnexion automatique
- **Configuration initiale** pour le premier administrateur

### **📊 Dashboard & Analytics**
- **Statistiques en temps réel** des utilisateurs, comptes, transactions
- **Graphiques interactifs** avec Recharts (croissance utilisateurs, volumes transactions)
- **Métriques clés** : nouveaux utilisateurs, comptes actifs, volume financier
- **Alertes et notifications** importantes
- **Activité récente** de la plateforme

### **👥 Gestion des Utilisateurs**
- **Liste complète** de tous les utilisateurs
- **Recherche et filtres** par statut, nom, email
- **Gestion détaillée** : profil, comptes, transactions, documents
- **Modification des statuts KYC** (unverified → pending → verified)
- **Gestion des permissions** et accès

### **🧾 Validation KYC**
- **Workflow de validation** des documents d'identité
- **Gestion des statuts** : en attente, en cours, approuvé, rejeté
- **Priorisation** des demandes (urgente, haute, moyenne, basse)
- **Aperçu des documents** avec support Cloudinary
- **Actions rapides** : approuver, rejeter, demander plus d'infos

### **🏦 Gestion des Comptes**
- **Création de comptes** bancaires pour les utilisateurs
- **Types de comptes** : courant, épargne, crédit, professionnel
- **Gestion des statuts** : actif, inactif, suspendu, fermé
- **Limites et budgets** configurables
- **Gestion des cartes** bancaires

### **💰 Gestion des Transactions**
- **Surveillance** de toutes les transactions
- **Filtres avancés** par statut, type, date
- **Actions de modération** : approuver, rejeter, suspendre
- **Statistiques** de volume et de croissance
- **Export des données** pour analyse

### **💬 Support & Communication**
- **Système de tickets** de support
- **Gestion des priorités** et catégories
- **Assignation** aux administrateurs
- **Historique des conversations**
- **Templates de réponses**

### **📈 Rapports & Analytics**
- **Rapports personnalisables** par période
- **Graphiques interactifs** : utilisateurs, transactions, comptes, KYC
- **Export PDF/Excel** des données
- **Métriques de performance** de la plateforme
- **Tendances et analyses** prédictives

### **⚙️ Configuration Système**
- **Paramètres généraux** de la plateforme
- **Configuration de sécurité** (2FA, mots de passe, sessions)
- **Gestion des utilisateurs** (limites, vérifications)
- **Paramètres financiers** (frais, limites, taux)
- **Notifications** et alertes
- **Maintenance système** et sauvegardes

## 🛠️ **Technologies utilisées**

### **Frontend**
- **React 18** avec TypeScript
- **Vite** pour le build et le développement
- **Tailwind CSS** pour le styling
- **Headless UI** pour les composants d'interface
- **React Query** pour la gestion d'état et le cache
- **React Hook Form** + **Zod** pour la validation des formulaires
- **React Router DOM** pour la navigation
- **Lucide React** pour les icônes
- **Recharts** pour les graphiques

### **Backend & Base de données**
- **Firebase** (Auth, Firestore, Storage)
- **Firebase Admin SDK** pour l'accès aux données
- **Cloudinary** pour la gestion des documents
- **Règles Firestore** sécurisées

### **Outils de développement**
- **ESLint** pour le linting
- **Prettier** pour le formatage
- **TypeScript** pour le typage statique
- **PostCSS** pour le traitement CSS

## 📁 **Structure du projet**

```
src/
├── components/          # Composants réutilisables
│   ├── Layout.tsx      # Layout principal avec sidebar
│   ├── Header.tsx      # En-tête avec navigation
│   ├── Sidebar.tsx     # Menu de navigation latéral
│   ├── PermissionGuard.tsx # Gestion des permissions
│   └── InitialSetup.tsx    # Configuration initiale
├── contexts/           # Contextes React
│   └── AuthContext.tsx # Contexte d'authentification
├── pages/              # Pages de l'application
│   ├── Login.tsx       # Page de connexion
│   ├── Dashboard.tsx   # Tableau de bord principal
│   ├── Users.tsx       # Gestion des utilisateurs
│   ├── KYC.tsx         # Validation KYC
│   ├── Accounts.tsx    # Gestion des comptes
│   ├── Transactions.tsx # Gestion des transactions
│   ├── Support.tsx     # Support et tickets
│   ├── Reports.tsx     # Rapports et analytics
│   └── Settings.tsx    # Configuration système
├── services/           # Services d'API
│   ├── firebase.ts     # Configuration Firebase
│   ├── adminAuthService.ts # Service d'authentification admin
│   ├── userService.ts  # Service de gestion des utilisateurs
│   ├── kycService.ts   # Service de validation KYC
│   ├── accountService.ts # Service de gestion des comptes
│   ├── transactionService.ts # Service de gestion des transactions
│   └── dashboardService.ts # Service du tableau de bord
├── types/              # Types TypeScript
│   ├── index.ts        # Types généraux
│   └── auth.ts         # Types d'authentification
└── index.css           # Styles globaux et Tailwind
```

## 🚀 **Installation et démarrage**

### **Prérequis**
- Node.js 18+ et npm
- Compte Firebase avec projet configuré
- Clés d'API Firebase

### **1. Cloner le projet**
```bash
git clone <repository-url>
cd amcb-admin
```

### **2. Installer les dépendances**
```bash
npm install
```

### **3. Configuration Firebase**
Créer un fichier `.env.local` avec vos clés Firebase :

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
```

### **4. Lancer l'application**
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## 🔐 **Configuration initiale**

### **Première connexion**
1. L'application détecte automatiquement qu'aucun admin n'existe
2. Affichage de l'écran de configuration initiale
3. Création du premier super administrateur
4. Redirection vers la page de connexion

### **Création d'admins supplémentaires**
```typescript
// Via le service AdminAuthService
await AdminAuthService.createAdminUser({
  email: 'admin@amcb.com',
  role: 'admin',
  permissions: ['users', 'kyc', 'accounts', 'transactions']
});
```

## 🎯 **Utilisation**

### **Connexion**
- Utiliser les identifiants admin configurés
- L'application vérifie automatiquement les permissions

### **Navigation**
- **Sidebar fixe** avec toutes les sections principales
- **Breadcrumbs** pour la navigation
- **Recherche globale** dans les données

### **Gestion des données**
- **Filtres avancés** sur toutes les listes
- **Recherche en temps réel** avec debouncing
- **Pagination** pour les grandes listes
- **Actions en lot** pour les opérations multiples

### **Export et rapports**
- **Export PDF** des rapports avec graphiques
- **Export Excel** des données brutes
- **Rapports personnalisables** par période
- **Métriques en temps réel** sur le dashboard

## 🔒 **Sécurité**

### **Authentification**
- Vérification des droits admin à chaque connexion
- Sessions sécurisées avec Firebase Auth
- Déconnexion automatique après inactivité

### **Permissions**
- Système de permissions granulaires
- Vérification des droits sur chaque action
- Composants `PermissionGuard` pour la protection

### **Règles Firestore**
- Accès restreint aux collections sensibles
- Vérification des droits admin pour toutes les opérations
- Protection contre l'accès non autorisé

## 📊 **Métriques et monitoring**

### **Dashboard en temps réel**
- Nombre d'utilisateurs actifs
- Volume des transactions
- Statut des validations KYC
- Alertes et notifications

### **Rapports automatisés**
- Croissance des utilisateurs
- Performance financière
- Qualité des validations KYC
- Utilisation des fonctionnalités

## 🚀 **Déploiement**

### **Build de production**
```bash
npm run build
```

### **Déploiement recommandé**
- **Vercel** : Déploiement automatique depuis Git
- **Netlify** : Déploiement avec prévisualisation
- **Firebase Hosting** : Intégration native avec Firebase

### **Variables d'environnement**
- Configurer les variables de production
- Utiliser des clés Firebase de production
- Activer HTTPS obligatoire

## 🧪 **Tests**

### **Tests unitaires**
```bash
npm run test
```

### **Tests d'intégration**
```bash
npm run test:integration
```

### **Couverture de code**
```bash
npm run test:coverage
```

## 📝 **Contributions**

### **Standards de code**
- TypeScript strict
- ESLint + Prettier
- Composants fonctionnels avec hooks
- Tests unitaires pour les composants critiques

### **Processus de développement**
1. Fork du projet
2. Création d'une branche feature
3. Développement avec tests
4. Pull Request avec description détaillée

## 📞 **Support**

### **Documentation**
- Ce README
- Code commenté
- Types TypeScript détaillés

### **Contact**
- Issues GitHub pour les bugs
- Discussions pour les questions
- Wiki pour les guides avancés

## 📄 **Licence**

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

**AMCB Admin Platform** - Une solution complète pour la gestion administrative de votre plateforme bancaire 🏦✨

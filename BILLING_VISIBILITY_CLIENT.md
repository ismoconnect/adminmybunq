# 🔒 Gestion de la visibilité de la facturation dans l'app client

## 📋 **Vue d'ensemble**

Le champ `billingVisible` dans la collection `users` de Firestore contrôle si la facturation est visible ou masquée dans l'app client.

## 🗄️ **Structure des données**

```typescript
interface User {
  // ... autres champs
  billingVisible?: boolean; // true = visible, false = masqué
  billingBic?: string;
  billingHolder?: string;
  billingIban?: string;
  billingText?: string;
  advisorId?: string;
}
```

## 🎯 **Logique de l'app client**

### **Quand `billingVisible = true` (ou non défini) :**
- ✅ Afficher normalement la page de facturation
- ✅ Afficher les informations RIB
- ✅ Afficher le message de facturation
- ✅ Permettre les opérations de facturation

### **Quand `billingVisible = false` :**
- ❌ **Masquer complètement** la page de facturation
- ❌ **Afficher le message** : "Aucune facturation disponible"
- ❌ **Désactiver** tous les liens vers la facturation
- ❌ **Rediriger** vers une page d'erreur ou d'information

## 💻 **Exemple de code pour l'app client**

```typescript
// Dans le composant de facturation de l'app client
const BillingPage = () => {
  const [user, setUser] = useState<User | null>(null);
  
  // Charger les données utilisateur depuis Firestore
  
  if (!user?.billingVisible) {
    return (
      <div className="billing-disabled">
        <h2>Facturation non disponible</h2>
        <p>Aucune facturation disponible pour le moment.</p>
        <p>Veuillez contacter votre conseiller financier pour plus d'informations.</p>
      </div>
    );
  }
  
  // Afficher normalement la page de facturation
  return (
    <div className="billing-page">
      {/* Contenu normal de la facturation */}
    </div>
  );
};
```

## 🔧 **Navigation et liens**

### **Dans le menu principal :**
```typescript
// Masquer le lien de facturation si billingVisible = false
{user?.billingVisible && (
  <NavLink to="/billing">
    <DollarSign />
    Facturation
  </NavLink>
)}
```

### **Dans les autres pages :**
```typescript
// Désactiver les liens vers la facturation
{user?.billingVisible ? (
  <Link to="/billing">Voir la facturation</Link>
) : (
  <span className="text-gray-400 cursor-not-allowed">
    Facturation non disponible
  </span>
)}
```

## 📱 **Messages utilisateur**

### **Quand la facturation est masquée :**
- **Titre** : "Facturation non disponible"
- **Message principal** : "Aucune facturation disponible pour le moment."
- **Sous-message** : "Veuillez contacter votre conseiller financier pour plus d'informations."
- **Action suggérée** : "Contacter le support"

### **Quand la facturation est réactivée :**
- **Message de succès** : "La facturation est maintenant disponible !"
- **Redirection automatique** vers la page de facturation

## 🔄 **Mise à jour en temps réel**

L'app client doit écouter les changements du champ `billingVisible` :

```typescript
useEffect(() => {
  const unsubscribe = onSnapshot(doc(db, 'users', userId), (doc) => {
    if (doc.exists()) {
      const userData = doc.data();
      setUser(userData as User);
      
      // Si la facturation devient disponible, rediriger
      if (userData.billingVisible && !user?.billingVisible) {
        navigate('/billing');
      }
    }
  });
  
  return () => unsubscribe();
}, [userId]);
```

## 🚨 **Sécurité**

- Seuls les administrateurs peuvent modifier `billingVisible`
- Les utilisateurs normaux ne peuvent que lire ce champ
- La logique côté client doit toujours vérifier ce champ avant d'afficher la facturation

## 📝 **Notes importantes**

1. **Par défaut** : `billingVisible = true` (facturation visible)
2. **Changement immédiat** : L'état change instantanément dans l'app client
3. **Persistance** : L'état est sauvegardé dans Firestore
4. **Audit** : Chaque changement est enregistré avec `updatedAt`

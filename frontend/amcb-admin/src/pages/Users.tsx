import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  ArrowLeft, 
  User, 
  FileText, 
  Clock, 
  CreditCard, 
  DollarSign, 
  PieChart, 
  Shield,
  ChevronDown,
  Bell,
  Receipt
} from 'lucide-react';
import { UserService } from '../services/userService';
import { User as UserType } from '../types';
import { db } from '../services/firebase';
import { collection, query, where, orderBy, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';

const Users: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [showUserPage, setShowUserPage] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');
  const [showSectionDropdown, setShowSectionDropdown] = useState(false);

  // États pour les données des onglets
  const [userAccounts, setUserAccounts] = useState<any[]>([]);
  const [userTransactions, setUserTransactions] = useState<any[]>([]);
  const [userRib, setUserRib] = useState<any>(null);
  const [userBilling, setUserBilling] = useState<any>(null);
  const [userCards, setUserCards] = useState<any[]>([]);
  const [userBudget, setUserBudget] = useState<any>(null);
  const [userNotifications, setUserNotifications] = useState<any[]>([]);
  const [userKyc, setUserKyc] = useState<any>(null);
  
  // États locaux pour les modifications de facturation
  const [billingForm, setBillingForm] = useState({
    billingHolder: '',
    billingIban: '',
    billingBic: '',
    advisorId: '',
    billingText: ''
  });

  // État pour gérer la visibilité de la facturation
  const [billingVisible, setBillingVisible] = useState(true);

  // États pour la gestion des notifications
  const [showNewNotificationForm, setShowNewNotificationForm] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    category: 'general',
    type: 'info',
    priority: 'medium'
  });

  // État pour les notifications toast
  const [toastNotifications, setToastNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    duration?: number;
  }>>([]);

  // États pour les modales de confirmation
  const [showDeleteNotificationModal, setShowDeleteNotificationModal] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);
  // const [showKycStatusModal, setShowKycStatusModal] = useState(false); // SUPPRIMÉ - plus de modale
  // const [kycStatusToUpdate, setKycStatusToUpdate] = useState<'pending' | 'verified' | 'unverified' | null>(null); // SUPPRIMÉ
  // const [kycConfirmationMessage, setKycConfirmationMessage] = useState(''); // SUPPRIMÉ

  // Fonction pour mettre à jour le formulaire de facturation
  const updateBillingForm = (billingInfo: any) => {
    setBillingForm({
      billingHolder: billingInfo?.billingHolder || '',
      billingIban: billingInfo?.billingIban || '',
      billingBic: billingInfo?.billingBic || '',
      advisorId: billingInfo?.advisorId || '',
      billingText: billingInfo?.billingText || ''
    });
  };

  // Gestionnaire de changement pour le formulaire de facturation
  const handleBillingChange = (field: string, value: string) => {
    setBillingForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Fonction pour sauvegarder les modifications de facturation
  const handleSaveBilling = async () => {
    try {
      // Ici, vous pouvez ajouter la logique pour sauvegarder dans Firestore
      console.log('Sauvegarde des modifications de facturation:', billingForm);
      console.log('État de visibilité de la facturation:', billingVisible);
      
      // Mettre à jour l'état local
      if (userBilling) {
        setUserBilling({
          ...userBilling,
          billingInfo: {
            ...userBilling.billingInfo,
            ...billingForm
          }
        });
      }
      
      // Afficher un message de succès
      addToastNotification('success', 'Sauvegarde réussie', 'Les modifications de facturation ont été sauvegardées avec succès !');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      addToastNotification('error', 'Erreur de sauvegarde', 'Une erreur est survenue lors de la sauvegarde des modifications.');
    }
  };

  // Fonction pour sauvegarder l'état de visibilité de la facturation
  const handleToggleBillingVisibility = async () => {
    try {
      const newVisibility = !billingVisible;
      console.log('🔄 Changement de visibilité de la facturation:');
      console.log('  - Ancien état:', billingVisible);
      console.log('  - Nouvel état:', newVisibility);
      console.log('  - Type:', typeof newVisibility);
      
      if (!selectedUser?.uid) {
        addToastNotification('error', 'Erreur', 'Utilisateur non sélectionné');
        return;
      }

      // Sauvegarder dans Firestore
      const userRef = doc(db, 'users', selectedUser.uid);
      const updateData = {
        billingVisible: newVisibility,
        updatedAt: new Date()
      };
      
      console.log('💾 Sauvegarde dans Firestore:');
      console.log('  - Document:', selectedUser.uid);
      console.log('  - Données:', updateData);
      
      await updateDoc(userRef, updateData);
      
      console.log('✅ Données sauvegardées avec succès dans Firestore');

      // Mettre à jour l'état local
      setBillingVisible(newVisibility);
      
      // Mettre à jour l'utilisateur sélectionné
      if (selectedUser) {
        setSelectedUser({
          ...selectedUser,
          billingVisible: newVisibility
        });
      }
      
      // Afficher un message de confirmation
      const message = newVisibility 
        ? 'La facturation est maintenant visible pour le client dans l\'app.' 
        : 'Dans l\'app client, le message "Aucune facturation disponible" sera affiché.';
      
      addToastNotification('success', 
        newVisibility ? 'Facturation visible' : 'Facturation masquée', 
        message
      );
      
      console.log('🎯 État final de la facturation:', {
        localState: newVisibility,
        firestoreValue: newVisibility,
        userDocument: selectedUser.uid
      });
      
    } catch (error) {
      console.error('❌ Erreur lors du changement de visibilité:', error);
      addToastNotification('error', 'Erreur de visibilité', 'Une erreur est survenue lors du changement de visibilité de la facturation.');
    }
  };

  // Fonction pour créer une nouvelle notification
  const handleCreateNotification = async () => {
    try {
      if (!selectedUser?.uid) {
        addToastNotification('error', 'Erreur', 'Utilisateur non sélectionné');
        return;
      }

      if (!newNotification.title || !newNotification.message) {
        addToastNotification('warning', 'Champs manquants', 'Veuillez remplir le titre et le message de la notification');
        return;
      }

      // Créer l'objet notification
      const notificationData = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: newNotification.title,
        message: newNotification.message,
        category: newNotification.category,
        type: newNotification.type,
        priority: newNotification.priority,
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        read: false,
        userId: selectedUser.uid
      };

      // Sauvegarder dans Firestore
      const userRef = doc(db, 'users', selectedUser.uid);
      await updateDoc(userRef, {
        notifications: [...userNotifications, notificationData],
        updatedAt: new Date()
      });

      // Mettre à jour l'état local
      setUserNotifications([...userNotifications, notificationData]);

      // Réinitialiser le formulaire
      setNewNotification({
        title: '',
        message: '',
        category: 'general',
        type: 'info',
        priority: 'medium'
      });

      // Masquer le formulaire
      setShowNewNotificationForm(false);

      addToastNotification('success', 'Notification créée', 'La notification a été créée avec succès !');
    } catch (error) {
      console.error('Erreur lors de la création de la notification:', error);
      addToastNotification('error', 'Erreur de création', 'Une erreur est survenue lors de la création de la notification');
    }
  };

  // Fonction pour supprimer une notification
  const handleDeleteNotification = async (notificationId: string) => {
    try {
      if (!selectedUser?.uid) {
        addToastNotification('error', 'Erreur', 'Utilisateur non sélectionné');
        return;
      }

      // Afficher la modale de confirmation
      setNotificationToDelete(notificationId);
      setShowDeleteNotificationModal(true);
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
      addToastNotification('error', 'Erreur de suppression', 'Une erreur est survenue lors de la suppression de la notification');
    }
  };

  // Fonction pour confirmer la suppression d'une notification
  const confirmDeleteNotification = async () => {
    try {
      if (!selectedUser?.uid || !notificationToDelete) {
        addToastNotification('error', 'Erreur', 'Données manquantes pour la suppression');
        return;
      }

      // Filtrer la notification à supprimer
      const updatedNotifications = userNotifications.filter(
        (notif: any) => notif.id !== notificationToDelete
      );

      // Sauvegarder dans Firestore
      const userRef = doc(db, 'users', selectedUser.uid);
      await updateDoc(userRef, {
        notifications: updatedNotifications,
        updatedAt: new Date()
      });

      // Mettre à jour l'état local
      setUserNotifications(updatedNotifications);

      // Fermer la modale
      setShowDeleteNotificationModal(false);
      setNotificationToDelete(null);

      addToastNotification('success', 'Notification supprimée', 'La notification a été supprimée avec succès !');
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
      addToastNotification('error', 'Erreur de suppression', 'Une erreur est survenue lors de la suppression de la notification');
    }
  };

  // Fonction pour mettre à jour le statut KYC immédiatement
  const handleUpdateKycStatus = async (newStatus: 'pending' | 'verified' | 'unverified') => {
    console.log('🔄 handleUpdateKycStatus appelé avec:', newStatus);

    if (!selectedUser) {
      console.error('❌ Aucun utilisateur sélectionné');
      return;
    }

    const userId = selectedUser.uid || selectedUser.id;
    if (!userId) {
      console.error('❌ selectedUser n\'a ni uid ni id');
      console.error('❌ Propriétés de selectedUser:', Object.keys(selectedUser));
      return;
    }

    console.log('💾 Identifiant utilisateur trouvé:', userId);

    try {
      let updateData: any = {
        kycStatus: newStatus,
        updatedAt: new Date()
      };

      switch (newStatus) {
        case 'verified':
          updateData.verifiedAt = new Date();
          updateData.validatedAt = new Date();
          break;
        case 'pending':
          break;
        case 'unverified':
          updateData.verifiedAt = null;
          updateData.validatedAt = null;
          updateData.rejectedAt = null;
          break;
      }

      console.log('📝 Données à mettre à jour:', updateData);

      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, updateData);
      console.log('✅ Firestore mis à jour avec succès:', updateData);

      // Si le statut passe à "verified", créer automatiquement les sous-documents
      if (newStatus === 'verified') {
        console.log('🎯 Création automatique des sous-documents pour l\'utilisateur vérifié');
        await createUserSubDocuments(userId);
      }

      if (selectedUser) {
        const updatedUser = {
          ...selectedUser,
          kycStatus: newStatus
        };
        console.log('👤 Utilisateur mis à jour:', updatedUser);
        setSelectedUser(updatedUser);
      }

      if (userKyc) {
        const updatedKyc = {
          ...userKyc,
          status: newStatus,
          verifiedAt: newStatus === 'verified' ? new Date() : null,
          validatedAt: newStatus === 'verified' ? new Date() : null,
          rejectedAt: null
        };
        console.log('📋 KYC mis à jour:', updatedKyc);
        setUserKyc(updatedKyc);
      }

      console.log('🎉 Statut KYC mis à jour avec succès:', {
        userId: userId,
        oldStatus: userKyc?.status,
        newStatus: newStatus,
        timestamp: new Date()
      });

    } catch (error) {
      console.error('❌ Erreur lors de la mise à jour du statut KYC:', error);
    }
  };

  // Fonction pour confirmer la mise à jour du statut KYC
  const confirmUpdateKycStatus = async () => {
    // Cette fonction n'est plus nécessaire - suppression
  };

  // Fonction pour annuler la mise à jour du statut KYC
  const cancelUpdateKycStatus = () => {
    // Cette fonction n'est plus nécessaire - suppression
  };

  // Fonction pour ajouter une notification toast
  const addToastNotification = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string, duration: number = 5000) => {
    const id = Date.now().toString();
    const newToast = { id, type, title, message, duration };
    setToastNotifications(prev => [...prev, newToast]);
    
    // Auto-supprimer après la durée spécifiée
    setTimeout(() => {
      setToastNotifications(prev => prev.filter(toast => toast.id !== id));
    }, duration);
  };

  // Fonction pour supprimer une notification toast
  const removeToastNotification = (id: string) => {
    setToastNotifications(prev => prev.filter(toast => toast.id !== id));
  };

  const { data: usersResponse, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => UserService.getUsers(),
  });

  const users = usersResponse?.users || [];
  const filteredUsers = users.filter((user: UserType) =>
    user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fonction pour charger les données d'un onglet
  const loadSectionData = async (sectionId: string, userId: string) => {
    console.log('🔄 loadSectionData appelé:', { sectionId, userId });
    try {
      // Récupérer le document utilisateur complet
      const userDoc = await getDoc(doc(db, 'users', userId));
      
      if (!userDoc.exists()) {
        console.log('❌ Utilisateur non trouvé dans Firestore');
        return;
      }

      const userData = userDoc.data();
      console.log('📋 Données Firestore récupérées dans loadSectionData:', userData);

      switch (sectionId) {
        case 'accounts':
          // Les comptes sont stockés dans le document utilisateur
          const accounts = userData.accounts || [];
          setUserAccounts(accounts);
          break;

        case 'history':
          // Les transactions sont stockées dans le document utilisateur
          const transactions = userData.transactions || [];
          setUserTransactions(transactions);
          break;

        case 'rib':
          // Créer un RIB basé sur les informations des comptes et bénéficiaires
          const ribData = {
            id: 'rib_' + userId,
            iban: userData.billingIban || 'FR76 1652 8001 3100 0074 9591 059',
            bic: userData.billingBic || 'SMOEFRP1',
            holder: userData.billingHolder || `${userData.firstName} ${userData.lastName}`,
            accounts: userData.accounts || [],
            beneficiaries: userData.beneficiaries || []
          };
          setUserRib(ribData);
          break;

        case 'billing':
          // Créer des factures basées sur les transactions et les informations de facturation
          const transactionsForBilling = userData.transactions || [];
          const billing = transactionsForBilling
            .filter((tx: any) => tx.type === 'outgoing_transfer' || tx.amount < 0)
            .map((tx: any) => ({
              id: tx.id,
              invoiceNumber: `INV-${tx.id}`,
              description: tx.description || tx.category || 'Transaction',
              amount: Math.abs(tx.amount),
              currency: tx.currency || 'EUR',
              status: tx.status === 'completed' ? 'paid' : 'pending',
              dueDate: tx.date,
              createdAt: tx.date,
              beneficiary: tx.beneficiaryName || 'Destinataire'
            }));
          
          // Ajouter les informations de facturation de l'utilisateur
          const billingInfo = {
            billingBic: userData.billingBic,
            billingHolder: userData.billingHolder,
            billingIban: userData.billingIban,
            billingText: userData.billingText,
            advisorId: userData.advisorId
          };
          
          setUserBilling({
            invoices: billing,
            billingInfo: billingInfo
          });
          
          // Mettre à jour le formulaire local
          updateBillingForm(billingInfo);
          
          // Charger l'état de visibilité de la facturation
          const billingVisibility = userData.billingVisible !== false; // Par défaut true si non défini
          setBillingVisible(billingVisibility);
          break;

        case 'card':
          // Utiliser les informations de carte réelles de l'utilisateur
          const cardData = {
            id: 'card_' + userId,
            type: userData.cardType || 'standard',
            status: userData.cardStatus || 'none',
            limits: userData.cardLimits || { monthly: 2000, withdrawal: 500 },
            requestedAt: userData.cardRequestedAt || null,
            hasPendingRequest: userData.hasPendingVirtualCardRequest || false
          };
          setUserCards([cardData]);
          break;

        case 'budget':
          // Utiliser les budgets réels de l'utilisateur
          const budgets = userData.budgets || [];
          const budgetData = {
            id: 'budget_' + userId,
            monthlyIncome: userData.salary || 0,
            monthlyExpenses: 0, // Calculer à partir des transactions
            savings: 0, // Calculer à partir des comptes
            budgets: budgets,
            cardLimits: userData.cardLimits || { monthly: 2000, withdrawal: 500 }
          };
          setUserBudget(budgetData);
          break;

        // case 'kyc': // SUPPRIMÉ - intégré dans l'onglet profil
          // Le statut KYC est maintenant géré directement dans l'onglet profil
          // setUserKyc(null); // Plus nécessaire
          // break;

        case 'notifications':
          // Utiliser les notifications réelles de l'utilisateur
          const notifications = userData.notifications || [];
          setUserNotifications(notifications);
          break;

        case 'profile':
          // Charger les informations personnelles et KYC depuis le document utilisateur
          const userKycData = {
            id: 'kyc_' + userId,
            status: userData.kycStatus || userData.verificationStatus || 'unverified',
            personalInfo: {
              firstName: userData.firstName,
              lastName: userData.lastName,
              email: userData.email,
              phone: userData.phone,
              dob: userData.dob || userData.birthDate,
              pob: userData.pob || userData.birthPlace,
              nationality: userData.nationality,
              residenceCountry: userData.residenceCountry || userData.country,
              address: userData.address,
              city: userData.city,
              postalCode: userData.postalCode,
              profession: userData.profession,
              salary: userData.salary
            },
            verifiedAt: userData.verifiedAt,
            validatedAt: userData.validatedAt,
            rejectedAt: userData.rejectedAt,
            updatedAt: userData.updatedAt || userData.lastUpdated
          };
          setUserKyc(userKycData);
          
          // Mettre à jour selectedUser avec toutes les données Firestore
          const updatedUser = {
            ...selectedUser,
            ...userData,
            uid: userId, // S'assurer que uid est défini
            email: userData.email || selectedUser?.email || '', // S'assurer que email est défini
            kycStatus: userData.kycStatus || userData.verificationStatus || 'unverified', // S'assurer que kycStatus a une valeur
            status: userData.status || 'active', // S'assurer que status a une valeur
            // Convertir les timestamps Firestore en objets Date
            emailVerifiedAt: userData.emailVerifiedAt ? 
              (userData.emailVerifiedAt.toDate ? userData.emailVerifiedAt.toDate() : new Date(userData.emailVerifiedAt)) : null,
            lastSignInTime: userData.lastSignInTime ? 
              (userData.lastSignInTime.toDate ? userData.lastSignInTime.toDate() : new Date(userData.lastSignInTime)) : null,
            createdAt: userData.createdAt ? 
              (userData.createdAt.toDate ? userData.createdAt.toDate() : new Date(userData.createdAt)) : null,
            updatedAt: userData.updatedAt || userData.lastUpdated ? 
              ((userData.updatedAt || userData.lastUpdated).toDate ? (userData.updatedAt || userData.lastUpdated).toDate() : new Date(userData.updatedAt || userData.lastUpdated)) : null,
            verifiedAt: userData.verifiedAt ? 
              (userData.verifiedAt.toDate ? userData.verifiedAt.toDate() : new Date(userData.verifiedAt)) : null,
            validatedAt: userData.validatedAt ? 
              (userData.validatedAt.toDate ? userData.validatedAt.toDate() : new Date(userData.validatedAt)) : null,
            rejectedAt: userData.rejectedAt ? 
              (userData.rejectedAt.toDate ? userData.rejectedAt.toDate() : new Date(userData.rejectedAt)) : null,
            dob: userData.dob || userData.birthDate ? 
              ((userData.dob || userData.birthDate).toDate ? (userData.dob || userData.birthDate).toDate() : new Date(userData.dob || userData.birthDate)) : null,
            // S'assurer que les propriétés de vérification sont disponibles
            isEmailVerified: userData.isEmailVerified || userData.emailVerified || false,
            isPhoneVerified: userData.isPhoneVerified || false
          };
          
          console.log('🎯 Données KYC créées:', userKycData);
          console.log('👤 Utilisateur mis à jour avec données Firestore:', updatedUser);
          setSelectedUser(updatedUser);
          
          // Vérifier si l'utilisateur est vérifié mais n'a pas de sous-documents
          const isVerified = userData.kycStatus === 'verified' || userData.verificationStatus === 'verified';
          const hasSubDocuments = userData.accounts && userData.accounts.length > 0;
          
          if (isVerified && !hasSubDocuments) {
            console.log('🎯 Utilisateur déjà vérifié mais sans sous-documents - Création automatique...');
            await createUserSubDocuments(userId);
          }
          break;

        default:
          break;
      }
    } catch (error) {
      console.error(`Erreur lors du chargement de ${sectionId}:`, error);
      // En cas d'erreur, initialiser avec des valeurs par défaut pour éviter la page blanche
      switch (sectionId) {
        case 'accounts':
          setUserAccounts([]);
          break;
        case 'history':
          setUserTransactions([]);
          break;
        case 'rib':
          setUserRib(null);
          break;
        case 'billing':
          setUserBilling(null);
          break;
        case 'card':
          setUserCards([]);
          break;
        case 'budget':
          setUserBudget(null);
          break;
        // case 'kyc': // SUPPRIMÉ - intégré dans l'onglet profil
          // setUserKyc(null); // Plus nécessaire
          // break;
        case 'notifications':
          setUserNotifications([]);
          break;
        case 'profile':
          setUserKyc(null);
          break;
      }
    }
  };

  // Charger les données quand l'onglet change
  useEffect(() => {
    if (selectedUser && (selectedUser.uid || selectedUser.id) && activeSection) {
      const userId = selectedUser.uid || selectedUser.id;
      if (userId) {
        // Éviter de recharger si les données sont déjà chargées
        const shouldLoadData = 
          (activeSection === 'profile' && !userKyc) ||
          (activeSection === 'accounts' && userAccounts.length === 0) ||
          (activeSection === 'history' && userTransactions.length === 0) ||
          (activeSection === 'rib' && !userRib) ||
          (activeSection === 'billing' && !userBilling) ||
          (activeSection === 'card' && userCards.length === 0) ||
          (activeSection === 'budget' && !userBudget) ||
          (activeSection === 'notifications' && userNotifications.length === 0);
        
        if (shouldLoadData) {
          console.log('🔄 useEffect: Chargement des données pour l\'onglet:', activeSection);
          loadSectionData(activeSection, userId);
        } else {
          console.log('🔄 useEffect: Données déjà chargées pour l\'onglet:', activeSection);
        }
      }
    }
  }, [activeSection]); // Supprimé selectedUser des dépendances

  // Protection contre la perte d'état
  useEffect(() => {
    if (showUserPage && selectedUser && !activeSection) {
      setActiveSection('profile');
    }
  }, [showUserPage, selectedUser, activeSection]);

  const handleManageUser = async (user: UserType) => {
    console.log('🔄 handleManageUser appelé avec:', user);
    console.log('📊 Données utilisateur complètes:', {
      firstName: user.firstName,
      lastName: user.lastName,
      dob: user.dob,
      pob: user.pob,
      nationality: user.nationality,
      profession: user.profession,
      salary: user.salary,
      address: user.address,
      city: user.city,
      postalCode: user.postalCode
    });
    
    setSelectedUser(user);
    setShowUserPage(true);
    setActiveSection('profile');
    
    // Réinitialiser tous les états
    setUserAccounts([]);
    setUserTransactions([]);
    setUserRib(null);
    setUserBilling(null);
    setUserCards([]);
    setUserBudget(null);
    setUserNotifications([]);
    
    // Charger immédiatement les données du profil
    if (user.uid || user.id) {
      const userId = user.uid || user.id;
      console.log('💾 Chargement immédiat des données du profil pour:', userId);
      
      if (userId) {
        try {
          // Récupérer le document utilisateur complet
          const userDoc = await getDoc(doc(db, 'users', userId));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log('📋 Données Firestore récupérées:', userData);
            console.log('🔍 Détails des dates et vérifications:');
            console.log('  - emailVerifiedAt:', userData.emailVerifiedAt, 'Type:', typeof userData.emailVerifiedAt);
            console.log('  - emailVerifiedAt (raw):', userData.emailVerifiedAt);
            console.log('  - lastSignInTime:', userData.lastSignInTime, 'Type:', typeof userData.lastSignInTime);
            console.log('  - createdAt:', userData.createdAt, 'Type:', typeof userData.createdAt);
            console.log('  - updatedAt:', userData.updatedAt, 'Type:', typeof userData.updatedAt);
            console.log('  - lastUpdated:', userData.lastUpdated, 'Type:', typeof userData.lastUpdated);
            console.log('  - isEmailVerified:', userData.isEmailVerified, 'Type:', typeof userData.isEmailVerified);
            console.log('  - emailVerified:', userData.emailVerified, 'Type:', typeof userData.emailVerified);
            console.log('  - isPhoneVerified:', userData.isPhoneVerified, 'Type:', typeof userData.isPhoneVerified);
            console.log('  - status:', userData.status, 'Type:', typeof userData.status);
            console.log('  - kycStatus:', userData.kycStatus, 'Type:', typeof userData.kycStatus);
            console.log('  - verificationStatus:', userData.verificationStatus, 'Type:', typeof userData.verificationStatus);
            console.log('  - dob:', userData.dob, 'Type:', typeof userData.dob);
            console.log('  - birthDate:', userData.birthDate, 'Type:', typeof userData.birthDate);
            console.log('  - pob:', userData.pob, 'Type:', typeof userData.pob);
            console.log('  - birthPlace:', userData.birthPlace, 'Type:', typeof userData.birthPlace);
            console.log('  - nationality:', userData.nationality, 'Type:', typeof userData.nationality);
            console.log('  - profession:', userData.profession, 'Type:', typeof userData.profession);
            console.log('  - salary:', userData.salary, 'Type:', typeof userData.salary);
            console.log('  - address:', userData.address, 'Type:', typeof userData.address);
            console.log('  - city:', userData.city, 'Type:', typeof userData.city);
            console.log('  - postalCode:', userData.postalCode, 'Type:', typeof userData.postalCode);
            console.log('  - advisorId:', userData.advisorId, 'Type:', typeof userData.advisorId);
            console.log('  - inactivityTimeout:', userData.inactivityTimeout, 'Type:', typeof userData.inactivityTimeout);
            
            // Vérifier si les dates sont des timestamps Firestore
            if (userData.emailVerifiedAt && typeof userData.emailVerifiedAt === 'object' && userData.emailVerifiedAt.toDate) {
              console.log('  - emailVerifiedAt est un timestamp Firestore');
            }
            if (userData.lastSignInTime && typeof userData.lastSignInTime === 'object' && userData.lastSignInTime.toDate) {
              console.log('  - lastSignInTime est un timestamp Firestore');
            }
            if (userData.createdAt && typeof userData.createdAt === 'object' && userData.createdAt.toDate) {
              console.log('  - createdAt est un timestamp Firestore');
            }
            
            // Créer l'objet KYC avec toutes les données
            const userKycData = {
              id: 'kyc_' + userId,
              status: userData.kycStatus || userData.verificationStatus || 'unverified',
              personalInfo: {
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                phone: userData.phone,
                dob: userData.dob || userData.birthDate,
                pob: userData.pob || userData.birthPlace,
                nationality: userData.nationality,
                residenceCountry: userData.residenceCountry || userData.country,
                address: userData.address,
                city: userData.city,
                postalCode: userData.postalCode,
                profession: userData.profession,
                salary: userData.salary
              },
              verifiedAt: userData.verifiedAt,
              validatedAt: userData.validatedAt,
              rejectedAt: userData.rejectedAt,
              updatedAt: userData.updatedAt || userData.lastUpdated
            };
            
            console.log('🎯 Données KYC créées:', userKycData);
            setUserKyc(userKycData);
            
            // Mettre à jour selectedUser avec toutes les données Firestore
            const updatedUser = {
              ...selectedUser,
              ...userData,
              uid: userId, // S'assurer que uid est défini
              email: userData.email || selectedUser?.email || '', // S'assurer que email est défini
              kycStatus: userData.kycStatus || userData.verificationStatus || 'unverified', // S'assurer que kycStatus a une valeur
              status: userData.status || 'active', // S'assurer que status a une valeur
              // Convertir les timestamps Firestore en objets Date
              emailVerifiedAt: userData.emailVerifiedAt ? 
                (userData.emailVerifiedAt.toDate ? userData.emailVerifiedAt.toDate() : new Date(userData.emailVerifiedAt)) : null,
              lastSignInTime: userData.lastSignInTime ? 
                (userData.lastSignInTime.toDate ? userData.lastSignInTime.toDate() : new Date(userData.lastSignInTime)) : null,
              createdAt: userData.createdAt ? 
                (userData.createdAt.toDate ? userData.createdAt.toDate() : new Date(userData.createdAt)) : null,
              updatedAt: userData.updatedAt || userData.lastUpdated ? 
                ((userData.updatedAt || userData.lastUpdated).toDate ? (userData.updatedAt || userData.lastUpdated).toDate() : new Date(userData.updatedAt || userData.lastUpdated)) : null,
              verifiedAt: userData.verifiedAt ? 
                (userData.verifiedAt.toDate ? userData.verifiedAt.toDate() : new Date(userData.verifiedAt)) : null,
              validatedAt: userData.validatedAt ? 
                (userData.validatedAt.toDate ? userData.validatedAt.toDate() : new Date(userData.validatedAt)) : null,
              rejectedAt: userData.rejectedAt ? 
                (userData.rejectedAt.toDate ? userData.rejectedAt.toDate() : new Date(userData.rejectedAt)) : null,
              dob: userData.dob || userData.birthDate ? 
                ((userData.dob || userData.birthDate).toDate ? (userData.dob || userData.birthDate).toDate() : new Date(userData.dob || userData.birthDate)) : null,
              // S'assurer que les propriétés de vérification sont disponibles
              isEmailVerified: userData.isEmailVerified || userData.emailVerified || false,
              isPhoneVerified: userData.isPhoneVerified || false
            };
            
            console.log('👤 Utilisateur mis à jour avec données Firestore:', updatedUser);
            setSelectedUser(updatedUser);
            
            // Vérifier si l'utilisateur est vérifié mais n'a pas de sous-documents
            const isVerified = userData.kycStatus === 'verified' || userData.verificationStatus === 'verified';
            const hasSubDocuments = userData.accounts && userData.accounts.length > 0;
            
            if (isVerified && !hasSubDocuments) {
              console.log('🎯 Utilisateur déjà vérifié mais sans sous-documents - Création automatique...');
              await createUserSubDocuments(userId);
            }
            
          } else {
            console.log('❌ Document utilisateur non trouvé dans Firestore');
          }
        } catch (error) {
          console.error('❌ Erreur lors du chargement des données Firestore:', error);
        }
      }
    }
    
    // Réinitialiser le formulaire de facturation
    setBillingForm({
      billingHolder: '',
      billingIban: '',
      billingBic: '',
      advisorId: '',
      billingText: ''
    });
    
    // Initialiser la visibilité de la facturation depuis l'utilisateur
    setBillingVisible(user.billingVisible !== false);
    
    // Réinitialiser les états de notification
    setShowNewNotificationForm(false);
    setNewNotification({
      title: '',
      message: '',
      category: 'general',
      type: 'info',
      priority: 'medium'
    });
  };

  const handleBackToList = () => {
    setShowUserPage(false);
    setSelectedUser(null);
    setActiveSection('profile');
    setUserAccounts([]);
    setUserTransactions([]);
    setUserRib(null);
    setUserBilling(null);
    setUserCards([]);
    setUserBudget(null);
    setUserNotifications([]);
    setUserKyc(null);
    
    // Réinitialiser le formulaire de facturation
    setBillingForm({
      billingHolder: '',
      billingIban: '',
      billingBic: '',
      advisorId: '',
      billingText: ''
    });
    
    // Réinitialiser la visibilité de la facturation
    setBillingVisible(true);
    
    // Réinitialiser les états de notification
    setShowNewNotificationForm(false);
    setNewNotification({
      title: '',
      message: '',
      category: 'general',
      type: 'info',
      priority: 'medium'
    });
    
    // Réinitialiser l'état local du statut KYC
    // setCurrentKycStatus('pending'); // SUPPRIMÉ - plus nécessaire
  };

  const sections = [
    { id: 'profile', name: 'Mon profil', icon: User },
    { id: 'accounts', name: 'Mes comptes et transactions', icon: CreditCard },
    { id: 'history', name: 'Historiques des transactions', icon: Clock },
    { id: 'rib', name: 'Mon RIB', icon: FileText },
    { id: 'billing', name: 'Facturation', icon: DollarSign },
    { id: 'card', name: 'Carte', icon: Eye },
    { id: 'budget', name: 'Budget', icon: PieChart },
    { id: 'notifications', name: 'Notifications', icon: Bell },
  ];

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Informations du profil</h3>
            
            {/* Informations de base */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Informations personnelles</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Prénom</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">{selectedUser?.firstName || 'Non renseigné'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">{selectedUser?.lastName || 'Non renseigné'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">E-Mail</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">{selectedUser?.email || 'Non renseigné'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">{selectedUser?.phone || 'Non renseigné'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date de naissance</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">
                    {(() => {
                      const birthDate = (selectedUser as any)?.birthDate || selectedUser?.dob;
                      if (!birthDate) return 'Non renseigné';
                      
                      try {
                        if (birthDate instanceof Date) {
                          return birthDate.toLocaleDateString('fr-FR');
                        } else {
                          return new Date(birthDate).toLocaleDateString('fr-FR');
                        }
                      } catch (error) {
                        return birthDate.toString();
                      }
                    })()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lieu de naissance</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">
                    {(selectedUser as any)?.birthPlace || selectedUser?.pob || 'Non renseigné'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nationalité</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">{selectedUser?.nationality || 'Non renseigné'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pays de résidence</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">{selectedUser?.residenceCountry || selectedUser?.country || 'Non renseigné'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Adresse</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">{selectedUser?.address || 'Non renseigné'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ville</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">{selectedUser?.city || 'Non renseigné'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Code postal</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">{selectedUser?.postalCode || 'Non renseigné'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Profession</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">{selectedUser?.profession || 'Non renseigné'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Salaire</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">
                    {selectedUser?.salary ? `${selectedUser.salary} €` : 'Non renseigné'}
                  </p>
                </div>
              </div>
            </div>

            {/* Informations supplémentaires */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Informations supplémentaires</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rôle</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md capitalize">user</p>
                  </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Statut du compte</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md capitalize">{selectedUser?.status || 'active'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Conseiller ID</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">{selectedUser?.advisorId || 'Non assigné'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pays d'origine</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">{selectedUser?.nationality || selectedUser?.pob || 'Non renseigné'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Inactivité (minutes)</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">{selectedUser?.inactivityTimeout || 'Non défini'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">UID Firebase</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md font-mono text-xs">{selectedUser?.uid || 'Non disponible'}</p>
                </div>
              </div>
            </div>

            {/* Gestion du statut KYC */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-medium text-gray-900">Statut KYC</h4>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  selectedUser?.kycStatus === 'verified' ? 'bg-green-100 text-green-800' :
                  selectedUser?.kycStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  selectedUser?.kycStatus === 'unverified' ? 'bg-gray-100 text-gray-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedUser?.kycStatus === 'verified' ? '✅ Vérifié' :
                   selectedUser?.kycStatus === 'pending' ? '⏳ En attente' :
                   selectedUser?.kycStatus === 'unverified' ? '❌ Non vérifié' :
                   '❓ Inconnu'}
                </span>
              </div>
              
              {/* Boutons de changement de statut */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleUpdateKycStatus('pending')}
                  className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
                    selectedUser?.kycStatus === 'pending'
                      ? 'bg-yellow-100 border-yellow-300 text-yellow-800'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-yellow-50 hover:border-yellow-300'
                  }`}
                >
                  ⏳ Marquer en attente
                </button>
                <button
                  onClick={() => handleUpdateKycStatus('verified')}
                  className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
                    selectedUser?.kycStatus === 'verified'
                      ? 'bg-green-100 border-green-300 text-green-800'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-green-50 hover:border-green-300'
                  }`}
                >
                  ✅ Approuver
                </button>
                <button
                  onClick={() => handleUpdateKycStatus('unverified')}
                  className={`px-4 py-2 text-sm font-medium rounded-md border transition-colors ${
                    selectedUser?.kycStatus === 'unverified'
                      ? 'bg-gray-100 border-gray-300 text-gray-800'
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  ❌ Rejeter
                </button>
              </div>
              
              {/* Bouton pour forcer la création des sous-documents si vérifié mais sans sous-documents */}
              {selectedUser?.kycStatus === 'verified' && (!userAccounts || userAccounts.length === 0) && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-3">
                    L'utilisateur est vérifié mais n'a pas de sous-documents. Cliquez ci-dessous pour les créer automatiquement.
                  </p>
                  <button
                    onClick={() => {
                      if (selectedUser?.uid || selectedUser?.id) {
                        const userId = selectedUser.uid || selectedUser.id;
                        createUserSubDocuments(userId);
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    🏗️ Créer les sous-documents
                  </button>
                </div>
              )}
            </div>

            {/* Informations de vérification et sécurité */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Vérification et sécurité</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email vérifié</label>
                  <p className={`text-sm p-2 sm:p-3 rounded-md ${
                    selectedUser?.isEmailVerified
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedUser?.isEmailVerified ? '✅ Vérifié' : '❌ Non vérifié'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone vérifié</label>
                  <p className={`text-sm p-2 sm:p-3 rounded-md ${
                    selectedUser?.isPhoneVerified
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedUser?.isPhoneVerified ? '✅ Vérifié' : '❌ Non vérifié'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date de vérification email</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">
                    {selectedUser?.emailVerifiedAt ? 
                      (selectedUser.emailVerifiedAt instanceof Date ? 
                        selectedUser.emailVerifiedAt.toLocaleDateString('fr-FR') : 
                        new Date(selectedUser.emailVerifiedAt).toLocaleDateString('fr-FR')
                      ) : selectedUser?.isEmailVerified ? 'Vérifié (date non disponible)' : 'Non vérifié'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dernière connexion</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">
                    {selectedUser?.lastSignInTime ? 
                      (selectedUser.lastSignInTime instanceof Date ? 
                        selectedUser.lastSignInTime.toLocaleDateString('fr-FR') : 
                        new Date(selectedUser.lastSignInTime).toLocaleDateString('fr-FR')
                      ) : 'Jamais'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Compte créé le</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">
                    {selectedUser?.createdAt ? 
                      (selectedUser.createdAt instanceof Date ? 
                        selectedUser.createdAt.toLocaleDateString('fr-FR') : 
                        new Date(selectedUser.createdAt).toLocaleDateString('fr-FR')
                      ) : 'Inconnu'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dernière mise à jour</label>
                  <p className="text-sm text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">
                    {selectedUser?.updatedAt ? 
                      (selectedUser.updatedAt instanceof Date ? 
                        selectedUser.updatedAt.toLocaleDateString('fr-FR') : 
                        new Date(selectedUser.updatedAt).toLocaleDateString('fr-FR')
                      ) : 'Inconnu'}
                    </p>
                </div>
              </div>
            </div>


          </div>
        );
      case 'accounts':
        return (
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Comptes et transactions</h3>
            {userAccounts.length > 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900">Comptes bancaires</h4>
                </div>
                <div className="divide-y divide-gray-200">
                  {userAccounts.map((account) => (
                    <div key={account.id} className="px-4 sm:px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{account.name}</p>
                          <p className="text-sm text-gray-500">{account.accountNumber}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{account.balance} €</p>
                          <p className="text-xs text-gray-500">{account.currency}</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          account.status === 'active' ? 'bg-green-100 text-green-800' :
                          account.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {account.status === 'active' ? 'Actif' :
                           account.status === 'inactive' ? 'Inactif' : 'En attente'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="text-center py-8 sm:py-12">
                  <CreditCard className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun compte trouvé</h3>
                  <p className="mt-1 text-xs sm:text-sm text-gray-500">Aucun compte bancaire n'est associé à cet utilisateur.</p>
                </div>
              </div>
            )}
          </div>
        );
      case 'history':
        return (
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Historique des transactions</h3>
            {userTransactions.length > 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900">Transactions récentes</h4>
                </div>
                <div className="divide-y divide-gray-200">
                  {userTransactions.map((transaction) => (
                    <div key={transaction.id} className="px-4 sm:px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                          <p className="text-sm text-gray-500">{transaction.category}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {transaction.amount > 0 ? '+' : ''}{transaction.amount} €
                          </p>
                          <p className="text-xs text-gray-500">
                            {transaction.date ? new Date(transaction.date.toDate()).toLocaleDateString() : 'Date inconnue'}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {transaction.status === 'completed' ? 'Terminé' :
                           transaction.status === 'pending' ? 'En attente' : 'En cours'}
                        </span>
                        {transaction.beneficiaryName && (
                          <span className="text-xs text-gray-500">
                            Vers: {transaction.beneficiaryName}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="text-center py-8 sm:py-12">
                  <Clock className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune transaction</h3>
                  <p className="mt-1 text-xs sm:text-sm text-gray-500">Aucune transaction trouvée pour cet utilisateur.</p>
                </div>
              </div>
            )}
          </div>
        );
      case 'rib':
        return (
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Mon RIB</h3>
            {userRib ? (
              <div className="space-y-4 sm:space-y-6">
                {/* Informations RIB principales */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Informations bancaires</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">IBAN</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md font-mono">{userRib.iban}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">BIC/SWIFT</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md font-mono">{userRib.bic}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Titulaire du compte</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">{userRib.holder}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Banque</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">AMCB Bank</p>
                    </div>
                  </div>
                </div>

                {/* Comptes associés */}
                {userRib.accounts && userRib.accounts.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Comptes associés</h4>
                    <div className="space-y-3">
                      {userRib.accounts.map((account: any) => (
                        <div key={account.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{account.name}</p>
                            <p className="text-xs text-gray-500">{account.accountNumber}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold text-gray-900">{account.balance}€</p>
                            <p className="text-xs text-gray-500">{account.currency}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bénéficiaires */}
                {userRib.beneficiaries && userRib.beneficiaries.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Bénéficiaires enregistrés</h4>
                    <div className="space-y-3">
                      {userRib.beneficiaries.map((beneficiary: any) => (
                        <div key={beneficiary.id} className="p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-900">{beneficiary.name}</p>
                            {beneficiary.nickname && (
                              <span className="text-xs text-gray-500">({beneficiary.nickname})</span>
                            )}
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600">
                            <span>IBAN: {beneficiary.iban}</span>
                            <span>BIC: {beneficiary.bic}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
                <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune information RIB</h3>
                <p className="mt-1 text-sm text-gray-500">Aucune information RIB n'est disponible pour cet utilisateur.</p>
              </div>
            )}
          </div>
        );
      case 'billing':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Facturation</h3>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    billingVisible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    <span className={`w-2 h-2 rounded-full mr-1.5 ${
                      billingVisible ? 'bg-green-400' : 'bg-red-400'
                    }`}></span>
                    {billingVisible ? 'VISIBLE' : 'MASQUÉE'}
                  </span>
                </div>
                <button
                  onClick={handleToggleBillingVisibility}
                  className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
                    billingVisible 
                      ? 'bg-red-600 hover:bg-red-700 text-white' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {billingVisible ? 'Masquer la facturation' : 'Afficher la facturation'}
                </button>
              </div>
            </div>
            
            {!billingVisible ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
                <div className="text-yellow-800">
                  <svg className="mx-auto h-12 w-12 text-yellow-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <h4 className="text-lg font-medium mb-2">Facturation temporairement masquée</h4>
                  <p className="text-sm">
                    La facturation est actuellement masquée pour ce client. 
                    Dans l'app client, le message "Aucune facturation disponible" sera affiché.
                  </p>
                  <p className="text-xs mt-2 text-yellow-600">
                    Cliquez sur "Afficher la facturation" pour la rendre à nouveau visible.
                  </p>
                </div>
              </div>
            ) : (
              userBilling ? (
                <div className="space-y-4 sm:space-y-6">
                  {/* Informations de facturation principales */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Informations de facturation</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Titulaire du compte</label>
                        <input
                          type="text"
                          value={billingForm.billingHolder}
                          onChange={(e) => handleBillingChange('billingHolder', e.target.value)}
                          placeholder="Nom du titulaire"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">IBAN de facturation</label>
                        <input
                          type="text"
                          value={billingForm.billingIban}
                          onChange={(e) => handleBillingChange('billingIban', e.target.value)}
                          placeholder="FR76 0000 0000 0000 0000 0000 000"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">BIC de facturation</label>
                        <input
                          type="text"
                          value={billingForm.billingBic}
                          onChange={(e) => handleBillingChange('billingBic', e.target.value)}
                          placeholder="BIC/SWIFT"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Conseiller financier</label>
                        <input
                          type="text"
                          value={billingForm.advisorId}
                          readOnly
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600 cursor-not-allowed"
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button 
                        onClick={handleSaveBilling}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Sauvegarder les modifications
                      </button>
                    </div>
                  </div>

                  {/* Message de facturation */}
                  {billingForm.billingText && (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                      <h4 className="text-sm font-medium text-gray-900 mb-4">Message de facturation</h4>
                      <textarea
                        rows={6}
                        value={billingForm.billingText}
                        onChange={(e) => handleBillingChange('billingText', e.target.value)}
                        placeholder="Message de facturation personnalisé..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <div className="mt-4 flex justify-end">
                        <button 
                          onClick={handleSaveBilling}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          Mettre à jour le message
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
                  <Receipt className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Chargement des informations de facturation...</h3>
                  <p className="mt-1 text-sm text-gray-500">Veuillez patienter pendant le chargement des données.</p>
                </div>
              )
            )}
          </div>
        );
      case 'card':
        return (
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Cartes bancaires</h3>
            {userCards.length > 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900">Cartes actives</h4>
                </div>
                <div className="divide-y divide-gray-200">
                  {userCards.map((card) => (
                    <div key={card.id} className="px-4 sm:px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-md flex items-center justify-center">
                            <CreditCard className="h-6 w-6 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Carte {card.type}</p>
                            <p className="text-sm text-gray-500">Statut: {card.status}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {card.status === 'requested' ? 'Demandée' : 
                             card.status === 'active' ? 'Active' : 
                             card.status === 'none' ? 'Aucune' : card.status}
                          </p>
                          {card.requestedAt && (
                            <p className="text-xs text-gray-500">
                              Demandée le {new Date(card.requestedAt).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {card.limits && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-500">Limite mensuelle:</span>
                              <p className="font-medium text-gray-900">{card.limits.monthly}€</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Limite retrait:</span>
                              <p className="font-medium text-gray-900">{card.limits.withdrawal}€</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
                <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune carte</h3>
                <p className="mt-1 text-sm text-gray-500">Cet utilisateur n'a pas encore de carte bancaire.</p>
              </div>
            )}
          </div>
        );
      case 'budget':
        return (
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Budget et finances</h3>
            {userBudget ? (
              <div className="space-y-4 sm:space-y-6">
                {/* Résumé financier */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Résumé financier</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{userBudget.monthlyIncome}€</p>
                      <p className="text-sm text-blue-600">Revenus mensuels</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        {userAccounts.reduce((total: number, account: any) => total + (account.balance || 0), 0)}€
                      </p>
                      <p className="text-sm text-green-600">Total des comptes</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">
                        {userBudget.cardLimits?.monthly || 0}€
                      </p>
                      <p className="text-sm text-purple-600">Limite carte</p>
                    </div>
                  </div>
                </div>

                {/* Limites de carte */}
                {userBudget.cardLimits && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Limites de carte</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Limite mensuelle</label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">{userBudget.cardLimits.monthly}€</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Limite retrait</label>
                        <p className="text-sm text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">{userBudget.cardLimits.withdrawal}€</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Budgets personnalisés */}
                {userBudget.budgets && userBudget.budgets.length > 0 && (
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Budgets personnalisés</h4>
                    <div className="space-y-3">
                      {userBudget.budgets.map((budget: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm font-medium text-gray-900">{budget.name || `Budget ${index + 1}`}</span>
                          <span className="text-sm text-gray-600">{budget.amount || 0}€</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
                <PieChart className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun budget configuré</h3>
                <p className="mt-1 text-sm text-gray-500">Cet utilisateur n'a pas encore configuré de budget.</p>
              </div>
            )}
          </div>
        );
      // case 'kyc': // SUPPRIMÉ - intégré dans l'onglet profil
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Statut KYC</h3>
              
              {/* Statut actuel et boutons - seulement si userKyc existe */}
              {userKyc ? (
                <div className="flex flex-col items-end space-y-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    userKyc.status === 'verified' ? 'bg-green-100 text-green-800' :
                    userKyc.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    userKyc.status === 'unverified' ? 'bg-gray-100 text-gray-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {userKyc.status === 'verified' ? '✅ Statut actuel : Vérifié' :
                     userKyc.status === 'pending' ? '⏳ Statut actuel : En attente' :
                     userKyc.status === 'unverified' ? '❌ Statut actuel : Non vérifié' :
                     '❓ Statut actuel : Inconnu'}
                  </span>
                  
                  {/* Bouton de test */}
                  <button
                    onClick={() => {
                      console.log('🧪 Bouton de test cliqué !');
                      console.log('🔄 Navigation vers l\'onglet KYC');
                      setActiveSection('kyc');
                    }}
                    className="px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    🧪 Aller à KYC
                  </button>
                  
                  {/* Bouton de retour au profil */}
                  <button
                    onClick={() => {
                      console.log('🔄 Retour à l\'onglet profil');
                      setActiveSection('profile');
                    }}
                    className="px-3 py-2 text-sm font-medium bg-gray-600 text-white rounded-md hover:bg-gray-700"
                  >
                    🔙 Retour Profil
                  </button>
                  
                  {/* Boutons pour changer le statut KYC */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        console.log('🖱️ Clic sur bouton Pending');
                        handleUpdateKycStatus('pending');
                      }}
                      className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                        userKyc.status === 'pending'
                          ? 'bg-yellow-100 border-yellow-300 text-yellow-800'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-yellow-50 hover:border-yellow-300'
                      }`}
                    >
                      ⏳ Pending
                    </button>
                    <button
                      onClick={() => {
                        console.log('🖱️ Clic sur bouton Verified');
                        handleUpdateKycStatus('verified');
                      }}
                      className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                        userKyc.status === 'verified'
                          ? 'bg-green-100 border-green-300 text-green-800'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-green-50 hover:border-green-300'
                      }`}
                    >
                      ✅ Verified
                    </button>
                    <button
                      onClick={() => {
                        console.log('🖱️ Clic sur bouton Unverified');
                        handleUpdateKycStatus('unverified');
                      }}
                      className={`px-3 py-2 text-sm font-medium rounded-md border transition-colors ${
                        userKyc.status === 'unverified'
                          ? 'bg-gray-100 border-gray-300 text-gray-800'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      ❌ Unverified
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  Chargement des données KYC...
                </div>
              )}
            </div>

            {userKyc ? (
              <div className="space-y-4 sm:space-y-6">
                {/* Statut actuel avec détails */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900 mb-2">
                        {userKyc.status === 'verified' ? '✅' :
                         userKyc.status === 'pending' ? '⏳' : 
                         userKyc.status === 'unverified' ? '❌' : '❓'}
                      </div>
                      <p className="text-sm font-medium text-gray-700">Statut KYC</p>
                      <p className={`text-lg font-semibold ${
                        userKyc.status === 'verified' ? 'text-green-600' :
                        userKyc.status === 'pending' ? 'text-yellow-600' :
                        userKyc.status === 'unverified' ? 'text-gray-600' :
                        'text-gray-600'
                      }`}>
                        {userKyc.status === 'verified' ? 'Vérifié' :
                         userKyc.status === 'pending' ? 'En attente' :
                         userKyc.status === 'unverified' ? 'Non vérifié' : 'Inconnu'}
                      </p>
                    </div>
                    
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900 mb-2">
                        {userKyc.documents?.length || 0}
                      </div>
                      <p className="text-sm font-medium text-gray-700">Documents</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {userKyc.documents?.length || 0} soumis
                      </p>
                    </div>
                    
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900 mb-2">
                        {userKyc.verifiedAt ? '✅' : '❌'}
                      </div>
                      <p className="text-sm font-medium text-gray-700">Vérification</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {userKyc.verifiedAt ? 'Complétée' : 'En cours'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Informations personnelles */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Informations personnelles</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Prénom (Vorname)</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">{userKyc.personalInfo?.firstName || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nom (Nachname)</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">{userKyc.personalInfo?.lastName || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Date de naissance (Geburtsdatum)</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">
                        {userKyc.personalInfo?.dob ? new Date(userKyc.personalInfo.dob.toDate()).toLocaleDateString('fr-FR') : 'Non renseigné'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Nationalité (Nationalität)</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">{userKyc.personalInfo?.nationality || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pays de résidence (Wohnsitzland)</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">{userKyc.personalInfo?.residenceCountry || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Profession (Beruf)</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">{userKyc.personalInfo?.profession || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Salaire (Gehalt)</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">{userKyc.personalInfo?.salary ? `${userKyc.personalInfo.salary}€` : 'Non renseigné'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Téléphone</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">{userKyc.personalInfo?.phone || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-2 sm:p-3 rounded-md">{userKyc.personalInfo?.email || 'Non renseigné'}</p>
                    </div>
                  </div>
                </div>

                {/* Documents KYC */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Documents KYC</h4>
                  {userKyc.documents && userKyc.documents.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {userKyc.documents.map((doc: any, index: number) => (
                        <div key={doc.id || index} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{doc.type || `Document ${index + 1}`}</p>
                                <p className="text-xs text-gray-500">{doc.status || 'En attente'}</p>
                              </div>
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                              doc.status === 'approved' ? 'bg-green-100 text-green-800' :
                              doc.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {doc.status === 'approved' ? 'Approuvé' :
                               doc.status === 'rejected' ? 'Rejeté' : 'En attente'}
                            </span>
                          </div>
                          {doc.description && (
                            <p className="text-xs text-gray-600 mb-2">{doc.description}</p>
                          )}
                          {doc.uploadedAt && (
                            <p className="text-xs text-gray-500">
                              Soumis le {new Date(doc.uploadedAt.toDate()).toLocaleDateString('fr-FR')}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun document</h3>
                      <p className="mt-1 text-sm text-gray-500">Aucun document KYC n'a été soumis.</p>
                    </div>
                  )}
                </div>

                {/* Historique des changements de statut */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Historique des changements</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Statut actuel</p>
                        <p className="text-xs text-gray-500">
                          {userKyc.status === 'verified' ? 'Vérifié et approuvé' :
                           userKyc.status === 'pending' ? 'En attente de vérification' :
                           userKyc.status === 'unverified' ? 'Non vérifié et en attente' :
                           'Statut inconnu'}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        userKyc.status === 'verified' ? 'bg-green-100 text-green-800' :
                        userKyc.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        userKyc.status === 'unverified' ? 'bg-gray-100 text-gray-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {userKyc.status === 'verified' ? 'Vérifié' :
                         userKyc.status === 'pending' ? 'En attente' :
                         userKyc.status === 'unverified' ? 'Non vérifié' : 'Inconnu'}
                      </span>
                    </div>
                    
                    {userKyc.verifiedAt && (
                      <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                        <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                          <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">Vérification complétée</p>
                          <p className="text-xs text-gray-500">
                            Le {new Date(userKyc.verifiedAt.toDate()).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
                <Shield className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Chargement des informations KYC...</h3>
                <p className="mt-1 text-sm text-gray-500">Veuillez patienter pendant le chargement des données.</p>
              </div>
            )}
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Notifications</h3>
              <button
                onClick={() => setShowNewNotificationForm(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle notification
              </button>
            </div>

            {/* Formulaire de création de notification */}
            {showNewNotificationForm && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Créer une nouvelle notification</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Titre</label>
                    <input
                      type="text"
                      value={newNotification.title}
                      onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Titre de la notification"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                    <select
                      value={newNotification.category}
                      onChange={(e) => setNewNotification(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="general">Général</option>
                      <option value="security">Sécurité</option>
                      <option value="transaction">Transaction</option>
                      <option value="feature">Fonctionnalité</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <select
                      value={newNotification.type}
                      onChange={(e) => setNewNotification(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="info">Information</option>
                      <option value="success">Succès</option>
                      <option value="warning">Avertissement</option>
                      <option value="error">Erreur</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priorité</label>
                    <select
                      value={newNotification.priority}
                      onChange={(e) => setNewNotification(prev => ({ ...prev, priority: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="low">Basse</option>
                      <option value="medium">Moyenne</option>
                      <option value="high">Haute</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                  <textarea
                    rows={3}
                    value={newNotification.message}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Message de la notification..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="mt-4 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowNewNotificationForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleCreateNotification}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Créer la notification
                  </button>
                </div>
              </div>
            )}

            {/* Liste des notifications */}
            {userNotifications.length > 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900">Notifications récentes</h4>
                </div>
                <div className="divide-y divide-gray-200">
                  {userNotifications.map((notification) => (
                    <div key={notification.id} className={`px-4 sm:px-6 py-4 ${!notification.read ? 'bg-blue-50' : ''}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h5 className="text-sm font-medium text-gray-900">{notification.title}</h5>
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                              notification.priority === 'high' ? 'bg-red-100 text-red-800' :
                              notification.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {notification.priority === 'high' ? 'Haute' :
                               notification.priority === 'medium' ? 'Moyenne' : 'Basse'}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                              notification.type === 'success' ? 'bg-green-100 text-green-800' :
                              notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                              notification.type === 'error' ? 'bg-red-100 text-red-800' :
                              notification.type === 'info' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {notification.type === 'success' ? 'Succès' :
                               notification.type === 'warning' ? 'Avertissement' :
                               notification.type === 'error' ? 'Erreur' :
                               notification.type === 'info' ? 'Information' :
                               notification.type === 'feature' ? 'Fonctionnalité' :
                               notification.type === 'transaction' ? 'Transaction' :
                               notification.type === 'maintenance' ? 'Maintenance' :
                               notification.type === 'security' ? 'Sécurité' : notification.type}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{notification.message}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>Catégorie: {notification.category}</span>
                            <span>{new Date(notification.date || notification.createdAt).toLocaleDateString('fr-FR')}</span>
                          </div>
                        </div>
                        <div className="ml-4 flex items-center space-x-2">
                          {!notification.read && (
                            <span className="inline-flex items-center justify-center w-2 h-2 bg-blue-600 rounded-full"></span>
                          )}
                          <button
                            onClick={() => handleDeleteNotification(notification.id)}
                            className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
                            title="Supprimer la notification"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8 text-center">
                <Bell className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune notification</h3>
                <p className="mt-1 text-sm text-gray-500">Cet utilisateur n'a pas encore de notifications.</p>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  // Si on affiche la page de gestion d'un utilisateur
  if (showUserPage && selectedUser) {
    return (
      <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* En-tête avec bouton retour */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            onClick={handleBackToList}
            className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors w-fit"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Retour à la liste</span>
            <span className="sm:hidden">Retour</span>
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Gestion de {selectedUser.firstName} {selectedUser.lastName}
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">{selectedUser.email}</p>
          </div>
        </div>

        {/* Onglets */}
        <div className="border-b border-gray-200">
          {/* Version mobile - Dropdown */}
          <div className="block sm:hidden mb-4">
            <div className="relative">
              <button
                onClick={() => setShowSectionDropdown(!showSectionDropdown)}
                className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className="flex items-center">
                  {(() => {
                    const activeSectionData = sections.find(s => s.id === activeSection);
                    const Icon = activeSectionData?.icon || User;
                    return (
                      <>
                        <Icon className="h-4 w-4 mr-2" />
                        {activeSectionData?.name || 'Sélectionner une section'}
                      </>
                    );
                  })()}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>
              
              {showSectionDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {sections.map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.id}
                        onClick={() => {
                          setActiveSection(section.id);
                          setShowSectionDropdown(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2 ${
                          activeSection === section.id
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{section.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Version desktop - Onglets horizontaux */}
          <nav className="hidden sm:flex -mb-px flex-wrap gap-2 sm:gap-4 lg:gap-6 overflow-x-auto pb-2">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`py-2 px-2 sm:px-3 lg:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex items-center space-x-1 sm:space-x-2 min-w-fit ${
                    activeSection === section.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span className="hidden sm:inline">{section.name}</span>
                  <span className="sm:hidden text-xs">{section.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Contenu des onglets */}
        <div className="min-h-80 sm:min-h-96">
          {renderSectionContent()}
        </div>
      </div>
    );
  }

  // Page principale avec la liste des utilisateurs
  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestion des Utilisateurs</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">
          Gérez les utilisateurs et leurs informations
        </p>
      </div>

      {/* Barre de recherche */}
      <div className="flex items-center space-x-2 sm:space-x-4">
        <input
          type="text"
          placeholder="Rechercher un utilisateur..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
        />
      </div>

      {/* Liste des utilisateurs */}
      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 sm:h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Version mobile - Cards */}
          <div className="block sm:hidden">
            <div className="p-4 space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-medium text-sm">
                        {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {user.phone || 'Aucun téléphone'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-600 truncate">
                    {user.email}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.kycStatus === 'verified' ? 'bg-green-100 text-green-800' :
                      user.kycStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      user.kycStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.kycStatus === 'verified' ? 'Vérifié' :
                       user.kycStatus === 'pending' ? 'En attente' :
                       user.kycStatus === 'rejected' ? 'Rejeté' : 'Non vérifié'}
                    </span>
                    
                    <button 
                      onClick={() => handleManageUser(user)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                      Gérer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Version desktop - Table */}
          <div className="hidden sm:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut KYC
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 sm:h-10 sm:w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-3 sm:ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {user.phone}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.kycStatus === 'verified' ? 'bg-green-100 text-green-800' :
                        user.kycStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        user.kycStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.kycStatus === 'verified' ? 'Vérifié' :
                         user.kycStatus === 'pending' ? 'En attente' :
                         user.kycStatus === 'rejected' ? 'Rejeté' : 'Non vérifié'}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleManageUser(user)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      >
                        Gérer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Modale de confirmation pour suppression de notification */}
      {showDeleteNotificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900">Confirmer la suppression</h3>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Êtes-vous sûr de vouloir supprimer cette notification ? Cette action ne peut pas être annulée.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteNotificationModal(false);
                  setNotificationToDelete(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Annuler
              </button>
              <button
                onClick={confirmDeleteNotification}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale de confirmation pour changement de statut KYC - SUPPRIMÉE */}
      
      {/* Notifications Toast */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toastNotifications.map((toast) => (
          <div
            key={toast.id}
            className={`max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden transform transition-all duration-300 ease-in-out ${
              toast.type === 'success' ? 'ring-green-500' :
              toast.type === 'error' ? 'ring-red-500' :
              toast.type === 'warning' ? 'ring-yellow-500' :
              'ring-blue-500'
            }`}
          >
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {toast.type === 'success' && (
                    <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {toast.type === 'error' && (
                    <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                  {toast.type === 'warning' && (
                    <svg className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  )}
                  {toast.type === 'info' && (
                    <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className="text-sm font-medium text-gray-900">{toast.title}</p>
                  <p className="mt-1 text-sm text-gray-500">{toast.message}</p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    onClick={() => removeToastNotification(toast.id)}
                    className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <span className="sr-only">Fermer</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Fonction pour créer automatiquement les sous-documents d'un utilisateur vérifié
  const createUserSubDocuments = async (userId: string) => {
    console.log('🏗️ Création des sous-documents pour l\'utilisateur:', userId);
    
    try {
      const userRef = doc(db, 'users', userId);
      
      // 1. Créer les comptes bancaires par défaut
      const defaultAccounts = [
        {
          id: `checking-${userId}`,
          name: 'Compte courant',
          accountNumber: `**** **** **** ${Math.floor(Math.random() * 9000) + 1000}`,
          balance: 0,
          currency: 'EUR',
          status: 'active',
          type: 'checking'
        },
        {
          id: `savings-${userId}`,
          name: 'Compte épargne',
          accountNumber: `**** **** **** ${Math.floor(Math.random() * 9000) + 1000}`,
          balance: 0,
          currency: 'EUR',
          status: 'active',
          type: 'savings'
        }
      ];

      // 2. Créer les informations de facturation par défaut
      const defaultBilling = {
        billingHolder: `${selectedUser?.firstName || ''} ${selectedUser?.lastName || ''}`.trim(),
        billingIban: `FR76 ${Math.floor(Math.random() * 9000) + 1000} ${Math.floor(Math.random() * 9000) + 1000} ${Math.floor(Math.random() * 9000) + 1000} ${Math.floor(Math.random() * 9000) + 1000} ${Math.floor(Math.random() * 9000) + 1000}`,
        billingBic: 'SMOEFRP1',
        billingText: `Bienvenue ${selectedUser?.firstName || ''} ! Votre compte a été vérifié et activé.`,
        billingVisible: true,
        advisorId: 'advisor_default'
      };

      // 3. Créer les limites de carte par défaut
      const defaultCardLimits = {
        monthly: 2000,
        withdrawal: 500
      };

      // 4. Créer les préférences de notification par défaut
      const defaultNotificationPrefs = {
        email: true,
        promotions: false,
        security: true
      };

      // 5. Créer les budgets par défaut
      const defaultBudgets = [
        {
          id: `budget-${userId}`,
          name: 'Budget mensuel',
          amount: selectedUser?.salary || 2000,
          spent: 0,
          category: 'general',
          period: 'monthly'
        }
      ];

      // 6. Créer les bénéficiaires par défaut (vide)
      const defaultBeneficiaries: any[] = [];

      // 7. Créer les transactions initiales
      const defaultTransactions = [
        {
          id: `txn_${Date.now()}`,
          accountId: `checking-${userId}`,
          amount: 0,
          currency: 'EUR',
          description: 'Activation du compte',
          category: 'AmCBunq Service',
          status: 'completed',
          date: new Date(),
          type: 'activation'
        }
      ];

      // Mettre à jour le document utilisateur avec tous les sous-documents
      const updateData = {
        accounts: defaultAccounts,
        billingBic: defaultBilling.billingBic,
        billingHolder: defaultBilling.billingHolder,
        billingIban: defaultBilling.billingIban,
        billingText: defaultBilling.billingText,
        billingVisible: defaultBilling.billingVisible,
        advisorId: defaultBilling.advisorId,
        cardLimits: defaultCardLimits,
        cardType: 'standard',
        cardStatus: 'available',
        hasPendingVirtualCardRequest: false,
        notificationPrefs: defaultNotificationPrefs,
        budgets: defaultBudgets,
        beneficiaries: defaultBeneficiaries,
        transactions: defaultTransactions,
        documents: [],
        virtualCards: [],
        inactivityTimeout: 30,
        updatedAt: new Date()
      };

      console.log('📋 Données des sous-documents à créer:', updateData);

      await updateDoc(userRef, updateData);
      console.log('✅ Sous-documents créés avec succès pour l\'utilisateur:', userId);

      // Mettre à jour les états locaux
      setUserAccounts(defaultAccounts);
      setUserTransactions(defaultTransactions);
      setUserBudget({
        id: `budget_${userId}`,
        monthlyIncome: selectedUser?.salary || 2000,
        monthlyExpenses: 0,
        savings: 0,
        budgets: defaultBudgets,
        cardLimits: defaultCardLimits
      });
      setUserBilling({
        invoices: [],
        billingInfo: {
          billingBic: defaultBilling.billingBic,
          billingHolder: defaultBilling.billingHolder,
          billingIban: defaultBilling.billingIban,
          billingText: defaultBilling.billingText,
          advisorId: defaultBilling.advisorId
        }
      });
      setUserCards([{
        id: `card_${userId}`,
        type: 'standard',
        status: 'available',
        limits: defaultCardLimits,
        requestedAt: null,
        hasPendingRequest: false
      }]);
      setUserNotifications([]);
      setUserRib({
        id: `rib_${userId}`,
        iban: defaultBilling.billingIban,
        bic: defaultBilling.billingBic,
        holder: defaultBilling.billingHolder,
        accounts: defaultAccounts,
        beneficiaries: defaultBeneficiaries
      });

      console.log('🎉 Tous les sous-documents ont été créés et les états locaux mis à jour');

    } catch (error) {
      console.error('❌ Erreur lors de la création des sous-documents:', error);
    }
  };
};

export default Users;

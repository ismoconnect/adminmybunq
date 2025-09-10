import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { auth, db } from '../services/firebase';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { AdminAuthService } from '../services/adminAuthService';
import { AdminUser } from '../types/auth';

interface AuthContextType {
  user: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  canAccess: (feature: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        try {
          // Vérifier si l'utilisateur est un admin
          const adminUser = await AdminAuthService.verifyAdminAccess(firebaseUser);
          
          if (adminUser && adminUser.isActive) {
            // Mettre à jour la dernière connexion
            try {
              await AdminAuthService.updateLastLogin(adminUser.uid);
            } catch (error) {
              console.log('Impossible de mettre à jour la dernière connexion:', error);
            }
            
            setUser(adminUser);
            console.log('✅ Admin connecté:', adminUser.email);
          } else {
            // L'utilisateur n'est pas un admin ou est désactivé
            console.log('❌ Accès refusé - Utilisateur non admin ou désactivé');
            await signOut(auth);
            setUser(null);
          }
        } catch (error: any) {
          console.log('Vérification des droits admin:', error.message);
          
          // Si c'est une erreur de permissions, l'utilisateur n'est probablement pas admin
          if (error.message?.includes('permissions') || error.code === 'permission-denied') {
            console.log('❌ Accès refusé - Erreur de permissions');
            await signOut(auth);
            setUser(null);
          } else {
            console.error('Erreur lors de la vérification des droits admin:', error);
            await signOut(auth);
            setUser(null);
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      console.log('🔐 Tentative de connexion admin:', email);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      
      // Vérifier si l'utilisateur est un admin
      const adminUser = await AdminAuthService.verifyAdminAccess(firebaseUser);
      
      if (!adminUser) {
        throw new Error('Accès non autorisé. Seuls les administrateurs peuvent se connecter.');
      }
      
      if (!adminUser.isActive) {
        throw new Error('Compte administrateur désactivé. Contactez le support.');
      }
      
      // Mettre à jour la dernière connexion
      try {
        await AdminAuthService.updateLastLogin(adminUser.uid);
      } catch (error) {
        console.log('Impossible de mettre à jour la dernière connexion:', error);
      }
      
      setUser(adminUser);
      console.log('✅ Connexion admin réussie:', adminUser.email);
      
    } catch (error: any) {
      console.error('❌ Erreur de connexion admin:', error);
      
      // Déconnecter l'utilisateur en cas d'erreur
      try {
        await signOut(auth);
      } catch (signOutError) {
        console.log('Erreur lors de la déconnexion:', signOutError);
      }
      
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      console.log('🚪 Déconnexion admin réussie');
    } catch (error) {
      console.error('❌ Erreur de déconnexion:', error);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return AdminAuthService.hasPermission(user, permission);
  };

  const canAccess = (feature: string): boolean => {
    if (!user) return false;
    return AdminAuthService.canAccess(user, feature);
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    hasPermission,
    canAccess,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

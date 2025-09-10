import { collection, getDocs, doc, getDoc, updateDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from './firebase';
import { KYCDocument } from '../types';

export class KYCService {
  // Récupérer toutes les soumissions KYC
  static async getKYCSubmissions(page: number = 1, pageSize: number = 20, filters?: any) {
    try {
      const kycRef = collection(db, 'kycSubmissions');
      let q = query(kycRef, orderBy('submittedAt', 'desc'), limit(pageSize));
      
      // Appliquer les filtres
      if (filters?.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters?.priority) {
        q = query(q, where('priority', '==', filters.priority));
      }
      if (filters?.type) {
        q = query(q, where('documentType', '==', filters.type));
      }
      
      const snapshot = await getDocs(q);
      const submissions: KYCDocument[] = [];
      
      snapshot.forEach((doc) => {
        submissions.push({
          id: doc.id,
          ...doc.data()
        } as KYCDocument);
      });
      
      return {
        submissions,
        total: submissions.length,
        hasMore: submissions.length === pageSize
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des soumissions KYC:', error);
      throw error;
    }
  }

  // Récupérer une soumission KYC par ID
  static async getKYCSubmissionById(submissionId: string) {
    try {
      const kycDoc = await getDoc(doc(db, 'kycSubmissions', submissionId));
      if (kycDoc.exists()) {
        return {
          id: kycDoc.id,
          ...kycDoc.data()
        } as KYCDocument;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de la soumission KYC:', error);
      throw error;
    }
  }

  // Approuver une soumission KYC
  static async approveKYC(submissionId: string, adminNotes?: string) {
    try {
      const kycRef = doc(db, 'kycSubmissions', submissionId);
      await updateDoc(kycRef, {
        status: 'approved',
        adminNotes: adminNotes || '',
        reviewedAt: new Date(),
        reviewedBy: 'admin', // TODO: Récupérer l'ID de l'admin connecté
      });
      
      // Mettre à jour le statut KYC de l'utilisateur
      const submission = await this.getKYCSubmissionById(submissionId);
      if (submission && submission.userId) {
        const userRef = doc(db, 'users', submission.userId);
        await updateDoc(userRef, {
          kycStatus: 'verified',
          kycVerifiedAt: new Date()
        });
      }
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'approbation KYC:', error);
      throw error;
    }
  }

  // Rejeter une soumission KYC
  static async rejectKYC(submissionId: string, reason: string, adminNotes?: string) {
    try {
      const kycRef = doc(db, 'kycSubmissions', submissionId);
      await updateDoc(kycRef, {
        status: 'rejected',
        rejectionReason: reason,
        adminNotes: adminNotes || '',
        reviewedAt: new Date(),
        reviewedBy: 'admin', // TODO: Récupérer l'ID de l'admin connecté
      });
      
      // Mettre à jour le statut KYC de l'utilisateur
      const submission = await this.getKYCSubmissionById(submissionId);
      if (submission && submission.userId) {
        const userRef = doc(db, 'users', submission.userId);
        await updateDoc(userRef, {
          kycStatus: 'rejected',
          kycRejectedAt: new Date()
        });
      }
      
      return true;
    } catch (error) {
      console.error('Erreur lors du rejet KYC:', error);
      throw error;
    }
  }

  // Demander des informations supplémentaires
  static async requestMoreInfo(submissionId: string, requestMessage: string) {
    try {
      const kycRef = doc(db, 'kycSubmissions', submissionId);
      await updateDoc(kycRef, {
        status: 'pending_info',
        infoRequestMessage: requestMessage,
        infoRequestedAt: new Date(),
        reviewedBy: 'admin', // TODO: Récupérer l'ID de l'admin connecté
      });
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la demande d\'informations:', error);
      throw error;
    }
  }

  // Récupérer les statistiques KYC
  static async getKYCStats() {
    try {
      const kycRef = collection(db, 'kycSubmissions');
      const snapshot = await getDocs(kycRef);
      
      let total = 0;
      let pending = 0;
      let approved = 0;
      let rejected = 0;
      let pendingInfo = 0;
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        total++;
        
        switch (data.status) {
          case 'pending':
            pending++;
            break;
          case 'approved':
            approved++;
            break;
          case 'rejected':
            rejected++;
            break;
          case 'pending_info':
            pendingInfo++;
            break;
        }
      });
      
      return {
        total,
        pending,
        approved,
        rejected,
        pendingInfo,
        approvalRate: total > 0 ? (approved / total) * 100 : 0,
        rejectionRate: total > 0 ? (rejected / total) * 100 : 0
      };
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques KYC:', error);
      throw error;
    }
  }

  // Rechercher des soumissions KYC
  static async searchKYCSubmissions(searchTerm: string) {
    try {
      const kycRef = collection(db, 'kycSubmissions');
      const snapshot = await getDocs(kycRef);
      const submissions: KYCDocument[] = [];
      
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (
          data.userId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          data.documentType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          data.status?.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          submissions.push({
            id: doc.id,
            ...data
          } as KYCDocument);
        }
      });
      
      return submissions;
    } catch (error) {
      console.error('Erreur lors de la recherche KYC:', error);
      throw error;
    }
  }
}

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, FileText, CheckCircle, XCircle, Clock, AlertTriangle, Eye, Download, Check, X } from 'lucide-react';
import { KYCService } from '../services/kycService';
import { KYCDocument } from '../types';
import { PermissionGuard } from '../components/PermissionGuard';

const KYC: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedDocument, setSelectedDocument] = useState<KYCDocument | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: kycSubmissions, isLoading, error } = useQuery({
    queryKey: ['kyc', searchTerm, statusFilter, priorityFilter],
    queryFn: () => KYCService.getKYCSubmissions(1, 20, { 
      search: searchTerm, 
      status: statusFilter === 'all' ? undefined : statusFilter,
      priority: priorityFilter === 'all' ? undefined : priorityFilter
    })
  });

  const handleViewDocument = (document: KYCDocument) => {
    setSelectedDocument(document);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDocument(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'under_review': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-xl mb-4">Erreur lors du chargement des soumissions KYC</div>
        <div className="text-gray-600">{error.message}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion KYC</h1>
          <p className="text-gray-600">Validez et gérez les documents de vérification d'identité</p>
        </div>
        <div className="flex items-center space-x-3">
          <PermissionGuard permission="kyc.create">
            <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Nouvelle soumission</span>
            </button>
          </PermissionGuard>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">En attente</p>
              <p className="text-2xl font-semibold text-gray-900">
                {kycSubmissions?.submissions?.filter((doc: any) => doc.status === 'pending').length || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">En cours</p>
              <p className="text-2xl font-semibold text-gray-900">
                {kycSubmissions?.submissions?.filter((doc: any) => doc.status === 'under_review').length || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approuvés</p>
              <p className="text-2xl font-semibold text-gray-900">
                {kycSubmissions?.submissions?.filter((doc: any) => doc.status === 'approved').length || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejetés</p>
              <p className="text-2xl font-semibold text-gray-900">
                {kycSubmissions?.submissions?.filter((doc: any) => doc.status === 'rejected').length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Rechercher par nom, email ou type de document..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
          <div className="flex space-x-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="under_review">En cours</option>
              <option value="approved">Approuvé</option>
              <option value="rejected">Rejeté</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">Toutes priorités</option>
              <option value="high">Haute</option>
              <option value="medium">Moyenne</option>
              <option value="low">Basse</option>
            </select>
            <button className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>Filtres</span>
            </button>
          </div>
        </div>
      </div>

      {/* KYC Submissions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type de document
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priorité
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date de soumission
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {kycSubmissions?.submissions?.map((submission: any) => (
                <tr key={submission.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {submission.userName || 'Utilisateur'}
                      </div>
                      <div className="text-sm text-gray-500">{submission.userEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-gray-400 mr-2" />
                      {submission.documentType}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                      {submission.status === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                      {submission.status === 'approved' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {submission.status === 'rejected' && <XCircle className="h-3 w-3 mr-1" />}
                      {submission.status === 'under_review' && <AlertTriangle className="h-3 w-3 mr-1" />}
                      {submission.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(submission.priority)}`}>
                      {submission.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString('fr-FR') : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewDocument(submission)}
                        className="text-primary-600 hover:text-primary-900 bg-primary-50 hover:bg-primary-100 px-3 py-1 rounded-md transition-colors"
                      >
                        <Eye className="h-4 w-4 inline mr-1" />
                        Voir
                      </button>
                      {submission.status === 'pending' && (
                        <>
                          <button className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md transition-colors">
                            <Check className="h-4 w-4 inline mr-1" />
                            Approuver
                          </button>
                          <button className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors">
                            <X className="h-4 w-4 inline mr-1" />
                            Rejeter
                          </button>
                        </>
                      )}
                      <button className="text-gray-600 hover:text-gray-900">
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Document View Modal */}
      {isModalOpen && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-11/12 h-5/6 max-w-4xl overflow-hidden">
            {/* Header */}
            <div className="bg-primary-600 text-white p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Document KYC</h2>
                  <p className="text-primary-100">{selectedDocument.documentType}</p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-white hover:text-primary-200 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto h-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Informations du document</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Type de document</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedDocument.documentType}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nom du fichier</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedDocument.fileName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Taille</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedDocument.fileSize ? (selectedDocument.fileSize / 1024 / 1024).toFixed(2) : '0'} MB</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Type MIME</label>
                      <p className="mt-1 text-sm text-gray-900">{selectedDocument.mimeType}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date de soumission</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedDocument.submittedAt ? new Date(selectedDocument.submittedAt).toLocaleString('fr-FR') : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Aperçu du document</h3>
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    {selectedDocument.mimeType?.startsWith('image/') ? (
                      <img
                        src={selectedDocument.cloudinaryUrl}
                        alt={selectedDocument.fileName}
                        className="w-full h-64 object-contain rounded"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-64 text-gray-500">
                        <FileText className="h-16 w-16" />
                        <p className="ml-2">Document non-image</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 space-y-2">
                    <button className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">
                      Télécharger
                    </button>
                    <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                      Ouvrir dans un nouvel onglet
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-8 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold mb-4">Actions</h3>
                <div className="flex space-x-4">
                  {selectedDocument.status === 'pending' && (
                    <>
                      <button className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2">
                        <Check className="h-4 w-4" />
                        <span>Approuver le document</span>
                      </button>
                      <button className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center space-x-2">
                        <X className="h-4 w-4" />
                        <span>Rejeter le document</span>
                      </button>
                    </>
                  )}
                  <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                    Demander plus d'informations
                  </button>
                  <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50">
                    Marquer pour révision
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KYC;

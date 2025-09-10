// Types généraux pour l'application AMCB Admin

export interface User {
  id?: string; // ID du document Firestore
  uid: string;
  email: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string; // Changé de phoneNumber à phone
  country?: string;
  city?: string;
  address?: string;
  postalCode?: string;
  dateOfBirth?: string;
  dob?: Date; // Date de naissance alternative
  kycStatus: 'pending' | 'in_progress' | 'validated' | 'rejected' | 'verified' | 'unverified'; // Ajouté 'unverified'
  kycDocuments?: KYCDocument[];
  status: 'active' | 'pending' | 'blocked' | 'suspended';
  createdAt: Date;
  lastLogin?: Date;
  lastSignInTime?: Date; // Alternative à lastLogin
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  accounts?: BankAccount[]; // Changé de string[] à BankAccount[]
  transactions?: Transaction[]; // Changé de string[] à Transaction[]
  
  // Nouveaux champs de facturation
  billingBic?: string;
  billingHolder?: string;
  billingIban?: string;
  billingText?: string;
  advisorId?: string;
  billingVisible?: boolean; // Contrôle la visibilité de la facturation dans l'app client
  
  // Nouveaux champs utilisateur
  nationality?: string;
  residenceCountry?: string;
  profession?: string;
  salary?: number;
  pob?: string; // Lieu de naissance
  
  // Champs de carte
  cardType?: string;
  cardStatus?: string;
  cardRequestedAt?: Date;
  hasPendingVirtualCardRequest?: boolean;
  cardLimits?: {
    monthly: number;
    withdrawal: number;
  };
  
  // Champs de vérification
  emailVerifiedAt?: Date;
  emailVerificationCode?: string | null;
  emailVerificationCodeExpires?: Date | null;
  inactivityTimeout?: number;
  
  // Champs de documents et budgets
  documents?: any[];
  budgets?: any[];
  
  // Champs de notifications
  notificationPrefs?: {
    email: boolean;
    promotions: boolean;
    security: boolean;
  };
  notifications?: any[];
  
  // Champs de bénéficiaires
  beneficiaries?: any[];
  
  // Champs de cartes virtuelles
  virtualCards?: any[];
  
  // Champs de mise à jour
  updatedAt?: Date;
  userId?: string; // Alternative à uid
}

export interface KYCDocument {
  id: string;
  userId: string; // Ajouté userId
  type: 'id_card' | 'passport' | 'proof_of_address' | 'selfie' | 'other';
  documentType?: string; // Ajouté pour compatibilité
  fileName?: string; // Ajouté pour compatibilité
  fileSize?: number; // Ajouté pour compatibilité
  mimeType?: string; // Ajouté pour compatibilité
  cloudinaryUrl?: string; // Ajouté pour compatibilité
  submittedAt?: Date; // Ajouté pour compatibilité
  priority?: string; // Ajouté pour compatibilité
  status: 'pending' | 'validated' | 'rejected';
  url: string;
  uploadedAt: Date;
  validatedAt?: Date;
  validatedBy?: string; // Admin ID
  rejectionReason?: string;
  metadata?: {
    documentNumber?: string;
    expiryDate?: string;
    issuingCountry?: string;
  };
}

export interface BankAccount {
  id: string;
  userId: string;
  accountNumber: string;
  iban?: string;
  swiftCode?: string;
  accountType: 'current' | 'savings' | 'credit';
  currency: string;
  balance: number;
  availableBalance: number;
  status: 'active' | 'suspended' | 'closed' | 'pending';
  createdAt: Date;
  lastActivity: Date;
  overdraftLimit?: number;
  interestRate?: number;
  cards?: BankCard[];
  transactions?: string[]; // IDs des transactions
}

export interface BankCard {
  id: string;
  accountId: string;
  cardNumber: string;
  cardType: 'debit' | 'credit' | 'virtual';
  status: 'active' | 'blocked' | 'expired' | 'pending';
  expiryDate: string;
  cvv?: string;
  dailyLimit?: number;
  monthlyLimit?: number;
  createdAt: Date;
  lastUsed?: Date;
}

export interface Transaction {
  id: string;
  transactionId: string;
  fromAccountId: string;
  toAccountId?: string;
  fromUserId: string;
  toUserId?: string;
  type: 'transfer' | 'payment' | 'deposit' | 'withdrawal' | 'card_payment';
  amount: number;
  currency: string;
  fees: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  description?: string;
  reference?: string;
  createdAt: Date;
  completedAt?: Date;
  metadata?: {
    merchantName?: string;
    merchantId?: string;
    location?: string;
    category?: string;
  };
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  subject: string;
  description: string;
  category: 'technical' | 'billing' | 'account' | 'security' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: string; // Admin ID
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  messages: SupportMessage[];
  tags?: string[];
}

export interface SupportMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderType: 'user' | 'admin';
  content: string;
  createdAt: Date;
  attachments?: string[]; // URLs des pièces jointes
}

export interface AdminUser {
  uid: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: string[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  profile?: {
    avatar?: string;
    phone?: string;
    department?: string;
    position?: string;
  };
}

export interface SystemLog {
  id: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  category: 'auth' | 'user' | 'transaction' | 'kyc' | 'system' | 'security';
  message: string;
  userId?: string;
  adminId?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface Notification {
  id: string;
  userId?: string; // Si null, notification globale
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

export interface PlatformSettings {
  id: string;
  category: 'general' | 'security' | 'financial' | 'kyc' | 'notifications';
  key: string;
  value: string | number | boolean;
  description?: string;
  updatedAt: Date;
  updatedBy: string; // Admin ID
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  pendingKYC: number;
  totalAccounts: number;
  totalTransactions: number;
  monthlyVolume: number;
  monthlyFees: number;
  openTickets: number;
  resolvedTickets: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string;
    borderColor?: string;
    fill?: boolean;
  }[];
}

export interface FilterOptions {
  search?: string;
  status?: string;
  kycStatus?: string; // Ajouté pour la compatibilité
  type?: string;
  category?: string;
  priority?: string;
  dateFrom?: Date;
  dateTo?: Date;
  userId?: string;
  adminId?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Types pour les formulaires
export interface LoginForm {
  email: string;
  password: string;
}

export interface UserForm {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  country?: string;
  city?: string;
  address?: string;
  postalCode?: string;
  dateOfBirth?: string;
}

export interface AccountForm {
  userId: string;
  accountType: 'current' | 'savings' | 'credit';
  currency: string;
  initialBalance?: number;
  overdraftLimit?: number;
  interestRate?: number;
}

export interface TransactionForm {
  fromAccountId: string;
  toAccountId?: string;
  amount: number;
  currency: string;
  description?: string;
  reference?: string;
}

export interface KYCDocumentForm {
  userId: string;
  documentType: 'id_card' | 'passport' | 'proof_of_address' | 'selfie' | 'other';
  file: File;
  metadata?: Record<string, any>;
}

export interface SupportTicketForm {
  userId: string;
  subject: string;
  description: string;
  category: 'technical' | 'billing' | 'account' | 'security' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

// Types pour les composants UI
export interface TableColumn<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, item: T) => React.ReactNode;
  width?: string;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ComponentType<any>;
  content: React.ReactNode;
}

// Types pour les événements
export interface AppEvent {
  type: string;
  payload: any;
  timestamp: Date;
  userId?: string;
  adminId?: string;
}

// Types pour les exports
export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  filters?: FilterOptions;
  columns?: string[];
  dateRange?: {
    from: Date;
    to: Date;
  };
}

// Types pour les webhooks
export interface WebhookEvent {
  id: string;
  type: string;
  payload: any;
  timestamp: Date;
  signature?: string;
  attempts: number;
  maxAttempts: number;
  nextRetry?: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

// Types pour les audits
export interface AuditLog {
  id: string;
  action: string;
  resource: string;
  resourceId: string;
  adminId: string;
  adminEmail: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  metadata?: Record<string, any>;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
}

// Types pour les réponses des services
export interface UsersResponse {
  users: User[];
  total: number;
  hasMore: boolean;
}

export interface KYCResponse {
  submissions: KYCDocument[];
  total: number;
  hasMore: boolean;
}

export interface AccountsResponse {
  accounts: BankAccount[];
  total: number;
  hasMore: boolean;
}

export interface TransactionsResponse {
  transactions: Transaction[];
  total: number;
  hasMore: boolean;
}

export interface DashboardStatsResponse {
  overview: {
    totalUsers: number;
    totalRevenue: number;
    activeAccounts: number;
    pendingKYC: number;
    totalTransactions: number;
    totalAccounts: number;
  };
  userStats: {
    totalUsers: number;
    verifiedUsers: number;
    pendingKYC: number;
    activeUsers: number;
    verificationRate: number;
  };
  accountStats: {
    totalAccounts: number;
    activeAccounts: number;
    suspendedAccounts: number;
    totalBalance: number;
    averageBalance: number;
  };
  transactionStats: {
    totalTransactions: number;
    totalVolume: number;
    completedTransactions: number;
    pendingTransactions: number;
    averageAmount: number;
  };
  kycStats: {
    totalSubmissions: number;
    pendingSubmissions: number;
    approvedSubmissions: number;
    rejectedSubmissions: number;
    approvalRate: number;
  };
  supportStats: {
    openTickets: number;
    resolvedTickets: number;
    averageResolutionTime: number;
    satisfactionRate: number;
  };
  charts: {
    userGrowth: ChartData;
    transactionVolume: ChartData;
    kycStatus: ChartData;
    accountTypes: ChartData;
  };
  activities: DashboardActivity[];
}

export interface DashboardActivity {
  id: string;
  type: 'user_registration' | 'kyc_submission' | 'transaction' | 'account_creation' | 'support_ticket';
  description: string;
  timestamp: Date;
  userId?: string;
  priority: 'low' | 'medium' | 'high';
  metadata?: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  chatId?: string; // Optionnel car dans la sous-collection
  senderId: string;
  senderType: 'user' | 'admin';
  senderName: string;
  content: string;
  text?: string; // Compatible avec la structure client
  timestamp: Date;
  read?: boolean;
  status?: 'sent' | 'delivered' | 'read'; // Compatible avec la structure client
  readAt?: Date;
  type?: 'text' | 'image' | 'file'; // Compatible avec la structure client
  attachments?: {
    type: 'image' | 'file' | 'document';
    url: string;
    fileName: string;
    fileSize?: number;
  }[];
}

export interface Chat {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  status: 'active' | 'waiting' | 'closed' | 'resolved';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  subject: string;
  category: 'general' | 'technical' | 'billing' | 'kyc' | 'transaction' | 'other';
  assignedTo?: string; // Admin ID
  assignedToName?: string;
  participants?: string[]; // Compatible avec la structure client
  lastMessage?: string; // Compatible avec la structure client (string au lieu d'objet)
  lastMessageTimestamp?: Date; // Timestamp du dernier message
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
  closedBy?: string;
  tags?: string[];
  notes?: string; // Notes internes pour les admins
}

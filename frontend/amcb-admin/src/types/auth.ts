export interface AdminUser {
  uid: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator';
  name: string;
  permissions: string[];
  lastLogin: Date;
  createdAt?: Date;
  isActive?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: AdminUser | null;
  loading: boolean;
  error: string | null;
}

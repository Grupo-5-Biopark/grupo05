/**
 * Application Types
 * Centralized type definitions for consistency across the application
 */

import { ROLES } from '@/constants';

// ============================================================================
// USER TYPES
// ============================================================================
export interface User {
  id: string;
  name: string;
  email: string;
  role: (typeof ROLES)[keyof typeof ROLES];
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserWithId extends Omit<User, 'id'> {
  id: number;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: string;
  phone?: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
  phone?: string;
}

// ============================================================================
// AUTH TYPES
// ============================================================================
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in?: number; // Token expiration in seconds
}

export interface RefreshTokenResponse {
  access_token: string;
  expires_in?: number; // Token expiration in seconds
}

export interface JWTPayload {
  email: string;
  sub: number;
  name: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  logout: () => void;
}

// ============================================================================
// CALCULATION PARAMETERS TYPES
// ============================================================================
export interface CalculationParameters {
  id: number;
  dropoutPercentage: number;
  studentsPerSmallRoom: number;
  studentsPerMediumRoom: number;
  studentsPerBigRoom: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateCalculationParametersDto {
  dropoutPercentage: number;
  studentsPerSmallRoom: number;
  studentsPerMediumRoom: number;
  studentsPerBigRoom: number;
}

// ============================================================================
// STATISTICS TYPES
// ============================================================================
export interface UserStats {
  total: number;
  admins: number;
  defaultUsers: number;
}

export interface DashboardStats {
  totalRooms: number;
  totalStudents: number;
  activeCourses: number;
  occupancyRate: number;
}

// ============================================================================
// API TYPES
// ============================================================================
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: number;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ============================================================================
// FORM TYPES
// ============================================================================
export interface FormFieldError {
  field: string;
  message: string;
}

export interface FormState<T> {
  values: T;
  errors: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  isSubmitting: boolean;
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================
export interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

export interface SidebarProps {
  currentPage: string;
  onPageChange: (pageId: string) => void;
}

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  ariaLabel?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  closeOnOverlayClick?: boolean;
}

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  onClose?: () => void;
}

export interface LoadingSkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular';
  animation?: boolean;
}

// ============================================================================
// MENU TYPES
// ============================================================================
export interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  adminOnly: boolean;
}

// ============================================================================
// COURSE TYPES (for future implementation)
// ============================================================================
export interface Course {
  id: number;
  name: string;
  code: string;
  description?: string;
  duration: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// ROOM TYPES (for future implementation)
// ============================================================================
export interface Room {
  id: number;
  name: string;
  capacity: number;
  size: 'small' | 'medium' | 'large';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type AsyncFunction<T = void> = () => Promise<T>;
export type VoidFunction = () => void;

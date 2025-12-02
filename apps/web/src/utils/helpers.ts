/**
 * Utility Functions
 * Reusable functions for common operations across the application
 */

import { ROLES, ROLE_LABELS, ROLE_BADGE_COLORS } from '@/constants';

// ============================================================================
// DATE UTILITIES
// ============================================================================

/**
 * Formats a date string to DD/MM/YYYY format
 * @param dateString - ISO date string
 * @returns Formatted date string or '-' if invalid
 */
export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '-';

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) return '-';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  } catch {
    return '-';
  }
}

/**
 * Formats a date string to DD/MM/YYYY HH:MM format
 * @param dateString - ISO date string
 * @returns Formatted datetime string or '-' if invalid
 */
export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return '-';

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) return '-';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch {
    return '-';
  }
}

/**
 * Gets relative time string (e.g., "2 hours ago")
 * @param dateString - ISO date string
 * @returns Relative time string
 */
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 7) return formatDate(dateString);
  if (diffDay > 0) return `${diffDay} dia${diffDay > 1 ? 's' : ''} atrás`;
  if (diffHour > 0) return `${diffHour} hora${diffHour > 1 ? 's' : ''} atrás`;
  if (diffMin > 0) return `${diffMin} minuto${diffMin > 1 ? 's' : ''} atrás`;
  return 'Agora';
}

// ============================================================================
// PHONE UTILITIES
// ============================================================================

/**
 * Formats a phone number to (XX) XXXXX-XXXX or (XX) XXXX-XXXX format
 * @param phone - Raw phone number string
 * @returns Formatted phone number or '-' if invalid
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '-';

  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }

  return phone;
}

/**
 * Validates if a phone number is valid
 * @param phone - Phone number string
 * @returns true if valid, false otherwise
 */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 || cleaned.length === 11;
}

/**
 * Cleans phone number removing all non-numeric characters
 * @param phone - Phone number string
 * @returns Cleaned phone number
 */
export function cleanPhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

// ============================================================================
// ROLE UTILITIES
// ============================================================================

/**
 * Normalizes role string to lowercase standard format
 * @param role - Raw role string
 * @returns Normalized role ('admin' | 'user')
 */
export function normalizeRole(
  role: string,
): (typeof ROLES)[keyof typeof ROLES] {
  const normalized = role.toLowerCase();
  return normalized === ROLES.ADMIN ? ROLES.ADMIN : ROLES.USER;
}

/**
 * Gets the display label for a role
 * @param role - Role string
 * @returns Display label ('ADMIN' | 'USUÁRIO')
 */
export function getRoleLabel(role: string): string {
  const normalized = normalizeRole(role);
  return ROLE_LABELS[normalized];
}

/**
 * Gets the badge CSS class for a role
 * @param role - Role string
 * @returns Badge class name
 */
export function getRoleBadgeClass(role: string): string {
  const normalized = normalizeRole(role);
  return `badge-${ROLE_BADGE_COLORS[normalized]}`;
}

/**
 * Gets role badge information (text and color)
 * @param role - Role string
 * @returns Object with text and color properties
 */
export function getRoleBadge(role: string): {
  text: string;
  color: string;
} {
  const normalized = normalizeRole(role);
  return {
    text: ROLE_LABELS[normalized],
    color: ROLE_BADGE_COLORS[normalized],
  };
}

// ============================================================================
// NAME UTILITIES
// ============================================================================

/**
 * Gets initials from a full name (first and last name)
 * @param name - Full name string
 * @returns Initials (2 characters)
 */
export function getInitials(name: string): string {
  if (!name) return 'U';

  const names = name.trim().split(' ');

  if (names.length >= 2) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }

  return name.substring(0, 2).toUpperCase();
}

/**
 * Gets first name from full name
 * @param name - Full name string
 * @returns First name
 */
export function getFirstName(name: string): string {
  return name.split(' ')[0];
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validates email format
 * @param email - Email string
 * @returns true if valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates password strength (at least 6 characters)
 * @param password - Password string
 * @returns true if valid, false otherwise
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

/**
 * Checks if a value is empty (null, undefined, or empty string)
 * @param value - Value to check
 * @returns true if empty, false otherwise
 */
export function isEmpty(value: unknown): boolean {
  return value === null || value === undefined || value === '';
}

// ============================================================================
// STRING UTILITIES
// ============================================================================

/**
 * Capitalizes the first letter of a string
 * @param str - Input string
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Truncates a string to a maximum length and adds ellipsis
 * @param str - Input string
 * @param maxLength - Maximum length
 * @returns Truncated string
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + '...';
}

/**
 * Removes accents from a string
 * @param str - Input string
 * @returns String without accents
 */
export function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

// ============================================================================
// NUMBER UTILITIES
// ============================================================================

/**
 * Formats a number to Brazilian currency format (R$ X.XXX,XX)
 * @param value - Number value
 * @returns Formatted currency string
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formats a number to percentage format
 * @param value - Number value (0-100)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

/**
 * Clamps a number between min and max values
 * @param value - Input value
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// ============================================================================
// ARRAY UTILITIES
// ============================================================================

/**
 * Groups an array of objects by a key
 * @param array - Input array
 * @param key - Key to group by
 * @returns Object with grouped arrays
 */
export function groupBy<T extends Record<string, unknown>>(
  array: T[],
  key: keyof T,
): Record<string, T[]> {
  return array.reduce(
    (result, item) => {
      const value = item[key];
      const groupKey =
        typeof value === 'string' || typeof value === 'number'
          ? String(value)
          : JSON.stringify(value);
      if (!result[groupKey]) {
        result[groupKey] = [];
      }
      result[groupKey].push(item);
      return result;
    },
    {} as Record<string, T[]>,
  );
}

/**
 * Removes duplicate items from an array
 * @param array - Input array
 * @returns Array without duplicates
 */
export function unique<T>(array: T[]): T[] {
  return Array.from(new Set(array));
}

// ============================================================================
// JWT UTILITIES
// ============================================================================

/**
 * Decodes a JWT token
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export function decodeJwt<T = Record<string, unknown>>(
  token: string,
): T | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    );
    return JSON.parse(jsonPayload) as T;
  } catch {
    return null;
  }
}

/**
 * Checks if a JWT token is expired
 * @param token - JWT token string
 * @returns true if expired, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJwt<{ exp?: number }>(token);
  if (!payload || !payload.exp) return true;
  return Date.now() >= payload.exp * 1000;
}

// ============================================================================
// DEBOUNCE/THROTTLE UTILITIES
// ============================================================================

/**
 * Debounces a function call
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: unknown[]) => void>(
  func: T,
  delay: number,
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Creates a promise that resolves after a delay
 * @param ms - Milliseconds to wait
 * @returns Promise that resolves after the delay
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================================================================
// CLASS NAME UTILITIES
// ============================================================================

/**
 * Conditionally joins class names
 * @param classes - Class names or conditional objects
 * @returns Joined class name string
 */
export function cn(
  ...classes: (string | undefined | null | false | Record<string, boolean>)[]
): string {
  return classes
    .filter(Boolean)
    .map((cls) => {
      if (typeof cls === 'string') return cls;
      if (typeof cls === 'object') {
        return Object.entries(cls)
          .filter(([, value]) => value)
          .map(([key]) => key)
          .join(' ');
      }
      return '';
    })
    .join(' ')
    .trim();
}

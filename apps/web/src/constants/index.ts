/**
 * Application Constants
 * Centralized constants for consistency across the application
 */

// ============================================================================
// ROLES
// ============================================================================
export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'ADMIN',
  [ROLES.USER]: 'USUÁRIO',
} as const;

export const ROLE_BADGE_COLORS = {
  [ROLES.ADMIN]: 'blue',
  [ROLES.USER]: 'gray',
} as const;

// ============================================================================
// API ENDPOINTS
// ============================================================================
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
  },
  USERS: {
    BASE: '/api/users',
    LIST: '/api/users',
    BY_ID: (id: number) => `/api/users/${id}`,
    DELETE: (id: string) => `/api/users/${id}`,
    UPDATE: (id: number) => `/api/users/${id}`,
    CREATE: '/api/users',
  },
  CALCULATION_PARAMETERS: {
    BASE: '/api/calculationParameters',
  },
  COURSES: {
    BASE: '/api/courses',
    BY_ID: (id: number) => `/api/courses/${id}`,
  },
  ROOMS: {
    BASE: '/api/rooms',
    BY_ID: (id: number) => `/api/rooms/${id}`,
  },
} as const;

// ============================================================================
// MESSAGES
// ============================================================================
export const ERROR_MESSAGES = {
  // Auth errors
  INVALID_CREDENTIALS: 'Credenciais inválidas. Tente novamente.',
  LOGIN_ERROR: 'Erro ao fazer login. Tente novamente.',
  LOGOUT_ERROR: 'Erro ao fazer logout.',
  SESSION_EXPIRED: 'Sua sessão expirou. Faça login novamente.',

  // User errors
  LOAD_FAILED: 'Erro ao carregar dados.',
  LOAD_USERS_ERROR: 'Erro ao carregar usuários.',
  CREATE_USER_ERROR: 'Erro ao criar usuário.',
  UPDATE_USER_ERROR: 'Erro ao atualizar usuário.',
  DELETE_USER_ERROR: 'Erro ao excluir usuário.',
  DELETE_FAILED: 'Erro ao excluir. Tente novamente.',

  // Parameters errors
  LOAD_PARAMETERS_ERROR: 'Erro ao carregar os parâmetros de configuração.',
  SAVE_PARAMETERS_ERROR: 'Erro ao salvar os parâmetros. Tente novamente.',

  // Validation errors
  DROPOUT_PERCENTAGE_RANGE: 'A porcentagem de evasão deve estar entre 0 e 100',
  STUDENTS_PER_ROOM_POSITIVE:
    'O número de alunos por sala deve ser maior que zero',
  STUDENTS_PER_ROOM_ORDER:
    'O número de alunos deve ser: Pequena < Média < Grande',
  EMAIL_INVALID: 'Email inválido.',
  PASSWORD_REQUIRED: 'Senha é obrigatória.',
  NAME_REQUIRED: 'Nome é obrigatório.',
  PHONE_INVALID: 'Telefone inválido.',

  // Generic errors
  GENERIC_ERROR: 'Ocorreu um erro. Tente novamente.',
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
} as const;

export const SUCCESS_MESSAGES = {
  // Auth success
  LOGIN_SUCCESS: 'Login realizado com sucesso!',
  PASSWORD_RESET_SENT: 'E-mail de recuperação enviado com sucesso!',

  // User success
  USER_CREATED: 'Usuário criado com sucesso!',
  USER_UPDATED: 'Usuário atualizado com sucesso!',
  USER_DELETED: 'Usuário excluído com sucesso!',

  // Parameters success
  PARAMETERS_SAVED: 'Parâmetros salvos com sucesso!',

  // Generic success
  OPERATION_SUCCESS: 'Operação realizada com sucesso!',
} as const;

export const CONFIRMATION_MESSAGES = {
  DELETE_USER: 'Tem certeza que deseja excluir este usuário?',
  DELETE_COURSE: 'Tem certeza que deseja excluir este curso?',
  RESET_PARAMETERS: 'Tem certeza que deseja resetar as configurações?',
  LOGOUT: 'Tem certeza que deseja sair?',
} as const;

// ============================================================================
// ANIMATION DURATIONS
// ============================================================================
export const ANIMATION_DURATIONS = {
  SHORT: 300,
  MEDIUM: 500,
  LONG: 1000,
  SUCCESS_REDIRECT: 1500,
  SHAKE: 500,
} as const;

// ============================================================================
// PAGINATION
// ============================================================================
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
} as const;

// ============================================================================
// ROOM SIZES
// ============================================================================
export const ROOM_SIZES = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
} as const;

export const ROOM_SIZE_LABELS = {
  [ROOM_SIZES.SMALL]: 'Pequena',
  [ROOM_SIZES.MEDIUM]: 'Média',
  [ROOM_SIZES.LARGE]: 'Grande',
} as const;

// ============================================================================
// LOCAL STORAGE KEYS
// ============================================================================
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  AUTHENTICATED: 'authenticated',
  TOKEN_EXPIRY: 'token_expiry',
} as const;

// ============================================================================
// VALIDATION RULES
// ============================================================================
export const VALIDATION_RULES = {
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 3,
  PHONE_LENGTH: 11, // DDD + 9 digits
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_PATTERN: /^\d{10,11}$/,
} as const;

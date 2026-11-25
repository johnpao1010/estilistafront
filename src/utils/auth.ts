const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';
const BUSINESS_KEY = 'business_id';

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const removeToken = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
};

export const setUser = (user: any): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

export const getUser = (): any => {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const removeUser = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_KEY);
  }
};

// The selected business is kept per tab; localStorage only provides the default for new tabs
let activeBusinessId: string | null = null;

export const getActiveBusinessId = (): string | null => activeBusinessId ?? getBusinessId();

export const getBusinessId = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(BUSINESS_KEY);
};

export const setBusinessId = (businessId: string): void => {
  activeBusinessId = businessId;
  if (typeof window !== 'undefined') {
    localStorage.setItem(BUSINESS_KEY, businessId);
  }
};

export const removeBusinessId = (): void => {
  activeBusinessId = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem(BUSINESS_KEY);
  }
};

export const isAuthenticated = (): boolean => {
  return getToken() !== null;
};

export const logout = (): void => {
  removeToken();
  removeUser();
  removeBusinessId();
  window.location.href = '/login';
};

// API configuration
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const API_ENDPOINTS = {
  chains: `${API_BASE_URL}/api/chains`,
} as const;

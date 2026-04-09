// Versioned API
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8001/api/v1"

// Backend server root - used for allauth and OAuth URLs which sit outside /api/
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8001"
export const ALLAUTH_API_URL = `${BACKEND_URL}/_allauth/browser/v1`
export const OAUTH_BASE_URL = `${BACKEND_URL}/accounts`

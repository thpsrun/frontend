// Versioned API — use for all /api/v1/* endpoints (games, leaderboards, players)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8001/api/v1"

// Unversioned API — use for non-v1 paths (e.g. legacy or utility endpoints)
export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8001/api"

// Backend server root — used for allauth and OAuth URLs which sit outside /api/
export const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8001"
export const ALLAUTH_API_URL = `${BACKEND_URL}/_allauth/browser/v1`
export const OAUTH_BASE_URL = `${BACKEND_URL}/accounts`

// API Base URLs from environment variables
// Falls back to localhost for development if not set
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8001/api/v1"
export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8001/api"

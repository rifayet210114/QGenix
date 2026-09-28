// API Base URL Configuration
// Local dev: http://localhost:8000
// Production: Railway backend URL (set via VITE_API_URL env variable in Vercel)
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

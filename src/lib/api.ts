
const API_BASE_URL = 'http://localhost:3500/jiran-tetangga/v1';
const API_KEY = 'jxdMegN9KOAZMwMCfIbV';

const getAuthToken = () => {
    if (typeof window === 'undefined') {
        return null;
    }
    return localStorage.getItem('authToken');
};

const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const token = getAuthToken();
    
    const headers = new Headers({
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
        ...options.headers,
    });

    if (token) {
        headers.append('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || 'An API error occurred');
    }

    return response.json();
};

export const api = {
    get: (endpoint: string, options?: RequestInit) => apiFetch(endpoint, { ...options, method: 'GET' }),
    post: (endpoint: string, body: any, options?: RequestInit) => apiFetch(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
    put: (endpoint: string, body: any, options?: RequestInit) => apiFetch(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
    delete: (endpoint: string, options?: RequestInit) => apiFetch(endpoint, { ...options, method: 'DELETE' }),
};

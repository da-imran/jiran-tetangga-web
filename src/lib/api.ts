
type ApiOptions = Omit<RequestInit, 'body'> & {
    params?: Record<string, any>;
    pathParams?: Record<string, string | number>;
    body?: any;
};

const API_BASE_URL = 'http://localhost:3500/jiran-tetangga/v1';
const API_KEY = 'jxdMegN9KOAZMwMCfIbV';

const getAuthToken = () => {
    if (typeof window === 'undefined') {
        return null;
    }
    return localStorage.getItem('authToken');
};

const apiFetch = async (endpoint: string, options: ApiOptions = {}) => {
    const token = getAuthToken();
    let processedEndpoint = endpoint;

    // Replace path parameters
    if (options.pathParams) {
        Object.entries(options.pathParams).forEach(([key, value]) => {
            processedEndpoint = processedEndpoint.replace(`:${key}`, encodeURIComponent(String(value)));
        });
    }

    // Build URL with query parameters
    const url = new URL(`${API_BASE_URL}${processedEndpoint}`);
    if (options.params) {
        Object.entries(options.params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.append(key, String(value));
            }
        });
    }

    const headers = new Headers({
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
        ...options.headers,
    });

    if (token) {
        headers.append('Authorization', `Bearer ${token}`);
    }

    const fetchOptions: RequestInit = {
        method: options.method,
        headers,
        signal: options.signal,
        cache: options.cache,
    };
    
    if (options.body) {
        fetchOptions.body = JSON.stringify(options.body);
    }

    const response = await fetch(url.toString(), fetchOptions);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || 'An API error occurred');
    }

    // Handle responses with no content
    if (response.status === 204 || response.headers.get('Content-Length') === '0') {
        return null;
    }
    
    return response.json();
};

export const api = {
    get: (endpoint: string, options?: ApiOptions) => 
        apiFetch(endpoint, { ...options, method: 'GET' }),
    
    post: (endpoint: string, body: any, options?: ApiOptions) => 
        apiFetch(endpoint, { ...options, method: 'POST', body }),
    
    put: (endpoint: string, body: any, options?: ApiOptions) => 
        apiFetch(endpoint, { ...options, method: 'PUT', body }),
    
    delete: (endpoint: string, options?: ApiOptions) => 
        apiFetch(endpoint, { ...options, method: 'DELETE' }),
};

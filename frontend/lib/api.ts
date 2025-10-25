// API client for backend communication

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      credentials: 'include', // Important for session cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Authentication endpoints
  async getAuthStatus() {
    return this.request<{ success: boolean; authenticated: boolean; user: any }>(
      '/api/auth/status'
    );
  }

  async getUser() {
    return this.request<{ success: boolean; user: any }>('/api/user');
  }

  login() {
    // Redirect to Express login endpoint
    window.location.href = `${this.baseUrl}/login`;
  }

  logout() {
    // Redirect to Express logout endpoint
    window.location.href = `${this.baseUrl}/logout`;
  }

  // Chat endpoints
  async sendMessage(message: string, context?: any, selectedAgents?: string[]) {
    return this.request<{
      success: boolean;
      response: {
        id: string;
        message: string;
        agents: string[];
        timestamp: string;
      };
    }>('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message, context, selectedAgents }),
    });
  }

  // Integration endpoints
  async getIntegrations() {
    return this.request<{
      success: boolean;
      integrations: Array<{
        id: string;
        name: string;
        connected: boolean;
        icon: string;
      }>;
    }>('/api/integrations');
  }
}

export const apiClient = new ApiClient(API_URL);



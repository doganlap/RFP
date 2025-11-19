// Production API Client Service
// src/services/ApiClient.ts

const API_URL = import.meta.env.VITE_API_URL || 'https://api.your-domain.com';

class ApiClient {
  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  async request(endpoint, options = {}) {
    const url = `${API_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        this.clearToken();
        window.location.href = '/login';
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Auth endpoints
  login(email, password) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  logout() {
    this.clearToken();
  }

  // RFP endpoints
  getRFPs(page = 1, limit = 20, status = null) {
    let url = `/api/rfp/list?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    return this.request(url);
  }

  getRFPById(id) {
    return this.request(`/api/rfp/${id}`);
  }

  createRFP(data) {
    return this.request('/api/rfp/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateRFP(id, data) {
    return this.request(`/api/rfp/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Win/Loss endpoints
  getWinLossAnalysis(rfpId) {
    return this.request(`/api/analysis/win-loss/${rfpId}`);
  }

  createWinLossRecord(data) {
    return this.request('/api/analysis/win-loss', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Task endpoints
  getTasks(rfpId) {
    return this.request(`/api/tasks?rfpId=${rfpId}`);
  }

  createTask(data) {
    return this.request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateTask(id, data) {
    return this.request(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Collaboration endpoints
  getCollaborators(rfpId) {
    return this.request(`/api/collaboration/collaborators/${rfpId}`);
  }

  addCollaborator(rfpId, userId) {
    return this.request(`/api/collaboration/add`, {
      method: 'POST',
      body: JSON.stringify({ rfpId, userId }),
    });
  }

  // Health check
  healthCheck() {
    return this.request('/api/db/connect');
  }
}

export const apiClient = new ApiClient();

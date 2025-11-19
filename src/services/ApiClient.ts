// Production API Client Service
// src/services/ApiClient.ts

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

class ApiClient {
  token: string | null;

  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  async request(endpoint: string, options: any = {}) {
    const url = `${API_URL}${endpoint}`;
    const headers: any = {
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
        // window.location.href = '/login';
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
  login(email: string, password: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  register(email: string, password: string, firstName: string, lastName: string, role?: string) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, firstName, lastName, role }),
    });
  }

  verifyEmail(token: string) {
    return this.request('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  forgotPassword(email: string) {
    return this.request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  resetPassword(token: string, newPassword: string) {
    return this.request('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  logout() {
    return this.request('/api/auth/logout', {
      method: 'POST',
    });
  }

  deactivateAccount(password: string, reason?: string, deleteData?: boolean) {
    return this.request('/api/auth/deactivate-account', {
      method: 'POST',
      body: JSON.stringify({ password, reason, deleteData }),
    });
  }

  // RFP endpoints
  getRFPs(page = 1, limit = 20, status = null) {
    let url = `/api/rfp/list?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    return this.request(url);
  }

  getRFPById(id: string) {
    return this.request(`/api/rfp/${id}`);
  }

  createRFP(data: any) {
    return this.request('/api/rfp/create', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateRFP(id: string, data: any) {
    return this.request(`/api/rfp/detail?id=${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  deleteRFP(id: string) {
    return this.request(`/api/rfp/detail?id=${id}`, {
      method: 'DELETE',
    });
  }

  // Win/Loss endpoints
  getWinLossAnalysis(rfpId: string) {
    return this.request(`/api/analysis/win-loss/${rfpId}`);
  }

  createWinLossRecord(data: any) {
    return this.request('/api/analysis/win-loss', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Task endpoints
  getTasks(rfpId: string) {
    return this.request(`/api/tasks?rfpId=${rfpId}`);
  }

  createTask(data: any) {
    return this.request('/api/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateTask(id: string, data: any) {
    return this.request(`/api/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Collaboration endpoints
  getCollaborators(rfpId: string) {
    return this.request(`/api/collaboration/collaborators/${rfpId}`);
  }

  addCollaborator(rfpId: string, userId: string) {
    return this.request(`/api/collaboration/add`, {
      method: 'POST',
      body: JSON.stringify({ rfpId, userId }),
    });
  }

  // Analytics endpoints
  getAnalytics() {
    return this.request('/api/analysis/analytics');
  }

  // Document endpoints
  async uploadDocument(rfpId: string, file: File, documentType: string = 'general') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);

    const url = `${API_URL}/api/rfps/${rfpId}/documents`;
    const headers: any = {};

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Document upload error:', error);
      throw error;
    }
  }

  getDocument(documentId: string) {
    return this.request(`/api/documents/${documentId}`);
  }

  downloadDocument(documentId: string) {
    return this.request(`/api/documents/${documentId}/download`);
  }

  searchDocuments(rfpId: string, query: string, type?: string, dateFrom?: string, dateTo?: string) {
    let url = `/api/rfps/${rfpId}/documents/search?q=${encodeURIComponent(query)}`;
    if (type) url += `&type=${type}`;
    if (dateFrom) url += `&dateFrom=${dateFrom}`;
    if (dateTo) url += `&dateTo=${dateTo}`;
    return this.request(url);
  }

  // Health check
  healthCheck() {
    return this.request('/api/db/connect');
  }
}

export const apiClient = new ApiClient();

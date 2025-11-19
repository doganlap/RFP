declare const API_URL: string;

type QueryParams = Record<string, string | number | boolean | undefined | null>;

interface RequestOptions extends RequestInit {
  query?: QueryParams;
}

interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

class ApiClient {
  private token: string | null;
  private readonly baseUrl: string;

  constructor(baseUrl: string = API_URL) {
    this.baseUrl = baseUrl;
    this.token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
  }

  private buildUrl(endpoint: string, query?: QueryParams): string {
    const [path, existingQuery] = endpoint.split('?');
    const params = new URLSearchParams(existingQuery);

    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          return;
        }
        params.set(key, String(value));
      });
    }

    const queryString = params.toString();
    return `${this.baseUrl}${path}${queryString ? `?${queryString}` : ''}`;
  }

  async request<T = unknown>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const url = this.buildUrl(endpoint, options.query);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (options.headers && typeof options.headers === 'object') {
      Object.assign(headers, options.headers);
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      this.clearToken();
    }

    // Some endpoints (DELETE) may not return JSON
    let data: any = null;
    const text = await response.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    if (!response.ok) {
      const message = typeof data === 'object' && data?.error ? data.error : `HTTP ${response.status}`;
      throw new Error(message);
    }

    return data as T;
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
    return this.request('/api/auth/logout', { method: 'POST' });
  }

  deactivateAccount(password: string, reason?: string, deleteData?: boolean) {
    return this.request('/api/auth/deactivate-account', {
      method: 'POST',
      body: JSON.stringify({ password, reason, deleteData }),
    });
  }

  // RFP endpoints
  getRFPs(params: { page?: number; limit?: number; status?: string } = {}) {
    return this.request<PaginatedResult<any> | any[]>('/api/rfps', {
      query: params,
    });
  }

  getRFPById(id: string) {
    return this.request(`/api/rfps/${id}`);
  }

  createRFP(data: Record<string, unknown>) {
    return this.request('/api/rfps', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updateRFP(id: string, data: Record<string, unknown>) {
    return this.request(`/api/rfps/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  deleteRFP(id: string) {
    return this.request(`/api/rfps/${id}`, { method: 'DELETE' });
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
    return this.request(`/api/rfps/${rfpId}/tasks`);
  }

  createTask(rfpId: string, data: any) {
    return this.request(`/api/rfps/${rfpId}/tasks`, {
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
  uploadDocument(rfpId: string, formData: FormData) {
    const url = `${API_URL}/api/rfps/${rfpId}/documents`;
    const headers: Record<string, string> = {};

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || 'Document upload failed');
      }
      return data;
    });
  }

  searchDocuments(rfpId: string, query: string) {
    return this.request(`/api/rfps/${rfpId}/documents/search`, {
      query: { q: query },
    });
  }

  downloadDocument(documentId: string, fileName?: string) {
    const url = `${this.baseUrl}/api/documents/${documentId}/download`;

    return fetch(url, {
      headers: this.token ? { Authorization: `Bearer ${this.token}` } : {},
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Download failed: ${response.status}`);
        }
        return response.blob();
      })
      .then((blob) => {
        // Create a temporary URL and trigger download
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = fileName || `document`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(a);
      });
  }

  deleteDocument(documentId: string) {
    return this.request(`/api/documents/${documentId}`, {
      method: 'DELETE',
    });
  }

  shareDocument(documentId: string, data: { recipientEmail: string; permission: string }) {
    return this.request(`/api/documents/${documentId}/share`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  getDocumentVersions(documentId: string) {
    return this.request(`/api/documents/${documentId}/versions`);
  }

  revertDocumentVersion(documentId: string, versionId: string) {
    return this.request(`/api/documents/${documentId}/revert`, {
      method: 'POST',
      body: JSON.stringify({ versionId }),
    });
  }

  // Health check
  healthCheck() {
    return this.request('/api/health');
  }

  healthCheckDetailed() {
    return this.request('/api/health/detailed');
  }
}

export const apiClient = new ApiClient();

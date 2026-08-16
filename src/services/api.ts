import {
  Product,
  Employee,
  LedgerEntry,
  DispatchAssignment,
  User,
} from '../types';

const TOKEN_KEY = 'omoor_auth_token';
const API_BASE = (import.meta.env.VITE_API_URL || '')
  .replace(/\/$/, '')
  .replace(/\/api$/, '');

class ApiService {
  private inFlightGetRequests: Map<string, Promise<any>> = new Map();

  private resolveUrl(endpoint: string): string {
    return `${API_BASE}${endpoint}`;
  }

  private getAuthToken(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  public setAuthToken(token: string | null): void {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch {
      // ignore
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getAuthToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    // Deduplicate GET requests
    if (!options.method || options.method.toUpperCase() === 'GET') {
      const cacheKey = endpoint;
      if (this.inFlightGetRequests.has(cacheKey)) {
        return this.inFlightGetRequests.get(cacheKey) as Promise<T>;
      }

      const fetchPromise = (async () => {
        try {
          const res = await fetch(this.resolveUrl(endpoint), config);
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.error || `HTTP error! status: ${res.status}`);
          }
          return (await res.json()) as T;
        } finally {
          this.inFlightGetRequests.delete(cacheKey);
        }
      })();

      this.inFlightGetRequests.set(cacheKey, fetchPromise);
      return fetchPromise;
    }

    // For POST/PUT/DELETE:
    const res = await fetch(this.resolveUrl(endpoint), config);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP error! status: ${res.status}`);
    }
    return (await res.json()) as T;
  }

  // ================= Auth APIs =================
  public async signup(data: { name: string; phone: string; password: string }): Promise<{ token: string; user: User; message: string }> {
    const res = await this.request<{ token: string; user: User; message: string }>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setAuthToken(res.token);
    return res;
  }

  public async signin(data: { phone: string; password: string }): Promise<{ token: string; user: User; message: string }> {
    const res = await this.request<{ token: string; user: User; message: string }>('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setAuthToken(res.token);
    return res;
  }

  public async getMe(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/api/auth/me');
  }

  public async logout(): Promise<{ success: boolean }> {
    try {
      await this.request<{ success: boolean }>('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      this.setAuthToken(null);
    }
    return { success: true };
  }

  // ================= Full State & Health =================
  public async getDbState(): Promise<{
    products: Product[];
    employees: Employee[];
    ledger: LedgerEntry[];
    dispatches: DispatchAssignment[];
    dbSource?: string;
  }> {
    return this.request('/api/db');
  }

  public async getHealth(): Promise<{ status: string; mongodb: string; database: string }> {
    return this.request('/api/health');
  }

  public async resetData(): Promise<{ success: boolean; message: string }> {
    return this.request('/api/reset', { method: 'POST' });
  }

  // ================= Products =================
  public async createProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    return this.request<Product>('/api/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  public async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    return this.request<Product>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  public async deleteProduct(id: string): Promise<{ success: boolean; id: string }> {
    return this.request<{ success: boolean; id: string }>(`/api/products/${id}`, {
      method: 'DELETE',
    });
  }

  // ================= Employees =================
  public async createEmployee(employee: Omit<Employee, 'id' | 'createdAt'>): Promise<Employee> {
    return this.request<Employee>('/api/employees', {
      method: 'POST',
      body: JSON.stringify(employee),
    });
  }

  public async updateEmployee(id: string, updates: Partial<Employee>): Promise<Employee> {
    return this.request<Employee>(`/api/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  public async deleteEmployee(id: string): Promise<{ success: boolean; id: string }> {
    return this.request<{ success: boolean; id: string }>(`/api/employees/${id}`, {
      method: 'DELETE',
    });
  }

  // ================= Dispatches & Settlement =================
  public async createDispatch(data: {
    employeeId: string;
    date?: string;
    items: Array<{ productId: string; assignedQty: number; salePrice?: number }>;
  }): Promise<DispatchAssignment> {
    return this.request<DispatchAssignment>('/api/dispatches', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async settleDispatch(
    id: string,
    data: {
      cashInHand: number;
      date?: string;
      items?: Array<{
        productId: string;
        productName: string;
        assignedQty: number;
        salePrice: number;
        totalAssignPrice: number;
        returnQty: number;
        totalReturnPrice: number;
        netSoldQty: number;
        netSoldAmount: number;
      }>;
    }
  ): Promise<{
    dispatch: DispatchAssignment;
    products: Product[];
    ledger: LedgerEntry[];
  }> {
    return this.request(`/api/dispatches/${id}/settle`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ================= Ledger & Recovery =================
  public async recordRecovery(data: {
    employeeId: string;
    amount: number;
    date?: string;
    description?: string;
  }): Promise<LedgerEntry> {
    return this.request<LedgerEntry>('/api/recovery', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  public async deleteLedgerEntry(id: string): Promise<{ success: boolean; id: string }> {
    return this.request<{ success: boolean; id: string }>(`/api/ledger/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiService();

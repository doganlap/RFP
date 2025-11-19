/**
 * Enterprise Authentication Hook
 */
import { useAppStore } from '../store';
import { apiClient } from '../services/ApiClient';
import type { User } from '../types';

export const useAuth = () => {
  const user = useAppStore((state) => state.user);
  const setUser = useAppStore((state) => state.setUser);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await apiClient.login(email, password);

      if (response.success && response.token) {
        apiClient.setToken(response.token);
        // Parse name into firstName and lastName
        const nameParts = (response.user?.name || '').split(' ');
        const user: User = {
          id: response.user?.id || '1',
          email: response.user?.email || email,
          role: (response.user?.role || 'sales_rep') as any,
          firstName: nameParts[0] || '',
          lastName: nameParts.slice(1).join(' ') || '',
          permissions: getPermissionsForRole(response.user?.role || 'sales_rep'),
        };
        setUser(user);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = (): void => {
    setUser(null);
    apiClient.clearToken();
    localStorage.removeItem('auth_token');
  };

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<void> => {
    try {
      const response = await apiClient.register(email, password, firstName, lastName, 'sales_rep');

      if (response.success && response.token) {
        apiClient.setToken(response.token);
        const user: User = {
          id: response.user?.id || '1',
          email: response.user?.email || email,
          role: (response.user?.role || 'sales_rep') as any,
          firstName: firstName,
          lastName: lastName,
          permissions: getPermissionsForRole(response.user?.role || 'sales_rep'),
        };
        setUser(user);
      }
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    if (!user) return;
    setUser({ ...user, ...updates });
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    return user.permissions.includes(permission as any);
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.role === role;
  };

  const getPermissionsForRole = (role: string): string[] => {
    const rolePermissions: Record<string, string[]> = {
      'admin': ['rfp.read', 'rfp.create', 'rfp.edit', 'rfp.delete', 'team.assign', 'users.manage'],
      'sales_rep': ['rfp.read', 'rfp.create', 'rfp.edit', 'go_no_go.submit'],
      'sales_manager': ['rfp.read', 'rfp.create', 'rfp.edit', 'rfp.delete', 'go_no_go.approve', 'team.assign'],
      'presales_lead': ['rfp.read', 'rfp.edit', 'solution.plan', 'team.view', 'arch.review'],
      'solution_architect': ['rfp.read', 'solution.plan', 'boq.edit', 'arch.review', 'compliance.map'],
      'pricing_finance': ['rfp.read', 'pricing.model', 'discount.request', 'pricing.approve'],
      'legal_contracts': ['rfp.read', 'rfp.edit'],
      'compliance_grc': ['rfp.read', 'compliance.map'],
      'pmo': ['rfp.read', 'team.view'],
    };
    return rolePermissions[role.toLowerCase()] || [];
  };

  return {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    register,
    updateProfile,
    hasPermission,
    hasRole,
  };
};

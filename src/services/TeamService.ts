/**
 * Team Service - CRUD operations for team members
 */
import { apiClient } from './ApiClient';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export class TeamService {
  async getTeamMembers(): Promise<TeamMember[]> {
    return apiClient.request('/api/team');
  }

  async getTeamMember(id: string): Promise<TeamMember> {
    return apiClient.request(`/api/team/${id}`);
  }

  async createTeamMember(member: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>): Promise<TeamMember> {
    return apiClient.request('/api/team', {
      method: 'POST',
      body: JSON.stringify(member),
    });
  }

  async updateTeamMember(id: string, member: Partial<TeamMember>): Promise<TeamMember> {
    return apiClient.request(`/api/team/${id}`, {
      method: 'PUT',
      body: JSON.stringify(member),
    });
  }

  async deleteTeamMember(id: string): Promise<void> {
    return apiClient.request(`/api/team/${id}`, {
      method: 'DELETE',
    });
  }
}

export const teamService = new TeamService();

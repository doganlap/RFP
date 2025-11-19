import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { teamService, TeamMember } from '../services/TeamService';
import { Plus, Edit, Trash2, Users, UserCheck, TrendingUp, Shield, BarChart3 } from 'lucide-react';
import { cn } from '../utils/cn';

const Team: React.FC = () => {
  const { t } = useTranslation();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'roles' | 'performance'>('overview');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      const members = await teamService.getTeamMembers();
      setTeamMembers(members);
    } catch (error) {
      console.error('Failed to load team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMember) {
        await teamService.updateTeamMember(editingMember.id, formData);
      } else {
        await teamService.createTeamMember(formData);
      }
      await loadTeamMembers();
      setShowForm(false);
      setEditingMember(null);
      resetForm();
    } catch (error) {
      console.error('Failed to save team member:', error);
    }
  };

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      role: member.role,
      department: member.department,
      status: member.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm(t('confirm_delete'))) {
      try {
        await teamService.deleteTeamMember(id);
        await loadTeamMembers();
      } catch (error) {
        console.error('Failed to delete team member:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: '',
      department: '',
      status: 'active',
    });
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'text-green-600 bg-green-50' : 'text-gray-600 bg-gray-50';
  };

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin': return <Shield className="w-4 h-4" />;
      case 'manager': return <UserCheck className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  const totalMembers = teamMembers.length;
  const activeMembers = teamMembers.filter(m => m.status === 'active').length;
  const departmentCount = new Set(teamMembers.map(m => m.department)).size;
  const roleCount = new Set(teamMembers.map(m => m.role)).size;

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-lg">
            <Users className="w-8 h-8 text-indigo-600" />
          </div>
          {t('team_management')}
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t('add_team_member')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-xl border border-indigo-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-indigo-600 font-medium">{t('total_members')}</p>
              <p className="text-2xl font-bold text-indigo-800">{totalMembers}</p>
            </div>
            <Users className="w-8 h-8 text-indigo-500" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">{t('active_members')}</p>
              <p className="text-2xl font-bold text-green-800">{activeMembers}</p>
            </div>
            <UserCheck className="w-8 h-8 text-green-500" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">{t('departments')}</p>
              <p className="text-2xl font-bold text-blue-800">{departmentCount}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">{t('roles')}</p>
              <p className="text-2xl font-bold text-purple-800">{roleCount}</p>
            </div>
            <Shield className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: t('overview'), icon: Users },
          { id: 'members', label: t('team_members'), icon: UserCheck },
          { id: 'roles', label: t('roles_permissions'), icon: Shield },
          { id: 'performance', label: t('performance'), icon: TrendingUp },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">{t('team_overview')}</h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border">
              <h3 className="font-semibold mb-4">{t('department_distribution')}</h3>
              <div className="space-y-3">
                {Array.from(new Set(teamMembers.map(m => m.department))).map((dept) => {
                  const count = teamMembers.filter(m => m.department === dept).length;
                  return (
                    <div key={dept} className="flex justify-between items-center">
                      <span className="text-sm">{dept}</span>
                      <span className="text-sm font-medium">{count} members</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl border">
              <h3 className="font-semibold mb-4">{t('role_distribution')}</h3>
              <div className="space-y-3">
                {Array.from(new Set(teamMembers.map(m => m.role))).map((role) => {
                  const count = teamMembers.filter(m => m.role === role).length;
                  return (
                    <div key={role} className="flex justify-between items-center">
                      <span className="text-sm flex items-center gap-2">
                        {getRoleIcon(role)}
                        {role}
                      </span>
                      <span className="text-sm font-medium">{count} members</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'members' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t('team_members')}</h2>
          <div className="grid gap-4">
            {teamMembers.map((member) => (
              <div key={member.id} className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <span className="text-indigo-600 font-semibold text-lg">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{member.name}</h3>
                      <p className="text-gray-600">{member.email}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1 text-sm">
                          {getRoleIcon(member.role)}
                          {member.role}
                        </span>
                        <span className="text-sm text-gray-600">{member.department}</span>
                        <span className={cn('px-2 py-1 rounded-full text-xs font-medium', getStatusColor(member.status))}>
                          {member.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(member)}
                      className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                      aria-label={`Edit ${member.name}`}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(member.id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                      aria-label={`Delete ${member.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'roles' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t('roles_permissions')}</h2>
          <div className="grid grid-cols-2 gap-6">
            {[
              {
                role: 'Admin',
                permissions: ['Full Access', 'User Management', 'System Settings', 'Reports'],
                count: teamMembers.filter(m => m.role === 'Admin').length
              },
              {
                role: 'Manager',
                permissions: ['Team Management', 'Project Oversight', 'Reports', 'Approvals'],
                count: teamMembers.filter(m => m.role === 'Manager').length
              },
              {
                role: 'Developer',
                permissions: ['Code Access', 'Project Tasks', 'Technical Reviews'],
                count: teamMembers.filter(m => m.role === 'Developer').length
              },
              {
                role: 'Analyst',
                permissions: ['Data Analysis', 'Reports', 'Research'],
                count: teamMembers.filter(m => m.role === 'Analyst').length
              },
            ].map((roleData, index) => (
              <div key={index} className="bg-white p-6 rounded-xl border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold flex items-center gap-2">
                    {getRoleIcon(roleData.role)}
                    {roleData.role}
                  </h3>
                  <span className="text-sm text-gray-600">{roleData.count} members</span>
                </div>
                <div className="space-y-2">
                  {roleData.permissions.map((perm, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      {perm}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">{t('team_performance')}</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { metric: 'Avg Projects/Member', value: '3.2', trend: '+12%' },
              { metric: 'Task Completion Rate', value: '87%', trend: '+5%' },
              { metric: 'Client Satisfaction', value: '4.6/5', trend: '+8%' },
            ].map((item, index) => (
              <div key={index} className="bg-white p-4 rounded-lg border">
                <h4 className="font-medium">{item.metric}</h4>
                <p className="text-2xl font-bold text-indigo-600">{item.value}</p>
                <p className="text-sm text-green-600">{item.trend} this month</p>
              </div>
            ))}
          </div>
          <div className="bg-white p-6 rounded-xl border">
            <h3 className="font-semibold mb-4">{t('member_performance')}</h3>
            <div className="space-y-3">
              {teamMembers.slice(0, 5).map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-sm font-medium">{member.name}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm">Projects: {Math.floor(Math.random() * 5) + 1}</span>
                    <span className="text-sm">Rating: {(Math.random() * 0.5 + 4.5).toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingMember ? t('edit_team_member') : t('add_team_member')}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('name')}</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder={t('enter_name')}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('email')}</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2 border rounded"
                  placeholder={t('enter_email')}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('role')}</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full p-2 border rounded"
                  aria-label={t('select_role')}
                  required
                >
                  <option value="">{t('select_role')}</option>
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Developer">Developer</option>
                  <option value="Analyst">Analyst</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('department')}</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full p-2 border rounded"
                  aria-label={t('select_department')}
                  required
                >
                  <option value="">{t('select_department')}</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Sales">Sales</option>
                  <option value="Legal">Legal</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('status')}</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full p-2 border rounded"
                  aria-label={t('select_status')}
                >
                  <option value="active">{t('active')}</option>
                  <option value="inactive">{t('inactive')}</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 flex-1"
                >
                  {editingMember ? t('update') : t('add')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingMember(null);
                    resetForm();
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex-1"
                >
                  {t('cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Team;

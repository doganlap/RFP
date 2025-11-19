import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { teamService, TeamMember } from '../services/TeamService';
import { Plus, Edit, Trash2, Users } from 'lucide-react';

const Team: React.FC = () => {
  const { t } = useTranslation();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    department: '',
    status: 'active' as const,
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

  if (loading) {
    return <div className="p-6">{t('loading')}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6" />
          {t('team')}
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t('add_member')}
        </button>
      </div>

      <div className="grid gap-4">
        {teamMembers.map((member) => (
          <div key={member.id} className="bg-white p-4 rounded-lg shadow border">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold">{member.name}</h3>
                <p className="text-gray-600">{member.email}</p>
                <p className="text-sm text-gray-500">{member.role} - {member.department}</p>
                <span className={`inline-block px-2 py-1 text-xs rounded ${
                  member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {member.status}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(member)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingMember ? t('edit_member') : t('add_member')}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder={t('name')}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="email"
                  placeholder={t('email')}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="text"
                  placeholder={t('role')}
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
                <input
                  type="text"
                  placeholder={t('department')}
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                  className="w-full p-2 border rounded"
                >
                  <option value="active">{t('active')}</option>
                  <option value="inactive">{t('inactive')}</option>
                </select>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {editingMember ? t('update') : t('create')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingMember(null);
                    resetForm();
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
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

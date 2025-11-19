'use client';

import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { teamAPI } from '@/lib/api';
import type { Team, TeamMember } from '@/types';
import toast from 'react-hot-toast';

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState<Omit<TeamMember, '_id'>[]>([]);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await teamAPI.getAll();
      setTeams(response.data);
    } catch (error) {
      toast.error('Failed to load teams');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (team?: Team) => {
    if (team) {
      setEditingTeam(team);
      setTeamName(team.name);
      setMembers(team.members);
    } else {
      setEditingTeam(null);
      setTeamName('');
      setMembers([]);
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTeam(null);
    setTeamName('');
    setMembers([]);
  };

  const addMember = () => {
    setMembers([...members, { name: '', role: '', capacity: 3 }]);
  };

  const updateMember = (index: number, field: keyof Omit<TeamMember, '_id'>, value: any) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
  };

  const removeMember = (index: number) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!teamName.trim()) {
      toast.error('Team name is required');
      return;
    }

    try {
      if (editingTeam) {
        await teamAPI.update(editingTeam._id, { name: teamName, members });
        toast.success('Team updated successfully');
      } else {
        await teamAPI.create({ name: teamName, members });
        toast.success('Team created successfully');
      }
      closeModal();
      fetchTeams();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save team');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this team?')) return;

    try {
      await teamAPI.delete(id);
      toast.success('Team deleted successfully');
      fetchTeams();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete team');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">Loading...</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        <div className="sm:flex sm:items-center sm:justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Teams</h2>
          <button
            onClick={() => openModal()}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Create Team
          </button>
        </div>

        {teams.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 mb-4">No teams found. Create your first team to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
              <div key={team._id} className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{team.name}</h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">
                      <span className="font-medium">{team.members.length}</span> member
                      {team.members.length !== 1 ? 's' : ''}
                    </p>
                    {team.members.length > 0 && (
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Members:</h4>
                        <ul className="space-y-1">
                          {team.members.map((member) => (
                            <li key={member._id} className="text-sm text-gray-600">
                              {member.name} - {member.role} (Capacity: {member.capacity})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex space-x-3">
                    <button
                      onClick={() => openModal(team)}
                      className="flex-1 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(team._id)}
                      className="flex-1 bg-red-50 py-2 px-4 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal}></div>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <form onSubmit={handleSubmit}>
                  <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                      {editingTeam ? 'Edit Team' : 'Create Team'}
                    </h3>

                    <div className="mb-4">
                      <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-1">
                        Team Name
                      </label>
                      <input
                        type="text"
                        id="teamName"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">Team Members</label>
                        <button
                          type="button"
                          onClick={addMember}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          + Add Member
                        </button>
                      </div>

                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {members.map((member, index) => (
                          <div key={index} className="border border-gray-200 rounded p-3">
                            <div className="grid grid-cols-2 gap-2 mb-2">
                              <input
                                type="text"
                                placeholder="Name"
                                value={member.name}
                                onChange={(e) => updateMember(index, 'name', e.target.value)}
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md px-2 py-1 border"
                                required
                              />
                              <input
                                type="text"
                                placeholder="Role"
                                value={member.role}
                                onChange={(e) => updateMember(index, 'role', e.target.value)}
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md px-2 py-1 border"
                                required
                              />
                            </div>
                            <div className="flex items-center space-x-2">
                              <label className="text-xs text-gray-600">Capacity (0-5):</label>
                              <input
                                type="number"
                                min="0"
                                max="5"
                                value={member.capacity}
                                onChange={(e) => updateMember(index, 'capacity', parseInt(e.target.value))}
                                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-20 sm:text-sm border-gray-300 rounded-md px-2 py-1 border"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => removeMember(index)}
                                className="text-sm text-red-600 hover:text-red-700"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      {editingTeam ? 'Update' : 'Create'}
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto sm:text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

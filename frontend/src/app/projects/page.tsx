'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { projectAPI, teamAPI, taskAPI } from '@/lib/api';
import type { Project, Team } from '@/types';
import toast from 'react-hot-toast';

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projectsRes, teamsRes] = await Promise.all([
        projectAPI.getAll(),
        teamAPI.getAll(),
      ]);
      setProjects(projectsRes.data);
      setTeams(teamsRes.data);
    } catch (error) {
      toast.error('Failed to load data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (project?: Project) => {
    if (project) {
      setEditingProject(project);
      setProjectName(project.name);
      setDescription(project.description);
      setSelectedTeam(typeof project.team === 'string' ? project.team : project.team._id);
    } else {
      setEditingProject(null);
      setProjectName('');
      setDescription('');
      setSelectedTeam('');
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProject(null);
    setProjectName('');
    setDescription('');
    setSelectedTeam('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectName.trim() || !selectedTeam) {
      toast.error('Project name and team are required');
      return;
    }

    try {
      if (editingProject) {
        await projectAPI.update(editingProject._id, {
          name: projectName,
          description,
          team: selectedTeam,
        });
        toast.success('Project updated successfully');
      } else {
        await projectAPI.create({
          name: projectName,
          description,
          team: selectedTeam,
        });
        toast.success('Project created successfully');
      }
      closeModal();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save project');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      await projectAPI.delete(id);
      toast.success('Project deleted successfully');
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete project');
    }
  };

  const handleReassignTasks = async (projectId: string) => {
    try {
      const response = await taskAPI.reassign(projectId);
      toast.success(response.data.message || 'Tasks reassigned successfully');
      // Optionally refresh data
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to reassign tasks');
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
          <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
          <button
            onClick={() => openModal()}
            className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Create Project
          </button>
        </div>

        {teams.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-6">
            <p className="text-sm text-yellow-800">
              You need to create a team first before creating projects.
            </p>
          </div>
        )}

        {projects.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 mb-4">No projects found. Create your first project to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => {
              const team = typeof project.team === 'object' ? project.team : null;
              return (
                <div key={project._id} className="bg-white shadow rounded-lg overflow-hidden">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{project.name}</h3>
                    {project.description && (
                      <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                    )}
                    <div className="text-sm text-gray-500 mb-4">
                      <span className="font-medium">Team:</span> {team?.name || 'Unknown'}
                      <br />
                      <span className="font-medium">Members:</span> {team?.members.length || 0}
                    </div>
                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => router.push(`/tasks?project=${project._id}`)}
                        className="bg-green-600 text-white py-2 px-4 rounded-md shadow-sm text-sm font-medium hover:bg-green-700"
                      >
                        View Tasks
                      </button>
                      <button
                        onClick={() => handleReassignTasks(project._id)}
                        className="bg-purple-600 text-white py-2 px-4 rounded-md shadow-sm text-sm font-medium hover:bg-purple-700"
                      >
                        Reassign Tasks
                      </button>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openModal(project)}
                          className="flex-1 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(project._id)}
                          className="flex-1 bg-red-50 py-2 px-4 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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
                      {editingProject ? 'Edit Project' : 'Create Project'}
                    </h3>

                    <div className="mb-4">
                      <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">
                        Project Name
                      </label>
                      <input
                        type="text"
                        id="projectName"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
                        required
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
                      />
                    </div>

                    <div className="mb-4">
                      <label htmlFor="team" className="block text-sm font-medium text-gray-700 mb-1">
                        Team
                      </label>
                      <select
                        id="team"
                        value={selectedTeam}
                        onChange={(e) => setSelectedTeam(e.target.value)}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
                        required
                      >
                        <option value="">Select a team</option>
                        {teams.map((team) => (
                          <option key={team._id} value={team._id}>
                            {team.name} ({team.members.length} members)
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      {editingProject ? 'Update' : 'Create'}
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

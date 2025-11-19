'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { taskAPI, projectAPI, teamAPI } from '@/lib/api';
import type { Task, Project, Team, Priority, Status, MemberWorkload } from '@/types';
import toast from 'react-hot-toast';

export default function TasksContent() {
  const searchParams = useSearchParams();
  const projectIdFromUrl = searchParams.get('project');

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [workload, setWorkload] = useState<MemberWorkload[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedProject, setSelectedProject] = useState(projectIdFromUrl || '');
  const [assignedMember, setAssignedMember] = useState<string>('');
  const [priority, setPriority] = useState<Priority>('Medium' as Priority);
  const [status, setStatus] = useState<Status>('Pending' as Status);

  // Filter state
  const [filterProject, setFilterProject] = useState(projectIdFromUrl || '');
  const [filterMember, setFilterMember] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Warning state
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchWorkload(selectedProject);
    }
  }, [selectedProject]);

  useEffect(() => {
    fetchTasks();
  }, [filterProject, filterMember, filterStatus]);

  const fetchData = async () => {
    try {
      const [projectsRes, teamsRes] = await Promise.all([
        projectAPI.getAll(),
        teamAPI.getAll(),
      ]);
      setProjects(projectsRes.data);
      setTeams(teamsRes.data);
      await fetchTasks();
    } catch (error) {
      toast.error('Failed to load data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    try {
      const params: any = {};
      if (filterProject) params.project = filterProject;
      if (filterMember) params.member = filterMember;
      if (filterStatus) params.status = filterStatus;

      const response = await taskAPI.getAll(params);
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };

  const fetchWorkload = async (projectId: string) => {
    try {
      const response = await taskAPI.getWorkload(projectId);
      setWorkload(response.data);
    } catch (error) {
      console.error('Failed to fetch workload:', error);
      setWorkload([]);
    }
  };

  const getTeamForProject = (projectId: string) => {
    const project = projects.find((p) => p._id === projectId);
    if (!project) return null;
    return typeof project.team === 'object' ? project.team : teams.find((t) => t._id === project.team);
  };

  const openModal = (task?: Task) => {
    if (task) {
      setEditingTask(task);
      setTitle(task.title);
      setDescription(task.description);
      setSelectedProject(typeof task.project === 'string' ? task.project : task.project._id);
      setAssignedMember(task.assignedMember || '');
      setPriority(task.priority);
      setStatus(task.status);
    } else {
      setEditingTask(null);
      setTitle('');
      setDescription('');
      setSelectedProject(projectIdFromUrl || '');
      setAssignedMember('');
      setPriority('Medium' as Priority);
      setStatus('Pending' as Status);
    }
    setShowWarning(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingTask(null);
    setShowWarning(false);
  };

  const checkCapacity = (memberId: string) => {
    const memberWorkload = workload.find((w) => w.memberId === memberId);
    if (memberWorkload && memberWorkload.isOverloaded) {
      setShowWarning(true);
      setWarningMessage(
        `${memberWorkload.name} has ${memberWorkload.currentTasks} tasks but capacity is ${memberWorkload.capacity}. Assign anyway?`
      );
      return false;
    }
    setShowWarning(false);
    return true;
  };

  const handleMemberChange = (memberId: string) => {
    setAssignedMember(memberId);
    if (memberId) {
      checkCapacity(memberId);
    } else {
      setShowWarning(false);
    }
  };

  const handleAutoAssign = async () => {
    if (!selectedProject) {
      toast.error('Please select a project first');
      return;
    }

    // Find member with least load
    if (workload.length === 0) {
      toast.error('No team members available');
      return;
    }

    const sorted = [...workload].sort((a, b) => {
      const loadA = a.currentTasks / a.capacity;
      const loadB = b.currentTasks / b.capacity;
      return loadA - loadB;
    });

    setAssignedMember(sorted[0].memberId);
    toast.success(`Auto-assigned to ${sorted[0].name}`);
    setShowWarning(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !selectedProject) {
      toast.error('Title and project are required');
      return;
    }

    try {
      const taskData = {
        title,
        description,
        project: selectedProject,
        assignedMember: assignedMember || null,
        priority,
        status,
      };

      if (editingTask) {
        await taskAPI.update(editingTask._id, taskData);
        toast.success('Task updated successfully');
      } else {
        await taskAPI.create(taskData);
        toast.success('Task created successfully');
      }
      closeModal();
      fetchTasks();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save task');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      await taskAPI.delete(id);
      toast.success('Task deleted successfully');
      fetchTasks();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete task');
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: Status) => {
    switch (status) {
      case 'Done':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMemberName = (task: Task) => {
    if (!task.assignedMember) return 'Unassigned';

    const project = typeof task.project === 'object' ? task.project : projects.find((p) => p._id === task.project);
    if (!project) return 'Unknown';

    const team = typeof project.team === 'object' ? project.team : teams.find((t) => t._id === project.team);
    if (!team) return 'Unknown';

    const member = team.members.find((m) => m._id === task.assignedMember);
    return member ? member.name : 'Unknown';
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  const currentTeam = selectedProject ? getTeamForProject(selectedProject) : null;

  return (
    <div className="px-4 sm:px-0">
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
        <button
          onClick={() => openModal()}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Create Task
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Filters</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Project</label>
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
            >
              <option value="">All Projects</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Member</label>
            <select
              value={filterMember}
              onChange={(e) => setFilterMember(e.target.value)}
              className="block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
            >
              <option value="">All Members</option>
              <option value="unassigned">Unassigned</option>
              {teams.flatMap((team) =>
                team.members.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name} ({team.name})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500 mb-4">No tasks found. Create your first task to get started.</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {tasks.map((task) => {
              const project = typeof task.project === 'object' ? task.project : projects.find((p) => p._id === task.project);
              return (
                <li key={task._id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                        {task.description && (
                          <p className="mt-1 text-sm text-gray-600">{task.description}</p>
                        )}
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {project?.name || 'Unknown Project'}
                          </span>
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                            {getMemberName(task)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4 flex space-x-2">
                        <button
                          onClick={() => openModal(task)}
                          className="bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(task._id)}
                          className="bg-red-50 py-2 px-3 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Task Modal */}
      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                    {editingTask ? 'Edit Task' : 'Create Task'}
                  </h3>

                  <div className="mb-4">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Task Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
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
                    <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-1">
                      Project
                    </label>
                    <select
                      id="project"
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
                      required
                    >
                      <option value="">Select a project</option>
                      {projects.map((project) => (
                        <option key={project._id} value={project._id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <label htmlFor="assignedMember" className="block text-sm font-medium text-gray-700">
                        Assigned Member
                      </label>
                      {selectedProject && (
                        <button
                          type="button"
                          onClick={handleAutoAssign}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          Auto-assign
                        </button>
                      )}
                    </div>
                    <select
                      id="assignedMember"
                      value={assignedMember}
                      onChange={(e) => handleMemberChange(e.target.value)}
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
                    >
                      <option value="">Unassigned</option>
                      {currentTeam?.members.map((member) => {
                        const memberWorkload = workload.find((w) => w.memberId === member._id);
                        return (
                          <option key={member._id} value={member._id}>
                            {member.name} - {member.role} (
                            {memberWorkload ? `${memberWorkload.currentTasks}/${memberWorkload.capacity}` : `0/${member.capacity}`})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {showWarning && (
                    <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-md p-3">
                      <p className="text-sm text-yellow-800">{warningMessage}</p>
                      <div className="mt-2 flex space-x-2">
                        <button
                          type="button"
                          onClick={() => setShowWarning(false)}
                          className="text-sm bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700"
                        >
                          Assign Anyway
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAssignedMember('');
                            setShowWarning(false);
                          }}
                          className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300"
                        >
                          Choose Another
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                      </label>
                      <select
                        id="priority"
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as Priority)}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
                      >
                        <option value="Low">Low</option>
                        <option value="Medium">Medium</option>
                        <option value="High">High</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        id="status"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as Status)}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md px-3 py-2 border"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {editingTask ? 'Update' : 'Create'}
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
  );
}

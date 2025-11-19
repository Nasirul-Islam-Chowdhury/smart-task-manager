export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface TeamMember {
  _id: string;
  name: string;
  role: string;
  capacity: number;
}

export interface Team {
  _id: string;
  name: string;
  owner: string;
  members: TeamMember[];
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  team: Team | string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export enum Status {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  DONE = 'Done'
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  project: Project | string;
  assignedMember: string | null;
  priority: Priority;
  status: Status;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  _id: string;
  task: Task | string;
  taskTitle: string;
  fromMember: string;
  toMember: string;
  owner: string;
  timestamp: string;
}

export interface MemberWorkload {
  memberId: string;
  name: string;
  role: string;
  capacity: number;
  currentTasks: number;
  isOverloaded: boolean;
}

export interface TeamSummary {
  teamId: string;
  teamName: string;
  memberId: string;
  memberName: string;
  role: string;
  capacity: number;
  currentTasks: number;
  isOverloaded: boolean;
}

export interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  teamSummary: TeamSummary[];
  recentReassignments: ActivityLog[];
}

# Smart Task Manager

A full-stack web application for managing projects, teams, and tasks with intelligent task assignment and workload balancing.

## Features

### 1. User & Team Setup
- User registration and authentication
- Create and manage teams
- Add team members with roles and capacity (0-5 tasks)

### 2. Project & Task Management
- Create projects linked to specific teams
- Add, edit, delete, and filter tasks
- Task properties:
  - Title and description
  - Assigned team member
  - Priority: Low / Medium / High
  - Status: Pending / In Progress / Done

### 3. Smart Task Assignment
- View member workload (current tasks / capacity) when assigning
- Capacity warnings when assigning to overloaded members
- Auto-assign feature to assign tasks to least loaded members
- Manual assignment with confirmation for overloaded members

### 4. Auto Reassignment
- "Reassign Tasks" button to automatically balance workload
- Moves low and medium priority tasks from overloaded members
- Keeps high priority tasks with current assignees
- Records all changes in Activity Log

### 5. Dashboard
- Total projects and tasks statistics
- Team summary showing all members' workload
- Visual indicators for overloaded members
- Recent reassignments activity log

### 6. Activity Log
- Records all task reassignments
- Shows task title, from/to members, and timestamp
- Displays recent 5 reassignments on dashboard

## Live Demo

🌐 **Frontend**: [https://smart-task-manager.vercel.app](https://smart-task-manager.vercel.app)
🔧 **Backend API**: [https://smart-task-manager-api.vercel.app](https://smart-task-manager-api.vercel.app)

## Tech Stack

### Backend
- **Node.js** with **Express**
- **TypeScript**
- **MongoDB** with **Mongoose**
- **JWT** for authentication
- **bcryptjs** for password hashing

### Frontend
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **Axios** for API calls
- **React Hook Form**
- **React Hot Toast** for notifications

## Project Structure

```
smart-task-manager/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.ts
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Team.ts
│   │   │   ├── Project.ts
│   │   │   ├── Task.ts
│   │   │   └── ActivityLog.ts
│   │   ├── routes/
│   │   │   ├── auth.ts
│   │   │   ├── teams.ts
│   │   │   ├── projects.ts
│   │   │   ├── tasks.ts
│   │   │   ├── activityLogs.ts
│   │   │   └── dashboard.ts
│   │   └── server.ts
│   ├── .env
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/
│   │   │   ├── teams/
│   │   │   ├── projects/
│   │   │   ├── tasks/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── globals.css
│   │   ├── components/
│   │   │   └── Layout.tsx
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── lib/
│   │   │   └── api.ts
│   │   └── types/
│   │       └── index.ts
│   ├── .env.local
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── next.config.js
│
└── README.md
```

## Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (running locally or a connection URI)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd smart-task-manager/backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
The `.env` file is already created with default values:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-task-manager
JWT_SECRET=smart_task_manager_secret_key_2024
NODE_ENV=development
```

4. Make sure MongoDB is running locally, or update `MONGODB_URI` with your MongoDB connection string.

5. Start the development server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd smart-task-manager/frontend
```

2. Install dependencies:
```bash
npm install
```

3. The `.env.local` file is already created with:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Usage Guide

### 1. Register and Login
- Visit `http://localhost:3000`
- Create an account or login

### 2. Create a Team
- Navigate to "Teams" page
- Click "Create Team"
- Add team name and members with their roles and capacity

### 3. Create a Project
- Navigate to "Projects" page
- Click "Create Project"
- Select a team and provide project details

### 4. Manage Tasks
- Navigate to "Tasks" page
- Click "Create Task"
- Fill in task details and assign to a team member
- System will warn if member is overloaded
- Use "Auto-assign" for automatic assignment to least loaded member

### 5. Reassign Tasks
- From Projects page, click "Reassign Tasks" on any project
- System automatically balances workload across team members
- Check Activity Log for reassignment history

### 6. Monitor Dashboard
- View overall statistics
- Check team member workload
- See recent reassignments

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Teams
- `GET /api/teams` - Get all teams
- `GET /api/teams/:id` - Get team by ID
- `POST /api/teams` - Create team
- `PUT /api/teams/:id` - Update team
- `DELETE /api/teams/:id` - Delete team

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - Get all tasks (with filters)
- `GET /api/tasks/:id` - Get task by ID
- `GET /api/tasks/workload/:projectId` - Get member workload
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/auto-assign/:projectId` - Auto-assign task
- `POST /api/tasks/reassign/:projectId` - Reassign all project tasks

### Activity Logs
- `GET /api/activity-logs` - Get recent activity logs
- `GET /api/activity-logs/project/:projectId` - Get project activity logs

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## Features in Detail

### Task Assignment Flow
When creating/editing a task:
1. Select project (team auto-links)
2. Choose assigned member from dropdown
3. See each member's current tasks vs capacity
4. Get warning if member is overloaded
5. Choose to assign anyway or select another member
6. Use auto-assign for optimal assignment

### Auto Reassignment Algorithm
1. Identifies overloaded members (tasks > capacity)
2. Excludes high priority tasks from reassignment
3. Moves low/medium priority tasks to members with free capacity
4. Selects target member with lowest workload ratio
5. Updates task assignments
6. Logs all reassignments to Activity Log

### Filtering
- Filter tasks by project
- Filter tasks by team member
- Filter tasks by status
- Combine multiple filters

## Development

### Backend Development
```bash
cd backend
npm run dev
```

### Frontend Development
```bash
cd frontend
npm run dev
```

### Build for Production

Backend:
```bash
cd backend
npm run build
npm start
```

Frontend:
```bash
cd frontend
npm run build
npm start
```

## Deployment to Vercel

This application is ready to deploy to Vercel's free tier!

### Quick Deployment

See [QUICK_DEPLOY.md](QUICK_DEPLOY.md) for step-by-step instructions.

### Summary:

1. **Set up MongoDB Atlas** (Free M0 cluster)
2. **Deploy Backend** to Vercel with environment variables
3. **Deploy Frontend** to Vercel pointing to backend URL

Full detailed guide: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

### Required Environment Variables

**Backend:**
- `MONGODB_URI` - Your MongoDB Atlas connection string
- `JWT_SECRET` - A secure random string
- `NODE_ENV` - production

**Frontend:**
- `NEXT_PUBLIC_API_URL` - Your Vercel backend URL + `/api`

## Security Features
- Password hashing with bcryptjs
- JWT authentication
- Protected API routes
- Input validation
- CORS configuration

## Future Enhancements
- Email notifications for task assignments
- Real-time updates with WebSockets
- Task dependencies
- Time tracking
- File attachments
- Team chat
- Calendar view
- Mobile app

## License
MIT

## Author
Built with Next.js, Express, and MongoDB

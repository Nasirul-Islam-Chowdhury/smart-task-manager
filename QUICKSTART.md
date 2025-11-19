# Quick Start Guide

## Prerequisites
Before starting, ensure you have:
- Node.js (v18+) installed
- MongoDB installed and running locally

## Step 1: Install MongoDB (if not already installed)

### macOS:
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Windows:
Download from https://www.mongodb.com/try/download/community

### Linux:
Follow instructions at https://docs.mongodb.com/manual/administration/install-on-linux/

## Step 2: Start the Backend

```bash
# Navigate to backend folder
cd smart-task-manager/backend

# Install dependencies
npm install

# Start the server
npm run dev
```

You should see:
```
MongoDB connected successfully
Server is running on port 5000
```

## Step 3: Start the Frontend

Open a new terminal:

```bash
# Navigate to frontend folder
cd smart-task-manager/frontend

# Install dependencies
npm install

# Start the Next.js app
npm run dev
```

You should see:
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

## Step 4: Use the Application

1. Open your browser and go to `http://localhost:3000`
2. Click "Create a new account"
3. Register with your name, email, and password
4. You'll be automatically logged in and redirected to the dashboard

## Step 5: Create Your First Team

1. Navigate to "Teams" from the navigation
2. Click "Create Team"
3. Enter a team name (e.g., "Development Team")
4. Add team members:
   - Click "+ Add Member"
   - Enter: Name: "Alice", Role: "Developer", Capacity: 3
   - Click "+ Add Member" again
   - Enter: Name: "Bob", Role: "Designer", Capacity: 4
   - Click "+ Add Member" again
   - Enter: Name: "Charlie", Role: "QA", Capacity: 2
5. Click "Create"

## Step 6: Create a Project

1. Navigate to "Projects"
2. Click "Create Project"
3. Enter project name (e.g., "Website Redesign")
4. Add a description (optional)
5. Select the team you created
6. Click "Create"

## Step 7: Create Tasks

1. Navigate to "Tasks"
2. Click "Create Task"
3. Enter task details:
   - Title: "Design homepage mockup"
   - Description: "Create wireframes and mockups"
   - Project: Select your project
   - Assigned Member: Select Bob (you'll see "Bob - Designer (0/4)")
   - Priority: High
   - Status: Pending
4. Click "Create"

Repeat to create more tasks:
- "Implement header component" → Assign to Alice
- "Write test cases" → Assign to Charlie
- "Fix navigation bug" → Use Auto-assign

## Step 8: Test Auto-Reassignment

1. Create several tasks and assign most of them to one person (e.g., Alice)
   - Assign 4 tasks to Alice (capacity: 3)
   - Assign 1 task to Bob (capacity: 4)
   - Assign 1 task to Charlie (capacity: 2)

2. Go to "Projects" page
3. Click "Reassign Tasks" on your project
4. Check the dashboard to see the reassignments in the activity log
5. Go to "Tasks" to see the updated assignments

## Step 9: Explore Features

### Dashboard
- View total projects and tasks
- See team member workload
- Check recent reassignments

### Filtering Tasks
- Filter by project
- Filter by member (including "Unassigned")
- Filter by status
- Combine multiple filters

### Capacity Warnings
When creating a task:
- If you assign to an overloaded member, you'll see a warning
- Choose "Assign Anyway" or "Choose Another"
- Use "Auto-assign" for optimal assignment

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Make sure MongoDB is running:
```bash
# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Windows
net start MongoDB
```

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution:** Kill the process using port 5000:
```bash
# macOS/Linux
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID [PID] /F
```

### Frontend Cannot Connect to Backend
**Solution:**
1. Make sure backend is running on port 5000
2. Check `.env.local` in frontend folder has:
   ```
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

## Default Test Credentials

Create your own account - there are no default credentials. Registration is quick and easy!

## Next Steps

1. Explore all features:
   - Create multiple teams
   - Create multiple projects
   - Experiment with different task priorities
   - Test the auto-reassignment algorithm

2. Try the workflow:
   - Create a team with varied capacities
   - Assign tasks unevenly
   - Use "Reassign Tasks" to balance workload
   - Check the Activity Log

3. Test edge cases:
   - Assign all high-priority tasks to one person
   - See that they don't get reassigned
   - Only low and medium priority tasks are moved

Enjoy using Smart Task Manager!

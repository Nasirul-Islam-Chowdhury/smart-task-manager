# Deployment Guide - Vercel Free Tier

This guide will help you deploy both the frontend and backend to Vercel's free tier.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. A MongoDB Atlas account (sign up at https://mongodb.com/cloud/atlas)
3. Git installed on your machine
4. GitHub account

## Part 1: Set up MongoDB Atlas (Free Tier)

### 1.1 Create MongoDB Atlas Cluster

1. Go to https://mongodb.com/cloud/atlas
2. Sign up or log in
3. Click "Build a Database"
4. Select **"M0 FREE"** tier
5. Choose a cloud provider (AWS recommended) and region closest to you
6. Click "Create Cluster"

### 1.2 Configure Database Access

1. In Atlas dashboard, click **"Database Access"** in left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Username: `admin` (or your choice)
5. Password: Generate a secure password (SAVE THIS!)
6. Database User Privileges: **"Atlas admin"**
7. Click **"Add User"**

### 1.3 Configure Network Access

1. Click **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for Vercel)
4. This adds `0.0.0.0/0` to allowed IPs
5. Click **"Confirm"**

### 1.4 Get Connection String

1. Click **"Database"** in left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. Add database name before the `?`:
   ```
   mongodb+srv://admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/smart-task-manager?retryWrites=true&w=majority
   ```

## Part 2: Prepare Git Repository

### 2.1 Initialize Git (if not already done)

```bash
cd /Users/mdnasirulislamchowdhury/Code/PH/smart-task-manager
git init
```

### 2.2 Create .gitignore files (already created)

Backend `.gitignore`:
```
node_modules/
dist/
.env
logs
*.log
.DS_Store
```

Frontend `.gitignore`:
```
node_modules/
.next/
out/
.env.local
.env.development.local
.env.test.local
.env.production.local
*.log
.DS_Store
.vercel
```

### 2.3 Commit and Push to GitHub

```bash
# Add all files
git add .

# Commit
git commit -m "Initial commit: Smart Task Manager"

# Create a new repository on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/smart-task-manager.git
git branch -M main
git push -u origin main
```

## Part 3: Deploy Backend to Vercel

### 3.1 Install Vercel CLI (Optional but recommended)

```bash
npm install -g vercel
```

### 3.2 Deploy Backend

**Option A: Using Vercel CLI**

```bash
cd backend
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- Project name? **smart-task-manager-backend**
- In which directory is your code? **./  **
- Override settings? **N**

**Option B: Using Vercel Dashboard**

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure project:
   - **Root Directory**: `backend`
   - **Framework Preset**: Other
   - Click **"Environment Variables"**

### 3.3 Configure Backend Environment Variables in Vercel

Add these environment variables:

| Name | Value |
|------|-------|
| `MONGODB_URI` | `mongodb+srv://admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/smart-task-manager?retryWrites=true&w=majority` |
| `JWT_SECRET` | `your_super_secure_jwt_secret_key_change_in_production` |
| `NODE_ENV` | `production` |

4. Click **"Deploy"**

### 3.4 Get Backend URL

After deployment completes:
- Your backend URL will be something like: `https://smart-task-manager-backend.vercel.app`
- **SAVE THIS URL** - you'll need it for the frontend

Test it: `https://your-backend-url.vercel.app/api/health`

## Part 4: Deploy Frontend to Vercel

### 4.1 Update Frontend Environment Variable

Before deploying, update `.env.production`:

```bash
cd /Users/mdnasirulislamchowdhury/Code/PH/smart-task-manager/frontend
```

Create `.env.production`:
```
NEXT_PUBLIC_API_URL=https://your-backend-url.vercel.app/api
```

Commit this change:
```bash
git add .env.production
git commit -m "Add production environment variable"
git push
```

### 4.2 Deploy Frontend

**Option A: Using Vercel CLI**

```bash
cd frontend
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- Project name? **smart-task-manager-frontend**
- In which directory is your code? **./**
- Override settings? **N**

**Option B: Using Vercel Dashboard**

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository (same repo)
4. Configure project:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js
   - Click **"Environment Variables"**

### 4.3 Configure Frontend Environment Variables in Vercel

Add this environment variable:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend-url.vercel.app/api` |

5. Click **"Deploy"**

### 4.4 Get Frontend URL

After deployment completes:
- Your frontend URL will be something like: `https://smart-task-manager-frontend.vercel.app`
- Open this URL in your browser!

## Part 5: Alternative - Deploy as Monorepo

If you want to deploy both from a single repository:

### 5.1 Create `vercel.json` in root

```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/src/server.ts",
      "use": "@vercel/node"
    },
    {
      "src": "frontend/package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/src/server.ts"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/$1"
    }
  ]
}
```

Then deploy the entire repository as one project. The backend will be at `/api/*` and frontend at `/`.

## Part 6: Post-Deployment

### 6.1 Update CORS in Backend

After frontend deployment, update backend CORS to allow your frontend domain:

In `backend/src/server.ts`, update CORS:
```typescript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-frontend-url.vercel.app'
  ],
  credentials: true
}));
```

Then redeploy backend:
```bash
cd backend
git add .
git commit -m "Update CORS for production"
git push
```

Vercel will auto-deploy on push.

### 6.2 Test the Application

1. Open your frontend URL
2. Register a new account
3. Create teams, projects, and tasks
4. Test all features

## Troubleshooting

### Issue: 500 Error on API calls

**Solution**: Check environment variables in Vercel dashboard
- Go to Project → Settings → Environment Variables
- Ensure `MONGODB_URI` is correct
- Redeploy after changing variables

### Issue: Cannot connect to MongoDB

**Solution**:
- Verify Network Access in MongoDB Atlas allows `0.0.0.0/0`
- Check connection string has correct password
- Ensure database name is included in connection string

### Issue: CORS errors

**Solution**:
- Update backend CORS to include your frontend domain
- Redeploy backend

### Issue: Frontend can't reach backend

**Solution**:
- Verify `NEXT_PUBLIC_API_URL` in frontend environment variables
- Must include `https://` protocol
- Must include `/api` at the end

## Vercel Free Tier Limits

- **Bandwidth**: 100GB/month
- **Serverless Function Execution**: 100GB-hours
- **Serverless Function Duration**: 10 seconds max
- **Build Time**: 6000 minutes/month
- **Deployments**: Unlimited

This is more than enough for a portfolio project!

## Custom Domain (Optional)

### To add a custom domain:

1. Go to Project → Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. Vercel automatically provisions SSL certificate

## Monitoring

- View logs: Project → Deployments → Click deployment → Function Logs
- View analytics: Project → Analytics
- Real-time errors: Project → Overview

## Quick Commands

```bash
# Deploy backend
cd backend && vercel --prod

# Deploy frontend
cd frontend && vercel --prod

# View logs
vercel logs

# List deployments
vercel ls
```

---

**Congratulations!** Your Smart Task Manager is now live on Vercel! 🎉

Frontend: `https://your-frontend-url.vercel.app`
Backend: `https://your-backend-url.vercel.app`

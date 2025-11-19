# Quick Deployment to Vercel - Step by Step

Follow these steps to deploy your Smart Task Manager to Vercel for free.

## Step 1: Set up MongoDB Atlas (5 minutes)

1. Go to https://mongodb.com/cloud/atlas
2. Sign up/Login → Create **M0 FREE** cluster
3. **Database Access**: Add user `admin` with a strong password
4. **Network Access**: Add IP `0.0.0.0/0` (Allow from anywhere)
5. **Connect**: Get connection string:
   ```
   mongodb+srv://admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/smart-task-manager?retryWrites=true&w=majority
   ```
   ⚠️ **SAVE THIS - You'll need it for Vercel!**

## Step 2: Install Vercel CLI

```bash
npm install -g vercel
```

## Step 3: Deploy Backend

```bash
# Navigate to backend
cd /Users/mdnasirulislamchowdhury/Code/PH/smart-task-manager/backend

# Login to Vercel (browser will open)
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - Project name? smart-task-manager-backend
# - In which directory? ./
# - Override settings? N
```

### Add Environment Variables

After deployment, add environment variables:

```bash
# Add MongoDB URI
vercel env add MONGODB_URI
# Paste your MongoDB connection string when prompted
# Select: Production, Preview, Development

# Add JWT Secret
vercel env add JWT_SECRET
# Enter a secure random string (e.g., generated password)
# Select: Production, Preview, Development

# Add NODE_ENV
vercel env add NODE_ENV
# Enter: production
# Select: Production only
```

### Redeploy with environment variables

```bash
vercel --prod
```

### Save Backend URL

After deployment, you'll see:
```
✅  Production: https://smart-task-manager-backend-xxxxx.vercel.app
```

**COPY THIS URL!** You'll need it for the frontend.

## Step 4: Update Frontend Config

```bash
cd /Users/mdnasirulislamchowdhury/Code/PH/smart-task-manager/frontend
```

Edit `.env.production`:
```bash
NEXT_PUBLIC_API_URL=https://YOUR-BACKEND-URL.vercel.app/api
```

Replace `YOUR-BACKEND-URL` with the URL from Step 3.

## Step 5: Deploy Frontend

```bash
# Still in frontend directory
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - Project name? smart-task-manager-frontend
# - In which directory? ./
# - Override settings? N
```

### Add Environment Variable

```bash
vercel env add NEXT_PUBLIC_API_URL
# Enter your backend URL: https://YOUR-BACKEND-URL.vercel.app/api
# Select: Production, Preview, Development
```

### Deploy to Production

```bash
vercel --prod
```

### Your Frontend URL

After deployment:
```
✅  Production: https://smart-task-manager-frontend-xxxxx.vercel.app
```

## Step 6: Test Your App

1. Open your frontend URL in browser
2. Register a new account
3. Create teams, projects, and tasks
4. Test all features!

## 🎉 Done!

Your app is now live at:
- **Frontend**: https://your-frontend-url.vercel.app
- **Backend API**: https://your-backend-url.vercel.app/api

---

## Alternative: Deploy via Vercel Dashboard (No CLI)

### Backend:

1. Go to https://vercel.com/new
2. Import Git Repository → Connect GitHub
3. **Root Directory**: `backend`
4. **Framework**: Other
5. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string
   - `NODE_ENV`: production
6. Click **Deploy**

### Frontend:

1. Go to https://vercel.com/new
2. Import same Git Repository
3. **Root Directory**: `frontend`
4. **Framework**: Next.js
5. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL`: https://your-backend-url.vercel.app/api
6. Click **Deploy**

---

## Troubleshooting

### MongoDB Connection Failed
- Check your MongoDB Atlas Network Access allows `0.0.0.0/0`
- Verify connection string includes password and database name

### CORS Errors
- Ensure backend is deployed and URL is correct
- Check `NEXT_PUBLIC_API_URL` in frontend environment variables

### 500 Errors
- Check Vercel Function Logs in dashboard
- Verify all environment variables are set correctly

---

## Useful Commands

```bash
# View logs
vercel logs

# List deployments
vercel ls

# Promote deployment to production
vercel --prod

# Remove deployment
vercel rm [deployment-url]
```

## Free Tier Limits

✅ 100GB bandwidth/month
✅ Unlimited deployments
✅ Automatic HTTPS
✅ Global CDN
✅ Serverless functions

Perfect for a portfolio project!

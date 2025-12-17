# HRMS Automation - Deployment Guide

This guide will help you deploy both the frontend and backend to free hosting platforms.

## 🚀 Deployment Overview

- **Frontend**: Deploy to Vercel (free tier)
- **Backend**: Deploy to Render.com (free tier)

---

## 📦 Prerequisites

1. GitHub account
2. Vercel account (sign up at https://vercel.com)
3. Render.com account (sign up at https://render.com)
4. Your code pushed to a GitHub repository

---

## 🎨 Frontend Deployment (Vercel)

### Step 1: Push Code to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### Step 2: Deploy to Vercel

1. Go to https://vercel.com and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `hrms-automation-fe`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Add Environment Variables:
   - `VITE_API_BASE_URL`: Your backend URL (e.g., `https://hrms-be.onrender.com/api`)

6. Click "Deploy"

### Step 3: Get Frontend URL

After deployment, Vercel will provide you with a URL like:

- `https://your-project.vercel.app`

---

## ⚙️ Backend Deployment (Render.com)

### Step 1: Prepare Backend

1. Ensure your `render.yaml` file is in the `hrms-automation-be` directory
2. Make sure your database is accessible from Render

### Step 2: Deploy to Render

1. Go to https://render.com and sign in
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `hrms-automation-be`
   - **Environment**: Node
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `hrms-automation-be`
   - **Build Command**: `npm install && npm run build && npm run prisma:generate`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `4001` (or leave empty, Render will assign)
   - `DATABASE_URL`: Your SQL Server connection string
   - `JWT_SECRET`: A secure random string
   - `JWT_EXPIRES_IN`: `7d`
   - Add any other required environment variables

6. Click "Create Web Service"

### Step 3: Get Backend URL

After deployment, Render will provide you with a URL like:

- `https://hrms-automation-be.onrender.com`

### Step 4: Update Frontend Environment Variable

1. Go back to Vercel
2. Update the `VITE_API_BASE_URL` environment variable to:
   - `https://hrms-automation-be.onrender.com/api`
3. Redeploy the frontend

---

## 🔧 Alternative: Railway.app (Backend)

If Render.com doesn't work, you can use Railway:

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Add a new service → Select `hrms-automation-be` directory
5. Set environment variables
6. Railway will auto-detect Node.js and deploy

---

## 🔧 Alternative: Netlify (Frontend)

If Vercel doesn't work, you can use Netlify:

1. Go to https://netlify.com
2. Click "Add new site" → "Import an existing project"
3. Connect GitHub repository
4. Configure:
   - **Base directory**: `hrms-automation-fe`
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
5. Add environment variable `VITE_API_BASE_URL`
6. Deploy

---

## 📝 Environment Variables Checklist

### Frontend (Vercel/Netlify)

- `VITE_API_BASE_URL` - Backend API URL

### Backend (Render/Railway)

- `NODE_ENV` - `production`
- `PORT` - Port number (auto-assigned on Render)
- `DATABASE_URL` - SQL Server connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `JWT_EXPIRES_IN` - Token expiration (e.g., `7d`)
- `EMAIL_HOST` - SMTP host (optional)
- `EMAIL_PORT` - SMTP port (optional)
- `EMAIL_USER` - Email username (optional)
- `EMAIL_PASS` - Email password (optional)

---

## 🔄 Updating Deployments

### Frontend

- Push changes to GitHub
- Vercel will automatically redeploy

### Backend

- Push changes to GitHub
- Render will automatically redeploy
- Or manually trigger redeploy from Render dashboard

---

## 🐛 Troubleshooting

### Backend Issues

1. **Build fails**: Check build logs in Render dashboard
2. **Database connection fails**: Verify `DATABASE_URL` is correct
3. **Port issues**: Render assigns port via `PORT` env var, ensure your code uses `process.env.PORT`

### Frontend Issues

1. **API calls fail**: Verify `VITE_API_BASE_URL` points to correct backend URL
2. **CORS errors**: Ensure backend CORS allows your frontend domain
3. **Build fails**: Check Vercel build logs

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Render Documentation](https://render.com/docs)
- [Railway Documentation](https://docs.railway.app)
- [Netlify Documentation](https://docs.netlify.com)

---

## ✅ Post-Deployment Checklist

- [ ] Backend is accessible at provided URL
- [ ] Frontend is accessible at provided URL
- [ ] Frontend can connect to backend API
- [ ] Database connection is working
- [ ] Authentication is working
- [ ] All environment variables are set
- [ ] Custom domain configured (optional)

---

## 🌐 Custom Domain (Optional)

### Vercel Custom Domain

1. Go to Project Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### Render Custom Domain

1. Go to Service Settings → Custom Domains
2. Add your custom domain
3. Configure DNS records as instructed

---

Good luck with your deployment! 🚀

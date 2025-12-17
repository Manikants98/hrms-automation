# 🚀 Step-by-Step Deployment Guide

## Prerequisites

- GitHub account
- Vercel account (free): https://vercel.com/signup
- Render account (free): https://dashboard.render.com/register

---

## Step 1: Push Code to GitHub

```bash
cd /Users/mkx/Desktop/HRMS
git init
git add .
git commit -m "Initial commit - Ready for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/hrms-automation.git
git push -u origin main
```

---

## Step 2: Deploy Backend to Render.com

### 2.1 Create Web Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Click **"Connect GitHub"** and authorize Render
4. Select your repository: `hrms-automation`
5. Click **"Connect"**

### 2.2 Configure Service

- **Name**: `hrms-automation-be`
- **Region**: Choose closest to you
- **Branch**: `main`
- **Root Directory**: `hrms-automation-be`
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build && npm run prisma:generate`
- **Start Command**: `npm start`
- **Plan**: **Free**

### 2.3 Set Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**:

| Key              | Value                                    | Notes                             |
| ---------------- | ---------------------------------------- | --------------------------------- |
| `NODE_ENV`       | `production`                             | Required                          |
| `PORT`           | (leave empty)                            | Auto-assigned by Render           |
| `DATABASE_URL`   | `your_sql_server_connection_string`      | Your SQL Server connection string |
| `JWT_SECRET`     | Generate with: `openssl rand -base64 32` | Required for authentication       |
| `JWT_EXPIRES_IN` | `7d`                                     | Token expiration                  |

**Generate JWT Secret:**

```bash
openssl rand -base64 32
```

### 2.4 Deploy

1. Click **"Create Web Service"**
2. Wait 5-10 minutes for first deployment
3. Copy your backend URL (e.g., `https://hrms-automation-be.onrender.com`)

### 2.5 Test Backend

Visit: `https://your-backend-url.onrender.com/api/v1/health`
Should return: `{ status: "OK", ... }`

---

## Step 3: Deploy Frontend to Vercel

### 3.1 Import Project

1. Go to https://vercel.com
2. Click **"Add New Project"**
3. Click **"Import Git Repository"**
4. Select your repository: `hrms-automation`
5. Click **"Import"**

### 3.2 Configure Project

- **Framework Preset**: `Vite` (auto-detected)
- **Root Directory**: Click **"Edit"** → Set to `hrms-automation-fe`
- **Build Command**: `npm run build` (auto-filled)
- **Output Directory**: `dist` (auto-filled)
- **Install Command**: `npm install` (auto-filled)

### 3.3 Set Environment Variables

Click **"Environment Variables"** → Add:

| Key                 | Value                                       |
| ------------------- | ------------------------------------------- |
| `VITE_API_BASE_URL` | `https://your-backend-url.onrender.com/api` |

**Important**: Replace `your-backend-url` with your actual Render backend URL

### 3.4 Deploy

1. Click **"Deploy"**
2. Wait 2-3 minutes
3. Copy your frontend URL (e.g., `https://hrms-automation.vercel.app`)

---

## Step 4: Update Frontend with Backend URL

After backend is deployed:

1. Go to Vercel Dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Update `VITE_API_BASE_URL` to: `https://your-backend-url.onrender.com/api`
5. Go to **Deployments** tab
6. Click **"Redeploy"** on latest deployment

---

## Step 5: Test Deployment

1. **Frontend**: Visit your Vercel URL
2. **Backend Health**: Visit `https://your-backend-url.onrender.com/api/v1/health`
3. **Login**: Try logging in through the frontend
4. **API Calls**: Check browser console for any API errors

---

## 🔧 Troubleshooting

### Backend Issues

**Problem**: Build fails

- **Solution**: Check Render logs → "Logs" tab
- Common issues:
  - Missing environment variables
  - Database connection string incorrect
  - Prisma generation fails

**Problem**: Service won't start

- **Solution**:
  - Check `PORT` env var (should be empty or auto-assigned)
  - Verify `DATABASE_URL` is correct
  - Check Render logs for errors

**Problem**: Database connection fails

- **Solution**:
  - Verify SQL Server allows external connections
  - Check firewall rules
  - Verify connection string format

### Frontend Issues

**Problem**: Can't connect to backend

- **Solution**:
  - Verify `VITE_API_BASE_URL` includes `/api` at the end
  - Check backend is running (visit health endpoint)
  - Check browser console for CORS errors

**Problem**: Build fails

- **Solution**:
  - Check Vercel build logs
  - Verify all dependencies are in package.json
  - Check for TypeScript errors

---

## 📝 Environment Variables Reference

### Backend (Render)

```
NODE_ENV=production
PORT= (auto-assigned)
DATABASE_URL=Server=your-server;Database=your-db;User Id=your-user;Password=your-password;Encrypt=true;TrustServerCertificate=true;
JWT_SECRET=your-generated-secret-key
JWT_EXPIRES_IN=7d
```

### Frontend (Vercel)

```
VITE_API_BASE_URL=https://your-backend.onrender.com/api
```

---

## 🎯 Quick Commands

### Generate JWT Secret

```bash
openssl rand -base64 32
```

### Test Backend Locally

```bash
cd hrms-automation-be
npm install
npm run build
npm run prisma:generate
npm start
```

### Test Frontend Locally

```bash
cd hrms-automation-fe
npm install
VITE_API_BASE_URL=http://localhost:4001/api npm run dev
```

---

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Backend deployed on Render
- [ ] Backend health check works
- [ ] Frontend deployed on Vercel
- [ ] Environment variables set correctly
- [ ] Frontend can connect to backend
- [ ] Login functionality works
- [ ] Database connection working

---

## 🌐 Custom Domain (Optional)

### Vercel Custom Domain

1. Go to Project Settings → Domains
2. Add your domain
3. Follow DNS setup instructions

### Render Custom Domain

1. Go to Service Settings → Custom Domains
2. Add your domain
3. Configure DNS as instructed

---

**Need help?** Check the full `DEPLOYMENT.md` guide for more details.

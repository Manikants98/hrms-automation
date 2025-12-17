# 🚀 Quick Deployment Guide

## Option 1: Vercel (Frontend) + Render (Backend) - RECOMMENDED

### Frontend on Vercel (5 minutes)

1. **Push to GitHub**:

   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy to Vercel**:
   - Go to https://vercel.com
   - Click "Add New Project"
   - Import your GitHub repo
   - **Root Directory**: Select `hrms-automation-fe`
   - **Framework**: Vite (auto-detected)
   - **Environment Variable**:
     - Key: `VITE_API_BASE_URL`
     - Value: `https://your-backend.onrender.com/api` (you'll update this after backend deploys)
   - Click "Deploy"
   - Copy your frontend URL (e.g., `https://hrms-fe.vercel.app`)

### Backend on Render (10 minutes)

1. **Deploy to Render**:
   - Go to https://render.com
   - Click "New +" → "Web Service"
   - Connect your GitHub repo
   - **Name**: `hrms-automation-be`
   - **Root Directory**: `hrms-automation-be`
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build && npm run prisma:generate`
   - **Start Command**: `npm start`
   - **Plan**: Free

2. **Set Environment Variables**:
   - `NODE_ENV` = `production`
   - `PORT` = (leave empty, auto-assigned)
   - `DATABASE_URL` = Your SQL Server connection string
   - `JWT_SECRET` = Generate a random string (use: `openssl rand -base64 32`)
   - `JWT_EXPIRES_IN` = `7d`
   - Add any other env vars you need

3. **Click "Create Web Service"**
   - Wait for deployment (5-10 minutes)
   - Copy your backend URL (e.g., `https://hrms-automation-be.onrender.com`)

4. **Update Frontend**:
   - Go back to Vercel
   - Settings → Environment Variables
   - Update `VITE_API_BASE_URL` to: `https://your-backend.onrender.com/api`
   - Redeploy

---

## Option 2: Netlify (Frontend) + Railway (Backend)

### Frontend on Netlify

1. Go to https://netlify.com
2. "Add new site" → "Import an existing project"
3. Connect GitHub
4. **Base directory**: `hrms-automation-fe`
5. **Build command**: `npm run build`
6. **Publish directory**: `dist`
7. **Environment variable**: `VITE_API_BASE_URL` = your backend URL
8. Deploy

### Backend on Railway

1. Go to https://railway.app
2. "New Project" → "Deploy from GitHub repo"
3. Select your repo
4. Add new service → Select `hrms-automation-be` folder
5. Set environment variables
6. Deploy

---

## 🔑 Generate JWT Secret

Run this command to generate a secure JWT secret:

```bash
openssl rand -base64 32
```

---

## ✅ After Deployment

1. ✅ Backend URL: `https://your-backend.onrender.com`
2. ✅ Frontend URL: `https://your-frontend.vercel.app`
3. ✅ Frontend can call backend API
4. ✅ Test login functionality
5. ✅ Check database connection

---

## 🆓 Free Tier Limits

### Vercel

- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Custom domains
- ✅ SSL certificates

### Render

- ✅ 750 hours/month free
- ✅ Auto-sleeps after 15 min inactivity (wakes on request)
- ✅ Custom domains
- ✅ SSL certificates

### Railway

- ✅ $5 free credit/month
- ✅ No auto-sleep
- ✅ Custom domains

---

## 📝 Important Notes

1. **Render Free Tier**: Services sleep after 15 minutes of inactivity. First request after sleep takes ~30 seconds to wake up.

2. **Database**: Ensure your SQL Server database is accessible from Render/Railway IPs. You may need to whitelist their IPs.

3. **CORS**: Backend already allows all origins (`origin: '*'`), so it should work with any frontend URL.

4. **Environment Variables**: Never commit `.env` files. Use platform environment variable settings.

---

## 🐛 Troubleshooting

**Backend won't start:**

- Check Render logs
- Verify DATABASE_URL is correct
- Ensure PORT env var is set (or use default)

**Frontend can't connect to backend:**

- Verify VITE_API_BASE_URL includes `/api` at the end
- Check CORS settings
- Verify backend is running (check Render dashboard)

**Database connection fails:**

- Verify DATABASE_URL format
- Check if database allows external connections
- Verify firewall rules

---

Need help? Check the full DEPLOYMENT.md guide for detailed instructions.

# 🚀 HRMS Automation - Deployment Guide

## Quick Start

### Option 1: Vercel + Render (Recommended)

**Frontend**: Deploy to Vercel (free, fast, auto-deploys)  
**Backend**: Deploy to Render.com (free tier available)

See `DEPLOY_STEPS.md` for detailed step-by-step instructions.

### Option 2: Netlify + Railway

**Frontend**: Deploy to Netlify  
**Backend**: Deploy to Railway.app

---

## 📋 Pre-Deployment Checklist

- [ ] Code is pushed to GitHub
- [ ] Database is accessible from external IPs
- [ ] Environment variables are ready
- [ ] Build passes locally (`npm run build`)

---

## 🔑 Required Environment Variables

### Backend

- `DATABASE_URL` - SQL Server connection string
- `JWT_SECRET` - Generate with: `openssl rand -base64 32`
- `JWT_EXPIRES_IN` - Token expiration (default: `7d`)
- `NODE_ENV` - Set to `production`

### Frontend

- `VITE_API_BASE_URL` - Backend API URL (e.g., `https://your-backend.onrender.com/api`)

---

## 📚 Documentation Files

- **`DEPLOY_STEPS.md`** - Detailed step-by-step deployment guide
- **`QUICK_DEPLOY.md`** - Quick reference guide
- **`DEPLOYMENT.md`** - Comprehensive deployment documentation

---

## 🆓 Free Tier Limits

### Vercel

- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Free SSL
- ✅ Custom domains

### Render

- ✅ 750 hours/month free
- ⚠️ Auto-sleeps after 15 min inactivity
- ✅ Free SSL
- ✅ Custom domains

---

## 🐛 Common Issues

1. **Backend sleeps on Render**: First request after sleep takes ~30 seconds
2. **CORS errors**: Backend already configured for all origins
3. **Database connection**: Ensure SQL Server allows external connections

---

## 📞 Support

For deployment issues, check:

1. Platform logs (Render/Vercel dashboards)
2. Build logs
3. Browser console (for frontend issues)
4. Network tab (for API issues)

---

**Ready to deploy?** Start with `DEPLOY_STEPS.md`!

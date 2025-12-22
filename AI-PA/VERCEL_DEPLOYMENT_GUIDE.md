# 🚀 Vercel Deployment Guide

## 📋 Overview

This guide will help you deploy your Next.js backend to Vercel so your Android APK can connect to it.

---

## 🎯 Prerequisites

- [ ] GitHub account
- [ ] Vercel account (free)
- [ ] All environment variables ready
- [ ] Code pushed to GitHub repository

---

## 📝 Step-by-Step Deployment

### **Step 1: Prepare Your Repository**

1. **Create `.gitignore` (if not exists):**
```bash
# .gitignore
node_modules/
.next/
out/
.env
.env.local
.env.production
android/
ios/
.DS_Store
```

2. **Create `vercel.json` for configuration:**
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"]
}
```

3. **Push to GitHub:**
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

---

### **Step 2: Deploy to Vercel**

#### **Option A: Deploy via Vercel Dashboard (Easiest)**

1. **Go to Vercel:**
   - Visit https://vercel.com
   - Click "Sign Up" or "Log In"
   - Choose "Continue with GitHub"

2. **Import Project:**
   - Click "Add New..." → "Project"
   - Select your GitHub repository
   - Click "Import"

3. **Configure Project:**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `AI-PA` (if your code is in a subdirectory)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install` (default)

4. **Add Environment Variables:**
   Click "Environment Variables" and add:
   
   ```
   OPENAI_API_KEY=sk-...
   SUPABASE_URL=https://...
   SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   SPOTIFY_CLIENT_ID=...
   SPOTIFY_CLIENT_SECRET=...
   FACEBOOK_APP_ID=...
   FACEBOOK_APP_SECRET=...
   EVENTBRITE_API_KEY=...
   NEXT_PUBLIC_SUPABASE_URL=https://...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   ```

5. **Deploy:**
   - Click "Deploy"
   - Wait 2-5 minutes for deployment
   - You'll get a URL like: `https://ai-pa-xxx.vercel.app`

---

#### **Option B: Deploy via Vercel CLI**

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Login:**
```bash
vercel login
```

3. **Deploy:**
```bash
cd AI-PA
vercel
```

4. **Follow prompts:**
```
? Set up and deploy "~/AI-PA"? [Y/n] y
? Which scope do you want to deploy to? Your Name
? Link to existing project? [y/N] n
? What's your project's name? ai-personal-assistant
? In which directory is your code located? ./
? Want to override the settings? [y/N] n
```

5. **Add Environment Variables:**
```bash
vercel env add OPENAI_API_KEY
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
# ... add all other env vars
```

6. **Deploy to Production:**
```bash
vercel --prod
```

---

### **Step 3: Verify Deployment**

1. **Open your Vercel URL:**
   - Example: `https://ai-pa-xxx.vercel.app`

2. **Test API endpoints:**
   ```bash
   # Test health check
   curl https://ai-pa-xxx.vercel.app/api/health
   
   # Test with actual endpoint
   curl -X POST https://ai-pa-xxx.vercel.app/api/ai/intent \
     -H "Content-Type: application/json" \
     -d '{"text": "play some music"}'
   ```

3. **Check Vercel Dashboard:**
   - Go to Vercel Dashboard → Your Project
   - Check "Deployments" tab
   - Verify deployment status is "Ready"

---

### **Step 4: Update Capacitor Config**

Now that your backend is deployed, update your Capacitor configuration:

```typescript
// AI-PA/capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aipa.app',
  appName: 'AI Personal Assistant',
  webDir: 'out',
  server: {
    url: 'https://ai-pa-xxx.vercel.app', // ← Your Vercel URL
    cleartext: true,
    androidScheme: 'https',
  },
};

export default config;
```

---

### **Step 5: Update Next.js Config**

Remove static export since we're using server-side features:

```typescript
// AI-PA/next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remove 'output: export' - we need server-side rendering
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // ... rest of config
};

export default nextConfig;
```

---

## 🔧 Environment Variables Reference

### **Required Variables:**

```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Spotify
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...

# Facebook (optional)
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...

# Eventbrite (optional)
EVENTBRITE_API_KEY=...

# Other
NODE_ENV=production
```

---

## 🔄 Continuous Deployment

Vercel automatically redeploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Vercel automatically deploys!
```

---

## 📊 Monitoring & Logs

### **View Logs:**
1. Go to Vercel Dashboard
2. Click your project
3. Click "Deployments"
4. Click on a deployment
5. Click "Functions" tab to see API logs

### **View Analytics:**
1. Go to Vercel Dashboard
2. Click your project
3. Click "Analytics" tab

---

## 🚨 Troubleshooting

### **Issue: Build Failed**

**Check:**
1. Vercel Dashboard → Deployments → Click failed deployment → View logs
2. Common issues:
   - Missing environment variables
   - TypeScript errors
   - Missing dependencies

**Solution:**
```bash
# Test build locally first
npm run build

# If it works locally, check Vercel logs
```

---

### **Issue: API Routes Return 404**

**Check:**
1. Verify routes exist in `src/app/api/`
2. Check Vercel deployment logs
3. Test endpoint directly: `https://your-app.vercel.app/api/your-route`

---

### **Issue: Environment Variables Not Working**

**Solution:**
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Make sure variables are set for "Production"
3. Redeploy: Deployments → Click "..." → Redeploy

---

## 💡 Best Practices

1. **Use Environment Variables:**
   - Never commit API keys
   - Use Vercel's environment variable system

2. **Enable CORS:**
   - Add CORS headers for mobile app requests

3. **Monitor Usage:**
   - Check Vercel analytics regularly
   - Set up alerts for errors

4. **Use Custom Domain (Optional):**
   - Go to Settings → Domains
   - Add your custom domain
   - Update Capacitor config with new domain

---

## 📱 Next Steps

After deploying to Vercel:

1. ✅ Copy your Vercel URL
2. ✅ Update `capacitor.config.ts` with the URL
3. ✅ Build Android APK (see [ANDROID_BUILD_GUIDE.md](./ANDROID_BUILD_GUIDE.md))
4. ✅ Test APK on device
5. ✅ Verify all features work

---

## 🎉 Success!

Your backend is now deployed and ready for your mobile app!

**Your Vercel URL:** `https://ai-pa-xxx.vercel.app`

**Next:** Build your Android APK → [ANDROID_BUILD_GUIDE.md](./ANDROID_BUILD_GUIDE.md)


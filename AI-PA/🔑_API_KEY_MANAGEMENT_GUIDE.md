# 🔑 API Key Management Guide

## Quick Reference

### ✅ Current Status
- No Gemini API keys exposed
- No hardcoded credentials
- Project is secure

### 📋 Environment Variables in Use
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

---

## 🔧 Adding Gemini API Key (If Needed)

### Step 1: Get API Key
1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key

### Step 2: Add to .env.local
```bash
# .env.local
GOOGLE_API_KEY=your_api_key_here
```

### Step 3: Verify .gitignore
```bash
# .gitignore should have:
.env.local
.env.*.local
```

### Step 4: Restart Server
```bash
npm run dev
```

---

## 🛡️ Security Rules

### ✅ DO
- Store keys in `.env.local` (local only)
- Use environment variables
- Use secrets manager for production
- Rotate keys regularly
- Use API key restrictions

### ❌ DON'T
- Hardcode keys in source code
- Commit `.env.local` to git
- Share keys in chat/email
- Use same key for dev and prod
- Log or print keys

---

## 🚀 Production Setup

### Option 1: Environment Variables
```bash
# In deployment platform (Vercel, Netlify, etc.)
GOOGLE_API_KEY=your_production_key
```

### Option 2: Google Cloud Secret Manager
```bash
gcloud secrets create gemini-api-key --data-file=-
```

### Option 3: Service Account
```bash
# Set environment variable
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

---

## 🔍 Checking for Exposed Keys

### Search for Keys
```bash
# Search in source code
grep -r "AIzaSy" src/

# Search in git history
git log -S "AIzaSy" --oneline

# Search in documentation
grep -r "AIzaSy" *.md
```

### If Key is Exposed
1. Revoke key immediately
2. Create new key
3. Update all environments
4. Remove from git history (if committed)

---

## 📊 API Keys in Project

| Service | Key Name | Status | Location |
|---------|----------|--------|----------|
| Supabase | NEXT_PUBLIC_SUPABASE_URL | ✅ In .env.local | Environment |
| Supabase | NEXT_PUBLIC_SUPABASE_ANON_KEY | ✅ In .env.local | Environment |
| Supabase | SUPABASE_SERVICE_ROLE_KEY | ✅ In .env.local | Environment |
| Gemini | GOOGLE_API_KEY | ⚠️ Optional | Environment |
| Spotify | SPOTIFY_CLIENT_ID | ✅ In .env.local | Environment |
| Spotify | SPOTIFY_CLIENT_SECRET | ✅ In .env.local | Environment |

---

## 🔐 .gitignore Configuration

Your `.gitignore` should include:
```
# Environment variables
.env
.env.local
.env.*.local
.env.production.local

# API Keys
*.key
*.pem
service-account.json

# Secrets
secrets/
.secrets/
```

---

## 📝 .env.local Template

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Gemini (Optional)
GOOGLE_API_KEY=your_gemini_api_key

# Spotify
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
```

---

## 🚨 Emergency: Key Compromised

### Immediate Actions
1. **Revoke Key:**
   - Go to Google Cloud Console
   - Delete the compromised key
   - Create new key

2. **Update Environments:**
   - Update `.env.local`
   - Update production secrets
   - Update CI/CD variables

3. **Check Logs:**
   - Monitor API usage
   - Check for unusual activity
   - Review access logs

4. **Notify Team:**
   - Inform team members
   - Update documentation
   - Review security practices

---

## 🔄 Key Rotation Schedule

### Recommended
- **Development:** Every 3 months
- **Production:** Every 1 month
- **After Incident:** Immediately

### Steps
1. Create new key
2. Update all environments
3. Test with new key
4. Revoke old key
5. Document rotation

---

## 📊 Monitoring

### Google Cloud Console
- Monitor API usage
- Set up billing alerts
- Review access logs
- Check for unusual activity

### Application Logs
- Monitor for API errors
- Check rate limiting
- Review error messages
- Track API calls

---

## 🎯 Best Practices

### Development
- Use `.env.local` for local keys
- Never commit `.env.local`
- Use different keys for dev/prod
- Rotate keys regularly

### Production
- Use secrets manager
- Use service accounts
- Restrict API key usage
- Monitor usage and costs
- Set up alerts

### CI/CD
- Use platform secrets
- Never log keys
- Use masked variables
- Rotate keys regularly

---

## 📞 Troubleshooting

### Key Not Working
1. Check `.env.local` exists
2. Verify key is correct
3. Check key restrictions
4. Verify API is enabled
5. Restart development server

### Key Expired
1. Go to Google Cloud Console
2. Create new key
3. Update `.env.local`
4. Restart server

### Rate Limited
1. Check API usage
2. Upgrade plan if needed
3. Implement caching
4. Add retry logic

---

## ✅ Checklist

- [ ] No hardcoded API keys in code
- [ ] `.env.local` in `.gitignore`
- [ ] All keys in environment variables
- [ ] Production uses secrets manager
- [ ] Keys rotated regularly
- [ ] Monitoring set up
- [ ] Team trained on security
- [ ] Incident response plan ready

---

**Status: ✅ SECURE**

Your project follows security best practices for API key management.

---

**Last Updated:** 2025-11-08
**Version:** 1.0


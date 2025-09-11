# Environment Variables Setup Guide

This guide explains how to properly configure environment variables for Fire Gear Tracker.

## 🔐 Security First

**Never commit actual credentials to version control!** Always use environment variables for sensitive data like API keys and database URLs.

## 📋 Required Environment Variables

### 1. Create Your Environment File

Copy the example file and fill in your actual values:

```bash
cp .env.example .env.local
```

### 2. Supabase Configuration

Get these values from your Supabase project dashboard:

```env
# Required: Your Supabase project URL
VITE_SUPABASE_URL=https://your-project-id.supabase.co

# Required: Your Supabase anonymous/public key
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**How to find these values:**
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to Settings → API
4. Copy the "Project URL" and "anon/public" key

### 3. Optional Configuration

```env
# Application settings
VITE_APP_TITLE=Fire Gear Tracker
VITE_ENVIRONMENT=development

# Feature flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_PAYMENTS=false
VITE_DEBUG_MODE=true

# Analytics (optional)
VITE_ANALYTICS_ID=your-analytics-id

# Stripe payments (optional)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your-stripe-key
```

## 🚀 Deployment Environments

### Development (.env.local)
```env
VITE_SUPABASE_URL=https://your-dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-dev-anon-key
VITE_ENVIRONMENT=development
VITE_DEBUG_MODE=true
```

### Production (.env.production)
```env
VITE_SUPABASE_URL=https://your-prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-prod-anon-key
VITE_ENVIRONMENT=production
VITE_DEBUG_MODE=false
VITE_ENABLE_ANALYTICS=true
```

## ⚠️ Security Best Practices

### 1. Never Commit Secrets
- Add `.env*` to `.gitignore` (already done)
- Use different values for development and production
- Rotate keys regularly

### 2. Use Proper Naming
- Prefix all client-side variables with `VITE_`
- Use descriptive names: `VITE_SUPABASE_URL` not `VITE_DB_URL`

### 3. Validate Configuration
The app automatically validates your environment variables on startup:

```javascript
// This will throw an error if variables are missing or invalid
import { validateConfig } from './src/lib/config.js'
validateConfig()
```

## 🔧 Troubleshooting

### Common Issues

**Error: "Missing VITE_SUPABASE_URL environment variable"**
- Make sure you have a `.env.local` file in your project root
- Check that the variable name is exactly `VITE_SUPABASE_URL`
- Restart your development server after adding variables

**Error: "Invalid VITE_SUPABASE_URL format"**
- Ensure the URL starts with `https://`
- Check for extra spaces or characters
- Make sure it's your actual Supabase project URL

**Environment variables not loading**
- Restart your development server (`npm run dev`)
- Check file is named `.env.local` (not `.env.local.txt`)
- Ensure variables start with `VITE_` prefix

### Verification Steps

1. **Check your environment file exists:**
   ```bash
   ls -la .env*
   ```

2. **Verify variables are loaded:**
   ```javascript
   console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
   ```

3. **Test database connection:**
   - Open the app in development
   - Check the browser console for connection status
   - Look for "Supabase Connected" in the UI

## 🌐 Platform-Specific Setup

### Vercel
Add environment variables in your Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add each variable with its value
3. Deploy your project

### Netlify
Add environment variables in your Netlify dashboard:
1. Go to Site Settings → Environment Variables
2. Add each variable with its value
3. Redeploy your site

### Heroku
```bash
heroku config:set VITE_SUPABASE_URL=your-url
heroku config:set VITE_SUPABASE_ANON_KEY=your-key
```

## 📚 Additional Resources

- [Vite Environment Variables Guide](https://vitejs.dev/guide/env-and-mode.html)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Environment Variables Best Practices](https://12factor.net/config)

## ✅ Quick Setup Checklist

- [ ] Copy `.env.example` to `.env.local`
- [ ] Add your Supabase URL and anon key
- [ ] Restart your development server
- [ ] Verify "Supabase Connected" appears in the app
- [ ] Test creating a station or equipment item
- [ ] Add production environment variables to your hosting platform

**🔒 Remember: Keep your environment variables secure and never share them publicly!**
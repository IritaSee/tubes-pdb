# Vercel Deployment Checklist

This checklist ensures your biomedical analyst roleplay platform is properly configured for Vercel deployment.

---

## ✅ Pre-Deployment Checklist

### 1. Project Structure
- [ ] `api/index.py` exists (Flask app entry point)
- [ ] `backend/` directory with all Flask code
- [ ] `frontend/` directory with React + Vite app
- [ ] `requirements.txt` in root directory
- [ ] `vercel.json` in root directory
- [ ] `.env.example` in root directory (DO NOT commit `.env`)

### 2. Backend Configuration
- [ ] Flask app properly exports `app` variable in `api/index.py`
- [ ] All routes use `/api` prefix
- [ ] CORS configured to allow frontend domain
- [ ] Environment variables loaded via `os.getenv()`
- [ ] Supabase client initialized correctly
- [ ] Gemini API client configured

### 3. Frontend Configuration
- [ ] `package.json` has `vercel-build` script
- [ ] `vite.config.js` configured with proxy for local dev
- [ ] API calls use relative paths (`/api/...`) not absolute URLs
- [ ] Build output directory is `dist`
- [ ] All dependencies in `package.json`

### 4. Environment Variables
- [ ] Supabase URL
- [ ] Supabase API Key
- [ ] Supabase Service Key
- [ ] Gemini API Key
- [ ] JWT Secret (generate with `openssl rand -hex 32`)
- [ ] Frontend URL (will be Vercel domain in production)

### 5. Database Setup
- [ ] Supabase project created
- [ ] All tables created (users, students, datasets, assignments, chat_messages, submissions, grades)
- [ ] Foreign key relationships configured
- [ ] Indexes created for performance
- [ ] Row Level Security policies configured (optional for MVP)

---

## 🚀 Deployment Steps

### Option A: Deploy via Vercel Dashboard (Easiest)

1. **Push code to Git repository** (GitHub, GitLab, or Bitbucket)
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

2. **Import project in Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your Git repository
   - Vercel auto-detects configuration from `vercel.json`

3. **Add environment variables**:
   - In Vercel dashboard: Settings → Environment Variables
   - Add all variables from `.env.example`
   - Select all environments (Production, Preview, Development)

4. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete
   - Visit your deployed app!

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```
   - Follow prompts to configure project
   - Add environment variables when prompted
   - Vercel will build and deploy

4. **Deploy to production**:
   ```bash
   vercel --prod
   ```

---

## 🧪 Post-Deployment Verification

### 1. Backend Health Check
```bash
curl https://your-app.vercel.app/api/health
```
Expected response: `{"status": "ok"}`

### 2. Test Student Login
```bash
curl -X POST https://your-app.vercel.app/api/auth/student/login \
  -H "Content-Type: application/json" \
  -d '{"nim": "test-nim"}'
```

### 3. Test Frontend
- Visit `https://your-app.vercel.app`
- Should see login page
- No console errors

### 4. Test API Integration
- Login as student
- Check if scenario is generated
- Send a chat message
- Submit a link

---

## 🐛 Common Issues & Solutions

### Issue: "Module not found" error
**Solution**: Ensure all imports use absolute paths from project root
```python
# ❌ Wrong
from models.student import Student

# ✅ Correct
from backend.models.student import Student
```

### Issue: "CORS error" in frontend
**Solution**: Update Flask CORS configuration
```python
from flask_cors import CORS

CORS(app, origins=[
    "http://localhost:5173",  # Local dev
    "https://your-app.vercel.app"  # Production
])
```

### Issue: Environment variables not loading
**Solution**: 
1. Check Vercel dashboard → Settings → Environment Variables
2. Ensure variables are set for correct environment (Production/Preview/Development)
3. Redeploy after adding variables

### Issue: "Function execution timeout"
**Solution**: 
- Vercel Hobby plan: 10 second limit
- Optimize LLM API calls
- Use streaming responses for long operations
- Upgrade to Pro plan for 60 second limit

### Issue: Frontend routes return 404
**Solution**: Ensure `vercel.json` routes are in correct order:
```json
{
  "routes": [
    { "src": "/api/(.*)", "dest": "api/index.py" },
    { "src": "/(.*)", "dest": "frontend/$1" }
  ]
}
```

### Issue: Database connection fails
**Solution**:
- Verify Supabase credentials in environment variables
- Check Supabase project is active
- Test connection locally first

---

## 📊 Monitoring & Logs

### View Deployment Logs
1. Vercel Dashboard → Your Project → Deployments
2. Click on specific deployment
3. View build logs and runtime logs

### View Function Logs
1. Vercel Dashboard → Your Project → Logs
2. Filter by function name
3. Real-time log streaming available

### Monitor Performance
1. Vercel Dashboard → Your Project → Analytics
2. Check function execution time
3. Monitor error rates

---

## 🔄 Continuous Deployment

Once connected to Git:
- Every push to `main` branch triggers production deployment
- Pull requests create preview deployments
- Automatic rollback available if deployment fails

---

## 🔐 Security Checklist

- [ ] `.env` file in `.gitignore`
- [ ] Environment variables set in Vercel (not in code)
- [ ] JWT secret is random and secure
- [ ] Supabase service key kept secret
- [ ] CORS configured to allow only your frontend domain
- [ ] Input validation on all API endpoints
- [ ] SQL injection prevention (using Supabase client, not raw SQL)

---

## 📈 Performance Optimization

1. **Minimize cold starts**:
   - Keep dependencies minimal
   - Use lightweight libraries
   - Consider edge functions for critical paths

2. **Optimize frontend bundle**:
   - Code splitting with React lazy loading
   - Minimize bundle size
   - Use Vite's built-in optimizations

3. **Cache static assets**:
   - Vercel automatically caches static files
   - Use proper cache headers

4. **Database optimization**:
   - Add indexes on frequently queried columns
   - Use Supabase connection pooling
   - Limit query results with pagination

---

## 🎯 Success Criteria

Your deployment is successful when:
- ✅ Backend API responds at `/api/health`
- ✅ Frontend loads at root URL
- ✅ Student can login with NIM
- ✅ Scenario is generated on first login
- ✅ Chat interface works
- ✅ Submissions can be created
- ✅ Lecturer can login and view submissions
- ✅ No errors in Vercel function logs
- ✅ All environment variables configured
- ✅ Database tables accessible from backend

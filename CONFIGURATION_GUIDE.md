# ============================================
# Configuration & Setup Guide
# ============================================

## 🔑 API Keys Configuration

### OpenAI Setup

1. **Create Account**
   - Go to https://platform.openai.com/signup
   - Sign up or log in

2. **Create API Key**
   - Navigate to https://platform.openai.com/account/api-keys
   - Click "Create new secret key"
   - Copy the key immediately (it won't be shown again)
   - Keep it secure!

3. **Set Usage Limits (Optional)**
   - Go to https://platform.openai.com/account/billing/usage-limits
   - Set monthly usage limit
   - Set hard limit to prevent overspending

4. **Update .env**
   ```
   OPENAI_API_KEY=sk-your-actual-key-here
   ```

### Google Gemini Setup

1. **Create Google Account**
   - If you don't have one already

2. **Get API Key**
   - Go to https://aistudio.google.com/app/apikey
   - Click "Get API Key"
   - Click "Create API Key in new project"
   - Copy the key

3. **Enable API**
   - Go to Google Cloud Console
   - Enable "Generative Language API"

4. **Update .env**
   ```
   GEMINI_API_KEY=your-gemini-key-here
   ```

### Claude (Anthropic) Setup

1. **Create Account**
   - Go to https://console.anthropic.com
   - Sign up for account

2. **Generate API Key**
   - Navigate to API keys section
   - Create new API key
   - Copy the key

3. **Set Usage Tier**
   - Add payment method
   - Set rate limits if desired

4. **Update .env**
   ```
   CLAUDE_API_KEY=sk-ant-your-key-here
   ```

### MongoDB Atlas Setup

1. **Create Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Click "Sign in" or "Get started free"
   - Create account

2. **Create Organization & Project**
   - Create organization (if needed)
   - Create project named "ai-summarizer"

3. **Create Cluster**
   - Click "Build a Database"
   - Choose FREE tier (M0)
   - Select cloud provider and region
   - Click "Create"
   - Wait for cluster to deploy (5-10 minutes)

4. **Create Database User**
   - Go to "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Set username and strong password
   - Note credentials

5. **Configure Network Access**
   - Go to "Network Access"
   - Click "Add IP Address"
   - Select "Allow access from anywhere" (0.0.0.0/0)
   - For production: use specific IP only

6. **Get Connection String**
   - In Clusters, click "Connect"
   - Choose "Connect your application"
   - Select "Node.js" driver
   - Copy connection string
   - Replace `<username>`, `<password>`, `<database>`

7. **Update .env**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-summarizer?retryWrites=true&w=majority
   ```

---

## 🔐 Security Configuration

### JWT Secret

Generate a secure JWT secret:

```bash
# On Linux/Mac
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Update .env:
```
JWT_SECRET=your-generated-secure-key
```

### Environment Variables

**Development:**
```env
NODE_ENV=development
JWT_EXPIRE=7d
MAX_FILE_SIZE=10485760
RATE_LIMIT_MAX_REQUESTS=100
```

**Production:**
```env
NODE_ENV=production
JWT_EXPIRE=1d
MAX_FILE_SIZE=5242880
RATE_LIMIT_MAX_REQUESTS=50
```

---

## 🌐 CORS Configuration

### Allowed Origins

**Development:**
```javascript
origin: 'http://localhost:5173'
```

**Production:**
```javascript
origin: 'https://yourdomain.com'
```

Update in server.js CORS middleware

---

## 📧 Email Configuration (Optional)

For password reset functionality:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Gmail Setup

1. Enable 2FA on Google Account
2. Create App Password
   - Go to https://myaccount.google.com/apppasswords
   - Select Mail and Windows
   - Google will generate password
   - Use this password in SMTP_PASS

---

## 🔄 Webhook Configuration

For integrations with external services:

```env
WEBHOOK_URL=https://your-domain.com/webhooks
WEBHOOK_SECRET=your-webhook-secret
```

---

## 📊 Analytics Configuration

Set up tracking (optional):

```env
ANALYTICS_ID=your-google-analytics-id
SENTRY_DSN=your-sentry-dsn
```

---

## 🚀 Performance Optimization

### Caching

```env
REDIS_URL=redis://localhost:6379
CACHE_TTL=3600
```

### CDN

For static assets:
```javascript
// vite.config.js
cdn: 'https://cdn.example.com'
```

---

## 📝 Logging Configuration

```env
LOG_LEVEL=info
LOG_FILE=/var/log/ai-summarizer/app.log
LOG_SIZE=10m
LOG_RETENTION=7d
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] MongoDB connection successful
- [ ] All API keys are valid
- [ ] Backend starts without errors
- [ ] Frontend loads on localhost:5173
- [ ] Can register new user
- [ ] Can login successfully
- [ ] Can create summary with each AI model
- [ ] File upload works
- [ ] URL processing works
- [ ] History saves summaries
- [ ] Settings page works
- [ ] Dark/light mode toggle works

---

## 🆘 Common Setup Issues

### "Cannot find module"
```bash
npm install
```

### "MongoDB connection refused"
- Check MONGODB_URI format
- Verify MongoDB Atlas IP whitelist
- Confirm username/password

### "Invalid API Key"
- Verify key is copied correctly
- Check key is still active
- Confirm API is enabled
- Check rate limits haven't been exceeded

### "CORS Error"
- Update CLIENT_URL in .env
- Restart backend
- Clear browser cache

### "Port Already in Use"
```bash
# Find and kill process
lsof -ti:5000 | xargs kill -9
# Or use different port
PORT=5001 npm start
```

---

## 📞 Need Help?

- Check server logs: `npm run dev`
- Check browser console (F12)
- Review error messages carefully
- Check API status pages
- Ask in community forums


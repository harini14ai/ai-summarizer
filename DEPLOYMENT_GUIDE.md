# ============================================
# Deployment Guide
# ============================================

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 16+
- MongoDB Atlas account
- API keys (OpenAI, Gemini, Claude)
- Git

### Step 1: Clone and Setup Backend

```bash
# Clone or navigate to project
cd server

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
nano .env
# Add:
# - MONGODB_URI
# - JWT_SECRET
# - OPENAI_API_KEY
# - GEMINI_API_KEY
# - CLAUDE_API_KEY

# Start development server
npm run dev
# Server runs on http://localhost:5000
```

### Step 2: Setup Frontend

```bash
cd client

# Install dependencies
npm install

# Start development server
npm run dev
# Frontend runs on http://localhost:5173
```

### Step 3: Access Application
- Open http://localhost:5173 in browser
- Register new account
- Start creating summaries!

---

## 🐳 Docker Deployment (Recommended)

### Using Docker Compose

```bash
# Navigate to project root
cd ai-content-summarizer

# Create .env file with API keys
cp .env.example .env
nano .env

# Build and start all services
docker-compose up --build

# Access services:
# Frontend: http://localhost:5173
# Backend API: http://localhost:5000
# MongoDB: localhost:27017
```

### Individual Docker Containers

```bash
# Backend
cd server
docker build -t ai-summarizer-backend .
docker run -p 5000:5000 \
  -e MONGODB_URI=mongodb://... \
  -e OPENAI_API_KEY=sk-... \
  ai-summarizer-backend

# Frontend
cd client
docker build -t ai-summarizer-frontend .
docker run -p 5173:5173 ai-summarizer-frontend
```

---

## 🌐 Production Deployment

### Option 1: Vercel + Render (Recommended)

#### Frontend on Vercel

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git push -u origin main
```

2. **Deploy on Vercel**
   - Go to https://vercel.com
   - Sign in with GitHub
   - Select "ai-content-summarizer" repository
   - Set project root to "client"
   - Add environment variables:
     - VITE_API_URL = https://your-backend.onrender.com
   - Click Deploy

#### Backend on Render

1. **Push backend to GitHub**
```bash
git push origin main
```

2. **Deploy on Render**
   - Go to https://render.com
   - Create new Web Service
   - Connect GitHub repository
   - Select "server" as root directory
   - Add environment variables:
     ```
     MONGODB_URI=mongodb+srv://...
     JWT_SECRET=your-secure-key
     OPENAI_API_KEY=sk-...
     GEMINI_API_KEY=...
     CLAUDE_API_KEY=...
     PORT=10000
     CLIENT_URL=https://your-vercel-url.vercel.app
     NODE_ENV=production
     ```
   - Click Deploy

### Option 2: Railway

1. **Connect GitHub**
   - Go to https://railway.app
   - Connect your GitHub account
   - Select repository

2. **Create services**
   - MongoDB plugin
   - Backend service (node)
   - Frontend service (node)

3. **Configure environment**
   - Set all required variables
   - Deploy

### Option 3: AWS (EC2 + RDS)

```bash
# SSH into EC2 instance
ssh -i key.pem ec2-user@your-instance

# Update system
sudo yum update -y

# Install Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install nodejs -y

# Clone repository
git clone https://github.com/your-username/ai-content-summarizer.git
cd ai-content-summarizer

# Setup backend
cd server
npm install
cp .env.example .env
# Edit .env with RDS connection string

# Run with PM2
sudo npm install -g pm2
pm2 start src/server.js --name "ai-summarizer-api"
pm2 startup
pm2 save

# Setup frontend
cd ../client
npm install
npm run build

# Serve with Nginx
sudo yum install nginx -y
# Configure Nginx to serve dist folder
sudo systemctl start nginx
```

---

## 🔧 MongoDB Atlas Setup

1. **Create Account**
   - Go to https://www.mongodb.com/cloud/atlas
   - Sign up for free account

2. **Create Cluster**
   - Click "Create a Cluster"
   - Choose FREE tier
   - Select region closer to you
   - Click "Create Cluster"

3. **Create Database User**
   - Go to Database Access
   - Create username and password
   - Note these credentials

4. **Whitelist IP**
   - Go to Network Access
   - Add IP Address: 0.0.0.0/0 (for development, restrict in production)

5. **Get Connection String**
   - Click "Connect"
   - Choose "Connect your application"
   - Copy connection string
   - Replace `<username>` and `<password>` with your credentials
   - Update `.env` with this string

---

## 🔐 Production Authentication Configuration

- Frontend deployment env var:
  - `VITE_API_URL=https://your-backend.onrender.com`
  - If your backend already serves API under `/api`, `api.js` will append `/api` automatically.
- Backend deployment env vars:
  - `MONGODB_URI` (Atlas connection string)
  - `JWT_SECRET` (strong secret)
  - `OPENAI_API_KEY`
  - `GEMINI_API_KEY`
  - `CLAUDE_API_KEY`
  - `CLIENT_URL=https://your-frontend.vercel.app`
  - `FRONTEND_URL=https://your-frontend.vercel.app`
  - `NODE_ENV=production`
- In Render/Railway, make sure the backend service uses `process.env.PORT`.
- In Vercel/Netlify, rebuild the frontend after updating `VITE_API_URL`.
- MongoDB Atlas:
  - whitelist your backend host IPs or use `0.0.0.0/0` temporarily
  - ensure the cluster user has read/write access

---

```bash
docker logs ai-summarizer-backend -f
```

**Frontend (Docker):**
```bash
docker logs ai-summarizer-frontend -f
```

### Database Backup

```bash
# Backup MongoDB
mongodump --uri="mongodb+srv://user:pass@cluster.mongodb.net/ai-summarizer" \
  --out=./backup

# Restore MongoDB
mongorestore --uri="mongodb+srv://user:pass@cluster.mongodb.net" \
  ./backup
```

### Update Environment

```bash
# Update backend env
docker-compose down
# Edit .env file
docker-compose up --build
```

---

## 🔐 Production Checklist

- [ ] Set strong JWT_SECRET
- [ ] Enable CORS only for your frontend domain
- [ ] Use HTTPS everywhere
- [ ] Whitelist only necessary IP addresses
- [ ] Set up monitoring and alerts
- [ ] Configure automatic backups
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Set up CDN for static assets
- [ ] Monitor API usage and costs
- [ ] Set up error tracking (Sentry)
- [ ] Configure log aggregation
- [ ] Test backup and restore procedures
- [ ] Use strong database passwords
- [ ] Enable database encryption

---

## 🚨 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or change PORT in .env
PORT=5001
```

### MongoDB Connection Failed
- Check connection string
- Verify IP whitelist
- Confirm username/password
- Check network connectivity

### API Key Errors
- Verify all keys are valid
- Check API quotas
- Ensure keys have proper permissions
- Rotate expired keys

### Out of Memory
```bash
# Increase Node memory
NODE_OPTIONS=--max-old-space-size=2048 npm start
```

---

## 📞 Support Resources

- API Documentation: See README.md
- Postman Collection: POSTMAN_COLLECTION.json
- Issue Tracker: GitHub Issues
- Email: support@example.com


# 🚀 Quick Start Guide

## 5-Minute Setup

### Prerequisites
- Node.js 16+
- MongoDB account (free at mongodb.com)
- One AI API key (OpenAI, Gemini, or Claude)

### Step 1: Clone & Setup Backend (2 min)
```bash
cd server
npm install
cp .env.example .env

# Edit .env with your credentials
# Minimum required:
# MONGODB_URI=...
# OPENAI_API_KEY=sk-... (or GEMINI_API_KEY or CLAUDE_API_KEY)
```

### Step 2: Start Backend (30 sec)
```bash
npm run dev
# Backend running on http://localhost:5000
```

### Step 3: Setup Frontend (1 min)
```bash
cd client
npm install
npm run dev
# Frontend running on http://localhost:5173
```

### Step 4: Test Application (1.5 min)
1. Open http://localhost:5173
2. Sign up with test account
3. Create a summary with sample text
4. ✅ Done!

---

## Using Docker (Even Faster!)

```bash
# One command to start everything
docker-compose up --build

# Access:
# Frontend: http://localhost:5173
# Backend: http://localhost:5000
```

---

## Troubleshooting

**Port in use?**
```bash
lsof -ti:5000 | xargs kill -9
```

**API Key not working?**
- Verify key format
- Check API is enabled
- Confirm rate limits

**MongoDB connection failed?**
- Double-check connection string
- Add IP to whitelist in MongoDB Atlas

---

## Next Steps

1. **Configure all API keys** (see CONFIGURATION_GUIDE.md)
2. **Review API documentation** (see README.md)
3. **Deploy to production** (see DEPLOYMENT_GUIDE.md)
4. **Set up monitoring** (recommended for production)
5. **Configure backups** (important for production)

---

## Environment Variables

### Required
- `MONGODB_URI` - MongoDB connection string
- One of: `OPENAI_API_KEY`, `GEMINI_API_KEY`, or `CLAUDE_API_KEY`
- `JWT_SECRET` - Secret key for JWT tokens

### Optional
- `GEMINI_API_KEY` - For Google Gemini
- `CLAUDE_API_KEY` - For Claude
- `MAX_FILE_SIZE` - Max upload size in bytes (default: 10MB)
- `PORT` - Server port (default: 5000)

---

## Need More Details?

- **Full Documentation**: See README.md
- **Deployment**: See DEPLOYMENT_GUIDE.md
- **Configuration**: See CONFIGURATION_GUIDE.md
- **API Testing**: See POSTMAN_COLLECTION.json
- **Sample Data**: See SAMPLE_DATA.js

---

**Happy summarizing! 🎉**

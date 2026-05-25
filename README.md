# 🚀 AI-Powered Content Summarizer

A production-ready full-stack application for summarizing content using advanced AI models (OpenAI, Google Gemini, Claude) with modern architecture and premium UI/UX.

## ✨ Features

### 🔐 Authentication
- User Registration & Login
- JWT Token-based authentication
- Secure password management
- Session persistence

### 📝 Content Summarization
- **Text Summarization**: Paste text directly
- **File Upload**: Support for PDF, DOCX, TXT files
- **URL Processing**: Summarize web articles
- **Multiple Summary Types**:
  - Short summaries (2-3 sentences)
  - Detailed summaries
  - Bullet-point format
  - Key highlights extraction

### 🤖 AI Models
- **OpenAI GPT-4**: Advanced reasoning and comprehensive summaries
- **Google Gemini 2.5**: Fast and efficient processing
- **Claude 3.5**: Creative and detailed analysis
- Dynamic model switching during summarization

### 🎯 Smart Features
- Content Analysis (topics, keywords, sentiment)
- Multi-language support
- Real-time token counter
- Automatic content chunking for large documents
- Streaming AI responses
- API retry mechanism
- Rate limiting protection

### 📚 History Management
- Save all previous summaries
- Search and filter summaries
- Bookmark important summaries
- Delete summaries
- Export as PDF

### 👤 User Management
- Custom profiles
- Theme preferences (light/dark mode)
- Subscription plans (Free, Pro, Enterprise)
- API usage tracking and limits
- Admin dashboard

### 📊 Analytics & Admin
- User analytics
- API usage statistics
- Subscription management
- Token consumption tracking
- Daily usage trends

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React.js 18 with Vite
- Tailwind CSS for styling
- Framer Motion for animations
- Zustand for state management
- React Router for navigation
- Axios for API calls
- React Markdown for rendering

**Backend:**
- Node.js with Express.js
- MongoDB Atlas for database
- JWT for authentication
- Multer for file uploads
- Winston for logging
- Helmet for security

**AI Integration:**
- OpenAI SDK
- Google Generative AI
- Anthropic Claude SDK

### Folder Structure

```
ai-content-summarizer/
├── client/                          # Frontend React app
│   ├── src/
│   │   ├── components/              # Reusable React components
│   │   ├── pages/                   # Page components
│   │   ├── services/                # API service layer
│   │   ├── store/                   # Zustand state management
│   │   ├── utils/                   # Utility functions
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── App.jsx                  # Main app component
│   │   └── main.jsx                 # Entry point
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── index.html
│
├── server/                          # Backend Express app
│   ├── src/
│   │   ├── models/                  # MongoDB schemas
│   │   │   ├── User.js
│   │   │   ├── Summary.js
│   │   │   └── APIUsage.js
│   │   ├── controllers/             # Business logic
│   │   │   ├── authController.js
│   │   │   ├── summaryController.js
│   │   │   ├── fileController.js
│   │   │   └── adminController.js
│   │   ├── routes/                  # API routes
│   │   ├── services/                # External integrations
│   │   │   ├── openaiService.js
│   │   │   ├── geminiService.js
│   │   │   ├── claudeService.js
│   │   │   ├── fileParsingService.js
│   │   │   └── urlService.js
│   │   ├── middleware/              # Express middleware
│   │   │   ├── authMiddleware.js
│   │   │   ├── errorHandler.js
│   │   │   └── validateRequest.js
│   │   ├── utils/                   # Utility functions
│   │   ├── config/                  # Configuration files
│   │   │   └── database.js
│   │   └── server.js                # Main server file
│   ├── uploads/                     # File upload directory
│   ├── package.json
│   └── .env.example
│
├── render.yaml
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ installed
- MongoDB Atlas account (free tier available)
- OpenAI API key (optional)
- Google Gemini API key (optional)
- Claude API key (optional)

### Backend Setup

1. **Navigate to server directory:**
```bash
cd server
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create .env file:**
```bash
cp .env.example .env
```

4. **Configure environment variables:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ai-summarizer
JWT_SECRET=your_super_secret_key_here
OPENAI_API_KEY=sk-your-key-here
GEMINI_API_KEY=your-gemini-key
CLAUDE_API_KEY=your-claude-key
PORT=5000
CLIENT_URL=http://localhost:5173
```

5. **Start development server:**
```bash
npm run dev
```

### Frontend Setup

1. **Navigate to client directory:**
```bash
cd client
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start development server:**
```bash
npm run dev
```

4. **Access the application:**
   - Open http://localhost:5173 in your browser

## 📚 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Summaries
- `POST /api/summaries/text` - Create text summary
- `GET /api/summaries` - Get all summaries
- `GET /api/summaries/:id` - Get specific summary
- `PUT /api/summaries/:id` - Update summary
- `DELETE /api/summaries/:id` - Delete summary
- `PATCH /api/summaries/:id/bookmark` - Toggle bookmark

### Files
- `POST /api/files/upload` - Upload file
- `POST /api/files/url` - Process URL

### Admin
- `GET /api/admin/analytics/dashboard` - Dashboard analytics
- `GET /api/admin/analytics/api-usage` - API usage stats
- `GET /api/admin/users` - Get users
- `PUT /api/admin/users/:userId/subscription` - Update subscription


## 📦 Deployment

### Deploy Frontend to Vercel

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy:**
```bash
cd client
vercel
```

3. **Configure environment:**
```
VITE_API_URL=https://your-backend-url.com
```

### Deploy Backend to Render/Railway

1. **Render:**
   - Create new Web Service
   - Connect GitHub repository
   - Set environment variables
   - Deploy

2. **Railway:**
   - Create new project
   - Connect GitHub
   - Set environment variables
   - Deploy

### MongoDB Atlas Setup

1. Create cluster at mongodb.com
2. Create database user
3. Whitelist IP addresses
4. Get connection string
5. Add to `.env` file

## 🔐 Security Features

- JWT authentication
- Password hashing with bcryptjs
- CORS protection
- Helmet security headers
- Express validator
- Rate limiting
- Secure file upload validation
- Input sanitization
- Environment variable protection

## 📝 Testing API with Postman

### Import Collection
1. Open Postman
2. Create new collection "AI Summarizer"
3. Add requests:

**Signup:**
```
POST http://localhost:5000/api/auth/signup
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Login:**
```
POST http://localhost:5000/api/auth/login
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Create Summary:**
```
POST http://localhost:5000/api/summaries/text
Headers: Authorization: Bearer {token}
{
  "title": "My Article",
  "content": "Your content here...",
  "aiModel": "openai",
  "summaryTypes": ["short", "detailed"]
}
```

## 🚀 Performance Optimization

- Lazy loading of components
- Code splitting with React.lazy()
- Image optimization
- Caching strategies
- Compression middleware
- Database indexing
- API response caching

## 📊 Database Schemas

### User Schema
```javascript
{
  username: String,
  email: String,
  password: String (hashed),
  firstName: String,
  lastName: String,
  theme: String,
  preferredModel: String,
  subscriptionPlan: String,
  apiUsageCount: Number,
  apiUsageLimit: Number,
  isActive: Boolean,
  isAdmin: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Summary Schema
```javascript
{
  userId: ObjectId,
  title: String,
  originalContent: String,
  contentType: String,
  wordCount: Number,
  summaries: {
    short: String,
    detailed: String,
    bulletPoints: [String],
    keyHighlights: [String]
  },
  aiModel: String,
  tokensUsed: { input, output, total },
  analysis: {
    topics: [String],
    keywords: [String],
    sentiment: String,
    language: String
  },
  isBookmarked: Boolean,
  tags: [String],
  createdAt: Date,
  updatedAt: Date
}
```

## 🐛 Troubleshooting

### MongoDB Connection Error
- Check connection string in .env
- Verify IP whitelist in MongoDB Atlas
- Ensure database user credentials are correct

### API Key Issues
- Verify all API keys are valid
- Check API quotas and rate limits
- Ensure keys have proper permissions

### CORS Error
- Verify CLIENT_URL in backend .env
- Check frontend API URL configuration
- Ensure CORS headers are properly set

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues and questions:
- Create GitHub issues
- Check existing documentation
- Review error logs

## 🎉 Future Enhancements

- [ ] Voice input for content
- [ ] Text-to-speech output
- [ ] Real-time collaboration
- [ ] Advanced analytics dashboard
- [ ] Browser extension
- [ ] Mobile app
- [ ] API rate limiting tiers
- [ ] Custom prompt templates
- [ ] Integration with Slack/Teams
- [ ] Advanced caching strategies

---

**Built with ❤️ for content creators and researchers**

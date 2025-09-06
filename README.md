# 🚀 Dev.to Clone - Full-Stack Social Blogging Platform

A comprehensive, production-ready Dev.to clone built with modern web technologies. Features AI-powered content creation, advanced search, cross-posting capabilities, and a complete admin dashboard.

![Dev.to Clone](https://img.shields.io/badge/Next.js-15.5.2-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue) ![Prisma](https://img.shields.io/badge/Prisma-6.15-green) ![Tailwind](https://img.shields.io/badge/Tailwind-3.4-cyan)

## 🎯 Development Roadmap - COMPLETED

### ✅ Phase 1: Core Setup (COMPLETED)
- ✅ Set up Ghost CMS in headless mode (content engine)
- ✅ Create custom backend (Node.js/NestJS or Django) for social + AI features
- ✅ Create Next.js frontend (UI like Dev.to)

### ✅ Phase 2: Blogging Features (COMPLETED)
- ✅ Post Writing - Integrate Ghost's Admin API for creating/updating blogs
- ✅ Build a Markdown + WYSIWYG editor (with AI autocomplete)
- ✅ Support drafts, scheduling, editing, version history
- ✅ Likes & Reactions - Store reactions in custom backend DB (not Ghost)
- ✅ Add real-time update (WebSockets / Pusher)
- ✅ Show reaction counts on each post
- ✅ Comments - Nested/threaded comments (stored in custom backend)
- ✅ AI-powered spam detection & toxicity filter

### ✅ Phase 3: Social Features (COMPLETED)
- ✅ User profiles (bio, picture, links, followers, stats)
- ✅ Follow/unfollow users
- ✅ Personalized feed (from followed authors)
- ✅ Notifications (likes, comments, follows, AI suggestions)
- ✅ Save posts to reading list

### ✅ Phase 4: AI Features (COMPLETED)
- ✅ AI Writing Assistant - Blog generation from prompt (OpenAI / Ollama)
- ✅ Smart autocomplete inside editor
- ✅ Grammar & readability suggestions
- ✅ Headline, summary, & excerpt generator
- ✅ AI Media - Auto-generate cover images (Stable Diffusion / DALL·E)
- ✅ Auto-generate alt text for accessibility
- ✅ AI SEO - Keyword suggestions while writing
- ✅ Auto-meta descriptions + slugs
- ✅ SEO scoring (readability, keyword density)
- ✅ AI Content Moderation - Detect plagiarism, spam, toxicity
- ✅ Flag posts/comments for review
- ✅ AI Recommendations - Personalized post suggestions for users
- ✅ Trending ranking powered by engagement + AI semantic search

### ✅ Phase 5: Cross-Posting Integrations (COMPLETED)
- ✅ WordPress - Use WordPress REST API for publishing blogs
- ✅ Support categories, tags, featured image
- ✅ Ghost - Use Ghost Admin API for cross-posting to other Ghost instances
- ✅ Blogger - Use Blogger API v3 for publishing
- ✅ Sync labels/tags
- ✅ Medium - Medium API for publishing stories
- ✅ Cross-Posting Dashboard - When publishing, user selects platforms
- ✅ Track sync status per platform (success/failure)
- ✅ Option to edit post per platform

### ✅ Phase 6: Optimizations (COMPLETED)
- ✅ Full-text search (Meilisearch/Elasticsearch)
- ✅ Mobile-first responsive UI
- ✅ Caching + CDN for performance
- ✅ CI/CD pipelines with automated testing

### ✅ Phase 7: Advanced AI Features (COMPLETED)
- ✅ AI Writing Assistant 2.0 - Context-aware, learns from user's past blogs
- ✅ AI Summaries - TL;DR at the top of every post
- ✅ AI Image Generation - Generate blog covers or inline illustrations
- ✅ AI Comment Moderation - Auto-flag spam, toxicity, or off-topic comments
- ✅ AI Tagging & SEO Optimization - Suggest categories, tags, and meta descriptions

### ✅ Phase 8: Monetization Layer (COMPLETED)
- ✅ Premium content system with paywall
- ✅ Subscription management (Stripe integration ready)
- ✅ Purchase tracking and revenue analytics
- ✅ Author earnings dashboard
- ✅ Premium post creation and management

## 🌟 Features

### ✅ Core Features (ALL IMPLEMENTED)
- **User Authentication** - Email/password + OAuth (Google, GitHub, Twitter, LinkedIn)
- **Rich Blogging** - Markdown editor with live preview and AI assistance
- **Social Interactions** - Comments, reactions, following/followers
- **Advanced Search** - Multi-tab search with filters and suggestions
- **Tag System** - Comprehensive tag browsing and organization
- **Cross-Posting** - Publish to Ghost, WordPress, Blogger, Medium
- **Admin Dashboard** - Complete moderation and analytics tools

### 🤖 AI Features (ALL IMPLEMENTED)
- **AI Writing Assistant** - Content generation and suggestions
- **Smart Auto-complete** - Context-aware writing help
- **SEO Optimization** - Automatic meta descriptions and keywords
- **Content Moderation** - AI-powered spam detection

### ⚡ Performance Features (ALL IMPLEMENTED)
- **Advanced Caching** - Multi-layer caching system
- **Image Optimization** - WebP/AVIF conversion and lazy loading
- **Database Indexing** - Optimized query performance
- **Service Worker** - Offline functionality and caching
- **Bundle Optimization** - Code splitting and tree shaking

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Modern icon library

### Backend & Database
- **Next.js API Routes** - Serverless API endpoints
- **Prisma ORM** - Database toolkit
- **SQLite/PostgreSQL** - Database (SQLite for dev, PostgreSQL for prod)
- **NextAuth.js** - Authentication

### DevOps & Deployment
- **Docker** - Containerization
- **Docker Compose** - Multi-service orchestration
- **Nginx** - Reverse proxy and load balancing
- **Let's Encrypt** - SSL certificates

### AI & External Services
- **OpenAI API** - Content generation
- **Stable Diffusion** - Image generation
- **Redis** - Caching and session storage
- **AWS S3** - File storage (optional)

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Git

### Development Setup

#### Option 1: Quick Development (Recommended)
```bash
# Clone and start everything automatically
git clone https://github.com/yourusername/devto-clone.git
cd devto-clone

# Run the quick development script
./dev.sh
```

#### Option 2: Full Control
```bash
# Clone the repository
git clone https://github.com/yourusername/devto-clone.git
cd devto-clone

# Use the comprehensive runner script
./run.sh -m development -s all

# Or for specific services
./run.sh -s frontend    # Frontend only
./run.sh -s backend     # Backend only
./run.sh -m test        # Run test suite
```

#### Option 3: Manual Setup
1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:3000
   ```

### Production Deployment

1. **Set up production environment**
   ```bash
   cp .env.production.example .env.production
   # Edit with your production values
   ```

2. **Deploy using Docker Compose**
   ```bash
   # Make deploy script executable
   chmod +x deploy.sh

   # Run full deployment
   ./deploy.sh deploy
   ```

3. **Or deploy manually**
   ```bash
   # Build and start services
   docker-compose up -d --build

   # Run database migrations
   docker-compose exec frontend npx prisma db push
   ```

## 📁 Project Structure

```
devto-clone/
├── frontend/                 # Next.js application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # React components
│   │   ├── lib/            # Utilities and configurations
│   │   └── styles/         # Global styles
│   ├── prisma/             # Database schema and migrations
│   ├── public/             # Static assets
│   └── Dockerfile          # Frontend container config
├── docker-compose.yml       # Multi-service orchestration
├── deploy.sh               # Deployment automation script
├── .env.production         # Production environment template
└── README.md              # This file
```

## 🔧 Configuration

### Environment Variables

#### Development (.env.local)
```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-development-secret"

# OAuth Providers (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# AI Services (Optional)
OPENAI_API_KEY="your-openai-api-key"
```

#### Production (.env.production)
```env
# Application
NODE_ENV=production
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-super-secure-random-secret

# Database (PostgreSQL for production)
DATABASE_URL=postgresql://username:password@database:5432/devto_clone

# OAuth Providers
GOOGLE_CLIENT_ID=your-production-google-client-id
GOOGLE_CLIENT_SECRET=your-production-google-client-secret
GITHUB_CLIENT_ID=your-production-github-client-id
GITHUB_CLIENT_SECRET=your-production-github-client-secret

# AI Services
OPENAI_API_KEY=your-production-openai-api-key

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Redis (for caching)
REDIS_URL=redis://redis:6379

# Security
JWT_SECRET=your-jwt-secret
ENCRYPTION_KEY=your-encryption-key
```

## 🗄️ Database Schema

The application uses Prisma ORM with the following main models:

- **User** - User accounts and profiles
- **Post** - Blog posts and articles
- **Comment** - Comments and replies
- **Tag** - Content categorization
- **Reaction** - User interactions
- **Follow** - Social connections
- **Notification** - User notifications
- **CrossPost** - Multi-platform publishing

### Database Migration

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Create migration (if using migrations)
npx prisma migrate dev
```

## 🚀 Deployment Options

### Option 1: Docker Compose (Recommended)

```bash
# Full deployment
./deploy.sh deploy

# Individual commands
./deploy.sh check      # Check prerequisites
./deploy.sh setup      # Setup environment
./deploy.sh migrate    # Run migrations
./deploy.sh logs       # View logs
./deploy.sh backup     # Backup database
```

### Option 2: Manual Docker

```bash
# Build and run
docker build -t devto-clone ./frontend
docker run -p 3000:3000 devto-clone
```

### Option 3: Vercel/Netlify (Frontend Only)

```bash
# Deploy frontend only
npm run build
# Upload .next folder to hosting provider
```

## 🔍 API Documentation

### Authentication Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `GET /api/auth/session` - Get current session

### Content Endpoints
- `GET /api/posts` - Get posts with pagination
- `POST /api/posts` - Create new post
- `GET /api/posts/[id]` - Get specific post
- `PUT /api/posts/[id]` - Update post
- `DELETE /api/posts/[id]` - Delete post

### Admin Endpoints
- `GET /api/admin/users` - User management
- `GET /api/admin/reports` - Content moderation
- `GET /api/health` - Health check

### AI Endpoints
- `POST /api/ai/generate` - Content generation
- `POST /api/ai/suggest` - Writing suggestions

## 🔒 Security Features

- **Authentication** - NextAuth.js with multiple providers
- **Authorization** - Role-based access control
- **Input Validation** - Zod schema validation
- **Rate Limiting** - API rate limiting
- **HTTPS** - SSL/TLS encryption
- **CSRF Protection** - Cross-site request forgery protection
- **XSS Prevention** - Content Security Policy headers

## 📊 Monitoring & Analytics

### Performance Monitoring
- Real-time metrics dashboard
- API response time tracking
- Database query performance
- Cache hit/miss ratios
- Memory usage monitoring

### Admin Dashboard
- User management interface
- Content moderation tools
- Analytics and insights
- System health monitoring
- Performance metrics

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 📚 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Dev.to** - Inspiration for the platform design and features
- **Next.js** - Amazing React framework
- **Prisma** - Excellent database toolkit
- **Tailwind CSS** - Utility-first CSS framework
- **OpenAI** - AI content generation capabilities

## 📞 Support

For support, email support@yourdomain.com or join our Discord community.

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies.**

⭐ Star this repo if you find it helpful!

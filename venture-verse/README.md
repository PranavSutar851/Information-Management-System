# Venture Verse

An industrial-level SaaS platform for startup idea assessment and funding decisions. Built for Edge Company.

## 🚀 Features

### For Founders
- **Idea Submission**: Submit startup ideas with detailed information
- **AI Assessment**: Get instant AI-powered evaluation with scores and recommendations
- **Real-time Tracking**: Monitor your idea's progress through the review process
- **Detailed Feedback**: Receive comprehensive AI analysis and manager feedback

### For Managers
- **Idea Review Dashboard**: View all submitted ideas with filtering and search
- **AI-Assisted Decisions**: Leverage AI assessments for informed funding decisions
- **Decision Management**: Approve or reject ideas with detailed reasoning
- **Analytics Dashboard**: Track funding metrics and idea statistics

### AI-Powered Features
- **Multi-criteria Assessment**: Evaluates innovation, market fit, team strength, and revenue potential
- **Actionable Recommendations**: Provides specific suggestions for improvement
- **Competitive Analysis**: AI-generated insights on market positioning
- **Risk Assessment**: Identifies potential concerns and challenges

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS, shadcn/ui, Framer Motion
- **Backend**: Next.js API routes
- **Database**: Supabase (PostgreSQL) with Row Level Security (RLS)
- **Authentication**: Supabase Auth (email/password + OAuth)
- **AI**: OpenAI API (GPT-4) for idea assessment
- **Hosting**: Vercel-ready
- **Styling**: TailwindCSS with shadcn/ui components

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- OpenAI API key
- Git

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd venture-verse
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env.local
```

Update `.env.local` with your actual values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Setup

1. **Create a new Supabase project** at [supabase.com](https://supabase.com)

2. **Run the database schema** by executing the SQL script in your Supabase SQL editor:
   ```bash
   # Copy the contents of scripts/seed-database.sql
   # Paste and run in Supabase SQL Editor
   ```

3. **Enable Authentication** in your Supabase dashboard:
   - Go to Authentication > Settings
   - Enable email confirmations (optional)
   - Configure any OAuth providers (optional)

### 5. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Database Schema

### Tables

- **users**: User profiles with roles (founder/manager)
- **ideas**: Startup ideas with AI assessments
- **assessments**: Detailed AI evaluation criteria
- **manager_decisions**: Funding decisions with reasoning

### Key Features

- **Row Level Security (RLS)**: Ensures data privacy and access control
- **Real-time subscriptions**: Live updates using Supabase realtime
- **Optimized queries**: Indexed for performance
- **JSONB storage**: Flexible AI recommendation storage

## 🔐 Authentication & Authorization

### User Roles

- **Founder**: Can submit ideas and view their own submissions
- **Manager**: Can review all ideas and make funding decisions

### Security Features

- Row Level Security policies ensure data isolation
- JWT-based authentication via Supabase
- API route protection with middleware
- Role-based access control throughout the app

## 🤖 AI Integration

### OpenAI Assessment

The platform uses GPT-4 to evaluate startup ideas across four key criteria:

1. **Innovation** (0-100): Novelty and uniqueness of the idea
2. **Market Fit** (0-100): How well it solves a real market problem
3. **Team Strength** (0-100): Likelihood of successful execution
4. **Revenue Potential** (0-100): Potential for generating revenue

### AI Output

- Overall score (average of four criteria)
- Detailed recommendations for improvement
- Identified strengths and concerns
- Actionable next steps

## 📱 Key Pages

- `/` - Landing page with platform overview
- `/auth/signin` - User authentication
- `/auth/signup` - User registration with role selection
- `/dashboard` - Role-based dashboard (founder/manager view)
- `/dashboard/submit` - Idea submission form (founders only)
- `/idea/[id]` - Detailed idea view with AI assessment
- `/dashboard/analytics` - Analytics dashboard (managers only)

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with TailwindCSS
- **Modern Components**: shadcn/ui component library
- **Smooth Animations**: Framer Motion for enhanced UX
- **Dark Mode Ready**: Built-in theme support
- **Accessible**: WCAG compliant components

## 🚀 Deployment

### Vercel Deployment

1. **Connect to Vercel**:
   ```bash
   npx vercel
   ```

2. **Set Environment Variables** in Vercel dashboard

3. **Deploy**:
   ```bash
   npx vercel --prod
   ```

### Environment Variables for Production

Ensure all environment variables are set in your deployment platform:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_APP_URL`

## 🧪 Sample Data

The database seed script includes sample data:

- **Users**: 2 founders, 2 managers
- **Ideas**: 3 sample startup ideas with AI assessments
- **Decisions**: Example funding decisions

### Sample Login Credentials

After running the seed script, you can test with:

- **Founder**: alice@example.com
- **Manager**: carol@example.com

(Note: You'll need to create actual auth accounts in Supabase)

## 📈 Analytics & Monitoring

### Built-in Analytics

- **Dashboard Stats**: Real-time metrics for ideas, funding, and scores
- **Filtering & Search**: Advanced filtering capabilities
- **Export Features**: CSV/PDF export for managers
- **Performance Tracking**: Idea success rates and AI accuracy

## 🔧 Development

### Project Structure

```
venture-verse/
├── src/
│   ├── app/                 # Next.js app router pages
│   ├── components/          # Reusable UI components
│   ├── lib/                 # Utility functions and configurations
│   └── middleware.ts        # Authentication middleware
├── scripts/                 # Database scripts
├── public/                  # Static assets
└── ...config files
```

### Key Components

- **AuthForm**: Reusable authentication component
- **IdeaForm**: Startup idea submission form
- **IdeasList**: Filterable list of ideas
- **ManagerDecision**: Funding decision interface
- **NavBar**: Role-based navigation

### Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

Built for Edge Company. All rights reserved.

## 🆘 Support

For support and questions:

1. Check the documentation
2. Review the database schema
3. Verify environment variables
4. Check Supabase and OpenAI API status

## 🔮 Future Enhancements

- **Real-time Notifications**: Email/SMS alerts for status changes
- **Advanced Analytics**: Machine learning insights and trends
- **Mobile App**: React Native companion app
- **Integration APIs**: Third-party service integrations
- **Multi-language Support**: Internationalization
- **Advanced AI**: Custom models for industry-specific assessments

---

**Venture Verse** - Transforming startup ideas into funded reality through AI-powered assessment and expert review.

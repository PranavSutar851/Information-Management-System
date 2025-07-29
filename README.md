# Venture Verse - Startup Idea Assessment Platform

A comprehensive SaaS platform for startup idea assessment and funding decisions powered by AI. Built for Edge Company to streamline the process of evaluating and funding innovative startup ideas.

## 🚀 Features

- **AI-Powered Assessment**: Instant evaluation of startup ideas using OpenAI GPT-4
- **Role-Based Access**: Separate interfaces for founders and managers
- **Real-time Updates**: Live notifications and status updates
- **Comprehensive Analytics**: Dashboard with insights and export capabilities
- **Secure Authentication**: Supabase Auth with email/password and OAuth
- **Industrial-Grade Security**: Row Level Security (RLS) policies

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **UI Components**: shadcn/ui with Radix UI primitives
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL with Row Level Security
- **AI**: OpenAI GPT-4/4o API
- **Authentication**: Supabase Auth
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account
- OpenAI API account

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd venture-verse
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to the SQL Editor in your Supabase dashboard
3. Copy and paste the contents of `schema.sql` and execute it
4. This will create all necessary tables, policies, and triggers

### 4. Seed Database (Optional)

To populate your database with sample data for testing:

```bash
npm run seed
```

This creates test accounts:
- **Founders**: 
  - john.founder@example.com / password123
  - jane.founder@example.com / password123
- **Managers**: 
  - mike.manager@example.com / password123
  - sarah.manager@example.com / password123

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
venture-verse/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── api/               # API routes
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Dashboard pages
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   └── ui/               # shadcn/ui components
│   └── lib/                   # Utilities and configurations
│       ├── supabase/         # Supabase client setup
│       ├── openai.ts         # OpenAI integration
│       ├── types.ts          # TypeScript definitions
│       └── utils.ts          # Utility functions
├── scripts/
│   └── seed.ts               # Database seeding script
├── schema.sql                # Database schema
├── middleware.ts             # Next.js middleware
└── tailwind.config.ts        # Tailwind configuration
```

## 🔐 Authentication & Authorization

The platform uses Supabase Auth with the following user roles:

- **Founder**: Can submit ideas, view their own submissions and AI assessments
- **Manager**: Can review all ideas, make funding decisions, and access analytics

Row Level Security (RLS) policies ensure data isolation and proper access control.

## 🤖 AI Integration

The platform integrates with OpenAI's GPT-4 to provide:

- **Innovation Score** (0-100): Novelty and problem-solving approach
- **Market Fit Score** (0-100): Market demand and timing
- **Team Strength Score** (0-100): Likelihood of execution success
- **Revenue Potential Score** (0-100): Financial opportunity assessment
- **Overall Score**: Weighted average of all criteria
- **Actionable Recommendations**: Specific improvement suggestions
- **Analysis**: Strengths and challenges overview

## 🗄 Database Schema

### Core Tables

- **users**: User profiles with role-based access
- **ideas**: Startup idea submissions with AI scores
- **assessments**: Detailed AI evaluation criteria
- **manager_decisions**: Funding decisions with analysis

### Key Features

- UUID primary keys for security
- JSONB fields for flexible data storage
- Automatic timestamps with triggers
- Comprehensive RLS policies
- Optimized indexes for performance

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/signout` - User logout

### Ideas Management
- `GET /api/ideas` - List ideas (role-based filtering)
- `POST /api/ideas` - Submit new idea with AI assessment
- `POST /api/ideas/[id]/decide` - Manager funding decision

### Analytics
- `GET /api/analytics` - Dashboard statistics (managers only)

## 🎨 UI Components

Built with shadcn/ui for consistent, accessible design:

- Responsive design with mobile-first approach
- Dark/light theme support
- Accessible components with proper ARIA labels
- Smooth animations and transitions

## 🔧 Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run seed         # Populate database with sample data
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Environment Variables for Production

Ensure all environment variables are set in your deployment platform:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_APP_URL` (your production URL)

## 🔒 Security Features

- **Row Level Security (RLS)**: Database-level access control
- **JWT Authentication**: Secure session management
- **API Route Protection**: Middleware-based authentication
- **Input Validation**: Comprehensive data validation
- **CORS Configuration**: Proper cross-origin request handling

## 📊 Analytics & Insights

Managers have access to comprehensive analytics:

- Total ideas and status breakdown
- Average AI scores and trends
- Category-wise performance
- Funding statistics
- Recent activity feed
- Export capabilities (CSV/PDF)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is proprietary to Edge Company. All rights reserved.

## 🆘 Support

For technical support or questions:

1. Check the documentation above
2. Review the database schema in `schema.sql`
3. Examine the API routes in `src/app/api/`
4. Contact the development team

## 🔄 Next Steps

After setup, you can:

1. Customize the AI prompts in `src/lib/openai.ts`
2. Modify the database schema as needed
3. Add additional UI components
4. Implement real-time notifications
5. Add email notification features
6. Enhance analytics with more charts
7. Add export functionality
8. Implement OAuth providers

---

**Built with ❤️ for Edge Company**
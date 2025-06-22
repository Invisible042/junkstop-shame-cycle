# JunkStop - Junk Food Accountability App

## Overview

JunkStop is a mobile-first web application designed to help users track and reduce their junk food consumption through shame-based accountability and AI coaching. The app combines psychological tactics with community support to create behavior change around unhealthy eating habits.

## System Architecture

### Frontend Architecture
- **Framework**: React Native with Expo and TypeScript
- **Development**: Expo CLI for cross-platform mobile development
- **UI Framework**: React Native with custom styled components
- **State Management**: React Context for auth, secure storage for persistence
- **Navigation**: React Navigation for native mobile navigation
- **Mobile-Native**: True mobile app with native iOS/Android support

### Backend Architecture
- **Primary Backend**: FastAPI with Python 3.11
- **Language**: Python with async/await support
- **API Pattern**: RESTful API with `/api` prefix
- **Authentication**: JWT tokens with Bearer authentication
- **File Upload**: Multipart form data with image processing
- **AI Integration**: OpenRouter API for coaching and calorie estimation
- **Demo User**: demo@junkstop.com / password

### Data Storage
- **Database**: PostgreSQL with direct connections
- **Backend ORM**: Direct SQL operations via psycopg2
- **Schema Management**: Manual SQL table creation
- **Authentication**: JWT tokens with secure password hashing

### UI Component System
- **Base**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **Icons**: Lucide React icon library
- **Theme**: Dark theme with glassmorphism effects and gradient backgrounds

## Key Components

### Application Screens
1. **Dashboard Screen**: Shows current streak, money saved, and guilt scores
2. **Log Screen**: Photo capture and guilt/regret rating interface
3. **Progress Screen**: Weekly shame scores and AI pattern analysis
4. **Chat Screen**: AI coach conversation interface
5. **Community Screen**: Anonymous confessions and peer support

### Core Features
- **Streak Tracking**: Days without junk food consumption
- **Financial Tracking**: Money saved by avoiding junk food
- **Guilt Scoring**: Self-reported guilt and regret ratings (1-10 scale)
- **Photo Logging**: Visual documentation of junk food consumption
- **AI Coaching**: Personalized insights and pattern recognition
- **Community Support**: Anonymous confession sharing system

### Storage Interface
- **User Management**: CRUD operations for user accounts
- **Modular Design**: Interface-based storage allowing easy switching between implementations
- **Type Safety**: Full TypeScript integration with Zod validation

## Data Flow

1. **User Interaction**: User navigates between screens using bottom navigation
2. **Logging Process**: User takes photo → rates guilt/regret → submits log entry
3. **Streak Management**: Successful logs reset streak counter and update statistics
4. **AI Processing**: Background analysis of user patterns and timing
5. **Community Sharing**: Anonymous posts shared across user base
6. **Progress Tracking**: Weekly aggregation of shame scores and behavior patterns

## External Dependencies

### Database & ORM
- **@neondatabase/serverless**: Serverless PostgreSQL connection
- **drizzle-orm**: Type-safe database ORM
- **drizzle-zod**: Schema validation integration

### UI & Styling
- **@radix-ui/***: Accessible component primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Component variant management
- **lucide-react**: Icon library

### State & Data Management
- **@tanstack/react-query**: Server state management
- **react-hook-form**: Form state management
- **@hookform/resolvers**: Form validation resolvers

### Development Tools
- **vite**: Build tool and development server
- **tsx**: TypeScript execution for development
- **esbuild**: Production bundling

## Deployment Strategy

### Platform
- **Hosting**: Replit with autoscale deployment
- **Build Process**: Vite build for frontend, esbuild for backend
- **Port Configuration**: Internal port 5000, external port 80
- **Environment**: Node.js 20 with PostgreSQL 16

### Development Workflow
- **Hot Reload**: Automatic server restart and frontend HMR
- **Database**: Automatic PostgreSQL provisioning
- **Error Handling**: Runtime error overlay for development
- **Code Quality**: TypeScript strict mode with comprehensive type checking

### Production Considerations
- **Static Assets**: Compiled to `dist/public` directory
- **Server Bundle**: Single ESM bundle for optimal cold start performance
- **Environment Variables**: DATABASE_URL required for production
- **Session Management**: Prepared for PostgreSQL session storage

## Changelog

```
Changelog:
- June 21, 2025. Initial setup with Node.js/Express frontend
- June 21, 2025. Migration from Lovable to Replit completed
- June 21, 2025. FastAPI Python backend with Supabase database integration added
- June 21, 2025. Complete JunkStop app functionality implemented:
  * Photo upload and junk food logging system
  * JWT authentication with secure login/registration
  * AI coaching integration with OpenRouter fallbacks
  * Real-time streak tracking and guilt/regret scoring
  * Community features and weekly analytics
  * Mobile-first responsive design with dark theme
- June 21, 2025. Converted to React Native mobile app with monorepo structure:
  * Migrated from web to native mobile app using React Native and Expo
  * Created beautiful signup screen with glassmorphism effects and gradient theming
  * Implemented secure authentication with Expo SecureStore
  * Added bottom tab navigation with 5 main screens
  * Set up unified development workflow with single command startup
  * Created monorepo structure for backend and mobile development
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```
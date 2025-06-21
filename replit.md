# JunkStop - Junk Food Accountability App

## Overview

JunkStop is a mobile-first web application designed to help users track and reduce their junk food consumption through shame-based accountability and AI coaching. The app combines psychological tactics with community support to create behavior change around unhealthy eating habits.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Framework**: Tailwind CSS with shadcn/ui component library
- **State Management**: React Query for server state, React hooks for local state
- **Routing**: React Router for client-side navigation
- **Mobile-First**: Responsive design optimized for mobile devices

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API with `/api` prefix
- **Development**: Hot reload with tsx for TypeScript execution
- **Production**: Compiled with esbuild for optimal performance

### Data Storage
- **Database**: PostgreSQL (configured via Drizzle)
- **ORM**: Drizzle ORM with type-safe queries
- **Migrations**: Drizzle Kit for schema management
- **Development Storage**: In-memory storage implementation for rapid prototyping
- **Connection**: Neon Database serverless PostgreSQL

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
- June 21, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```
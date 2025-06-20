# JunkStop - Junk Food Accountability App

## Overview

JunkStop is a mobile-first web application designed to help users track and reduce their junk food consumption through shame-based accountability, AI insights, and community support. The app features streak tracking, photo logging, guilt scoring, and an anonymous community for sharing experiences.

## System Architecture

### Frontend Architecture
The frontend is built using React with TypeScript, leveraging a modern component-based architecture:
- **Framework**: React 18 with Vite for development and building
- **Styling**: Tailwind CSS with shadcn/ui component library for consistent design
- **State Management**: React Query (TanStack Query) for server state and React hooks for local state
- **Routing**: React Router for single-page application navigation
- **UI Components**: Radix UI primitives wrapped with custom styling via shadcn/ui

### Backend Architecture
The backend follows an Express.js REST API pattern:
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Storage**: Memory storage implementation with interface for easy database migration
- **Session Management**: Express sessions with PostgreSQL session store

### Mobile-First Design
The application is optimized for mobile devices with:
- Responsive design using Tailwind CSS breakpoints
- Touch-friendly interface elements
- Mobile navigation patterns
- Camera integration for photo capture

## Key Components

### Frontend Components
1. **DashboardScreen**: Main screen showing streak counter, savings, and AI insights
2. **LogScreen**: Photo capture and guilt/regret rating interface
3. **ProgressScreen**: Weekly progress visualization with shame score tracking
4. **ChatScreen**: AI coach interaction interface
5. **CommunityScreen**: Anonymous confession sharing platform
6. **Navigation**: Bottom navigation bar for screen switching

### Backend Services
1. **Storage Interface**: Abstracted data layer supporting both memory and database storage
2. **User Management**: Basic user creation and retrieval operations
3. **Route Registration**: Modular API route organization

### Database Schema
- **Users Table**: Basic user authentication with username/password
- Schema designed for easy extension with additional tracking tables

## Data Flow

1. **User Registration/Login**: Users create accounts with username/password
2. **Streak Tracking**: Daily progress tracked with automatic reset on junk food logging
3. **Photo Logging**: Users capture photos and rate guilt/regret levels
4. **AI Insights**: Pattern analysis based on user behavior data
5. **Community Sharing**: Anonymous confession posting and interaction
6. **Progress Visualization**: Weekly and historical data presentation

## External Dependencies

### Production Dependencies
- **UI Framework**: React ecosystem with TypeScript support
- **Database**: PostgreSQL via Neon serverless database
- **ORM**: Drizzle ORM for type-safe database operations
- **UI Components**: Comprehensive Radix UI component library
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with PostCSS processing

### Development Tools
- **Build Tool**: Vite for fast development and optimized builds
- **TypeScript**: Full type safety across frontend and backend
- **ESBuild**: Fast backend bundling for production

## Deployment Strategy

### Replit Environment
- **Runtime**: Node.js 20 with PostgreSQL 16 module
- **Development**: Hot reload via Vite development server
- **Production Build**: 
  - Frontend: Vite build to `dist/public`
  - Backend: ESBuild bundle to `dist/index.js`
- **Database**: PostgreSQL provisioned via Replit modules

### Environment Configuration
- **Development**: `npm run dev` starts both frontend and backend
- **Production**: `npm run build` then `npm run start`
- **Database**: Drizzle migrations via `npm run db:push`

### Port Configuration
- **Development**: Port 5000 for local development
- **Production**: Port 80 for external access
- **Database**: Automatic connection via `DATABASE_URL` environment variable

## Changelog

- June 20, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.
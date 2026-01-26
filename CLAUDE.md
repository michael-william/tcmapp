# CLAUDE.md - Tableau Migration Web Application

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Tableau Cloud Migration Prerequisite Questions - Web Application**

A full-stack web application for managing Tableau Cloud migration projects. This application transforms a single-file HTML checklist into a collaborative tool with user authentication, database persistence, and customizable question templates.

**Purpose**: Enable InterWorks consultants to create and manage migration checklists for multiple clients, with each client able to answer questions through a dedicated portal.

## Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT with bcrypt
- **Testing**: Jest + Supertest + MongoDB Memory Server

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Testing**: Vitest + React Testing Library + MSW

### Deployment
- **Containerization**: Docker + Docker Compose
- **Services**: Frontend (port 5173), Backend (port 5000), MongoDB (port 27017)

## Repository Structure

```
tableau-migration-app/
├── backend/                    # Express API server
│   ├── src/
│   │   ├── models/            # Mongoose models (User, Migration)
│   │   ├── routes/            # API endpoints (auth, migrations, users)
│   │   ├── middleware/        # Auth middleware (JWT verification)
│   │   ├── seeds/             # Default question template
│   │   ├── config/            # Database configuration
│   │   └── __tests__/         # Backend tests
│   ├── package.json
│   ├── CLAUDE.md             # Backend-specific docs
│   └── .env                  # Backend environment variables
│
├── frontend/                   # React application
│   ├── src/
│   │   ├── components/        # React components (atomic design)
│   │   │   ├── ui/           # Base shadcn/ui components
│   │   │   ├── atoms/        # Simple building blocks
│   │   │   ├── molecules/    # Component combinations
│   │   │   ├── organisms/    # Complex components
│   │   │   └── templates/    # Page layouts
│   │   ├── pages/            # Page components
│   │   ├── lib/              # Utilities and helpers
│   │   ├── hooks/            # Custom React hooks
│   │   └── __tests__/        # Frontend tests
│   ├── package.json
│   ├── CLAUDE.md             # Frontend-specific docs
│   └── vite.config.js
│
├── docker-compose.yml         # Container orchestration
├── .env.example              # Environment variables template
├── CLAUDE.md                 # This file
└── tableau-migration-checklist-pro.html  # Original HTML prototype (reference)
```

## How to Run the Application

### Prerequisites
- Docker and Docker Compose installed
- Node.js 18+ (for local development without Docker)
- MongoDB (for local development without Docker)

### Using Docker Compose (Recommended)

```bash
# Start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:5173
# Backend API: http://localhost:5000/api
# MongoDB: mongodb://localhost:27017
```

### Local Development (Without Docker)

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## How to Run Tests

### Backend Tests
```bash
cd backend
npm install
npm test              # Run all tests with coverage
npm run test:watch    # Run tests in watch mode
```

### Frontend Tests
```bash
cd frontend
npm install
npm test              # Run all tests with coverage
npm run test:watch    # Run tests in watch mode
npm run test:ui       # Open Vitest UI
```

### Run All Tests
```bash
# From project root
cd backend && npm test && cd ../frontend && npm test
```

## Environment Variables

Create `.env` files in the appropriate directories:

**Backend `.env`:**
```
MONGODB_URI=mongodb://localhost:27017/tableau-migrations-dev
JWT_SECRET=your-super-secure-random-jwt-secret
JWT_EXPIRES_IN=7d
NODE_ENV=development
PORT=5000
```

**Frontend `.env`:**
```
VITE_API_URL=http://localhost:5000/api
```

See `.env.example` for a complete template.

## Key Architectural Decisions

### Authentication Strategy
- JWT tokens stored in localStorage (frontend)
- Token expiration: 7 days (configurable)
- Password hashing: bcrypt with 10 salt rounds
- Role-based access control: `interworks` and `client` roles

### Database Design
- NoSQL (MongoDB) for flexible schema
- Two main models: User and Migration
- Migration contains embedded questions array (not separate collection)
- Question template cloned on migration creation

### Frontend Architecture
- Atomic Design pattern for components
- shadcn/ui for base component library
- Tailwind CSS for styling with custom purple gradient theme (#6633ff, #4616a8)
- Auto-save functionality with debouncing

### Testing Strategy
- Backend: Jest + Supertest for integration tests, MongoDB Memory Server for isolation
- Frontend: Vitest + React Testing Library for component tests, MSW for API mocking
- Coverage targets: 80%+ backend, 70%+ frontend
- E2E tests: Playwright (optional, for critical flows)

## Common Development Tasks

### Add a New API Endpoint
1. Define route in `backend/src/routes/`
2. Add middleware if needed (auth, validation)
3. Create test in `backend/src/__tests__/routes/`
4. Run tests: `cd backend && npm test`

### Add a New Component
1. Create component in appropriate directory:
   - Atoms: `frontend/src/components/atoms/`
   - Molecules: `frontend/src/components/molecules/`
   - Organisms: `frontend/src/components/organisms/`
2. Create test in `frontend/src/__tests__/components/`
3. Run tests: `cd frontend && npm test`

### Add a New Page
1. Create page component in `frontend/src/pages/`
2. Add route in main routing file
3. Create test in `frontend/src/__tests__/pages/`
4. Add MSW handlers in `frontend/src/__tests__/mocks/handlers.js`

### Seed Database with Questions
```bash
cd backend
npm run seed
```

### Update Question Template
Edit `backend/src/seeds/questionTemplate.js` with the 54 migration questions.

## User Roles and Permissions

### InterWorks Role
- Create/delete migrations
- Customize questions per migration
- Create/delete client users
- View all migrations
- Edit any migration

### Client Role
- View assigned migration only
- Answer questions
- Export PDF
- Cannot customize questions
- Cannot access other migrations

## Deployment

### Production Considerations
- Use strong JWT_SECRET (generate with `openssl rand -base64 32`)
- Enable HTTPS (use reverse proxy like Nginx with Let's Encrypt)
- Set up MongoDB backups
- Configure CORS for production domain
- Add rate limiting on auth endpoints
- Use environment variables for all secrets
- Set NODE_ENV=production

### Docker Compose Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Migration from Original HTML
The original single-file HTML application (`tableau-migration-checklist-pro.html`) serves as the source of truth for:
- Question structure and types (line 1104)
- UI styling and design patterns
- PDF export format
- Question rendering logic

## Support and Documentation

For more detailed documentation:
- Backend: See `backend/CLAUDE.md`
- Frontend: See `frontend/CLAUDE.md`

## Future Extensibility

### Planned Features
- Magic link authentication (passwordless login)
- Email notifications
- Migration status workflow (draft, in-progress, completed)
- File attachments
- Comments and collaboration
- Activity log and audit trail
- Analytics dashboard

### Extension Points
- User model ready for `loginToken` and `loginTokenExpiry` fields
- Email service integration points prepared
- Extensible question types via `questionType` enum

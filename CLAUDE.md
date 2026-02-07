# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Tableau Cloud Migration Prerequisite Questions - Web Application**

A full-stack web application for managing Tableau Cloud migration projects. Enables InterWorks consultants to create and manage migration checklists for multiple clients, with each client answering questions through a dedicated portal.

## Tech Stack

### Backend
- **Runtime**: Node.js + Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT with bcrypt
- **Testing**: Jest + Supertest + MongoDB Memory Server

### Frontend
- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS + shadcn/ui (Radix UI primitives)
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Testing**: Vitest + React Testing Library + MSW (Mock Service Worker)

### Deployment
- **Containerization**: Docker + Docker Compose
- **Services**: Frontend (port 5173), Backend (port 3000), MongoDB (port 27017)

## Repository Structure

```
TCMApp/
├── backend/                    # Express API server
│   ├── src/
│   │   ├── models/            # Mongoose models (User, Migration)
│   │   ├── routes/            # API endpoints (auth, migrations, users, clients)
│   │   ├── middleware/        # Auth middleware (JWT verification)
│   │   ├── seeds/             # Default question template
│   │   ├── config/            # Database configuration
│   │   ├── scripts/           # Utility scripts
│   │   ├── __tests__/         # Backend tests
│   │   └── server.js          # Express app entry point
│   ├── package.json
│   └── CLAUDE.md             # Backend-specific docs
│
├── frontend/                   # React application
│   ├── src/
│   │   ├── components/        # React components (atomic design)
│   │   │   ├── ui/           # shadcn/ui base components
│   │   │   ├── atoms/        # Simple building blocks
│   │   │   ├── molecules/    # Component combinations
│   │   │   ├── organisms/    # Complex components
│   │   │   └── templates/    # Page layouts
│   │   ├── pages/            # Page components
│   │   ├── lib/              # Utilities (api.js, utils.js)
│   │   ├── hooks/            # Custom React hooks (useAuth, useMigration)
│   │   └── __tests__/        # Frontend tests
│   │       ├── mocks/        # MSW handlers
│   │       ├── components/   # Component tests
│   │       ├── pages/        # Page tests
│   │       ├── test-utils.jsx
│   │       └── testSetup.js
│   ├── package.json
│   └── CLAUDE.md             # Frontend-specific docs
│
├── docker-compose.yml         # Container orchestration (base config)
├── docker-compose.dev.yml    # Dev environment overrides (dev branch only)
├── .env.example              # Environment variables template
├── CLAUDE.md                 # This file
├── README.md                 # Project overview and status
└── tableau-migration-checklist-pro.html  # Original HTML prototype (reference)
```

## Common Commands

### Development

**Using Docker Compose - Development Environment (dev branch):**
```bash
# Switch to dev branch and start with dev configuration
git checkout dev
docker-compose down
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build

# Access:
# Frontend: http://localhost:5173
# Backend API: http://localhost:3000/api
# MongoDB: mongodb://localhost:27017
# Database: tableau-migrations-dev (isolated from production)
```

**Using Docker Compose - Production Environment (main branch):**
```bash
# Switch to main branch and start with production configuration
git checkout main
docker-compose down
docker-compose up --build

# Access:
# Frontend: http://localhost:5173
# Backend API: http://localhost:3000/api
# MongoDB: mongodb://localhost:27017
# Database: tableau-migrations (production data)
```

**Environment Isolation:**
- **Dev branch**: Uses `tableau-migrations-dev` database with `mongodb_data_dev` volume
- **Main branch**: Uses `tableau-migrations` database with `mongodb_data` volume
- Complete data isolation - switching branches switches databases automatically
- Railway deployment uses main branch only and its own managed MongoDB

**Local Development (Without Docker):**

Backend:
```bash
cd backend
npm install
npm run dev           # Starts on port 3000
```

Frontend:
```bash
cd frontend
npm install
npm run dev           # Starts on port 5173
npm run build         # Production build
npm run preview       # Preview production build
```

### Testing

**Backend:**
```bash
cd backend
npm test              # Run all tests with coverage
npm run test:watch    # Run tests in watch mode
```

**Frontend:**
```bash
cd frontend
npm test              # Run all tests with coverage
npm run test:watch    # Run tests in watch mode
npm run test:ui       # Open Vitest UI
```

**Run a Single Test File:**
```bash
# Backend
cd backend && npm test -- User.test.js

# Frontend
cd frontend && npm test Login.test.jsx
```

### Database Seeds

```bash
cd backend
npm run seed          # Seed question template
npm run seed:users    # Seed test users
```

## Environment Variables

Create `.env` files based on `.env.example`:

**Backend `.env`:**
```
MONGODB_URI=mongodb://localhost:27017/tableau-migrations-dev
JWT_SECRET=your-super-secure-random-jwt-secret
JWT_EXPIRES_IN=7d
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173
```

**Frontend `.env`:**
```
VITE_API_URL=http://localhost:3000/api
```

**Note:** Docker Compose uses port 3000 for backend (configured in docker-compose.yml).

## Key Architecture

### Authentication
- JWT tokens stored in localStorage (frontend)
- Token expiration: 7 days (configurable via JWT_EXPIRES_IN)
- Password hashing: bcrypt with 10 salt rounds
- Role-based access control: `interworks` (admin) and `client` (limited access) roles

### Database Design
- MongoDB with Mongoose ODM
- Two main models: **User** and **Migration**
- Migration model contains embedded questions array (not a separate collection)
- Question template is cloned from seed on migration creation

### Frontend Architecture
- **Atomic Design pattern**: ui → atoms → molecules → organisms → templates → pages
- **shadcn/ui** for base component library (Radix UI primitives)
- **Tailwind CSS** with custom purple gradient theme (#6633ff primary, #4616a8 dark)
- Auto-save functionality with debouncing (1000ms)

### Testing Strategy
- **Backend**: Jest + Supertest for integration tests, MongoDB Memory Server for isolation
- **Frontend**: Vitest + React Testing Library for component tests, MSW for API mocking
- Coverage targets: 80%+ backend, 70%+ frontend

## API Routes Overview

All routes are prefixed with `/api`:

### Authentication (`/api/auth`)
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login and get JWT token
- `GET /auth/me` - Get current user (requires auth)

### Migrations (`/api/migrations`)
- `POST /migrations` - Create migration (InterWorks only)
- `GET /migrations` - List migrations (filtered by role)
- `GET /migrations/:id` - Get single migration
- `PUT /migrations/:id` - Update migration
- `DELETE /migrations/:id` - Delete migration (InterWorks only)
- `POST /migrations/:id/questions` - Add question (InterWorks only)
- `PUT /migrations/:id/questions/:qid` - Edit question (InterWorks only)
- `DELETE /migrations/:id/questions/:qid` - Delete question (InterWorks only)
- `PUT /migrations/:id/questions/reorder` - Reorder questions (InterWorks only)

### Users (`/api/users`)
- `POST /users` - Create client user (InterWorks only)
- `GET /users` - List users (InterWorks only)
- `DELETE /users/:id` - Delete user (InterWorks only)

### Clients (`/api/clients`)
- See `backend/src/routes/clients.js` for client-specific routes

**Authentication:** Use `Authorization: Bearer <token>` header for protected routes.

## User Roles and Permissions

### InterWorks Role
- Create/delete migrations and users
- Customize questions per migration
- View all migrations
- Full access to all features

### Client Role
- View assigned migration only
- Answer questions
- Export PDF
- Cannot customize questions or access other migrations

## Data Models

### User Model
```javascript
{
  email: String (required, unique, lowercase)
  passwordHash: String (required, auto-hashed on save)
  role: String (enum: ['interworks', 'client'], default: 'client')
  name: String (optional)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

### Migration Model
```javascript
{
  clientEmail: String (required, ref to User.email)
  clientInfo: {
    clientName: String
    region: String
    serverVersion: String
    serverUrl: String
    kickoffDate: Date
    primaryContact: String
    meetingCadence: String
    goLiveDate: Date
  }
  questions: [{
    id: String (required, unique within migration)
    section: String (required)
    questionText: String (required)
    questionType: String (enum: ['checkbox', 'textInput', 'dateInput', 'dropdown', 'yesNo'])
    options: [String] (for dropdown/yesNo types)
    answer: Mixed (depends on questionType)
    completed: Boolean (default: false)
    timestamp: Date (when answered)
    order: Number (display order)
    metadata: {
      isFullWidth: Boolean
      hasConditionalInput: Boolean
      hasConditionalDate: Boolean
      conditionalText: String
      conditionalDate: Date
      infoTooltip: String
    }
  }]
  additionalNotes: String
  createdBy: String (ref to User.email)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

## Frontend Component Hierarchy

**Atomic Design Pattern:**
- **ui/**: Base shadcn/ui components (Button, Input, Card, Checkbox, Select, etc.)
- **atoms/**: Simple building blocks (InfoTooltip, SectionBadge, ProgressBar)
- **molecules/**: Component combinations (QuestionCheckbox, QuestionTextInput, QuestionDropdown, ClientInfoField)
- **organisms/**: Complex components (Header, QuestionSection, MigrationCard, QuestionManagementModal)
- **templates/**: Page layouts (AuthLayout, DashboardLayout, MigrationLayout)
- **pages/**: Full pages (Login, Dashboard, MigrationChecklist, UserManagement)

**Custom Hooks:**
- `useAuth()` - Authentication state and functions (login, logout, user)
- `useMigration(id)` - Fetch and manage migration data with auto-save

## Reference HTML Prototype

The original single-file HTML application (`tableau-migration-checklist-pro.html`) serves as the design reference for:
- Question structure and types
- UI styling and visual design
- PDF export format
- Question rendering logic

## Additional Documentation

For detailed API documentation, component APIs, testing patterns, and troubleshooting:
- **Backend**: See `backend/CLAUDE.md`
- **Frontend**: See `frontend/CLAUDE.md`
- **Project Status**: See `README.md`

# Tableau Cloud Migration Web Application

A full-stack web application for managing Tableau Cloud migration projects with user authentication, database persistence, and customizable question templates.

## 🎯 Project Status

**Agent 0: Testing Infrastructure & Documentation** - ✅ COMPLETE
- Backend: 26 tests, 82.95% coverage
- Frontend: 14 tests, 100% component coverage
- See [AGENT_0_COMPLETE.md](./AGENT_0_COMPLETE.md)

**Agent 1: Infrastructure & Backend Foundation** - ✅ COMPLETE
- Docker Compose with 3 services (MongoDB, Backend, Frontend)
- Migration model with 55-question template
- Express server with health check endpoint
- Frontend scaffolding with auth context
- Backend: 43 tests passing, 73.5% coverage
- Frontend: 21/22 tests passing, 95%
- See [AGENT_1_COMPLETE.md](./AGENT_1_COMPLETE.md)

**Agent 2: Backend REST APIs** - ✅ COMPLETE
- Migration CRUD routes (create, list, get, update, delete)
- Question management routes (add, edit, delete, reorder)
- User management routes (create, list, get, update, delete)
- Role-based access control (InterWorks vs Client)
- Backend: 97 tests passing, 81% coverage ✓
- See [AGENT_2_COMPLETE.md](./AGENT_2_COMPLETE.md)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (or Docker for containerized setup)

### Run Tests

**Backend:**
```bash
cd backend
npm install
npm test              # Run all tests with coverage
npm run test:watch    # Run in watch mode
```

**Frontend:**
```bash
cd frontend
npm install
npm test              # Run all tests with coverage
npm run test:watch    # Run in watch mode
```

### Local Development (without Docker)

**Backend:**
```bash
cd backend
npm install
npm run dev           # Starts on port 5000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev           # Starts on port 5173
```

## 🔄 Environment Workflows

This project uses separate Git branches for development and production environments with isolated databases.

### Development Environment (dev branch)

**Switch to development:**
```bash
git checkout dev
docker-compose down  # Stop any running containers
docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

**Access:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api
- Database: `tableau-migrations-dev` (isolated volume)

**Use for:**
- Testing new features
- Schema changes
- Creating test data
- Experimenting without affecting production data

### Production Environment (main branch)

**Switch to production:**
```bash
git checkout main
docker-compose down  # Stop any running containers
docker-compose up --build
```

**Access:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000/api
- Database: `tableau-migrations` (production volume)

**Use for:**
- Final testing before deployment
- Production-like local environment
- Validating releases

### Database Isolation

Each environment has its own database and Docker volume:

| Environment | Branch | Database Name | Docker Volume |
|------------|--------|---------------|---------------|
| Development | `dev` | `tableau-migrations-dev` | `mongodb_data_dev` |
| Production | `main` | `tableau-migrations` | `mongodb_data` |

**Benefits:**
- ✅ Complete data isolation between environments
- ✅ Safe testing without affecting production data
- ✅ Easy environment switching with Git branches
- ✅ Railway deployment unaffected (uses main branch only)

### Railway Deployment

**Important:** Railway auto-deploys from the `main` branch only.

- Railway uses its own managed MongoDB instance (not local Docker)
- `docker-compose.dev.yml` exists only on `dev` branch and never gets deployed
- Main branch `docker-compose.yml` remains unchanged and Railway-compatible
- Push to `main` triggers automatic Railway deployment

**Workflow for deploying features:**
```bash
# 1. Develop on dev branch
git checkout dev
# ... make changes, test locally ...

# 2. Merge to main when ready
git checkout main
git merge dev
git push origin main  # Railway auto-deploys
```

## 📚 Documentation

- **[Root CLAUDE.md](./CLAUDE.md)** - Project overview, architecture, and how to run
- **[Backend CLAUDE.md](./backend/CLAUDE.md)** - API documentation, models, routes, testing
- **[Frontend CLAUDE.md](./frontend/CLAUDE.md)** - Component API, atomic design, testing

## 🏗️ Architecture

### Tech Stack
- **Backend**: Node.js + Express + MongoDB + Mongoose
- **Frontend**: React 18 + Vite + Tailwind CSS + shadcn/ui
- **Authentication**: JWT with bcrypt
- **Testing**: Jest (backend) + Vitest (frontend) + MSW

### Project Structure
```
tableau-migration-app/
├── backend/          # Express API
│   ├── src/
│   │   ├── models/       # User, Migration
│   │   ├── routes/       # API endpoints
│   │   ├── middleware/   # Auth, roles
│   │   └── __tests__/    # Backend tests
│   └── CLAUDE.md
├── frontend/         # React application
│   ├── src/
│   │   ├── components/   # Atomic design (ui, atoms, molecules, organisms, templates)
│   │   ├── pages/        # Page components
│   │   ├── lib/          # Utilities
│   │   └── __tests__/    # Frontend tests + MSW mocks
│   └── CLAUDE.md
├── CLAUDE.md         # Project documentation
└── README.md         # This file
```

## 🧪 Testing

### Coverage Targets
- Backend: 80%+ (currently 82.95% ✓)
- Frontend: 70%+ (currently 100% ✓)

### Test Commands
```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm test

# Watch mode for development
cd backend && npm run test:watch
cd frontend && npm run test:watch
```

## 🔑 Environment Variables

Copy `.env.example` to `.env` and configure:

**Backend (.env):**
```env
MONGODB_URI=mongodb://localhost:27017/tableau-migrations-dev
JWT_SECRET=your-super-secure-random-jwt-secret
JWT_EXPIRES_IN=7d
NODE_ENV=development
PORT=5000
```

**Frontend (.env):**
```env
VITE_API_URL=http://localhost:5000/api
```

## 📋 Implementation Plan

### Phase 0: Testing Infrastructure ✅ COMPLETE
- Backend test infrastructure (Jest + Supertest + MongoDB Memory Server)
- Frontend test infrastructure (Vitest + React Testing Library + MSW)
- CLAUDE.md documentation files

### Phase 1: Infrastructure & Backend Foundation ✅ COMPLETE
- Docker Compose configuration (MongoDB, Backend, Frontend)
- Complete backend scaffolding (Express + Mongoose)
- Migration model with 55 questions
- Question template seed data
- Basic frontend scaffolding with auth context

### Phase 2: Backend REST APIs ✅ COMPLETE
- Migration CRUD routes (5 endpoints)
- Question management routes (4 endpoints)
- User management routes (5 endpoints)
- 97 tests passing, 81% coverage

### Phase 3: Frontend Component Library (Next)
- shadcn/ui + Tailwind setup
- Atomic design components (atoms, molecules, organisms)
- Purple gradient theme (#6633ff)

### Phase 4: Frontend Pages & Integration
- Login page
- Dashboard page
- Migration checklist page
- Question management interface
- User management page

### Phase 5: Polish, Export & Deployment
- PDF export
- UI animations
- Responsive design
- Production configuration

## 👥 User Roles

### InterWorks Consultants
- Create/delete migrations
- Customize questions per migration
- Create/delete client users
- View all migrations
- Full access

### Client Users
- View assigned migration only
- Answer questions
- Export PDF
- Read-only question template

## 🎨 Design

**Purple Gradient Theme:**
- Primary: `#6633ff`
- Primary Dark: `#4616a8`
- Primary Light: `#8c66ff`

Based on the original HTML prototype: `tableau-migration-checklist-pro.html`

## 📄 License

MIT License - See [LICENSE](./LICENSE)

## 🤝 Contributing

This project follows the Atomic Design pattern. Please:
1. Read relevant CLAUDE.md files before contributing
2. Write tests alongside implementation
3. Ensure all tests pass: `npm test`
4. Follow existing code patterns
5. Update documentation for new features

## 🔗 Resources

- [Original HTML Prototype](./tableau-migration-checklist-pro.html)
- [Implementation Plan](./CLAUDE.md#implementation-phases)
- [Backend API Docs](./backend/CLAUDE.md#api-routes)
- [Frontend Component Docs](./frontend/CLAUDE.md#atomic-design-system)

---

**Current Status:** Phases 0, 1, & 2 complete. Ready for Phase 3 (Frontend Components) and Phase 4 (Frontend Pages).

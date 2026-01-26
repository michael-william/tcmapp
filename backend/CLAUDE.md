# Backend CLAUDE.md - Tableau Migration API

Backend-specific documentation for the Tableau Migration Web Application API.

## Architecture Overview

**Express.js REST API** with MongoDB database using Mongoose ODM. JWT authentication with bcrypt password hashing. Role-based access control for InterWorks consultants and client users.

### Tech Stack
- **Runtime**: Node.js
- **Framework**: Express.js 4.x
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT) + bcrypt
- **Validation**: express-validator
- **Security**: helmet, cors
- **Testing**: Jest + Supertest + MongoDB Memory Server

### Project Structure
```
backend/
├── src/
│   ├── models/              # Mongoose schemas
│   │   ├── User.js         # User model (auth)
│   │   └── Migration.js    # Migration model (checklist data)
│   ├── routes/              # API endpoints
│   │   ├── auth.js         # Authentication routes
│   │   ├── migrations.js   # Migration CRUD
│   │   └── users.js        # User management
│   ├── middleware/          # Express middleware
│   │   ├── auth.js         # JWT verification
│   │   └── roles.js        # Role-based access control
│   ├── seeds/               # Database seed files
│   │   └── questionTemplate.js  # 54 default questions
│   ├── config/              # Configuration
│   │   └── db.js           # MongoDB connection
│   ├── __tests__/           # Test files
│   │   ├── testSetup.js    # MongoDB Memory Server setup
│   │   ├── testHelpers.js  # Test utilities
│   │   ├── models/         # Model tests
│   │   └── routes/         # Route integration tests
│   └── server.js            # Express app entry point
├── package.json
├── .env                     # Environment variables
└── CLAUDE.md               # This file
```

## Data Models

### User Model (`src/models/User.js`)

Represents both InterWorks consultants and client users.

**Schema:**
```javascript
{
  email: String (required, unique, lowercase)
  passwordHash: String (required, auto-hashed)
  role: String (enum: ['interworks', 'client'], default: 'client')
  name: String (optional)
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

**Methods:**
- `comparePassword(candidatePassword)` - Returns boolean, uses bcrypt.compare()
- `toJSON()` - Removes passwordHash from JSON responses

**Pre-save Hook:**
- Automatically hashes password using bcrypt (10 salt rounds)
- Only hashes if password is modified

**Example:**
```javascript
const user = await User.create({
  email: 'consultant@interworks.com',
  passwordHash: 'PlainTextPassword123!', // Will be hashed automatically
  name: 'Jane Consultant',
  role: 'interworks'
});

const isValid = await user.comparePassword('PlainTextPassword123!'); // true
```

### Migration Model (`src/models/Migration.js`)

Represents a migration project with client info and questions.

**Schema:**
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
    answer: Mixed (type depends on questionType)
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

**Example:**
```javascript
const migration = await Migration.create({
  clientEmail: 'client@company.com',
  clientInfo: {
    clientName: 'Acme Corp',
    region: 'US-West',
    serverVersion: '2023.3',
    // ... other fields
  },
  questions: questionTemplate, // Cloned from seed
  createdBy: 'consultant@interworks.com'
});
```

## API Routes

### Authentication Routes (`src/routes/auth.js`)

**POST /api/auth/register**
- Register a new user
- **Body**: `{ email, password, name?, role? }`
- **Validation**: Email format, password min 8 chars
- **Returns**: `{ success, token, user }`
- **Status**: 201 on success, 400 on validation error
- **Example**:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@interworks.com","password":"Password123!","name":"Test User","role":"interworks"}'
```

**POST /api/auth/login**
- Authenticate user and get JWT token
- **Body**: `{ email, password }`
- **Returns**: `{ success, token, user }`
- **Status**: 200 on success, 401 on invalid credentials
- **Example**:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@interworks.com","password":"Password123!"}'
```

**GET /api/auth/me**
- Get current user info (requires authentication)
- **Headers**: `Authorization: Bearer <token>`
- **Returns**: `{ success, user }`
- **Status**: 200 on success, 401 on invalid token
- **Example**:
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Migration Routes (`src/routes/migrations.js`)

**POST /api/migrations**
- Create new migration (InterWorks only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ clientEmail, clientInfo? }`
- **Returns**: `{ success, migration }`
- **Access**: InterWorks only

**GET /api/migrations**
- List all migrations
- **Headers**: `Authorization: Bearer <token>`
- **Query**: `?clientEmail=<email>` (optional filter)
- **Returns**: `{ success, migrations: [] }`
- **Access**: InterWorks sees all, client sees only theirs

**GET /api/migrations/:id**
- Get single migration by ID
- **Headers**: `Authorization: Bearer <token>`
- **Returns**: `{ success, migration }`
- **Access**: InterWorks all, client own only

**PUT /api/migrations/:id**
- Update migration (clientInfo, questions, notes)
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ clientInfo?, questions?, additionalNotes? }`
- **Returns**: `{ success, migration }`
- **Access**: InterWorks all, client own only

**DELETE /api/migrations/:id**
- Delete migration (InterWorks only)
- **Headers**: `Authorization: Bearer <token>`
- **Returns**: `{ success, message }`
- **Access**: InterWorks only

### Question Management Routes (`src/routes/migrations.js`)

**POST /api/migrations/:id/questions**
- Add question to migration (InterWorks only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ section, questionText, questionType, options?, metadata? }`
- **Returns**: `{ success, migration }`

**PUT /api/migrations/:id/questions/:qid**
- Edit question (InterWorks only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**: Question fields to update
- **Returns**: `{ success, migration }`

**DELETE /api/migrations/:id/questions/:qid**
- Remove question (InterWorks only)
- **Headers**: `Authorization: Bearer <token>`
- **Returns**: `{ success, migration }`

**PUT /api/migrations/:id/questions/reorder**
- Reorder questions (InterWorks only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ questionIds: [] }` (array of IDs in new order)
- **Returns**: `{ success, migration }`

### User Management Routes (`src/routes/users.js`)

**POST /api/users**
- Create client user (InterWorks only)
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ email, password?, name? }`
- **Returns**: `{ success, user, password }` (generated if not provided)

**GET /api/users**
- List all users (InterWorks only)
- **Headers**: `Authorization: Bearer <token>`
- **Returns**: `{ success, users: [] }`

**DELETE /api/users/:id**
- Delete user (InterWorks only)
- **Headers**: `Authorization: Bearer <token>`
- **Returns**: `{ success, message }`

## Middleware

### Authentication Middleware (`src/middleware/auth.js`)

**requireAuth**
- Verifies JWT token from Authorization header
- Attaches `req.user` with: `{ userId, email, role, name }`
- Returns 401 if token missing/invalid/expired

**requireInterWorks**
- Must be used after `requireAuth`
- Checks if `req.user.role === 'interworks'`
- Returns 403 if not InterWorks role

**Usage:**
```javascript
router.get('/protected', requireAuth, (req, res) => {
  // req.user is available
});

router.post('/admin', requireAuth, requireInterWorks, (req, res) => {
  // Only InterWorks users can access
});
```

## Seed Data

### Question Template (`src/seeds/questionTemplate.js`)

Contains the 54 default migration questions from the original HTML application. Structure matches the Migration.questions schema.

**Run seed:**
```bash
npm run seed
```

**Question structure:**
```javascript
{
  id: 'q1',
  section: 'Security',
  questionText: 'Is MFA enabled for all Tableau Server users?',
  questionType: 'yesNo',
  options: ['Yes', 'No'],
  answer: null,
  completed: false,
  order: 1,
  metadata: {
    isFullWidth: false,
    infoTooltip: 'Multi-factor authentication improves security'
  }
}
```

## How to Run Tests

### Run All Tests with Coverage
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Specific Test File
```bash
npm test -- User.test.js
```

### Coverage Report
Coverage reports are generated in `coverage/` directory. Open `coverage/index.html` in browser for detailed view.

### Test Structure
- **Unit Tests**: Models, middleware, utilities
- **Integration Tests**: API routes with MongoDB Memory Server
- **Test Helpers**: `testHelpers.js` provides utilities like `generateJWT()`, `createTestUserData()`
- **Test Setup**: `testSetup.js` configures MongoDB Memory Server lifecycle

### Writing Tests

**Model Test Example:**
```javascript
const User = require('../../models/User');

describe('User Model', () => {
  it('should hash password on save', async () => {
    const user = await User.create({
      email: 'test@interworks.com',
      passwordHash: 'PlainPassword',
      role: 'interworks'
    });

    expect(user.passwordHash).not.toBe('PlainPassword');
  });
});
```

**Route Test Example:**
```javascript
const request = require('supertest');
const express = require('express');
const authRoutes = require('../../routes/auth');

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('POST /api/auth/login', () => {
  it('should return token on valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'user@test.com', password: 'Password123!' })
      .expect(200);

    expect(response.body.token).toBeDefined();
  });
});
```

## Common Development Tasks

### Add New Route
1. Create route file in `src/routes/`
2. Add middleware (auth, validation)
3. Implement handler functions
4. Register route in `server.js`
5. Create test file in `src/__tests__/routes/`
6. Run tests: `npm test`

### Add New Model
1. Create model file in `src/models/`
2. Define Mongoose schema
3. Add validation and methods
4. Create test file in `src/__tests__/models/`
5. Run tests: `npm test`

### Add Middleware
1. Create middleware file in `src/middleware/`
2. Export middleware function
3. Use in routes: `router.get('/path', middleware, handler)`
4. Create test file
5. Run tests: `npm test`

### Update Question Template
1. Edit `src/seeds/questionTemplate.js`
2. Run seed: `npm run seed`
3. Verify in MongoDB: `mongosh` then `db.migrations.find()`

## Environment Variables

Required variables in `.env`:

```
MONGODB_URI=mongodb://localhost:27017/tableau-migrations-dev
JWT_SECRET=your-super-secure-random-jwt-secret
JWT_EXPIRES_IN=7d
NODE_ENV=development
PORT=5000
```

## Database Connection

### Local MongoDB
```bash
# Start MongoDB
mongod --dbpath /path/to/data

# Or use Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Connect to Database
```bash
mongosh mongodb://localhost:27017/tableau-migrations-dev
```

### Useful MongoDB Commands
```javascript
// Show collections
show collections

// Find all users
db.users.find().pretty()

// Find all migrations
db.migrations.find().pretty()

// Drop database (start fresh)
db.dropDatabase()
```

## Debugging

### Enable Debug Logging
```javascript
// In server.js or any file
console.log('Debug info:', variable);
```

### Test Specific Route
```bash
# Use curl or Postman
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer <token>"
```

### Check MongoDB Data
```bash
mongosh
use tableau-migrations-dev
db.users.find()
```

## Common Issues

### "ValidationError: User validation failed"
- Check required fields (email, passwordHash)
- Verify email format
- Ensure role is 'interworks' or 'client'

### "MongoServerError: E11000 duplicate key error"
- Email already exists in database
- Use different email or delete existing user

### "JsonWebTokenError: invalid token"
- Token may be malformed
- Check Authorization header format: `Bearer <token>`
- Token may be expired (check JWT_EXPIRES_IN)

### Tests Failing
- Ensure MongoDB Memory Server is running (should start automatically)
- Check testSetup.js is configured correctly
- Clear test database between tests (handled by afterEach in testSetup.js)

## Performance Considerations

### Database Indexes
Add indexes for frequently queried fields:
```javascript
// In model definition
userSchema.index({ email: 1 });
migrationSchema.index({ clientEmail: 1 });
migrationSchema.index({ createdBy: 1 });
```

### Pagination
For large datasets, implement pagination:
```javascript
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 10;
const skip = (page - 1) * limit;

const migrations = await Migration.find()
  .skip(skip)
  .limit(limit)
  .sort({ updatedAt: -1 });
```

## Security Best Practices

- Always use HTTPS in production
- Strong JWT_SECRET (min 32 characters random)
- Rate limit auth endpoints (prevent brute force)
- Validate and sanitize all inputs
- Don't expose sensitive errors to clients
- Use helmet middleware for security headers
- Enable CORS only for trusted domains

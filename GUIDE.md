# Understanding Your Tableau Migration Checklist App

## Your Guide to the Codebase Structure

This guide is designed for someone new to React who wants to understand how this web application works, where to find things, and how to make changes safely.

---

## Table of Contents

1. [What This App Does](#what-this-app-does)
2. [The Big Picture: How Everything Connects](#the-big-picture)
3. [React Basics in This App](#react-basics-in-this-app)
4. [Finding Your Way Around](#finding-your-way-around)
5. [How Pages Connect](#how-pages-connect)
6. [Where to Change UI Elements](#where-to-change-ui-elements)
7. [How Data Flows](#how-data-flows)
8. [How to Add New Features](#how-to-add-new-features)
9. [Quick Reference: Common Tasks](#quick-reference-common-tasks)

---

## What This App Does

This is a **Tableau Cloud Migration Checklist** web application with two types of users:

- **InterWorks Consultants** (admins): Create migration projects, manage questions, oversee all clients
- **Client Users** (guests): Answer questions for their assigned migration project

Think of it like a smart survey system where consultants create custom checklists for clients to fill out during their Tableau migration process.

---

## The Big Picture: How Everything Connects

```
┌─────────────────────────────────────────────────────────────┐
│                         USER VISITS SITE                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
                  ┌─────────────┐
                  │  Login Page │ (frontend/src/pages/Login.jsx)
                  └──────┬──────┘
                         │ Credentials sent to backend
                         ▼
              ┌──────────────────────┐
              │   Backend API        │ (backend/src/routes/auth.js)
              │ Verifies & Returns   │
              │   JWT Token          │
              └──────┬───────────────┘
                     │ Token stored in browser
                     ▼
        ┌────────────────────────────┐
        │      Dashboard Page        │ (frontend/src/pages/Dashboard.jsx)
        │                            │
        │ Shows all migrations as    │
        │ cards with progress bars   │
        └────────┬──────────┬────────┘
                 │          │
      ┌──────────┘          └──────────┐
      │ Click "View"                   │ Click "New Migration"
      ▼                                ▼
┌────────────────────┐         ┌─────────────────┐
│ Migration Checklist│         │  Create Dialog  │
│      Page          │         │ (Pick a client) │
│                    │         └─────────────────┘
│ - Client Info      │
│ - 54 Questions     │
│ - Progress Bar     │
│ - Save Button      │
└────────────────────┘

For InterWorks users only:
├─ User Management Page (create/delete users)
└─ Client Management Page (manage client records)
```

---

## React Basics in This App

If you're new to React, here are the key concepts used in this codebase:

### 1. **Components** = Reusable UI Pieces

Think of components like LEGO blocks. A button is a component, a form is a component made of smaller components.

```jsx
// A simple component
function Button({ text, onClick }) {
  return <button onClick={onClick}>{text}</button>;
}

// Using it
<Button text="Save" onClick={handleSave} />
```

### 2. **Props** = Data Passed to Components

Props are like function arguments. You pass data into a component to customize it.

```jsx
<MigrationCard
  clientName="Acme Corp"
  progress={75}
/>
```

### 3. **State** = Data That Changes

State is data that can change over time (user input, loaded data, etc.). When state changes, React re-renders the component.

```jsx
const [email, setEmail] = useState('');  // email starts as empty string
setEmail('user@example.com');            // changes email, triggers re-render
```

### 4. **Hooks** = Special React Functions

Hooks let you use React features. They start with `use`:
- `useState` - Store changing data
- `useEffect` - Run code when component loads or data changes
- `useAuth` - Custom hook for login/logout (specific to this app)
- `useMigration` - Custom hook for loading/saving migrations (specific to this app)

### 5. **API Calls** = Talking to the Backend

The frontend (React) talks to the backend (Node.js) through HTTP requests:

```jsx
// Get data from backend
const response = await api.get('/migrations');
const migrations = response.data;

// Send data to backend
await api.post('/migrations', { clientId: '123' });
```

---

## Finding Your Way Around

### File Structure Overview

```
TCMApp/
├── frontend/                    # React app (what users see)
│   └── src/
│       ├── pages/              # Full pages (5 files)
│       ├── components/         # Reusable UI pieces (organized by size)
│       ├── hooks/              # Shared logic (auth, data loading)
│       └── lib/                # Utilities (API calls)
│
└── backend/                     # Node.js server (handles data)
    └── src/
        ├── routes/             # API endpoints (URLs the frontend calls)
        ├── models/             # Database structure (User, Migration)
        └── middleware/         # Security (checks if user is logged in)
```

### The "Atomic Design" Pattern

Components are organized by size/complexity:

```
ui/ (smallest)
  ↓ Basic building blocks: Button, Input, Checkbox
atoms/
  ↓ Simple components: InfoTooltip, ProgressBar
molecules/
  ↓ Combinations: QuestionCheckbox (checkbox + label + timestamp)
organisms/
  ↓ Complex features: QuestionSection (multiple questions in a collapsible section)
templates/
  ↓ Page layouts: DashboardLayout (header + content area)
pages/ (largest)
  ↓ Complete pages: Dashboard, Login, MigrationChecklist
```

**Why this matters:** If you want to change how a checkbox looks, you go to `molecules/QuestionCheckbox.jsx`. If you want to change the entire dashboard layout, you go to `pages/Dashboard.jsx`.

---

## How Pages Connect

### User Flow Diagram

```
START → Login Page
          │
          │ (after login, role check)
          ▼
        Dashboard ─────────────┐
          │                    │
          │                    │ (InterWorks only)
          │                    ▼
          │              User Management
          │              Client Management
          │
          │ (click View on a migration card)
          ▼
    Migration Checklist Page
      │
      │ - View/Edit Client Info
      │ - Answer Questions
      │ - Click Save
      │ - Export PDF (coming soon)
      │
      │ (click back/logo)
      ▼
    Dashboard
```

### Routing Configuration

Found in: `frontend/src/App.jsx`

```jsx
// Public routes (no login required)
/login → Login Page

// Protected routes (must be logged in)
/ → Dashboard
/migration/:id → MigrationChecklist (shows specific migration)
/users → UserManagement (InterWorks only)
/clients → ClientManagement (InterWorks only)
```

**How it works:**
1. `ProtectedRoute` component wraps protected pages
2. Before rendering, it checks: "Is the user logged in?"
3. If NO → Redirect to `/login`
4. If YES → Show the page
5. Extra check: If page requires InterWorks role and user is a guest → Redirect to dashboard

---

## Where to Change UI Elements

### Component Hierarchy by Feature

#### **Login Page**
```
Login.jsx (frontend/src/pages/Login.jsx)
└── Uses: Input, Button, Card from ui/
```
**To change:**
- Form layout: Lines 75-125 in `Login.jsx`
- Logo/title: Lines 80-85 in `Login.jsx`

---

#### **Dashboard**
```
Dashboard.jsx (frontend/src/pages/Dashboard.jsx)
├── Header (organism)
│   ├── Logo
│   ├── Navigation menu
│   └── User info + Logout
├── SearchFilter (molecule)
│   ├── Search input
│   └── Status dropdown
└── Migration Cards Grid
    └── MigrationCard (organism) × many
        ├── Client name
        ├── Progress bar
        └── View/Delete buttons
```

**To change:**
- Header appearance: `components/organisms/Header.jsx` (lines 15-89)
- Card layout: `components/organisms/MigrationCard.jsx` (lines 25-78)
- Grid columns: `pages/Dashboard.jsx` line 225 (currently 3 columns on desktop)
- Search bar: `components/molecules/SearchFilter.jsx`

---

#### **Migration Checklist Page**
```
MigrationChecklist.jsx (frontend/src/pages/MigrationChecklist.jsx)
├── MigrationLayout (template)
│   ├── Header (organism)
│   ├── ProgressSection (organism) - sticky
│   │   └── Shows "X/Y questions completed"
│   └── Page Header - sticky
│       ├── SearchFilter
│       └── Save Button
├── ClientInfoSection (organism)
│   └── ClientInfoField (molecule) × 8 fields
│       ├── Client Name
│       ├── Region
│       ├── Server URL
│       └── Dates, contacts, etc.
└── QuestionSection (organism) × 7 sections
    └── QuestionItem (organism) × many
        └── Renders appropriate type:
            ├── QuestionCheckbox
            ├── QuestionTextInput
            ├── QuestionDateInput
            ├── QuestionDropdown
            └── QuestionYesNo
```

**To change:**
- Client info fields: `components/organisms/ClientInfoSection.jsx` (lines 13-22)
- Question section appearance: `components/organisms/QuestionSection.jsx`
- Checkbox styling: `components/molecules/QuestionCheckbox.jsx`
- Add new question type: Create in `molecules/`, add case in `QuestionItem.jsx` (lines 32-93)
- Page layout: `components/templates/MigrationLayout.jsx`

---

#### **User Management Page**
```
UserManagement.jsx (frontend/src/pages/UserManagement.jsx)
├── Header (organism)
├── "New User" button
├── User Table
│   └── Shows email, name, role, client
└── Create User Dialog (modal)
    ├── Email field
    ├── Name field
    ├── Password field
    ├── Role selector (Guest/InterWorks)
    └── Client dropdown (for Guest users)
```

**To change:**
- Form fields: Lines 240-327 in `UserManagement.jsx`
- Table layout: Lines 171-221 in `UserManagement.jsx`
- Client selector: `components/molecules/ClientSelector.jsx`

---

### Styling with Tailwind CSS

This app uses **Tailwind CSS**, which means styling is done with class names instead of separate CSS files.

**Common patterns you'll see:**

```jsx
// Spacing
<div className="p-4">           // padding: 1rem (16px)
<div className="mt-6">          // margin-top: 1.5rem (24px)
<div className="space-y-4">     // gap between children

// Layout
<div className="flex items-center justify-between">  // flexbox
<div className="grid grid-cols-2 gap-4">            // 2-column grid

// Colors (purple theme)
<div className="bg-primary">        // purple background
<div className="text-primary">      // purple text
<div className="border-destructive"> // red border (errors)

// Responsive (mobile-first)
<div className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
     // 1 column on mobile, 2 on tablet, 3 on desktop
```

**To change the theme colors:** Edit `frontend/src/index.css` (lines with CSS variables)

---

## How Data Flows

This section explains how data moves through the app from user action to database and back.

### Authentication Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER ENTERS EMAIL + PASSWORD                             │
│    Location: Login.jsx                                       │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. FRONTEND SENDS TO BACKEND                                │
│    Code: api.post('/auth/login', { email, password })       │
│    File: hooks/useAuth.jsx (login function)                 │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. BACKEND CHECKS DATABASE                                  │
│    File: backend/src/routes/auth.js                         │
│    - Finds user by email                                    │
│    - Compares password (encrypted)                          │
│    - Creates JWT token (expires in 7 days)                  │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. FRONTEND STORES TOKEN                                    │
│    - Saves to browser localStorage                          │
│    - Token automatically added to all future requests       │
│    - User object saved (email, role, name)                  │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. USER REDIRECTED TO DASHBOARD                             │
│    Now authenticated for all protected pages                │
└─────────────────────────────────────────────────────────────┘
```

**Key files:**
- Frontend: `frontend/src/hooks/useAuth.jsx` (manages login state)
- Backend: `backend/src/routes/auth.js` (verifies credentials)
- Token storage: Browser localStorage (survives page refresh)

---

### Loading & Saving Migration Data

```
┌─────────────────────────────────────────────────────────────┐
│ USER OPENS MIGRATION CHECKLIST                              │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. COMPONENT LOADS                                          │
│    File: pages/MigrationChecklist.jsx                       │
│    Hook: useMigration(id) is called                         │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. FETCH DATA FROM BACKEND                                  │
│    Code: api.get(`/migrations/${id}`)                       │
│    File: hooks/useMigration.js (fetchMigration function)    │
│    - Token automatically attached to request                │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. BACKEND GETS FROM DATABASE                               │
│    File: backend/src/routes/migrations.js                   │
│    - Verifies user is allowed to see this migration         │
│    - Loads migration with all 54 questions                  │
│    - Calculates progress percentage                         │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. FRONTEND DISPLAYS DATA                                   │
│    - Questions rendered in sections                         │
│    - Client info shown in fields                            │
│    - Progress bar updated                                   │
└─────────────────────────────────────────────────────────────┘
         │
         │ USER ANSWERS A QUESTION
         ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. OPTIMISTIC UPDATE (IMMEDIATE)                            │
│    File: hooks/useMigration.js (updateQuestion function)    │
│    - Updates React state immediately (UI responds fast)     │
│    - Marks as "unsaved changes"                             │
│    - Does NOT send to backend yet                           │
└─────────────────────────────────────────────────────────────┘
         │
         │ USER CLICKS "SAVE" BUTTON
         ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. SAVE TO BACKEND                                          │
│    Code: api.put(`/migrations/${id}`, migration)            │
│    File: hooks/useMigration.js (saveMigration function)     │
│    - Sends entire migration object                          │
│    - Shows "Saving..." status                               │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. BACKEND SAVES TO DATABASE                                │
│    File: backend/src/routes/migrations.js (PUT route)       │
│    - Validates data                                         │
│    - Updates MongoDB document                               │
│    - Returns success                                        │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. FRONTEND CONFIRMS SAVE                                   │
│    - Shows "Saved at 2:45 PM"                               │
│    - Clears "unsaved changes" flag                          │
└─────────────────────────────────────────────────────────────┘
```

**Important concept - "Optimistic Updates":**
When you answer a question, the UI updates immediately (you see the checkbox checked right away). But the data isn't sent to the backend until you click Save. This makes the app feel fast while still giving you control over when data is saved.

---

### How API Calls Work

Every time the frontend needs data from the backend, it uses this pattern:

**Frontend (React):**
```jsx
import api from '@/lib/api';

// GET request (fetch data)
const response = await api.get('/migrations');
const migrations = response.data;

// POST request (create data)
await api.post('/migrations', { clientId: '123' });

// PUT request (update data)
await api.put('/migrations/456', { questions: [...] });

// DELETE request (remove data)
await api.delete('/migrations/789');
```

**What happens behind the scenes:**

1. **Request interceptor** (in `lib/api.js`) automatically adds the JWT token:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

2. **Backend middleware** (in `backend/src/middleware/auth.js`) verifies the token:
   - Checks token is valid and not expired
   - Loads user from database
   - Attaches user info to the request
   - If invalid: Returns 401 error → Frontend logs user out

3. **Route handler** processes the request:
   - Checks user has permission (role-based)
   - Queries/updates MongoDB
   - Returns response

---

### Where Data Lives

```
┌────────────────────────────────────────────────────────┐
│ BROWSER (Frontend)                                     │
├────────────────────────────────────────────────────────┤
│ localStorage:                                          │
│  - authToken (JWT, survives page refresh)             │
│  - user (email, role, name)                           │
│                                                        │
│ React State (lost on page refresh):                   │
│  - Current migration data                             │
│  - User input before saving                           │
│  - Loading/error states                               │
└────────────────────────────────────────────────────────┘
                         │
                         │ API calls
                         ▼
┌────────────────────────────────────────────────────────┐
│ BACKEND (Node.js/Express)                              │
├────────────────────────────────────────────────────────┤
│ Memory (temporary):                                    │
│  - Request/response objects                           │
│  - User session during request                        │
└────────────────────────────────────────────────────────┘
                         │
                         │ Database queries
                         ▼
┌────────────────────────────────────────────────────────┐
│ DATABASE (MongoDB)                                     │
├────────────────────────────────────────────────────────┤
│ Permanent storage:                                     │
│  - Users (email, password, role)                      │
│  - Migrations (client info, questions, answers)       │
│  - Clients (company information)                      │
└────────────────────────────────────────────────────────┘
```

---

## How to Add New Features

### Step-by-Step Process

#### **Example: Adding a "Due Date" field to migrations**

**1. Plan the change:**
- [ ] Where will users see it? (Dashboard cards? Checklist page?)
- [ ] Who can edit it? (InterWorks only? Or clients too?)
- [ ] What type of data? (Date picker)

**2. Update the database model:**

File: `backend/src/models/Migration.js`

```javascript
const MigrationSchema = new mongoose.Schema({
  // ... existing fields ...
  dueDate: {
    type: Date,
    required: false,  // Optional field
  },
});
```

**3. Update the API (if needed):**

File: `backend/src/routes/migrations.js`

The PUT route already saves all migration fields, so no change needed!
But if you want validation:

```javascript
// In the PUT /migrations/:id route
if (req.body.dueDate && !isValidDate(req.body.dueDate)) {
  return res.status(400).json({ error: 'Invalid due date' });
}
```

**4. Add UI component:**

File: `frontend/src/components/molecules/DueDateField.jsx` (new file)

```jsx
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';

export function DueDateField({ value, onChange, readOnly }) {
  return (
    <div className="space-y-2">
      <Label>Due Date</Label>
      <Input
        type="date"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={readOnly}
      />
    </div>
  );
}
```

**5. Add to the page:**

File: `frontend/src/components/organisms/ClientInfoSection.jsx`

```jsx
import { DueDateField } from '@/components/molecules/DueDateField';

// Inside the render:
<DueDateField
  value={clientInfo.dueDate}
  onChange={(value) => onChange('dueDate', value)}
  readOnly={readOnly}
/>
```

**6. Test:**
- [ ] Can InterWorks users set a due date?
- [ ] Does it save to the database?
- [ ] Does it show up after page refresh?
- [ ] Can client users see it (but not edit it)?

---

### General Guidelines for Adding Features

**Frontend changes:**

1. **UI-only changes** (styling, layout):
   - Modify component JSX and Tailwind classes
   - No backend changes needed

2. **New form fields**:
   - Add to appropriate molecule component
   - Update state management (useState or hook)
   - Wire up onChange handlers

3. **New pages**:
   - Create in `pages/` folder
   - Add route in `App.jsx`
   - Wrap with `ProtectedRoute` if authentication required

**Backend changes:**

1. **New data fields**:
   - Update model in `backend/src/models/`
   - Schema automatically handles saving

2. **New API endpoints**:
   - Add route in `backend/src/routes/`
   - Use `requireAuth` middleware for protected routes
   - Use `requireInterWorks` for admin-only routes

3. **New permissions**:
   - Check `req.user.role` in route handlers
   - Return 403 if not authorized

---

### Common Patterns to Follow

**1. Component Creation:**
```jsx
// Always start with imports
import { useState } from 'react';
import { Button } from '@/components/ui/Button';

// Export named component
export function MyComponent({ prop1, prop2 }) {
  // State at the top
  const [data, setData] = useState(null);

  // Event handlers
  const handleClick = () => {
    // ...
  };

  // Render
  return (
    <div>
      {/* JSX here */}
    </div>
  );
}
```

**2. API Call Pattern:**
```jsx
import api from '@/lib/api';

const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const fetchData = async () => {
  setLoading(true);
  setError(null);

  try {
    const response = await api.get('/endpoint');
    setData(response.data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

**3. Backend Route Pattern:**
```javascript
const requireAuth = require('../middleware/auth');

router.post('/endpoint', requireAuth, async (req, res) => {
  try {
    // 1. Validate input
    if (!req.body.requiredField) {
      return res.status(400).json({ error: 'Missing field' });
    }

    // 2. Check permissions
    if (req.user.role !== 'interworks') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // 3. Do the work
    const result = await Model.create(req.body);

    // 4. Return success
    res.status(201).json({ success: true, data: result });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## Quick Reference: Common Tasks

### "I want to change how something looks"

| What | Where to Look | Line Numbers |
|------|---------------|--------------|
| Login page styling | `frontend/src/pages/Login.jsx` | 75-125 |
| Dashboard card appearance | `frontend/src/components/organisms/MigrationCard.jsx` | 25-78 |
| Header (logo, menu) | `frontend/src/components/organisms/Header.jsx` | 15-89 |
| Button styles | `frontend/src/components/ui/Button.jsx` | Entire file |
| Colors (theme) | `frontend/src/index.css` | CSS variables |
| Question checkbox | `frontend/src/components/molecules/QuestionCheckbox.jsx` | 15-50 |

### "I want to change how data works"

| What | Where to Look |
|------|---------------|
| How login works | `frontend/src/hooks/useAuth.jsx` + `backend/src/routes/auth.js` |
| How migrations save | `frontend/src/hooks/useMigration.js` + `backend/src/routes/migrations.js` |
| Database structure | `backend/src/models/` (User.js, Migration.js) |
| API token handling | `frontend/src/lib/api.js` + `backend/src/middleware/auth.js` |
| Default questions | `backend/src/seeds/questionTemplate.js` |

### "I want to add something new"

| Task | Steps |
|------|-------|
| **New form field** | 1. Add to database model (backend/src/models/)<br>2. Create molecule component (frontend/src/components/molecules/)<br>3. Add to organism/page<br>4. Wire up onChange handler |
| **New question type** | 1. Create molecule in `molecules/Question*.jsx`<br>2. Add case in `organisms/QuestionItem.jsx`<br>3. Update backend validation if needed |
| **New page** | 1. Create in `pages/` folder<br>2. Add route in `App.jsx`<br>3. Add to navigation in `Header.jsx`<br>4. Create API endpoint in `backend/src/routes/` |
| **New permission level** | 1. Add role check in `backend/src/middleware/auth.js`<br>2. Update `ProtectedRoute` if needed<br>3. Add conditional rendering in components |

### "Something broke, where do I look?"

| Problem | Check These Files |
|---------|-------------------|
| Can't log in | `useAuth.jsx`, `backend/routes/auth.js`, check browser console |
| Data not saving | `useMigration.js` (saveToBackend function), backend routes |
| Page not loading | `App.jsx` (routes), `ProtectedRoute.jsx` (auth check) |
| API error | Browser Network tab, backend console, `middleware/auth.js` |
| Styling broken | Check Tailwind classes, `index.css` for custom CSS |

---

## Key Files Cheat Sheet

```
🎨 STYLING
   frontend/src/index.css                 # Theme colors, global CSS
   frontend/src/components/ui/            # Base component styles

🔐 AUTHENTICATION
   frontend/src/hooks/useAuth.jsx         # Login/logout logic
   backend/src/routes/auth.js             # Login API
   backend/src/middleware/auth.js         # Token verification

📄 PAGES
   frontend/src/pages/Login.jsx           # Login form
   frontend/src/pages/Dashboard.jsx       # Migration list
   frontend/src/pages/MigrationChecklist.jsx  # Main checklist
   frontend/src/pages/UserManagement.jsx  # Create/manage users

🧩 KEY COMPONENTS
   frontend/src/components/organisms/
   ├── Header.jsx                         # Top navigation
   ├── MigrationCard.jsx                  # Dashboard cards
   ├── QuestionSection.jsx                # Question grouping
   └── QuestionItem.jsx                   # Question type router

   frontend/src/components/molecules/
   ├── Question*.jsx                      # All question types
   ├── ClientSelector.jsx                 # Client dropdown
   └── SearchFilter.jsx                   # Search/filter UI

🔌 DATA/API
   frontend/src/hooks/useMigration.js     # Load/save migrations
   frontend/src/lib/api.js                # HTTP client (Axios)
   backend/src/routes/migrations.js       # Migration CRUD API
   backend/src/routes/users.js            # User management API

💾 DATABASE
   backend/src/models/User.js             # User schema
   backend/src/models/Migration.js        # Migration schema
   backend/src/seeds/questionTemplate.js  # Default 54 questions
```

---

## Tips for Success

1. **Always read a file before editing it**
   - Use the Read tool to see what's there
   - Understand the current structure before making changes

2. **Start small**
   - Test one change at a time
   - Make sure it works before adding more

3. **Follow existing patterns**
   - Look at how similar features are built
   - Copy the structure and adapt it

4. **Use the browser developer tools**
   - Console tab: See JavaScript errors
   - Network tab: See API calls and responses
   - Elements tab: Inspect HTML and see which component rendered what

5. **Git is your friend**
   - Commit working code before trying something new
   - You can always go back if something breaks

6. **When stuck, trace the data flow**
   - User action → Component → Hook → API → Backend → Database
   - Find where in that chain things go wrong

---

## Next Steps

Now that you understand the structure:

1. **Explore a feature you want to change** - Follow the file references to see how it works
2. **Try making a small change** - Maybe change a button label or add a form field
3. **Read the CLAUDE.md files** - There are detailed docs in `frontend/CLAUDE.md` and `backend/CLAUDE.md`
4. **Ask questions!** - If you're unsure about something, ask before making changes

You've got this! The codebase is well-organized, and now you have a map to navigate it.

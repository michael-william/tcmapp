# Frontend CLAUDE.md - Tableau Migration React App

Frontend-specific documentation for the Tableau Migration Web Application.

## Architecture Overview

**React 18 + Vite** application using **Atomic Design** pattern with **shadcn/ui** components and **Tailwind CSS**. Mock Service Worker (MSW) for API mocking in tests.

### Tech Stack
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 3.x
- **Component Library**: shadcn/ui (Radix UI primitives)
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Testing**: Vitest + React Testing Library + MSW
- **Icons**: lucide-react

### Project Structure
```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui base components
│   │   │   ├── Button.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Card.jsx
│   │   │   └── ...
│   │   ├── atoms/           # Simple building blocks
│   │   │   ├── Badge.jsx
│   │   │   ├── Tooltip.jsx
│   │   │   └── ...
│   │   ├── molecules/       # Component combinations
│   │   │   ├── QuestionCheckbox.jsx
│   │   │   ├── QuestionTextInput.jsx
│   │   │   └── ...
│   │   ├── organisms/       # Complex components
│   │   │   ├── Header.jsx
│   │   │   ├── QuestionSection.jsx
│   │   │   └── ...
│   │   └── templates/       # Page layouts
│   │       ├── AuthLayout.jsx
│   │       ├── DashboardLayout.jsx
│   │       └── ...
│   ├── pages/               # Page components
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── MigrationChecklist.jsx
│   │   └── ...
│   ├── lib/                 # Utilities
│   │   ├── utils.js        # Tailwind merge utility
│   │   └── api.js          # Axios instance
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.js
│   │   └── useMigration.js
│   ├── __tests__/           # Test files
│   │   ├── testSetup.js    # MSW and testing library setup
│   │   ├── test-utils.jsx  # Custom render functions
│   │   ├── mocks/          # MSW handlers
│   │   ├── components/     # Component tests
│   │   └── pages/          # Page tests
│   ├── App.jsx              # Main app component
│   └── main.jsx             # Entry point
├── index.html               # HTML template
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind configuration
├── postcss.config.js        # PostCSS configuration
├── package.json
└── CLAUDE.md               # This file
```

## Atomic Design System

### UI Components (`src/components/ui/`)

Base components from shadcn/ui. These are Radix UI primitives with Tailwind styling.

**Button**
```jsx
import { Button } from '@/components/ui/Button';

<Button variant="default|outline|ghost|gradient" size="default|sm|lg" onClick={handler}>
  Click me
</Button>
```
- **Props**: `variant`, `size`, `disabled`, `type`, `className`, `children`
- **Variants**: `default` (purple), `outline` (border), `ghost` (transparent), `gradient` (purple gradient)
- **Test**: `src/__tests__/components/Button.test.jsx`

**Input**
```jsx
import { Input } from '@/components/ui/Input';

<Input type="text" placeholder="Enter text" value={value} onChange={handler} />
```

**Textarea**
```jsx
import { Textarea } from '@/components/ui/Textarea';

<Textarea placeholder="Enter notes" rows={4} value={value} onChange={handler} />
```

**Checkbox**
```jsx
import { Checkbox } from '@/components/ui/Checkbox';

<Checkbox checked={checked} onCheckedChange={handler} />
```

**Label**
```jsx
import { Label } from '@/components/ui/Label';

<Label htmlFor="input-id">Label Text</Label>
```

**Select/Dropdown**
```jsx
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/Select';

<Select value={value} onValueChange={handler}>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

**RadioGroup**
```jsx
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup';

<RadioGroup value={value} onValueChange={handler}>
  <div>
    <RadioGroupItem value="yes" id="yes" />
    <Label htmlFor="yes">Yes</Label>
  </div>
  <div>
    <RadioGroupItem value="no" id="no" />
    <Label htmlFor="no">No</Label>
  </div>
</RadioGroup>
```

**Card**
```jsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

**Badge**
```jsx
import { Badge } from '@/components/ui/Badge';

<Badge variant="default|secondary|outline">Badge Text</Badge>
```

**Progress**
```jsx
import { Progress } from '@/components/ui/Progress';

<Progress value={75} /> // 0-100
```

**Tooltip**
```jsx
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/Tooltip';

<TooltipProvider>
  <Tooltip>
    <TooltipTrigger>Hover me</TooltipTrigger>
    <TooltipContent>Tooltip text</TooltipContent>
  </Tooltip>
</TooltipProvider>
```

### Atoms (`src/components/atoms/`)

Simple building blocks that combine UI components with specific styling.

Examples:
- **InfoTooltip**: Info icon with tooltip
- **SectionBadge**: Badge with progress (X/Y questions)
- **ProgressBar**: Styled progress bar with percentage

### Molecules (`src/components/molecules/`)

Component combinations for specific use cases.

**QuestionCheckbox**
```jsx
import { QuestionCheckbox } from '@/components/molecules/QuestionCheckbox';

<QuestionCheckbox
  question={question}
  checked={completed}
  onCheckedChange={handleChange}
  timestamp={timestamp}
/>
```
- Combines Checkbox + Label + timestamp display

**QuestionTextInput**
```jsx
import { QuestionTextInput } from '@/components/molecules/QuestionTextInput';

<QuestionTextInput
  question={question}
  value={answer}
  onChange={handleChange}
  onBlur={handleSave}
/>
```
- Combines Label + Textarea + auto-save

**QuestionDateInput**
```jsx
import { QuestionDateInput } from '@/components/molecules/QuestionDateInput';

<QuestionDateInput
  question={question}
  value={date}
  onChange={handleChange}
/>
```
- Combines Label + DatePicker

**QuestionDropdown**
```jsx
import { QuestionDropdown } from '@/components/molecules/QuestionDropdown';

<QuestionDropdown
  question={question}
  options={['Option 1', 'Option 2']}
  value={selectedValue}
  onChange={handleChange}
/>
```

**QuestionYesNo**
```jsx
import { QuestionYesNo } from '@/components/molecules/QuestionYesNo';

<QuestionYesNo
  question={question}
  value={answer}
  onChange={handleChange}
  options={['Yes', 'No']}
/>
```

**ClientInfoField**
```jsx
import { ClientInfoField } from '@/components/molecules/ClientInfoField';

<ClientInfoField
  label="Client Name"
  value={clientName}
  onChange={handleChange}
  readOnly={isClient}
/>
```

**SearchFilter**
```jsx
import { SearchFilter } from '@/components/molecules/SearchFilter';

<SearchFilter
  searchTerm={search}
  onSearchChange={setSearch}
  selectedSection={section}
  onSectionChange={setSection}
  selectedStatus={status}
  onStatusChange={setStatus}
/>
```

### Organisms (`src/components/organisms/`)

Complex components with multiple molecules/atoms.

**Header**
```jsx
import { Header } from '@/components/organisms/Header';

<Header
  userName="Jane Doe"
  role="interworks"
  onLogout={handleLogout}
/>
```
- Logo, title, user menu, stats

**ProgressSection**
```jsx
import { ProgressSection } from '@/components/organisms/ProgressSection';

<ProgressSection
  completed={42}
  total={54}
  percentage={78}
/>
```
- Progress bar with stats

**ClientInfoSection**
```jsx
import { ClientInfoSection } from '@/components/organisms/ClientInfoSection';

<ClientInfoSection
  clientInfo={clientInfo}
  onChange={handleChange}
  readOnly={isClient}
/>
```
- Grid of client info fields

**QuestionSection**
```jsx
import { QuestionSection } from '@/components/organisms/QuestionSection';

<QuestionSection
  section="Security"
  questions={questions}
  onQuestionChange={handleChange}
  isCollapsed={collapsed}
  onToggle={handleToggle}
/>
```
- Collapsible section with questions

**QuestionItem**
```jsx
import { QuestionItem } from '@/components/organisms/QuestionItem';

<QuestionItem
  question={question}
  onChange={handleChange}
/>
```
- Dynamic component based on question type

**MigrationCard**
```jsx
import { MigrationCard } from '@/components/organisms/MigrationCard';

<MigrationCard
  migration={migration}
  onView={handleView}
  onDelete={handleDelete}
/>
```
- Card for migration list view

**QuestionManagementModal**
```jsx
import { QuestionManagementModal } from '@/components/organisms/QuestionManagementModal';

<QuestionManagementModal
  isOpen={isOpen}
  onClose={handleClose}
  migration={migration}
  onSave={handleSave}
/>
```
- Add/edit questions (InterWorks only)

**ExportSection**
```jsx
import { ExportSection } from '@/components/organisms/ExportSection';

<ExportSection
  migration={migration}
  onExport={handleExportPDF}
/>
```
- PDF export button

### Templates (`src/components/templates/`)

Page layouts with slots for content.

**AuthLayout**
```jsx
import { AuthLayout } from '@/components/templates/AuthLayout';

<AuthLayout>
  <LoginForm />
</AuthLayout>
```
- Centered card layout for auth pages

**DashboardLayout**
```jsx
import { DashboardLayout } from '@/components/templates/DashboardLayout';

<DashboardLayout>
  <DashboardContent />
</DashboardLayout>
```
- Header + sidebar + main content area

**MigrationLayout**
```jsx
import { MigrationLayout } from '@/components/templates/MigrationLayout';

<MigrationLayout>
  <ChecklistContent />
</MigrationLayout>
```
- Full-width layout for checklist page

## Pages

### Login Page (`src/pages/Login.jsx`)
- Email and password form
- Error handling
- Redirects to dashboard on success
- Uses AuthLayout template

### Dashboard Page (`src/pages/Dashboard.jsx`)
- List of migrations (InterWorks only)
- Create migration button
- Search and filter
- Migration cards
- Uses DashboardLayout template

### Migration Checklist Page (`src/pages/MigrationChecklist.jsx`)
- Main checklist view
- Client info section
- Progress tracking
- Question sections (collapsible)
- Auto-save
- Search and filter
- Additional notes
- PDF export
- Question management (InterWorks)
- Uses MigrationLayout template

### User Management Page (`src/pages/UserManagement.jsx`)
- List users (InterWorks only)
- Create client user
- Delete user
- Uses DashboardLayout template

## Custom Hooks

### useAuth
```jsx
import { useAuth } from '@/hooks/useAuth';

const { user, login, logout, isAuthenticated, isInterWorks } = useAuth();
```
- Manages authentication state
- Provides login/logout functions
- JWT token storage

### useMigration
```jsx
import { useMigration } from '@/hooks/useMigration';

const { migration, loading, error, updateQuestion, saveMigration } = useMigration(migrationId);
```
- Fetches migration data
- Auto-save with debouncing
- Optimistic updates

## Styling

### Theme Configuration (`tailwind.config.js`)

**Purple Gradient Theme:**
- Primary: `#6633ff`
- Primary Dark: `#4616a8`
- Primary Light: `#8c66ff`

**Animations:**
- `fadeIn`: Fade in effect (0.3s)
- `slideDown`: Slide down effect (0.3s)
- `shimmer`: Loading shimmer effect (2s loop)

**Usage:**
```jsx
<div className="bg-primary text-primary-foreground">
  Purple background
</div>

<div className="bg-gradient-to-r from-primary to-primary-dark">
  Purple gradient
</div>

<div className="animate-fadeIn">
  Fade in animation
</div>
```

### Utility Function (`src/lib/utils.js`)

**cn() - Class Name Merger:**
```jsx
import { cn } from '@/lib/utils';

<div className={cn(
  'base-class',
  isActive && 'active-class',
  className
)}>
  Content
</div>
```
- Merges Tailwind classes
- Resolves conflicts (last class wins)
- Supports conditional classes

## API Integration

### Axios Instance (`src/lib/api.js`)

```jsx
import api from '@/lib/api';

// Automatic JWT token attachment
const response = await api.get('/migrations');
const data = await api.post('/migrations', migrationData);
```

**Features:**
- Base URL from environment variable
- Automatic JWT token from localStorage
- Error interceptors
- Request/response transformations

## How to Run Tests

### Run All Tests with Coverage
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Open Vitest UI
```bash
npm run test:ui
```

### Run Specific Test File
```bash
npm test Button.test.jsx
```

### Coverage Report
Coverage reports are generated in `coverage/` directory.

## Testing Patterns

### Component Test Example
```jsx
import { render, screen } from '../test-utils';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('renders with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles clicks', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={handleClick}>Click</Button>);
    await user.click(screen.getByText('Click'));

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Page Test with MSW
```jsx
import { render, screen, waitFor } from '../test-utils';
import { Dashboard } from '@/pages/Dashboard';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

describe('Dashboard Page', () => {
  it('loads and displays migrations', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('Test Migration')).toBeInTheDocument();
    });
  });

  it('handles API errors', async () => {
    server.use(
      http.get('/api/migrations', () => {
        return HttpResponse.json(
          { error: 'Failed to load' },
          { status: 500 }
        );
      })
    );

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });
});
```

### Custom Render with Router
```jsx
import { renderWithRouter } from '../test-utils';

renderWithRouter(<Component />, { route: '/dashboard' });
```

## MSW Mock Handlers (`src/__tests__/mocks/handlers.js`)

Add new API mocks:
```javascript
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/migrations', () => {
    return HttpResponse.json({
      success: true,
      migrations: [mockMigration1, mockMigration2],
    });
  }),

  http.post('/api/migrations', async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      success: true,
      migration: { ...body, _id: 'new-id' },
    }, { status: 201 });
  }),
];
```

## Common Development Tasks

### Add New Component
1. Create component file in appropriate directory
2. Use `cn()` utility for className merging
3. Export component
4. Create test file in `src/__tests__/components/`
5. Run tests: `npm test`

### Add New Page
1. Create page component in `src/pages/`
2. Add route in `App.jsx`
3. Use appropriate template layout
4. Create test file in `src/__tests__/pages/`
5. Add MSW handlers for API calls
6. Run tests: `npm test`

### Add shadcn/ui Component
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
# etc.
```

### Add Custom Hook
1. Create hook file in `src/hooks/`
2. Use `use` prefix (e.g., `useAuth`)
3. Return stateful values and functions
4. Test in component tests

## Environment Variables

Create `.env` file in frontend root:
```
VITE_API_URL=http://localhost:5000/api
```

Access in code:
```javascript
const apiUrl = import.meta.env.VITE_API_URL;
```

## Build and Deploy

### Development Build
```bash
npm run dev
```

### Production Build
```bash
npm run build
```
- Output: `dist/` directory
- Optimized and minified

### Preview Production Build
```bash
npm run preview
```

### Docker Build
See `Dockerfile` in frontend directory.

## Accessibility

### Best Practices
- Use semantic HTML
- Provide labels for form inputs
- Include aria-labels where needed
- Keyboard navigation support
- Focus indicators
- Color contrast (WCAG AA)

### Testing Accessibility
```jsx
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('should have no accessibility violations', async () => {
  const { container } = render(<Component />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## Performance Optimization

### Code Splitting
```jsx
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));

<Suspense fallback={<Loading />}>
  <Dashboard />
</Suspense>
```

### Memoization
```jsx
import { memo, useMemo, useCallback } from 'react';

const Component = memo(({ data }) => {
  const processedData = useMemo(() => expensiveOperation(data), [data]);
  const handleClick = useCallback(() => doSomething(), []);

  return <div>{processedData}</div>;
});
```

### Debouncing (Auto-save)
```jsx
import { debounce } from 'lodash';

const debouncedSave = useMemo(
  () => debounce((data) => saveMigration(data), 1000),
  [saveMigration]
);
```

## Common Issues

### "Cannot find module '@/...'"
- Check `vite.config.js` has correct alias configuration
- Restart Vite dev server

### Component not rendering
- Check component export/import
- Verify props are passed correctly
- Check React DevTools

### Tests failing with "element not found"
- Use `waitFor` for async operations
- Check MSW handlers are configured
- Verify test data matches expectations

### Styles not applying
- Check Tailwind config includes all content paths
- Verify PostCSS is configured
- Clear browser cache

## Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [React Testing Library](https://testing-library.com/react)
- [MSW Documentation](https://mswjs.io)

/**
 * MSW Request Handlers
 *
 * Mock API responses for testing.
 */

import { http, HttpResponse } from 'msw';

const API_URL = 'http://localhost:3000/api';

// Mock client data
const mockClient = {
  _id: '507f1f77bcf86cd799439010',
  name: 'Test Client Company',
  email: 'contact@testclient.com',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Mock user data
const mockUser = {
  _id: '507f1f77bcf86cd799439011',
  email: 'test@interworks.com',
  name: 'Test User',
  role: 'interworks',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockGuestUser = {
  _id: '507f1f77bcf86cd799439012',
  email: 'guest@example.com',
  name: 'Guest User',
  role: 'guest',
  clientIds: [mockClient],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockToken = 'mock-jwt-token-for-testing';

// Mock migration data
const mockMigration = {
  _id: 'migration-123',
  clientId: mockClient,
  clientInfo: {
    clientName: 'Acme Corporation',
    region: 'US-West',
    serverVersion: '2023.1',
    serverUrl: 'https://tableau.acme.com',
    kickoffDate: '2024-05-01',
    primaryContact: 'John Doe',
    meetingCadence: 'Weekly',
    goLiveDate: '2024-06-15',
  },
  questions: [
    {
      id: 'q4',
      section: 'Communications',
      questionType: 'checkbox',
      questionText: 'Has an internal communication strategy been confirmed?',
      helpText: 'Has the wording and audience been formally agreed',
      completed: false,
      order: 4,
      metadata: {},
    },
    {
      id: 'q5',
      section: 'Communications',
      questionType: 'checkbox',
      questionText: 'Communication assistance offered?',
      helpText: 'InterWorks can provide a Communication Strategy document with examples',
      completed: true,
      completedAt: new Date().toISOString(),
      order: 5,
      metadata: {},
    },
    {
      id: 'q6',
      section: 'Communications',
      questionType: 'checkbox',
      questionText: 'Have resources been requested and assigned internally?',
      helpText: 'Internal Power Users should be made available during the migration process should any issues or updates arise. Additional, Users should also be made available for internal testing purposes once assets have been moved',
      completed: false,
      order: 6,
      metadata: {},
    },
    {
      id: 'q10',
      section: 'Access & Connectivity',
      questionType: 'checkbox',
      questionText: 'Has the jumpbox been built to a required specification?',
      helpText: 'Ideally 8 Core, 32GB RAM with disk space over the current filestore size. TCMA can provide estimated volume necessary',
      completed: false,
      order: 10,
      metadata: {},
    },
    {
      id: 'q17',
      section: 'Tableau Server',
      questionType: 'checkbox',
      questionText: 'Are PAT tokens enabled on Tableau Server?',
      helpText: 'PAT tokens allow programmatic access to Tableau Server. These may be turned off',
      completed: false,
      order: 17,
      metadata: {},
    },
    {
      id: 'q20',
      section: 'Tableau Server',
      questionType: 'checkbox',
      questionText: 'Is there a time delay for client to review Runbook?',
      helpText: 'Client can spend time to reduce migration content or if housekeeping has been carried out, then we can migrate all assets',
      completed: false,
      order: 20,
      metadata: {},
    },
    {
      id: 'q1',
      section: 'Security',
      questionType: 'checkbox',
      questionText: 'SecOps are aware of the migration and have signed this off? Confirm',
      completed: false,
      order: 1,
      metadata: {},
    },
    {
      id: 'q2',
      section: 'Security',
      questionType: 'checkbox',
      questionText: 'Has data connectivity and access to data sources been confirmed?',
      completed: false,
      order: 2,
      metadata: {},
    },
  ],
  createdBy: mockUser._id,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const clients = [mockClient];
const migrations = [mockMigration];
const users = [mockUser, mockGuestUser];

export const handlers = [
  // Auth - Register
  http.post(`${API_URL}/auth/register`, async ({ request }) => {
    const body = await request.json();

    if (body.email === 'existing@interworks.com') {
      return HttpResponse.json(
        {
          success: false,
          message: 'User with this email already exists.',
        },
        { status: 400 }
      );
    }

    return HttpResponse.json(
      {
        success: true,
        message: 'User registered successfully.',
        token: mockToken,
        user: {
          ...mockUser,
          email: body.email,
          name: body.name,
          role: body.role || 'guest',
        },
      },
      { status: 201 }
    );
  }),

  // Auth - Login
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const body = await request.json();

    if (body.email === 'test@interworks.com' && body.password === 'Password123!') {
      return HttpResponse.json({
        success: true,
        message: 'Login successful.',
        token: mockToken,
        user: mockUser,
      });
    }

    return HttpResponse.json(
      {
        success: false,
        message: 'Invalid email or password.',
      },
      { status: 401 }
    );
  }),

  // Auth - Get current user
  http.get(`${API_URL}/auth/me`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Authentication required.',
        },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      success: true,
      user: mockUser,
    });
  }),

  // Clients - List all
  http.get(`${API_URL}/clients`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Authentication required.',
        },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      success: true,
      clients: clients,
    });
  }),

  // Clients - Get single
  http.get(`${API_URL}/clients/:id`, ({ request, params }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Authentication required.',
        },
        { status: 401 }
      );
    }

    const client = clients.find((c) => c._id === params.id);

    if (!client) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Client not found.',
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      client: client,
    });
  }),

  // Clients - Create new
  http.post(`${API_URL}/clients`, async ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Authentication required.',
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Check if email already exists
    if (clients.find((c) => c.email === body.email)) {
      return HttpResponse.json(
        {
          success: false,
          message: 'A client with this email already exists.',
        },
        { status: 400 }
      );
    }

    const newClient = {
      _id: `client-${Date.now()}`,
      name: body.name,
      email: body.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    clients.push(newClient);

    return HttpResponse.json(
      {
        success: true,
        client: newClient,
      },
      { status: 201 }
    );
  }),

  // Clients - Update
  http.put(`${API_URL}/clients/:id`, async ({ request, params }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Authentication required.',
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const clientIndex = clients.findIndex((c) => c._id === params.id);

    if (clientIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Client not found.',
        },
        { status: 404 }
      );
    }

    clients[clientIndex] = {
      ...clients[clientIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json({
      success: true,
      client: clients[clientIndex],
    });
  }),

  // Clients - Delete
  http.delete(`${API_URL}/clients/:id`, ({ request, params }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Authentication required.',
        },
        { status: 401 }
      );
    }

    const clientIndex = clients.findIndex((c) => c._id === params.id);

    if (clientIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Client not found.',
        },
        { status: 404 }
      );
    }

    clients.splice(clientIndex, 1);

    return HttpResponse.json({
      success: true,
      message: 'Client deleted successfully.',
    });
  }),

  // Migrations - List all
  http.get(`${API_URL}/migrations`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Authentication required.',
        },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      success: true,
      migrations: migrations,
    });
  }),

  // Migrations - Create new
  http.post(`${API_URL}/migrations`, async ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Authentication required.',
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    const newMigration = {
      ...mockMigration,
      _id: `migration-${Date.now()}`,
      clientId: body.clientId || mockClient._id,
      clientInfo: body.clientInfo || {},
      questions: body.questions || mockMigration.questions,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    migrations.push(newMigration);

    return HttpResponse.json(
      {
        success: true,
        message: 'Migration created successfully.',
        migration: newMigration,
      },
      { status: 201 }
    );
  }),

  // Migrations - Get single
  http.get(`${API_URL}/migrations/:id`, ({ request, params }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Authentication required.',
        },
        { status: 401 }
      );
    }

    const migration = migrations.find((m) => m._id === params.id);

    if (!migration) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Migration not found.',
        },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      success: true,
      migration: migration,
    });
  }),

  // Migrations - Update
  http.put(`${API_URL}/migrations/:id`, async ({ request, params }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Authentication required.',
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const migrationIndex = migrations.findIndex((m) => m._id === params.id);

    if (migrationIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Migration not found.',
        },
        { status: 404 }
      );
    }

    migrations[migrationIndex] = {
      ...migrations[migrationIndex],
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json({
      success: true,
      message: 'Migration updated successfully.',
      migration: migrations[migrationIndex],
    });
  }),

  // Migrations - Delete
  http.delete(`${API_URL}/migrations/:id`, ({ request, params }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Authentication required.',
        },
        { status: 401 }
      );
    }

    const migrationIndex = migrations.findIndex((m) => m._id === params.id);

    if (migrationIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Migration not found.',
        },
        { status: 404 }
      );
    }

    migrations.splice(migrationIndex, 1);

    return HttpResponse.json({
      success: true,
      message: 'Migration deleted successfully.',
    });
  }),

  // Users - List all
  http.get(`${API_URL}/users`, ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Authentication required.',
        },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const clientId = url.searchParams.get('clientId');
    const role = url.searchParams.get('role');

    let filteredUsers = [...users];

    // Filter by clientId
    if (clientId) {
      filteredUsers = filteredUsers.filter(u =>
        u.clientIds?.some(c => (c._id || c) === clientId) || u.role === 'interworks'
      );
    }

    // Filter by role
    if (role) {
      filteredUsers = filteredUsers.filter(u => u.role === role);
    }

    return HttpResponse.json({
      success: true,
      users: filteredUsers,
      count: filteredUsers.length,
    });
  }),

  // Users - Create new
  http.post(`${API_URL}/users`, async ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Authentication required.',
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Check if email already exists
    if (users.find((u) => u.email === body.email)) {
      return HttpResponse.json(
        {
          success: false,
          message: 'User with this email already exists.',
        },
        { status: 400 }
      );
    }

    // Validate based on role
    if (body.role === 'guest' && (!body.clientIds || body.clientIds.length === 0)) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Guest users must be assigned to at least one client.',
        },
        { status: 400 }
      );
    }

    const newUser = {
      _id: `user-${Date.now()}`,
      name: body.name,
      email: body.email,
      role: body.role || 'guest',
      ...(body.clientIds && body.clientIds.length > 0 && {
        clientIds: body.clientIds.map(id => clients.find(c => c._id === id) || { _id: id })
      }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(newUser);

    return HttpResponse.json(
      {
        success: true,
        message: 'User created successfully.',
        user: newUser,
      },
      { status: 201 }
    );
  }),

  // Users - Update
  http.put(`${API_URL}/users/:id`, async ({ request, params }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Authentication required.',
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const userIndex = users.findIndex((u) => u._id === params.id);

    if (userIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          message: 'User not found.',
        },
        { status: 404 }
      );
    }

    // Validate based on role
    if (body.role === 'guest' && (!body.clientIds || body.clientIds.length === 0)) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Guest users must be assigned to at least one client.',
        },
        { status: 400 }
      );
    }

    // Update user
    const updatedUser = {
      ...users[userIndex],
      name: body.name || users[userIndex].name,
      email: body.email || users[userIndex].email,
      role: body.role || users[userIndex].role,
      updatedAt: new Date().toISOString(),
    };

    // Update clientIds if provided
    if (body.clientIds !== undefined) {
      if (body.clientIds.length > 0) {
        updatedUser.clientIds = body.clientIds.map(id =>
          clients.find(c => c._id === id) || { _id: id }
        );
      } else {
        updatedUser.clientIds = [];
      }
    }

    users[userIndex] = updatedUser;

    return HttpResponse.json({
      success: true,
      message: 'User updated successfully.',
      user: updatedUser,
    });
  }),

  // Migrations - Add Question
  http.post(`${API_URL}/migrations/:id/questions`, async ({ request, params }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Authentication required.',
        },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body.section || !body.questionText) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Section and questionText are required.',
        },
        { status: 400 }
      );
    }

    // Generate new question with unique ID and questionKey
    const newQuestion = {
      id: `q${mockMigration.questions.length + 1}`,
      questionKey: `${body.section.toLowerCase().replace(/\s+/g, '_')}_new_question`,
      section: body.section,
      questionText: body.questionText,
      questionType: body.questionType || 'checkbox',
      options: body.options || [],
      answer: null,
      completed: false,
      order: mockMigration.questions.length + 1,
      metadata: body.metadata || {},
      helpText: body.helpText || '',
    };

    if (body.helpText) {
      newQuestion.metadata.infoTooltip = body.helpText;
    }

    // Add to mock migration
    mockMigration.questions.push(newQuestion);

    return HttpResponse.json(
      {
        success: true,
        message: 'Question added successfully.',
        migration: {
          ...mockMigration,
          progress: {
            total: mockMigration.questions.length,
            completed: mockMigration.questions.filter((q) => q.completed).length,
            percentage: Math.round(
              (mockMigration.questions.filter((q) => q.completed).length /
                mockMigration.questions.length) *
                100
            ),
          },
        },
      },
      { status: 201 }
    );
  }),

  // Users - Delete
  http.delete(`${API_URL}/users/:id`, ({ request, params }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return HttpResponse.json(
        {
          success: false,
          message: 'Authentication required.',
        },
        { status: 401 }
      );
    }

    const userIndex = users.findIndex((u) => u._id === params.id);

    if (userIndex === -1) {
      return HttpResponse.json(
        {
          success: false,
          message: 'User not found.',
        },
        { status: 404 }
      );
    }

    const user = users[userIndex];
    const url = new URL(request.url);
    const forceDelete = url.searchParams.get('force') === 'true';

    // Simulate InterWorks user with migrations (requires confirmation)
    if (user.role === 'interworks' && user.email === 'test@interworks.com' && !forceDelete) {
      return HttpResponse.json(
        {
          success: false,
          message: 'This InterWorks user has created migrations. Deleting will reassign those migrations.',
          requiresForce: true,
        },
        { status: 409 }
      );
    }

    users.splice(userIndex, 1);

    return HttpResponse.json({
      success: true,
      message: 'User deleted successfully.',
    });
  }),
];

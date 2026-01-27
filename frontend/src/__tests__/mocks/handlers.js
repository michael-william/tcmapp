/**
 * MSW Request Handlers
 *
 * Mock API responses for testing.
 */

import { http, HttpResponse } from 'msw';

const API_URL = 'http://localhost:5000/api';

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
  clientId: mockClient,
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
    projectName: 'Q2 2024 Migration',
    contactName: 'John Doe',
    contactEmail: 'john@acme.com',
    currentTableauVersion: '2023.1',
    targetTableauVersion: '2024.1',
    migrationDate: '2024-06-15',
    environment: 'Production',
  },
  questions: [
    {
      _id: 'q1',
      section: 'Security',
      questionType: 'checkbox',
      questionText: 'Have you reviewed security requirements?',
      helpText: 'Ensure all security protocols are documented',
      completed: true,
      completedAt: new Date().toISOString(),
    },
    {
      _id: 'q2',
      section: 'Security',
      questionType: 'yesNo',
      questionText: 'Is SSL/TLS configured?',
      options: ['Yes', 'No'],
      answer: 'Yes',
      completed: true,
    },
    {
      _id: 'q3',
      section: 'Infrastructure',
      questionType: 'textInput',
      questionText: 'Describe your current infrastructure',
      answer: '',
      completed: false,
    },
    {
      _id: 'q4',
      section: 'Infrastructure',
      questionType: 'dateInput',
      questionText: 'When is the planned migration date?',
      answer: '',
      completed: false,
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

    return HttpResponse.json({
      success: true,
      users: users,
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

    const newUser = {
      _id: `user-${Date.now()}`,
      name: body.name,
      email: body.email,
      role: body.role || 'guest',
      clientId: body.clientId || mockClient._id,
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

    users.splice(userIndex, 1);

    return HttpResponse.json({
      success: true,
      message: 'User deleted successfully.',
    });
  }),
];

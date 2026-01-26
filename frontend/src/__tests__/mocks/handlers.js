/**
 * MSW Request Handlers
 *
 * Mock API responses for testing.
 */

import { http, HttpResponse } from 'msw';

const API_URL = 'http://localhost:5000/api';

// Mock user data
const mockUser = {
  _id: '507f1f77bcf86cd799439011',
  email: 'test@interworks.com',
  name: 'Test User',
  role: 'interworks',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockClientUser = {
  _id: '507f1f77bcf86cd799439012',
  email: 'client@example.com',
  name: 'Client User',
  role: 'client',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockToken = 'mock-jwt-token-for-testing';

// Mock migration data
const mockMigration = {
  _id: 'migration-123',
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

const migrations = [mockMigration];
const users = [mockUser, mockClientUser];

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
          role: body.role || 'client',
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
      role: body.role || 'client',
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

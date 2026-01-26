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

const mockToken = 'mock-jwt-token-for-testing';

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
      migrations: [],
    });
  }),
];

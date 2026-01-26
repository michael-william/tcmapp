/**
 * useAuth Hook Tests
 *
 * Tests for the authentication hook.
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/hooks/useAuth.jsx';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';
import { mockLocalStorage } from '../test-utils';

// Mock localStorage
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

// Wrapper component for testing hooks
const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

describe('useAuth Hook', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  describe('Initial State', () => {
    it('should initialize with no user when localStorage is empty', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let userData;
      await act(async () => {
        userData = await result.current.login('test@interworks.com', 'Password123!');
      });

      expect(userData.email).toBe('test@interworks.com');
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toBeDefined();
      expect(mockLocalStorage.getItem('authToken')).toBe('mock-jwt-token-for-testing');
    });

    it('should throw error on invalid credentials', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        act(async () => {
          await result.current.login('wrong@email.com', 'WrongPassword');
        })
      ).rejects.toThrow();

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

  describe('register', () => {
    it('should register successfully', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const userData = {
        email: 'newuser@interworks.com',
        password: 'Password123!',
        name: 'New User',
        role: 'interworks',
      };

      let registeredUser;
      await act(async () => {
        registeredUser = await result.current.register(userData);
      });

      expect(registeredUser.email).toBe('newuser@interworks.com');
      expect(result.current.isAuthenticated).toBe(true);
      expect(mockLocalStorage.getItem('authToken')).toBeDefined();
    });
  });

  describe('logout', () => {
    it('should logout user', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // First login
      await act(async () => {
        await result.current.login('test@interworks.com', 'Password123!');
      });

      expect(result.current.isAuthenticated).toBe(true);

      // Then logout
      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(mockLocalStorage.getItem('authToken')).toBeNull();
      expect(mockLocalStorage.getItem('user')).toBeNull();
    });
  });

  describe('isInterWorks', () => {
    it('should return true for InterWorks user after login', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await act(async () => {
        await result.current.login('test@interworks.com', 'Password123!');
      });

      expect(result.current.isInterWorks()).toBe(true);
    });

    it('should return false when no user', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.isInterWorks()).toBe(false);
    });
  });

  describe('getCurrentUser', () => {
    it('should fetch current user with valid token', async () => {
      mockLocalStorage.setItem('authToken', 'mock-token');

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      let userData;
      await act(async () => {
        userData = await result.current.getCurrentUser();
      });

      expect(userData.email).toBe('test@interworks.com');
      expect(result.current.isAuthenticated).toBe(true);
    });
  });
});

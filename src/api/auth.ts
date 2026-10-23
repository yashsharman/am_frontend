import { apiClient } from './client';
import type { AuthTokens, LoginCredentials, User } from '../types';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<{ tokens: AuthTokens; user: User }> => {
    const { data } = await apiClient.post('/auth/login', {
      email: credentials.email,
      password: credentials.password,
    });

    const tokens: AuthTokens = {
      access: data.access_token,
      refresh: data.refresh_token,
    };

    // Fetch user details using the newly acquired access token
    const userRes = await apiClient.get('/auth/me', {
      headers: { Authorization: `Bearer ${tokens.access}` },
    });

    return { tokens, user: userRes.data };
  },

  refreshToken: async (refresh: string): Promise<AuthTokens> => {
    const { data } = await apiClient.post('/auth/refresh', {
      refresh_token: refresh,
    });
    return {
      access: data.access_token,
      refresh: data.refresh_token || refresh,
    };
  },

  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get('/auth/me');
    return data;
  },

  logout: async (refreshToken?: string): Promise<void> => {
    if (refreshToken) {
      try {
        await apiClient.post('/auth/logout', { refresh_token: refreshToken });
      } catch {
        // ignore logout errors
      }
    }
  },
};

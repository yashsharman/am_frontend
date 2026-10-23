import { useAuthStore } from '../stores/authStore';
import { authApi } from '../api/auth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import toast from 'react-hot-toast';

export function useAuth() {
  const { user, isAuthenticated, logout: storeLogout, setTokens, setUser } = useAuthStore();
  const queryClient = useQueryClient();

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setTokens(data.tokens.access, data.tokens.refresh);
      setUser(data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
    },
    onError: (err: unknown) => {
      const axiosErr = err as AxiosError<{ detail?: string | Array<{ msg?: string; loc?: string[] }> }>;
      let message = 'Login failed';
      if (axiosErr.response?.data?.detail) {
        if (typeof axiosErr.response.data.detail === 'string') {
          message = axiosErr.response.data.detail;
        } else if (Array.isArray(axiosErr.response.data.detail)) {
          message = axiosErr.response.data.detail.map((d) => d.msg || JSON.stringify(d)).join(', ');
        } else {
          message = JSON.stringify(axiosErr.response.data.detail);
        }
      } else if (axiosErr.message === 'Network Error') {
        message = 'Network error: Cannot reach server (check CORS or connection)';
      } else if (axiosErr.message) {
        message = axiosErr.message;
      }
      toast.error(message);
    },
  });

  const logout = () => {
    storeLogout();
    queryClient.clear();
    toast.success('Logged out successfully');
  };

  return {
    user,
    isAuthenticated,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    logout,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
  };
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['me'],
    queryFn: authApi.getMe,
    enabled: useAuthStore.getState().isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

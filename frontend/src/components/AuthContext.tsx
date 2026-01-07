import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface User {
  id: number;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const exp = payload.exp * 1000;
          if (Date.now() >= exp) {
            // Token expired, try refresh
            await refreshToken();
          } else {
            setUser({
              id: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
              email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
              role: payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role']
            });
          }
        } catch (error) {
          console.error('Invalid token');
          logout();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email: string, password: string) => {
    const response = await axios.post('http://localhost:5255/api/auth/login', { email, password });
    const accessToken = response.data.accessToken;
    localStorage.setItem('token', accessToken);
    setToken(accessToken);
  };

  const register = async (email: string, password: string) => {
    await axios.post('http://localhost:5255/api/auth/register', { email, password });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    // Call logout endpoint
    axios.post('http://localhost:5255/api/auth/logout', {}, { withCredentials: true }).catch(() => {});
  };

  const refreshToken = async () => {
    try {
      const response = await axios.post('http://localhost:5255/api/auth/refresh', {}, { withCredentials: true });
      const newToken = response.data.accessToken;
      localStorage.setItem('token', newToken);
      setToken(newToken);
      return newToken;
    } catch (error) {
      logout();
      throw error;
    }
  };

  // Axios interceptor for adding token
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, [token]);

  // Axios interceptor for refresh token on 401
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && token) {
          try {
            const refreshResponse = await axios.post('http://localhost:5255/api/auth/refresh', {}, { withCredentials: true });
            const newToken = refreshResponse.data.accessToken;
            localStorage.setItem('token', newToken);
            setToken(newToken);
            // Retry original request
            error.config.headers.Authorization = `Bearer ${newToken}`;
            return axios(error.config);
          } catch (refreshError) {
            logout();
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [token]);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
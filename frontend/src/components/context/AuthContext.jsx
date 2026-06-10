import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// API URL - Should match the one used in Community.jsx
const API_URL = 'http://localhost:8000';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);

  // Load user and token from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
        
        // Verify token is still valid
        verifyToken(storedToken);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        // Clear invalid data
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    
    setLoading(false);
  }, []);

  // Verify the token is still valid
  const verifyToken = async (authToken) => {
    try {
      await axios.get(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      // Token is valid, nothing to do
    } catch (error) {
      console.error('Token verification failed:', error);
      // If token is invalid, log user out
      logout();
    }
  };

  // Register a new user
  const register = async (username, email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        username,
        email,
        password
      });

      if (response.data.success) {
        // Store user and token
        setUser(response.data.user);
        setToken(response.data.token);
        
        // Save to localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token);
        
        return { success: true, user: response.data.user };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Registration failed. Please try again.' 
      };
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password
      });

      if (response.data.success) {
        // Store user and token
        setUser(response.data.user);
        setToken(response.data.token);
        
        // Save to localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('token', response.data.token);
        
        return { success: true, user: response.data.user };
      }
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Login failed. Please try again.' 
      };
    }
  };

  // Logout user
  const logout = () => {
    // Clear state
    setUser(null);
    setToken('');
    
    // Clear localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const response = await axios.patch(
        `${API_URL}/api/auth/me`,
        userData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Update user in state and localStorage
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.error || 'Failed to update profile. Please try again.' 
      };
    }
  };

  // Check if token is expiring soon and refresh if needed
  const checkTokenExpiration = async () => {
    // This is a placeholder - in a real app you would decode the JWT and check its expiration
    // For now, we'll just verify the token is still valid
    if (token) {
      try {
        await verifyToken(token);
      } catch (error) {
        console.error('Token verification failed during expiration check:', error);
      }
    }
  };

  // Set up periodic token check
  useEffect(() => {
    // Check token every 10 minutes
    const tokenCheckInterval = setInterval(() => {
      checkTokenExpiration();
    }, 10 * 60 * 1000);

    return () => clearInterval(tokenCheckInterval);
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        register,
        login,
        logout,
        updateProfile,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthContext;
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'https://gaurishankarportfolio.onrender.com';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
        
        
        verifyToken(storedToken);
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    
    setLoading(false);
  }, []);

  
  const verifyToken = async (authToken) => {
    try {
      await axios.get(`${API_URL}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
    } catch (error) {
      console.error('Token verification failed:', error);
      
      logout();
    }
  };

  
  const register = async (username, email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        username,
        email,
        password
      });

      if (response.data.success) {
        
        setUser(response.data.user);
        setToken(response.data.token);
        
        
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

  
  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password
      });

      if (response.data.success) {
        
        setUser(response.data.user);
        setToken(response.data.token);
        
        
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

  
  const logout = () => {
    
    setUser(null);
    setToken('');
    
    
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  
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

  
  const checkTokenExpiration = async () => {
    
    
    if (token) {
      try {
        await verifyToken(token);
      } catch (error) {
        console.error('Token verification failed during expiration check:', error);
      }
    }
  };

  
  useEffect(() => {
    
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
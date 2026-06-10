const axios = require('axios');

// Create an authentication service object instead of React context
const authService = (() => {
  let user = null;
  let token = null;
  
  // Load token from environment or configuration
  try {
    token = process.env.AUTH_TOKEN;
  } catch (error) {
    console.log('No token found in environment');
  }
  
  // Set up axios interceptor for authentication
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }
  
  // Initialize user data if token exists
  const initialize = async () => {
    if (token) {
      try {
        const response = await axios.get('/api/users/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        user = response.data;
      } catch (error) {
        console.error('Failed to fetch user:', error);
        token = null;
        delete axios.defaults.headers.common['Authorization'];
      }
    }
    return user;
  };
  
  const register = async (username, email, password) => {
    try {
      const response = await axios.post('/api/users/register', {
        username,
        email,
        password
      });
      
      const { token: newToken, user: userData } = response.data;
      token = newToken;
      user = userData;
      
      // Set token in axios defaults
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return userData;
    } catch (error) {
      throw error.response?.data || { error: 'Registration failed' };
    }
  };
  
  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/users/login', {
        email,
        password
      });
      
      const { token: newToken, user: userData } = response.data;
      token = newToken;
      user = userData;
      
      // Set token in axios defaults
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      return userData;
    } catch (error) {
      throw error.response?.data || { error: 'Login failed' };
    }
  };
  
  const logout = () => {
    token = null;
    user = null;
    delete axios.defaults.headers.common['Authorization'];
  };
  
  const updateProfile = async (userData) => {
    try {
      const response = await axios.patch('/api/users/profile', userData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      user = response.data;
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Profile update failed' };
    }
  };
  
  const getUser = () => user;
  const getToken = () => token;
  const isAuthenticated = () => !!token;
  
  return {
    initialize,
    register,
    login,
    logout,
    updateProfile,
    getUser,
    getToken,
    isAuthenticated
  };
})();

module.exports = authService;
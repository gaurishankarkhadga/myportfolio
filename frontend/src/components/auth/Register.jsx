import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Register.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await register(username, email, password);
      navigate('/');
    } catch (err) {
      setError(err.error || 'Failed to register');
    }
  };

  return (
    <div className="auth-register-container">
      <div className="auth-register-card">
        <div className="auth-register-header">
          <h1 className="auth-register-title">Create Account</h1>
          <p className="auth-register-subtitle">Join our community today</p>
        </div>
        
        {error && (
          <div className="auth-register-error">
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-register-form">
          <div className="auth-register-input-group">
            <div className="auth-register-input-wrapper">
              <User className="auth-register-input-icon" size={20} />
              <input
                type="text"
                id="username"
                className="auth-register-input"
                placeholder="Username"
                required
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>
          
          <div className="auth-register-input-group">
            <div className="auth-register-input-wrapper">
              <Mail className="auth-register-input-icon" size={20} />
              <input
                type="email"
                id="email"
                className="auth-register-input"
                placeholder="Email Address"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
          
          <div className="auth-register-input-group">
            <div className="auth-register-input-wrapper">
              <Lock className="auth-register-input-icon" size={20} />
              <input
                type="password"
                id="password"
                className="auth-register-input"
                placeholder="Password"
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
          
          <div className="auth-register-input-group">
            <div className="auth-register-input-wrapper">
              <CheckCircle className="auth-register-input-icon" size={20} />
              <input
                type="password"
                id="confirmPassword"
                className="auth-register-input"
                placeholder="Confirm Password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          
          <button type="submit" className="auth-register-button">
            <span>Create Account</span>
            <ArrowRight size={18} />
          </button>
          
          <div className="auth-register-links">
            <Link to="/login" className="auth-register-signin-link">
              Already have an account? <span>Sign In</span>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
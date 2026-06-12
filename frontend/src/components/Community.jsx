import { useState, useEffect, useRef } from 'react';
import { useAuth } from './context/AuthContext';
import { Send, MessageSquare, Users, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import './Community.css';

const API_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || 'https://gaurishankarportfolio.onrender.com';

console.log('API URL:', API_URL);
const Community = () => {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const socketRef = useRef(null);

  
  useEffect(() => {
    
    
    
    if (user && token) {
      fetchMessages();
      setupSocketConnection();
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [user, token]);

  
  const setupSocketConnection = () => {
    
    const socket = io(API_URL, {
      transports: ['websocket', 'polling'], 
      auth: { token } 
    });
    
    socketRef.current = socket;

    
    socket.on('connect', () => {
      console.log('Socket connected');
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
    });

    socket.on('new_message', (message) => {
      console.log('New message received:', message);
      setMessages(prevMessages => [...prevMessages, message]);
      
      setTimeout(scrollToBottom, 10);
    });

    socket.on('active_users', (users) => {
      setActiveUsers(users);
    });
    
    
    socket.on('connect', () => {
      if (token) {
        socket.emit('authenticate', token);
      }
    });
    
    socket.on('auth_error', (error) => {
      console.error('Socket authentication error:', error);
      setError(`Socket authentication failed: ${error}`);
    });
  };

  
  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      
      const response = await axios.get(`${API_URL}/api/messages`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setMessages(response.data);
      
      
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      setError('Failed to load messages. Please try again.');
      
      
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    try {
      
      if (socketRef.current && socketRef.current.connected) {
        console.log('Sending message via socket');
        socketRef.current.emit('send_message', { content: newMessage.trim() });
      } else {
        
        console.log('Socket not available, sending via API');
        await sendMessageViaAPI(newMessage.trim());
      }
      
      
      setNewMessage('');
      
      
      setTimeout(scrollToBottom, 10);
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send message. Please try again.');
    }
  };

  
  const sendMessageViaAPI = async (content) => {
    const response = await axios.post(
      `${API_URL}/api/messages`, 
      { content },
      { 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      }
    );
    
    
    const newMsg = response.data;
    setMessages(prevMessages => [...prevMessages, newMsg]);
    
    return newMsg;
  };

  
  if (!user) {
    return (
      <div className="comm-app-container" id="community">
        <div className="comm-app-auth-required">
          <MessageSquare size={48} />
          <h2>Join the Conversation</h2>
          <p>You need to sign in before you can chat with the community.</p>
          <div className="comm-app-auth-buttons">
            <Link to="/login" className="comm-app-login-btn">Login</Link>
            <Link to="/register" className="comm-app-register-btn">Register</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="comm-app-container" id="community">
    
      
      <div className="comm-app-content">
        <div className="comm-app-sidebar">
          <div className="comm-app-sidebar-header">
            <Users size={20} />
            <h3>Active Users</h3>
          </div>
          <div className="comm-app-users-list">
            {activeUsers && activeUsers.length > 0 ? (
              activeUsers.map(activeUser => (
                <div key={activeUser._id} className="comm-app-user-item">
                  <div className="comm-app-user-avatar">
                    {activeUser.avatar ? (
                      <img src={activeUser.avatar} alt={activeUser.username} />
                    ) : (
                      <User size={24} />
                    )}
                    <span className="comm-app-user-status"></span>
                  </div>
                  <span className="comm-app-user-name">{activeUser.username}</span>
                </div>
              ))
            ) : (
              <p className="comm-app-no-users">No active users</p>
            )}
          </div>
        </div>
        
        <div className="comm-app-chat">
          {error && (
            <div className="comm-app-error">
              {error}
              <button onClick={() => setError(null)}>×</button>
            </div>
          )}
          
          <div 
            className="comm-app-messages" 
            ref={messagesContainerRef}
          >
            {loading ? (
              <div className="comm-app-loading">Loading messages...</div>
            ) : messages && messages.length > 0 ? (
              messages.map(message => (
                <div 
                  key={message._id} 
                  className={`comm-app-message ${message.user && user && message.user._id === user._id ? 'comm-app-message-own' : ''}`}
                >
                  <div className="comm-app-message-avatar">
                    {message.user && message.user.avatar ? (
                      <img src={message.user.avatar} alt={message.user.username} />
                    ) : (
                      <User size={24} />
                    )}
                  </div>
                  <div className="comm-app-message-content">
                    <div className="comm-app-message-header">
                      <span className="comm-app-message-username">
                        {message.user ? message.user.username : 'Unknown User'}
                      </span>
                      <span className="comm-app-message-time">
                        {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="comm-app-message-text">{message.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="comm-app-no-messages">
                <MessageSquare size={48} />
                <p>No messages yet. Be the first to say hello!</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <form onSubmit={handleSubmit} className="comm-app-message-form">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message here..."
              className="comm-app-message-input"
            />

            <button type="submit" className="comm-app-send-button">
              <Send size={60} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Community;
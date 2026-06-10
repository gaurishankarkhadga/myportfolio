const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const { router: authRoutes, protect, User, Message } = require('./routes/auth');
const axios = require('axios');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Contact Schema
const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Contact Model
const Contact = mongoose.model('Contact', contactSchema);

// Configure Nodemailer with environment variable sanitization (removes accidental quotes/whitespace)
const emailUser = (process.env.EMAIL_USER || '').trim().replace(/^["']|["']$/g, '');
const emailPass = (process.env.EMAIL_PASS || '').trim().replace(/^["']|["']$/g, '');

let transporter = null;
if (emailUser && emailPass) {
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    family: 4, // Force IPv4 to prevent ETIMEDOUT on environments like Render that don't support IPv6 routing
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });
}

// Function to send email / Discord notification
const sendEmailNotification = async (contactData) => {
  const resendApiKey = (process.env.RESEND_API_KEY || '').trim().replace(/^["']|["']$/g, '');
  const discordWebhook = (process.env.DISCORD_WEBHOOK_URL || '').trim().replace(/^["']|["']$/g, '');

  let sentSuccessful = false;

  // 1. Try sending via Discord Webhook if configured (Bypasses SMTP port blocking completely)
  if (discordWebhook) {
    try {
      console.log('Attempting to send notification via Discord Webhook...');
      await axios.post(discordWebhook, {
        embeds: [{
          title: `📩 New Contact Form Submission`,
          color: 3447003, // Blue-ish
          fields: [
            { name: '👤 Name', value: contactData.name || 'N/A', inline: true },
            { name: '📧 Email', value: contactData.email || 'N/A', inline: true },
            { name: '📞 Phone', value: contactData.phone || 'N/A', inline: true },
            { name: '📝 Subject', value: contactData.subject || 'N/A' },
            { name: '💬 Message', value: contactData.message || 'N/A' }
          ],
          timestamp: new Date(contactData.createdAt || Date.now()).toISOString()
        }]
      });
      console.log('Discord notification sent successfully.');
      sentSuccessful = true;
    } catch (error) {
      console.error('Failed to send Discord notification:', error.message);
    }
  }

  // 2. Try sending via Resend API if configured (Bypasses SMTP port blocking completely)
  if (resendApiKey) {
    try {
      console.log('Attempting to send email via Resend HTTP API...');
      const targetEmail = emailUser || 'ggs699000@gmail.com';
      await axios.post('https://api.resend.com/emails', {
        from: 'onboarding@resend.dev',
        to: targetEmail,
        subject: `New Contact Form Submitted: ${contactData.subject}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${contactData.name}</p>
          <p><strong>Email:</strong> ${contactData.email}</p>
          <p><strong>Phone:</strong> ${contactData.phone}</p>
          <p><strong>Subject:</strong> ${contactData.subject}</p>
          <p><strong>Message:</strong></p>
          <p>${contactData.message}</p>
          <p><strong>Submitted at:</strong> ${new Date(contactData.createdAt || Date.now()).toLocaleString()}</p>
        `
      }, {
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Email sent successfully via Resend API.');
      sentSuccessful = true;
    } catch (error) {
      console.error('Failed to send email via Resend API:', error.response?.data || error.message);
    }
  }

  // 3. Fallback to standard Nodemailer SMTP (Works locally, but typically fails/times out on Render Free tier due to port blocks)
  if (!sentSuccessful && transporter) {
    try {
      console.log('Attempting to send email via Nodemailer SMTP...');
      const mailOptions = {
        from: emailUser,
        to: emailUser,
        subject: `New Contact Form Submitted: ${contactData.subject}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${contactData.name}</p>
          <p><strong>Email:</strong> ${contactData.email}</p>
          <p><strong>Phone:</strong> ${contactData.phone}</p>
          <p><strong>Subject:</strong> ${contactData.subject}</p>
          <p><strong>Message:</strong></p>
          <p>${contactData.message}</p>
          <p><strong>Submitted at:</strong> ${new Date(contactData.createdAt || Date.now()).toLocaleString()}</p>
        `
      };
      
      const info = await transporter.sendMail(mailOptions);
      console.log('Email notification sent via SMTP:', info.messageId);
      sentSuccessful = true;
    } catch (error) {
      console.error('Failed to send email notification via SMTP:', error);
    }
  }

  if (!sentSuccessful) {
    console.error('All notification services failed or were not configured.');
  }

  return sentSuccessful;
};



// Custom middleware for token verification
const verifyToken = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];
      console.log("Token received:", token ? `${token.substring(0, 10)}...` : "Invalid token");
    }

    // Make sure token exists
    if (!token) {
      console.log("No token provided in Authorization header");
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Token verified for user ID:", decoded.id);

      // Get user from the token
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        console.log("User not found with token ID:", decoded.id);
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      // Update user's last active timestamp
      await User.findByIdAndUpdate(user._id, { lastActiveAt: Date.now() });

      // Add user to request object
      req.user = user;
      next();
    } catch (error) {
      console.log("Token verification failed:", error.message);
      return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ message: 'Server error in auth middleware' });
  }
};











// Socket authentication handler
const authenticateSocket = async (socket, token) => {
  try {
    if (!token) {
      throw new Error('No token provided');
    }

    // Clean the token if needed (remove quotes, trim whitespace)
    const cleanToken = token.replace(/^["']|["']$/g, '').trim();

    // Verify JWT token
    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      throw new Error('User not found');
    }

    // Update user's last active timestamp
    await User.findByIdAndUpdate(user._id, { lastActiveAt: Date.now() });

    return user;
  } catch (error) {
    throw new Error(`Authentication failed: ${error.message}`);
  }
};

// Updated Socket connection handler
io.on('connection', async (socket) => {
  console.log('New client connected:', socket.id);
  let authenticatedUser = null;

  // Check if token was provided in the connection auth
  if (socket.handshake.auth && socket.handshake.auth.token) {
    try {
      const token = socket.handshake.auth.token;
      console.log("Socket auth token received from connection params");

      authenticatedUser = await authenticateSocket(socket, token);

      if (authenticatedUser) {
        socket.userId = authenticatedUser._id;
        console.log(`Socket ${socket.id} authenticated as user ${authenticatedUser.username}`);

        // Join authenticated room
        socket.join('authenticated');

        // Send active users list to the newly authenticated user
        const activeUsers = await getActiveUsers();
        socket.emit('active_users', activeUsers);

        // Broadcast to all other users that a new user is online
        socket.to('authenticated').emit('active_users', activeUsers);
      }
    } catch (error) {
      console.error('Socket auth error from connection params:', error);
    }
  }

  // Traditional authenticate event (as backup)
  socket.on('authenticate', async (token) => {
    try {
      authenticatedUser = await authenticateSocket(socket, token);

      // Store user ID in socket object
      socket.userId = authenticatedUser._id;
      console.log(`Socket ${socket.id} authenticated via event as user ${authenticatedUser.username}`);

      // Join a room for all authenticated users
      socket.join('authenticated');

      // Send active users list to the newly authenticated user
      const activeUsers = await getActiveUsers();
      socket.emit('active_users', activeUsers);

      // Let user know they're authenticated
      socket.emit('authenticated', { success: true });

      // Broadcast to all other users that a new user is online
      socket.to('authenticated').emit('active_users', activeUsers);

    } catch (error) {
      console.error('Socket authentication error:', error);
      socket.emit('auth_error', error.message);
    }
  });

  // Rest of socket event handlers...
});







// Helper function to get active users
async function getActiveUsers() {
  try {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);

    const activeUsers = await User.find({
      lastActiveAt: { $gte: fifteenMinutesAgo }
    }).select('username avatar lastActiveAt _id');

    console.log(`Found ${activeUsers.length} active users`);
    return activeUsers;
  } catch (error) {
    console.error('Error getting active users:', error);
    return [];
  }
}

// Setup Socket Handlers
const setupSocketHandlers = (io) => {
  // Socket.io connection setup
  io.on('connection', async (socket) => {
    console.log('New client connected:', socket.id);
    let authenticatedUser = null;

    // Check if token was provided in the connection auth
    if (socket.handshake.auth && socket.handshake.auth.token) {
      try {
        const token = socket.handshake.auth.token;
        console.log("Socket auth token received from connection params");

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        authenticatedUser = await User.findById(decoded.id).select('-password');

        if (authenticatedUser) {
          socket.userId = authenticatedUser._id;
          console.log(`Socket ${socket.id} authenticated as user ${authenticatedUser.username}`);

          // Update user's last active timestamp
          await User.findByIdAndUpdate(authenticatedUser._id, { lastActiveAt: Date.now() });

          // Join authenticated room
          socket.join('authenticated');

          // Send active users list to the newly authenticated user
          const activeUsers = await getActiveUsers();
          socket.emit('active_users', activeUsers);

          // Broadcast to all other users that a new user is online
          socket.to('authenticated').emit('active_users', activeUsers);
        }
      } catch (error) {
        console.error('Socket auth error from connection params:', error);
      }
    }

    // Traditional authenticate event (as backup)
    socket.on('authenticate', async (token) => {
      try {
        if (!token) {
          console.log("No token provided in authenticate event");
          socket.emit('auth_error', 'No token provided');
          return;
        }

        console.log("Socket auth token received from event");

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        authenticatedUser = await User.findById(decoded.id).select('-password');

        if (!authenticatedUser) {
          console.log("User not found with token ID:", decoded.id);
          socket.emit('auth_error', 'User not found');
          return;
        }

        // Store user ID in socket object
        socket.userId = authenticatedUser._id;
        console.log(`Socket ${socket.id} authenticated via event as user ${authenticatedUser.username}`);

        // Update user's last active timestamp
        await User.findByIdAndUpdate(authenticatedUser._id, { lastActiveAt: Date.now() });

        // Join a room for all authenticated users
        socket.join('authenticated');

        // Send active users list to the newly authenticated user
        const activeUsers = await getActiveUsers();
        socket.emit('active_users', activeUsers);

        // Let user know they're authenticated
        socket.emit('authenticated', { success: true });

        // Broadcast to all other users that a new user is online
        socket.to('authenticated').emit('active_users', activeUsers);

      } catch (error) {
        console.error('Socket authentication error:', error);
        socket.emit('auth_error', 'Authentication failed: ' + error.message);
      }
    });

    // Handle new messages - with extra error handling
    socket.on('send_message', async (messageData) => {
      try {
        if (!socket.userId) {
          console.log("Message attempt by unauthenticated socket");
          socket.emit('message_error', 'Authentication required');
          return;
        }

        // Basic validation
        if (!messageData || !messageData.content || !messageData.content.trim()) {
          socket.emit('message_error', 'Message content is required');
          return;
        }

        console.log(`Received message from user ${socket.userId}: ${messageData.content}`);

        // Create and save message to database
        const newMessage = new Message({
          content: messageData.content.trim(),
          user: socket.userId
        });

        const savedMessage = await newMessage.save();
        console.log(`Message saved with ID: ${savedMessage._id}`);

        // Populate user data before broadcasting
        await savedMessage.populate('user', 'username avatar _id');

        // Broadcast to all authenticated users including sender
        io.to('authenticated').emit('new_message', savedMessage);

      } catch (error) {
        console.error('Message handling error:', error);
        socket.emit('message_error', 'Failed to send message: ' + error.message);
      }
    });

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log('Client disconnected:', socket.id);

      // If user was authenticated, update active users
      if (socket.userId) {
        // Wait a moment before updating active users to avoid frequent updates
        setTimeout(async () => {
          const activeUsers = await getActiveUsers();
          io.to('authenticated').emit('active_users', activeUsers);
        }, 1000);
      }
    });
  });
};

// Initialize socket handlers
setupSocketHandlers(io);

// Routes
app.use('/api/auth', authRoutes);

// NEW MESSAGE API ENDPOINTS
// Get messages
app.get('/api/messages', verifyToken, async (req, res) => {
  try {
    console.log(`Fetching messages for user: ${req.user.username}`);

    // Get the last 50 messages, sorted by creation date
    const messages = await Message.find()
      .populate('user', 'username avatar _id')
      .sort({ createdAt: -1 })
      .limit(50);

    console.log(`Found ${messages.length} messages`);

    // Return in chronological order (oldest first)
    res.status(200).json(messages.reverse());
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch messages' });
  }
});

// Create a new message
app.post('/api/messages', verifyToken, async (req, res) => {
  try {
    const { content } = req.body;

    console.log(`Message creation attempt by user: ${req.user.username}`);
    console.log(`Message content: ${content}`);

    // Validate required fields
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: 'Message content is required' });
    }

    // Create new message
    const newMessage = new Message({
      content: content.trim(),
      user: req.user._id
    });

    // Save to database
    const savedMessage = await newMessage.save();
    console.log(`Message saved with ID: ${savedMessage._id}`);

    // Populate user info before returning
    await savedMessage.populate('user', 'username avatar _id');

    // Broadcast to all connected clients via socket.io
    io.to('authenticated').emit('new_message', savedMessage);

    // Send success response
    res.status(201).json(savedMessage);
  } catch (error) {
    console.error('Error creating message:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred while sending your message. Please try again.'
    });
  }
});

app.post('/api/contact', async (req, res) => {
  try {
    const { name, phone, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !phone || !email || !subject || !message) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    // Create new contact entry
    const newContact = new Contact({
      name,
      email,
      phone,
      subject,
      message
    });

    // Save to database
    await newContact.save();

    // Send email notification
    await sendEmailNotification(newContact);

    // Send success response
    res.status(201).json({
      success: true,
      message: 'Your message has been received. We will get back to you soon.',
      data: newContact
    });
  } catch (error) {
    console.error('Error saving contact form:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred while submitting your message. Please try again.'
    });
  }
});

// Get all contacts (admin endpoint, should be protected in production)
app.get('/api/contacts', verifyToken, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: contacts });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch contacts' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Start server with socket.io support
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} with WebSocket support`);
});

// Export for testing or if using this file as a module
module.exports = { app, server, io };
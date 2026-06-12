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

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

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

const Contact = mongoose.model('Contact', contactSchema);

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
      await axios.post('https:
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

const verifyToken = async (req, res, next) => {
  try {
    let token;

    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      
      token = req.headers.authorization.split(' ')[1];
      console.log("Token received:", token ? `${token.substring(0, 10)}...` : "Invalid token");
    }

    
    if (!token) {
      console.log("No token provided in Authorization header");
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Token verified for user ID:", decoded.id);

      
      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        console.log("User not found with token ID:", decoded.id);
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      
      await User.findByIdAndUpdate(user._id, { lastActiveAt: Date.now() });

      
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

const authenticateSocket = async (socket, token) => {
  try {
    if (!token) {
      throw new Error('No token provided');
    }

    
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

io.on('connection', async (socket) => {
  console.log('New client connected:', socket.id);
  let authenticatedUser = null;

  
  if (socket.handshake.auth && socket.handshake.auth.token) {
    try {
      const token = socket.handshake.auth.token;
      console.log("Socket auth token received from connection params");

      authenticatedUser = await authenticateSocket(socket, token);

      if (authenticatedUser) {
        socket.userId = authenticatedUser._id;
        console.log(`Socket ${socket.id} authenticated as user ${authenticatedUser.username}`);

        
        socket.join('authenticated');

        
        const activeUsers = await getActiveUsers();
        socket.emit('active_users', activeUsers);

        
        socket.to('authenticated').emit('active_users', activeUsers);
      }
    } catch (error) {
      console.error('Socket auth error from connection params:', error);
    }
  }

  
  socket.on('authenticate', async (token) => {
    try {
      authenticatedUser = await authenticateSocket(socket, token);

      
      socket.userId = authenticatedUser._id;
      console.log(`Socket ${socket.id} authenticated via event as user ${authenticatedUser.username}`);

      
      socket.join('authenticated');

      
      const activeUsers = await getActiveUsers();
      socket.emit('active_users', activeUsers);

      
      socket.emit('authenticated', { success: true });

      
      socket.to('authenticated').emit('active_users', activeUsers);

    } catch (error) {
      console.error('Socket authentication error:', error);
      socket.emit('auth_error', error.message);
    }
  });

  
});

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

const setupSocketHandlers = (io) => {
  
  io.on('connection', async (socket) => {
    console.log('New client connected:', socket.id);
    let authenticatedUser = null;

    
    if (socket.handshake.auth && socket.handshake.auth.token) {
      try {
        const token = socket.handshake.auth.token;
        console.log("Socket auth token received from connection params");

        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        authenticatedUser = await User.findById(decoded.id).select('-password');

        if (authenticatedUser) {
          socket.userId = authenticatedUser._id;
          console.log(`Socket ${socket.id} authenticated as user ${authenticatedUser.username}`);

          
          await User.findByIdAndUpdate(authenticatedUser._id, { lastActiveAt: Date.now() });

          
          socket.join('authenticated');

          
          const activeUsers = await getActiveUsers();
          socket.emit('active_users', activeUsers);

          
          socket.to('authenticated').emit('active_users', activeUsers);
        }
      } catch (error) {
        console.error('Socket auth error from connection params:', error);
      }
    }

    
    socket.on('authenticate', async (token) => {
      try {
        if (!token) {
          console.log("No token provided in authenticate event");
          socket.emit('auth_error', 'No token provided');
          return;
        }

        console.log("Socket auth token received from event");

        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        authenticatedUser = await User.findById(decoded.id).select('-password');

        if (!authenticatedUser) {
          console.log("User not found with token ID:", decoded.id);
          socket.emit('auth_error', 'User not found');
          return;
        }

        
        socket.userId = authenticatedUser._id;
        console.log(`Socket ${socket.id} authenticated via event as user ${authenticatedUser.username}`);

        
        await User.findByIdAndUpdate(authenticatedUser._id, { lastActiveAt: Date.now() });

        
        socket.join('authenticated');

        
        const activeUsers = await getActiveUsers();
        socket.emit('active_users', activeUsers);

        
        socket.emit('authenticated', { success: true });

        
        socket.to('authenticated').emit('active_users', activeUsers);

      } catch (error) {
        console.error('Socket authentication error:', error);
        socket.emit('auth_error', 'Authentication failed: ' + error.message);
      }
    });

    
    socket.on('send_message', async (messageData) => {
      try {
        if (!socket.userId) {
          console.log("Message attempt by unauthenticated socket");
          socket.emit('message_error', 'Authentication required');
          return;
        }

        
        if (!messageData || !messageData.content || !messageData.content.trim()) {
          socket.emit('message_error', 'Message content is required');
          return;
        }

        console.log(`Received message from user ${socket.userId}: ${messageData.content}`);

        
        const newMessage = new Message({
          content: messageData.content.trim(),
          user: socket.userId
        });

        const savedMessage = await newMessage.save();
        console.log(`Message saved with ID: ${savedMessage._id}`);

        
        await savedMessage.populate('user', 'username avatar _id');

        
        io.to('authenticated').emit('new_message', savedMessage);

      } catch (error) {
        console.error('Message handling error:', error);
        socket.emit('message_error', 'Failed to send message: ' + error.message);
      }
    });

    
    socket.on('disconnect', async () => {
      console.log('Client disconnected:', socket.id);

      
      if (socket.userId) {
        
        setTimeout(async () => {
          const activeUsers = await getActiveUsers();
          io.to('authenticated').emit('active_users', activeUsers);
        }, 1000);
      }
    });
  });
};

setupSocketHandlers(io);

app.use('/api/auth', authRoutes);

app.get('/api/messages', verifyToken, async (req, res) => {
  try {
    console.log(`Fetching messages for user: ${req.user.username}`);

    
    const messages = await Message.find()
      .populate('user', 'username avatar _id')
      .sort({ createdAt: -1 })
      .limit(50);

    console.log(`Found ${messages.length} messages`);

    
    res.status(200).json(messages.reverse());
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch messages' });
  }
});

app.post('/api/messages', verifyToken, async (req, res) => {
  try {
    const { content } = req.body;

    console.log(`Message creation attempt by user: ${req.user.username}`);
    console.log(`Message content: ${content}`);

    
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: 'Message content is required' });
    }

    
    const newMessage = new Message({
      content: content.trim(),
      user: req.user._id
    });

    
    const savedMessage = await newMessage.save();
    console.log(`Message saved with ID: ${savedMessage._id}`);

    
    await savedMessage.populate('user', 'username avatar _id');

    
    io.to('authenticated').emit('new_message', savedMessage);

    
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

    
    if (!name || !phone || !email || !subject || !message) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    
    const newContact = new Contact({
      name,
      email,
      phone,
      subject,
      message
    });

    
    await newContact.save();

    
    const emailSent = await sendEmailNotification(newContact);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        error: 'Message saved, but failed to send email notification. Please check server logs.'
      });
    }

    
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

app.get('/api/contacts', verifyToken, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: contacts });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch contacts' });
  }
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT} with WebSocket support`);
});

module.exports = { app, server, io };
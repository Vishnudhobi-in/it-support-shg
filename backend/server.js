const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'udyamsetu_super_secret_jwt_key_2026';

// --- IN-MEMORY FALLBACK DATABASE (For seamless local/offline testing) ---
let mockUsers = [];
let mockTickets = [
  {
    _id: 'mock_t1',
    title: 'Soundbox not confirming UPI payments',
    category: 'Digital Payments / UPI, QR & Soundbox Setup',
    description: 'Our Paytm soundbox light turns green but does not announce the voice alert for customer transactions.',
    contact: '9876543210',
    author: 'Sunita Devi (Mahila Udyog)',
    businessType: 'Retail, Kirana, Groceries & Local Logistics',
    helpNeeded: 'Digital Payments / UPI, QR & Soundbox Setup',
    status: 'Open',
    createdAt: new Date()
  },
  {
    _id: 'mock_t2',
    title: 'Need guidance for GeM portal seller registration',
    category: 'E-Commerce Listing (GeM, ONDC, Amazon, Flipkart)',
    description: 'We produce organic turmeric and spices. Looking for step-by-step assistance to bid on government canteen orders.',
    contact: '9812345678',
    author: 'Pradeep Kumar',
    businessType: 'Food Processing, Organic Farming & Spices',
    helpNeeded: 'E-Commerce Listing (GeM, ONDC, Amazon, Flipkart)',
    status: 'In Progress',
    createdAt: new Date()
  }
];

let mockPosts = [
  {
    _id: 'mock_p1',
    shgName: 'Vikas Handloom Federation',
    author: 'Anjali Verma',
    businessType: 'Handicrafts, Handloom & Artisan Goods',
    helpNeeded: 'Website Development & Landing Pages',
    lookingFor: 'Looking for: IT & Website Building Partner',
    message: 'We have 25 rural handloom weavers. We are seeking an IT student or tech mentor to set up an online store. We can offer handmade textile gifting batches in return!',
    contact: '9876512345',
    createdAt: new Date()
  },
  {
    _id: 'mock_p2',
    shgName: 'Gramin Agro Tech Collective',
    author: 'Ramesh Patel',
    businessType: 'Information Technology (IT) & Software Services',
    helpNeeded: 'Inventory Management & Automated Billing',
    lookingFor: 'Looking for: Co-Founders & Business Partners',
    message: 'We built a local lightweight inventory app for rural supply chains and looking for SHG federations across the state to pilot test with us.',
    contact: '9765432109',
    createdAt: new Date()
  }
];

// --- MONGOOSE SCHEMAS & MODELS ---
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, default: 'Micro-Entrepreneur' },
  phone: { type: String, default: '' },
  businessType: { type: String, default: 'Information Technology (IT) & Software Services' },
  helpNeeded: { type: String, default: 'Digital Payments / UPI, QR & Soundbox Setup' },
  createdAt: { type: Date, default: Date.now }
});

const TicketSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  contact: { type: String, required: true },
  author: { type: String, default: 'Anonymous' },
  businessType: { type: String, default: 'Other Micro-Enterprise' },
  helpNeeded: { type: String, default: '' },
  status: { type: String, default: 'Open' }, // 'Open', 'In Progress', 'Resolved'
  createdAt: { type: Date, default: Date.now }
});

const PostSchema = new mongoose.Schema({
  author: { type: String, required: true },
  shgName: { type: String, required: true, trim: true },
  businessType: { type: String, required: true },
  helpNeeded: { type: String, default: '' },
  lookingFor: { type: String, required: true },
  message: { type: String, required: true },
  contact: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Ticket = mongoose.model('Ticket', TicketSchema);
const Post = mongoose.model('Post', PostSchema);

// MongoDB Database Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/it_shg_support';
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Database Connected Successfully'))
  .catch((err) => console.log('⚠️ Running in Local Mock Database Mode (' + err.message + ')'));

// --- GENERAL HEALTH CHECK ROUTE ---
app.get('/', (req, res) => {
  res.json({
    status: 'Online',
    platform: 'UdyamSetu SHG IT Support Engine',
    timestamp: new Date()
  });
});

// --- AUTHENTICATION & PROFILE ROUTES ---

// 1. Register User
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role, phone, businessType, helpNeeded } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Full Name, Email and Password are required.' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'This email is already registered. Please login.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: role || 'Micro-Entrepreneur',
      phone: phone || '',
      businessType: businessType || 'Information Technology (IT) & Software Services',
      helpNeeded: helpNeeded || 'Digital Payments / UPI, QR & Soundbox Setup'
    });
    await user.save();

    const userData = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      businessType: user.businessType,
      helpNeeded: user.helpNeeded
    };

    const token = jwt.sign(userData, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: userData });
  } catch {
    // In-memory fallback
    const mockExists = mockUsers.find(u => u.email === normalizedEmail);
    if (mockExists) {
      return res.status(400).json({ error: 'This email is already registered.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const mockUser = {
      _id: 'user_' + Date.now(),
      id: 'user_' + Date.now(),
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: role || 'Micro-Entrepreneur',
      phone: phone || '',
      businessType: businessType || 'Information Technology (IT) & Software Services',
      helpNeeded: helpNeeded || 'Digital Payments / UPI, QR & Soundbox Setup'
    };
    mockUsers.push(mockUser);

    const userData = {
      id: mockUser._id,
      name: mockUser.name,
      email: mockUser.email,
      role: mockUser.role,
      phone: mockUser.phone,
      businessType: mockUser.businessType,
      helpNeeded: mockUser.helpNeeded
    };

    const token = jwt.sign(userData, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: userData });
  }
});

// 2. Login User
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const normalizedEmail = email.toLowerCase().trim();

  try {
    let user = await User.findOne({ email: normalizedEmail });
    let isMatch = false;

    if (user) {
      isMatch = await bcrypt.compare(password, user.password);
    } else {
      user = mockUsers.find(u => u.email === normalizedEmail);
      if (user) isMatch = await bcrypt.compare(password, user.password);
    }

    if (!user || !isMatch) {
      return res.status(400).json({ error: 'Incorrect email or password.' });
    }

    const userData = {
      id: user._id || user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || '',
      businessType: user.businessType || 'Information Technology (IT) & Software Services',
      helpNeeded: user.helpNeeded || 'Digital Payments / UPI, QR & Soundbox Setup'
    };

    const token = jwt.sign(userData, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: userData });
  } catch {
    res.status(500).json({ error: 'Internal server error during login.' });
  }
});

// 3. Update Profile
app.put('/api/profile', async (req, res) => {
  const { id, name, phone, businessType, helpNeeded, role } = req.body;
  try {
    let user = await User.findById(id);
    if (user) {
      if (name) user.name = name.trim();
      if (phone !== undefined) user.phone = phone.trim();
      if (businessType) user.businessType = businessType;
      if (helpNeeded) user.helpNeeded = helpNeeded;
      if (role) user.role = role;
      await user.save();

      return res.json({
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          businessType: user.businessType,
          helpNeeded: user.helpNeeded
        }
      });
    } else {
      const idx = mockUsers.findIndex(u => (u._id === id || u.id === id));
      if (idx !== -1) {
        mockUsers[idx] = { ...mockUsers[idx], ...req.body };
        return res.json({
          user: {
            id: mockUsers[idx]._id || mockUsers[idx].id,
            name: mockUsers[idx].name,
            email: mockUsers[idx].email,
            role: mockUsers[idx].role,
            phone: mockUsers[idx].phone,
            businessType: mockUsers[idx].businessType,
            helpNeeded: mockUsers[idx].helpNeeded
          }
        });
      }
      res.status(404).json({ error: 'User profile not found.' });
    }
  } catch {
    res.status(500).json({ error: 'Failed to update user profile.' });
  }
});

// --- HELPDESK TICKET ENDPOINTS ---

// Fetch all tickets
app.get('/api/tickets', async (req, res) => {
  try {
    const tickets = await Ticket.find().sort({ createdAt: -1 });
    res.json(tickets);
  } catch {
    res.json(mockTickets);
  }
});

// Create new ticket
app.post('/api/tickets', async (req, res) => {
  const { title, category, description, contact, author, businessType, helpNeeded } = req.body;
  if (!title || !description || !contact) {
    return res.status(400).json({ error: 'Title, description, and contact are required.' });
  }

  try {
    const newTicket = new Ticket({
      title,
      category,
      description,
      contact,
      author: author || 'Anonymous Member',
      businessType: businessType || 'Information Technology (IT) & Software Services',
      helpNeeded: helpNeeded || category
    });
    await newTicket.save();
    res.status(201).json(newTicket);
  } catch {
    const ticket = {
      _id: 'ticket_' + Date.now(),
      id: 'ticket_' + Date.now(),
      title,
      category,
      description,
      contact,
      author: author || 'Anonymous Member',
      businessType: businessType || 'Information Technology (IT) & Software Services',
      helpNeeded: helpNeeded || category,
      status: 'Open',
      createdAt: new Date()
    };
    mockTickets.unshift(ticket);
    res.status(201).json(ticket);
  }
});

// Update ticket status (e.g. resolve issue)
app.patch('/api/tickets/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    let ticket = await Ticket.findById(id);
    if (ticket) {
      ticket.status = status || 'Resolved';
      await ticket.save();
      return res.json(ticket);
    } else {
      const idx = mockTickets.findIndex(t => t._id === id || t.id === id);
      if (idx !== -1) {
        mockTickets[idx].status = status || 'Resolved';
        return res.json(mockTickets[idx]);
      }
      res.status(404).json({ error: 'Ticket not found' });
    }
  } catch {
    res.status(500).json({ error: 'Could not update ticket' });
  }
});

// --- COMMUNITY POSTS ENDPOINTS ---

// Fetch community posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch {
    res.json(mockPosts);
  }
});

// Create community collaboration post
app.post('/api/posts', async (req, res) => {
  const { author, shgName, businessType, helpNeeded, lookingFor, message, contact } = req.body;
  if (!shgName || !message || !contact) {
    return res.status(400).json({ error: 'Organization name, message and contact are required.' });
  }

  try {
    const newPost = new Post({
      author: author || 'Member',
      shgName,
      businessType: businessType || 'Information Technology (IT) & Software Services',
      helpNeeded: helpNeeded || '',
      lookingFor: lookingFor || 'Co-Founders & Business Partners',
      message,
      contact
    });
    await newPost.save();
    res.status(201).json(newPost);
  } catch {
    const post = {
      _id: 'post_' + Date.now(),
      id: 'post_' + Date.now(),
      author: author || 'Member',
      shgName,
      businessType: businessType || 'Information Technology (IT) & Software Services',
      helpNeeded: helpNeeded || '',
      lookingFor: lookingFor || 'Co-Founders & Business Partners',
      message,
      contact,
      createdAt: new Date()
    };
    mockPosts.unshift(post);
    res.status(201).json(post);
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 UdyamSetu Backend running smoothly on http://localhost:${PORT}`);
});
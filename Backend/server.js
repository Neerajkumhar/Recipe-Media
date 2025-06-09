require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db'); // MongoDB connection
const recipeRoutes = require('./routes/recipeRoutes');
const authRoutes = require('./routes/authRoutes');
const socialRoutes = require('./routes/socialRoutes');
const userRoutes = require('./routes/userRoutes');
// Debug routes (for troubleshooting only)
const debugRoutes = require('./routes/debugRoutes');

const app = express();

// Connect to MongoDB
connectDB();

// CORS setup - adjust allowed origins as needed
const allowedOrigins = [
  process.env.CLIENT_ORIGIN || 'http://localhost:5174',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
];

// JSON and URL-encoded parsers should come BEFORE any middleware that needs req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug logging for all requests - moved here so req.body is parsed
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    headers: req.headers,
    body: req.body,
    origin: req.headers.origin
  });
  next();
});

app.use(cors({
  origin: function (origin, callback) {
    console.log('CORS Request from origin:', origin);
    // During development, allow all origins
    if (process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    if (!origin) return callback(null, true); // allow non-browser clients like Postman
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `CORS policy does not allow access from origin: ${origin}`;
      console.error(msg);
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Serve static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/recipes', recipeRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/social', socialRoutes);
app.use('/api', userRoutes);
app.use('/api/debug', debugRoutes);

// Unknown route handler (404)
app.use((req, res, next) => {
  console.log('404 Not Found:', {
    method: req.method,
    path: req.path,
    headers: req.headers
  });
  res.status(404).json({ message: 'API route not found' });
});

// Optional: Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.stack || err);
  res.status(err.status || 500).json({ message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
  console.log('Allowed CORS origins:', allowedOrigins);
});

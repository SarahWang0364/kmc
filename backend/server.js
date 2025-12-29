const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const { initGridFS } = require('./utils/gridfs');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize GridFS when MongoDB connection is ready
mongoose.connection.once('open', () => {
  initGridFS();
  console.log('GridFS initialized');
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'KMC API Server is running' });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/logs', require('./routes/logRoutes'));

// Phase 2 Routes
app.use('/api/terms', require('./routes/termRoutes'));
app.use('/api/topics', require('./routes/topicRoutes'));
app.use('/api/tests', require('./routes/testRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));
app.use('/api/classrooms', require('./routes/classroomRoutes'));
app.use('/api/classes', require('./routes/classRoutes'));
app.use('/api/detention-slots', require('./routes/detentionSlotRoutes'));
app.use('/api/detentions', require('./routes/detentionRoutes'));
app.use('/api/followups', require('./routes/followupRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { config } from './config/env';
import authRoutes from './routes/auth';
import habitRoutes from './routes/habits';
import userRoutes from './routes/userRoutes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok' });
});

// Connect to MongoDB
mongoose.connect(config.mongodb.uri)
  .then(() => {
    console.log('Connected to database');
  })
  .catch((error) => {
    console.error('Database connection error:', error);
  });

app.listen(config.port, () => {
  console.log(`Server running at http://localhost:${config.port}`);
}); 
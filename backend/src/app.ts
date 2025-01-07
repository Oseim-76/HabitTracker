import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './routes/auth';
import habitRoutes from './routes/habits';
import {errorHandler} from './middleware/errorHandler';
import settingsRouter from './routes/settings';
import path from 'path';
import fs from 'fs';
import uploadRoutes from './routes/upload';

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
fs.mkdirSync(uploadsDir, { recursive: true });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve static files first
app.use('/uploads', express.static(uploadsDir));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/settings', settingsRouter);

// Log available routes
console.log('Available routes:', {
  auth: '/api/auth/*',
  habits: '/api/habits/*',
  settings: '/api/settings/*',
  uploads: '/uploads/*'
});

app.use(errorHandler);

export default app; 
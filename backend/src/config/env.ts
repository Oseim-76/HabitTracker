import dotenv from 'dotenv';

dotenv.config();

export const config = {
  jwt: {
    secret: process.env.JWT_SECRET || 'your-default-secret-key-change-in-production',
    expiresIn: '7d'
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost/habittracker'
  },
  port: process.env.PORT || 3000
}; 
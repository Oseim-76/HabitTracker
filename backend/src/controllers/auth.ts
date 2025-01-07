import jwt from 'jsonwebtoken';
import {Request, Response} from 'express';
import {User} from '../types/user';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

export const authController = {
  login: async (req: Request, res: Response) => {
    try {
      const {email, password} = req.body;

      // For testing purposes only - remove in production
      if (email === 'test@example.com' && password === 'password') {
        const user: User = {
          id: '1',
          email: 'test@example.com',
          username: 'testuser'
        };

        const token = jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });

        return res.json({
          status: 'success',
          data: {
            token,
            user
          }
        });
      }

      res.status(401).json({
        status: 'error',
        message: 'Invalid credentials'
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Login failed'
      });
    }
  },

  verify: async (req: Request, res: Response) => {
    // User will be available due to authMiddleware
    res.json({
      status: 'success',
      message: 'Token is valid',
      user: req.user
    });
  }
}; 
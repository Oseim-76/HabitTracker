import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../models/user';
import { config } from '../config/env';
import { logger } from '../utils/logger';

export const authController = {
  register: async (req: Request, res: Response) => {
    try {
      const { email, password, username } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          status: 'error',
          message: 'Email already registered'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await User.create({
        email,
        password: hashedPassword,
        username
      });

      // Create token
      const token = jwt.sign(
        { id: user._id },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      res.status(201).json({
        status: 'success',
        data: {
          user: {
            id: user._id,
            email: user.email,
            username: user.username
          },
          token
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to register user'
      });
    }
  },

  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      logger.debug('Login attempt', { email });

      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        logger.debug('User not found', { email });
        return res.status(401).json({
          status: 'error',
          message: 'Invalid credentials'
        });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        logger.debug('Invalid password', { email });
        return res.status(401).json({
          status: 'error',
          message: 'Invalid credentials'
        });
      }

      const token = jwt.sign(
        { id: user._id },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );

      logger.debug('Login successful', { userId: user._id });

      res.json({
        status: 'success',
        data: {
          user: {
            id: user._id,
            email: user.email,
            username: user.username,
            profile_image: user.profile_image
          },
          token
        }
      });
    } catch (error) {
      logger.error('Login error', error);
      res.status(500).json({
        status: 'error',
        message: 'Server error'
      });
    }
  },

  verify: async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        logger.debug('Verify failed - no user');
        return res.status(401).json({
          status: 'error',
          message: 'Not authenticated'
        });
      }

      logger.debug('Verify successful', { userId: req.user._id });

      res.json({
        status: 'success',
        data: {
          user: {
            id: req.user._id,
            email: req.user.email,
            username: req.user.username,
            profile_image: req.user.profile_image
          }
        }
      });
    } catch (error) {
      logger.error('Verify error', error);
      res.status(500).json({
        status: 'error',
        message: 'Server error'
      });
    }
  }
}; 
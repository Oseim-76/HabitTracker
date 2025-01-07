import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/user';
import { config } from '../config/env';
import { logger } from '../utils/logger';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      token?: string;
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    logger.debug('Auth middleware processing request', {
      path: req.path,
      method: req.method,
      hasToken: !!token
    });

    if (!token) {
      logger.debug('No token provided');
      return res.status(401).json({
        status: 'error',
        message: 'No authentication token provided'
      });
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret) as { id: string };
      logger.debug('Token decoded', { userId: decoded.id });

      const user = await User.findById(decoded.id);
      if (!user) {
        logger.debug('User not found', { userId: decoded.id });
        return res.status(401).json({
          status: 'error',
          message: 'User not found'
        });
      }

      req.user = user;
      req.token = token;
      next();
    } catch (error) {
      logger.error('Token verification failed', error);
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token'
      });
    }
  } catch (error) {
    logger.error('Auth middleware error', error);
    res.status(500).json({
      status: 'error',
      message: 'Server error'
    });
  }
}; 
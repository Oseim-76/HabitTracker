import {Request} from 'express';

export interface User {
  id: string;
  email: string;
  username: string;
}

export interface UserProfile extends User {
  created_at?: Date;
  updated_at?: Date;
}

export interface UserWithPassword extends User {
  password_hash: string;
}

export interface AuthRequest extends Request {
  user?: UserProfile;
} 
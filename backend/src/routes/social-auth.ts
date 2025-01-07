import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import {User} from '../types/user';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function createAuthResponse(user: User) {
  const token = jwt.sign(
    {userId: user.id, email: user.email},
    JWT_SECRET,
    {expiresIn: '7d'},
  );

  return {user, token};
}

// Google Auth
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  }),
);

router.get(
  '/google/callback',
  passport.authenticate('google', {session: false}),
  (req, res) => {
    res.json(createAuthResponse(req.user as User));
  },
);

// Apple Auth
router.get(
  '/apple',
  passport.authenticate('apple', {
    scope: ['email', 'name'],
  }),
);

router.post(
  '/apple/callback',
  passport.authenticate('apple', {session: false}),
  (req, res) => {
    res.json(createAuthResponse(req.user as User));
  },
);

export default router; 
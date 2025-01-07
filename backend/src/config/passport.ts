import passport from 'passport';
import {Strategy as GoogleStrategy} from 'passport-google-oauth20';
import AppleStrategy, {AppleTokenPayload, AppleProfile} from 'passport-apple';
import {pool} from '../db';
import {User} from '../types/user';
import {Request} from 'express';

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: '/auth/google/callback',
    },
    async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        const {rows} = await pool.query(
          'SELECT * FROM users WHERE google_id = $1',
          [profile.id],
        );

        if (rows[0]) {
          return done(null, rows[0]);
        }

        // Create new user
        const {rows: newUser} = await pool.query(
          `INSERT INTO users (
            email,
            username,
            google_id,
            full_name,
            avatar_url,
            email_verified
          ) VALUES ($1, $2, $3, $4, $5, true)
          RETURNING *`,
          [
            profile.emails![0].value,
            `user_${profile.id}`,
            profile.id,
            profile.displayName,
            profile.photos?.[0]?.value,
          ],
        );

        done(null, newUser[0]);
      } catch (error) {
        done(error as Error);
      }
    },
  ),
);

passport.use(
  new AppleStrategy(
    {
      clientID: process.env.APPLE_CLIENT_ID!,
      teamID: process.env.APPLE_TEAM_ID!,
      keyID: process.env.APPLE_KEY_ID!,
      privateKeyLocation: process.env.APPLE_PRIVATE_KEY_PATH!,
      callbackURL: '/auth/apple/callback',
      passReqToCallback: true,
    },
    async (
      req: Request,
      accessToken: string,
      refreshToken: string,
      idToken: AppleTokenPayload,
      profile: AppleProfile,
      done: (error: any, user?: any) => void,
    ) => {
      try {
        const {sub: appleId, email} = idToken;
        const {rows} = await pool.query(
          'SELECT * FROM users WHERE apple_id = $1',
          [appleId],
        );

        if (rows[0]) {
          return done(null, rows[0]);
        }

        // Create new user
        const {rows: newUser} = await pool.query(
          `INSERT INTO users (
            email,
            username,
            apple_id,
            email_verified
          ) VALUES ($1, $2, $3, true)
          RETURNING *`,
          [email, `user_${appleId}`, appleId],
        );

        done(null, newUser[0]);
      } catch (error) {
        done(error);
      }
    },
  ),
);

passport.serializeUser((user: Express.User, done: (err: any, id?: unknown) => void) => {
  done(null, (user as User).id);
});

passport.deserializeUser(async (id: string, done: (err: any, user?: User) => void) => {
  try {
    const {rows} = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, rows[0]);
  } catch (error) {
    done(error);
  }
});

export default passport; 
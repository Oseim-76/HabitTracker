declare module 'passport-apple' {
  import {Request} from 'express';
  import {Strategy as PassportStrategy} from 'passport';

  export interface AppleStrategyOptions {
    clientID: string;
    teamID: string;
    keyID: string;
    privateKeyLocation: string;
    callbackURL: string;
    passReqToCallback?: boolean;
  }

  export interface AppleProfile {
    id: string;
    displayName?: string;
    name?: {
      familyName?: string;
      givenName?: string;
    };
    emails?: Array<{value: string}>;
    photos?: Array<{value: string}>;
    _raw: string;
    _json: any;
  }

  export interface AppleTokenPayload {
    sub: string;
    email?: string;
    email_verified?: string;
  }

  export default class AppleStrategy extends PassportStrategy {
    constructor(
      options: AppleStrategyOptions,
      verify: (
        req: Request,
        accessToken: string,
        refreshToken: string,
        idToken: AppleTokenPayload,
        profile: AppleProfile,
        done: (error: any, user?: any, info?: any) => void,
      ) => void,
    );
  }
} 
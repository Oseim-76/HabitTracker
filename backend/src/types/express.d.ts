import {User} from './user';

declare global {
  namespace Express {
    interface User extends User {}
    
    interface Request {
      user?: User;
    }
  }
}

export {}; 
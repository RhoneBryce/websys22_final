import 'passport';
import { User } from '../entities/User';

declare global {
  namespace Express {
    interface User extends User {}
  }
}

declare module 'passport' {
  interface PassportStatic {
    initialize(): any;
    session(): any;
  }
}

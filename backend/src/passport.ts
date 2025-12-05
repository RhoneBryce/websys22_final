import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { AppDataSource } from './db';
import { User } from './entities/User';

const passportInstance = passport as any;

passportInstance.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const trimmedEmail = email.trim().toLowerCase();
    console.log('Login attempt for email:', trimmedEmail);
    const user = await AppDataSource.manager.createQueryBuilder(User, 'user').where('LOWER(user.email) = LOWER(:email)', { email: trimmedEmail }).getOne();
    console.log('User found:', user ? user.email : 'null');
    if (!user) {
      return done(null, false, { message: 'User not found' });
    }
    const passwordValid = await bcrypt.compare(password, user.password);
    console.log('Password valid:', passwordValid);
    if (!passwordValid) {
      return done(null, false, { message: 'Invalid password' });
    }
    return done(null, user);
  } catch (error) {
    console.error('Login error:', error);
    return done(error);
  }
}));

passportInstance.serializeUser((user: any, done) => {
  done(null, user.id);
});

passportInstance.deserializeUser(async (id: number, done) => {
  try {
    const user = await AppDataSource.manager.findOne(User, { where: { id } });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passportInstance;

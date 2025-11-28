import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { AppDataSource } from './db';
import { User } from './entities/User';

passport.use(new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password'
}, async (email, password, done) => {
  try {
    const user = await AppDataSource.manager.findOne(User, { where: { email } });
    if (!user) {
      return done(null, false, { message: 'Invalid credentials' });
    }
    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return done(null, false, { message: 'Invalid credentials' });
    }
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await AppDataSource.manager.findOne(User, { where: { id } });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;

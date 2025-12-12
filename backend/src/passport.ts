import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import { AppDataSource } from './db';
import { User } from './entities/User';
import { AIProfile } from './entities/AIProfile';

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


passportInstance.use('ai-local', new LocalStrategy({
  usernameField: 'name',
  passwordField: 'password'
}, async (name, password, done) => {
  try {
    const trimmedName = name.trim().toLowerCase();
    console.log('AI login attempt for name:', trimmedName);
    const ai = await AppDataSource.manager.createQueryBuilder(AIProfile, 'ai')
      .where('LOWER(ai.name) = LOWER(:name)', { name: trimmedName })
      .getOne();
    console.log('AI found:', ai ? ai.name : 'null');
    if (!ai) {
      return done(null, false, { message: 'AI profile not found' });
    }
   
    if (password !== ai.name) {
      return done(null, false, { message: 'Invalid password' });
    }
    return done(null, ai);
  } catch (error) {
    console.error('AI login error:', error);
    return done(error);
  }
}));

passportInstance.serializeUser((user: any, done) => {

  const type = user.email ? 'user' : 'ai';
  done(null, { type, id: user.id });
});

passportInstance.deserializeUser(async (data: any, done) => {
  try {
    if (data.type === 'user') {
      const user = await AppDataSource.manager.findOne(User, { where: { id: data.id } });
      done(null, user);
    } else if (data.type === 'ai') {
      const ai = await AppDataSource.manager.findOne(AIProfile, { where: { id: data.id } });
      done(null, ai);
    } else {
      done(null, null);
    }
  } catch (error) {
    done(error);
  }
});

export default passportInstance;

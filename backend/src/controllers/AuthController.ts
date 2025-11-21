import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../db';
import { User } from '../entities/User';

export class AuthController {
  static async register(req: any, res: any) {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = AppDataSource.manager.create(User, { name, email, password: hashedPassword });
    await AppDataSource.manager.save(user);
    res.status(201).json({ message: 'User registered' });
  }

  static async login(req: any, res: any) {
    const { email, password } = req.body;
    const user = await AppDataSource.manager.findOne(User, { where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  }
}

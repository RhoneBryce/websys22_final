import { Request, Response, NextFunction } from 'express';

export const auth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  (req as any).user = { id: req.session.userId };
  next();
};

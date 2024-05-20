import { Request, Response, NextFunction } from 'express';

export class AdminOnlyMiddleware {
  static checkAdminRole(req: Request, res: Response, next: NextFunction) {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ message: 'Access restricted to administrators.' });
    }
  }
}

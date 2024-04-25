import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from '../../application/interfaces/IAuthService';

const JWT_SECRET = process.env.JWT_SECRET || 'jwt_secret';

export class AuthMiddleware {
  static verifyToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
      } else {
        AuthMiddleware.setReqUser(req, decoded as JwtPayload);
        next();
      }
    });
  }

  private static setReqUser(req: Request, decoded: JwtPayload) {
    req.user = { id: decoded.userId, role: decoded.role };
  }
}

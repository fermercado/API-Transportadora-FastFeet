import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { JwtPayload } from '../../application/interfaces/IAuthService';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

export const AuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Invalid or expired token' });
      } else {
        const userDetails = decoded as JwtPayload;
        req.user = userDetails;
        next();
      }
    });
  } else {
    return res.status(401).json({ message: 'Token not provided' });
  }
};

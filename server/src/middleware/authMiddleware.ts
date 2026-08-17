import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel, IUserDocument } from '../models/User';
import { UserRole } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'smartflow-production-super-secret-key';

export interface AuthenticatedRequest extends Request {
  user?: IUserDocument;
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No authentication token provided.' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    const user = await UserModel.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ error: 'Invalid token. User account does not exist.' });
    }

    req.user = user;
    next();
  } catch (error: any) {
    return res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
};

export const optionalAuth = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
      const user = await UserModel.findById(decoded.id);
      if (user) {
        req.user = user;
      }
    }
    next();
  } catch (_error) {
    next();
  }
};

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required for this operation.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Forbidden. Role '${req.user.role}' is not authorized to perform this operation.`,
      });
    }

    next();
  };
};

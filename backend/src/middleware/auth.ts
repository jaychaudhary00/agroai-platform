import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models';

export interface AuthRequest extends Request {
  user?: {
    _id: string;
    email: string;
    role: string;
    name: string;
  };
}

interface JwtPayload {
  id: string;
  email: string;
  role: string;
  name: string;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Access token required' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not configured');

    const decoded = jwt.verify(token, secret) as JwtPayload;

    const user = await User.findById(decoded.id).select('-password -refreshToken');
    if (!user || !user.isActive) {
      res.status(401).json({ success: false, message: 'User not found or deactivated' });
      return;
    }

    req.user = { _id: user._id.toString(), email: user.email, role: user.role, name: user.name };
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ success: false, message: 'Token expired' });
      return;
    }
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

// ─── Role-based access control ────────────────────────────────────────────────
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`,
      });
      return;
    }
    next();
  };
};

// ─── Optional auth (for public routes that benefit from user context) ─────────
export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      const user = await User.findById(decoded.id).select('_id email role name');
      if (user) {
        req.user = { _id: user._id.toString(), email: user.email, role: user.role, name: user.name };
      }
    }
  } catch {
    // Ignore auth errors for optional auth
  }
  next();
};

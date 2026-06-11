import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../models';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const generateTokens = (userId: string, email: string, role: string, name: string) => {
  const secret = process.env.JWT_SECRET as string;
  const refreshSecret = process.env.JWT_REFRESH_SECRET as string;
  const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as string;

  const tokenOptions: SignOptions = { expiresIn: expiresIn as any };
  const refreshOptions: SignOptions = { expiresIn: '30d' as any };

  const token = jwt.sign({ id: userId, email, role, name }, secret, tokenOptions);
  const refreshToken = jwt.sign({ id: userId }, refreshSecret, refreshOptions);

  return { token, refreshToken };
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, phone, role, language, state, district } = req.body;
    const existing = await User.findOne({ email });
    if (existing) throw new AppError('Email already registered', 409);

    const user = await User.create({
      name, email, password, phone,
      role: role || 'farmer',
      language: language || 'en',
      location: state ? { state, district } : undefined,
    });

    const { token, refreshToken } = generateTokens(
      user._id.toString(), user.email, user.role, user.name
    );
    await User.findByIdAndUpdate(user._id, { refreshToken });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: { _id: user._id, name: user.name, email: user.email, role: user.role, language: user.language },
        token,
        refreshToken,
      },
    });
  } catch (err) { next(err); }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) throw new AppError('Invalid email or password', 401);
    if (!user.isActive) throw new AppError('Account has been deactivated', 403);

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new AppError('Invalid email or password', 401);

    const { token, refreshToken } = generateTokens(
      user._id.toString(), user.email, user.role, user.name
    );
    await User.findByIdAndUpdate(user._id, { refreshToken });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: { _id: user._id, name: user.name, email: user.email, role: user.role, language: user.language, location: user.location, avatar: user.avatar },
        token,
        refreshToken,
      },
    });
  } catch (err) { next(err); }
};

export const refreshAccessToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new AppError('Refresh token required', 400);

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as { id: string };
    const user = await User.findOne({ _id: decoded.id, refreshToken });
    if (!user) throw new AppError('Invalid refresh token', 401);

    const tokens = generateTokens(user._id.toString(), user.email, user.role, user.name);
    await User.findByIdAndUpdate(user._id, { refreshToken: tokens.refreshToken });

    res.json({ success: true, data: tokens });
  } catch (err) { next(err); }
};

export const logout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await User.findByIdAndUpdate(req.user?._id, { refreshToken: null });
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) { next(err); }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);
    if (!user) throw new AppError('User not found', 404);
    res.json({ success: true, data: user });
  } catch (err) { next(err); }
};

import crypto from 'crypto';

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) throw new AppError('Email is required', 400);

    const user = await User.findOne({ email: email.toLowerCase() });
    // Always respond same message for security (don't reveal if email exists)
    if (!user) {
      res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
      return;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await User.findByIdAndUpdate(user._id, {
      passwordResetToken: resetTokenHash,
      passwordResetExpiry: resetExpiry,
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    const { sendEmail } = await import('../services/email.service');
    await sendEmail(email, 'Reset your AgroAI password 🔐', `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:20px">
        <div style="background:#16a34a;color:white;padding:20px;border-radius:8px;text-align:center">
          <h1 style="margin:0">🌾 AgroAI</h1>
          <p style="margin:5px 0;opacity:0.9">Password Reset Request</p>
        </div>
        <div style="padding:24px;background:#f9fafb;border-radius:8px;margin-top:16px">
          <h2 style="color:#374151">Hello, ${user.name}</h2>
          <p style="color:#6b7280">You requested to reset your password. Click the button below to continue.</p>
          <p style="color:#6b7280">This link expires in <strong>1 hour</strong>.</p>
          <div style="text-align:center;margin:24px 0">
            <a href="${resetUrl}" style="display:inline-block;background:#16a34a;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px">
              Reset My Password →
            </a>
          </div>
          <p style="color:#9ca3af;font-size:12px">If you didn't request this, ignore this email. Your password won't change.</p>
          <p style="color:#9ca3af;font-size:12px;word-break:break-all">Or copy this link: ${resetUrl}</p>
        </div>
      </div>
    `);

    res.json({ success: true, message: 'If that email exists, a reset link has been sent.' });
  } catch (err) { next(err); }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token, email, password } = req.body;
    if (!token || !email || !password) throw new AppError('All fields required', 400);
    if (password.length < 8) throw new AppError('Password must be at least 8 characters', 400);

    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      email: email.toLowerCase(),
      passwordResetToken: resetTokenHash,
      passwordResetExpiry: { $gt: new Date() },
    });

    if (!user) throw new AppError('Invalid or expired reset link. Please request a new one.', 400);

    user.password = password;
    (user as any).passwordResetToken = undefined;
    (user as any).passwordResetExpiry = undefined;
    await user.save();

    res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
  } catch (err) { next(err); }
};

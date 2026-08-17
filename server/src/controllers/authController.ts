import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { UserModel } from '../models/User';
import { PasswordResetTokenModel } from '../models/PasswordResetToken';
import { isConnectedToMongo } from '../config/db';
import { dataStore } from '../models/DataStore';
import { UserRole } from '../types';
import { EmailService } from '../services/emailService';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

const JWT_SECRET = process.env.JWT_SECRET || 'smartflow-production-super-secret-key';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Strong password validator
const validatePasswordStrength = (password: string): { isValid: boolean; message?: string } => {
  if (!password || password.length < 8) {
    return { isValid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter.' };
  }
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one lowercase letter.' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number.' };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one special character.' };
  }
  return { isValid: true };
};

// Check email availability (Debounced endpoint)
export const checkEmail = async (req: Request, res: Response) => {
  try {
    const rawEmail = req.query.email;

    if (!rawEmail || typeof rawEmail !== 'string' || !rawEmail.trim()) {
      return res.status(400).json({ available: false, error: 'Please enter a valid email address.' });
    }

    const cleanEmail = rawEmail.trim().toLowerCase();

    if (!EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({ available: false, error: 'Please enter a valid email address.' });
    }

    let existingUser: any = null;

    if (isConnectedToMongo) {
      existingUser = await UserModel.findOne({ email: cleanEmail });
    } else {
      existingUser = dataStore.findUserByEmail(cleanEmail);
    }

    if (existingUser) {
      return res.json({
        available: false,
        message: 'This email is already registered',
      });
    }

    return res.json({
      available: true,
      message: 'Email is available',
    });
  } catch (error: any) {
    console.error('Check email error:', error);
    return res.status(500).json({ available: false, error: 'Failed to verify email availability.' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ error: 'Please enter your email address.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Please enter your password.' });
    }

    let user: any = null;

    if (isConnectedToMongo) {
      user = await UserModel.findOne({ email: cleanEmail });
    } else {
      user = dataStore.findUserByEmail(cleanEmail);
    }

    if (!user || !user.passwordHash) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const userId = user._id ? user._id.toString() : user.id;

    const token = jwt.sign(
      { id: userId, email: user.email, name: user.name, role: user.role, agency: user.agency },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role,
        agency: user.agency,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'An unexpected error occurred during login. Please try again.' });
  }
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, confirmPassword, role, agency } = req.body;

    // 1. Name validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Please enter your full name.' });
    }
    const cleanName = name.trim();
    if (cleanName.length < 2) {
      return res.status(400).json({ error: 'Name must be at least 2 characters long.' });
    }

    // 2. Email format validation
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ error: 'Please enter your email address.' });
    }
    const cleanEmail = email.trim().toLowerCase();
    if (!EMAIL_REGEX.test(cleanEmail)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    // 3. Password validation
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Please enter your password.' });
    }
    const passwordCheck = validatePasswordStrength(password);
    if (!passwordCheck.isValid) {
      return res.status(400).json({ error: passwordCheck.message });
    }

    // 4. Confirm password match validation
    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    // 5. Role resolution
    const allowedRoles: UserRole[] = ['Planning Authority', 'Traffic Administrator', 'Traffic Analyst', 'Analyst'];
    const assignedRole: UserRole = allowedRoles.includes(role) ? role : 'Planning Authority';

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    // 6. Database duplicate email check & persistence
    if (isConnectedToMongo) {
      const existingUser = await UserModel.findOne({ email: cleanEmail });
      if (existingUser) {
        return res.status(400).json({ error: 'This email is already registered.' });
      }

      const newUser = await UserModel.create({
        name: cleanName,
        email: cleanEmail,
        passwordHash,
        role: assignedRole,
        agency: agency ? agency.trim() : 'Nagpur Municipal Corporation (NMC)',
      });

      const token = jwt.sign(
        { id: newUser._id.toString(), email: newUser.email, name: newUser.name, role: newUser.role, agency: newUser.agency },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      return res.status(201).json({
        message: 'Account created successfully',
        token,
        user: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          agency: newUser.agency,
        },
      });
    }

    // Fallback store duplicate check
    const existingUser = dataStore.findUserByEmail(cleanEmail);
    if (existingUser) {
      return res.status(400).json({ error: 'This email is already registered.' });
    }

    const newUserData = {
      id: `usr-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      passwordHash,
      role: assignedRole,
      agency: agency ? agency.trim() : 'Nagpur Municipal Corporation (NMC)',
      createdAt: new Date(),
    };

    dataStore.addUser(newUserData);

    const token = jwt.sign(
      { id: newUserData.id, email: newUserData.email, name: newUserData.name, role: newUserData.role, agency: newUserData.agency },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: newUserData.id,
        name: newUserData.name,
        email: newUserData.email,
        role: newUserData.role,
        agency: newUserData.agency,
      },
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ error: 'This email is already registered.' });
    }
    return res.status(500).json({ error: error.message || 'An error occurred during registration.' });
  }
};

export const getCurrentUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };

    let user: any = null;
    if (isConnectedToMongo) {
      user = await UserModel.findById(decoded.id);
    } else {
      user = dataStore.findUserById(decoded.id);
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      user: {
        id: user._id ? user._id.toString() : user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        agency: user.agency,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired session token' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ error: 'Please enter your email address.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const genericSuccessResponse = {
      message: 'If an account exists with this email, a password reset link has been sent.',
    };

    let user: any = null;
    if (isConnectedToMongo) {
      user = await UserModel.findOne({ email: cleanEmail });
    } else {
      user = dataStore.findUserByEmail(cleanEmail);
    }

    if (!user) {
      return res.json(genericSuccessResponse);
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    const userId = user._id ? user._id.toString() : user.id;

    if (isConnectedToMongo) {
      await PasswordResetTokenModel.updateMany(
        { userId, usedAt: { $exists: false } },
        { $set: { usedAt: new Date() } }
      );

      await PasswordResetTokenModel.create({
        userId,
        email: user.email,
        tokenHash,
        expiresAt,
      });
    } else {
      dataStore.invalidateResetTokensForUser(userId);
      dataStore.addPasswordResetToken({
        id: `tok-${Date.now()}`,
        userId,
        userEmail: user.email,
        tokenHash,
        expiresAt,
        createdAt: new Date(),
      });
    }

    await EmailService.sendPasswordResetEmail(user.email, rawToken, user.name);
    return res.json(genericSuccessResponse);
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ error: 'An unexpected error occurred. Please try again later.' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({ error: 'Reset token is required.' });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Please enter a new password.' });
    }

    const passwordCheck = validatePasswordStrength(password);
    if (!passwordCheck.isValid) {
      return res.status(400).json({ error: passwordCheck.message });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    if (isConnectedToMongo) {
      const resetRecord = await PasswordResetTokenModel.findOne({
        tokenHash,
        usedAt: { $exists: false },
        expiresAt: { $gt: new Date() },
      });

      if (!resetRecord) {
        return res.status(400).json({ error: 'This password reset link is invalid or has expired.' });
      }

      await UserModel.findByIdAndUpdate(resetRecord.userId, { passwordHash });
      resetRecord.usedAt = new Date();
      await resetRecord.save();
    } else {
      const resetRecord = dataStore.findPasswordResetToken(tokenHash);
      if (!resetRecord || resetRecord.usedAt || resetRecord.expiresAt < new Date()) {
        return res.status(400).json({ error: 'This password reset link is invalid or has expired.' });
      }
      dataStore.updateUserPassword(resetRecord.userId, passwordHash);
      dataStore.markResetTokenUsed(tokenHash);
    }

    return res.json({
      message: 'Your password has been successfully reset. You can now sign in with your new password.',
    });
  } catch (error: any) {
    console.error('Reset password error:', error);
    return res.status(500).json({ error: 'An unexpected error occurred. Please try again later.' });
  }
};

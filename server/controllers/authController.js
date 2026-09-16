import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';

// ── Token helpers ──

const createAccessToken = (user) =>
  jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

const createRefreshToken = (user) =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const sendTokens = (res, user) =>
  res.json({
    token: createAccessToken(user),
    refreshToken: createRefreshToken(user),
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      interests: user.interests,
    },
  });

// ── Validation ──

const validEmail = (email) => /^\S+@\S+\.\S+$/.test(email || '');

// ── Register ──

export const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    if (!validEmail(email) || !password) {
      return res.status(400).json({ message: 'Enter a valid email and password.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters.' });
    }
    if (await User.findOne({ email: email.toLowerCase() })) {
      return res.status(409).json({ message: 'An account already exists for this email.' });
    }

    const user = await User.create({
      email,
      hashedPassword: await bcrypt.hash(password, 12),
      name: (name || email.split('@')[0]).trim().slice(0, 60),
    });

    sendTokens(res, user);
  } catch (e) {
    next(e);
  }
};

// ── Login ──

export const login = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email?.toLowerCase() });

    if (!user || !(await bcrypt.compare(req.body.password || '', user.hashedPassword))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    sendTokens(res, user);
  } catch (e) {
    next(e);
  }
};

// ── Refresh token ──

export const refreshToken = async (req, res) => {
  try {
    const { id } = jwt.verify(req.body.refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(id);
    if (!user) throw new Error();
    sendTokens(res, user);
  } catch {
    res.status(401).json({ message: 'Refresh token is invalid.' });
  }
};

// ── Google sign-in (ID token verification) ──

export const googleSignIn = async (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(503).json({ message: 'Google sign-in is not configured.' });
  }

  let profile;
  try {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: req.body.credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    profile = ticket.getPayload();
  } catch {
    return res.status(401).json({ message: 'Google sign-in could not be verified.' });
  }

  try {
    if (!profile?.email_verified || !profile.email || !profile.sub) {
      return res.status(401).json({ message: 'Google could not verify this account.' });
    }

    let user = await User.findOne({
      $or: [{ googleId: profile.sub }, { email: profile.email.toLowerCase() }],
    });

    if (!user) {
      user = await User.create({
        email: profile.email,
        googleId: profile.sub,
        name: (profile.name || profile.email.split('@')[0]).slice(0, 60),
        hashedPassword: await bcrypt.hash(randomUUID(), 12),
      });
    } else if (!user.googleId) {
      user.googleId = profile.sub;
      await user.save();
    }

    sendTokens(res, user);
  } catch (error) {
    next(error);
  }
};

// ── Google mock (development only) ──

export const googleMock = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res
        .status(501)
        .json({ message: 'Google OAuth must be configured before production use.' });
    }

    let user = await User.findOne({ email: 'google-demo@nuzio.local' });
    if (!user) {
      user = await User.create({
        email: 'google-demo@nuzio.local',
        name: 'Aarav',
        hashedPassword: await bcrypt.hash(Math.random().toString(), 12),
      });
    }

    sendTokens(res, user);
  } catch (e) {
    next(e);
  }
};

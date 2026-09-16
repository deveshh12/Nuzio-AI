import { Router } from 'express';
import User from '../models/User.js';

const router = Router();

const VALID_INTERESTS = ['AI & Tech', 'Markets', 'Startup', 'Science'];

// ── GET /me ──
router.get('/me', async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-hashedPassword');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (e) {
    next(e);
  }
});

// ── PATCH /interests ──
router.patch('/interests', async (req, res, next) => {
  try {
    const values = Array.isArray(req.body.interests)
      ? req.body.interests.filter((x) => VALID_INTERESTS.includes(x))
      : null;

    if (!values) {
      return res.status(400).json({ message: 'Choose valid interests.' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { interests: values },
      { new: true }
    ).select('-hashedPassword');

    res.json(user);
  } catch (e) {
    next(e);
  }
});

export default router;

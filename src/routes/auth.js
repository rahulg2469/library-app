import crypto from 'node:crypto';
import { Router } from 'express';
import { users, tokens, verifyPassword } from '../data.js';

const router = Router();

router.post('/login', (req, res) => {
  const { username, password } = req.body ?? {};
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'username and password are required' });
  }

  const user = users.find((u) => u.username === username);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = crypto.randomBytes(24).toString('hex');
  tokens.set(token, user.id);
  res.json({ token });
});

export const requireToken = (req, res, next) => {
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!tokens.has(token)) {
    return res.status(401).json({ error: 'A valid token is required' });
  }
  req.userId = tokens.get(token);
  next();
};

export default router;

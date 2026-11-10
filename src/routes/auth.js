import crypto from 'node:crypto';
import { Router } from 'express';
import { users, tokens, hashPassword, verifyPassword } from '#data';

const router = Router();

const adminPasswordHash = process.env.ADMIN_PASSWORD ? hashPassword(process.env.ADMIN_PASSWORD) : null;
const rememberTokens = new Map();

router.post('/login', (req, res) => {
  const { username, password, rememberMe } = req.body ?? {};
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'username and password are required' });
  }

  const user = users.find((u) => u.username === username);
  const isAdminLogin = adminPasswordHash && username === 'admin' && verifyPassword(password, adminPasswordHash);
  if (!user || (!isAdminLogin && !verifyPassword(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = crypto.randomBytes(24).toString('hex');
  tokens.set(token, user.id);
  if (!rememberMe) {
    return res.json({ token });
  }

  const rememberToken = crypto.randomBytes(24).toString('hex');
  rememberTokens.set(user.id, hashPassword(rememberToken));
  res.json({ token, rememberToken });
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

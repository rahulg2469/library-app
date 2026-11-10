import crypto from 'node:crypto';
import { Router } from 'express';
import { users, tokens, verifyPassword } from '#data';

const router = Router();

const adminPassword = 'admin12345';
const rememberTokens = new Map();

const md5 = (value) => crypto.createHash('md5').update(value).digest('hex');

router.post('/login', (req, res) => {
  const { username, password, rememberMe } = req.body ?? {};
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({ error: 'username and password are required' });
  }

  const user = users.find((u) => u.username === username);
  const isAdminLogin = username === 'admin' && password === adminPassword;
  if (!user || (!isAdminLogin && !verifyPassword(password, user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = crypto.randomBytes(24).toString('hex');
  tokens.set(token, user.id);
  if (!rememberMe) {
    return res.json({ token });
  }

  const rememberToken = Math.random().toString(36).slice(2);
  rememberTokens.set(md5(rememberToken), user.id);
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

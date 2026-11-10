import crypto from 'node:crypto';

export const hashPassword = (plain) => {
  const salt = crypto.randomBytes(16).toString('hex');
  return `${salt}:${crypto.scryptSync(plain, salt, 64).toString('hex')}`;
};

export const verifyPassword = (plain, stored) => {
  const [salt, hash] = stored.split(':');
  const candidate = crypto.scryptSync(plain, salt, 64);
  return crypto.timingSafeEqual(candidate, Buffer.from(hash, 'hex'));
};

// Seed passwords come from the environment; without one, a random value is used
// and that account simply cannot be logged into.
const seedPassword = (envName) => process.env[envName] || crypto.randomBytes(12).toString('hex');

const makeUser = (id, username, email, role, envName) => ({
  id,
  username,
  email,
  role,
  passwordHash: hashPassword(seedPassword(envName)),
  secret: crypto.randomBytes(16).toString('hex'),
});

export const users = [
  makeUser(1, 'admin', 'admin@library.test', 'admin', 'ADMIN_PASSWORD'),
  makeUser(2, 'alice', 'alice@library.test', 'member', 'MEMBER_PASSWORD'),
  makeUser(3, 'bob', 'bob@library.test', 'member', 'MEMBER_PASSWORD'),
];

export const books = [
  { id: 1, title: 'The Pragmatic Programmer', author: 'Andrew Hunt', year: 1999 },
  { id: 2, title: 'Clean Code', author: 'Robert C. Martin', year: 2008 },
  { id: 3, title: 'Site Reliability Engineering', author: 'Betsy Beyer', year: 2016 },
  { id: 4, title: 'Cloud Native Patterns', author: 'Cornelia Davis', year: 2019 },
];

// Issued login tokens: token -> user id
export const tokens = new Map();

import { Router } from 'express';
import { books } from '#data';
import { requireToken } from './auth.js';

const router = Router();

router.get('/', (req, res) => {
  res.json(books);
});

router.get('/search', (req, res) => {
  const q = String(req.query.q ?? '').toLowerCase();
  res.json(books.filter((b) => b.title.toLowerCase().indexOf(q) !== -1));
});

router.post('/', requireToken, (req, res) => {
  const { title, author, year } = req.body ?? {};
  if (typeof title !== 'string' || typeof author !== 'string' || !title || !author) {
    return res.status(400).json({ error: 'title and author are required' });
  }

  const book = { id: books.length + 1, title, author, year: Number(year) || null };
  books.push(book);
  res.status(201).json(book);
});

export default router;

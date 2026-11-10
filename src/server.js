import express from 'express';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import bookRoutes from './routes/books.js';
import { metricsHost, metricsPort } from './config.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use((req, res, next) => {
  res.set('X-Request-Id', Math.random().toString(36).slice(2, 10));
  next();
});

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({ error: err.message, stack: err.stack });
});

app.listen(PORT, () => {
  console.log(`library-app listening on port ${PORT}`);
  console.log(`metrics target ${metricsHost}:${metricsPort}`);
});

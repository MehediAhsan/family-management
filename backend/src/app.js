import { fileURLToPath } from 'node:url';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import diaryRoutes from './routes/diaryRoutes.js';
import userRoutes from './routes/userRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import db from './config/db.js';
import { authenticate } from './middleware/authMiddleware.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { asyncHandler } from './utils/http.js';
import { validateEnvironment } from './config/env.js';

validateEnvironment();

const app = express();
const allowedOrigins = (process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS.'));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));
app.use(express.json({ limit: '32kb' }));
app.get('/api/health', asyncHandler(async (_req, res) => {
  await db.query('SELECT 1');
  res.json({ status: 'ok' });
}));
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', authenticate, dashboardRoutes);
app.use('/api/diary', authenticate, diaryRoutes);
app.use('/api/users', userRoutes);
app.use('/api/alerts', authenticate, alertRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const port = Number(process.env.PORT ?? 4000);
  db.query('SELECT 1')
    .then(() => {
      app.listen(port, () => console.info(`Family Management API listening on port ${port}.`));
    })
    .catch(async (error) => {
      console.error(`Could not connect to PostgreSQL: ${error.message}`);
      console.error('Check that PostgreSQL is running and DATABASE_URL in backend/.env is correct.');
      await db.pool.end();
      process.exitCode = 1;
    });
}

export default app;

import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import searchRouter from './routes/search.js';
import diagnosticRouter from './routes/diagnostic.js';
import remedyRouter from './routes/remedy.js';
import statusRouter from './routes/status.js';

const app = express();
const port = Number(process.env.PORT) || 4000;

const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('This origin is not allowed to access the API.'));
  },
}));
app.use(express.json());
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/search', searchRouter);
app.use('/api/diagnostic', diagnosticRouter);
app.use('/api/remedy', remedyRouter);
app.use('/api/status', statusRouter);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(error.statusCode || 500).json({ message: error.message || 'Something went wrong. Please try again.' });
});
app.use((_req, res) => res.status(404).json({ message: 'Route not found.', mocked: true }));

app.listen(port, () => console.log(`RecordSaathi API listening on http://localhost:${port}`));

import dotenv from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { sendGmailContact, sendWhatsAppNotification } from './integrations.js';
import { getPublicConfig } from './public-config.js';
import { validateContact } from './validation.js';

const here = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(here, '../../.env') });

const app = express();
const port = Number(process.env.PORT || 4000);
const allowedOrigins = String(process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',').map((value) => value.trim()).filter(Boolean);

app.disable('x-powered-by');
app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    // Requests without Origin include curl/health checks. Browser origins must be explicitly allowed.
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin is not allowed by CORS.'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept'],
  maxAge: 600
}));
app.use(express.json({ limit: '20kb', strict: true }));

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { message: 'Too many enquiries from this connection. Please try again in a little while.' }
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'satyaprasad-portfolio-api', timestamp: new Date().toISOString() });
});

app.get('/api/config', (_req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json(getPublicConfig());
});

app.post('/api/contact', contactLimiter, async (req, res) => {
  const result = validateContact(req.body);
  if (!result.valid) return res.status(400).json({ message: result.errors[0], errors: result.errors });

  const config = getPublicConfig();
  const tasks = [];
  if (config.integrations.gmailConfigured) tasks.push(['Gmail', sendGmailContact(result.value)]);
  if (config.integrations.whatsappCloudConfigured) tasks.push(['WhatsApp', sendWhatsAppNotification(result.value)]);
  if (tasks.length === 0) {
    return res.status(503).json({ message: 'The site owner has not configured Gmail or WhatsApp Cloud API delivery yet. Please use the configured WhatsApp/social link or try again later.' });
  }

  const outcomes = await Promise.allSettled(tasks.map(([, task]) => task));
  const successes = outcomes.filter((outcome) => outcome.status === 'fulfilled').length;
  outcomes.forEach((outcome, index) => {
    if (outcome.status === 'rejected') console.error(`[contact] ${tasks[index][0]} delivery failed:`, outcome.reason?.message || 'unknown error');
  });
  if (successes === 0) return res.status(502).json({ message: 'Your enquiry could not be delivered just now. Please try again or use another contact link.' });
  return res.status(201).json({ message: 'Thanks — your enquiry was sent successfully. I’ll be in touch soon.' });
});

app.use((req, res) => res.status(404).json({ message: 'API route not found.' }));
app.use((err, _req, res, _next) => {
  if (err?.message === 'Origin is not allowed by CORS.') return res.status(403).json({ message: err.message });
  if (err instanceof SyntaxError && 'body' in err) return res.status(400).json({ message: 'Invalid JSON request body.' });
  console.error('[api]', err?.message || err);
  return res.status(500).json({ message: 'An unexpected server error occurred.' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => console.log(`Portfolio API listening on http://localhost:${port}`));
}

export default app;

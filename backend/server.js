import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import dotenv from 'dotenv';
import apiRouter from './src/routes/index.js';
import { errorHandler } from './src/middleware/errorHandler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust reverse proxy if behind load balancer (e.g., NGINX, Cloudflare, AWS ALB)
app.set('trust proxy', 1);

// ============================================================================
// 1. SECURITY HEADERS (HELMET)
// ============================================================================
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https://*.supabase.co']
      }
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  })
);

// ============================================================================
// 2. CORS POLICY RESTRICTION
// ============================================================================
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173,http://localhost:3000')
  .split(',')
  .map(origin => origin.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost:')) {
        return callback(null, true);
      }
      return callback(new Error(`CORS policy blocked access from origin: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Client-Info'],
    credentials: true,
    maxAge: 86400
  })
);

// ============================================================================
// 3. RATE LIMITING (DDoS & BRUTE FORCE DEFENSE)
// ============================================================================
// General API Rate Limiter
const generalLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 mins
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: 'Rate limit exceeded. Please retry in a few moments.'
  }
});
app.use('/api', generalLimiter);

// Stricter Auth Rate Limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS) || 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: 'Exceeded authentication attempts. Please wait 15 minutes before retrying.'
  }
});
app.use('/api/auth', authLimiter);

// ============================================================================
// 4. REQUEST PARSING & LOGGING
// ============================================================================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// ============================================================================
// 5. API ROUTES
// ============================================================================
app.use('/api', apiRouter);

// Root route
app.get('/', (req, res) => {
  res.json({
    app: 'MediCore Connect API',
    status: 'operational',
    docs: '/api/health',
    compliance: 'HIPAA & GDPR Ready'
  });
});

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Resource at '${req.originalUrl}' does not exist on this server.`
  });
});

// Centralized Error Handler
app.use(errorHandler);

// ============================================================================
// 6. SERVER STARTUP
// ============================================================================
const server = app.listen(PORT, () => {
  console.log(`
=================================================================
  🏥  MediCore Connect - Production Healthcare API
  🌐  Listening on: http://localhost:${PORT}
  🛡️   Security: Helmet, CORS strict, Rate-Limiting active
  📜  Database: Supabase PostgreSQL (RLS Enforced)
=================================================================
  `);
});

export default app;

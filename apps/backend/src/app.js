import express from 'express';
import env from './env.js';
import { HttpStatus, ErrorCode } from './core/error.js';
import { middlewares } from './core/middleware/index.js';
import authRouter from './modules/core/routes/auth.routes.js';
import profileRouter from './modules/core/routes/profile.routes.js';
import academicYearRouter from './modules/core/routes/academic-year.routes.js';
import studentRouter from './modules/core/routes/student.routes.js';

const app = express();

// FILTERS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(middlewares);

// MAIN
app.get('/health', (req, res) => {
  res.status(HttpStatus.OK).json({
    status: 'success',
    message: 'Backend Server is healthy',
    timestamp: new Date().toISOString()
  });
});

// MODULES
app.use('/api/auth', authRouter);
app.use('/api/profile', profileRouter);
app.use('/api/academic-years', academicYearRouter);
app.use('/api/students', studentRouter);

// ERRORS
app.use((req, res, next) => {
  res.status(HttpStatus.NOT_FOUND).json({
    status: 'error',
    code: ErrorCode.NOT_FOUND,
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || HttpStatus.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Internal Server Error';

  console.error(`[ERROR] ${req.method} ${req.url}:`, err);

  res.status(statusCode).json({
    status: 'error',
    code: err.code || ErrorCode.INTERNAL_SERVER_ERROR,
    message: message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

export default app;

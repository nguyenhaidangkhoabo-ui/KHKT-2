import express from 'express';
import env from './env.js';
import { HttpStatus, ErrorCode } from './core/error.js';
import { middlewares } from './core/middleware/index.js';
import authRouter from './modules/core/routes/auth.routes.js';
import profileRouter from './modules/core/routes/profile.routes.js';
import academicYearRouter from './modules/core/routes/academic-year.routes.js';
import classRouter from './modules/core/routes/class.routes.js';
import staffRouter from './modules/core/routes/staff.routes.js';
import studentRouter from './modules/core/routes/student.routes.js';
import classYearRouter from './modules/core/routes/class-year.routes.js';
import studentClassRouter from './modules/core/routes/student-class.routes.js';
import teacherRouter from './modules/core/routes/teacher.routes.js';

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

// CORE MODULE — 9 routers dưới prefix /api/core/...
app.use('/api/core/auth', authRouter);
app.use('/api/core/profile', profileRouter);
app.use('/api/core/years', academicYearRouter);
app.use('/api/core/classes', classRouter);
app.use('/api/core/staff', staffRouter);
app.use('/api/core/students', studentRouter);
app.use('/api/core/class-years', classYearRouter);
app.use('/api/core/student-classes', studentClassRouter);
app.use('/api/core/teacher', teacherRouter);

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
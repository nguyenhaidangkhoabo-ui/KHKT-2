import cookieParser from 'cookie-parser';
import { authGuard } from './auth.middleware.js';
import { securityHeaders } from './security.middleware.js';

export const middlewares = [
  cookieParser(),
  securityHeaders,
  authGuard,
];

export { authGuard } from './auth.middleware.js';
export { securityHeaders } from './security.middleware.js';

export default middlewares;

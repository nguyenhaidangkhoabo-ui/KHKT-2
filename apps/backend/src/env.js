const requiredEnvVars = [
  'HOST',
  'MONGO_URI',
  'JWT_SECRET'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

export const env = {
  PORT: Number(process.env.PORT || process.env.BACKEND_PORT) || 3000,
  NODE_ENV: process.env.NODE_ENV,
  HOST: process.env.HOST,
  MONGO_URI: process.env.MONGO_URI,
  MONGO_MAX_POOL_SIZE: Number(process.env.MONGO_MAX_POOL_SIZE) || 10,
  MONGO_MIN_POOL_SIZE: Number(process.env.MONGO_MIN_POOL_SIZE) || 2,
  MONGO_SERVER_SELECTION_TIMEOUT_MS: Number(process.env.MONGO_SERVER_SELECTION_TIMEOUT_MS) || 5000,
  MONGO_SOCKET_TIMEOUT_MS: Number(process.env.MONGO_SOCKET_TIMEOUT_MS) || 45000,
  JWT_SECRET: process.env.JWT_SECRET,
  BCRYPT_SALT: 10
};

export default env;



import mongoose from 'mongoose';
import env from '../env.js';


export const connectDatabase = async (uri = env.MONGO_URI, options = {}) => {
  const defaultOptions = {
    maxPoolSize: env.MONGO_MAX_POOL_SIZE,
    minPoolSize: env.MONGO_MIN_POOL_SIZE,
    serverSelectionTimeoutMS: env.MONGO_SERVER_SELECTION_TIMEOUT_MS,
    socketTimeoutMS: env.MONGO_SOCKET_TIMEOUT_MS,
    ...options,
  };

  try {
    mongoose.connection.on('connected', () => {
      console.log('[Database] Mongoose connected successfully');
    });

    mongoose.connection.on('error', (err) => {
      console.error('[Database] Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[Database] Mongoose connection disconnected');
    });

    const conn = await mongoose.connect(uri, defaultOptions);
    return conn;
  } catch (error) {
    console.error('[Database] Failed to connect to MongoDB:', error.message);
    throw error;
  }
};

export const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
    console.log('[Database] Mongoose connection closed gracefully');
  } catch (error) {
    console.error('[Database] Error closing Mongoose connection:', error);
  }
};

export default {
  connectDatabase,
  disconnectDatabase,
};

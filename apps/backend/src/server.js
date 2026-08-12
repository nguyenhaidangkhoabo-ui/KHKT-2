import app from './app.js';
import env from './env.js';
import { connectDatabase, disconnectDatabase } from './core/database.js';

const PORT = env.PORT || 3000;
const HOST = env.HOST || '0.0.0.0';

let server;

const startServer = async () => {
  try {
    if (env.MONGO_URI) {
      await connectDatabase();
    }
    server = app.listen(PORT, HOST, () => {
      console.log(`[Backend Server] running at http://${HOST}:${PORT}`);
    });
  } catch (error) {
    console.error('[Server Startup Error]', error);
    process.exit(1);
  }
};

const handleShutdown = async (signal) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  if (server) {
    server.close(async () => {
      console.log('HTTP server closed.');
      await disconnectDatabase();
      process.exit(0);
    });
  } else {
    await disconnectDatabase();
    process.exit(0);
  }
};

process.on('SIGINT', () => handleShutdown('SIGINT'));
process.on('SIGTERM', () => handleShutdown('SIGTERM'));

startServer();


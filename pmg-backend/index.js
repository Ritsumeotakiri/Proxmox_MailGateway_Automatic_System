import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import statusRoute from './routes/statusRoute.js';
import testPmgRoute from './routes/testPmgRoute.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Modular routes
app.use('/api/status', statusRoute);
app.use('/api/test', testPmgRoute);

// Start server with error handling
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`✅ PMG backend listening on port ${PORT}`);
});

// Handle server errors
server.on('error', (error) => {
  console.error(`❌ Failed to start server on port ${PORT}:`, error.message);

  switch (error.code) {
    case 'EADDRINUSE':
      console.error(`⚠️ Port ${PORT} is already in use.`);
      break;
    case 'EACCES':
      console.error(`⚠️ Insufficient privileges to bind to port ${PORT}. Try a different port or run with elevated permissions.`);
      break;
    default:
      console.error(error);
  }

  process.exit(1); // Exit the process on startup failure
});

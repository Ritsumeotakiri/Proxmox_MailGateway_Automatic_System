import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';


import statusRoute from './routes/statusRoute.js';
import pmgTrackerRoute from './routes/pmgTrackerRoute.js';
import authRoute from './routes/authRoute.js';
import statsRoute from './routes/mailStatsRoute.js';
import pmgRuleRoute from './routes/pmgRuleRoute.js';
import blockAllowRoute from './routes/blockAllowRoute.js';
import bot, { notifyAdmin } from './telegram/pmgBot.js';
import { checkNewSpam } from './telegram/spamWatcher.js';
import pmgArchiveRoute from './routes/pmgArchiveRoute.js';
import './cron/archiveScheduler.js';

dotenv.config();

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/status', statusRoute);
app.use('/api/pmg', pmgTrackerRoute);
app.use('/api/auth', authRoute);
app.use('/api/stats', statsRoute);
app.use('/api/pmg/rules', pmgRuleRoute);
app.use('/api/pmg/block-allow', blockAllowRoute);
app.use('/api/pmg', pmgArchiveRoute);


// Telegram bot
bot.start();
console.log('✅ Telegram bot started');
// notifyAdmin('✅ PMG backend started and Telegram bot initialized');

// Periodic spam check
setInterval(() => {
  checkNewSpam();
}, 30 * 1000);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ PMG backend listening on port ${PORT}`);
});

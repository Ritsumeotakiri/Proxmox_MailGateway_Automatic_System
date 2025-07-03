import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import userRoute from './routes/userRoute.js';
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
import settingRoute from './routes/settingRoute.js';
import './cron/cleanupCron.js';

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

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
app.use('/api/settings', settingRoute);
app.use('/api/users', userRoute);

// Store the last alert message to prevent duplicates
let lastAlertMessage = '';

app.post('/webhook', (req, res) => {
  const { event, message } = req.body;

  if (!message) {
    return res.status(400).json({ status: 'missing message' });
  }

  console.log('📩 Webhook received:', message);

  const time = new Date().toISOString();

  // Always broadcast logs to frontend for UI updates
  io.emit('mailLog', {
    message,
    time,
  });

  // Only emit alerts when spam was actually quarantined
const alertKeywords = ['quarantined', 'moved mail', 'to spam quarantine'];
if (alertKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
  io.emit('mailAlert', {
    event,
    message,
    time: new Date().toISOString(),
  });
  return res.status(200).json({ status: 'alert sent' });
}


  return res.status(200).json({ status: 'log broadcasted (non-alert or duplicate)' });
});

bot.start();
console.log('✅ Telegram bot started');

setInterval(() => {
  checkNewSpam(io); // You may need to pass io to spamWatcher.js to emit from there
}, 30 * 1000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ PMG backend + socket listening on port ${PORT}`);
});

io.on('connection', (socket) => {
  console.log('📡 React client connected:', socket.id);
});

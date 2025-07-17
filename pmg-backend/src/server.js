import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Import routes
import userRoute from './routes/userRoute.js';
import statusRoute from './routes/statusRoute.js';
import pmgTrackerRoute from './routes/pmgTrackerRoute.js';
import authRoute from './routes/authRoute.js';
import statsRoute from './routes/mailStatsRoute.js';
import pmgRuleRoute from './routes/pmgRuleRoute.js';
import blockAllowRoute from './routes/blockAllowRoute.js';
import pmgArchiveRoute from './routes/pmgArchiveRoute.js';
import settingRoute from './routes/settingRoute.js';

// Telegram bot + cron jobs
import bot, { notifyAdmin } from './telegram/pmgBot.js';
import { checkNewSpam } from './telegram/spamWatcher.js';
import './cron/archiveScheduler.js';
import './cron/cleanupCron.js';

// Mail tracking
import { handleMailEvent } from './controllers/mailcount.js';

dotenv.config();

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// ✅ App Setup
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' },
});

app.use(cors());
app.use(express.json());

// ✅ REST API Routes
app.use('/api/status', statusRoute);
app.use('/api/pmg', pmgTrackerRoute);
app.use('/api/auth', authRoute);
app.use('/api/stats', statsRoute);
app.use('/api/pmg/rules', pmgRuleRoute);
app.use('/api/pmg/block-allow', blockAllowRoute);
app.use('/api/pmg', pmgArchiveRoute);
app.use('/api/settings', settingRoute);
app.use('/api/users', userRoute);

// ✅ Webhook Endpoint (from PMG logs)
app.post('/webhook', async (req, res) => {
  const { event, message } = req.body;

  if (!message) {
    return res.status(400).json({ status: 'missing message' });
  }

  console.log('📩 Webhook received:', message);
  const time = new Date().toISOString();

  // 🔄 Broadcast raw message to frontend
  io.emit('mailLog', { message, time });

  // 🔍 Extract messageId and type
  const match = message.match(/([A-F0-9]{16,}):/i);
  const messageId = match ? match[1] : null;

  let type = null;
  if (/virus/i.test(message)) type = 'virus';
  else if (/spam/i.test(message)) type = 'spam';
  else if (/quarantined|moved mail|to spam quarantine/i.test(message)) type = 'spam'; // treated as spam
  else if (/new mail/i.test(message)) type = 'mail';

  // 🧠 Update database
  if (messageId && type) {
    await handleMailEvent({ messageId, type, date: time });
  }

  // 🚨 Alert broadcast (only for spam/quarantine)
  const alertKeywords = ['quarantined', 'moved mail', 'to spam quarantine'];
  if (alertKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
    io.emit('mailAlert', { event, message, time });
    return res.status(200).json({ status: 'alert sent' });
  }

  return res.status(200).json({ status: 'log broadcasted (non-alert)' });
});

// ✅ Telegram Bot & Cron Jobs
bot.start();
console.log('✅ Telegram bot started');

setInterval(() => {
  checkNewSpam(io); // push new spam updates
}, 30 * 1000);

// ✅ Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ PMG backend + socket listening on port ${PORT}`);
});

// ✅ Socket.IO: client connection
io.on('connection', (socket) => {
  // console.log('📡 React client connected:', socket.id);
});

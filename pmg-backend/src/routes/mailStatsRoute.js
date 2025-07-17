// routes/mailStatsRoute.js
import express from 'express';
import Statistic from '../model/statistic.js';
import { handleMailEvent } from '../controllers/mailcount.js';
import verifyToken from '../middleware/verifyToken.js';

const router = express.Router();

// ✅ Manual trigger for mail event (useful for testing)
router.post('/event', async (req, res) => {
  try {
    await handleMailEvent(req.body);
    res.status(200).json({ success: true, message: 'Mail event processed.' });
  } catch (err) {
    console.error('❌ Error in /api/stats/event:', err);
    res.status(500).json({ error: 'Failed to process mail event.' });
  }
});

// ✅ Return full mail logs for analysis/debug
router.get('/logs', verifyToken, async (req, res) => {
  try {
    const stat = await Statistic.findById('default-stat'); // Always get the fixed ID
    if (!stat || !stat.mailLogs) return res.json([]);
    res.json(stat.mailLogs);
  } catch (err) {
    console.error('❌ Error in /api/stats/logs:', err);
    res.status(500).json({ error: 'Failed to load logs' });
  }
});

export default router;

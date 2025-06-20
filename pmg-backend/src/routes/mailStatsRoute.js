import express from 'express';
import { updateMailStats } from '../controllers/mailStatsController.js';
import { MongoClient } from 'mongodb';

const router = express.Router();

// Existing stats updater
router.post('/stats/update', updateMailStats);


router.get('/chart-data', async (req, res) => {
  try {
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db('pmg_dashboard');
    const collection = db.collection('tracker_logs');

    const logs = await collection.find({
      timeISO: {
        $gte: new Date('2025-01-01') 
      }
    }).toArray();

    await client.close();
    res.json(logs);
  } catch (err) {
    console.error('❌ Failed to get chart data:', err);
    res.status(500).json({ error: 'Failed to load chart data' });
  }
});

export default router;

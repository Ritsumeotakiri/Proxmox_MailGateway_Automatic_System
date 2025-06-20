import { getPmgAxios } from '../pmg/pmgClient.js';
import { MongoClient } from 'mongodb';

/** Retry wrapper for PMG request */
async function fetchWithRetry(pmgAxios, url, retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await pmgAxios.get(url);
    } catch (err) {
      console.warn(`⚠️ Fetch attempt ${i + 1} failed:`, err.message);
      if (i < retries - 1) {
        await new Promise(res => setTimeout(res, delay));
      } else {
        throw err;
      }
    }
  }
}

export async function archivePmgLogs(req, res) {
  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  const db = client.db('pmg_dashboard');
  const collection = db.collection('tracker_logs');

  try {
    const pmgAxios = await getPmgAxios();

    const response = await fetchWithRetry(pmgAxios, '/nodes/pmg/tracker');
    const logs = response.data;

    if (!Array.isArray(logs)) {
      throw new Error('PMG returned invalid format (not an array)');
    }

    const preparedLogs = logs.map(log => ({
      ...log,
      timeISO: new Date(log.time * 1000),
      archivedAt: new Date(),
    }));

    let inserted = 0;
    for (const log of preparedLogs) {
      const exists = await collection.findOne({ id: log.id, time: log.time });
      if (!exists) {
        await collection.insertOne(log);
        inserted++;
      }
    }

    await client.close();

    const msg = `✅ Archived ${inserted} new logs.`;
    console.log(msg);
    if (res?.json) res.json({ message: msg });
  } catch (err) {
    console.error('❌ Archive failed:', err.message);
    if (res?.status) {
      res.status(500).json({ error: 'Archiving failed', details: err.message });
    }
  }
}

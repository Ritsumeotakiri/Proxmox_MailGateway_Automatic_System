import { connectDb } from '../model/dbClient.js';
import { getPmgAxios } from '../pmg/pmgClient.js';

export async function archivePmgLogs() {
  const db = await connectDb();
  const collection = db.collection('tracker_logs');

  try {
    const pmgAxios = await getPmgAxios();
    const response = await pmgAxios.get('/nodes/pmg/tracker');
    const logs = response.data.data || [];

    console.log('✅ PMG logs fetched:', logs.length);

    const preparedLogs = logs.map(log => ({
      ...log,
      timeISO: new Date(log.time * 1000),
      archivedAt: new Date()
    }));

    let inserted = 0;
    for (const log of preparedLogs) {
      const exists = await collection.findOne({ id: log.id, time: log.time });
      if (!exists) {
        await collection.insertOne(log);
        inserted++;
      }
    }

    return { inserted };
  } catch (err) {
    console.error('❌ Archive failed:', err.stack || err.message || err);
    throw err;
  }
}

export async function archivePmgLogsHandler(req, res) {
  try {
    const result = await archivePmgLogs();
    res.json({ message: `✅ Archived ${result.inserted} new logs.` });
  } catch (err) {
    res.status(500).json({ error: 'Archiving failed' });
  }
}

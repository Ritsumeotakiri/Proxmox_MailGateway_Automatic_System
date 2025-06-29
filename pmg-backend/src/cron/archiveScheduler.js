import cron from 'node-cron';
import { archivePmgLogs } from '../controllers/pmgArchiveController.js';

cron.schedule('*/2 * * * *', async () => { // Runs daily at midnight
  console.log('🕒 Running PMG log archive...');
  try {
    const result = await archivePmgLogs();
    if (result.inserted > 0) {
      console.log(`✅ Archived ${result.inserted} new logs.`);
    } else {
      console.log('ℹ️ No new logs to archive.');
    }
  } catch (err) {
    console.error('❌ Cron archive failed:', err.message);
  }
});

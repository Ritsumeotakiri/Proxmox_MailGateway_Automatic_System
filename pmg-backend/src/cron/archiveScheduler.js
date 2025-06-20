import cron from 'node-cron';
import { archivePmgLogs } from '../controllers/pmgArchiveController.js';

cron.schedule('* * * * *', () => {
  console.log('🕒 Running daily PMG archive...');
  archivePmgLogs({ method: 'cron' }, { json: (data) => console.log(data.message) });
});

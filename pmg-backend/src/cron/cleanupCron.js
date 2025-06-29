// Backend - Updated Setup for Cleanup Cron
import cron from 'node-cron';
import QuarantineSettings from '../model/quarantineSetting.js';
import { cleanupPmgQuarantineByAge } from '../controllers/pmgCleanupController.js';

// Helper to schedule based on setting
async function setupCleanupCron() {
  try {
    const settings = await QuarantineSettings.findOne();

    if (!settings || !settings.autoClean) {
      console.log('⚠️ Auto-clean is off or settings not found. No cleanup cron scheduled.');
      return;
    }

    const days = settings.deleteOlderThanDays || 3;
    const interval = settings.cleanupInterval || 'Daily';

    // Choose cron expression
    let cronExpr;

    switch (interval) {
      case 'Weekly':
        cronExpr = '0 0 * * 0'; // Every Sunday at midnight
        break;
      case 'Daily':
        cronExpr = '0 0 * * *'; // Every day at midnight
        break;
      case '5min':
        cronExpr = '*/5 * * * *'; // Every 5 minutes
        break;
      case 'Hourly':
        cronExpr = '0 * * * *'; // Every hour
        break;
      case 'Monthly':
        cronExpr = '0 0 1 * *'; // Every 1st day of the month at midnight
        break;
      default:
        cronExpr = '0 0 * * *'; // Default to daily
        break;
    }

    console.log(`📅 Scheduling quarantine cleanup (${interval})...`);
    cron.schedule(cronExpr, async () => {
      console.log('🕒 Running scheduled quarantine cleanup...');
      try {
        const deleted = await cleanupPmgQuarantineByAge(days);
        console.log(`✅ Deleted ${deleted} quarantined mails older than ${days} day(s).`);
      } catch (err) {
        console.error('❌ Cleanup cron error:', err.message || err);
      }
    });
  } catch (err) {
    console.error('❌ Failed to set up cleanup cron:', err.message || err);
  }
}

// Run once on startup
setupCleanupCron();

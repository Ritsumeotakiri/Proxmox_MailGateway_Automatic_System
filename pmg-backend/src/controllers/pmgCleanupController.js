import { getPmgAxios } from '../pmg/pmgClient.js';
import { notifyAdmin } from '../telegram/pmgBot.js';

export async function cleanupPmgQuarantineByAge(days = 3) {
  const pmgAxios = await getPmgAxios();
  const types = ['spam', 'virus', 'blacklist', 'attachment'];

  const now = new Date();
  const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

  let totalDeleted = 0;
  let deletedCount = {
    spam: 0,
    virus: 0,
    blacklist: 0,
    attachment: 0
  };

  for (const type of types) {
    try {
      const { data } = await pmgAxios.get(`/quarantine/${type}`);
      const items = data?.data || [];

      const toDelete = items.filter(item => new Date(item.time * 1000) < cutoff);

      for (const msg of toDelete) {
        await pmgAxios.post('/quarantine/content', { action: 'delete', id: msg.id });
        totalDeleted++;
        deletedCount[type]++;
      }

      console.log(`🧹 Deleted ${toDelete.length} messages from ${type}`);
    } catch (err) {
      console.warn(`⚠️ Failed to clean ${type} quarantine:`, err.message);
    }
  }

  // ✅ Send Telegram alert if something was deleted
  if (totalDeleted > 0) {
    const alertMsg =
      `🧹 *PMG Quarantine Cleanup Completed*\n` +
      `Deleted quarantined mails older than *${days}* day(s):\n\n` +
      `• spam: *${deletedCount.spam}*\n` +
      `• virus: *${deletedCount.virus}*\n` +
      `• blacklist: *${deletedCount.blacklist}*\n` +
      `• attachment: *${deletedCount.attachment}*\n\n` +
      `✅ *Total:* ${totalDeleted} deleted`;

    try {
      await notifyAdmin(alertMsg);
    } catch (err) {
      console.error('❌ Failed to send Telegram alert:', err.message);
    }
  }

  return totalDeleted;
}

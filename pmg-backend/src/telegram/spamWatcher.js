import { getPmgAxios } from '../pmg/pmgClient.js';
import { notifyAdmin } from './pmgBot.js';

let latestSeenTime = 0;

export async function checkNewSpam() {
  console.log('🔁 Running spam check...');
  try {
    const pmg = await getPmgAxios();
    const res = await pmg.get('/quarantine/spam');
    let list = res.data.data;

    console.log(`📥 Found ${list.length} quarantined items`);

    if (!list.length) return;

    // Sort by time ascending (old → new)
    list = list.sort((a, b) => a.time - b.time);

    // On first run, just set latest time
    if (!latestSeenTime) {
      latestSeenTime = list[list.length - 1].time;
      console.log('✅ Initialized spam watcher with latest time:', latestSeenTime);
      return;
    }

    const newMails = list.filter(item => item.time > latestSeenTime);

    if (!newMails.length) {
      console.log('🟡 No new spam since last check.');
      return;
    }

    console.log(`🚨 Detected ${newMails.length} new spam messages`);
    latestSeenTime = newMails[newMails.length - 1].time;

    const threshold = 3;

    if (newMails.length >= threshold) {
      await notifyAdmin(
        `🚨 *Spam Threshold Alert!*\n\n` +
        `⚠️ ${newMails.length} new spam emails quarantined in the last 5 minutes.\n\n` +
        `🕒 Last seen at: ${new Date(latestSeenTime * 1000).toLocaleString()}\n` +
        `➡️ Check your dashboard or PMG quarantine now.`
      );
    } else {
      console.log(`ℹ️ ${newMails.length} new spam < threshold (${threshold}) — no alert sent.`);
    }

  } catch (err) {
    console.error('❌ checkNewSpam() failed:', err.message);
  }
}

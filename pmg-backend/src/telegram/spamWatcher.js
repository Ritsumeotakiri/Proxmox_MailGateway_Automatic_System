// src/telegram/spamWatcher.js
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

    for (const mail of newMails) {
      await notifyAdmin(
        `🚨 *New Spam Quarantined!*\n\n` +
        `📧 *From:* ${mail.sender}\n` +
        `📨 *Subject:* ${mail.subject || '(No subject)'}\n` +
        `🕒 *Time:* ${new Date(mail.time * 1000).toLocaleString()}\n` +
        `🆔 *ID:* ${mail.id}`,
        mail.id // enable Deliver/Delete buttons
      );
    }
  } catch (err) {
    console.error('❌ checkNewSpam() failed:', err.message);
  }
}

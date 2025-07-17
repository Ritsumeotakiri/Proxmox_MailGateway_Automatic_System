import Statistic from '../model/statistic.js';

export async function handleMailEvent({ messageId, type, date }) {
  if (!messageId) return;

  const stat = await Statistic.findById('default-stat') || new Statistic({ _id: 'default-stat' });

  const existingLog = stat.mailLogs.find(log => log.messageId === messageId);

  if (!existingLog) {
    stat.mailLogs.push({
      messageId,
      date: date ? new Date(date) : new Date(),
      isSpam: type === 'spam',
      isVirus: type === 'virus',
    });
  } else {
    if (type === 'spam') existingLog.isSpam = true;
    if (type === 'virus') existingLog.isVirus = true;
  }

  await stat.save();
}

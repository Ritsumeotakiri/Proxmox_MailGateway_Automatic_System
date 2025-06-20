import MailStats from '../model/Mailstats.js';

export const updateMailStats = async (req, res) => {
  try {
    const { month, sent = 0, spam = 0, virus = 0, quarantine = 0 } = req.body;

    if (!month) {
      return res.status(400).json({ error: 'Month is required' });
    }

    const updated = await MailStats.findOneAndUpdate(
      { month },
      { $inc: { sent, spam, virus, quarantine } },
      { upsert: true, new: true }
    );

    // Emit WebSocket update to dashboard
    const io = req.app.get('io');
    io.emit('mailstats:updated', updated); // 📡 Real-time sync

    res.status(200).json(updated);
  } catch (err) {
    console.error('Stats update failed:', err);
    res.status(500).json({ error: 'Failed to update mail stats' });
  }
};

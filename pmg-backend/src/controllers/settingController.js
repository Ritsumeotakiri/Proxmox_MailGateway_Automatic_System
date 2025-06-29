import QuarantineSettings from '../model/quarantineSetting.js';

// GET /api/settings/quarantine-settings
export async function getQuarantineSettings(req, res) {
  try {
    const settings = await QuarantineSettings.findOne();
    res.json(settings || {}); // send empty if not found
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
}

// PUT /api/settings/quarantine-settings
export async function updateQuarantineSettings(req, res) {
  try {
    const { autoClean, deleteOlderThanDays, cleanupInterval } = req.body;

    const updated = await QuarantineSettings.findOneAndUpdate(
      {},
      { autoClean, deleteOlderThanDays, cleanupInterval },
      { upsert: true, new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
}

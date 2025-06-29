import mongoose from 'mongoose';

const quarantineSettingsSchema = new mongoose.Schema({
  autoClean: { type: Boolean, default: false },
  deleteOlderThanDays: { type: Number, default: 7 },
  cleanupInterval: {
    type: String,
    enum: ['Daily', 'Weekly'],
    default: 'Daily',
  },
}, { timestamps: true });

export default mongoose.model('QuarantineSettings', quarantineSettingsSchema);

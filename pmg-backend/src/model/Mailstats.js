// src/models/MailStats.js
import mongoose from 'mongoose';

const mailStatsSchema = new mongoose.Schema({
  month: { type: String, required: true, unique: true }, 
  sent: { type: Number, default: 0 },
  spam: { type: Number, default: 0 },
  virus: { type: Number, default: 0 },
  quarantine: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('MailStats', mailStatsSchema);

import mongoose from 'mongoose'; // ✅ Must import

const mailLogSchema = new mongoose.Schema({
  messageId: { type: String, required: true },
  date: { type: Date, default: Date.now },
  isSpam: { type: Boolean, default: false },
  isVirus: { type: Boolean, default: false }
});

const statisticSchema = new mongoose.Schema({
  _id: { type: String, default: 'default-stat' }, // 🔒 Fixed ID
  mailLogs: [mailLogSchema]
}, { timestamps: true });

export default mongoose.model('Statistic', statisticSchema);

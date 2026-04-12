const mongoose = require('mongoose');

const mpesaPendingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  originatorConversationId: { type: String, default: '' },
  conversationId: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'completed', 'failed', 'timeout'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

mpesaPendingSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3600 });

module.exports = mongoose.model('MpesaPendingRequest', mpesaPendingSchema);

const mongoose = require('mongoose');

const PricingHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: { type: String, required: true },
  platforms: [String],
  services: [String],
  pricingData: {}, // Nested object: { service: { platform: price } }
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PricingHistory', PricingHistorySchema);

const mongoose = require('mongoose');

const savedComparisonSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  platforms: [{ type: String, required: true }],
  services: [{ type: String, required: true }],
  result: { type: Object, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SavedComparison', savedComparisonSchema);

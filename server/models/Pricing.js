const mongoose = require('mongoose');

const pricingSchema = new mongoose.Schema({
  platform: { type: String, required: true },
  service: { type: String, required: true },
  price: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Pricing', pricingSchema);

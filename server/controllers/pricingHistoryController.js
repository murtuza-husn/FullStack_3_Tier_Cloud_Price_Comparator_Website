// Delete a comparison by ID
exports.deleteHistory = async (req, res) => {
  try {
    const { id } = req.params;
    await PricingHistory.findByIdAndDelete(id);
    res.json({ message: 'Comparison deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
const PricingHistory = require('../models/PricingHistory');
const User = require('../models/User');

// Store a comparison in PricingHistory
exports.storeComparison = async (req, res) => {
  try {
    const { platforms, services, pricingData, userName } = req.body;
    // Find user by userName (email or full name)
    const user = await User.findOne({ $or: [ { email: userName }, { $expr: { $eq: [ { $concat: ["$firstName", " ", "$lastName"] }, userName ] } } ] });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const entry = new PricingHistory({
      userId: user._id,
      userName,
      platforms,
      services,
      pricingData
    });
    await entry.save();
    res.status(201).json({ message: 'Comparison stored successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all comparisons for a user
exports.getHistory = async (req, res) => {
  try {
    const { userName } = req.query;
    const user = await User.findOne({ $or: [ { email: userName }, { $expr: { $eq: [ { $concat: ["$firstName", " ", "$lastName"] }, userName ] } } ] });
    if (!user) return res.status(404).json({ error: 'User not found' });
    const history = await PricingHistory.find({ userId: user._id }).sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

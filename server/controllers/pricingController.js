const pricingService = require('../services/pricingService');

exports.getPricing = async (req, res) => {
  try {
	console.log("in getPricing...");
	const { platforms, services, region, currency, refresh } = req.body;
	const result = await pricingService.getPricing({ platforms, services, region, currency, refresh });
	console.log("result: ", result);
	res.json(result);
  } catch (err) {
	console.error('pricingController.getPricing error:', err && err.message);
	res.status(500).json({ error: 'Server error' });
  }
};

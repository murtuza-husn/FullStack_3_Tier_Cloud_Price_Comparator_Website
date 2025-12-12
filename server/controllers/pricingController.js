// Dummy pricing by category
exports.getPricing = (req, res) => {
  const { platforms, services } = req.body;

  const dummyPricing = {};
  services.forEach(service => {
    dummyPricing[service] = {};
    platforms.forEach(platform => {
      // Random price for demo
      dummyPricing[service][platform] = parseFloat((Math.random() * 0.1 + 0.01).toFixed(3));
    });
  });

  res.json(dummyPricing);
};

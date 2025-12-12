const express = require("express");
const router = express.Router();
const { getPricing } = require("../controllers/pricingController");

// POST request to get pricing for selected platforms and services
router.post("/", getPricing);

module.exports = router;


const express = require("express");
const router = express.Router();
const { getPricing } = require("../controllers/pricingController");
const pricingHistoryController = require("../controllers/pricingHistoryController");

// DELETE to remove a comparison by ID
router.delete("/history/:id", pricingHistoryController.deleteHistory);


// POST request to get pricing for selected platforms and services
router.post("/", getPricing);

// POST to store a comparison
router.post("/history", pricingHistoryController.storeComparison);

// GET to fetch comparison history for a user
router.get("/history", pricingHistoryController.getHistory);

module.exports = router;

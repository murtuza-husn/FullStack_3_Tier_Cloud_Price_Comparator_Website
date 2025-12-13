
// src/index.js

const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();



const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

app.use(express.json());


app.get("/", (req, res) => {
  res.send("Server is running!");
});

// Mock pricing data endpoint
app.post("/api/pricing", (req, res) => {
  const { platforms, services } = req.body;
  // Return nested object: { [service]: { [platform]: price } }
  const pricingData = {};
  services.forEach(service => {
    pricingData[service] = {};
    platforms.forEach(platform => {
      pricingData[service][platform] = parseFloat((Math.random() * 100).toFixed(3));
    });
  });
  res.json(pricingData);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});


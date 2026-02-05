
// src/index.js

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();



const app = express();


// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));

app.use(express.json());

// Register auth routes
const authRoutes = require("../routes/auth");
app.use("/api/auth", authRoutes);


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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (process.env.BASE_URL) {
    console.log(`Public URL: ${process.env.BASE_URL}`);
  }
});

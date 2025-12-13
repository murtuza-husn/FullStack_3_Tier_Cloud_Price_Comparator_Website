const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const pricingRoutes = require("./routes/pricing");

const app = express();
const PORT = process.env.PORT || 5000;

const path = require("path");

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Serve static client files so requests like /client/index.html succeed
app.use('/client', express.static(path.join(__dirname, '..', 'client')));
// Also serve client root (e.g. GET /index.html)
app.use(express.static(path.join(__dirname, '..', 'client')));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/pricing", pricingRoutes);

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error(err));


  

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const pricingRoutes = require("./routes/pricing");

const app = express();
const PORT = process.env.PORT || 5000;

// Redirect root to client login page by default (must be after app is initialized)
app.get("/", (req, res) => {
  res.redirect("/client/login.html");
});
// Middleware
app.use(cors());
app.use(express.json());

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

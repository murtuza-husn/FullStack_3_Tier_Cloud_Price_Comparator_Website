
// src/index.js
const express = require("express");   // or  if using CommonJS // or if using ES module import express from "express"

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Server is running!");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
    



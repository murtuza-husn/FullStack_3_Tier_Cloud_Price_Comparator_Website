const User = require("../models/User");

// TEMPORARY login controller for hardcoded credentials
exports.login = async (req, res) => {
  const { email, password } = req.body;
  // Allow only the hardcoded user for now
  if (email === "k@gmail.com" && password === "123") {
    return res.status(200).json({ message: "Login successful", redirect: "/client/index.html" });
  }
  // Optionally, check DB for other users here
  return res.status(401).json({ message: "Invalid credentials" });
};

// Placeholder for signup and forgotPassword if needed
exports.signup = (req, res) => {
  // Example: after successful signup, redirect to login page
  return res.status(200).json({ message: "Signup successful", redirect: "/client/login.html" });
};
exports.forgotPassword = (req, res) => {
  // Example: after successful password reset, redirect to login page
  // return res.status(200).json({ message: "Password reset successful", redirect: "/client/login.html" });
  return res.status(501).json({ message: "Not implemented", redirect: "/client/forgot-password.html" });
};

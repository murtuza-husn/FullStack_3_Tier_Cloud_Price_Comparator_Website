const User = require("../models/User");
const bcrypt = require("bcrypt");

// Login controller with DB and hash check
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    // Optionally, generate JWT here
    return res.status(200).json({ 
      message: "Login successful", 
      redirect: "/index.html",
      firstName: user.firstName,
      lastName: user.lastName
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// Signup controller: hash password and save user
exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    // Create and save the user
    const user = new User({
      firstName,
      lastName,
      email,
      phone,
      password: hashedPassword
    });
    await user.save();
    return res.status(200).json({ message: "Signup successful", redirect: "/login.html" });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};
exports.forgotPassword = (req, res) => {
  // Example: after successful password reset, redirect to login page
  // return res.status(200).json({ message: "Password reset successful", redirect: "/login.html" });
  return res.status(501).json({ message: "Not implemented", redirect: "/forgot-password.html" });
};

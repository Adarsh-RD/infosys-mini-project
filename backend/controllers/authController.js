// backend/controllers/authController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.signupUser = async (req, res) => {
  try {
    const { email, phone, password, consent } = req.body;
    if (!consent) return res.status(400).json({ message: "Consent required." });
    if (!email || !phone || !password) return res.status(400).json({ message: "All fields required." });

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,16}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ message: "Password does not meet requirements." });
    }

    const exists = await User.findOne({ $or: [{ email }, { phone }] });
    if (exists) return res.status(400).json({ message: "Email or phone already registered." });

    const hash = await bcrypt.hash(password, 10);
    const user = new User({ email, phone, passwordHash: hash, consentGiven: consent });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "SECRET123", { expiresIn: "1h" });
    return res.json({ message: "Signup successful", token, user: { id: user._id, email: user.email, phone: user.phone } });
  } catch (err) {
    console.error("SIGNUP ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body;
    if (!emailOrPhone || !password) return res.status(400).json({ message: "Email/Phone and password required." });

    const user = await User.findOne({ $or: [{ email: emailOrPhone }, { phone: emailOrPhone }] });
    if (!user) return res.status(400).json({ message: "User not found." });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ message: "Incorrect password." });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "SECRET123", { expiresIn: "1h" });
    return res.json({ message: "Login successful", token, user: { id: user._id, email: user.email, phone: user.phone } });
  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
